import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { YogaSession, YogaStore, AsanaRecord } from "@/types";
import { checkAchievements } from "@/utils/achievements";

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
      unlockedBadgeIds: [],
      newlyUnlockedBadgeIds: [],
      _hasHydrated: false,

      addSession: (sessionData) => {
        const newSession: YogaSession = {
          ...sessionData,
          id: Crypto.randomUUID(),
          isFavorite: false, // 새 세션의 즐겨찾기 초기값
        };
        set((state) => ({
          sessions: [newSession, ...state.sessions],
        }));

        // 세션 추가 후 배지 확인
        const newBadges = get().checkAndUnlockBadges();
        return newBadges;
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
        // 즐겨찾기 변경 후 배지 확인
        get().checkAndUnlockBadges();
      },

      unlockBadge: (badgeId) => {
        set((state) => {
          if (state.unlockedBadgeIds.includes(badgeId)) {
            return state; // 이미 획득한 배지
          }
          return {
            unlockedBadgeIds: [...state.unlockedBadgeIds, badgeId],
            newlyUnlockedBadgeIds: [...state.newlyUnlockedBadgeIds, badgeId],
          };
        });
      },

      clearNewlyUnlockedBadges: () => {
        set({ newlyUnlockedBadgeIds: [] });
      },

      checkAndUnlockBadges: () => {
        const { sessions, unlockedBadgeIds } = get();
        const newBadgeIds = checkAchievements(sessions, unlockedBadgeIds);

        if (newBadgeIds.length > 0) {
          set((state) => ({
            unlockedBadgeIds: [...state.unlockedBadgeIds, ...newBadgeIds],
            newlyUnlockedBadgeIds: [...state.newlyUnlockedBadgeIds, ...newBadgeIds],
          }));
        }

        return newBadgeIds;
      },
    }),
    {
      name: "yogilog-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state, error) => {
        if (state?.sessions) {
          // 기존 세션 마이그레이션: isFavorite + asanas 형식 변환
          const migratedSessions = state.sessions.map((session) => ({
            ...session,
            isFavorite: session.isFavorite ?? false,
            asanas: migrateAsanas(session.asanas),
          }));
          useYogaStore.setState({ sessions: migratedSessions });
        }
        // 성공이든 실패든 hydration 완료로 표시
        useYogaStore.setState({ _hasHydrated: true });
      },
      partialize: (state) => ({
        sessions: state.sessions,
        unlockedBadgeIds: state.unlockedBadgeIds,
      }),
    }
  )
);
