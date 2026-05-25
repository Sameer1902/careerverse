import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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

import { GradientButton } from "@/components/GradientButton";
import { SkillBadge } from "@/components/SkillBadge";
import { useColors } from "@/hooks/useColors";

type AnalysisState = "idle" | "loading" | "done" | "error";

interface CourseLink { title: string; platform: string; url: string }
interface CareerMatch {
  title: string;
  matchScore: number;
  salary: string;
  demand: string;
  category: string;
  icon: string;
  reasonForMatch: string;
  missingSkills: string[];
  topCourses: CourseLink[];
  topCompanies: string[];
}
interface ResumeAnalysis {
  atsScore: number;
  summary: string;
  extractedData: {
    name: string;
    skills: string[];
    education: string[];
    experience: string[];
    certifications: string[];
    projects: string[];
    softSkills: string[];
    interests: string[];
  };
  analysis: {
    strengths: string[];
    weaknesses: string[];
    missingSkills: string[];
    improvements: string[];
  };
  careerMatches: CareerMatch[];
  industryTrends: {
    topHiringCompanies: string[];
    demandOutlook: string;
    avgSalaryRange: string;
    growthRate: string;
  };
}

const ANALYSIS_STEPS = [
  { icon: "cloud-upload", label: "Uploading your resume..." },
  { icon: "document-text", label: "Reading document content..." },
  { icon: "search", label: "Extracting skills & experience..." },
  { icon: "briefcase", label: "Matching to Indian careers..." },
  { icon: "sparkles", label: "Generating AI insights..." },
];

function getDemandColor(demand: string) {
  if (demand === "Very High") return "#20CF8C";
  if (demand === "High") return "#6B5BFF";
  if (demand === "Moderate") return "#FF9500";
  return "#888";
}

function getAtsColor(score: number) {
  if (score >= 75) return "#20CF8C";
  if (score >= 50) return "#FF9500";
  return "#FF4B4B";
}

function getAtsLabel(score: number) {
  if (score >= 80) return "Excellent";
  if (score >= 65) return "Good";
  if (score >= 50) return "Average";
  return "Needs Work";
}

function getFileIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.endsWith(".pdf")) return "document-text";
  if (lower.endsWith(".doc") || lower.endsWith(".docx")) return "document";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png") || lower.endsWith(".webp")) return "image";
  return "document-attach";
}

function getPlatformColor(platform: string) {
  if (platform === "Coursera") return "#0056D2";
  if (platform === "NPTEL") return "#E84C3D";
  if (platform === "YouTube") return "#FF0000";
  if (platform === "edX") return "#02262B";
  if (platform === "Udemy") return "#A435F0";
  return "#6B5BFF";
}

