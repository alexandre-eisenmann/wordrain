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
      set((state) => {
        // Transition from ready or ended to playing
        if (state.phase === "ready" || state.phase === "ended") {
          console.log("Game started");
          return { phase: "playing" };
        }
        return {};
      });
    },
    
    restart: () => {
      console.log("Game restarted");
      set(() => ({ phase: "ready" }));
    },
    
    end: () => {
      set((state) => {
        // Only transition from playing to ended
        if (state.phase === "playing") {
          return { phase: "ended" };
        }
        return {};
      });
    }
  }))
);
