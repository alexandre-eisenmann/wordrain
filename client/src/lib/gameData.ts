// Word lists for the game
const WORD_LISTS = {
  common: [
    "the", "and", "you", "that", "was", "for", "are", "with", "his", "they",
    "this", "have", "from", "not", "had", "can", "but", "what", "said", "each",
    "which", "she", "how", "their", "has", "two", "more", "her", "like", "time",
    "very", "when", "come", "here", "just", "than", "long", "back", "way", "much"
  ],
  
  tech: [
    "code", "debug", "pixel", "array", "function", "variable", "algorithm", "binary",
    "compile", "syntax", "framework", "database", "server", "client", "protocol",
    "encryption", "interface", "recursion", "iteration", "parameter", "callback",
    "asynchronous", "dependency", "repository", "deployment", "optimization"
  ],
  
  nature: [
    "forest", "ocean", "mountain", "river", "sunset", "rainbow", "thunder", "lightning",
    "butterfly", "eagle", "dolphin", "tiger", "coral", "crystal", "meadow", "canyon",
    "waterfall", "aurora", "glacier", "volcano", "breeze", "storm", "moonlight", "starlight"
  ],
  
  creative: [
    "imagination", "inspiration", "creativity", "artistry", "elegance", "harmony", 
    "symphony", "poetry", "painting", "sculpture", "dance", "melody", "rhythm",
    "texture", "gradient", "perspective", "composition", "balance", "contrast", "vivid"
  ]
};

// Font families for cyberpunk typography
const FONT_FAMILIES = [
  // Monospace fonts (primary for cyberpunk aesthetic)
  '"Courier New", monospace',
  'Monaco, monospace',
  '"Fira Code", monospace',
  '"Source Code Pro", monospace',
  '"JetBrains Mono", monospace',
  
  // Tech/Display fonts
  '"Impact", fantasy',
  '"Arial Black", sans-serif',
  '"Roboto Condensed", sans-serif',
  
  // Clean Sans-serif
  'Arial, sans-serif',
  'Helvetica, sans-serif',
  '"Roboto", sans-serif',
  
  // Bold display
  '"Orbitron", sans-serif',
  '"Exo 2", sans-serif',
  '"Rajdhani", sans-serif'
];

// Get a random word from all categories
export function getRandomWord(): string {
  const allCategories = Object.values(WORD_LISTS);
  const allWords = allCategories.flat();
  return allWords[Math.floor(Math.random() * allWords.length)];
}

// Get a random word from a specific category
export function getRandomWordFromCategory(category: keyof typeof WORD_LISTS): string {
  const words = WORD_LISTS[category];
  return words[Math.floor(Math.random() * words.length)];
}

// Get a random font family
export function getFontFamily(): string {
  return FONT_FAMILIES[Math.floor(Math.random() * FONT_FAMILIES.length)];
}

// Get a font family based on word category (for themed styling)
export function getThemedFontFamily(category: keyof typeof WORD_LISTS): string {
  switch (category) {
    case 'tech':
      // Monospace fonts for tech words
      return ['"Courier New", monospace', 'Monaco, monospace', '"Fira Code", monospace'][
        Math.floor(Math.random() * 3)
      ];
    case 'creative':
      // Elegant serif fonts for creative words
      return ['Georgia, serif', '"Playfair Display", serif', '"Merriweather", serif'][
        Math.floor(Math.random() * 3)
      ];
    case 'nature':
      // Clean sans-serif fonts for nature words
      return ['"Open Sans", sans-serif', '"Roboto", sans-serif', '"Lato", sans-serif'][
        Math.floor(Math.random() * 3)
      ];
    default:
      return getFontFamily();
  }
}

export { WORD_LISTS, FONT_FAMILIES };
