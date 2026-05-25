import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { getCareerById } from "@/data/careers";
import { useColors } from "@/hooks/useColors";

interface TestQuestion {
  id: number;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  points: number;
}

function detectUserLevel(educationAnswer: string | string[] | undefined): "beginner" | "intermediate" | "advanced" {
  const edu = Array.isArray(educationAnswer) ? educationAnswer[0] : educationAnswer;
  if (!edu) return "beginner";
  if (edu.includes("10th") || edu.includes("12th") || edu.includes("Fresher")) return "beginner";
  if (edu.includes("Diploma") || edu.includes("Bachelors")) return "intermediate";
  if (edu.includes("Masters") || edu.includes("PhD")) return "advanced";
  return "beginner";
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "#20CF8C",
  medium: "#FF9500",
  hard: "#FF4B4B",
};

export default function CareerTestScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { assessmentAnswers } = useApp();
  const career = getCareerById(id ?? "");

  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const topPadding = Platform.OS === "web" ? 67 : 0;
  const userLevel = detectUserLevel(assessmentAnswers[1]);

  useEffect(() => {
    if (!career) return;
    fetchQuestions();
  }, []);

  const shuffleOptions = (q: TestQuestion): TestQuestion => {
    const correctText = q.options[q.correctIndex];
    const shuffled = [...q.options];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const newCorrectIndex = shuffled.indexOf(correctText);
    return { ...q, options: shuffled, correctIndex: newCorrectIndex };
  };

  const fetchQuestions = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const domain = process.env.EXPO_PUBLIC_DOMAIN;
      const res = await fetch(`https://${domain}/api/career/eligibility-test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          careerTitle: career!.title,
          careerId: career!.id,
          userLevel,
          category: career!.category,
        }),
      });
      if (!res.ok) throw new Error("Failed to load questions");
      const data = await res.json() as { questions: TestQuestion[] };
      const shuffledQuestions = (data.questions || []).map(shuffleOptions);
      setQuestions(shuffledQuestions);
    } catch {
      setLoadError("Could not load questions. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const totalPoints = questions.reduce((s, q) => s + q.points, 0);
  const question = questions[currentQ];

  const animateTransition = useCallback((onMid: () => void) => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: -30, duration: 180, useNativeDriver: true }),
      ]),
    ]).start(() => {
      onMid();
      slideAnim.setValue(40);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
    });
  }, [fadeAnim, slideAnim]);

  const handleSelect = (idx: number) => {
    if (answered) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedIndex(idx);
    setAnswered(true);
  };

  const handleNext = () => {
    if (selectedIndex === null) return;
    const newAnswers = [...userAnswers, selectedIndex];
    setUserAnswers(newAnswers);

    if (currentQ + 1 >= questions.length) {
      const earnedPts = newAnswers.reduce((sum, ans, i) => {
        return sum + (ans === questions[i].correctIndex ? questions[i].points : 0);
      }, 0);
      router.replace({
        pathname: `/career/test-results/${id}`,
        params: {
          careerTitle: career!.title,
          category: career!.category,
          userLevel,
          earned: String(earnedPts),
          total: String(totalPoints),
          answers: JSON.stringify(newAnswers),
          questions: JSON.stringify(questions.map(q => ({
            question: q.question,
            correctIndex: q.correctIndex,
            difficulty: q.difficulty,
            explanation: q.explanation,
            points: q.points,
          }))),
        },
      });
      return;
    }

    animateTransition(() => {
      setCurrentQ(c => c + 1);
      setSelectedIndex(null);
      setAnswered(false);
    });

    Animated.timing(progressAnim, {
      toValue: (currentQ + 1) / questions.length,
      duration: 400,
      useNativeDriver: false,
    }).start();
  };

  if (!career) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.foreground }]}>Career not found</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <LinearGradient colors={["#FF6B00", "#FF9500"]} style={styles.loadingOrb}>
          <ActivityIndicator size="large" color="#fff" />
        </LinearGradient>
        <Text style={[styles.loadingTitle, { color: colors.foreground }]}>
          Generating Your Test
        </Text>
        <Text style={[styles.loadingSubtitle, { color: colors.mutedForeground }]}>
          Creating 20 questions for {career.title}...
        </Text>
        <View style={[styles.levelPill, { backgroundColor: "#FF6B0022" }]}>
          <Text style={[styles.levelPillText, { color: colors.primary }]}>
            {userLevel.charAt(0).toUpperCase() + userLevel.slice(1)} Level
          </Text>
        </View>
      </View>
    );
  }

  if (loadError || questions.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle" size={48} color="#FF4B4B" />
        <Text style={[styles.loadingTitle, { color: colors.foreground }]}>{loadError || "No questions generated"}</Text>
        <TouchableOpacity onPress={fetchQuestions} style={[styles.retryBtn, { backgroundColor: colors.primary }]}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
          <Text style={[styles.backLinkText, { color: colors.mutedForeground }]}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const progress = (currentQ / questions.length);
  const diffColor = DIFFICULTY_COLORS[question.difficulty] ?? "#FF9500";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={["#FF6B00", "#FF9500"]}
        style={[styles.header, { paddingTop: insets.top + topPadding + 8 }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerCareer} numberOfLines={1}>{career.title}</Text>
            <Text style={styles.headerProgress}>Question {currentQ + 1} of {questions.length}</Text>
          </View>
          <View style={[styles.diffBadge, { backgroundColor: diffColor + "33" }]}>
            <Text style={[styles.diffText, { color: "#fff" }]}>
              {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              { width: `${((currentQ) / questions.length) * 100}%` },
            ]}
          />
        </View>

        {/* Points this question */}
        <Text style={styles.pointsLabel}>+{question.points} pts if correct</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Question */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={[styles.questionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.qNumber, { color: colors.mutedForeground }]}>
              Q{currentQ + 1}
            </Text>
            <Text style={[styles.questionText, { color: colors.foreground }]}>
              {question.question}
            </Text>
          </View>

          {/* Options */}
          <View style={styles.optionsList}>
            {question.options.map((opt, idx) => {
              const isSelected = selectedIndex === idx;
              const isCorrect = idx === question.correctIndex;
              let bgColor = colors.card;
              let borderColor = colors.border;
              let textColor = colors.foreground;
              let labelBg = colors.secondary;
              let labelColor = colors.mutedForeground;

              if (answered) {
                if (isCorrect) {
                  bgColor = "#20CF8C18";
                  borderColor = "#20CF8C";
                  textColor = "#20CF8C";
                  labelBg = "#20CF8C";
                  labelColor = "#fff";
                } else if (isSelected && !isCorrect) {
                  bgColor = "#FF4B4B18";
                  borderColor = "#FF4B4B";
                  textColor = "#FF4B4B";
                  labelBg = "#FF4B4B";
                  labelColor = "#fff";
                }
              } else if (isSelected) {
                bgColor = "#FF6B0018";
                borderColor = colors.primary;
                textColor = colors.primary;
                labelBg = colors.primary;
                labelColor = "#fff";
              }

              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => handleSelect(idx)}
                  disabled={answered}
                  activeOpacity={0.8}
                  style={[styles.optionRow, { backgroundColor: bgColor, borderColor }]}
                >
                  <View style={[styles.optionLabel, { backgroundColor: labelBg }]}>
                    <Text style={[styles.optionLabelText, { color: labelColor }]}>
                      {["A", "B", "C", "D"][idx]}
                    </Text>
                  </View>
                  <Text style={[styles.optionText, { color: textColor }]}>{opt}</Text>
                  {answered && isCorrect && (
                    <Ionicons name="checkmark-circle" size={20} color="#20CF8C" />
                  )}
                  {answered && isSelected && !isCorrect && (
                    <Ionicons name="close-circle" size={20} color="#FF4B4B" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Explanation (shown after answering) */}
          {answered && (
            <View style={[styles.explanationCard, { backgroundColor: selectedIndex === question.correctIndex ? "#20CF8C18" : "#FF9500" + "18", borderColor: selectedIndex === question.correctIndex ? "#20CF8C44" : "#FF950044" }]}>
              <Ionicons
                name={selectedIndex === question.correctIndex ? "bulb" : "information-circle"}
                size={18}
                color={selectedIndex === question.correctIndex ? "#20CF8C" : "#FF9500"}
              />
              <Text style={[styles.explanationText, { color: colors.foreground }]}>
                {question.explanation}
              </Text>
            </View>
          )}

          {/* Next button */}
          {answered && (
            <TouchableOpacity onPress={handleNext} style={styles.nextBtn}>
              <LinearGradient
                colors={["#FF6B00", "#FF9500"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.nextBtnGrad}
              >
                <Text style={styles.nextBtnText}>
                  {currentQ + 1 >= questions.length ? "See Results" : "Next Question"}
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Skip hint (before answering) */}
          {!answered && (
            <Text style={[styles.hintText, { color: colors.mutedForeground }]}>
              Tap an option to answer
            </Text>
          )}
        </Animated.View>

        {/* Question dots navigator */}
        <View style={styles.dotsRow}>
          {questions.map((_, i) => {
            const isDone = i < currentQ;
            const isCurrent = i === currentQ;
            return (
              <View
                key={i}
                style={[
                  styles.dot,
                  isDone && { backgroundColor: "#20CF8C", width: 8, height: 8 },
                  isCurrent && { backgroundColor: colors.primary, width: 20 },
                  !isDone && !isCurrent && { backgroundColor: colors.border },
                ]}
              />
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, paddingHorizontal: 32 },
  loadingOrb: { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center" },
  loadingTitle: { fontSize: 20, fontFamily: "Poppins_700Bold", textAlign: "center" },
  loadingSubtitle: { fontSize: 14, fontFamily: "Poppins_400Regular", textAlign: "center" },
  levelPill: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  levelPillText: { fontSize: 14, fontFamily: "Poppins_600SemiBold" },
  errorText: { fontSize: 16, fontFamily: "Poppins_400Regular", textAlign: "center" },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 8 },
  retryText: { color: "#fff", fontSize: 15, fontFamily: "Poppins_600SemiBold" },
  backLink: { marginTop: 8 },
  backLinkText: { fontSize: 14, fontFamily: "Poppins_400Regular" },

  header: { paddingHorizontal: 20, paddingBottom: 16, gap: 12 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerBtn: { width: 38, height: 38, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 19, alignItems: "center", justifyContent: "center" },
  headerCenter: { flex: 1 },
  headerCareer: { fontSize: 15, fontFamily: "Poppins_700Bold", color: "#fff" },
  headerProgress: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.8)" },
  diffBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  diffText: { fontSize: 12, fontFamily: "Poppins_700Bold" },
  progressTrack: { height: 6, backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#fff", borderRadius: 3 },
  pointsLabel: { fontSize: 11, fontFamily: "Poppins_600SemiBold", color: "rgba(255,255,255,0.9)", textAlign: "right" },

  content: { padding: 20, gap: 16 },

  questionCard: { borderRadius: 20, borderWidth: 1, padding: 20, gap: 10, marginBottom: 4 },
  qNumber: { fontSize: 12, fontFamily: "Poppins_600SemiBold", textTransform: "uppercase", letterSpacing: 1 },
  questionText: { fontSize: 18, fontFamily: "Poppins_700Bold", lineHeight: 28 },

  optionsList: { gap: 10 },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  optionLabel: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  optionLabelText: { fontSize: 14, fontFamily: "Poppins_700Bold" },
  optionText: { flex: 1, fontSize: 15, fontFamily: "Poppins_500Medium", lineHeight: 22 },

  explanationCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  explanationText: { flex: 1, fontSize: 13, fontFamily: "Poppins_400Regular", lineHeight: 20 },

  nextBtn: { borderRadius: 16, overflow: "hidden" },
  nextBtnGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16 },
  nextBtnText: { fontSize: 16, fontFamily: "Poppins_700Bold", color: "#fff" },

  hintText: { fontSize: 13, fontFamily: "Poppins_400Regular", textAlign: "center", marginTop: 8 },

  dotsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, justifyContent: "center", marginTop: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
