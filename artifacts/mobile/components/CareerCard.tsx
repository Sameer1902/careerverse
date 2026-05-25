import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import type { Career } from "@/data/careers";

interface CareerCardProps {
  career: Career & { matchScore?: number };
  showMatch?: boolean;
  compact?: boolean;
}

function getDemandColor(demand: string): string {
  if (demand === "Very High") return "#20CF8C";
  if (demand === "High") return "#6B5BFF";
  if (demand === "Moderate") return "#FF9500";
  return "#888";
}

export function CareerCard({ career, showMatch = false, compact = false }: CareerCardProps) {
  const colors = useColors();
  const { savedCareers, toggleSavedCareer } = useApp();
  const isSaved = savedCareers.includes(career.id);
  const demandColor = getDemandColor(career.indiaDemand);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/career/${career.id}`);
  };

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleSavedCareer(career.id);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.85}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: colors.radius,
          borderColor: colors.border,
          padding: compact ? 14 : 16,
        },
      ]}
    >
      <View style={styles.row}>
        <View
          style={[
            styles.iconBg,
            { backgroundColor: colors.secondary, borderRadius: 14 },
          ]}
        >
          <Ionicons
            name={getCategoryIcon(career.category)}
            size={22}
            color={colors.primary}
          />
        </View>

        <View style={styles.titleBlock}>
          <Text
            style={[styles.title, { color: colors.foreground }]}
            numberOfLines={1}
          >
            {career.title}
          </Text>
          <Text style={[styles.category, { color: colors.mutedForeground }]}>
            {career.category}
          </Text>

          {/* Salary + Demand row — matching screenshot */}
          <View style={styles.metaRow}>
            <Text style={[styles.salary, { color: colors.primary }]}>
              ₹{career.salaryMin}-{career.salaryMax} LPA
            </Text>
            <View style={[styles.demandBadge, { backgroundColor: demandColor + "22" }]}>
              <Text style={[styles.demandText, { color: demandColor }]}>
                {career.indiaDemand}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity onPress={handleSave} hitSlop={8} style={styles.arrowWrap}>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.mutedForeground}
          />
        </TouchableOpacity>
      </View>

      {showMatch && career.matchScore !== undefined && (
        <View style={[styles.matchBar, { backgroundColor: colors.secondary }]}>
          <View style={[styles.matchFill, { width: `${career.matchScore}%`, backgroundColor: colors.primary }]} />
          <Text style={[styles.matchLabel, { color: colors.primary }]}>
            {career.matchScore}% match
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function getCategoryIcon(category: string): any {
  if (category.includes("Technology")) return "code-slash";
  if (category.includes("Healthcare")) return "medical";
  if (category.includes("Finance")) return "bar-chart";
  if (category.includes("Design")) return "color-palette";
  if (category.includes("Marketing")) return "megaphone";
  if (category.includes("Media")) return "videocam";
  if (category.includes("Business")) return "briefcase";
  if (category.includes("Engineering")) return "construct";
  if (category.includes("Law")) return "scale";
  if (category.includes("Education")) return "school";
  return "briefcase-outline";
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    gap: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBg: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  titleBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
  },
  category: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  salary: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
  },
  demandBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  demandText: {
    fontSize: 11,
    fontFamily: "Poppins_600SemiBold",
  },
  arrowWrap: {
    paddingLeft: 4,
  },
  matchBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    position: "relative",
  },
  matchFill: {
    height: "100%",
    borderRadius: 3,
  },
  matchLabel: {
    position: "absolute",
    right: 0,
    top: 8,
    fontSize: 11,
    fontFamily: "Poppins_700Bold",
  },
});
