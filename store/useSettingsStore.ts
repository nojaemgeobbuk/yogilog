import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type AsanaNameLanguage = "sanskrit" | "korean";

interface SettingsState {
  // 용어 표기 설정
  asanaNameLanguage: AsanaNameLanguage;
  setAsanaNameLanguage: (language: AsanaNameLanguage) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      asanaNameLanguage: "sanskrit",
      setAsanaNameLanguage: (language) => set({ asanaNameLanguage: language }),
    }),
    {
      name: "yogilog-settings",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
