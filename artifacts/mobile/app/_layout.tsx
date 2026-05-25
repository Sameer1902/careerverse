import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { Ionicons } from "@expo/vector-icons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import Head from "expo-router/head";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider } from "@/context/AppContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="assessment/index" options={{ headerShown: false }} />
      <Stack.Screen name="assessment/[step]" options={{ headerShown: false }} />
      <Stack.Screen name="assessment/results" options={{ headerShown: false }} />
      <Stack.Screen name="career/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="chatbot" options={{ headerShown: false }} />
      <Stack.Screen name="resume" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    ...Ionicons.font,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <Head>
        <title>CareerVerse — AI Career Guidance for India</title>
        <meta name="description" content="AI-powered career guidance for Indian students and young professionals. Take a free assessment, explore 100+ careers, compare salaries, connect with mentors, and get your personalised roadmap." />
        <meta name="keywords" content="career guidance India, career assessment, AI career counselor, career after 12th, career options India, IIT JEE careers, NEET careers, salary India, career roadmap" />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#FF6B00" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="CareerVerse — AI Career Guidance for India" />
        <meta property="og:description" content="AI-powered career guidance for Indian students and young professionals. Explore 100+ careers, get salary insights, and connect with mentors." />
        <meta property="og:site_name" content="CareerVerse" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="CareerVerse — AI Career Guidance for India" />
        <meta name="twitter:description" content="AI-powered career guidance for Indian students and young professionals. Explore 100+ careers, get salary insights, and connect with mentors." />
        <link rel="canonical" href="https://careerverse.replit.app" />
      </Head>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AppProvider>
            <GestureHandlerRootView>
              <KeyboardProvider>
                <RootLayoutNav />
              </KeyboardProvider>
            </GestureHandlerRootView>
          </AppProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
