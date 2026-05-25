import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CareerCard } from "@/components/CareerCard";
import { useApp } from "@/context/AppContext";
import { CAREERS, matchCareers } from "@/data/careers";
import { useColors } from "@/hooks/useColors";

const API_BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;

const MODEL_LABELS: Record<string, string> = {
  XGBoost:       "XGBoost",
  RandomForest:  "Random Forest",
  NeuralNetwork: "Neural Network",
  SVM:           "SVM",
};

const MODEL_COLORS: Record<string, string> = {
  XGBoost:       "#FF6B00",
  RandomForest:  "#FF9500",
  NeuralNetwork: "#6B5BFF",
  SVM:           "#20CF8C",
};

interface MLResult {
  id: string;
  title: string;
  matchScore: number;
  modelScores: Record<string, number>;
  bestModel: string;
}

export default function AssessmentResultsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { assessmentAnswers, assessmentCompleted, completeAssessment, setMatchedCareerIds, matchedCareerIds, incrementStreak } = useApp();

  const [analyzing, setAnalyzing] = useState(!assessmentCompleted);
  const [mlResults, setMlResults] = useState<MLResult[] | null>(null);
  const [mlError, setMlError] = useState(false);
  const [analyzeStage, setAnalyzeStage] = useState(0);

  // Fallback: local rule-based results
  const localResults = useMemo(() => matchCareers(assessmentAnswers), [assessmentAnswers]);

  // Merge ML scores into CAREERS data
  const displayResults = useMemo(() => {
    const source = mlResults ?? (assessmentCompleted && matchedCareerIds.length > 0 ? localResults : localResults);
    if (!mlResults) return source;

    return mlResults.map(ml => {
      const career = CAREERS.find(c => c.id === ml.id);
      if (!career) return null;
      return { ...career, matchScore: ml.matchScore, modelScores: ml.modelScores, bestModel: ml.bestModel };
    }).filter(Boolean) as Array<typeof CAREERS[0] & { matchScore: number; modelScores: Record<string, number>; bestModel: string }>;
  }, [mlResults, localResults, assessmentCompleted, matchedCareerIds]);

  // Animate through ML stages
  const stages = [
    "Encoding your profile features...",
    "Running Random Forest classifier...",
    "Running XGBoost gradient boosting...",
    "Running Neural Network model...",
    "Running SVM classifier...",
    "Ensembling all model predictions...",
    "Ranking your best career matches...",
  ];

  useEffect(() => {
    if (assessmentCompleted) return;

    // Progress through stage labels
    const interval = setInterval(() => {
      setAnalyzeStage(prev => Math.min(prev + 1, stages.length - 1));
    }, 600);

    // Call ML API
    const fetchML = async () => {
      try {
        const res = await fetch(`${API_BASE}/career/ml-recommend`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: assessmentAnswers }),
        });
        if (!res.ok) throw new Error("API error");
        const data = await res.json() as { results: MLResult[] };
        setMlResults(data.results);
      } catch {
        setMlError(true);
      }
    };

    fetchML();

    const timer = setTimeout(() => {
      clearInterval(interval);
      completeAssessment();
      setMatchedCareerIds(localResults.map(r => r.id));
      incrementStreak();
      setAnalyzing(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 4200);

    return () => { clearTimeout(timer); clearInterval(interval); };
  }, []);

  const topPadding = Platform.OS === "web" ? 67 : 0;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  if (analyzing) {
    return (
      <View style={[styles.analyzing, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={["#FF6B0022", "#6B5BFF11"]}
          style={[styles.analyzingIcon, { borderRadius: 60 }]}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </LinearGradient>
        <Text style={[styles.analyzingTitle, { color: colors.foreground }]}>
          ML Models Analyzing
        </Text>
        <Text style={[styles.analyzingSubtitle, { color: colors.mutedForeground }]}>
          {stages[analyzeStage]}
        </Text>
        {/* Model badges */}
        <View style={styles.modelBadges}>
          {Object.entries(MODEL_LABELS).map(([key, label]) => (
            <View key={key} style={[styles.modelBadge, { borderColor: MODEL_COLORS[key] + "55", backgroundColor: MODEL_COLORS[key] + "11" }]}>
              <View style={[styles.modelBadgeDot, { backgroundColor: MODEL_COLORS[key] }]} />
              <Text style={[styles.modelBadgeText, { color: MODEL_COLORS[key] }]}>{label}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  const topMatch = displayResults[0];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: insets.top + topPadding + 16,
        paddingBottom: insets.bottom + bottomPadding + 40,
        gap: 24,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: 20 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        {/* ML engine badge */}
        <View style={styles.engineBadge}>
          <View style={[styles.engineDot, { backgroundColor: mlError ? "#FF4B4B" : "#FF6B00" }]} />
          <Text style={[styles.engineLabel, { color: colors.mutedForeground }]}>
            {mlError ? "Rule-Based Engine" : "XGBoost + Ensemble"}
          </Text>
        </View>
      </View>

      {/* Top result hero */}
      {topMatch && (
        <LinearGradient
          colors={["#FF6B00", "#FF9500"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.heroCard, { marginHorizontal: 20, borderRadius: colors.radius + 4 }]}
        >
          <Text style={styles.heroLabel}>Best Match</Text>
          <Text style={styles.heroTitle}>{topMatch.title}</Text>
          <Text style={styles.heroCategory}>{topMatch.category}</Text>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{topMatch.matchScore}%</Text>
              <Text style={styles.heroStatLabel}>Match</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>
                ₹{topMatch.salaryMin}–{topMatch.salaryMax}L
              </Text>
              <Text style={styles.heroStatLabel}>Salary</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{topMatch.growth}</Text>
              <Text style={styles.heroStatLabel}>Growth</Text>
            </View>
          </View>

          {/* ML model scores for top match */}
          {"modelScores" in topMatch && topMatch.modelScores && (
            <View style={styles.modelScores}>
              {Object.entries(topMatch.modelScores).map(([model, score]) => (
                <View key={model} style={styles.modelScoreItem}>
                  <Text style={styles.modelScoreLabel}>{MODEL_LABELS[model] ?? model}</Text>
                  <Text style={styles.modelScoreValue}>{score}%</Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            onPress={() => router.push(`/career/${topMatch.id}`)}
            style={styles.heroBtn}
          >
            <Text style={styles.heroBtnText}>Explore This Career</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        </LinearGradient>
      )}

      {/* All results */}
      <View style={[styles.resultsSection, { paddingHorizontal: 20 }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          All Your Matches
        </Text>
        <Text style={[styles.sectionSubtitle, { color: colors.mutedForeground }]}>
          {mlError ? "Based on your interests, skills, and goals" : "Ranked by XGBoost · Random Forest · Neural Network · SVM"}
        </Text>
        <View style={styles.careerList}>
          {displayResults.slice(1).map((career) => (
            <CareerCard key={career.id} career={career} showMatch />
          ))}
        </View>
      </View>

      {/* Actions */}
      <View style={[styles.actions, { paddingHorizontal: 20 }]}>
        <TouchableOpacity
          onPress={() => router.push("/chatbot")}
          style={[styles.actionCard, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border }]}
        >
          <View style={[styles.actionIcon, { backgroundColor: "#FF6B0022", borderRadius: 14 }]}>
            <Ionicons name="chatbubbles" size={24} color={colors.primary} />
          </View>
          <View style={styles.actionText}>
            <Text style={[styles.actionTitle, { color: colors.foreground }]}>Ask CareerBot</Text>
            <Text style={[styles.actionSubtitle, { color: colors.mutedForeground }]}>
              Get AI answers about your top matches
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.navigate("/(tabs)/mentors")}
          style={[styles.actionCard, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border }]}
        >
          <View style={[styles.actionIcon, { backgroundColor: "#6B5BFF22", borderRadius: 14 }]}>
            <Ionicons name="people" size={24} color="#6B5BFF" />
          </View>
          <View style={styles.actionText}>
            <Text style={[styles.actionTitle, { color: colors.foreground }]}>Book a Mentor</Text>
            <Text style={[styles.actionSubtitle, { color: colors.mutedForeground }]}>
              Talk to an expert in your matched career
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  analyzing: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
    padding: 40,
  },
  analyzingIcon: {
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  analyzingTitle: { fontSize: 22, fontFamily: "Poppins_700Bold", textAlign: "center" },
  analyzingSubtitle: { fontSize: 14, fontFamily: "Poppins_400Regular", textAlign: "center", lineHeight: 22 },
  modelBadges: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 4 },
  modelBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  modelBadgeDot: { width: 6, height: 6, borderRadius: 3 },
  modelBadgeText: { fontSize: 11, fontFamily: "Poppins_600SemiBold" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  engineBadge: { flexDirection: "row", alignItems: "center", gap: 6 },
  engineDot: { width: 7, height: 7, borderRadius: 4 },
  engineLabel: { fontSize: 11, fontFamily: "Poppins_500Medium" },
  heroCard: { padding: 24, gap: 6 },
  heroLabel: { fontSize: 12, fontFamily: "Poppins_500Medium", color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: 1 },
  heroTitle: { fontSize: 24, fontFamily: "Poppins_700Bold", color: "#fff" },
  heroCategory: { fontSize: 14, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.8)" },
  heroStats: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  heroStat: { flex: 1, alignItems: "center" },
  heroStatValue: { fontSize: 20, fontFamily: "Poppins_700Bold", color: "#fff" },
  heroStatLabel: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.7)" },
  heroDivider: { width: 1, height: 36, backgroundColor: "rgba(255,255,255,0.3)" },
  modelScores: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 10,
    padding: 10,
    marginTop: 6,
    justifyContent: "space-around",
  },
  modelScoreItem: { alignItems: "center", gap: 2 },
  modelScoreLabel: { fontSize: 9, fontFamily: "Poppins_500Medium", color: "rgba(255,255,255,0.6)", textAlign: "center" },
  modelScoreValue: { fontSize: 14, fontFamily: "Poppins_700Bold", color: "#fff" },
  heroBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 8,
  },
  heroBtnText: { fontSize: 15, fontFamily: "Poppins_700Bold", color: "#FF6B00" },
  resultsSection: { gap: 8 },
  sectionTitle: { fontSize: 20, fontFamily: "Poppins_700Bold" },
  sectionSubtitle: { fontSize: 13, fontFamily: "Poppins_400Regular" },
  careerList: { gap: 12, marginTop: 8 },
  actions: { gap: 12 },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderWidth: 1,
  },
  actionIcon: { width: 52, height: 52, alignItems: "center", justifyContent: "center" },
  actionText: { flex: 1 },
  actionTitle: { fontSize: 15, fontFamily: "Poppins_600SemiBold" },
  actionSubtitle: { fontSize: 12, fontFamily: "Poppins_400Regular", marginTop: 2 },
});
