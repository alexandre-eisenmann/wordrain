import { create } from "zustand";
import { GameVariation, getVariation, getAllVariations, isValidVariation } from "../variations";

interface VariationState {
  currentVariation: GameVariation;
  availableVariations: GameVariation[];
  
  // Actions
  setVariation: (variationId: string) => void;
  getCurrentVariation: () => GameVariation;
  getAvailableVariations: () => GameVariation[];
  initializeFromURL: () => void;
}

export const useVariation = create<VariationState>((set, get) => ({
  currentVariation: getVariation('classic'),
  availableVariations: getAllVariations(),
  
  setVariation: (variationId: string) => {
    if (isValidVariation(variationId)) {
      const variation = getVariation(variationId);
      set({ currentVariation: variation });
      console.log(`🎮 Variation changed to: ${variation.name} (${variation.id})`);
    } else {
      console.warn(`⚠️ Invalid variation ID: ${variationId}, using classic`);
      set({ currentVariation: getVariation('classic') });
    }
  },
  
  getCurrentVariation: () => {
    return get().currentVariation;
  },
  
  getAvailableVariations: () => {
    return get().availableVariations;
  },
  
  initializeFromURL: () => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const variationMatch = path.match(/\/wordrain\/([^\/]+)/);
      if (variationMatch) {
        const variationId = variationMatch[1];
        if (isValidVariation(variationId)) {
          get().setVariation(variationId);
        }
      }
    }
  },
}));

// Initialize variation from URL on mount
if (typeof window !== 'undefined') {
  // Small delay to ensure the store is ready
  setTimeout(() => {
    useVariation.getState().initializeFromURL();
  }, 0);
} 