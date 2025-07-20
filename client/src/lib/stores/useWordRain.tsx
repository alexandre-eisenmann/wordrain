import { create } from "zustand";
import { useGame } from "./useGame";
import { getRandomWord, getFontFamily } from "../gameData";

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
  
  // Actions
  spawnWord: () => void;
  updateGame: () => void;
  typeKey: (key: string) => { hit: boolean; completed: boolean };
  reset: () => void;
}

export const useWordRain = create<WordRainState>((set, get) => ({
  words: [],
  explodingLetters: [],
  score: 0,
  wordsTyped: 0,
  totalKeystrokes: 0,
  correctKeystrokes: 0,
  accuracy: 100,
  missedWords: 0,

  spawnWord: () => {
    const state = get();
    const word = getRandomWord(state.wordsTyped);
    const fontSize = Math.random() * 80 + 20; // 20-100px for much more variety
    
    // Increase speed based on score/difficulty
    const difficulty = Math.floor(state.wordsTyped / 10);
    const baseSpeed = 1.5 + (difficulty * 0.3); // Start at 1.5, increase by 0.3 every 10 words
    const speed = baseSpeed + (Math.random() * 1.5); // Add some randomness
    
    // Rotation chance and intensity increases with difficulty
    const rotationChance = Math.min(0.25 + (difficulty * 0.05), 0.8); // Start at 25%, increase by 5% every 10 words, max 80%
    const shouldRotate = Math.random() < rotationChance;
    
    // Rotation increases with difficulty - very subtle at start, more pronounced later
    const baseRotation = Math.min(difficulty * 0.5, 8); // Much more subtle: max 8 degrees, increases by 0.5 every 10 words
    const rotation = shouldRotate ? (Math.random() - 0.5) * baseRotation : 0; // Random rotation within the difficulty-based range
    const rotationDirection = shouldRotate ? (Math.random() < 0.5 ? 1 : -1) : 0; // Random direction: 50% clockwise, 50% counterclockwise
    
    // Calculate random rotation center within the word bounds
    const estimatedWordWidth = word.length * fontSize * 0.6; // Approximate word width
    const rotationCenterX = shouldRotate ? Math.random() * estimatedWordWidth : 0; // Random point within word width
    const rotationCenterY = shouldRotate ? Math.random() * fontSize : 0; // Random point within word height
    
    const newWord: Word = {
      id: Math.random().toString(36).substr(2, 9),
      text: word,
      x: Math.random() * (window.innerWidth - 300),
      y: -50,
      speed,
      fontSize,
      fontFamily: getFontFamily(),
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
    const activeWords = updatedWords.filter((word) => !word.completed && word.y < window.innerHeight + 200);

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
          
          // Create exploding letters for each character
          const explosionLetters = word.text.split("").map((char, index) => ({
            id: `explosion-${word.id}-${Date.now()}-${index}`,
            char,
            x: word.x + (index * word.fontSize * 0.6),
            y: word.y,
            vx: (Math.random() - 0.5) * 3000, // Higher horizontal velocity range
            vy: (Math.random() - 0.5) * 3000, // Higher vertical velocity range with upward bias
            fontSize: word.fontSize,
            fontFamily: word.fontFamily,
            rotation: (Math.random() - 0.5) * 7200, // Much more rotation for spinning effect
            duration: Math.random() * 4 + 2, // Random duration between 2-6 seconds
          }));
          
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
    set({
      words: [],
      explodingLetters: [],
      score: 0,
      wordsTyped: 0,
      totalKeystrokes: 0,
      correctKeystrokes: 0,
      accuracy: 100,
      missedWords: 0,
    });
  },
}));

// Reset game when transitioning to playing phase
useGame.subscribe(
  (state) => state.phase,
  (phase) => {
    if (phase === "playing") {
      console.log("Resetting WordRain due to game start");
      useWordRain.getState().reset();
    }
  }
);
