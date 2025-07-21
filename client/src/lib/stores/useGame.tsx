import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GamePhase = "ready" | "playing" | "ended";

interface GameState {
  phase: GamePhase;
  
  // Actions
  start: () => void;
  restart: () => void;
  end: () => void;
}

export const useGame = create<GameState>()(
  subscribeWithSelector((set) => ({
    phase: "ready",
    
    start: () => {
      // Set game start time for WPM calculation
      (window as any).gameStartTime = Date.now();
      set({ phase: "playing" });
    },
    
    restart: () => {
      // Reset game start time for WPM calculation
      (window as any).gameStartTime = Date.now();
      set({ phase: "playing" });
    },
    
    end: () => {
      set({ phase: "ended" });
    }
  }))
);
