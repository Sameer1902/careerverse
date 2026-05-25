import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Linking,
  Modal,
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
import {
  ALL_STATES,
  COLLEGE_TYPES,
  College,
  getCollegesForCategory,
} from "@/data/colleges";
import { useColors } from "@/hooks/useColors";

type Career = (typeof CAREERS)[0];
type CompareMode = "careers" | "colleges";

export default function CompareScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<CompareMode>("careers");

  const [careerA, setCareerA] = useState<Career | null>(null);
  const [careerB, setCareerB] = useState<Career | null>(null);
  const [picking, setPicking] = useState<"A" | "B" | null>(null);
  const [search, setSearch] = useState("");

  const [collegeCareer, setCollegeCareer] = useState<Career | null>(null);
  const [pickingCollege, setPickingCollege] = useState(false);
  const [collegeSearch, setCollegeSearch] = useState("");
  const [selectedState, setSelectedState] = useState("All States");
  const [selectedType, setSelectedType] = useState("All Types");
  const [showStateFilter, setShowStateFilter] = useState(false);
  const [showTypeFilter, setShowTypeFilter] = useState(false);

  const topPadding = Platform.OS === "web" ? 67 : 0;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  const filtered = CAREERS.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase())
  );

  const handlePick = (career: Career) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (picking === "A") setCareerA(career);
    else setCareerB(career);
    setPicking(null);
    setSearch("");
  };

  const handleCollegePick = (career: Career) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCollegeCareer(career);
    setPickingCollege(false);
    setSearch("");
    setSelectedState("All States");
    setSelectedType("All Types");
  };

  const collegesRaw = collegeCareer
    ? getCollegesForCategory(collegeCareer.category)
    : [];

  const colleges = collegesRaw
    .filter((c) =>
      selectedState === "All States" ? true : c.state === selectedState
    )
    .filter((c) =>
      selectedType === "All Types" ? true : c.type === selectedType
    )
    .filter(
      (c) =>
        c.name.toLowerCase().includes(collegeSearch.toLowerCase()) ||
        c.location.toLowerCase().includes(collegeSearch.toLowerCase())
    );

  const ROWS = [
    {
      label: "Salary Range",
      keyA: (c: Career) => `₹${c.salaryMin}–${c.salaryMax} LPA`,
      winner: (a: Career, b: Career) =>
        a.salaryMax > b.salaryMax ? "A" : b.salaryMax > a.salaryMax ? "B" : "tie",
    },
    {
      label: "Annual Growth",
      keyA: (c: Career) => c.growth,
      winner: (a: Career, b: Career) =>
        a.growthPct > b.growthPct ? "A" : b.growthPct > a.growthPct ? "B" : "tie",
    },
    {
      label: "AI Suitability",
      keyA: (c: Career) => `${c.aiSuitability}%`,
      winner: (a: Career, b: Career) =>
        a.aiSuitability > b.aiSuitability
          ? "A"
          : b.aiSuitability > a.aiSuitability
          ? "B"
          : "tie",
    },
    {
      label: "Remote Work",
      keyA: (c: Career) => (c.remoteAvailable ? "Available" : "Limited"),
      winner: (a: Career, b: Career) =>
        a.remoteAvailable && !b.remoteAvailable
          ? "A"
          : !a.remoteAvailable && b.remoteAvailable
          ? "B"
          : "tie",
    },
    {
      label: "India Demand",
      keyA: (c: Career) => c.indiaDemand,
      winner: (a: Career, b: Career) =>
        demandScore(a.indiaDemand) > demandScore(b.indiaDemand)
          ? "A"
          : demandScore(a.indiaDemand) < demandScore(b.indiaDemand)
          ? "B"
          : "tie",
    },
    {
      label: "Risk Level",
      keyA: (c: Career) =>
        c.riskLevel.charAt(0).toUpperCase() + c.riskLevel.slice(1),
      winner: () => "tie" as const,
    },
    {
      label: "Companies Hiring",
      keyA: (c: Career) => c.companies.slice(0, 2).join(", "),
      winner: () => "tie" as const,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + topPadding + 16,
            paddingHorizontal: 20,
            paddingBottom: 12,
          },
        ]}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Compare</Text>

        {/* Mode Toggle */}
        <View style={[styles.modeToggle, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setMode("careers");
            }}
            style={[styles.modeBtn, mode === "careers" && styles.modeBtnActive]}
          >
            {mode === "careers" ? (
              <LinearGradient colors={["#FF6B00", "#FF9500"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.modeGrad}>
                <Ionicons name="git-compare-outline" size={14} color="#fff" />
                <Text style={styles.modeBtnActiveText}>Careers</Text>
              </LinearGradient>
            ) : (
              <View style={styles.modeGrad}>
                <Ionicons name="git-compare-outline" size={14} color={colors.mutedForeground} />
                <Text style={[styles.modeBtnText, { color: colors.mutedForeground }]}>Careers</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setMode("colleges");
            }}
            style={[styles.modeBtn, mode === "colleges" && styles.modeBtnActive]}
          >
            {mode === "colleges" ? (
              <LinearGradient colors={["#6B5BFF", "#9B5BFF"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.modeGrad}>
                <Ionicons name="school-outline" size={14} color="#fff" />
                <Text style={styles.modeBtnActiveText}>Colleges</Text>
              </LinearGradient>
            ) : (
              <View style={styles.modeGrad}>
                <Ionicons name="school-outline" size={14} color={colors.mutedForeground} />
                <Text style={[styles.modeBtnText, { color: colors.mutedForeground }]}>Colleges</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── CAREERS MODE ── */}
      {mode === "careers" && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: insets.bottom + bottomPadding + 90 },
          ]}
        >
          <View style={[styles.selectorRow, { paddingHorizontal: 20 }]}>
            <CareerSelector career={careerA} label="Career A" onPress={() => setPicking("A")} colors={colors} />
            <View style={[styles.vsCircle, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.vsText, { color: colors.mutedForeground }]}>VS</Text>
            </View>
            <CareerSelector career={careerB} label="Career B" onPress={() => setPicking("B")} colors={colors} />
          </View>

          {careerA && careerB ? (
            <View style={[styles.tableCard, { backgroundColor: colors.card, borderRadius: 16, margin: 20, borderColor: colors.border }]}>
              {ROWS.map((row, i) => {
                const winner = row.winner(careerA, careerB);
                return (
                  <View
                    key={row.label}
                    style={[styles.tableRow, i > 0 && { borderTopColor: colors.border, borderTopWidth: 1 }]}
                  >
                    <CellValue value={row.keyA(careerA)} highlight={winner === "A"} colors={colors} />
                    <Text style={[styles.rowLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
                    <CellValue value={row.keyA(careerB)} highlight={winner === "B"} colors={colors} right />
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.empty}>
              <Ionicons name="git-compare-outline" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                Select two careers to compare
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* ── COLLEGES MODE ── */}
      {mode === "colleges" && (
        <View style={{ flex: 1 }}>
          {/* Career Picker for Colleges */}
          <View style={{ paddingHorizontal: 20, paddingTop: 8, gap: 12 }}>
            <TouchableOpacity
              onPress={() => setPickingCollege(true)}
              style={[styles.careerPickBtn, { backgroundColor: colors.card, borderColor: collegeCareer ? "#6B5BFF" : colors.border }]}
              activeOpacity={0.8}
            >
              <View style={[styles.careerPickIcon, { backgroundColor: "#6B5BFF18" }]}>
                <Ionicons name="school-outline" size={18} color="#6B5BFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, fontFamily: "Poppins_400Regular", color: colors.mutedForeground }}>Find Colleges For</Text>
                <Text style={{ fontSize: 14, fontFamily: "Poppins_600SemiBold", color: collegeCareer ? colors.foreground : colors.mutedForeground }}>
                  {collegeCareer ? collegeCareer.title : "Select a Career"}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>

            {/* Search + Filters */}
            {collegeCareer && (
              <>
                <View style={[styles.searchRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Ionicons name="search" size={16} color={colors.mutedForeground} />
                  <TextInput
                    style={[styles.searchInput, { color: colors.foreground }]}
                    placeholder="Search college or city..."
                    placeholderTextColor={colors.mutedForeground}
                    value={collegeSearch}
                    onChangeText={setCollegeSearch}
                  />
                  {collegeSearch.length > 0 && (
                    <TouchableOpacity onPress={() => setCollegeSearch("")}>
                      <Ionicons name="close-circle" size={16} color={colors.mutedForeground} />
                    </TouchableOpacity>
                  )}
                </View>

                <View style={{ flexDirection: "row", gap: 10 }}>
                  <TouchableOpacity
                    onPress={() => setShowStateFilter(true)}
                    style={[styles.filterChip, { backgroundColor: selectedState !== "All States" ? "#6B5BFF18" : colors.card, borderColor: selectedState !== "All States" ? "#6B5BFF" : colors.border }]}
                  >
                    <Ionicons name="location-outline" size={13} color={selectedState !== "All States" ? "#6B5BFF" : colors.mutedForeground} />
                    <Text style={{ fontSize: 12, fontFamily: "Poppins_500Medium", color: selectedState !== "All States" ? "#6B5BFF" : colors.mutedForeground }} numberOfLines={1}>
                      {selectedState}
                    </Text>
                    <Ionicons name="chevron-down" size={11} color={colors.mutedForeground} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setShowTypeFilter(true)}
                    style={[styles.filterChip, { backgroundColor: selectedType !== "All Types" ? "#FF6B0018" : colors.card, borderColor: selectedType !== "All Types" ? "#FF6B00" : colors.border }]}
                  >
                    <Ionicons name="business-outline" size={13} color={selectedType !== "All Types" ? "#FF6B00" : colors.mutedForeground} />
                    <Text style={{ fontSize: 12, fontFamily: "Poppins_500Medium", color: selectedType !== "All Types" ? "#FF6B00" : colors.mutedForeground }} numberOfLines={1}>
                      {selectedType}
                    </Text>
                    <Ionicons name="chevron-down" size={11} color={colors.mutedForeground} />
                  </TouchableOpacity>
                </View>

                <Text style={{ fontSize: 12, fontFamily: "Poppins_400Regular", color: colors.mutedForeground }}>
                  Showing {colleges.length} of {collegesRaw.length} institutions
                </Text>
              </>
            )}
          </View>

          {/* College List */}
          {collegeCareer ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[
                { paddingHorizontal: 20, paddingTop: 12, gap: 12 },
                { paddingBottom: insets.bottom + bottomPadding + 90 },
              ]}
            >
              {colleges.length === 0 ? (
                <View style={styles.empty}>
                  <Ionicons name="search-outline" size={40} color={colors.mutedForeground} />
                  <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No colleges match your filters</Text>
                </View>
              ) : (
                colleges.map((college) => (
                  <CollegeCard key={college.name} college={college} colors={colors} />
                ))
              )}
            </ScrollView>
          ) : (
            <View style={[styles.empty, { flex: 1 }]}>
              <LinearGradient colors={["#6B5BFF22", "#9B5BFF11"]} style={styles.emptyOrb}>
                <Ionicons name="school-outline" size={36} color="#6B5BFF" />
              </LinearGradient>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Find Your College</Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground, textAlign: "center" }]}>
                Select a career above to see all relevant Indian colleges — IITs, IIMs, NITs, private & state universities
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Career Picker Modal */}
      <Modal visible={picking !== null} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Select Career {picking}</Text>
            <TouchableOpacity onPress={() => { setPicking(null); setSearch(""); }}>
              <Ionicons name="close" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          <View style={[styles.modalSearch, { borderBottomColor: colors.border }]}>
            <View style={[styles.searchRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="search" size={18} color={colors.mutedForeground} />
              <TextInput
                style={[styles.searchInput, { color: colors.foreground }]}
                placeholder="Search careers..."
                placeholderTextColor={colors.mutedForeground}
                value={search}
                onChangeText={setSearch}
                autoFocus
              />
            </View>
          </View>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 10, padding: 20 }}>
            {filtered.map((career) => (
              <TouchableOpacity
                key={career.id}
                onPress={() => handlePick(career)}
                style={[styles.careerOption, { backgroundColor: colors.card, borderRadius: 12, borderColor: colors.border }]}
              >
                <View style={styles.careerOptionLeft}>
                  <Text style={[styles.careerOptionTitle, { color: colors.foreground }]}>{career.title}</Text>
                  <Text style={[styles.careerOptionCat, { color: colors.mutedForeground }]}>{career.category}</Text>
                </View>
                <Text style={[styles.careerOptionSalary, { color: colors.primary }]}>
                  ₹{career.salaryMin}–{career.salaryMax} LPA
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* College Career Picker Modal */}
      <Modal visible={pickingCollege} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Pick a Career</Text>
            <TouchableOpacity onPress={() => { setPickingCollege(false); setSearch(""); }}>
              <Ionicons name="close" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          <View style={[styles.modalSearch, { borderBottomColor: colors.border }]}>
            <View style={[styles.searchRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="search" size={18} color={colors.mutedForeground} />
              <TextInput
                style={[styles.searchInput, { color: colors.foreground }]}
                placeholder="Search careers..."
                placeholderTextColor={colors.mutedForeground}
                value={search}
                onChangeText={setSearch}
                autoFocus
              />
            </View>
          </View>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 10, padding: 20 }}>
            {filtered.map((career) => (
              <TouchableOpacity
                key={career.id}
                onPress={() => handleCollegePick(career)}
                style={[styles.careerOption, { backgroundColor: colors.card, borderRadius: 12, borderColor: colors.border }]}
              >
                <View style={styles.careerOptionLeft}>
                  <Text style={[styles.careerOptionTitle, { color: colors.foreground }]}>{career.title}</Text>
                  <Text style={[styles.careerOptionCat, { color: colors.mutedForeground }]}>{career.category}</Text>
                </View>
                <View style={[{ backgroundColor: "#6B5BFF18", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }]}>
                  <Text style={{ fontSize: 11, fontFamily: "Poppins_600SemiBold", color: "#6B5BFF" }}>Browse</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* State Filter Modal */}
      <Modal visible={showStateFilter} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Filter by State</Text>
            <TouchableOpacity onPress={() => setShowStateFilter(false)}>
              <Ionicons name="close" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 20, gap: 8 }}>
            {ALL_STATES.map((state) => (
              <TouchableOpacity
                key={state}
                onPress={() => { setSelectedState(state); setShowStateFilter(false); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                style={[
                  styles.filterOption,
                  { backgroundColor: selectedState === state ? "#6B5BFF18" : colors.card, borderColor: selectedState === state ? "#6B5BFF" : colors.border },
                ]}
              >
                <Text style={{ fontSize: 14, fontFamily: "Poppins_500Medium", color: selectedState === state ? "#6B5BFF" : colors.foreground }}>{state}</Text>
                {selectedState === state && <Ionicons name="checkmark-circle" size={18} color="#6B5BFF" />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Type Filter Modal */}
      <Modal visible={showTypeFilter} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Filter by Type</Text>
            <TouchableOpacity onPress={() => setShowTypeFilter(false)}>
              <Ionicons name="close" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 20, gap: 8 }}>
            {COLLEGE_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => { setSelectedType(type); setShowTypeFilter(false); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                style={[
                  styles.filterOption,
                  { backgroundColor: selectedType === type ? "#FF6B0018" : colors.card, borderColor: selectedType === type ? "#FF6B00" : colors.border },
                ]}
              >
                <Text style={{ fontSize: 14, fontFamily: "Poppins_500Medium", color: selectedType === type ? "#FF6B00" : colors.foreground }}>{type}</Text>
                {selectedType === type && <Ionicons name="checkmark-circle" size={18} color="#FF6B00" />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

function CollegeCard({ college, colors }: { college: College; colors: ReturnType<typeof useColors> }) {
  const typeColor: Record<string, string> = {
    IIT: "#FF6B00",
    NIT: "#FF9500",
    IIM: "#20CF8C",
    IIIT: "#6B5BFF",
    AIIMS: "#FF4B4B",
    "Institute of National Importance": "#FF6B00",
    "Central University": "#00BFFF",
    "State University": "#FFD700",
    "Deemed University": "#9B5BFF",
    "Private University": "#FF69B4",
    "Autonomous College": "#20CF8C",
  };
  const color = typeColor[college.type] ?? "#FF6B00";

  const handleVisit = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const ok = await Linking.canOpenURL(college.website);
      if (ok) await Linking.openURL(college.website);
    } catch {
      await Linking.openURL(college.website);
    }
  };

  return (
    <View style={[styles.collegeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontFamily: "Poppins_700Bold", color: colors.foreground }} numberOfLines={2}>
            {college.name}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 }}>
            <Ionicons name="location-outline" size={12} color={colors.mutedForeground} />
            <Text style={{ fontSize: 12, fontFamily: "Poppins_400Regular", color: colors.mutedForeground }}>{college.location}</Text>
          </View>
        </View>
        {college.ranking <= 10 && (
          <View style={{ backgroundColor: "#FFD70018", borderWidth: 1, borderColor: "#FFD70044", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 }}>
            <Text style={{ fontSize: 11, fontFamily: "Poppins_700Bold", color: "#FFD700" }}>#{college.ranking}</Text>
          </View>
        )}
      </View>

      <View style={[styles.typeBadge, { backgroundColor: color + "18", borderColor: color + "44" }]}>
        <Text style={{ fontSize: 11, fontFamily: "Poppins_600SemiBold", color }}>{college.type}</Text>
      </View>

      <View style={[styles.collegeDetails, { borderTopColor: colors.border }]}>
        <View style={styles.detailItem}>
          <Text style={{ fontSize: 11, fontFamily: "Poppins_400Regular", color: colors.mutedForeground }}>Annual Fees</Text>
          <Text style={{ fontSize: 13, fontFamily: "Poppins_600SemiBold", color: colors.foreground }}>{college.fees}</Text>
        </View>
        <View style={[styles.detailDivider, { backgroundColor: colors.border }]} />
        <View style={styles.detailItem}>
          <Text style={{ fontSize: 11, fontFamily: "Poppins_400Regular", color: colors.mutedForeground }}>Admission</Text>
          <Text style={{ fontSize: 13, fontFamily: "Poppins_600SemiBold", color: colors.primary }} numberOfLines={1}>{college.admission}</Text>
        </View>
      </View>

      <TouchableOpacity onPress={handleVisit} style={[styles.visitBtn, { borderColor: colors.border }]} activeOpacity={0.7}>
        <Ionicons name="open-outline" size={14} color={colors.mutedForeground} />
        <Text style={{ fontSize: 13, fontFamily: "Poppins_500Medium", color: colors.foreground }}>Visit Website</Text>
      </TouchableOpacity>
    </View>
  );
}

function CareerSelector({
  career, label, onPress, colors,
}: {
  career: Career | null;
  label: string;
  onPress: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.selector,
        { backgroundColor: colors.card, borderRadius: 16, borderColor: career ? colors.primary : colors.border, borderWidth: career ? 1.5 : 1 },
      ]}
    >
      {career ? (
        <>
          <Text style={[styles.selectedTitle, { color: colors.foreground }]} numberOfLines={2}>{career.title}</Text>
          <Text style={[styles.selectedCat, { color: colors.primary }]}>{career.category}</Text>
          <Text style={[styles.changeTap, { color: colors.mutedForeground }]}>Tap to change</Text>
        </>
      ) : (
        <>
          <Ionicons name="add-circle-outline" size={28} color={colors.mutedForeground} />
          <Text style={[styles.selectorLabel, { color: colors.mutedForeground }]}>{label}</Text>
          <Text style={[styles.selectorHint, { color: colors.mutedForeground }]}>Tap to select</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

function CellValue({ value, highlight, colors, right = false }: {
  value: string;
  highlight: boolean;
  colors: ReturnType<typeof useColors>;
  right?: boolean;
}) {
  return (
    <View style={[styles.cell, right && { alignItems: "flex-end" }]}>
      {highlight && (
        <Ionicons name="trophy" size={12} color="#FFD700" style={right ? { marginLeft: 4 } : { marginRight: 4 }} />
      )}
      <Text
        style={[styles.cellValue, { color: highlight ? colors.primary : colors.foreground }]}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

function demandScore(d: string): number {
  if (d === "Very High") return 4;
  if (d === "High") return 3;
  if (d === "Moderate") return 2;
  return 1;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { gap: 12 },
  title: { fontSize: 24, fontFamily: "Poppins_700Bold" },

  modeToggle: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 14,
    overflow: "hidden",
    padding: 4,
    gap: 4,
  },
  modeBtn: { flex: 1, borderRadius: 10, overflow: "hidden" },
  modeBtnActive: {},
  modeGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 8, borderRadius: 10 },
  modeBtnText: { fontSize: 13, fontFamily: "Poppins_600SemiBold" },
  modeBtnActiveText: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#fff" },

  scroll: {},
  selectorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 8,
    paddingBottom: 4,
  },
  vsCircle: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  vsText: { fontSize: 12, fontFamily: "Poppins_700Bold" },
  selector: { flex: 1, padding: 16, alignItems: "center", gap: 6, minHeight: 100, justifyContent: "center" },
  selectedTitle: { fontSize: 13, fontFamily: "Poppins_600SemiBold", textAlign: "center" },
  selectedCat: { fontSize: 11, fontFamily: "Poppins_400Regular" },
  changeTap: { fontSize: 11, fontFamily: "Poppins_400Regular" },
  selectorLabel: { fontSize: 14, fontFamily: "Poppins_600SemiBold" },
  selectorHint: { fontSize: 11, fontFamily: "Poppins_400Regular" },

  tableCard: { borderWidth: 1, overflow: "hidden" },
  tableRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14 },
  cell: { flex: 2, flexDirection: "row", alignItems: "center" },
  cellValue: { fontSize: 12, fontFamily: "Poppins_500Medium", flexShrink: 1 },
  rowLabel: { flex: 3, fontSize: 11, fontFamily: "Poppins_400Regular", textAlign: "center" },

  empty: { alignItems: "center", paddingTop: 60, gap: 12, paddingHorizontal: 32 },
  emptyOrb: { width: 90, height: 90, borderRadius: 45, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 20, fontFamily: "Poppins_700Bold" },
  emptyText: { fontSize: 14, fontFamily: "Poppins_400Regular", textAlign: "center" },

  careerPickBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  careerPickIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },

  searchRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderRadius: 12 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Poppins_400Regular" },

  filterChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, flex: 1 },

  filterOption: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14, borderRadius: 12, borderWidth: 1 },

  collegeCard: { borderWidth: 1, borderRadius: 16, padding: 16, gap: 12 },
  typeBadge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  collegeDetails: { flexDirection: "row", alignItems: "center", borderTopWidth: 1, paddingTop: 12, gap: 0 },
  detailItem: { flex: 1, gap: 2 },
  detailDivider: { width: 1, height: 32, marginHorizontal: 12 },
  visitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },

  modal: { flex: 1 },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 20,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 18, fontFamily: "Poppins_700Bold" },
  modalSearch: { padding: 16, borderBottomWidth: 1 },
  careerOption: { flexDirection: "row", alignItems: "center", padding: 14, borderWidth: 1, justifyContent: "space-between" },
  careerOptionLeft: { flex: 1 },
  careerOptionTitle: { fontSize: 14, fontFamily: "Poppins_600SemiBold" },
  careerOptionCat: { fontSize: 12, fontFamily: "Poppins_400Regular", marginTop: 2 },
  careerOptionSalary: { fontSize: 13, fontFamily: "Poppins_600SemiBold" },
});
