import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CAREERS } from "@/data/careers";
import { useColors } from "@/hooks/useColors";

interface QuestionResult {
  question: string;
  correctIndex: number;
  difficulty: "easy" | "medium" | "hard";
  explanation: string;
  points: number;
}

const RESOURCES_BY_CATEGORY: Record<string, Array<{ label: string; url: string; platform: string; free: boolean }>> = {
  Technology: [
    { label: "CS50 - Introduction to Computer Science", url: "https://www.edx.org/cs50", platform: "edX", free: true },
    { label: "Full Stack Web Development", url: "https://www.freecodecamp.org", platform: "freeCodeCamp", free: true },
    { label: "Python for Everybody", url: "https://www.coursera.org/specializations/python", platform: "Coursera", free: false },
    { label: "Data Structures & Algorithms", url: "https://www.youtube.com/watch?v=8hly31xKli0", platform: "YouTube", free: true },
    { label: "NPTEL Programming Courses", url: "https://nptel.ac.in/courses/106", platform: "NPTEL", free: true },
    { label: "GeeksforGeeks Practice", url: "https://www.geeksforgeeks.org", platform: "GeeksforGeeks", free: true },
  ],
  Healthcare: [
    { label: "Human Anatomy & Physiology", url: "https://www.khanacademy.org/science/health-and-medicine", platform: "Khan Academy", free: true },
    { label: "Healthcare Data Science", url: "https://www.coursera.org/learn/healthcare-data-analytics", platform: "Coursera", free: false },
    { label: "AIIMS Online Courses", url: "https://www.aiimsonline.in", platform: "AIIMS", free: true },
    { label: "Medical Terminology Basics", url: "https://www.youtube.com/watch?v=GKyDPzlcfO8", platform: "YouTube", free: true },
  ],
  Finance: [
    { label: "Financial Markets (Yale)", url: "https://www.coursera.org/learn/financial-markets-global", platform: "Coursera", free: false },
    { label: "CA Foundation Prep", url: "https://www.icai.org/new_post.html?post_id=15657", platform: "ICAI", free: true },
    { label: "Stock Market Basics", url: "https://www.youtube.com/watch?v=WEDIj9JBTC8", platform: "YouTube", free: true },
    { label: "Accounting Basics", url: "https://www.khanacademy.org/economics-finance-domain/core-finance", platform: "Khan Academy", free: true },
  ],
  Law: [
    { label: "Introduction to Law (Yale)", url: "https://www.coursera.org/learn/introduction-to-law", platform: "Coursera", free: false },
    { label: "Indian Constitution & Laws", url: "https://www.youtube.com/watch?v=JrSWtbKwJ_c", platform: "YouTube", free: true },
    { label: "CLAT Preparation", url: "https://www.khanacademy.org/test-prep/lsat", platform: "Khan Academy", free: true },
  ],
  Engineering: [
    { label: "Engineering Mathematics", url: "https://nptel.ac.in/courses/111", platform: "NPTEL", free: true },
    { label: "CAD/CAM Fundamentals", url: "https://www.youtube.com/watch?v=bsOE7PVHQ3M", platform: "YouTube", free: true },
    { label: "MIT OpenCourseWare Engineering", url: "https://ocw.mit.edu/courses/engineering", platform: "MIT OCW", free: true },
  ],
  Business: [
    { label: "Business Fundamentals (Google)", url: "https://grow.google/intl/en_in/", platform: "Google", free: true },
    { label: "Entrepreneurship Specialisation", url: "https://www.coursera.org/specializations/wharton-entrepreneurship", platform: "Coursera", free: false },
    { label: "Marketing Analytics", url: "https://www.youtube.com/watch?v=lDEU_-3URxo", platform: "YouTube", free: true },
  ],
};

function getResources(category: string) {
  return RESOURCES_BY_CATEGORY[category] || RESOURCES_BY_CATEGORY["Technology"];
}

const PASS_THRESHOLD = 60;
const BORDERLINE_THRESHOLD = 40;

