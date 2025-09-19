// Game Variation Configuration System
// This file defines different game variations with their specific parameters

export interface GameVariation {
  id: string;
  name: string;
  description: string;
  
  // Word generation parameters
  wordPace: {
    baseInterval: number; // Base time between word spawns (seconds)
    intervalVariation: number; // Random variation in interval (±seconds)
    paceScaling: number; // How much faster words spawn as pace increases (seconds per level)
  };
  
  wordSizeDistribution: {
    shortWords: number; // Probability of 3-5 letter words (0-1)
    mediumWords: number; // Probability of 6-8 letter words (0-1)
    longWords: number; // Probability of 9-12 letter words (0-1)
    veryLongWords: number; // Probability of 13-20 letter words (0-1)
    extremelyLongWords: number; // Probability of 21+ letter words (0-1)
    phrases: number; // Probability of phrases (0-1)
    longPhrases: number; // Probability of long phrases (0-1)
  };
  
  rotationDistribution: {
    baseChance: number; // Base probability of rotation (0-1)
    paceScaling: number; // How much rotation chance increases with pace
    maxRotation: number; // Maximum rotation angle in degrees
    rotationSpeed: number; // Speed of rotation animation
  };
  
  paceSlope: {
    speedIncrease: number; // How much speed increases per pace level
    rotationIncrease: number; // How much rotation chance increases per pace level
  };
  
  // Visual and gameplay parameters
  fontSize: {
    min: number;
    max: number;
    distribution: 'random' | 'small-heavy' | 'large-heavy' | 'medium-focused';
  };
  
  speed: {
    base: number;
    variation: number; // Random variation in speed
    paceScaling: number; // How much speed increases with pace
  };
  
  // Special effects
  specialEffects: {
    multipleWords: boolean; // Allow multiple words to fall simultaneously
    wordClusters: boolean; // Words spawn in clusters
    colorVariation: boolean; // Different colors for different word types
    soundVariation: boolean; // Different sounds for different word types
  };
}

// Hard variation (original game behavior)
export const HARD_VARIATION: GameVariation = {
  id: 'hard',
  name: 'Hard',
  description: 'The original WordRain experience with balanced pace progression',
  
  wordPace: {
    baseInterval: 0.8, // Much faster base spawning - NOT tied to user activity
    intervalVariation: 0.3,
    paceScaling: 0.1, // 0.1 seconds faster per pace level
  },
  
  wordSizeDistribution: {
    shortWords: 0.6,
    mediumWords: 0.25,
    longWords: 0.1,
    veryLongWords: 0.04,
    extremelyLongWords: 0.01,
    phrases: 0.0,
    longPhrases: 0.0,
  },
  
  rotationDistribution: {
    baseChance: 0.25,
    paceScaling: 0.05,
    maxRotation: 8,
    rotationSpeed: 1.0,
  },
  
  paceSlope: {
    speedIncrease: 0.3,
    rotationIncrease: 0.05,
  },
  
  fontSize: {
    min: 20,
    max: 100,
    distribution: 'random',
  },
  
  speed: {
    base: 1.5,
    variation: 1.5,
    paceScaling: 0.8, // Much more dramatic speed increase
  },
  
  specialEffects: {
    multipleWords: false,
    wordClusters: false,
    colorVariation: false,
    soundVariation: false,
  },
};


// Word Storm variation - slow but dense rain of words
export const WORD_STORM_VARIATION: GameVariation = {
  id: 'word-storm',
  name: 'Word Storm',
  description: 'A slow but dense rain of words - like a gentle storm of letters',
  
  wordPace: {
    baseInterval: 0.15, // Extremely frequent spawning - every 150ms
    intervalVariation: 0.1, // Small variation for natural feel
    paceScaling: 0.01, // Very slow pace scaling
  },
  
  wordSizeDistribution: {
    shortWords: 0.8,
    mediumWords: 0.15,
    longWords: 0.04,
    veryLongWords: 0.01,
    extremelyLongWords: 0.0,
    phrases: 0.0,
    longPhrases: 0.0,
  },
  
  rotationDistribution: {
    baseChance: 0.1,
    paceScaling: 0.02,
    maxRotation: 4,
    rotationSpeed: 0.5,
  },
  
  paceSlope: {
    speedIncrease: 0.05, // Very slow speed increase
    rotationIncrease: 0.01,
  },
  
  fontSize: {
    min: 12,
    max: 40,
    distribution: 'small-heavy',
  },
  
  speed: {
    base: 0.6, // Very slow falling speed
    variation: 0.3,
    paceScaling: 0.4, // Much more dramatic speed increase
  },
  
  specialEffects: {
    multipleWords: true,
    wordClusters: true,
    colorVariation: true,
    soundVariation: true,
  },
};

