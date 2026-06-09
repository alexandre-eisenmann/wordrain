import { create } from "zustand";
import { useGame } from "./useGame";
import { getRandomWord, getFontFamily } from "../gameData";
import {
  computeIntensity,
  getPhase,
  getFallSpeed,
  getRotation,
  getWordSizeDistribution,
  clamp,
  CLEAR_TARGET,
  type Phase,
} from "../progression";
import type { Theme } from "../variations";
import {
  stageTheme,
  stageDrivenIntensity,
  stageGoalWords,
  stageBaseIntensity,
  stageMultiplier,
  computeStars,
  STAR_BONUS,
} from "../stages";

export interface Word {
  id: string;
  text: string;
  x: number;
  y: number;
  speed: number; // px per SECOND (dt-scaled, frame-rate independent)
  fontSize: number;
  fontFamily: string;
  cursorPosition: number;
  completed: boolean;
  missed: boolean;
  rotation: number;
  rotationDirection: number;
  rotationCenterX: number;
  rotationCenterY: number;
  rotationSpeed: number; // seconds per full revolution (0 = no spin)
}

export interface ExplodingLetter {
  id: string;
  char: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  fontSize: number;
  fontFamily: string;
  rotation: number;
  duration: number;
}

interface WordRainState {
  words: Word[];
  explodingLetters: ExplodingLetter[];
  score: number;
  wordsTyped: number;
  totalKeystrokes: number;
  correctKeystrokes: number;
  accuracy: number;
  missedWords: number;
  testMode: boolean;
  gameStartTime: number;

  // Progression state
  intensity: number;
  phase: Phase;
  // Decayed rolling performance signals (feed the flow channel)
  recentCorrect: number;
  recentTotal: number;
  recentMissEMA: number;
  clearHeightEMA: number; // screen-Y fraction where words are destroyed (skill signal)

  // Arcade stage state
  stage: number;
  stageWordsCleared: number;
  totalStars: number;
  lastStageStars: number; // shown on the stage-clear interstitial
  lastStageBonus: number;
  // Per-stage metric accumulators (reset each stage) for the star rating
  stageKeystrokes: number;
  stageCorrect: number;
  stageMisses: number;
  stageClearHeightSum: number;
  stageClearCount: number;

  // Actions
  spawnWord: () => void;
  tick: (dtSec: number) => void;
  typeKey: (key: string) => { hit: boolean; completed: boolean };
  advanceStage: () => void;
  revive: () => void; // ad-reward: restore lives and resume the same run
  setStage: (stage: number) => void;
  reset: () => void;
  setTestMode: (testMode: boolean) => void;
  setGameStartTime: (time: number) => void;
}

// Decay time-constants (seconds) for the rolling performance signals.
const ACCURACY_TAU = 6;
const MISS_TAU = 3.5;
// Clamp dt so a backgrounded tab doesn't teleport every word off-screen.
const MAX_DT = 0.05; // 50ms
// How quickly the clear-height signal tracks the latest kills (0..1 per word).
const CLEAR_HEIGHT_ALPHA = 0.35;
// Max bonus points for destroying a word at the very top of the screen.
const HEIGHT_BONUS_MAX = 100;

// Utility function to wrap text at word boundaries
const wrapText = (text: string, maxWidth: number, fontSize: number, fontFamily: string): string[] => {
  // Create a temporary canvas to measure text accurately
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    // Fallback: simple word-based wrapping
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      if (testLine.length * fontSize * 0.6 > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
    return lines;
  }

  // Set font and measure text
  ctx.font = `${fontSize}px ${fontFamily}`;
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  // If we still have lines that are too wide, force break them
  const finalLines: string[] = [];
  for (const line of lines) {
    if (ctx.measureText(line).width > maxWidth) {
      // Force break long lines
      let currentChar = '';
      for (const char of line) {
        const testChar = currentChar + char;
        if (ctx.measureText(testChar).width > maxWidth && currentChar) {
          finalLines.push(currentChar);
          currentChar = char;
        } else {
          currentChar = testChar;
        }
      }
      if (currentChar) {
        finalLines.push(currentChar);
      }
    } else {
      finalLines.push(line);
    }
  }

  return finalLines;
};

