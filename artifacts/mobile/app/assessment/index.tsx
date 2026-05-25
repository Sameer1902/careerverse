import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
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
import { useColors } from "@/hooks/useColors";

const HIGHLIGHTS = [
  { icon: "time-outline", text: "Takes only 5 minutes" },
  { icon: "bulb-outline", text: "AI-powered career matching" },
  { icon: "trending-up-outline", text: "India-focused insights" },
  { icon: "school-outline", text: "Personalized roadmaps" },
  { icon: "people-outline", text: "Mentor recommendations" },
];

export default function AssessmentIntroScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { assessmentCompleted, resetAssessment } = useApp();

  const topPadding = Platform.OS === "web" ? 67 : 0;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  const handleStart = () => {
    resetAssessment();
    router.push("/assessment/1");
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: insets.top + topPadding + 60,
        paddingBottom: insets.bottom + bottomPadding + 40,
        paddingHorizontal: 24,
        gap: 32,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Back */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color={colors.foreground} />
      </TouchableOpacity>

      {/* Hero */}
      <View style={styles.hero}>
        <LinearGradient
          colors={["#FF6B0033", "#FF950011"]}
          style={[styles.iconBg, { borderRadius: 40 }]}
        >
          <Ionicons name="compass" size={64} color={colors.primary} />
        </LinearGradient>
        <Text style={[styles.heading, { color: colors.foreground }]}>
          Career Assessment
        </Text>
        <Text style={[styles.subheading, { color: colors.mutedForeground }]}>
          Answer 8 simple questions and our AI will match you to the best careers in India based on your interests, skills, and goals.
        </Text>
      </View>

      {/* Highlights */}
      <View style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border }]}>
        {HIGHLIGHTS.map((h, i) => (
          <View
            key={h.text}
            style={[
              styles.highlightRow,
              i > 0 && { borderTopColor: colors.border, borderTopWidth: 1 },
            ]}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.primary + "22", borderRadius: 12 }]}>
              <Ionicons name={h.icon as any} size={18} color={colors.primary} />
            </View>
            <Text style={[styles.highlightText, { color: colors.foreground }]}>{h.text}</Text>
          </View>
        ))}
      </View>

      {/* Progress hint */}
      <View style={styles.progressHint}>
        <View style={styles.progressDots}>
          {[...Array(8)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i === 0 ? colors.primary : colors.border },
              ]}
            />
          ))}
        </View>
        <Text style={[styles.progressText, { color: colors.mutedForeground }]}>
          8 questions · AI analysis
        </Text>
      </View>

      {/* CTA */}
      <GradientButton
        title={assessmentCompleted ? "Retake Assessment" : "Start Assessment"}
        onPress={handleStart}
        size="lg"
        icon={<Ionicons name="arrow-forward" size={20} color="#fff" />}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: {
    position: "absolute",
    top: 0,
    left: 24,
    zIndex: 10,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  hero: { alignItems: "center", gap: 16, paddingTop: 20 },
  iconBg: {
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  heading: { fontSize: 28, fontFamily: "Poppins_700Bold", textAlign: "center" },
  subheading: {
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    lineHeight: 24,
  },
  card: { borderWidth: 1, overflow: "hidden" },
  highlightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
  },
  iconCircle: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  highlightText: { fontSize: 14, fontFamily: "Poppins_500Medium", flex: 1 },
  progressHint: { alignItems: "center", gap: 10 },
  progressDots: { flexDirection: "row", gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  progressText: { fontSize: 13, fontFamily: "Poppins_400Regular" },
});