// Rotation madness variation - lots of rotating words
export const ROTATION_MADNESS_VARIATION: GameVariation = {
  id: 'rotation-madness',
  name: 'Rotation Madness',
  description: 'Words spin and rotate as they fall - a visual challenge',
  
  wordPace: {
    baseInterval: 1.5,
    intervalVariation: 0.4,
    paceScaling: 0.12,
  },
  
  wordSizeDistribution: {
    shortWords: 0.4,
    mediumWords: 0.35,
    longWords: 0.2,
    veryLongWords: 0.04,
    extremelyLongWords: 0.01,
    phrases: 0.0,
    longPhrases: 0.0,
  },
  
  rotationDistribution: {
    baseChance: 0.8,
    paceScaling: 0.1,
    maxRotation: 25,
    rotationSpeed: 3.0,
  },
  
  paceSlope: {
    speedIncrease: 0.35,
    rotationIncrease: 0.1,
  },
  
  fontSize: {
    min: 18,
    max: 90,
    distribution: 'random',
  },
  
  speed: {
    base: 1.8,
    variation: 1.2,
    paceScaling: 1.0, // Much more dramatic speed increase
  },
  
  specialEffects: {
    multipleWords: false,
    wordClusters: false,
    colorVariation: true,
    soundVariation: false,
  },
};

// Phrase master variation - focus on phrases and long text
export const PHRASE_MASTER_VARIATION: GameVariation = {
  id: 'phrase-master',
  name: 'Phrase Master',
  description: 'Master the art of typing complete phrases and sentences',
  
  wordPace: {
    baseInterval: 2.5, // Faster base spawning - NOT tied to user activity
    intervalVariation: 0.8,
    paceScaling: 0.08,
  },
  
  wordSizeDistribution: {
    shortWords: 0.05,
    mediumWords: 0.1,
    longWords: 0.2,
    veryLongWords: 0.3,
    extremelyLongWords: 0.15,
    phrases: 0.15,
    longPhrases: 0.05,
  },
  
  rotationDistribution: {
    baseChance: 0.15,
    paceScaling: 0.03,
    maxRotation: 6,
    rotationSpeed: 0.8,
  },
  
  paceSlope: {
    speedIncrease: 0.25,
    rotationIncrease: 0.03,
  },
  
  fontSize: {
    min: 20,
    max: 70,
    distribution: 'large-heavy',
  },
  
  speed: {
    base: 1.2,
    variation: 0.6,
    paceScaling: 0.7, // Much more dramatic speed increase
  },
  
  specialEffects: {
    multipleWords: false,
    wordClusters: false,
    colorVariation: false,
    soundVariation: false,
  },
};

// Classic variation - very easy for children learning to type
export const CLASSIC_VARIATION: GameVariation = {
  id: 'classic',
  name: 'Classic',
  description: 'Perfect for kids learning to type - slow words with lots of space',
  
  wordPace: {
    baseInterval: 4.0, // Very slow spawning - 4 seconds between words
    intervalVariation: 1.0, // Good variation for natural feel
    paceScaling: 0.05, // Very slow pace scaling
  },
  
  wordSizeDistribution: {
    shortWords: 0.9, // Almost all short words (3-5 letters)
    mediumWords: 0.1, // Only a few medium words
    longWords: 0.0, // No long words
    veryLongWords: 0.0, // No very long words
    extremelyLongWords: 0.0, // No extremely long words
    phrases: 0.0, // No phrases
    longPhrases: 0.0, // No long phrases
  },
  
  rotationDistribution: {
    baseChance: 0.0, // No rotation for simplicity
    paceScaling: 0.0,
    maxRotation: 0,
    rotationSpeed: 0,
  },
  
  paceSlope: {
    speedIncrease: 0.1, // Very slow speed increase
    rotationIncrease: 0.0,
  },
  
  fontSize: {
    min: 32, // Larger font for easier reading
    max: 48, // Consistent, readable size
    distribution: 'medium-focused',
  },
  
  speed: {
    base: 0.4, // Very slow falling speed
    variation: 0.2, // Small variation
    paceScaling: 0.2, // Slow speed increase
  },
  
  specialEffects: {
    multipleWords: false, // Only one word at a time
    wordClusters: false, // No clusters
    colorVariation: false, // Consistent colors
    soundVariation: false, // Consistent sounds
  },
};

// All available variations
export const GAME_VARIATIONS: Record<string, GameVariation> = {
  default: CLASSIC_VARIATION, // Classic is now the default
  classic: CLASSIC_VARIATION,
  hard: HARD_VARIATION,
  'word-storm': WORD_STORM_VARIATION,
  'rotation-madness': ROTATION_MADNESS_VARIATION,
  'phrase-master': PHRASE_MASTER_VARIATION,
};

// Get a variation by ID
export function getVariation(id: string): GameVariation {
  return GAME_VARIATIONS[id] || CLASSIC_VARIATION;
}

// Get all available variations
export function getAllVariations(): GameVariation[] {
  const variations = [
    CLASSIC_VARIATION,
    HARD_VARIATION,
    WORD_STORM_VARIATION,
    ROTATION_MADNESS_VARIATION,
    PHRASE_MASTER_VARIATION,
  ];
  return variations;
}

// Validate variation ID
export function isValidVariation(id: string): boolean {
  return id in GAME_VARIATIONS;
} 