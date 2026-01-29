import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { SequenceBuilderStore, SequenceAsanaItem, UserSequence } from "@/types";

export const useSequenceBuilderStore = create<SequenceBuilderStore>()(
  persist(
    (set, get) => ({
      currentBuildingAsanas: [],
      savedSequences: [],
      favoriteAsanas: [],
      _hasHydrated: false,

      // ==================== 현재 빌더 액션 ====================

      addAsana: (asanaName: string) => {
        const newItem: SequenceAsanaItem = {
          itemId: Crypto.randomUUID(),
          asanaName,
        };
        set((state) => ({
          currentBuildingAsanas: [...state.currentBuildingAsanas, newItem],
        }));
      },

      removeAsana: (itemId: string) => {
        set((state) => ({
          currentBuildingAsanas: state.currentBuildingAsanas.filter(
            (item) => item.itemId !== itemId
          ),
        }));
      },

      reorderAsanas: (asanas: SequenceAsanaItem[]) => {
        set({ currentBuildingAsanas: asanas });
      },

      clearCurrentBuild: () => {
        set({ currentBuildingAsanas: [] });
      },

      // ==================== 시퀀스 저장/관리 ====================

      saveSequence: (name: string) => {
        const { currentBuildingAsanas } = get();
        const now = new Date().toISOString();

        const newSequence: UserSequence = {
          id: Crypto.randomUUID(),
          name,
          asanas: [...currentBuildingAsanas],
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          savedSequences: [newSequence, ...state.savedSequences],
          currentBuildingAsanas: [], // 저장 후 빌더 초기화
        }));

        return newSequence;
      },

      deleteSequence: (sequenceId: string) => {
        set((state) => ({
          savedSequences: state.savedSequences.filter(
            (seq) => seq.id !== sequenceId
          ),
        }));
      },

      updateSequence: (sequenceId: string, updates) => {
        set((state) => ({
          savedSequences: state.savedSequences.map((seq) =>
            seq.id === sequenceId
              ? { ...seq, ...updates, updatedAt: new Date().toISOString() }
              : seq
          ),
        }));
      },

      loadSequenceToBuilder: (sequenceId: string) => {
        const sequence = get().savedSequences.find(
          (seq) => seq.id === sequenceId
        );
        if (sequence) {
          // 새로운 itemId를 부여하여 로드 (기존 시퀀스와 독립적으로 편집 가능)
          const loadedAsanas: SequenceAsanaItem[] = sequence.asanas.map(
            (asana) => ({
              itemId: Crypto.randomUUID(),
              asanaName: asana.asanaName,
            })
          );
          set({ currentBuildingAsanas: loadedAsanas });
        }
      },

      // ==================== 즐겨찾기 ====================

      toggleFavoriteAsana: (asanaName: string) => {
        set((state) => {
          const isFavorite = state.favoriteAsanas.includes(asanaName);
          return {
            favoriteAsanas: isFavorite
              ? state.favoriteAsanas.filter((name) => name !== asanaName)
              : [...state.favoriteAsanas, asanaName],
          };
        });
      },

      isFavoriteAsana: (asanaName: string) => {
        return get().favoriteAsanas.includes(asanaName);
      },
    }),
    {
      name: "yogilog-sequences",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        useSequenceBuilderStore.setState({ _hasHydrated: true });
      },
      partialize: (state) => ({
        savedSequences: state.savedSequences,
        favoriteAsanas: state.favoriteAsanas,
        // currentBuildingAsanas는 저장하지 않음 (임시 상태)
      }),
    }
  )
);
