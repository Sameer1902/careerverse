import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import React, { useCallback, useRef, useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const SUGGESTIONS = [
  "Which career is best for me?",
  "How to become a Data Scientist?",
  "Best AI careers in India 2025",
  "How do I switch careers?",
  "Compare MBA vs Data Science",
];

const SYSTEM_PROMPT = `You are CareerBot, an expert AI career advisor specializing in Indian careers and the Indian job market. 
You help students and young professionals in India with:
- Career guidance and path recommendations
- Salary information (always in LPA - Lakhs Per Annum)
- Skill development roadmaps
- Job market trends in India
- Indian companies, startups, and opportunities
- Indian educational pathways (NEET, JEE, UPSC, CAT, CLAT etc.)
- Certification recommendations (Indian and international)

Keep responses concise, practical, and India-focused. Use rupee symbols (₹) for salaries. 
Be encouraging and realistic. If asked about specific careers, mention top companies in India hiring for that role.
Format lists with bullet points when appropriate. Keep responses under 300 words unless the user asks for detail.`;

async function callOpenAI(messages: Array<{ role: string; content: string }>): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || "";

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "Sorry, I couldn't generate a response. Please try again.";
}

export default function ChatbotScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Hi! I'm CareerBot, your AI career advisor powered by ChatGPT. Ask me anything about careers, salaries, skill paths, or how to achieve your career goals in India! 🚀",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const conversationHistory = useRef<Array<{ role: string; content: string }>>([
    { role: "system", content: SYSTEM_PROMPT },
  ]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isTyping) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [userMsg, ...prev]);
    setInput("");
    setIsTyping(true);

    conversationHistory.current.push({ role: "user", content: text });

    try {
      const responseText = await callOpenAI(conversationHistory.current);

      conversationHistory.current.push({ role: "assistant", content: responseText });

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [botMsg, ...prev]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: err?.message?.includes("401")
          ? "⚠️ Invalid API key. Please check your OpenAI API key in the app settings."
          : err?.message?.includes("429")
          ? "⚠️ Rate limit reached. Please wait a moment and try again."
          : "⚠️ Couldn't connect to ChatGPT. Please check your internet connection and try again.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [errorMsg, ...prev]);
      conversationHistory.current.pop();
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping]);

  const topPadding = Platform.OS === "web" ? 67 : 0;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  const renderMessage = useCallback(
    ({ item }: { item: Message }) => (
      <View style={[styles.msgRow, item.isUser ? styles.msgRowUser : styles.msgRowBot]}>
        {!item.isUser && (
          <View style={[styles.botAvatar, { backgroundColor: colors.primary }]}>
            <Ionicons name="sparkles" size={14} color="#fff" />
          </View>
        )}
        <View
          style={[
            styles.bubble,
            {
              backgroundColor: item.isUser ? colors.primary : colors.card,
              borderRadius: colors.radius,
              borderColor: item.isUser ? "transparent" : colors.border,
              maxWidth: "82%",
            },
          ]}
        >
          <Text
            style={[
              styles.bubbleText,
              { color: item.isUser ? "#fff" : colors.foreground },
            ]}
          >
            {item.text}
          </Text>
        </View>
      </View>
    ),
    [colors]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + topPadding + 12,
            borderBottomColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={[styles.botAvatarLg, { backgroundColor: colors.primary }]}>
            <Ionicons name="sparkles" size={18} color="#fff" />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>CareerBot AI</Text>
            <Text style={[styles.headerSub, { color: "#20CF8C" }]}>
              Powered by ChatGPT · Ready to help
            </Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          inverted
          contentContainerStyle={[styles.messageList, { paddingTop: 16 }]}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            isTyping ? (
              <View style={[styles.msgRow, styles.msgRowBot]}>
                <View style={[styles.botAvatar, { backgroundColor: colors.primary }]}>
                  <Ionicons name="sparkles" size={14} color="#fff" />
                </View>
                <View
                  style={[
                    styles.bubble,
                    styles.typingBubble,
                    { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
                  ]}
                >
                  <View style={styles.typingDots}>
                    <View style={[styles.dot, { backgroundColor: colors.mutedForeground }]} />
                    <View style={[styles.dot, { backgroundColor: colors.mutedForeground }]} />
                    <View style={[styles.dot, { backgroundColor: colors.mutedForeground }]} />
                  </View>
                </View>
              </View>
            ) : null
          }
        />

        {/* Suggestions */}
        {messages.length <= 2 && (
          <View style={[styles.suggestions, { paddingHorizontal: 16, paddingBottom: 8 }]}>
            <Text style={[styles.suggestionsLabel, { color: colors.mutedForeground }]}>
              Quick questions
            </Text>
            <View style={styles.suggestionsRow}>
              {SUGGESTIONS.slice(0, 3).map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setInput(s)}
                  style={[
                    styles.suggestionChip,
                    { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 20 },
                  ]}
                >
                  <Text style={[styles.suggestionText, { color: colors.foreground }]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Input */}
        <View
          style={[
            styles.inputRow,
            {
              borderTopColor: colors.border,
              backgroundColor: colors.background,
              paddingBottom: insets.bottom + bottomPadding + 8,
            },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                color: colors.foreground,
                borderColor: colors.border,
                borderRadius: 24,
              },
            ]}
            placeholder="Ask about careers, salaries, skills..."
            placeholderTextColor={colors.mutedForeground}
            value={input}
            onChangeText={setInput}
            multiline
            returnKeyType="send"
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity
            onPress={sendMessage}
            disabled={!input.trim() || isTyping}
            style={[
              styles.sendBtn,
              {
                backgroundColor: input.trim() && !isTyping ? colors.primary : colors.border,
                borderRadius: 24,
              },
            ]}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  headerCenter: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  botAvatarLg: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 16, fontFamily: "Poppins_700Bold" },
  headerSub: { fontSize: 11, fontFamily: "Poppins_400Regular" },
  messageList: { paddingHorizontal: 16, gap: 12, paddingBottom: 8 },
  msgRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  msgRowUser: { flexDirection: "row-reverse" },
  msgRowBot: {},
  botAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  bubble: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleText: { fontSize: 14, fontFamily: "Poppins_400Regular", lineHeight: 21 },
  typingBubble: { paddingVertical: 14 },
  typingDots: { flexDirection: "row", gap: 6, alignItems: "center" },
  dot: { width: 8, height: 8, borderRadius: 4 },
  suggestions: { gap: 8 },
  suggestionsLabel: { fontSize: 12, fontFamily: "Poppins_400Regular", paddingHorizontal: 4 },
  suggestionsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  suggestionChip: { paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1 },
  suggestionText: { fontSize: 12, fontFamily: "Poppins_500Medium" },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    borderWidth: 1,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});
