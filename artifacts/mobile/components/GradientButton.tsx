import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

import { useColors } from "@/hooks/useColors";

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  style?: ViewStyle;
  outline?: boolean;
  icon?: React.ReactNode;
}

export function GradientButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  size = "md",
  style,
  outline = false,
  icon,
}: GradientButtonProps) {
  const colors = useColors();
  const height = size === "sm" ? 42 : size === "lg" ? 60 : 52;
  const fontSize = size === "sm" ? 14 : size === "lg" ? 18 : 16;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  if (outline) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.75}
        style={[
          {
            borderRadius: colors.radius,
            height,
            borderWidth: 1.5,
            borderColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 24,
            flexDirection: "row",
            gap: 8,
            opacity: disabled ? 0.5 : 1,
          },
          style,
        ]}
      >
        {icon}
        <Text
          style={{
            color: colors.primary,
            fontSize,
            fontFamily: "Poppins_600SemiBold",
            letterSpacing: 0.2,
          }}
        >
          {title}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[{ borderRadius: colors.radius, overflow: "hidden" }, style]}
    >
      <LinearGradient
        colors={disabled ? ["#555555", "#666666"] : ["#FF6B00", "#FF9500"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradient, { height, borderRadius: colors.radius }]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <View style={styles.row}>
            {icon}
            <Text style={[styles.label, { fontSize }]}>{title}</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gradient: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    color: "#fff",
    fontFamily: "Poppins_700Bold",
    letterSpacing: 0.3,
  },
});
