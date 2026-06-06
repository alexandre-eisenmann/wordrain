import { create } from "zustand";

// Lightweight user-preferences store, persisted to localStorage.
const STATS_KEY = "wordrain:showStats";

const readBool = (key: string): boolean => {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
};

const writeBool = (key: string, value: boolean) => {
  try {
    localStorage.setItem(key, value ? "1" : "0");
  } catch {
    /* ignore (private mode / unavailable storage) */
  }
};

interface SettingsState {
  showStats: boolean;
  toggleStats: () => void;
}

export const useSettings = create<SettingsState>((set, get) => ({
  showStats: readBool(STATS_KEY),
  toggleStats: () => {
    const next = !get().showStats;
    set({ showStats: next });
    writeBool(STATS_KEY, next);
  },
}));
