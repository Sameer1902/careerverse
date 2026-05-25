import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import type { Mentor } from "@/data/mentors";

interface MentorCardProps {
  mentor: Mentor;
  compact?: boolean;
}

export function MentorCard({ mentor, compact = false }: MentorCardProps) {
  const colors = useColors();

  const handleBook = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      "Session Requested",
      `Your session request with ${mentor.name} has been sent. They will confirm within 24 hours.`,
      [{ text: "Done" }]
    );
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: colors.radius,
          borderColor: colors.border,
          padding: compact ? 14 : 18,
        },
      ]}
    >
      <View style={styles.topRow}>
        <LinearGradient
          colors={[mentor.gradientStart, mentor.gradientEnd]}
          style={[styles.avatar, { borderRadius: 28 }]}
        >
          <Text style={styles.initials}>{mentor.initials}</Text>
        </LinearGradient>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.foreground }]}>{mentor.name}</Text>
          <Text style={[styles.role, { color: colors.mutedForeground }]} numberOfLines={1}>
            {mentor.role}
          </Text>
          <Text style={[styles.company, { color: colors.primary }]}>{mentor.company}</Text>
        </View>
        <View style={styles.ratingBlock}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={[styles.rating, { color: colors.foreground }]}>{mentor.rating}</Text>
          <Text style={[styles.reviews, { color: colors.mutedForeground }]}>
            ({mentor.reviewCount})
          </Text>
        </View>
      </View>

      {!compact && (
        <Text style={[styles.bio, { color: colors.mutedForeground }]} numberOfLines={3}>
          {mentor.bio}
        </Text>
      )}

      <View style={styles.tags}>
        {mentor.specialties.slice(0, compact ? 2 : 4).map((s) => (
          <View
            key={s}
            style={[styles.tag, { backgroundColor: colors.secondary, borderRadius: 8 }]}
          >
            <Text style={[styles.tagText, { color: colors.mutedForeground }]}>{s}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <View>
          <Text style={[styles.priceLabel, { color: colors.mutedForeground }]}>Per session</Text>
          <Text style={[styles.price, { color: colors.foreground }]}>
            ₹{mentor.sessionPrice.toLocaleString("en-IN")}
          </Text>
        </View>
        <View>
          <Text style={[styles.avail, { color: colors.mutedForeground }]}>
            <Ionicons name="time-outline" size={11} color={colors.mutedForeground} />{" "}
            {mentor.availability}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleBook}
          activeOpacity={0.8}
          style={[styles.bookBtn, { backgroundColor: colors.primary, borderRadius: 12 }]}
        >
          <Text style={styles.bookText}>Book</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    gap: 14,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    color: "#fff",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
  },
  role: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    marginTop: 1,
  },
  company: {
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
    marginTop: 1,
  },
  ratingBlock: {
    alignItems: "center",
    flexDirection: "row",
    gap: 2,
  },
  rating: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
  },
  reviews: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
  },
  bio: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    lineHeight: 20,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceLabel: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
  },
  price: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
  },
  avail: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
  },
  bookBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  bookText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
  },
});
