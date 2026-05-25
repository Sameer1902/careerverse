import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CAREERS } from "@/data/careers";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    userName,
    setUserName,
    assessmentCompleted,
    resetAssessment,
    savedCareers,
    streak,
    resumeAnalyzed,
    matchedCareerIds,
  } = useApp();

  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(userName);

  const topPadding = Platform.OS === "web" ? 67 : 0;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  const savedCareerObjects = savedCareers
    .map((id) => CAREERS.find((c) => c.id === id))
    .filter(Boolean) as typeof CAREERS;

  const handleSaveName = () => {
    if (nameInput.trim()) {
      setUserName(nameInput.trim());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setEditing(false);
  };

  const handleReset = () => {
    Alert.alert(
      "Reset Assessment",
      "This will clear your assessment results and start fresh. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            resetAssessment();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ]
    );
  };

  const topMatchedCareer =
    matchedCareerIds.length > 0
      ? CAREERS.find((c) => c.id === matchedCareerIds[0])
      : null;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: insets.top + topPadding + 16,
        paddingBottom: insets.bottom + bottomPadding + 90,
        paddingHorizontal: 20,
        gap: 24,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Avatar & name */}
      <View style={styles.profileHeader}>
        <LinearGradient
          colors={["#FF6B00", "#FF9500"]}
          style={[styles.avatar, { borderRadius: 50 }]}
        >
          <Text style={styles.avatarInitial}>
            {userName.charAt(0).toUpperCase()}
          </Text>
        </LinearGradient>

        {editing ? (
          <View style={styles.editRow}>
            <TextInput
              style={[
                styles.nameInput,
                {
                  color: colors.foreground,
                  borderColor: colors.primary,
                  backgroundColor: colors.card,
                  borderRadius: 10,
                },
              ]}
              value={nameInput}
              onChangeText={setNameInput}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleSaveName}
            />
            <TouchableOpacity onPress={handleSaveName}>
              <Ionicons name="checkmark-circle" size={28} color={colors.primary} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => {
              setEditing(true);
              setNameInput(userName);
            }}
            style={styles.nameRow}
          >
            <Text style={[styles.name, { color: colors.foreground }]}>{userName}</Text>
            <Ionicons name="pencil" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}

        <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
          Career Explorer
        </Text>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <StatCard
          icon="flame"
          iconColor="#FF6B00"
          label="Streak"
          value={`${streak}`}
          colors={colors}
        />
        <StatCard
          icon="bookmark"
          iconColor="#6B5BFF"
          label="Saved"
          value={`${savedCareers.length}`}
          colors={colors}
        />
        <StatCard
          icon="checkmark-circle"
          iconColor="#20CF8C"
          label="Assessment"
          value={assessmentCompleted ? "Done" : "Pending"}
          colors={colors}
        />
      </View>

      {/* Top career match */}
      {topMatchedCareer && (
        <View style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border }]}>
          <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>Top Career Match</Text>
          <TouchableOpacity
            onPress={() => router.push(`/career/${topMatchedCareer.id}`)}
            style={styles.matchRow}
          >
            <View>
              <Text style={[styles.matchTitle, { color: colors.foreground }]}>
                {topMatchedCareer.title}
              </Text>
              <Text style={[styles.matchSalary, { color: colors.primary }]}>
                ₹{topMatchedCareer.salaryMin}–{topMatchedCareer.salaryMax} LPA
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      )}

      {/* Assessment card */}
      <View style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border }]}>
        <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>Career Assessment</Text>
        {assessmentCompleted ? (
          <View style={styles.assessmentDone}>
            <View style={[styles.doneTag, { backgroundColor: "#20CF8C22", borderRadius: 8 }]}>
              <Ionicons name="checkmark-circle" size={14} color="#20CF8C" />
              <Text style={[styles.doneTagText, { color: "#20CF8C" }]}>Completed</Text>
            </View>
            <View style={styles.assessmentBtns}>
              <TouchableOpacity
                onPress={() => router.push("/assessment/results")}
                style={[styles.actionBtn, { backgroundColor: colors.primary, borderRadius: 10 }]}
              >
                <Text style={styles.actionBtnText}>View Results</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleReset}
                style={[styles.actionBtn, { backgroundColor: colors.secondary, borderRadius: 10 }]}
              >
                <Text style={[styles.actionBtnText, { color: colors.mutedForeground }]}>Retake</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => router.push("/assessment")}
            style={[styles.startAssessment, { backgroundColor: colors.primary, borderRadius: 12 }]}
          >
            <Ionicons name="compass" size={18} color="#fff" />
            <Text style={styles.startText}>Start Assessment</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Resume */}
      <View style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border }]}>
        <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>Resume</Text>
        {resumeAnalyzed ? (
          <View style={styles.assessmentDone}>
            <View style={[styles.doneTag, { backgroundColor: "#20CF8C22", borderRadius: 8 }]}>
              <Ionicons name="document-text" size={14} color="#20CF8C" />
              <Text style={[styles.doneTagText, { color: "#20CF8C" }]}>Analyzed</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/resume")}
              style={[styles.actionBtn, { backgroundColor: colors.primary, borderRadius: 10 }]}
            >
              <Text style={styles.actionBtnText}>View Analysis</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => router.push("/resume")}
            style={[styles.startAssessment, { backgroundColor: "#6B5BFF", borderRadius: 12 }]}
          >
            <Ionicons name="document-text" size={18} color="#fff" />
            <Text style={styles.startText}>Upload Resume</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Saved careers */}
      {savedCareerObjects.length > 0 && (
        <View style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border }]}>
          <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>Saved Careers</Text>
          {savedCareerObjects.map((c) => (
            <TouchableOpacity
              key={c.id}
              onPress={() => router.push(`/career/${c.id}`)}
              style={[styles.savedItem, { borderTopColor: colors.border }]}
            >
              <View>
                <Text style={[styles.savedTitle, { color: colors.foreground }]}>{c.title}</Text>
                <Text style={[styles.savedSalary, { color: colors.mutedForeground }]}>
                  ₹{c.salaryMin}–{c.salaryMax} LPA · {c.growth} growth
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function StatCard({
  icon,
  iconColor,
  label,
  value,
  colors,
}: {
  icon: string;
  iconColor: string;
  label: string;
  value: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View
      style={[
        styles.statCard,
        { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border },
      ]}
    >
      <Ionicons name={icon as any} size={22} color={iconColor} />
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileHeader: { alignItems: "center", gap: 10 },
  avatar: {
    width: 90,
    height: 90,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: { fontSize: 36, fontFamily: "Poppins_700Bold", color: "#fff" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: { fontSize: 22, fontFamily: "Poppins_700Bold" },
  tagline: { fontSize: 13, fontFamily: "Poppins_400Regular" },
  editRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  nameInput: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1.5,
    minWidth: 160,
  },
  statsRow: { flexDirection: "row", gap: 12 },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    gap: 6,
    borderWidth: 1,
  },
  statValue: { fontSize: 20, fontFamily: "Poppins_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Poppins_400Regular" },
  card: {
    padding: 16,
    gap: 12,
    borderWidth: 1,
  },
  cardLabel: { fontSize: 12, fontFamily: "Poppins_500Medium", textTransform: "uppercase", letterSpacing: 0.8 },
  matchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  matchTitle: { fontSize: 16, fontFamily: "Poppins_600SemiBold" },
  matchSalary: { fontSize: 13, fontFamily: "Poppins_500Medium", marginTop: 2 },
  assessmentDone: { gap: 10 },
  doneTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  doneTagText: { fontSize: 13, fontFamily: "Poppins_500Medium" },
  assessmentBtns: { flexDirection: "row", gap: 10 },
  actionBtn: {
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  actionBtnText: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#fff" },
  startAssessment: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
  },
  startText: { fontSize: 14, fontFamily: "Poppins_700Bold", color: "#fff" },
  savedItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
  },
  savedTitle: { fontSize: 14, fontFamily: "Poppins_600SemiBold" },
  savedSalary: { fontSize: 12, fontFamily: "Poppins_400Regular", marginTop: 2 },
});
