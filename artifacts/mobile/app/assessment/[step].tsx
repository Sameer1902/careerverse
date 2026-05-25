import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientButton } from "@/components/GradientButton";
import { useApp } from "@/context/AppContext";
import { getAdaptiveQuestion } from "@/data/assessment";
import { useColors } from "@/hooks/useColors";

export default function AssessmentStepScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { step } = useLocalSearchParams<{ step: string }>();
  const stepNum = parseInt(step ?? "1", 10);
  const { assessmentAnswers, setAssessmentAnswer } = useApp();

  const question = useMemo(
    () => getAdaptiveQuestion(stepNum, assessmentAnswers),
    [stepNum, assessmentAnswers]
  );

  const currentAnswer = assessmentAnswers[stepNum];

  const topPadding = Platform.OS === "web" ? 67 : 0;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  const handleSelect = (label: string, value: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (question.multiSelect) {
      const current = (currentAnswer as string[]) || [];
      const maxSelect = question.maxSelect ?? 999;
      const key = `${label}::${value}`;
      if (current.includes(key)) {
        setAssessmentAnswer(stepNum, current.filter((v) => v !== key));
      } else if (current.length < maxSelect) {
        setAssessmentAnswer(stepNum, [...current, key]);
      }
    } else {
      setAssessmentAnswer(stepNum, `${label}::${value}`);
    }
  };

  const isSelected = (label: string, value: string): boolean => {
    if (question.multiSelect) {
      return ((currentAnswer as string[]) || []).includes(`${label}::${value}`);
    }
    return currentAnswer === `${label}::${value}`;
  };

  const canProceed = question.multiSelect
    ? ((currentAnswer as string[]) || []).length > 0
    : currentAnswer !== undefined;

  const handleNext = () => {
    if (!canProceed) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (stepNum < 8) {
      router.push(`/assessment/${stepNum + 1}`);
    } else {
      router.push("/assessment/results");
    }
  };

  const progress = stepNum / 8;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + topPadding + 12,
            paddingHorizontal: 20,
            backgroundColor: colors.background,
          },
        ]}
      >
        <View style={styles.topRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.stepCount, { color: colors.mutedForeground }]}>
            {stepNum} / 8
          </Text>
        </View>

        {/* Progress bar */}
        <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress * 100}%`, backgroundColor: colors.primary },
            ]}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + bottomPadding + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Question */}
        <View style={styles.questionBlock}>
          <View
            style={[
              styles.stepBadge,
              { backgroundColor: colors.primary + "22", borderRadius: 20 },
            ]}
          >
            <Text style={[styles.stepBadgeText, { color: colors.primary }]}>
              Question {stepNum}
            </Text>
          </View>
          <Text style={[styles.question, { color: colors.foreground }]}>
            {question.question}
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {question.subtitle}
          </Text>
          {question.multiSelect && (
            <Text style={[styles.multiHint, { color: colors.accent }]}>
              {question.maxSelect
                ? `Select up to ${question.maxSelect}`
                : "Select all that apply"}
            </Text>
          )}
        </View>

        {/* Options */}
        <View style={styles.options}>
          {question.options.map((opt) => {
            const selected = isSelected(opt.label, opt.value);
            return (
              <TouchableOpacity
                key={opt.label}
                onPress={() => handleSelect(opt.label, opt.value)}
                activeOpacity={0.8}
                style={[
                  styles.option,
                  {
                    backgroundColor: selected
                      ? colors.primary + "22"
                      : colors.card,
                    borderColor: selected ? colors.primary : colors.border,
                    borderRadius: colors.radius,
                  },
                ]}
              >
                <View
                  style={[
                    styles.optionCheck,
                    {
                      backgroundColor: selected ? colors.primary : "transparent",
                      borderColor: selected ? colors.primary : colors.border,
                      borderRadius: question.multiSelect ? 6 : 14,
                    },
                  ]}
                >
                  {selected && (
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  )}
                </View>
                <Text
                  style={[
                    styles.optionText,
                    { color: selected ? colors.primary : colors.foreground },
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Next button */}
        <View style={[styles.nextBtn, { paddingHorizontal: 20 }]}>
          <GradientButton
            title={stepNum === 8 ? "See My Results" : "Continue"}
            onPress={handleNext}
            disabled={!canProceed}
            size="lg"
            icon={<Ionicons name={stepNum === 8 ? "sparkles" : "arrow-forward"} size={20} color="#fff" />}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { gap: 14, paddingBottom: 16 },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  stepCount: { fontSize: 14, fontFamily: "Poppins_500Medium" },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 3 },
  scroll: { gap: 24, paddingTop: 8 },
  questionBlock: { paddingHorizontal: 20, gap: 10 },
  stepBadge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    alignSelf: "flex-start",
  },
  stepBadgeText: { fontSize: 13, fontFamily: "Poppins_600SemiBold" },
  question: { fontSize: 22, fontFamily: "Poppins_700Bold", lineHeight: 32 },
  subtitle: { fontSize: 14, fontFamily: "Poppins_400Regular" },
  multiHint: { fontSize: 13, fontFamily: "Poppins_500Medium" },
  options: { paddingHorizontal: 20, gap: 10 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderWidth: 1.5,
  },
  optionCheck: {
    width: 24,
    height: 24,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  optionText: { fontSize: 15, fontFamily: "Poppins_500Medium", flex: 1 },
  nextBtn: {},
});
