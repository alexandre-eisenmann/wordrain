// ============================================================================
// WordRain progression engine
// ----------------------------------------------------------------------------
// A single continuous "intensity" value drives every difficulty lever.
// Intensity = a BASE INTENSITY (the floor the current stage sets — see
// `stages.ts`) plus a SKILL OFFSET (a flow-channel modulator: clearing words
// high on screen / high accuracy pushes intensity up, struggling pulls it back).
// Intensity is rate-limited per second so it never jumps — no difficulty cliffs.
// It may climb past 1 in deep "overtime" stages, where fall speed is held at a
// readable ceiling and difficulty keeps rising via density + word length.
//
// Named PHASES gate the *introduction* of mechanics (medium words -> long words
// -> rotation -> phrases) so escalation is layered, not all-at-once.
//
// Everything below the constants block is a pure function of intensity, so the
// whole feel is tuned from the constants at the top.
// ============================================================================

import type { Theme } from "./variations";

// ---------------------------------------------------------------------------
// TUNING CONSTANTS — this is the knob panel. Adjust these to change game feel.
// ---------------------------------------------------------------------------

/** Max intensity change per second while RISING and while FALLING. Falling is
 *  faster so relief feels responsive; rising is gentle so it never spikes. */
export const MAX_RISE_PER_SEC = 0.065;
export const MAX_FALL_PER_SEC = 0.13;

/** Hard ceiling on intensity (deep-overtime headroom). Levers saturate well
 *  before this; it just lets the skill bonus stack a little in late stages. */
export const INTENSITY_CAP = 3;

/** Fall speed is held readable past this intensity — beyond it, difficulty
 *  rises through density and word length, not unreadable speed. */
export const READABLE_CEILING = 1.1;

/** SKILL CHANNEL — the dominant signal is "clear height": the screen-Y fraction
 *  (0 = top, 1 = bottom) at which the player destroys words. CLEAR_TARGET is the
 *  neutral point; clearing higher than this pushes intensity up, lower eases it.
 *  SKILL_GAIN scales how far performance can move intensity off the stage base. */
export const CLEAR_TARGET = 0.62;
export const SKILL_GAIN = 0.22;

/** Fall speed range in PX PER SECOND (dt-scaled — frame-rate independent). */
export const SPEED_MIN = 55;
export const SPEED_MAX = 520;

/** Spawn interval range in milliseconds (high intensity = shorter interval). */
export const INTERVAL_MAX_MS = 2200;
export const INTERVAL_MIN_MS = 430;

/** Simultaneous word cap range. */
export const MAXWORDS_MIN = 2;
export const MAXWORDS_MAX = 16;

/** Phase boundaries on the intensity axis. */
export const PHASE_THRESHOLDS = {
  flow: 0.15,
  pressure: 0.38,
  storm: 0.62,
  chaos: 0.85,
} as const;

// Intensity at which each (longer) word category starts appearing, and how
// quickly its weight ramps in (in intensity units) once unlocked.
const SIZE_GATES = {
  medium: 0.12,
  long: 0.34,
  veryLong: 0.58,
  extreme: 0.70,
  phrases: 0.55,
  longPhrases: 0.82,
} as const;
const SIZE_RAMP = 0.2; // intensity span over which a category reaches full weight

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Phase = "warmup" | "flow" | "pressure" | "storm" | "chaos";

export type SizeCategory =
  | "shortWords"
  | "mediumWords"
  | "longWords"
  | "veryLongWords"
  | "extremelyLongWords"
  | "phrases"
  | "longPhrases";

export type SizeDistribution = Record<SizeCategory, number>;

export interface RotationSpec {
  chance: number; // 0..1 probability a spawned word rotates
  maxAngle: number; // degrees
  speed: number; // relative spin speed (higher = faster)
}

/** Live signals fed into the intensity computation each frame. */
export interface ProgressionInput {
  baseIntensity: number; // floor set by the current stage (+ within-stage progress)
  accuracy: number; // rolling keystroke accuracy, 0..1
  recentMisses: number; // words missed within the recent window
  clearHeight: number; // EMA of screen-Y fraction where words are destroyed (0=top, 1=bottom)
  theme: Theme;
}

// ---------------------------------------------------------------------------
// Math helpers
// ---------------------------------------------------------------------------

export const clamp = (v: number, lo: number, hi: number): number =>
  v < lo ? lo : v > hi ? hi : v;

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Smoothstep easing — slow in and out. */
const smooth = (t: number): number => {
  const c = clamp(t, 0, 1);
  return c * c * (3 - 2 * c);
};

const lerpEased = (a: number, b: number, t: number): number =>
  lerp(a, b, smooth(t));

/** 0 below `gate`, ramping linearly to 1 over `SIZE_RAMP` intensity units. */
const rampFrom = (gate: number, intensity: number): number =>
  clamp((intensity - gate) / SIZE_RAMP, 0, 1);

// ---------------------------------------------------------------------------
// Intensity
// ---------------------------------------------------------------------------

/** Flow-channel modulator: positive when the player has headroom, negative
 *  when they're struggling. Driven mainly by CLEAR HEIGHT — destroying words
 *  high on the screen means the player has spare capacity, so push harder. */
