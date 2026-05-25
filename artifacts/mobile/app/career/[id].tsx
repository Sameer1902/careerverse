import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
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
import { SkillBadge } from "@/components/SkillBadge";
import { useApp } from "@/context/AppContext";
import { getCareerById, RoadmapResource } from "@/data/careers";
import { useColors } from "@/hooks/useColors";

const TABS = ["Overview", "Growth", "Skills", "Roadmap"] as const;
type Tab = (typeof TABS)[number];

export default function CareerDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const career = getCareerById(id ?? "");
  const { savedCareers, toggleSavedCareer } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>("Overview");

  const topPadding = Platform.OS === "web" ? 67 : 0;
  const isSaved = savedCareers.includes(id ?? "");

  if (!career) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.error, { color: colors.foreground }]}>Career not found</Text>
      </View>
    );
  }

  const matchScore = 85;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Orange Hero — full width */}
      <LinearGradient
        colors={["#FF6B00", "#FF9500"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: insets.top + topPadding + 12 }]}
      >
        {/* Top Row */}
        <View style={styles.heroTopRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.heroBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              toggleSavedCareer(career.id);
            }}
            style={styles.heroBtn}
          >
            <Ionicons
              name={isSaved ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"}
              size={22}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

        {/* Category Tag */}
        <View style={styles.categoryTag}>
          <Text style={styles.categoryText}>{career.category}</Text>
        </View>

        {/* Title */}
        <Text style={styles.heroTitle}>{career.title}</Text>

        {/* Salary / Growth / Match Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>₹{career.salaryMin}-{career.salaryMax} LPA</Text>
            <Text style={styles.statLabel}>Avg Salary</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{career.growth}</Text>
            <Text style={styles.statLabel}>Growth</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{matchScore}%</Text>
            <Text style={styles.statLabel}>Match</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Tab Bar */}
      <View style={[styles.tabBar, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        {TABS.map((tab) => {
          const active = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, active && styles.activeTab]}
            >
              {active ? (
                <LinearGradient
                  colors={["#FF6B00", "#FF9500"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.activeTabGradient}
                >
                  <Text style={[styles.tabText, styles.activeTabText]}>{tab}</Text>
                </LinearGradient>
              ) : (
                <Text style={[styles.tabText, { color: colors.mutedForeground }]}>{tab}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Tab Content */}
      <ScrollView
        contentContainerStyle={[
          styles.tabContent,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── OVERVIEW ── */}
        {activeTab === "Overview" && (
          <View style={styles.section}>
            <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>About This Career</Text>
              <Text style={[styles.body, { color: colors.mutedForeground }]}>{career.description}</Text>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Top Companies in India</Text>
            <View style={styles.chips}>
              {career.companies.map((c) => (
                <SkillBadge key={c} label={c} variant="default" />
              ))}
            </View>

            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Work Environment</Text>
            <View style={styles.chips}>
              {career.workEnvironments.map((e) => (
                <SkillBadge key={e} label={e} variant="primary" />
              ))}
            </View>

            <View style={[styles.demandRow, { backgroundColor: "#20CF8C11", borderColor: "#20CF8C33" }]}>
              <Ionicons name="trending-up" size={20} color="#20CF8C" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.demandTitle, { color: colors.foreground }]}>India Demand: {career.indiaDemand}</Text>
                <Text style={[styles.demandSub, { color: colors.mutedForeground }]}>
                  Remote available: {career.remoteAvailable ? "Yes" : "Limited"}
                </Text>
              </View>
            </View>

            {/* Eligibility Test CTA */}
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push(`/career/test/${career.id}`);
              }}
              style={styles.eligibilityBtn}
            >
              <LinearGradient
                colors={["#6B5BFF", "#9B5BFF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.eligibilityBtnGrad}
              >
                <Ionicons name="clipboard" size={20} color="#fff" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.eligibilityBtnTitle}>Take Eligibility Test</Text>
                  <Text style={styles.eligibilityBtnSub}>20 AI-generated questions · 5 min</Text>
                </View>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>

            <GradientButton
              title="General Career Assessment"
              onPress={() => router.push("/assessment")}
              size="lg"
              style={{ marginTop: 4 }}
            />
          </View>
        )}

        {/* ── GROWTH ── */}
        {activeTab === "Growth" && (
          <View style={styles.section}>
            {/* Salary Hero */}
            <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Salary Overview</Text>
              <Text style={[styles.salaryBig, { color: colors.primary }]}>
                ₹{career.salaryMin} – ₹{career.salaryMax} LPA
              </Text>
              <Text style={[styles.body, { color: colors.mutedForeground }]}>Annual salary range in India (2024–25)</Text>
            </View>

            {/* ── CHART 1: Vertical Column Chart – Salary Progression ── */}
            <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border, gap: 0 }]}>
              <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 16 }]}>Salary Progression</Text>
              <Text style={{ fontSize: 11, fontFamily: "Poppins_400Regular", color: colors.mutedForeground, marginBottom: 12 }}>₹ in Lakhs Per Annum</Text>
              {(() => {
                const stages = [
                  { shortLabel: "Entry\n0–2yr", salary: career.salaryMin, color: "#6B5BFF" },
                  { shortLabel: "Mid\n3–5yr", salary: Math.round(career.salaryMin * 1.6), color: "#FF9500" },
                  { shortLabel: "Senior\n6–9yr", salary: Math.round(career.salaryMax * 0.72), color: "#20CF8C" },
                  { shortLabel: "Lead\n10+yr", salary: career.salaryMax, color: "#FF6B00" },
                ];
                const maxSal = career.salaryMax;
                const maxBarH = 110;
                return (
                  <View>
                    <View style={{ flexDirection: "row", alignItems: "flex-end", height: maxBarH + 44, gap: 10 }}>
                      {stages.map((s) => {
                        const h = Math.max(18, Math.round((s.salary / maxSal) * maxBarH));
                        return (
                          <View key={s.shortLabel} style={{ flex: 1, alignItems: "center", justifyContent: "flex-end", height: maxBarH + 44 }}>
                            <Text style={{ fontSize: 11, fontFamily: "Poppins_700Bold", color: s.color, marginBottom: 4 }}>₹{s.salary}L</Text>
                            <LinearGradient
                              colors={[s.color, s.color + "88"]}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 0, y: 1 }}
                              style={{ width: "100%", height: h, borderRadius: 8, borderBottomLeftRadius: 3, borderBottomRightRadius: 3 }}
                            />
                          </View>
                        );
                      })}
                    </View>
                    {/* X-axis baseline */}
                    <View style={{ height: 1, backgroundColor: colors.border, marginBottom: 8 }} />
                    <View style={{ flexDirection: "row", gap: 10 }}>
                      {stages.map((s) => (
                        <Text key={s.shortLabel} style={{ flex: 1, fontSize: 10, fontFamily: "Poppins_400Regular", color: colors.mutedForeground, textAlign: "center", lineHeight: 14 }}>
                          {s.shortLabel}
                        </Text>
                      ))}
                    </View>
                  </View>
                );
              })()}
            </View>

            {/* ── CHART 2: Lollipop / Dot-on-Track – Market Demand ── */}
            <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border, gap: 16 }]}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Market Demand Indicators</Text>
              {[
                { label: "Job Openings", val: Math.min(98, career.growthPct + 15), icon: "briefcase-outline" as const },
                { label: "Salary Growth", val: Math.min(98, career.growthPct), icon: "trending-up-outline" as const },
                { label: "India Demand", val: career.indiaDemand === "Very High" ? 92 : career.indiaDemand === "High" ? 74 : career.indiaDemand === "Moderate" ? 52 : 35, icon: "flag-outline" as const },
                { label: "Remote Work", val: career.remoteAvailable ? 78 : 32, icon: "laptop-outline" as const },
                { label: "Job Security", val: Math.max(30, 95 - career.aiSuitability / 2), icon: "shield-checkmark-outline" as const },
              ].map((item) => {
                const color = item.val >= 70 ? "#20CF8C" : item.val >= 45 ? "#FF9500" : "#FF4B4B";
                const v = Math.round(item.val);
                return (
                  <View key={item.label} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: color + "18", alignItems: "center", justifyContent: "center" }}>
                      <Ionicons name={item.icon} size={13} color={color} />
                    </View>
                    <Text style={{ fontSize: 12, fontFamily: "Poppins_500Medium", color: colors.foreground, width: 90 }}>{item.label}</Text>
                    {/* Lollipop track */}
                    <View style={{ flex: 1, height: 20, justifyContent: "center" }}>
                      {/* Track */}
                      <View style={{ height: 2, backgroundColor: colors.border, borderRadius: 1 }} />
                      {/* Filled portion */}
                      <View style={{ position: "absolute", left: 0, width: `${v}%`, height: 2, backgroundColor: color + "55", borderRadius: 1 }} />
                      {/* Dot */}
                      <View style={{ position: "absolute", left: `${v}%`, marginLeft: -9, width: 18, height: 18, borderRadius: 9, backgroundColor: color, borderWidth: 2.5, borderColor: colors.card, alignItems: "center", justifyContent: "center" }} />
                    </View>
                    <Text style={{ fontSize: 12, fontFamily: "Poppins_700Bold", color, width: 36, textAlign: "right" }}>{v}%</Text>
                  </View>
                );
              })}
            </View>

            {/* ── CHART 3: Horizontal Scrolling Milestone Cards – Career Journey ── */}
            <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border, gap: 0, paddingHorizontal: 0, overflow: "hidden" }]}>
              <Text style={[styles.sectionTitle, { color: colors.foreground, paddingHorizontal: 16, marginBottom: 14, marginTop: 4 }]}>Career Journey</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, gap: 0, flexDirection: "row", alignItems: "stretch" }}>
                {[
                  { year: "0–2 yrs", title: "Junior", salary: `₹${career.salaryMin}L`, icon: "school-outline" as const, color: "#6B5BFF", desc: "Learn core tools, build portfolio, work under seniors" },
                  { year: "3–5 yrs", title: "Mid-Level", salary: `₹${Math.round(career.salaryMin * 1.6)}L`, icon: "briefcase-outline" as const, color: "#FF9500", desc: "Lead features, mentor juniors, take ownership" },
                  { year: "6–9 yrs", title: "Senior", salary: `₹${Math.round(career.salaryMax * 0.72)}L`, icon: "star-outline" as const, color: "#20CF8C", desc: "Domain expert, cross-team impact, architecture" },
                  { year: "10+ yrs", title: "Lead / Director", salary: `₹${career.salaryMax}L`, icon: "rocket-outline" as const, color: "#FF6B00", desc: "Strategic vision, executive decisions, top pay" },
                ].map((m, idx, arr) => (
                  <View key={m.title} style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={{ width: 150, borderRadius: 14, borderWidth: 1.5, borderColor: m.color + "55", backgroundColor: m.color + "0D", padding: 14, gap: 8 }}>
                      <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: m.color + "22", alignItems: "center", justifyContent: "center" }}>
                        <Ionicons name={m.icon} size={18} color={m.color} />
                      </View>
                      <Text style={{ fontSize: 10, fontFamily: "Poppins_600SemiBold", color: m.color, backgroundColor: m.color + "18", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, alignSelf: "flex-start" }}>{m.year}</Text>
                      <Text style={{ fontSize: 14, fontFamily: "Poppins_700Bold", color: colors.foreground }}>{m.title}</Text>
                      <Text style={{ fontSize: 11, fontFamily: "Poppins_400Regular", color: colors.mutedForeground, lineHeight: 16 }}>{m.desc}</Text>
                      <Text style={{ fontSize: 16, fontFamily: "Poppins_700Bold", color: m.color }}>{m.salary} PA</Text>
                    </View>
                    {idx < arr.length - 1 && (
                      <View style={{ alignItems: "center", paddingHorizontal: 6 }}>
                        <Ionicons name="chevron-forward" size={20} color={colors.border} />
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>
            </View>

            <View style={[styles.growthCard, { backgroundColor: "#FF6B0011", borderColor: "#FF6B0033" }]}>
              <Ionicons name="rocket" size={22} color={colors.primary} />
              <Text style={[styles.growthCardText, { color: colors.foreground }]}>
                {career.growth} annual growth — India demand: {career.indiaDemand}
              </Text>
            </View>

            <View style={[styles.aiCard, { backgroundColor: "#6B5BFF11", borderColor: "#6B5BFF33" }]}>
              <Ionicons name="sparkles" size={20} color="#6B5BFF" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.aiTitle, { color: colors.foreground }]}>AI Suitability: {career.aiSuitability}%</Text>
                <View style={{ height: 8, backgroundColor: colors.border + "88", borderRadius: 4, overflow: "hidden", marginTop: 8 }}>
                  <View style={{ height: "100%", width: `${career.aiSuitability}%`, borderRadius: 4, backgroundColor: "#6B5BFF" }} />
                </View>
                <Text style={[styles.aiSub, { color: colors.mutedForeground }]}>
                  AI tools will significantly enhance (not replace) your work in this career.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* ── SKILLS ── */}
        {activeTab === "Skills" && (
          <View style={styles.section}>

            {/* ── CHART 4: Bubble / Circle Pack – Skill Importance ── */}
            <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border, gap: 12 }]}>
              <View style={{ gap: 4 }}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Skill Importance</Text>
                <Text style={{ fontSize: 12, fontFamily: "Poppins_400Regular", color: colors.mutedForeground }}>Bubble size = importance level</Text>
              </View>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center", paddingVertical: 6 }}>
                {career.skills.slice(0, 8).map((skill, idx) => {
                  const palette = ["#FF6B00", "#6B5BFF", "#20CF8C", "#FF9500", "#00BFFF", "#FF4B4B", "#FFD700", "#C084FC"];
                  const color = palette[idx % palette.length];
                  const pct = Math.max(42, 96 - idx * 7);
                  const size = Math.round(52 + (pct - 42) / 54 * 42);
                  return (
                    <View
                      key={skill}
                      style={{
                        width: size, height: size, borderRadius: size / 2,
                        backgroundColor: color + "1A",
                        borderWidth: 2, borderColor: color + "66",
                        alignItems: "center", justifyContent: "center",
                        padding: 4,
                      }}
                    >
                      <Text style={{ fontSize: size > 74 ? 12 : 10, fontFamily: "Poppins_700Bold", color, textAlign: "center", lineHeight: size > 74 ? 16 : 14 }} numberOfLines={2}>{skill}</Text>
                      <Text style={{ fontSize: 10, fontFamily: "Poppins_600SemiBold", color }}>{pct}%</Text>
                    </View>
                  );
                })}
              </View>
              {/* Legend */}
              <View style={{ flexDirection: "row", justifyContent: "center", gap: 16 }}>
                {[["Must Have", "#FF6B00"], ["Important", "#FF9500"], ["Nice to Have", "#6B5BFF"]].map(([l, c]) => (
                  <View key={l} style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c }} />
                    <Text style={{ fontSize: 10, fontFamily: "Poppins_400Regular", color: colors.mutedForeground }}>{l}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* ── CHART 5: Waffle / Tile Grid – Learning Difficulty ── */}
            <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border, gap: 14 }]}>
              <View style={{ gap: 4 }}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Learning Difficulty</Text>
                <Text style={{ fontSize: 12, fontFamily: "Poppins_400Regular", color: colors.mutedForeground }}>Filled tiles = difficulty out of 10</Text>
              </View>
              {career.skills.slice(0, 6).map((skill, idx) => {
                const levels = [3, 5, 8, 10, 5, 8];
                const labels = ["Beginner", "Easy", "Advanced", "Expert", "Easy", "Advanced"];
                const tileColors = ["#20CF8C", "#20CF8C", "#FF9500", "#FF4B4B", "#20CF8C", "#FF9500"];
                const filled = levels[idx % 6];
                const tileColor = tileColors[idx % 6];
                return (
                  <View key={skill} style={{ gap: 6 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <Text style={{ fontSize: 13, fontFamily: "Poppins_500Medium", color: colors.foreground }}>{skill}</Text>
                      <Text style={{ fontSize: 11, fontFamily: "Poppins_700Bold", color: tileColor, backgroundColor: tileColor + "18", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>{labels[idx % 6]}</Text>
                    </View>
                    <View style={{ flexDirection: "row", gap: 4 }}>
                      {Array.from({ length: 10 }, (_, i) => (
                        <View
                          key={i}
                          style={{
                            flex: 1, height: 14, borderRadius: 3,
                            backgroundColor: i < filled ? tileColor : colors.border,
                            opacity: i < filled ? 1 : 0.4,
                          }}
                        />
                      ))}
                    </View>
                  </View>
                );
              })}
            </View>

            {/* ── CHART 6: Radial Spoke – Competency Profile ── */}
            <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border, gap: 14, alignItems: "center" }]}>
              <View style={{ gap: 4, alignSelf: "stretch" }}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Competency Profile</Text>
                <Text style={{ fontSize: 12, fontFamily: "Poppins_400Regular", color: colors.mutedForeground }}>5-axis skill radar</Text>
              </View>
              {(() => {
                const dims = [
                  { label: "Technical", pct: Math.min(95, career.aiSuitability + 10), color: "#6B5BFF", angle: -90 },
                  { label: "Analytical", pct: career.indiaDemand === "Very High" ? 88 : 72, color: "#20CF8C", angle: -18 },
                  { label: "Communication", pct: 68, color: "#FF9500", angle: 54 },
                  { label: "Problem Solving", pct: 82, color: "#FF6B00", angle: 126 },
                  { label: "Domain Know.", pct: 90, color: "#00BFFF", angle: 198 },
                ];
                const CX = 100, CY = 100, MAX_R = 80;
                const toRad = (deg: number) => (deg * Math.PI) / 180;
                const pts = dims.map(d => ({
                  ...d,
                  x: CX + Math.cos(toRad(d.angle)) * ((d.pct / 100) * MAX_R),
                  y: CY + Math.sin(toRad(d.angle)) * ((d.pct / 100) * MAX_R),
                  gx: CX + Math.cos(toRad(d.angle)) * MAX_R * 1.22,
                  gy: CY + Math.sin(toRad(d.angle)) * MAX_R * 1.22,
                }));
                return (
                  <View style={{ width: 200, height: 200, alignSelf: "center" }}>
                    {/* Background rings */}
                    {[0.25, 0.5, 0.75, 1.0].map((r) => {
                      const s = MAX_R * 2 * r;
                      return (
                        <View key={r} style={{ position: "absolute", width: s, height: s, borderRadius: s / 2, borderWidth: 1, borderColor: colors.border + "66", left: CX - s / 2, top: CY - s / 2 }} />
                      );
                    })}
                    {/* Spoke lines */}
                    {pts.map((p) => (
                      <View key={p.label + "line"} style={{ position: "absolute", left: CX, top: CY - 1, width: MAX_R, height: 2, backgroundColor: colors.border + "55", transformOrigin: "0 50%", transform: [{ rotate: `${p.angle + 90}deg` }] }} />
                    ))}
                    {/* Filled spoke bars */}
                    {pts.map((p) => {
                      const len = (p.pct / 100) * MAX_R;
                      return (
                        <View key={p.label + "bar"} style={{ position: "absolute", left: CX, top: CY - 3, width: len, height: 6, backgroundColor: p.color, borderRadius: 3, transformOrigin: "0 50%", transform: [{ rotate: `${p.angle + 90}deg` }] }} />
                      );
                    })}
                    {/* End dots */}
                    {pts.map((p) => (
                      <View key={p.label + "dot"} style={{ position: "absolute", width: 12, height: 12, borderRadius: 6, backgroundColor: p.color, borderWidth: 2, borderColor: colors.card, left: p.x - 6, top: p.y - 6 }} />
                    ))}
                    {/* Center */}
                    <View style={{ position: "absolute", width: 10, height: 10, borderRadius: 5, backgroundColor: colors.foreground, left: CX - 5, top: CY - 5 }} />
                  </View>
                );
              })()}
              {/* Legend */}
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center", alignSelf: "stretch" }}>
                {[
                  { label: "Technical", pct: Math.min(95, career.aiSuitability + 10), color: "#6B5BFF" },
                  { label: "Analytical", pct: career.indiaDemand === "Very High" ? 88 : 72, color: "#20CF8C" },
                  { label: "Communication", pct: 68, color: "#FF9500" },
                  { label: "Problem Solving", pct: 82, color: "#FF6B00" },
                  { label: "Domain Know.", pct: 90, color: "#00BFFF" },
                ].map((d) => (
                  <View key={d.label} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: d.color }} />
                    <Text style={{ fontSize: 11, fontFamily: "Poppins_400Regular", color: colors.mutedForeground }}>{d.label}</Text>
                    <Text style={{ fontSize: 11, fontFamily: "Poppins_700Bold", color: d.color }}>{d.pct}%</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* All Skills Chips */}
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Required Skills</Text>
            <View style={styles.chips}>
              {career.skills.map((s) => (
                <SkillBadge key={s} label={s} variant="primary" />
              ))}
            </View>

            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Domain Interests</Text>
            <View style={styles.chips}>
              {career.interests.map((i) => (
                <SkillBadge key={i} label={i} variant="success" />
              ))}
            </View>

            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Career Goals Fit</Text>
            <View style={styles.chips}>
              {career.goalMatch.map((g) => (
                <SkillBadge key={g} label={g} variant="default" />
              ))}
            </View>

            <View style={[styles.aiCard, { backgroundColor: "#FF6B0011", borderColor: "#FF6B0033" }]}>
              <Ionicons name="sparkles" size={20} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.aiTitle, { color: colors.foreground }]}>AI Suitability Score: {career.aiSuitability}%</Text>
                <View style={{ height: 8, backgroundColor: colors.border + "88", borderRadius: 4, overflow: "hidden", marginTop: 8 }}>
                  <View style={{ height: "100%", width: `${career.aiSuitability}%`, borderRadius: 4, backgroundColor: "#FF6B00" }} />
                </View>
                <Text style={[styles.aiSub, { color: colors.mutedForeground }]}>
                  AI tools will significantly boost your productivity in this career.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* ── ROADMAP ── */}
        {activeTab === "Roadmap" && (
          <View style={styles.section}>
            <Text style={[styles.body, { color: colors.mutedForeground }]}>
              Follow this step-by-step path to become a {career.title}. Tap any link to start learning.
            </Text>
            {career.roadmap.map((level, idx) => (
              <RoadmapCard key={level.level} level={level} idx={idx} colors={colors} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function RoadmapCard({
  level,
  idx,
  colors,
}: {
  level: ReturnType<typeof getCareerById> extends undefined ? never : NonNullable<ReturnType<typeof getCareerById>>["roadmap"][0];
  idx: number;
  colors: ReturnType<typeof useColors>;
}) {
  const levelColors = ["#20CF8C", "#FF9500", "#6B5BFF"];
  const color = levelColors[idx % levelColors.length];

  return (
    <View style={[styles.roadmapCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.roadmapHeader}>
        <View style={[styles.levelBadge, { backgroundColor: color + "22" }]}>
          <Text style={[styles.levelBadgeText, { color }]}>{level.level}</Text>
        </View>
        <View style={[styles.durationTag, { backgroundColor: colors.border }]}>
          <Ionicons name="time-outline" size={12} color={colors.mutedForeground} />
          <Text style={[styles.durationText, { color: colors.mutedForeground }]}>{level.duration}</Text>
        </View>
      </View>

      {/* Title */}
      <Text style={[styles.roadmapTitle, { color }]}>{level.title}</Text>

      {/* Topics */}
      <View style={styles.topicsList}>
        {level.topics.map((t) => (
          <View key={t} style={styles.topicRow}>
            <View style={[styles.topicDot, { backgroundColor: color }]} />
            <Text style={[styles.topicText, { color: colors.foreground }]}>{t}</Text>
          </View>
        ))}
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* Resources — clickable links */}
      <Text style={[styles.resourcesLabel, { color: colors.mutedForeground }]}>Study Resources</Text>
      <View style={styles.resourcesList}>
        {level.resources.map((r) => (
          <ResourceLink key={r.url} resource={r} color={color} colors={colors} />
        ))}
      </View>
    </View>
  );
}

function ResourceLink({
  resource,
  color,
  colors,
}: {
  resource: RoadmapResource;
  color: string;
  colors: ReturnType<typeof useColors>;
}) {
  const handlePress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const supported = await Linking.canOpenURL(resource.url);
      if (supported) {
        await Linking.openURL(resource.url);
      }
    } catch {
      await Linking.openURL(resource.url);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={[styles.resourceLink, { backgroundColor: color + "11", borderColor: color + "33" }]}
    >
      <Ionicons name="open-outline" size={14} color={color} />
      <Text style={[styles.resourceText, { color }]} numberOfLines={1}>
        {resource.label}
      </Text>
    </TouchableOpacity>
  );
}

function SalaryRow({
  label,
  min,
  max,
  colors,
}: {
  label: string;
  min: number;
  max: number;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={[styles.salaryRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.salaryRowLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.salaryRowValue, { color: colors.foreground }]}>₹{min}–{max} LPA</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  error: { textAlign: "center", marginTop: 60, fontSize: 16, fontFamily: "Poppins_400Regular" },

  hero: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    gap: 12,
  },
  heroTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  heroBtn: {
    width: 42,
    height: 42,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryTag: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 4,
  },
  categoryText: { fontSize: 12, fontFamily: "Poppins_500Medium", color: "#fff" },
  heroTitle: {
    fontSize: 26,
    fontFamily: "Poppins_700Bold",
    color: "#fff",
    lineHeight: 34,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 16, fontFamily: "Poppins_700Bold", color: "#fff" },
  statLabel: { fontSize: 11, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.75)", marginTop: 2 },
  statDivider: { width: 1, height: 36, backgroundColor: "rgba(255,255,255,0.3)" },

  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  activeTab: {},
  activeTabGradient: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tabText: { fontSize: 13, fontFamily: "Poppins_600SemiBold" },
  activeTabText: { color: "#fff" },

  tabContent: { padding: 20 },
  section: { gap: 16 },

  infoCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  sectionTitle: { fontSize: 17, fontFamily: "Poppins_700Bold" },
  body: { fontSize: 14, fontFamily: "Poppins_400Regular", lineHeight: 22 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },

  demandRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  demandTitle: { fontSize: 14, fontFamily: "Poppins_600SemiBold" },
  demandSub: { fontSize: 12, fontFamily: "Poppins_400Regular", marginTop: 2 },

  salaryBig: { fontSize: 30, fontFamily: "Poppins_700Bold" },
  salaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  salaryRowLabel: { fontSize: 13, fontFamily: "Poppins_400Regular" },
  salaryRowValue: { fontSize: 15, fontFamily: "Poppins_600SemiBold" },
  growthCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  growthCardText: { fontSize: 14, fontFamily: "Poppins_500Medium", flex: 1 },
  aiCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  aiTitle: { fontSize: 14, fontFamily: "Poppins_600SemiBold" },
  aiSub: { fontSize: 13, fontFamily: "Poppins_400Regular", lineHeight: 20, marginTop: 4 },

  roadmapCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    gap: 12,
  },
  roadmapHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  levelBadgeText: { fontSize: 12, fontFamily: "Poppins_700Bold" },
  durationTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  durationText: { fontSize: 11, fontFamily: "Poppins_400Regular" },
  roadmapTitle: { fontSize: 16, fontFamily: "Poppins_700Bold" },
  topicsList: { gap: 8 },
  topicRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  topicDot: { width: 7, height: 7, borderRadius: 4, flexShrink: 0 },
  topicText: { fontSize: 13, fontFamily: "Poppins_400Regular", flex: 1 },
  divider: { height: 1, marginVertical: 4 },
  resourcesLabel: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  resourcesList: { gap: 8 },
  resourceLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  resourceText: {
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
    flex: 1,
  },
  eligibilityBtn: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 4,
  },
  eligibilityBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  eligibilityBtnTitle: {
    fontSize: 15,
    fontFamily: "Poppins_700Bold",
    color: "#fff",
  },
  eligibilityBtnSub: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.8)",
    marginTop: 1,
  },
});
