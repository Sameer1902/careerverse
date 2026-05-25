import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { userName, streak } = useApp();

  const topPaddingWeb = Platform.OS === "web" ? 67 : 0;
  const bottomPaddingWeb = Platform.OS === "web" ? 34 : 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: insets.top + topPaddingWeb + 20,
        paddingBottom: insets.bottom + bottomPaddingWeb + 90,
        paddingHorizontal: 20,
        gap: 28,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
            Welcome back,
          </Text>
          <Text style={[styles.userName, { color: colors.foreground }]}>
            {userName} 👋
          </Text>
        </View>
        <View style={styles.headerRight}>
          {streak > 0 && (
            <View style={[styles.streakBadge, { backgroundColor: "#FF6B0022", borderRadius: 20 }]}>
              <Ionicons name="flame" size={14} color={colors.primary} />
              <Text style={[styles.streakText, { color: colors.primary }]}>{streak}</Text>
            </View>
          )}
          <TouchableOpacity
            onPress={() => router.push("/chatbot")}
            style={[styles.iconBtn, { backgroundColor: colors.card, borderRadius: 24, borderColor: colors.border }]}
          >
            <Ionicons name="chatbubble-ellipses" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tagline */}
      <View>
        <Text style={[styles.tagline, { color: colors.foreground }]}>
          What would you like to do today?
        </Text>
        <Text style={[styles.taglineSub, { color: colors.mutedForeground }]}>
          Your AI career guide is ready to help you grow.
        </Text>
      </View>

      {/* Card 1 — Discover Your Path */}
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push("/assessment");
        }}
      >
        <LinearGradient
          colors={["#FF6B00", "#FF9500", "#FFB800"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.mainCard, { borderRadius: colors.radius + 4 }]}
        >
          <View style={styles.cardIconRow}>
            <View style={styles.cardIconWrap}>
              <Ionicons name="compass" size={40} color="#fff" />
            </View>
            <Ionicons name="arrow-forward-circle" size={28} color="rgba(255,255,255,0.8)" />
          </View>

          <Text style={styles.cardTitle}>Discover Your Path</Text>
          <Text style={styles.cardSubtitle}>
            Take the 8-step AI career assessment and get your personalized career matches ranked by fit.
          </Text>

          <View style={styles.cardBadgeRow}>
            <View style={styles.cardBadge}>
              <Ionicons name="time-outline" size={12} color="rgba(255,255,255,0.9)" />
              <Text style={styles.cardBadgeText}>5 minutes</Text>
            </View>
            <View style={styles.cardBadge}>
              <Ionicons name="briefcase-outline" size={12} color="rgba(255,255,255,0.9)" />
              <Text style={styles.cardBadgeText}>20+ careers</Text>
            </View>
            <View style={styles.cardBadge}>
              <Ionicons name="sparkles-outline" size={12} color="rgba(255,255,255,0.9)" />
              <Text style={styles.cardBadgeText}>AI-powered</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Card 2 — Resume Analysis */}
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push("/resume");
        }}
      >
        <LinearGradient
          colors={["#6B5BFF", "#9B5BFF", "#C05BFF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.mainCard, { borderRadius: colors.radius + 4 }]}
        >
          <View style={styles.cardIconRow}>
            <View style={styles.cardIconWrap}>
              <Ionicons name="document-text" size={40} color="#fff" />
            </View>
            <Ionicons name="arrow-forward-circle" size={28} color="rgba(255,255,255,0.8)" />
          </View>

          <Text style={styles.cardTitle}>Resume Analysis</Text>
          <Text style={styles.cardSubtitle}>
            Upload your resume and get instant AI feedback — ATS score, skill extraction, and personalized improvement tips.
          </Text>

          <View style={styles.cardBadgeRow}>
            <View style={styles.cardBadge}>
              <Ionicons name="cloud-upload-outline" size={12} color="rgba(255,255,255,0.9)" />
              <Text style={styles.cardBadgeText}>PDF, DOC, JPG</Text>
            </View>
            <View style={styles.cardBadge}>
              <Ionicons name="stats-chart-outline" size={12} color="rgba(255,255,255,0.9)" />
              <Text style={styles.cardBadgeText}>ATS Score</Text>
            </View>
            <View style={styles.cardBadge}>
              <Ionicons name="checkmark-circle-outline" size={12} color="rgba(255,255,255,0.9)" />
              <Text style={styles.cardBadgeText}>Instant results</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Footer hint */}
      <View style={styles.footerHint}>
        <Ionicons name="information-circle-outline" size={16} color={colors.mutedForeground} />
        <Text style={[styles.footerHintText, { color: colors.mutedForeground }]}>
          Use the tabs below to explore careers, compare options, find mentors, and update your profile.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  greeting: { fontSize: 13, fontFamily: "Poppins_400Regular" },
  userName: { fontSize: 24, fontFamily: "Poppins_700Bold" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  streakText: { fontSize: 13, fontFamily: "Poppins_700Bold" },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  tagline: {
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
    marginBottom: 4,
  },
  taglineSub: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    lineHeight: 22,
  },
  mainCard: {
    padding: 24,
    gap: 14,
  },
  cardIconRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardIconWrap: {
    width: 64,
    height: 64,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 24,
    fontFamily: "Poppins_700Bold",
    color: "#fff",
  },
  cardSubtitle: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.88)",
    lineHeight: 22,
  },
  cardBadgeRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 4,
  },
  cardBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  cardBadgeText: {
    fontSize: 11,
    fontFamily: "Poppins_500Medium",
    color: "rgba(255,255,255,0.95)",
  },
  footerHint: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingHorizontal: 4,
  },
  footerHintText: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    lineHeight: 20,
    flex: 1,
  },
});