function skillOffset(input: ProgressionInput): number {
  // +1 when clearing words near the top, -1 near the bottom.
  const heightSignal = (CLEAR_TARGET - input.clearHeight) / 0.35;
  // +1 at ~100% accuracy, 0 at 85%, -1 at ~70% (secondary signal).
  const accSignal = (input.accuracy - 0.85) / 0.15;
  // Each recent miss is a strong "ease off" signal.
  const missSignal = -input.recentMisses;

  const raw = heightSignal * 0.8 + accSignal * 0.3 + missSignal;
  // Asymmetric clamp: a bit more room to relieve than to accelerate.
  return clamp(raw, -1.5, 1.2) * SKILL_GAIN * input.theme.skillSensitivity;
}

/** Rate-limited intensity update. Target = the stage's base intensity plus the
 *  skill offset; the step toward it is capped per second so it never jumps. */
export function computeIntensity(
  prev: number,
  input: ProgressionInput,
  dtSec: number,
): number {
  const target = clamp(input.baseIntensity + skillOffset(input), 0, INTENSITY_CAP);

  const delta = target - prev;
  const cap = (delta >= 0 ? MAX_RISE_PER_SEC : MAX_FALL_PER_SEC) * dtSec;
  const step = clamp(delta, -cap, cap);

  return clamp(prev + step, 0, INTENSITY_CAP);
}

export function getPhase(intensity: number): Phase {
  if (intensity < PHASE_THRESHOLDS.flow) return "warmup";
  if (intensity < PHASE_THRESHOLDS.pressure) return "flow";
  if (intensity < PHASE_THRESHOLDS.storm) return "pressure";
  if (intensity < PHASE_THRESHOLDS.chaos) return "storm";
  return "chaos";
}

// ---------------------------------------------------------------------------
// Levers — pure functions of intensity (+ per-theme multipliers)
// ---------------------------------------------------------------------------

export function getFallSpeed(intensity: number, theme: Theme): number {
  // Held readable in deep overtime — past the ceiling, pressure comes from
  // density / word length instead of unreadable speed.
  const i = Math.min(intensity, READABLE_CEILING);
  return lerpEased(SPEED_MIN, SPEED_MAX, i) * theme.speedMul;
}

export function getSpawnInterval(intensity: number, theme: Theme): number {
  // spawnMul < 1 => denser (shorter interval).
  return lerpEased(INTERVAL_MAX_MS, INTERVAL_MIN_MS, intensity) * theme.spawnMul;
}

export function getMaxWords(intensity: number, theme: Theme): number {
  // Uncapped on purpose: density keeps rising in overtime for infinite difficulty.
  const base = lerp(MAXWORDS_MIN, MAXWORDS_MAX, intensity);
  return Math.max(1, Math.round(base * theme.maxWordsMul));
}

export function getRotation(intensity: number, theme: Theme): RotationSpec {
  if (!theme.rotationEnabled || intensity < theme.rotationStart) {
    return { chance: 0, maxAngle: 0, speed: 0 };
  }
  const r = clamp(
    (intensity - theme.rotationStart) / (1 - theme.rotationStart),
    0,
    1,
  );
  return {
    chance: Math.min(0.95, lerp(0.12, 0.85, r) * theme.rotationMul),
    maxAngle: lerp(4, 25, r),
    speed: lerp(0.5, 3, r),
  };
}

/** Word-size probabilities for the current intensity, tilted by the theme and
 *  normalized to sum to 1. Longer categories are gated so mechanics layer in
 *  rather than all appearing at once. The size shaping saturates at intensity 1
 *  (deeper difficulty comes from density), so the shaping input is clamped. */
export function getWordSizeDistribution(
  intensity: number,
  theme: Theme,
): SizeDistribution {
  const i = clamp(intensity, 0, 1);
  const w = theme.sizeWeights;
  const raw: SizeDistribution = {
    shortWords: lerp(1.0, 0.12, i) * (w.shortWords ?? 1),
    mediumWords: rampFrom(SIZE_GATES.medium, i) * 0.9 * (w.mediumWords ?? 1),
    longWords: rampFrom(SIZE_GATES.long, i) * 0.8 * (w.longWords ?? 1),
    veryLongWords: rampFrom(SIZE_GATES.veryLong, i) * 0.6 * (w.veryLongWords ?? 1),
    extremelyLongWords:
      rampFrom(SIZE_GATES.extreme, i) * 0.3 * (w.extremelyLongWords ?? 1),
    phrases: rampFrom(SIZE_GATES.phrases, i) * 0.5 * (w.phrases ?? 1),
    longPhrases: rampFrom(SIZE_GATES.longPhrases, i) * 0.4 * (w.longPhrases ?? 1),
  };

  const total =
    raw.shortWords +
    raw.mediumWords +
    raw.longWords +
    raw.veryLongWords +
    raw.extremelyLongWords +
    raw.phrases +
    raw.longPhrases;

  if (total <= 0) {
    return {
      shortWords: 1,
      mediumWords: 0,
      longWords: 0,
      veryLongWords: 0,
      extremelyLongWords: 0,
      phrases: 0,
      longPhrases: 0,
    };
  }

  return {
    shortWords: raw.shortWords / total,
    mediumWords: raw.mediumWords / total,
    longWords: raw.longWords / total,
    veryLongWords: raw.veryLongWords / total,
    extremelyLongWords: raw.extremelyLongWords / total,
    phrases: raw.phrases / total,
    longPhrases: raw.longPhrases / total,
  };
}
