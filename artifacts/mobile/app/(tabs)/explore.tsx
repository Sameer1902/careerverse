import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CareerCard } from "@/components/CareerCard";
import { CAREERS } from "@/data/careers";
import { useColors } from "@/hooks/useColors";

const CATEGORIES = ["All", "Technology", "Healthcare", "Finance", "Design", "Business", "Media", "Engineering", "Law", "Education"];

export default function ExploreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = useMemo(() => {
    return CAREERS.filter((c) => {
      const matchesSearch =
        search.trim() === "" ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        activeCategory === "All" ||
        c.category.toLowerCase().includes(activeCategory.toLowerCase()) ||
        c.interests.some((i) => i.toLowerCase().includes(activeCategory.toLowerCase()));
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  const topPadding = Platform.OS === "web" ? 67 : 0;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + topPadding + 16,
            paddingHorizontal: 20,
            backgroundColor: colors.background,
          },
        ]}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Explore Careers</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {filtered.length} careers in India
        </Text>

        {/* Search */}
        <View
          style={[
            styles.searchRow,
            { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
          ]}
        >
          <Ionicons name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search careers..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categories}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={[
                styles.catChip,
                {
                  backgroundColor:
                    activeCategory === cat ? colors.primary : colors.card,
                  borderColor:
                    activeCategory === cat ? colors.primary : colors.border,
                  borderRadius: 20,
                },
              ]}
            >
              <Text
                style={[
                  styles.catText,
                  { color: activeCategory === cat ? "#fff" : colors.mutedForeground },
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Career List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + bottomPadding + 90 },
        ]}
        renderItem={({ item }) => (
          <CareerCard career={item} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!filtered.length}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No careers found
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { gap: 12, paddingBottom: 16 },
  title: { fontSize: 24, fontFamily: "Poppins_700Bold" },
  subtitle: { fontSize: 13, fontFamily: "Poppins_400Regular", marginTop: -6 },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
  },
  categories: { gap: 8, paddingRight: 4 },
  catChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderWidth: 1,
  },
  catText: { fontSize: 13, fontFamily: "Poppins_500Medium" },
  list: { paddingHorizontal: 20, paddingTop: 8 },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: "Poppins_400Regular" },
});
