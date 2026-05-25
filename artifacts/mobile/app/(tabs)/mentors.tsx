import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MentorCard } from "@/components/MentorCard";
import { MENTORS } from "@/data/mentors";
import { useColors } from "@/hooks/useColors";

const SPECIALTIES = ["All", "AI/ML", "Data Science", "Product", "Design", "Finance", "Career Switch"];

export default function MentorsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = useMemo(
    () =>
      activeFilter === "All"
        ? MENTORS
        : MENTORS.filter((m) =>
            m.specialties.some((s) => s.toLowerCase().includes(activeFilter.toLowerCase()))
          ),
    [activeFilter]
  );

  const topPadding = Platform.OS === "web" ? 67 : 0;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + topPadding + 16,
            paddingHorizontal: 20,
            paddingBottom: 16,
            backgroundColor: colors.background,
          },
        ]}
      >
        <View style={styles.titleRow}>
          <View>
            <Text style={[styles.title, { color: colors.foreground }]}>Mentors</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Learn from industry experts
            </Text>
          </View>
          <View style={[styles.countBadge, { backgroundColor: colors.card, borderRadius: 20, borderColor: colors.border }]}>
            <Ionicons name="people" size={14} color={colors.primary} />
            <Text style={[styles.countText, { color: colors.primary }]}>{filtered.length}</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {SPECIALTIES.map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => setActiveFilter(s)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: activeFilter === s ? colors.primary : colors.card,
                  borderColor: activeFilter === s ? colors.primary : colors.border,
                  borderRadius: 20,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: activeFilter === s ? "#fff" : colors.mutedForeground },
                ]}
              >
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + bottomPadding + 90 },
        ]}
        renderItem={({ item }) => <MentorCard mentor={item} />}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!filtered.length}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No mentors found for this filter
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { gap: 14 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 24, fontFamily: "Poppins_700Bold" },
  subtitle: { fontSize: 13, fontFamily: "Poppins_400Regular" },
  countBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
  },
  countText: { fontSize: 14, fontFamily: "Poppins_700Bold" },
  filters: { gap: 8, paddingRight: 4 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderWidth: 1,
  },
  filterText: { fontSize: 13, fontFamily: "Poppins_500Medium" },
  list: { paddingHorizontal: 20, paddingTop: 8 },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 14, fontFamily: "Poppins_400Regular" },
});
