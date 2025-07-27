import { create } from "zustand";
import { useGame } from "./useGame";
import { getRandomWord, getFontFamily } from "../gameData";
import { useVariation } from "./useVariation";

export interface Word {
  id: string;
  text: string;
  x: number;
  y: number;
  speed: number;
  fontSize: number;
  fontFamily: string;
  cursorPosition: number;
  completed: boolean;
  missed: boolean;
  rotation: number;
  rotationDirection: number;
  rotationCenterX: number;
  rotationCenterY: number;
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
  
  // Actions
  spawnWord: () => void;
  updateGame: () => void;
  typeKey: (key: string) => { hit: boolean; completed: boolean };
  reset: () => void;
  setTestMode: (testMode: boolean) => void;
  setGameStartTime: (time: number) => void;
}

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
  const maxLineWidth = isLongPhrase ? Math.min(window.innerWidth * 0.7, 600) : undefined; // Increased from 0.8 to 0.7 and 400 to 600
  
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
  const padding = isLongPhrase ? 40 : 20; // More padding for long phrases
  
  // Calculate the available space for positioning
  const availableSpace = viewportWidth - maxWordWidth - (padding * 2);
  
  // If the word is too wide for the viewport, center it
  if (availableSpace < 0) {
    console.log("⚠️ Word too wide for viewport, centering:", word, "width:", maxWordWidth, "viewport:", viewportWidth);
    return (viewportWidth - maxWordWidth) / 2;
  }
  
  // Return a random position that ensures the word fits, with balanced distribution
  return padding + (Math.random() * availableSpace);
};

