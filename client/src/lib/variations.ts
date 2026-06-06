// Stage themes.
// ---------------------------------------------------------------------------
// Themes are visual/mechanical "flavors" applied per stage by the arcade stage
// system (`stages.ts`). They are NOT user-selectable and they do NOT shape the
// difficulty ramp — that is the stage's job (stage base intensity + the skill
// engine). A theme only tweaks per-lever multipliers, rotation, word-size tilt,
// fonts, and clustering. The old "variations" live on here as themes:
// gentle (kid early stages), normal, storm, rotation, phrase.
// ---------------------------------------------------------------------------

import type { SizeCategory } from "./progression";

export type FontDistribution =
  | "random"
  | "small-heavy"
  | "large-heavy"
  | "medium-focused";

export interface Theme {
  id: string;
  name: string;

  /** How strongly live performance pushes intensity up/down within a stage. */
  skillSensitivity: number;

  // Lever multipliers
  speedMul: number; // fall-speed multiplier
  spawnMul: number; // spawn-interval multiplier (<1 = denser/faster spawns)
  maxWordsMul: number; // max-simultaneous-words multiplier

  // Rotation
  rotationEnabled: boolean;
  rotationStart: number; // intensity at which rotation begins
  rotationMul: number; // rotation-chance multiplier

  /** Per-category word-size weight multipliers (omitted = 1, 0 = forbid). */
  sizeWeights: Partial<Record<SizeCategory, number>>;

  fontSize: { min: number; max: number; distribution: FontDistribution };
  clusters: boolean; // spawn words in quick bursts
}

// Gentle — kid-friendly early stages. Short words, slow, no rotation/phrases.
export const GENTLE_THEME: Theme = {
  id: "gentle",
  name: "Gentle",
  skillSensitivity: 0.85,
  speedMul: 0.8,
  spawnMul: 1.2,
  maxWordsMul: 0.8,
  rotationEnabled: false,
  rotationStart: 1,
  rotationMul: 0,
  sizeWeights: {
    longWords: 0,
    veryLongWords: 0,
    extremelyLongWords: 0,
    phrases: 0,
    longPhrases: 0,
  },
  fontSize: { min: 30, max: 46, distribution: "medium-focused" },
  clusters: false,
};

// Normal — the reference theme, all levers at default weighting.
export const NORMAL_THEME: Theme = {
  id: "normal",
  name: "Normal",
  skillSensitivity: 1.0,
  speedMul: 1.0,
  spawnMul: 1.0,
  maxWordsMul: 1.0,
  rotationEnabled: true,
  rotationStart: 0.38,
  rotationMul: 1.0,
  sizeWeights: {},
  fontSize: { min: 20, max: 100, distribution: "random" },
  clusters: false,
};

// Storm — slow-falling but denser rain of mostly-short words.
export const STORM_THEME: Theme = {
  id: "storm",
  name: "Word Storm",
  skillSensitivity: 0.9,
  speedMul: 0.55,
  spawnMul: 0.62,
  maxWordsMul: 1.4,
  rotationEnabled: true,
  rotationStart: 0.6,
  rotationMul: 0.5,
  sizeWeights: {
    shortWords: 1.4,
    longWords: 0.5,
    veryLongWords: 0.3,
    extremelyLongWords: 0.15,
    phrases: 0.3,
    longPhrases: 0.2,
  },
  fontSize: { min: 12, max: 40, distribution: "small-heavy" },
  clusters: true,
};

// Rotation — spinning words throughout the stage.
export const ROTATION_THEME: Theme = {
  id: "rotation",
  name: "Rotation Madness",
  skillSensitivity: 1.0,
  speedMul: 1.0,
  spawnMul: 1.05,
  maxWordsMul: 1.0,
  rotationEnabled: true,
  rotationStart: 0.0,
  rotationMul: 1.3,
  sizeWeights: {},
  fontSize: { min: 18, max: 90, distribution: "random" },
  clusters: false,
};

// Phrase — tilts hard toward long words, phrases and sentences.
export const PHRASE_THEME: Theme = {
  id: "phrase",
  name: "Phrase Master",
  skillSensitivity: 0.9,
  speedMul: 0.8,
  spawnMul: 1.15,
  maxWordsMul: 0.8,
  rotationEnabled: true,
  rotationStart: 0.5,
  rotationMul: 0.6,
  sizeWeights: {
    shortWords: 0.4,
    mediumWords: 0.7,
    longWords: 1.6,
    veryLongWords: 1.8,
    extremelyLongWords: 1.2,
    phrases: 2.2,
    longPhrases: 2.0,
  },
  fontSize: { min: 20, max: 70, distribution: "large-heavy" },
  clusters: false,
};

export const THEMES = {
  gentle: GENTLE_THEME,
  normal: NORMAL_THEME,
  storm: STORM_THEME,
  rotation: ROTATION_THEME,
  phrase: PHRASE_THEME,
} as const;

export type ThemeId = keyof typeof THEMES;
