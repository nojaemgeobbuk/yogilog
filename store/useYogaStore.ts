import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { YogaSession, YogaStore } from "@/types";

export const useYogaStore = create<YogaStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      _hasHydrated: false,

      addSession: (sessionData) => {
        const newSession: YogaSession = {
          ...sessionData,
          id: Crypto.randomUUID(),
        };
        set((state) => ({
          sessions: [newSession, ...state.sessions],
        }));
      },

      updateSession: (id, updates) => {
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === id ? { ...session, ...updates } : session
          ),
        }));
      },

      deleteSession: (id) => {
        set((state) => ({
          sessions: state.sessions.filter((session) => session.id !== id),
        }));
      },

      getSession: (id) => {
        return get().sessions.find((session) => session.id === id);
      },
    }),
    {
      name: "yogilog-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state, error) => {
        // 성공이든 실패든 hydration 완료로 표시
        useYogaStore.setState({ _hasHydrated: true });
      },
      partialize: (state) => ({
        sessions: state.sessions,
      }),
    }
  )
);
