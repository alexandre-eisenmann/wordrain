// ============================================================================
// Arcade stage system
// ----------------------------------------------------------------------------
// One infinite track. Each stage sets a higher BASE INTENSITY (the floor the
// progression engine ramps within) and a WORD GOAL to clear. Clearing the goal
// triggers the stage-clear star screen and advances to the next, harder stage.
// Strong typists clear the goal sooner (and run the engine hotter), so they are
// "passed through" faster; weak typists take longer but are never stuck.
//
// All arcade pacing is tuned from the pure functions below.
// ============================================================================

import { THEMES, type Theme, type ThemeId } from "./variations";
import { clamp } from "./progression";

// Words to clear to finish a stage (small early so stages feel snappy).
export function stageGoalWords(stage: number): number {
  return 5 + stage;
}

// Intensity floor entering a stage: a gentle, smooth climb. Each stage adds a
// little less than the last (no early cliff), easing toward 1 around stage ~20,
// then a slow overtime climb so difficulty keeps rising forever.
export function stageBaseIntensity(stage: number): number {
  const eased = 1 - Math.pow(0.9, Math.max(0, stage - 1));
  const overtime = Math.max(0, stage - 18) * 0.04;
  return eased + overtime;
}

// Score multiplier — deep stages are worth chasing.
export function stageMultiplier(stage: number): number {
  return 1 + (stage - 1) * 0.25;
}

// Which themed wave plays on a given stage. A long gentle/normal on-ramp, then
// occasional storm / rotation / phrase set-pieces (every 4th stage from 6), with
// plain "normal" stages in between for breathing room — never back-to-back.
export function stageThemeId(stage: number): ThemeId {
  if (stage <= 3) return "gentle";
  if (stage >= 6 && (stage - 6) % 4 === 0) {
    const cycle: ThemeId[] = ["rotation", "storm", "phrase"];
    return cycle[Math.floor((stage - 6) / 4) % cycle.length];
  }
  return "normal";
}

export function stageTheme(stage: number): Theme {
  return THEMES[stageThemeId(stage)];
}

// Within-stage base intensity: ramps from this stage's floor toward the next
// as the player clears the word goal, so crossing the stage line is seamless.
export function stageDrivenIntensity(stage: number, wordsCleared: number): number {
  const progress = clamp(wordsCleared / stageGoalWords(stage), 0, 1);
  return (
    stageBaseIntensity(stage) +
    (stageBaseIntensity(stage + 1) - stageBaseIntensity(stage)) * progress
  );
}

// ---------------------------------------------------------------------------
// Stars
// ---------------------------------------------------------------------------

export interface StageStarsInput {
  accuracy: number; // 0..1, keystroke accuracy during the stage
  avgClearHeight: number; // 0..1, average screen-Y where words were cleared (lower = better)
  misses: number; // words missed during the stage
}

/** Points awarded per star, before the stage multiplier. */
export const STAR_BONUS = 150;

export function computeStars(input: StageStarsInput): number {
  const acc = clamp(input.accuracy, 0, 1);
  const heightScore = 1 - clamp(input.avgClearHeight, 0, 1);
  const missScore = Math.max(0, 1 - input.misses / 2);

  const grade = 0.45 * acc + 0.35 * heightScore + 0.2 * missScore;
  return grade >= 0.85 ? 3 : grade >= 0.6 ? 2 : 1;
}
