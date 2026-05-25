import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

interface AppContextValue {
  userName: string;
  setUserName: (name: string) => void;
  assessmentAnswers: Record<number, string | string[]>;
  setAssessmentAnswer: (step: number, answer: string | string[]) => void;
  assessmentCompleted: boolean;
  completeAssessment: () => void;
  resetAssessment: () => void;
  matchedCareerIds: string[];
  setMatchedCareerIds: (ids: string[]) => void;
  savedCareers: string[];
  toggleSavedCareer: (id: string) => void;
  streak: number;
  incrementStreak: () => void;
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (v: boolean) => void;
  resumeAnalyzed: boolean;
  setResumeAnalyzed: (v: boolean) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEY = "careerpath_state";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [userName, setUserNameState] = useState("Explorer");
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<number, string | string[]>>({});
  const [assessmentCompleted, setAssessmentCompleted] = useState(false);
  const [matchedCareerIds, setMatchedCareerIdsState] = useState<string[]>([]);
  const [savedCareers, setSavedCareers] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);
  const [hasSeenOnboarding, setHasSeenOnboardingState] = useState(false);
  const [resumeAnalyzed, setResumeAnalyzedState] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const data = JSON.parse(raw);
          if (data.userName) setUserNameState(data.userName);
          if (data.assessmentAnswers) setAssessmentAnswers(data.assessmentAnswers);
          if (data.assessmentCompleted) setAssessmentCompleted(data.assessmentCompleted);
          if (data.matchedCareerIds) setMatchedCareerIdsState(data.matchedCareerIds);
          if (data.savedCareers) setSavedCareers(data.savedCareers);
          if (data.streak) setStreak(data.streak);
          if (data.hasSeenOnboarding) setHasSeenOnboardingState(data.hasSeenOnboarding);
          if (data.resumeAnalyzed) setResumeAnalyzedState(data.resumeAnalyzed);
        }
      })
      .catch(() => {});
  }, []);

  const persist = useCallback(
    (updates: Partial<{
      userName: string;
      assessmentAnswers: Record<number, string | string[]>;
      assessmentCompleted: boolean;
      matchedCareerIds: string[];
      savedCareers: string[];
      streak: number;
      hasSeenOnboarding: boolean;
      resumeAnalyzed: boolean;
    }>) => {
      AsyncStorage.getItem(STORAGE_KEY)
        .then((raw) => {
          const existing = raw ? JSON.parse(raw) : {};
          return AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, ...updates }));
        })
        .catch(() => {});
    },
    []
  );

  const setUserName = useCallback(
    (name: string) => {
      setUserNameState(name);
      persist({ userName: name });
    },
    [persist]
  );

  const setAssessmentAnswer = useCallback(
    (step: number, answer: string | string[]) => {
      setAssessmentAnswers((prev) => {
        const next = { ...prev, [step]: answer };
        persist({ assessmentAnswers: next });
        return next;
      });
    },
    [persist]
  );

  const completeAssessment = useCallback(() => {
    setAssessmentCompleted(true);
    persist({ assessmentCompleted: true });
  }, [persist]);

  const resetAssessment = useCallback(() => {
    setAssessmentAnswers({});
    setAssessmentCompleted(false);
    setMatchedCareerIdsState([]);
    persist({ assessmentAnswers: {}, assessmentCompleted: false, matchedCareerIds: [] });
  }, [persist]);

  const setMatchedCareerIds = useCallback(
    (ids: string[]) => {
      setMatchedCareerIdsState(ids);
      persist({ matchedCareerIds: ids });
    },
    [persist]
  );

  const toggleSavedCareer = useCallback(
    (id: string) => {
      setSavedCareers((prev) => {
        const next = prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id];
        persist({ savedCareers: next });
        return next;
      });
    },
    [persist]
  );

  const incrementStreak = useCallback(() => {
    setStreak((prev) => {
      const next = prev + 1;
      persist({ streak: next });
      return next;
    });
  }, [persist]);

  const setHasSeenOnboarding = useCallback(
    (v: boolean) => {
      setHasSeenOnboardingState(v);
      persist({ hasSeenOnboarding: v });
    },
    [persist]
  );

  const setResumeAnalyzed = useCallback(
    (v: boolean) => {
      setResumeAnalyzedState(v);
      persist({ resumeAnalyzed: v });
    },
    [persist]
  );

  return (
    <AppContext.Provider
      value={{
        userName,
        setUserName,
        assessmentAnswers,
        setAssessmentAnswer,
        assessmentCompleted,
        completeAssessment,
        resetAssessment,
        matchedCareerIds,
        setMatchedCareerIds,
        savedCareers,
        toggleSavedCareer,
        streak,
        incrementStreak,
        hasSeenOnboarding,
        setHasSeenOnboarding,
        resumeAnalyzed,
        setResumeAnalyzed,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
