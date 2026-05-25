import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface SkillBadgeProps {
  label: string;
  variant?: "default" | "primary" | "success" | "warning";
}

export function SkillBadge({ label, variant = "default" }: SkillBadgeProps) {
  const colors = useColors();

  const bgMap = {
    default: colors.secondary,
    primary: colors.primary + "22",
    success: "#20CF8C22",
    warning: "#FFD70022",
  };

  const textMap = {
    default: colors.mutedForeground,
    primary: colors.primary,
    success: "#20CF8C",
    warning: "#FFD700",
  };

  return (
    <View style={[styles.badge, { backgroundColor: bgMap[variant], borderRadius: 8 }]}>
      <Text style={[styles.label, { color: textMap[variant] }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  label: {
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
  },
});