// Helper function to get font size based on variation distribution
const getFontSize = (variation: any): number => {
  const { min, max, distribution } = variation.fontSize;
  
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

  spawnWord: () => {
    const state = get();
    const variation = useVariation.getState().getCurrentVariation();
    
    // Calculate pace based on words typed, not score
    const pace = Math.floor(state.wordsTyped / 20); // Increase pace every 20 words typed
    
    console.log("🎮 Spawning word with variation:", variation.name, "wordsTyped:", state.wordsTyped, "pace:", pace);
    const word = getRandomWord(state.wordsTyped, state.testMode);
    console.log("🎮 Final spawned word:", word, "length:", word.length, "has spaces:", word.includes(' '));
    
    // Get font size based on variation
    const fontSize = getFontSize(variation);
    
    // Calculate speed based on variation and pace
    const baseSpeed = variation.speed.base + (pace * variation.speed.paceScaling);
    const speed = baseSpeed + (Math.random() - 0.5) * variation.speed.variation;
    
    console.log("🎮 Speed calculation:", {
      variation: variation.name,
      pace,
      baseSpeed: variation.speed.base,
      paceScaling: variation.speed.paceScaling,
      calculatedBaseSpeed: baseSpeed,
      finalSpeed: speed
    });
    
    // Calculate rotation based on variation and pace
    const rotationChance = Math.min(
      variation.rotationDistribution.baseChance + (pace * variation.rotationDistribution.paceScaling),
      0.95
    );
    const shouldRotate = Math.random() < rotationChance;
    
    const baseRotation = Math.min(
      pace * variation.rotationDistribution.maxRotation / 10,
      variation.rotationDistribution.maxRotation
    );
    const rotation = shouldRotate ? (Math.random() - 0.5) * baseRotation : 0;
    const rotationDirection = shouldRotate ? (Math.random() < 0.5 ? 1 : -1) : 0;
    
    // Get font family
    const fontFamily = getFontFamily();
    
    // Get a valid spawn position
    const validX = getValidSpawnPosition(word, fontSize, fontFamily, rotation);
    
    // Calculate rotation center within the actual bounding box
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
      fontFamily: fontFamily,
      cursorPosition: 0,
      completed: false,
      missed: false,
      rotation: rotation,
      rotationDirection: rotationDirection,
      rotationCenterX: rotationCenterX,
      rotationCenterY: rotationCenterY,
    };

    set((state) => ({
      words: [...state.words, newWord],
    }));
  },

  updateGame: () => {
    const state = get();
    const { end } = useGame.getState();
    
    // Update word positions
    const updatedWords = state.words.map((word) => ({
      ...word,
      y: word.y + word.speed,
    }));

    // Check for words that reached the bottom (missed words) - only count each word once
    const newlyMissedWords = updatedWords.filter((word) => 
      word.y > window.innerHeight && 
      !word.completed && 
      !word.missed // Only count words that haven't been counted yet
    );
    
    let newMissedWords = state.missedWords;
    
    // Mark newly missed words and count them
    if (newlyMissedWords.length > 0) {
      newlyMissedWords.forEach(word => word.missed = true);
      newMissedWords += newlyMissedWords.length;
    }

    // Remove completed words and words that are far off-screen (but keep recently missed ones visible)
    const activeWords = updatedWords.filter((word) => 
      !word.completed && 
      word.y < window.innerHeight + 10 // Remove words almost immediately when they fall off
    );

    // Update exploding letters
    const activeExplodingLetters = state.explodingLetters.filter((letter) => {
      const age = Date.now() - parseInt(letter.id.split('-')[2]); // Updated to match new ID format
      return age < letter.duration * 1000; // Remove after individual letter duration
    });

    // Update state with all changes
    set({
      words: activeWords,
      explodingLetters: activeExplodingLetters,
      missedWords: newMissedWords,
    });

    // Check for game over after state update
    if (newMissedWords >= 5) {
      end();
    }
  },

  typeKey: (key: string) => {
    const state = get();
    let hit = false;
    let completed = false;
    let newExplodingLetters: ExplodingLetter[] = [];

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
          
          // Determine if this is a long phrase that needs wrapping
          // Lowered thresholds for easier testing - can be adjusted back later
          const isLongPhrase = word.text.length > 15 || word.text.includes(' ') && word.text.length > 12;
          const maxLineWidth = isLongPhrase ? Math.min(window.innerWidth * 0.8, 400) : undefined;
          
          // Get wrapped lines if needed
          const lines = isLongPhrase && maxLineWidth 
            ? wrapText(word.text, maxLineWidth, word.fontSize, word.fontFamily)
            : [word.text];
          
          // Create exploding letters for each character, accounting for line breaks
          const explosionLetters: ExplodingLetter[] = [];
          const lineHeight = word.fontSize * 1.2;
          
          // Calculate word size factor for proportional blast effect
          const wordSizeFactor = word.text.length
          
          lines.forEach((line, lineIndex) => {
            line.split("").forEach((char, charIndex) => {
              const globalIndex = lineIndex === 0 ? charIndex : 
                lines.slice(0, lineIndex).join('').length + charIndex + lineIndex; // Account for spaces between lines
              
              explosionLetters.push({
                id: `explosion-${word.id}-${Date.now()}-${globalIndex}`,
                char,
                x: word.x + (charIndex * word.fontSize * 0.6),
                y: word.y + (lineIndex * lineHeight),
                vx: (Math.random() - 0.5) * 500 * wordSizeFactor, // Proportional horizontal velocity
                vy: (Math.random() - 0.5) * 500 * wordSizeFactor, // Proportional vertical velocity
                fontSize: word.fontSize,
                fontFamily: word.fontFamily,
                rotation: (Math.random() - 0.5) * 1200 * wordSizeFactor, // Proportional rotation for spinning effect
                duration: Math.random() * 4 + 2, // Keep duration consistent for visual coherence
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

    // Update stats
    const newTotalKeystrokes = state.totalKeystrokes + 1;
    const newCorrectKeystrokes = state.correctKeystrokes + (hit ? 1 : 0);
    const newAccuracy = (newCorrectKeystrokes / newTotalKeystrokes) * 100;
    const newScore = state.score + (hit ? 10 : 0) + (completed ? 50 : 0);
    const newWordsTyped = state.wordsTyped + (completed ? 1 : 0);

    set({
      words: updatedWords,
      explodingLetters: [...state.explodingLetters, ...newExplodingLetters],
      score: newScore,
      wordsTyped: newWordsTyped,
      totalKeystrokes: newTotalKeystrokes,
      correctKeystrokes: newCorrectKeystrokes,
      accuracy: newAccuracy,
    });

    return { hit, completed };
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
    });
  },

  setTestMode: (testMode: boolean) => {
    console.log("🧪 Setting test mode:", testMode);
    set({ testMode });
  },

  setGameStartTime: (time: number) => {
    set({ gameStartTime: time });
  },
}));

// Reset game when transitioning to playing phase
useGame.subscribe(
  (state) => state.phase,
  (phase) => {
    if (phase === "playing") {
      console.log("Resetting WordRain due to game start");
      const now = Date.now();
      useWordRain.getState().reset();
      useWordRain.getState().setGameStartTime(now);
    }
  }
);
