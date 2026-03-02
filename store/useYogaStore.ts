import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { YogaSession, YogaStore, AsanaRecord } from "@/types";

// 기존 string[] 형태의 asanas를 AsanaRecord[]로 마이그레이션
function migrateAsanas(asanas: unknown): AsanaRecord[] {
  if (!Array.isArray(asanas)) return [];

  return asanas.map((asana) => {
    // 이미 AsanaRecord 형태인 경우
    if (typeof asana === "object" && asana !== null && "asanaId" in asana) {
      return asana as AsanaRecord;
    }
    // 기존 string 형태인 경우 변환
    if (typeof asana === "string") {
      return {
        asanaId: Crypto.randomUUID(),
        name: asana,
        note: "",
        status: undefined,
      };
    }
    // 알 수 없는 형태는 무시
    return null;
  }).filter((item): item is AsanaRecord => item !== null);
}

export const useYogaStore = create<YogaStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      _hasHydrated: false,

      addSession: (sessionData) => {
        const newSession: YogaSession = {
          ...sessionData,
          id: Crypto.randomUUID(),
          isFavorite: false,
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

      toggleFavorite: (id) => {
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === id
              ? { ...session, isFavorite: !session.isFavorite }
              : session
          ),
        }));
      },
    }),
    {
      name: "yogilog-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.sessions) {
          const migratedSessions = state.sessions.map((session) => ({
            ...session,
            isFavorite: session.isFavorite ?? false,
            asanas: migrateAsanas(session.asanas),
          }));
          useYogaStore.setState({ sessions: migratedSessions });
        }
        useYogaStore.setState({ _hasHydrated: true });
      },
      partialize: (state) => ({
        sessions: state.sessions,
      }),
    }
  )
);