export default function ResumeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [state, setState] = useState<AnalysisState>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedCareer, setSelectedCareer] = useState(0);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const atsAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const topPadding = Platform.OS === "web" ? 67 : 0;

  useEffect(() => {
    if (state === "loading") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [state]);

  useEffect(() => {
    if (state === "done" && analysis) {
      Animated.timing(atsAnim, {
        toValue: analysis.atsScore / 100,
        duration: 1200,
        useNativeDriver: false,
      }).start();
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    }
  }, [state, analysis]);

  const runStepAnimation = () => {
    let step = 0;
    const advance = () => {
      step++;
      if (step < ANALYSIS_STEPS.length) {
        setCurrentStep(step);
        setTimeout(advance, step === ANALYSIS_STEPS.length - 1 ? 3000 : 1800);
      }
    };
    setTimeout(advance, 1800);
  };

  const handleUpload = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      if (Platform.OS === "web") {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp";
        input.style.display = "none";
        document.body.appendChild(input);
        input.onchange = async (e: Event) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          document.body.removeChild(input);
          if (!file) return;
          setFileName(file.name);
          setState("loading");
          setCurrentStep(0);
          runStepAnimation();
          await analyzeResumeWeb(file);
        };
        input.oncancel = () => {
          document.body.removeChild(input);
        };
        input.click();
        return;
      }

      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/webp",
          "*/*",
        ],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      setFileName(asset.name);
      setState("loading");
      setCurrentStep(0);
      runStepAnimation();
      await analyzeResumeNative(asset.uri, asset.mimeType || "application/pdf", asset.name);
    } catch {
      setState("error");
      setErrorMsg("Failed to pick file. Please try again.");
    }
  };

  const _doAnalysis = async (formData: FormData) => {
    const domain = process.env.EXPO_PUBLIC_DOMAIN;
    const apiUrl = `https://${domain}/api/resume/analyze`;
    const minLoadTime = new Promise((r) => setTimeout(r, 6000));
    const fetchPromise = fetch(apiUrl, { method: "POST", body: formData });
    const [res] = await Promise.all([fetchPromise, minLoadTime]);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Server error" }));
      throw new Error((err as { error?: string }).error || "Analysis failed");
    }
    return (await res.json()) as ResumeAnalysis;
  };

  const analyzeResumeWeb = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const data = await _doAnalysis(formData);
      setAnalysis(data);
      setState("done");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: unknown) {
      setState("error");
      setErrorMsg(err instanceof Error ? err.message : "Analysis failed");
    }
  };

  const analyzeResumeNative = async (uri: string, mime: string, name: string) => {
    try {
      const formData = new FormData();
      formData.append("file", { uri, type: mime, name } as unknown as Blob);
      const data = await _doAnalysis(formData);
      setAnalysis(data);
      setState("done");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: unknown) {
      setState("error");
      setErrorMsg(err instanceof Error ? err.message : "Analysis failed");
    }
  };

  const handleReset = () => {
    setState("idle");
    setFileName(null);
    setAnalysis(null);
    setErrorMsg("");
    setSelectedCareer(0);
    atsAnim.setValue(0);
    fadeAnim.setValue(0);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: insets.top + topPadding + 16,
        paddingBottom: insets.bottom + 60,
        paddingHorizontal: 20,
        gap: 0,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── HEADER ── */}
      <View style={[styles.header, { marginBottom: 24 }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Resume Analysis</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* ══════════════════════════════════════════
          IDLE STATE
      ══════════════════════════════════════════ */}
      {state === "idle" && (
        <>
          {/* Hero */}
          <View style={[styles.heroSection, { marginBottom: 24 }]}>
            <LinearGradient
              colors={["#6B5BFF", "#9B5BFF"]}
              style={styles.heroIconWrap}
            >
              <Ionicons name="sparkles" size={38} color="#fff" />
            </LinearGradient>
            <Text style={[styles.heroTitle, { color: colors.foreground }]}>
              AI Resume Analyzer
            </Text>
            <Text style={[styles.heroSubtitle, { color: colors.mutedForeground }]}>
              Upload your resume and get deep AI analysis — skills, career matches, ATS score, and a personalized roadmap for India's job market.
            </Text>
          </View>

          {/* Feature grid */}
          <View style={[styles.featureGrid, { marginBottom: 20 }]}>
            {[
              { icon: "trending-up", label: "ATS Score", sub: "Get rated 0-100", color: "#20CF8C" },
              { icon: "briefcase", label: "Career Matches", sub: "India-specific", color: "#6B5BFF" },
              { icon: "construct", label: "Skills Gap", sub: "What's missing", color: "#FF9500" },
              { icon: "school", label: "Courses", sub: "Real links", color: "#FF6B00" },
            ].map((f) => (
              <View
                key={f.label}
                style={[styles.featureTile, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={[styles.featureTileIcon, { backgroundColor: f.color + "22" }]}>
                  <Ionicons name={f.icon as any} size={20} color={f.color} />
                </View>
                <Text style={[styles.featureTileLabel, { color: colors.foreground }]}>{f.label}</Text>
                <Text style={[styles.featureTileSub, { color: colors.mutedForeground }]}>{f.sub}</Text>
              </View>
            ))}
          </View>

          {/* What AI extracts */}
          <View style={[styles.extractCard, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: 20 }]}>
            <Text style={[styles.extractTitle, { color: colors.foreground }]}>What AI Extracts</Text>
            <View style={styles.extractGrid}>
              {["Skills", "Education", "Experience", "Certifications", "Projects", "Soft Skills", "Interests", "Strengths"].map((item) => (
                <View key={item} style={[styles.extractBadge, { backgroundColor: "#6B5BFF18" }]}>
                  <Ionicons name="checkmark" size={11} color="#6B5BFF" />
                  <Text style={[styles.extractBadgeText, { color: "#6B5BFF" }]}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Format pills */}
          <View style={[styles.formatRow, { marginBottom: 24 }]}>
            {["PDF", "DOCX", "DOC", "JPG", "PNG"].map((fmt) => (
              <View key={fmt} style={[styles.formatPill, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.formatPillText, { color: colors.mutedForeground }]}>{fmt}</Text>
              </View>
            ))}
          </View>

          <GradientButton
            title="Upload Resume"
            onPress={handleUpload}
            size="lg"
            icon={<Ionicons name="cloud-upload" size={20} color="#fff" />}
          />
        </>
      )}

      {/* ══════════════════════════════════════════
          LOADING STATE
      ══════════════════════════════════════════ */}
      {state === "loading" && (
        <View style={styles.loadingCenter}>
          {/* Animated AI orb */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }], marginBottom: 32 }}>
            <LinearGradient
              colors={["#6B5BFF", "#9B5BFF", "#FF6B00"]}
              style={styles.aiOrb}
            >
              <Ionicons name="sparkles" size={44} color="#fff" />
            </LinearGradient>
          </Animated.View>

          <Text style={[styles.loadingTitle, { color: colors.foreground }]}>
            AI is analyzing your resume
          </Text>
          <Text style={[styles.loadingSubtitle, { color: colors.mutedForeground }]}>
            Matching against 50+ Indian career paths
          </Text>

          {/* Step indicators */}
          <View style={styles.stepsList}>
            {ANALYSIS_STEPS.map((step, i) => {
              const done = i < currentStep;
              const active = i === currentStep;
              return (
                <View key={step.label} style={styles.stepRow}>
                  <View
                    style={[
                      styles.stepDot,
                      done && { backgroundColor: "#20CF8C" },
                      active && { backgroundColor: "#6B5BFF" },
                      !done && !active && { backgroundColor: colors.border },
                    ]}
                  >
                    {done ? (
                      <Ionicons name="checkmark" size={12} color="#fff" />
                    ) : (
                      <Ionicons name={step.icon as any} size={12} color={active ? "#fff" : colors.mutedForeground} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      { color: done ? "#20CF8C" : active ? "#6B5BFF" : colors.mutedForeground },
                      active && { fontFamily: "Poppins_600SemiBold" },
                    ]}
                  >
                    {step.label}
                  </Text>
                </View>
              );
            })}
          </View>

          {fileName && (
            <View style={[styles.fileTag, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name={getFileIcon(fileName) as any} size={16} color="#6B5BFF" />
              <Text style={[styles.fileTagText, { color: colors.foreground }]} numberOfLines={1}>{fileName}</Text>
            </View>
          )}
        </View>
      )}

      {/* ══════════════════════════════════════════
          ERROR STATE
      ══════════════════════════════════════════ */}
      {state === "error" && (
        <View style={styles.errorCenter}>
          <View style={styles.errorIcon}>
            <Ionicons name="alert-circle" size={48} color="#FF4B4B" />
          </View>
          <Text style={[styles.errorTitle, { color: colors.foreground }]}>Analysis Failed</Text>
          <Text style={[styles.errorMsg, { color: colors.mutedForeground }]}>{errorMsg}</Text>
          <GradientButton title="Try Again" onPress={handleReset} size="md" />
        </View>
      )}

      {/* ══════════════════════════════════════════
          DONE STATE
      ══════════════════════════════════════════ */}
      {state === "done" && analysis && (
        <Animated.View style={{ opacity: fadeAnim, gap: 20 }}>
          {/* File tag */}
          {fileName && (
            <View style={[styles.analyzedBanner, { backgroundColor: "#20CF8C18", borderColor: "#20CF8C44" }]}>
              <Ionicons name={getFileIcon(fileName) as any} size={18} color="#20CF8C" />
              <Text style={[styles.analyzedName, { color: colors.foreground }]} numberOfLines={1}>{fileName}</Text>
              <View style={styles.analyzedPill}>
                <Ionicons name="checkmark-circle" size={13} color="#20CF8C" />
                <Text style={styles.analyzedPillText}>Analyzed</Text>
              </View>
            </View>
          )}

          {/* ── ATS SCORE ── */}
          <LinearGradient
            colors={["#1A1A2E", "#16213E"]}
            style={[styles.atsCard, { borderColor: colors.border }]}
          >
            <View style={styles.atsRow}>
              <View>
                <Text style={styles.atsTag}>ATS SCORE</Text>
                <Animated.Text
                  style={[styles.atsBigNum, { color: getAtsColor(analysis.atsScore) }]}
                >
                  {analysis.atsScore}
                  <Text style={styles.atsOutOf}>/100</Text>
                </Animated.Text>
                <View style={[styles.atsLabel, { backgroundColor: getAtsColor(analysis.atsScore) + "22" }]}>
                  <Text style={[styles.atsLabelText, { color: getAtsColor(analysis.atsScore) }]}>
                    {getAtsLabel(analysis.atsScore)}
                  </Text>
                </View>
              </View>
              <View style={styles.atsRightCol}>
                {analysis.extractedData.name && analysis.extractedData.name !== "Not specified" && (
                  <Text style={[styles.candidateName, { color: colors.foreground }]}>
                    {analysis.extractedData.name}
                  </Text>
                )}
                <View style={styles.miniStats}>
                  <MiniStat label="Skills" value={String(analysis.extractedData.skills.length)} />
                  <MiniStat label="Experience" value={String(analysis.extractedData.experience.length)} />
                  <MiniStat label="Matches" value={String(analysis.careerMatches.length)} />
                </View>
              </View>
            </View>
            <View style={[styles.atsTrack, { backgroundColor: "#ffffff18" }]}>
              <Animated.View
                style={[
                  styles.atsFill,
                  {
                    backgroundColor: getAtsColor(analysis.atsScore),
                    width: atsAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }),
                  },
                ]}
              />
            </View>
            <Text style={styles.atsSummary}>{analysis.summary}</Text>
          </LinearGradient>

          {/* ── CAREER MATCHES ── */}
          <View>
            <SectionHeader title="Career Matches" subtitle={`${analysis.careerMatches.length} roles matched`} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, paddingHorizontal: 20 }}>
              <View style={styles.careerCardsRow}>
                {analysis.careerMatches.map((career, i) => (
                  <TouchableOpacity
                    key={career.title}
                    onPress={() => { setSelectedCareer(i); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                    style={[
                      styles.careerCard,
                      { backgroundColor: colors.card, borderColor: selectedCareer === i ? "#6B5BFF" : colors.border },
                      selectedCareer === i && { borderWidth: 2 },
                    ]}
                  >
                    <View style={[styles.careerCardIcon, { backgroundColor: "#6B5BFF22" }]}>
                      <Ionicons name={career.icon as any || "briefcase"} size={22} color="#6B5BFF" />
                    </View>
                    <Text style={[styles.careerCardMatch, { color: getDemandColor(career.demand) }]}>
                      {career.matchScore}% match
                    </Text>
                    <Text style={[styles.careerCardTitle, { color: colors.foreground }]} numberOfLines={2}>
                      {career.title}
                    </Text>
                    <Text style={[styles.careerCardSalary, { color: colors.primary }]}>
                      {career.salary}
                    </Text>
                    <View style={[styles.demandBadge, { backgroundColor: getDemandColor(career.demand) + "22" }]}>
                      <Text style={[styles.demandText, { color: getDemandColor(career.demand) }]}>
                        {career.demand}
                      </Text>
                    </View>
                    {/* Match bar */}
                    <View style={[styles.careerMatchTrack, { backgroundColor: colors.border }]}>
                      <View style={[styles.careerMatchFill, { width: `${career.matchScore}%`, backgroundColor: getDemandColor(career.demand) }]} />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* ── SELECTED CAREER DETAIL ── */}
          {analysis.careerMatches[selectedCareer] && (
            <View style={[styles.careerDetail, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.careerDetailTitle, { color: colors.foreground }]}>
                {analysis.careerMatches[selectedCareer].title}
              </Text>
              <Text style={[styles.careerDetailReason, { color: colors.mutedForeground }]}>
                {analysis.careerMatches[selectedCareer].reasonForMatch}
              </Text>

              {analysis.careerMatches[selectedCareer].missingSkills?.length > 0 && (
                <View style={{ gap: 8 }}>
                  <Text style={[styles.subLabel, { color: colors.foreground }]}>Skills to Acquire</Text>
                  <View style={styles.chips}>
                    {analysis.careerMatches[selectedCareer].missingSkills.map((s) => (
                      <SkillBadge key={s} label={s} variant="warning" />
                    ))}
                  </View>
                </View>
              )}

              {analysis.careerMatches[selectedCareer].topCompanies?.length > 0 && (
                <View style={{ gap: 8 }}>
                  <Text style={[styles.subLabel, { color: colors.foreground }]}>Top Hiring Companies</Text>
                  <View style={styles.chips}>
                    {analysis.careerMatches[selectedCareer].topCompanies.map((c) => (
                      <View key={c} style={[styles.companyPill, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                        <Text style={[styles.companyPillText, { color: colors.foreground }]}>{c}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Recommended courses */}
              {analysis.careerMatches[selectedCareer].topCourses?.length > 0 && (
                <View style={{ gap: 10 }}>
                  <Text style={[styles.subLabel, { color: colors.foreground }]}>Recommended Courses</Text>
                  {analysis.careerMatches[selectedCareer].topCourses.map((course) => (
                    <TouchableOpacity
                      key={course.title}
                      onPress={() => course.url && Linking.openURL(course.url)}
                      style={[styles.courseCard, { backgroundColor: colors.background, borderColor: colors.border }]}
                    >
                      <View style={[styles.platformDot, { backgroundColor: getPlatformColor(course.platform) }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.courseTitle, { color: colors.foreground }]} numberOfLines={2}>
                          {course.title}
                        </Text>
                        <Text style={[styles.coursePlatform, { color: getPlatformColor(course.platform) }]}>
                          {course.platform}
                        </Text>
                      </View>
                      <Ionicons name="open-outline" size={16} color={colors.mutedForeground} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* ── DETECTED SKILLS ── */}
          {analysis.extractedData.skills.length > 0 && (
            <View style={{ gap: 12 }}>
              <SectionHeader title="Detected Skills" subtitle={`${analysis.extractedData.skills.length} skills found`} />
              <View style={styles.chips}>
                {analysis.extractedData.skills.map((s) => (
                  <SkillBadge key={s} label={s} variant="success" />
                ))}
              </View>
            </View>
          )}

          {/* ── SKILLS GAP ── */}
          {analysis.analysis.missingSkills.length > 0 && (
            <View style={{ gap: 12 }}>
              <SectionHeader title="Skills Gap" subtitle="Add these to stand out" />
              <View style={styles.chips}>
                {analysis.analysis.missingSkills.map((s) => (
                  <SkillBadge key={s} label={s} variant="warning" />
                ))}
              </View>
            </View>
          )}

          {/* ── STRENGTHS + WEAKNESSES ── */}
          <View style={{ gap: 12 }}>
            <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.infoCardTitle, { color: colors.foreground }]}>
                <Ionicons name="shield-checkmark" size={16} color="#20CF8C" /> Strengths
              </Text>
              {analysis.analysis.strengths.map((s) => (
                <BulletRow key={s} icon="checkmark-circle" color="#20CF8C" text={s} textColor={colors.mutedForeground} />
              ))}
            </View>

            <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.infoCardTitle, { color: colors.foreground }]}>
                <Ionicons name="arrow-up-circle" size={16} color={colors.primary} /> Improvements
              </Text>
              {analysis.analysis.improvements.map((s) => (
                <BulletRow key={s} icon="arrow-forward-circle" color={colors.primary} text={s} textColor={colors.mutedForeground} />
              ))}
            </View>
          </View>

          {/* ── EDUCATION + EXPERIENCE ── */}
          {(analysis.extractedData.education.length > 0 || analysis.extractedData.experience.length > 0) && (
            <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {analysis.extractedData.education.length > 0 && (
                <>
                  <Text style={[styles.infoCardTitle, { color: colors.foreground }]}>
                    <Ionicons name="school" size={16} color="#6B5BFF" /> Education
                  </Text>
                  {analysis.extractedData.education.map((e) => (
                    <BulletRow key={e} icon="school-outline" color="#6B5BFF" text={e} textColor={colors.mutedForeground} />
                  ))}
                </>
              )}
              {analysis.extractedData.experience.length > 0 && (
                <>
                  <Text style={[styles.infoCardTitle, { color: colors.foreground, marginTop: 12 }]}>
                    <Ionicons name="briefcase" size={16} color="#FF9500" /> Experience
                  </Text>
                  {analysis.extractedData.experience.map((e) => (
                    <BulletRow key={e} icon="briefcase-outline" color="#FF9500" text={e} textColor={colors.mutedForeground} />
                  ))}
                </>
              )}
            </View>
          )}

          {/* ── INDUSTRY TRENDS ── */}
          {analysis.industryTrends && (
            <View>
              <SectionHeader title="India Industry Trends" subtitle="Market outlook" />
              <LinearGradient
                colors={["#1A1A2E", "#16213E"]}
                style={[styles.trendsCard, { borderColor: "#6B5BFF44" }]}
              >
                <View style={styles.trendsGrid}>
                  <TrendStat label="Avg Salary" value={analysis.industryTrends.avgSalaryRange} color="#FF6B00" />
                  <TrendStat label="Growth Rate" value={analysis.industryTrends.growthRate} color="#20CF8C" />
                </View>
                <Text style={styles.trendsOutlook}>{analysis.industryTrends.demandOutlook}</Text>
                {analysis.industryTrends.topHiringCompanies?.length > 0 && (
                  <>
                    <Text style={styles.trendsCompaniesLabel}>Top Hiring Companies</Text>
                    <View style={styles.chips}>
                      {analysis.industryTrends.topHiringCompanies.map((c) => (
                        <View key={c} style={styles.trendCompanyPill}>
                          <Text style={styles.trendCompanyText}>{c}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                )}
              </LinearGradient>
            </View>
          )}

          {/* Reset */}
          <TouchableOpacity
            onPress={handleReset}
            style={[styles.resetBtn, { borderColor: colors.border }]}
          >
            <Ionicons name="refresh" size={16} color={colors.mutedForeground} />
            <Text style={[styles.resetText, { color: colors.mutedForeground }]}>Analyze a Different Resume</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </ScrollView>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.miniStatItem}>
      <Text style={styles.miniStatValue}>{value}</Text>
      <Text style={styles.miniStatLabel}>{label}</Text>
    </View>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const colors = useColors();
  return (
    <View style={[styles.sectionHeader, { marginBottom: 12 }]}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      {subtitle && <Text style={[styles.sectionSubtitle, { color: colors.mutedForeground }]}>{subtitle}</Text>}
    </View>
  );
}

function BulletRow({ icon, color, text, textColor }: { icon: string; color: string; text: string; textColor: string }) {
  return (
    <View style={styles.bulletRow}>
      <Ionicons name={icon as any} size={16} color={color} />
      <Text style={[styles.bulletText, { color: textColor }]}>{text}</Text>
    </View>
  );
}

function TrendStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.trendStat}>
      <Text style={[styles.trendStatValue, { color }]}>{value}</Text>
      <Text style={styles.trendStatLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerTitle: { fontSize: 18, fontFamily: "Poppins_700Bold" },

  heroSection: { alignItems: "center", gap: 14, paddingTop: 10 },
  heroIconWrap: { width: 88, height: 88, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  heroTitle: { fontSize: 26, fontFamily: "Poppins_700Bold", textAlign: "center" },
  heroSubtitle: { fontSize: 14, fontFamily: "Poppins_400Regular", textAlign: "center", lineHeight: 22 },

  featureGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  featureTile: {
    width: "47%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  featureTileIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  featureTileLabel: { fontSize: 13, fontFamily: "Poppins_600SemiBold", marginTop: 4 },
  featureTileSub: { fontSize: 11, fontFamily: "Poppins_400Regular" },

  extractCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  extractTitle: { fontSize: 14, fontFamily: "Poppins_600SemiBold" },
  extractGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  extractBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  extractBadgeText: { fontSize: 12, fontFamily: "Poppins_500Medium" },

  formatRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  formatPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  formatPillText: { fontSize: 12, fontFamily: "Poppins_600SemiBold" },

  loadingCenter: { alignItems: "center", paddingVertical: 40, gap: 16 },
  aiOrb: { width: 110, height: 110, borderRadius: 55, alignItems: "center", justifyContent: "center" },
  loadingTitle: { fontSize: 20, fontFamily: "Poppins_700Bold", textAlign: "center" },
  loadingSubtitle: { fontSize: 13, fontFamily: "Poppins_400Regular", textAlign: "center", opacity: 0.7 },
  stepsList: { gap: 12, width: "100%", marginTop: 8 },
  stepRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  stepDot: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  stepLabel: { fontSize: 14, fontFamily: "Poppins_400Regular" },
  fileTag: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1, marginTop: 8, maxWidth: 260,
  },
  fileTagText: { fontSize: 13, fontFamily: "Poppins_500Medium", flex: 1 },

  errorCenter: { alignItems: "center", paddingVertical: 60, gap: 16 },
  errorIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#FF4B4B22", alignItems: "center", justifyContent: "center" },
  errorTitle: { fontSize: 20, fontFamily: "Poppins_700Bold" },
  errorMsg: { fontSize: 14, fontFamily: "Poppins_400Regular", textAlign: "center" },

  analyzedBanner: {
    flexDirection: "row", alignItems: "center", gap: 10,
    padding: 12, borderRadius: 14, borderWidth: 1,
  },
  analyzedName: { flex: 1, fontSize: 13, fontFamily: "Poppins_500Medium" },
  analyzedPill: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#20CF8C22", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  analyzedPillText: { fontSize: 11, fontFamily: "Poppins_600SemiBold", color: "#20CF8C" },

  atsCard: { borderRadius: 20, borderWidth: 1, padding: 20, gap: 14 },
  atsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  atsTag: { fontSize: 11, fontFamily: "Poppins_600SemiBold", color: "#ffffff66", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 },
  atsBigNum: { fontSize: 52, fontFamily: "Poppins_700Bold", lineHeight: 58 },
  atsOutOf: { fontSize: 24, color: "#ffffff44" },
  atsLabel: { flexDirection: "row", alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginTop: 4 },
  atsLabelText: { fontSize: 12, fontFamily: "Poppins_600SemiBold" },
  atsRightCol: { alignItems: "flex-end", gap: 8 },
  candidateName: { fontSize: 14, fontFamily: "Poppins_600SemiBold", textAlign: "right" },
  miniStats: { flexDirection: "row", gap: 12 },
  miniStatItem: { alignItems: "center" },
  miniStatValue: { fontSize: 18, fontFamily: "Poppins_700Bold", color: "#fff" },
  miniStatLabel: { fontSize: 10, fontFamily: "Poppins_400Regular", color: "#ffffff66" },
  atsTrack: { height: 6, borderRadius: 3, overflow: "hidden" },
  atsFill: { height: "100%", borderRadius: 3 },
  atsSummary: { fontSize: 13, fontFamily: "Poppins_400Regular", color: "#ffffffCC", lineHeight: 20 },

  careerCardsRow: { flexDirection: "row", gap: 12, paddingRight: 20 },
  careerCard: {
    width: 160, borderRadius: 18, borderWidth: 1, padding: 14, gap: 8,
  },
  careerCardIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  careerCardMatch: { fontSize: 13, fontFamily: "Poppins_700Bold" },
  careerCardTitle: { fontSize: 13, fontFamily: "Poppins_600SemiBold", lineHeight: 18 },
  careerCardSalary: { fontSize: 12, fontFamily: "Poppins_600SemiBold" },
  demandBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, alignSelf: "flex-start" },
  demandText: { fontSize: 10, fontFamily: "Poppins_600SemiBold" },
  careerMatchTrack: { height: 4, borderRadius: 2, overflow: "hidden" },
  careerMatchFill: { height: "100%", borderRadius: 2 },

  careerDetail: { borderRadius: 18, borderWidth: 1, padding: 18, gap: 16 },
  careerDetailTitle: { fontSize: 18, fontFamily: "Poppins_700Bold" },
  careerDetailReason: { fontSize: 13, fontFamily: "Poppins_400Regular", lineHeight: 20 },
  subLabel: { fontSize: 13, fontFamily: "Poppins_600SemiBold" },
  companyPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  companyPillText: { fontSize: 12, fontFamily: "Poppins_500Medium" },
  courseCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 12, borderRadius: 12, borderWidth: 1,
  },
  platformDot: { width: 8, height: 8, borderRadius: 4 },
  courseTitle: { fontSize: 13, fontFamily: "Poppins_500Medium", lineHeight: 18 },
  coursePlatform: { fontSize: 11, fontFamily: "Poppins_600SemiBold", marginTop: 2 },

  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },

  sectionHeader: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" },
  sectionTitle: { fontSize: 17, fontFamily: "Poppins_700Bold" },
  sectionSubtitle: { fontSize: 12, fontFamily: "Poppins_400Regular" },

  infoCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 10 },
  infoCardTitle: { fontSize: 14, fontFamily: "Poppins_700Bold", marginBottom: 4 },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  bulletText: { fontSize: 13, fontFamily: "Poppins_400Regular", flex: 1, lineHeight: 20 },

  trendsCard: { borderRadius: 18, borderWidth: 1, padding: 18, gap: 14 },
  trendsGrid: { flexDirection: "row", gap: 24 },
  trendStat: { gap: 2 },
  trendStatValue: { fontSize: 20, fontFamily: "Poppins_700Bold" },
  trendStatLabel: { fontSize: 11, fontFamily: "Poppins_400Regular", color: "#ffffff88" },
  trendsOutlook: { fontSize: 13, fontFamily: "Poppins_400Regular", color: "#ffffffCC", lineHeight: 20 },
  trendsCompaniesLabel: { fontSize: 12, fontFamily: "Poppins_600SemiBold", color: "#ffffff88" },
  trendCompanyPill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, backgroundColor: "#ffffff18" },
  trendCompanyText: { fontSize: 11, fontFamily: "Poppins_500Medium", color: "#ffffffCC" },

  resetBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 16, borderWidth: 1, marginTop: 8 },
  resetText: { fontSize: 14, fontFamily: "Poppins_500Medium" },
});