type ScoreTier = "pass" | "borderline" | "fail";

function getScoreTier(pct: number): ScoreTier {
  if (pct >= PASS_THRESHOLD) return "pass";
  if (pct >= BORDERLINE_THRESHOLD) return "borderline";
  return "fail";
}

export default function TestResultsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    id: string;
    careerTitle: string;
    category: string;
    userLevel: string;
    earned: string;
    total: string;
    answers: string;
    questions: string;
  }>();

  const topPadding = Platform.OS === "web" ? 67 : 0;

  const earned = parseInt(params.earned || "0");
  const total = parseInt(params.total || "190");
  const percentage = total > 0 ? Math.round((earned / total) * 100) : 0;
  const tier = getScoreTier(percentage);
  const passed = tier === "pass";
  const careerTitle = params.careerTitle || "This Career";
  const category = params.category || "Technology";
  const userLevel = params.userLevel || "beginner";

  const questions: QuestionResult[] = (() => {
    try { return JSON.parse(params.questions || "[]"); } catch { return []; }
  })();
  const answers: number[] = (() => {
    try { return JSON.parse(params.answers || "[]"); } catch { return []; }
  })();

  const scoreAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (passed) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    Animated.parallel([
      Animated.timing(scoreAnim, { toValue: percentage / 100, duration: 1200, useNativeDriver: false }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  const easyQ = questions.filter(q => q.difficulty === "easy");
  const medQ = questions.filter(q => q.difficulty === "medium");
  const hardQ = questions.filter(q => q.difficulty === "hard");

  const easyCorrect = easyQ.filter((q) => {
    const globalIdx = questions.indexOf(q);
    return answers[globalIdx] === q.correctIndex;
  }).length;
  const medCorrect = medQ.filter((q) => {
    const globalIdx = questions.indexOf(q);
    return answers[globalIdx] === q.correctIndex;
  }).length;
  const hardCorrect = hardQ.filter((q) => {
    const globalIdx = questions.indexOf(q);
    return answers[globalIdx] === q.correctIndex;
  }).length;

  const resources = getResources(category);
  const freeResources = resources.filter(r => r.free);
  const paidResources = resources.filter(r => !r.free);

  const suggestedCareers = CAREERS.filter(c =>
    c.id !== params.id &&
    (c.category === category || c.category.includes(category.split(" ")[0])) &&
    c.riskLevel !== "high"
  ).slice(0, 3);

  const getLevelLabel = () => {
    if (percentage >= 85) return "Expert Ready";
    if (percentage >= 70) return "Job Ready";
    if (percentage >= PASS_THRESHOLD) return "Eligible";
    if (percentage >= BORDERLINE_THRESHOLD) return "Needs Prep";
    return "Not Ready Yet";
  };

  const getScoreColor = () => {
    if (percentage >= PASS_THRESHOLD) return "#20CF8C";
    if (percentage >= BORDERLINE_THRESHOLD) return "#FF9500";
    return "#FF4B4B";
  };

  const getBannerConfig = () => {
    if (tier === "pass") {
      return {
        icon: "checkmark-circle" as const,
        color: "#20CF8C",
        bgColor: "#20CF8C22",
        borderColor: "#20CF8C55",
        title: "You are eligible for this career!",
        subtitle: `You scored ${earned}/${total} points — great work!`,
      };
    }
    if (tier === "borderline") {
      return {
        icon: "time" as const,
        color: "#FF9500",
        bgColor: "#FF950022",
        borderColor: "#FF950055",
        title: "Almost there — needs more preparation",
        subtitle: `You scored ${earned}/${total} points. You're close — study the weak areas and retake.`,
      };
    }
    return {
      icon: "close-circle" as const,
      color: "#FF4B4B",
      bgColor: "#FF4B4B22",
      borderColor: "#FF4B4B55",
      title: "Not ready for this career yet",
      subtitle: `You scored ${earned}/${total} points. Consider exploring similar careers or retake after studying.`,
    };
  };

  const banner = getBannerConfig();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: insets.top + topPadding,
        paddingBottom: insets.bottom + 40,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Result Card */}
      <LinearGradient
        colors={
          tier === "pass"
            ? ["#1B4332", "#20CF8C22"]
            : tier === "borderline"
            ? ["#2D1800", "#FF950022"]
            : ["#2D0000", "#FF4B4B22"]
        }
        style={styles.hero}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        {/* Score ring */}
        <View style={styles.scoreCircleWrap}>
          <View style={[styles.scoreCircle, { borderColor: getScoreColor() + "44" }]}>
            <Text style={[styles.scoreNum, { color: getScoreColor() }]}>{percentage}%</Text>
            <Text style={styles.scoreLabel}>{getLevelLabel()}</Text>
          </View>
        </View>

        {/* Result banner */}
        <View style={[styles.resultBanner, { backgroundColor: banner.bgColor, borderColor: banner.borderColor }]}>
          <Ionicons name={banner.icon} size={24} color={banner.color} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.bannerTitle, { color: banner.color }]}>
              {banner.title}
            </Text>
            <Text style={styles.bannerSub}>{banner.subtitle}</Text>
          </View>
        </View>
      </LinearGradient>

      <Animated.View style={{ opacity: fadeAnim, paddingHorizontal: 20, gap: 20, marginTop: 20 }}>

        {/* Score Progress Bar */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Career Readiness Score</Text>
          <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
            <Animated.View
              style={[styles.progressFill, {
                backgroundColor: getScoreColor(),
                width: scoreAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }),
              }]}
            />
          </View>
          <View style={styles.thresholdRow}>
            <Text style={[styles.thresholdLabel, { color: "#FF4B4B" }]}>Not Ready (0–39%)</Text>
            <Text style={[styles.thresholdMid, { color: "#FF9500" }]}>Near (40–59%)</Text>
            <Text style={[styles.thresholdLabel, { color: "#20CF8C" }]}>Pass (60%+)</Text>
          </View>
        </View>

        {/* Difficulty breakdown */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Performance Breakdown</Text>
          <DiffRow label="Easy" correct={easyCorrect} total={easyQ.length} color="#20CF8C" />
          <DiffRow label="Medium" correct={medCorrect} total={medQ.length} color="#FF9500" />
          <DiffRow label="Hard" correct={hardCorrect} total={hardQ.length} color="#FF4B4B" />
        </View>

        {/* Result-specific advice */}
        {tier === "pass" && (
          <View style={[styles.card, { backgroundColor: "#20CF8C12", borderColor: "#20CF8C44" }]}>
            <Text style={[styles.cardTitle, { color: "#20CF8C" }]}>What This Means for You</Text>
            {userLevel === "beginner" ? (
              <>
                <InfoRow icon="checkmark-circle" color="#20CF8C" text={`You show strong aptitude for ${careerTitle}`} />
                <InfoRow icon="checkmark-circle" color="#20CF8C" text="Your curiosity and mindset match this career's needs" />
                <InfoRow icon="school" color="#20CF8C" text="Start with beginner-friendly courses below to build your foundation" />
              </>
            ) : (
              <>
                <InfoRow icon="checkmark-circle" color="#20CF8C" text={`You have solid domain knowledge for ${careerTitle}`} />
                <InfoRow icon="briefcase" color="#20CF8C" text="You are interview-ready for entry to mid-level positions" />
                <InfoRow icon="trophy" color="#20CF8C" text="Build projects and certifications to stand out from the crowd" />
              </>
            )}
          </View>
        )}

        {tier === "borderline" && (
          <View style={[styles.card, { backgroundColor: "#FF950012", borderColor: "#FF950044" }]}>
            <Text style={[styles.cardTitle, { color: "#FF9500" }]}>You're Close — Keep Going</Text>
            <InfoRow icon="arrow-up-circle" color="#FF9500" text="You have some foundation, but need to strengthen core concepts" />
            {medCorrect < 3 && (
              <InfoRow icon="alert-circle" color="#FF9500" text="Focus on medium-difficulty topics — these are your main gap" />
            )}
            <InfoRow icon="book" color="#FF9500" text="Study the free resources below for 2–4 weeks, then retake" />
            <InfoRow icon="refresh" color="#FF9500" text="A retake after focused study could push you above the 60% pass mark" />
          </View>
        )}

        {tier === "fail" && (
          <View style={[styles.card, { backgroundColor: "#FF4B4B12", borderColor: "#FF4B4B44" }]}>
            <Text style={[styles.cardTitle, { color: "#FF4B4B" }]}>Honest Assessment</Text>
            <InfoRow icon="alert-circle" color="#FF4B4B" text={`Your current knowledge is far from what ${careerTitle} requires`} />
            <InfoRow icon="compass" color="#FF9500" text="You may be a better fit for a related career — explore suggestions below" />
            <InfoRow icon="book" color="#FF9500" text="If you still want this career, start from basics using the free resources" />
            <InfoRow icon="refresh" color="#FF9500" text="Retake only after completing at least one beginner course in this field" />
          </View>
        )}

        {/* Suggested Careers (only shown when score is low) */}
        {(tier === "fail" || tier === "borderline") && suggestedCareers.length > 0 && (
          <View style={{ gap: 12 }}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              {tier === "fail" ? "Explore Related Careers Instead" : "Alternative Careers to Consider"}
            </Text>
            <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
              {tier === "fail"
                ? "These careers share similar skills and may be a better starting point"
                : "Keep these as backup options while you prepare for your target"}
            </Text>
            {suggestedCareers.map((career) => (
              <TouchableOpacity
                key={career.id}
                onPress={() => router.push(`/career/${career.id}`)}
                style={[styles.suggestCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={styles.suggestLeft}>
                  <Text style={[styles.suggestTitle, { color: colors.foreground }]}>{career.title}</Text>
                  <Text style={[styles.suggestMeta, { color: colors.mutedForeground }]}>
                    {career.category} · ₹{career.salaryMin}–{career.salaryMax} LPA · {career.growth} growth
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Retake CTA — prominent for fail/borderline */}
        {(tier === "fail" || tier === "borderline") && (
          <TouchableOpacity
            onPress={() => router.replace(`/career/test/${params.id}`)}
            style={styles.retakeBtn}
          >
            <LinearGradient
              colors={tier === "borderline" ? ["#FF6B00", "#FF9500"] : ["#3A3A5C", "#2A2A4C"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.retakeBtnGrad}
            >
              <Ionicons name="refresh" size={18} color="#fff" />
              <Text style={styles.retakeBtnText}>
                {tier === "borderline" ? "Retake Test — You Can Pass!" : "Retake After Studying"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Free Resources */}
        <View style={{ gap: 12 }}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Free Study Resources</Text>
            <View style={[styles.freePill, { backgroundColor: "#20CF8C22" }]}>
              <Text style={[styles.freePillText, { color: "#20CF8C" }]}>Free</Text>
            </View>
          </View>
          {freeResources.map((r) => (
            <ResourceCard key={r.url} resource={r} colors={colors} />
          ))}
        </View>

        {paidResources.length > 0 && (
          <View style={{ gap: 12 }}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Certifications & Courses</Text>
            </View>
            {paidResources.map((r) => (
              <ResourceCard key={r.url} resource={r} colors={colors} />
            ))}
          </View>
        )}

        {/* Recommended next steps */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Recommended Next Steps</Text>
          {tier === "pass" ? (
            <>
              <StepRow num={1} text={`Build 2–3 projects related to ${careerTitle}`} color={colors.primary} />
              <StepRow num={2} text="Get a relevant certification from the list above" color={colors.primary} />
              <StepRow num={3} text="Apply for internships on LinkedIn, Internshala, or Naukri" color={colors.primary} />
              <StepRow num={4} text="Join communities (GitHub, Discord, LinkedIn groups)" color={colors.primary} />
            </>
          ) : tier === "borderline" ? (
            <>
              <StepRow num={1} text="Complete at least one free course from the resources above" color="#FF9500" />
              <StepRow num={2} text="Focus on medium and hard difficulty topics where you scored low" color="#FF9500" />
              <StepRow num={3} text={`Retake this eligibility test in 2–3 weeks`} color="#FF9500" />
              <StepRow num={4} text="Use the CareerBot to ask career-specific questions" color="#FF9500" />
            </>
          ) : (
            <>
              <StepRow num={1} text="Explore the suggested related careers above first" color="#FF4B4B" />
              <StepRow num={2} text="Start the free beginner course in this domain" color="#FF4B4B" />
              <StepRow num={3} text="Complete a beginner project to test your actual interest" color="#FF4B4B" />
              <StepRow num={4} text={`Retake this test only after 4–6 weeks of focused study`} color="#FF4B4B" />
            </>
          )}
        </View>

        {/* View roadmap button */}
        <TouchableOpacity
          onPress={() => router.push(`/career/${params.id}`)}
          style={[styles.primaryBtn, { backgroundColor: tier === "pass" ? colors.primary : colors.card, borderWidth: tier !== "pass" ? 1 : 0, borderColor: colors.border }]}
        >
          <Text style={[styles.primaryBtnText, { color: tier === "pass" ? "#fff" : colors.foreground }]}>View Career Roadmap</Text>
          <Ionicons name="map" size={18} color={tier === "pass" ? "#fff" : colors.foreground} />
        </TouchableOpacity>

        {/* Retake (secondary) for passed users */}
        {tier === "pass" && (
          <TouchableOpacity
            onPress={() => router.replace(`/career/test/${params.id}`)}
            style={[styles.secondaryBtn, { borderColor: colors.border }]}
          >
            <Ionicons name="refresh" size={16} color={colors.mutedForeground} />
            <Text style={[styles.secondaryBtnText, { color: colors.mutedForeground }]}>Retake to Improve Score</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </ScrollView>
  );
}

function DiffRow({ label, correct, total, color }: { label: string; correct: number; total: number; color: string }) {
  const colors = useColors();
  const pct = total > 0 ? (correct / total) * 100 : 0;
  return (
    <View style={styles.diffRow}>
      <View style={[styles.diffDot, { backgroundColor: color + "33" }]}>
        <Text style={[styles.diffDotText, { color }]}>{label[0]}</Text>
      </View>
      <Text style={[styles.diffLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <View style={[styles.diffTrack, { backgroundColor: colors.border, flex: 1 }]}>
        <View style={[styles.diffFill, { width: `${pct}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={[styles.diffScore, { color: colors.foreground }]}>{correct}/{total}</Text>
    </View>
  );
}

function InfoRow({ icon, color, text }: { icon: string; color: string; text: string }) {
  const colors = useColors();
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon as any} size={16} color={color} />
      <Text style={[styles.infoText, { color: colors.foreground }]}>{text}</Text>
    </View>
  );
}

function StepRow({ num, text, color }: { num: number; text: string; color: string }) {
  const colors = useColors();
  return (
    <View style={styles.stepRow}>
      <View style={[styles.stepNum, { backgroundColor: color + "22" }]}>
        <Text style={[styles.stepNumText, { color }]}>{num}</Text>
      </View>
      <Text style={[styles.stepText, { color: colors.foreground }]}>{text}</Text>
    </View>
  );
}

function ResourceCard({ resource, colors }: { resource: { label: string; url: string; platform: string; free: boolean }; colors: ReturnType<typeof useColors> }) {
  const platformColors: Record<string, string> = {
    "Coursera": "#0056D2", "NPTEL": "#E84C3D", "YouTube": "#FF0000",
    "edX": "#02262B", "freeCodeCamp": "#006400", "Khan Academy": "#14BF96",
    "GeeksforGeeks": "#2F8D46", "MIT OCW": "#A31F34", "ICAI": "#00275E",
    "AIIMS": "#C1121F", "Google": "#4285F4",
  };
  const pc = platformColors[resource.platform] || "#6B5BFF";

  return (
    <TouchableOpacity
      onPress={() => Linking.openURL(resource.url)}
      style={[styles.resourceCard, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={[styles.platformDot, { backgroundColor: pc }]} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.resourceLabel, { color: colors.foreground }]} numberOfLines={2}>{resource.label}</Text>
        <Text style={[styles.resourcePlatform, { color: pc }]}>{resource.platform} · {resource.free ? "Free" : "Paid"}</Text>
      </View>
      <Ionicons name="open-outline" size={16} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: { padding: 24, paddingBottom: 28, gap: 20 },
  backBtn: { width: 38, height: 38, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 19, alignItems: "center", justifyContent: "center", alignSelf: "flex-start" },
  scoreCircleWrap: { alignItems: "center", paddingVertical: 10 },
  scoreCircle: { width: 160, height: 160, borderRadius: 80, borderWidth: 4, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.3)" },
  scoreNum: { fontSize: 44, fontFamily: "Poppins_700Bold" },
  scoreLabel: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#ffffffCC" },
  resultBanner: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 16, borderRadius: 16, borderWidth: 1 },
  bannerTitle: { fontSize: 15, fontFamily: "Poppins_700Bold", lineHeight: 22 },
  bannerSub: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "#ffffffCC", marginTop: 2 },

  card: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  cardTitle: { fontSize: 15, fontFamily: "Poppins_700Bold" },

  progressTrack: { height: 10, borderRadius: 5, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 5 },
  thresholdRow: { flexDirection: "row", justifyContent: "space-between" },
  thresholdLabel: { fontSize: 10, fontFamily: "Poppins_400Regular" },
  thresholdMid: { fontSize: 10, fontFamily: "Poppins_600SemiBold" },

  diffRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  diffDot: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  diffDotText: { fontSize: 12, fontFamily: "Poppins_700Bold" },
  diffLabel: { fontSize: 13, fontFamily: "Poppins_500Medium", width: 55 },
  diffTrack: { height: 6, borderRadius: 3, overflow: "hidden" },
  diffFill: { height: "100%", borderRadius: 3 },
  diffScore: { fontSize: 13, fontFamily: "Poppins_600SemiBold", width: 32, textAlign: "right" },

  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  sectionTitle: { fontSize: 17, fontFamily: "Poppins_700Bold", flex: 1 },
  sectionSub: { fontSize: 12, fontFamily: "Poppins_400Regular", marginTop: -8 },
  freePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  freePillText: { fontSize: 11, fontFamily: "Poppins_700Bold" },

  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  infoText: { flex: 1, fontSize: 13, fontFamily: "Poppins_400Regular", lineHeight: 20 },

  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  stepNum: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  stepNumText: { fontSize: 14, fontFamily: "Poppins_700Bold" },
  stepText: { flex: 1, fontSize: 13, fontFamily: "Poppins_400Regular", lineHeight: 20, paddingTop: 4 },

  suggestCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  suggestLeft: { flex: 1, gap: 3 },
  suggestTitle: { fontSize: 14, fontFamily: "Poppins_600SemiBold" },
  suggestMeta: { fontSize: 12, fontFamily: "Poppins_400Regular" },

  retakeBtn: { borderRadius: 16, overflow: "hidden" },
  retakeBtnGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 18 },
  retakeBtnText: { fontSize: 16, fontFamily: "Poppins_700Bold", color: "#fff" },

  resourceCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  platformDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  resourceLabel: { fontSize: 13, fontFamily: "Poppins_500Medium", lineHeight: 18 },
  resourcePlatform: { fontSize: 11, fontFamily: "Poppins_600SemiBold", marginTop: 2 },

  primaryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16, borderRadius: 16 },
  primaryBtnText: { fontSize: 16, fontFamily: "Poppins_700Bold" },
  secondaryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 16, borderWidth: 1 },
  secondaryBtnText: { fontSize: 14, fontFamily: "Poppins_500Medium" },
});