// Utility function to calculate word bounds
const calculateWordBounds = (text: string, fontSize: number, fontFamily: string, rotation: number): { width: number; height: number; maxWidth: number } => {
  // Create a temporary canvas to measure text accurately
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    // Fallback calculation if canvas is not available
    const charWidth = fontSize * 0.6; // Approximate character width
    const wordWidth = text.length * charWidth;
    const wordHeight = fontSize;

    // For rotating words, calculate the maximum width when horizontal
    const maxWidth = Math.abs(wordWidth * Math.cos(rotation * Math.PI / 180)) +
                    Math.abs(wordHeight * Math.sin(rotation * Math.PI / 180));

    return { width: wordWidth, height: wordHeight, maxWidth: Math.max(wordWidth, maxWidth) };
  }

  // Determine if this is a long phrase that needs wrapping
  // More aggressive wrapping for test mode phrases
  const isLongPhrase = text.length > 15 || text.includes(' ') && text.length > 12;
  const maxLineWidth = isLongPhrase ? Math.min(window.innerWidth * 0.7, 600) : undefined;

  if (isLongPhrase && maxLineWidth) {
    // Calculate bounds for wrapped text
    const lines = wrapText(text, maxLineWidth, fontSize, fontFamily);
    const lineHeight = fontSize * 1.2;
    const totalHeight = lines.length * lineHeight;

    // Find the widest line
    let widestLineWidth = 0;
    for (const line of lines) {
      ctx.font = `${fontSize}px ${fontFamily}`;
      const metrics = ctx.measureText(line);
      widestLineWidth = Math.max(widestLineWidth, metrics.width);
    }

    // For rotating words, calculate the maximum width when horizontal
    const maxWidth = Math.abs(widestLineWidth * Math.cos(rotation * Math.PI / 180)) +
                    Math.abs(totalHeight * Math.sin(rotation * Math.PI / 180));

    return { width: widestLineWidth, height: totalHeight, maxWidth: Math.max(widestLineWidth, maxWidth) };
  } else {
    // Original calculation for single-line text
    ctx.font = `${fontSize}px ${fontFamily}`;
    const metrics = ctx.measureText(text);
    const wordWidth = metrics.width;
    const wordHeight = fontSize;

    // For rotating words, calculate the maximum width when horizontal
    const maxWidth = Math.abs(wordWidth * Math.cos(rotation * Math.PI / 180)) +
                    Math.abs(wordHeight * Math.sin(rotation * Math.PI / 180));

    return { width: wordWidth, height: wordHeight, maxWidth: Math.max(wordWidth, maxWidth) };
  }
};

// Utility function to get a valid spawn position
const getValidSpawnPosition = (word: string, fontSize: number, fontFamily: string, rotation: number): number => {
  const bounds = calculateWordBounds(word, fontSize, fontFamily, rotation);
  const maxWordWidth = bounds.maxWidth;
  const viewportWidth = window.innerWidth;

  // Ensure the word fits within the viewport with more padding for long phrases
  const isLongPhrase = word.length > 15 || word.includes(' ') && word.length > 12;
  const padding = isLongPhrase ? 40 : 20;

  // Calculate the available space for positioning
  const availableSpace = viewportWidth - maxWordWidth - (padding * 2);

  // If the word is too wide for the viewport, center it
  if (availableSpace < 0) {
    return (viewportWidth - maxWordWidth) / 2;
  }

  // Return a random position that ensures the word fits, with balanced distribution
  return padding + (Math.random() * availableSpace);
};

// Helper function to get font size based on theme distribution
const getFontSize = (theme: Theme): number => {
  const { min, max, distribution } = theme.fontSize;

  switch (distribution) {
    case 'small-heavy':
      // 70% chance of small fonts, 30% chance of larger fonts
      return Math.random() < 0.7
        ? min + Math.random() * (max - min) * 0.4
        : min + (max - min) * 0.4 + Math.random() * (max - min) * 0.6;

    case 'large-heavy':
      // 70% chance of large fonts, 30% chance of smaller fonts
      return Math.random() < 0.7
        ? min + (max - min) * 0.6 + Math.random() * (max - min) * 0.4
        : min + Math.random() * (max - min) * 0.6;

    case 'medium-focused':
      // Focus on medium-sized fonts with normal distribution
      const midPoint = (min + max) / 2;
      const range = (max - min) / 2;
      return midPoint + (Math.random() - 0.5) * range;

    case 'random':
    default:
      return min + Math.random() * (max - min);
  }
};

// Set by revive() so the ended -> playing transition resumes the run instead of
// resetting it (see the phase subscribe at the bottom of this file).
let reviving = false;

