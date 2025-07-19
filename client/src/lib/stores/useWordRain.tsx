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
}

interface WordRainState {
  words: Word[];
  explodingLetters: ExplodingLetter[];
  score: number;
  wordsTyped: number;
  totalKeystrokes: number;
  correctKeystrokes: number;
  accuracy: number;
  
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

  spawnWord: () => {
    const state = get();
    const word = getRandomWord();
    const fontSize = Math.random() * 20 + 24; // 24-44px
    
    const newWord: Word = {
      id: Math.random().toString(36).substr(2, 9),
      text: word,
      x: Math.random() * (window.innerWidth - 200),
      y: -50,
      speed: Math.random() * 2 + 1, // 1-3 pixels per frame
      fontSize,
      fontFamily: getFontFamily(),
      cursorPosition: 0,
      completed: false,
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

    // Check for words that reached the bottom
    const wordsAtBottom = updatedWords.filter((word) => word.y > window.innerHeight && !word.completed);
    if (wordsAtBottom.length > 0) {
      end();
      return;
    }

    // Remove completed words and words that are off-screen
    const activeWords = updatedWords.filter((word) => !word.completed && word.y < window.innerHeight + 100);

    // Update exploding letters
    const activeExplodingLetters = state.explodingLetters.filter((letter) => {
      const age = Date.now() - parseInt(letter.id.split('-')[1]);
      return age < 2000; // Remove after 2 seconds
    });

    set({
      words: activeWords,
      explodingLetters: activeExplodingLetters,
    });
  },

  typeKey: (key: string) => {
    const state = get();
    let hit = false;
    let completed = false;
    let newExplodingLetters: ExplodingLetter[] = [];

    const updatedWords = state.words.map((word) => {
      if (word.completed) return word;

      const expectedChar = word.text[word.cursorPosition]?.toLowerCase();
      
      if (expectedChar === key) {
        hit = true;
        const newCursorPosition = word.cursorPosition + 1;
        
        if (newCursorPosition >= word.text.length) {
          // Word completed - create explosion effect
          completed = true;
          
          // Create exploding letters for each character
          const explosionLetters = word.text.split("").map((char, index) => ({
            id: `explosion-${Date.now()}-${index}`,
            char,
            x: word.x + (index * word.fontSize * 0.6),
            y: word.y,
            vx: (Math.random() - 0.5) * 400,
            vy: (Math.random() - 0.5) * 300 - 100,
            fontSize: word.fontSize,
            fontFamily: word.fontFamily,
            rotation: (Math.random() - 0.5) * 720,
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
    });
  },
}));

// Reset game when game phase changes to ready
useWordRain.subscribe(
  (state) => state,
  () => {
    const gamePhase = useGame.getState().phase;
    if (gamePhase === "ready") {
      useWordRain.getState().reset();
    }
  }
);