export const useWordRain = create<WordRainState>((set, get) => ({
  words: [],
  explodingLetters: [],
  score: 0,
  wordsTyped: 0,
  totalKeystrokes: 0,
  correctKeystrokes: 0,
  accuracy: 100,
  missedWords: 0,
  testMode: false,
  gameStartTime: 0,

  intensity: 0,
  phase: "warmup",
  recentCorrect: 0,
  recentTotal: 0,
  recentMissEMA: 0,
  clearHeightEMA: CLEAR_TARGET,

  stage: 1,
  stageWordsCleared: 0,
  totalStars: 0,
  lastStageStars: 0,
  lastStageBonus: 0,
  stageKeystrokes: 0,
  stageCorrect: 0,
  stageMisses: 0,
  stageClearHeightSum: 0,
  stageClearCount: 0,

  spawnWord: () => {
    const state = get();
    const theme = stageTheme(state.stage);
    const intensity = state.intensity;

    // Word text comes from the intensity-driven size distribution.
    const distribution = getWordSizeDistribution(intensity, theme);
    const word = getRandomWord(state.wordsTyped, state.testMode, distribution);

    const fontSize = getFontSize(theme);

    // Fall speed (px/s) with a small per-word variance for organic feel.
    const baseSpeed = getFallSpeed(intensity, theme);
    const speed = baseSpeed * (0.9 + Math.random() * 0.2);

    // Rotation is intensity- and theme-gated.
    const rot = getRotation(intensity, theme);
    const shouldRotate = Math.random() < rot.chance;
    const rotation = shouldRotate ? (Math.random() - 0.5) * rot.maxAngle : 0;
    const rotationDirection = shouldRotate ? (Math.random() < 0.5 ? 1 : -1) : 0;
    const rotationSpeed = shouldRotate ? Math.max(3, 12 - rot.speed * 3) : 0;

    const fontFamily = getFontFamily();
    const validX = getValidSpawnPosition(word, fontSize, fontFamily, rotation);

    const bounds = calculateWordBounds(word, fontSize, fontFamily, rotation);
    const rotationCenterX = shouldRotate ? Math.random() * bounds.width : 0;
    const rotationCenterY = shouldRotate ? Math.random() * bounds.height : 0;

    const newWord: Word = {
      id: Math.random().toString(36).substr(2, 9),
      text: word,
      x: validX,
      y: -50,
      speed,
      fontSize,
      fontFamily,
      cursorPosition: 0,
      completed: false,
      missed: false,
      rotation,
      rotationDirection,
      rotationCenterX,
      rotationCenterY,
      rotationSpeed,
    };

    set((s) => ({ words: [...s.words, newWord] }));
  },

  // Frame update. dtSec is the real elapsed seconds since the last frame, so
  // motion and progression are independent of the display refresh rate.
  tick: (dtSec: number) => {
    const state = get();
    const { end } = useGame.getState();
    const theme = stageTheme(state.stage);
    const dt = clamp(dtSec, 0, MAX_DT);

    // Decay the rolling performance signals toward zero.
    const accDecay = Math.exp(-dt / ACCURACY_TAU);
    let recentCorrect = state.recentCorrect * accDecay;
    let recentTotal = state.recentTotal * accDecay;
    let recentMissEMA = state.recentMissEMA * Math.exp(-dt / MISS_TAU);

    // Advance word positions (per-second).
    const updatedWords = state.words.map((word) => ({
      ...word,
      y: word.y + word.speed * dt,
    }));

    // Words that fell off the bottom this frame count as missed (once).
    const viewportHeight = window.innerHeight;
    const newlyMissed = updatedWords.filter(
      (w) => w.y > viewportHeight && !w.completed && !w.missed,
    );
    let newMissedWords = state.missedWords;
    let stageMisses = state.stageMisses;
    if (newlyMissed.length > 0) {
      newlyMissed.forEach((w) => (w.missed = true));
      newMissedWords += newlyMissed.length;
      stageMisses += newlyMissed.length;
      recentMissEMA += newlyMissed.length;
    }

    // Keep only active, on-screen words.
    const activeWords = updatedWords.filter(
      (w) => !w.completed && w.y < viewportHeight + 10,
    );

    // Age out exploding letters.
    const activeExplodingLetters = state.explodingLetters.filter((letter) => {
      const age = Date.now() - parseInt(letter.id.split("-")[2]);
      return age < letter.duration * 1000;
    });

    // Stage-driven base intensity + skill modulation.
    const baseIntensity = stageDrivenIntensity(state.stage, state.stageWordsCleared);
    const accuracy = recentTotal > 0.5 ? recentCorrect / recentTotal : 1;

    const intensity = computeIntensity(
      state.intensity,
      {
        baseIntensity,
        accuracy,
        recentMisses: recentMissEMA,
        clearHeight: state.clearHeightEMA,
        theme,
      },
      dt,
    );
    const phase = getPhase(intensity);

    set({
      words: activeWords,
      explodingLetters: activeExplodingLetters,
      missedWords: newMissedWords,
      stageMisses,
      intensity,
      phase,
      recentCorrect,
      recentTotal,
      recentMissEMA,
    });

    if (newMissedWords >= 5) {
      end();
    }
  },

  typeKey: (key: string) => {
    const state = get();
    let hit = false;
    let completed = false;
    let newExplodingLetters: ExplodingLetter[] = [];
    const completedHeights: number[] = []; // screen-Y fraction of each word cleared this keystroke

    const updatedWords = state.words.map((word) => {
      if (word.completed) return word;

      const expectedChar = word.text[word.cursorPosition];

      // Handle all characters (spaces, letters, numbers, punctuation) - case sensitive
      if ((key === " " && expectedChar === " ") || expectedChar === key) {
        hit = true;
        const newCursorPosition = word.cursorPosition + 1;

        if (newCursorPosition >= word.text.length) {
          // Word completed - create explosion effect
          completed = true;
          completedHeights.push(clamp(word.y / window.innerHeight, 0, 1));

          const isLongPhrase = word.text.length > 15 || word.text.includes(' ') && word.text.length > 12;
          const maxLineWidth = isLongPhrase ? Math.min(window.innerWidth * 0.8, 400) : undefined;

          const lines = isLongPhrase && maxLineWidth
            ? wrapText(word.text, maxLineWidth, word.fontSize, word.fontFamily)
            : [word.text];

          const explosionLetters: ExplodingLetter[] = [];
          const lineHeight = word.fontSize * 1.2;

          // Bigger words burst with more energy.
          const wordSizeFactor = word.text.length;

          lines.forEach((line, lineIndex) => {
            line.split("").forEach((char, charIndex) => {
              const globalIndex = lineIndex === 0 ? charIndex :
                lines.slice(0, lineIndex).join('').length + charIndex + lineIndex;

              explosionLetters.push({
                id: `explosion-${word.id}-${Date.now()}-${globalIndex}`,
                char,
                x: word.x + (charIndex * word.fontSize * 0.6),
                y: word.y + (lineIndex * lineHeight),
                vx: (Math.random() - 0.5) * 500 * wordSizeFactor,
                vy: (Math.random() - 0.5) * 500 * wordSizeFactor,
                fontSize: word.fontSize,
                fontFamily: word.fontFamily,
                rotation: (Math.random() - 0.5) * 1200 * wordSizeFactor,
                duration: Math.random() * 4 + 2,
              });
            });
          });

          newExplodingLetters.push(...explosionLetters);

          return { ...word, completed: true };
        }

        return { ...word, cursorPosition: newCursorPosition };
      }

      return word;
    });

    const multiplier = stageMultiplier(state.stage);

    // Height-based reward: clearing a word higher up is worth more, feeds the
    // skill signal, and accumulates the stage star metrics.
    let heightBonus = 0;
    let clearHeightEMA = state.clearHeightEMA;
    let stageClearHeightSum = state.stageClearHeightSum;
    for (const frac of completedHeights) {
      clearHeightEMA += (frac - clearHeightEMA) * CLEAR_HEIGHT_ALPHA;
      heightBonus += Math.round(HEIGHT_BONUS_MAX * (1 - frac));
      stageClearHeightSum += frac;
    }

    // All earned points are scaled by the stage multiplier.
    const earned = Math.round(((hit ? 10 : 0) + (completed ? 50 : 0) + heightBonus) * multiplier);

    const newTotalKeystrokes = state.totalKeystrokes + 1;
    const newCorrectKeystrokes = state.correctKeystrokes + (hit ? 1 : 0);
    const newAccuracy = (newCorrectKeystrokes / newTotalKeystrokes) * 100;
    const newWordsTyped = state.wordsTyped + completedHeights.length;
    const newStageWordsCleared = state.stageWordsCleared + completedHeights.length;

    set({
      words: updatedWords,
      explodingLetters: [...state.explodingLetters, ...newExplodingLetters],
      score: state.score + earned,
      wordsTyped: newWordsTyped,
      totalKeystrokes: newTotalKeystrokes,
      correctKeystrokes: newCorrectKeystrokes,
      accuracy: newAccuracy,
      recentTotal: state.recentTotal + 1,
      recentCorrect: state.recentCorrect + (hit ? 1 : 0),
      clearHeightEMA,
      stageWordsCleared: newStageWordsCleared,
      stageKeystrokes: state.stageKeystrokes + 1,
      stageCorrect: state.stageCorrect + (hit ? 1 : 0),
      stageClearHeightSum,
      stageClearCount: state.stageClearCount + completedHeights.length,
    });

    // Stage cleared? Compute stars, award the bonus, freeze for the interstitial.
    if (completedHeights.length > 0 && newStageWordsCleared >= stageGoalWords(state.stage)) {
      const s = get();
      const stageAccuracy = s.stageKeystrokes > 0 ? s.stageCorrect / s.stageKeystrokes : 1;
      const avgClearHeight =
        s.stageClearCount > 0 ? s.stageClearHeightSum / s.stageClearCount : CLEAR_TARGET;
      const stars = computeStars({
        accuracy: stageAccuracy,
        avgClearHeight,
        misses: s.stageMisses,
      });
      const bonus = Math.round(stars * STAR_BONUS * multiplier);
      set({
        score: s.score + bonus,
        lastStageStars: stars,
        lastStageBonus: bonus,
        totalStars: s.totalStars + stars,
      });
      useGame.getState().stageClear();
    }

    return { hit, completed };
  },

  // Move to the next stage after the interstitial. Intensity is left untouched
  // so it carries over seamlessly (it already ramped to the next stage's floor).
  advanceStage: () => {
    set((s) => ({
      stage: s.stage + 1,
      words: [],
      explodingLetters: [],
      stageWordsCleared: 0,
      stageKeystrokes: 0,
      stageCorrect: 0,
      stageMisses: 0,
      stageClearHeightSum: 0,
      stageClearCount: 0,
    }));
    useGame.getState().resume();
  },

  // Ad-reward revive: give back 2 of the 5 lives and resume the SAME run at the
  // current stage (clearing on-screen words so the player isn't instantly killed
  // again). The `reviving` guard below stops the phase subscribe from wiping the
  // run on the ended -> playing transition.
  revive: () => {
    reviving = true;
    set((s) => ({
      missedWords: Math.max(0, s.missedWords - 2),
      words: [],
      explodingLetters: [],
    }));
    useGame.getState().resume();
  },

  // Jump straight to a stage (used by ?stage=N for tuning).
  setStage: (stage: number) => {
    set({
      stage,
      stageWordsCleared: 0,
      stageKeystrokes: 0,
      stageCorrect: 0,
      stageMisses: 0,
      stageClearHeightSum: 0,
      stageClearCount: 0,
      intensity: stageBaseIntensity(stage),
    });
  },

  reset: () => {
    const currentState = get();
    set({
      words: [],
      explodingLetters: [],
      score: 0,
      wordsTyped: 0,
      totalKeystrokes: 0,
      correctKeystrokes: 0,
      accuracy: 100,
      missedWords: 0,
      testMode: currentState.testMode, // Preserve test mode state
      gameStartTime: 0,
      intensity: 0,
      phase: "warmup",
      recentCorrect: 0,
      recentTotal: 0,
      recentMissEMA: 0,
      clearHeightEMA: CLEAR_TARGET,
      stage: 1,
      stageWordsCleared: 0,
      totalStars: 0,
      lastStageStars: 0,
      lastStageBonus: 0,
      stageKeystrokes: 0,
      stageCorrect: 0,
      stageMisses: 0,
      stageClearHeightSum: 0,
      stageClearCount: 0,
    });
  },

  setTestMode: (testMode: boolean) => {
    set({ testMode });
  },

  setGameStartTime: (time: number) => {
    set({ gameStartTime: time });
  },
}));

// Reset game when transitioning to playing phase from a non-stage source.
// (advanceStage handles the stageClear -> playing transition itself, so only a
// fresh start from "ready"/"ended" should wipe the run.)
let prevPhase = useGame.getState().phase;
useGame.subscribe(
  (state) => state.phase,
  (phase) => {
    if (phase === "playing" && prevPhase !== "stageClear" && !reviving) {
      const now = Date.now();
      useWordRain.getState().reset();
      useWordRain.getState().setGameStartTime(now);
    }
    reviving = false;
    prevPhase = phase;
  }
);
