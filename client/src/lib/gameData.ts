// Import word lists
import { WORDLIST } from "./bip39";
import { LONG_WORDLIST } from "./longWords";
import { PHRASE_LIST } from "./phrases";
import { LONG_PHRASE_LIST } from "./longPhrases";

// Combine all word lists
const ALL_WORDS = [...WORDLIST, ...LONG_WORDLIST, ...PHRASE_LIST, ...LONG_PHRASE_LIST];

// Preprocess words by length for progressive difficulty
const WORDS_BY_LENGTH = new Map<number, string[]>();

// Initialize word length categories
ALL_WORDS.forEach(word => {
  const length = word.length;
  if (!WORDS_BY_LENGTH.has(length)) {
    WORDS_BY_LENGTH.set(length, []);
  }
  WORDS_BY_LENGTH.get(length)!.push(word);
});

// Get available word lengths (sorted)
const AVAILABLE_LENGTHS = Array.from(WORDS_BY_LENGTH.keys()).sort((a, b) => a - b);

// Log word length distribution for debugging
console.log('Combined Word Length Distribution:');
AVAILABLE_LENGTHS.forEach(length => {
  const count = WORDS_BY_LENGTH.get(length)!.length;
  console.log(`${length} letters: ${count} words`);
});

// Track word usage for debugging randomness
const wordUsageCount = new Map<string, number>();

// Word lists for the game - combined BIP39, long words, phrases, and long phrases
const WORD_LISTS = {
  bip39: WORDLIST,
  longWords: LONG_WORDLIST,
  phrases: PHRASE_LIST,
  longPhrases: LONG_PHRASE_LIST,
  combined: ALL_WORDS
};

// Font families for cyberpunk typography
const FONT_FAMILIES = [
  // Monospace fonts (primary for cyberpunk aesthetic)
  '"Courier New", monospace',
  'Monaco, monospace',
  '"Fira Code", monospace',
  '"Source Code Pro", monospace',
  '"JetBrains Mono", monospace',
  '"Cascadia Code", monospace',
  '"Hack", monospace',
  '"Inconsolata", monospace',
  '"Anonymous Pro", monospace',
  '"Space Mono", monospace',
  '"IBM Plex Mono", monospace',
  '"Roboto Mono", monospace',
  
  // Tech/Display fonts
  '"Impact", fantasy',
  '"Arial Black", sans-serif',
  '"Roboto Condensed", sans-serif',
  '"Bebas Neue", sans-serif',
  '"Oswald", sans-serif',
  '"Anton", sans-serif',
  '"Righteous", sans-serif',
  '"Fredoka One", sans-serif',
  '"Bangers", sans-serif',
  '"Permanent Marker", cursive',
  '"Rock Salt", cursive',
  '"Shadows Into Light", cursive',
  
  // Clean Sans-serif
  'Arial, sans-serif',
  'Helvetica, sans-serif',
  '"Roboto", sans-serif',
  '"Open Sans", sans-serif',
  '"Lato", sans-serif',
  '"Nunito", sans-serif',
  '"Poppins", sans-serif',
  '"Inter", sans-serif',
  '"Ubuntu", sans-serif',
  '"Noto Sans", sans-serif',
  '"Source Sans Pro", sans-serif',
  '"Work Sans", sans-serif',
  '"Montserrat", sans-serif',
  '"Raleway", sans-serif',
  
  // Bold display
  '"Orbitron", sans-serif',
  '"Exo 2", sans-serif',
  '"Rajdhani", sans-serif',
  '"Audiowide", sans-serif',
  '"Chakra Petch", sans-serif',
  '"Syncopate", sans-serif',
  '"Wallpoet", sans-serif',
  '"Russo One", sans-serif',
  '"Black Ops One", sans-serif',
  '"Press Start 2P", sansospace',
  '"VT323", monospace',
  '"Share Tech Mono", monospace',
  '"Audiowide", sans-serif',
  
  // Serif fonts
  'Georgia, serif',
  '"Times New Roman", serif',
  '"Playfair Display", serif',
  '"Merriweather", serif',
  '"Lora", serif',
  '"Crimson Text", serif',
  '"Libre Baskerville", serif',
  '"Source Serif Pro", serif',
  '"Noto Serif", serif',
  '"Bitter", serif',
  '"Spectral", serif',
  
  // Handwriting/Script fonts
  '"Dancing Script", cursive',
  '"Pacifico", cursive',
  '"Great Vibes", cursive',
  '"Satisfy", cursive',
  '"Kaushan Script", cursive',
  '"Allura", cursive',
  '"Alex Brush", cursive',
  '"Yellowtail", cursive',
  '"Tangerine", cursive',
  '"Sacramento", cursive',
  
  // Decorative/Display fonts
  '"Lobster", cursive',
  '"Bungee", sans-serif',
  '"Bungee Shade", sans-serif',
  '"Faster One", sans-serif',
  '"Fascinate", sans-serif',
  '"Fascinate Inline", sans-serif',
  '"Flavors", sans-serif',
  '"Fondamento", serif',
  '"Freckle Face", sans-serif',
  '"Frijole", sans-serif',
  '"Galada", cursive',
  '"Goblin One", sans-serif',
  '"Gorditas", sans-serif',
  '"Graduate", sans-serif',
  '"Grand Hotel", cursive',
  '"Gravitas One", sans-serif',
  '"Henny Penny", sans-serif',
  '"Holtwood One SC", serif',
  '"Homemade Apple", cursive',
  '"Iceberg", sans-serif',
  '"Iceland", sans-serif',
  '"Indie Flower", cursive',
  '"Irish Grover", sans-serif',
  '"Italianno", cursive',
  '"Jim Nightshade", cursive',
  '"Julee", cursive',
  '"Just Another Hand", cursive',
  '"Just Me Again Down Here", cursive',
  '"Kalam", cursive',
  '"Kaushan Script", cursive',
  '"Kavoon", sans-serif',
  '"Knewave", sans-serif',
  '"Kranky", sans-serif',
  '"Kreon", serif',
  '"Kristi", cursive',
  '"Kumar One", sans-serif',
  '"Kumar One Outline", sans-serif',
  '"Lakki Reddy", cursive',
  '"Lancelot", serif',
  '"Lato", sans-serif',
  '"League Script", cursive',
  '"Leckerli One", cursive',
  '"Ledger", serif',
  '"Lekton", sans-serif',
  '"Lemon", sans-serif',
  '"Libre Baskerville", serif',
  '"Life Savers", sans-serif',
  '"Lilita One", sans-serif',
  '"Limelight", sans-serif',
  '"Linden Hill", serif',
  '"Lobster", cursive',
  '"Lobster Two", sans-serif',
  '"Londrina Outline", sans-serif',
  '"Londrina Shadow", sans-serif',
  '"Londrina Sketch", sans-serif',
  '"Londrina Solid", sans-serif',
  '"Lora", serif',
  '"Love Ya Like A Sister", sans-serif',
  '"Loved by the King", cursive',
  '"Lovers Quarrel", cursive',
  '"Luckiest Guy", sans-serif',
  '"Lusitana", serif',
  '"Lustria", serif',
  '"Macondo", cursive',
  '"Macondo Swash Caps", cursive',
  '"Magra", sans-serif',
  '"Maiden Orange", sans-serif',
  '"Mako", sans-serif',
  '"Mallanna", sans-serif',
  '"Mandali", sans-serif',
  '"Marcellus", serif',
  '"Marcellus SC", serif',
  '"Marck Script", cursive',
  '"Margarine", sans-serif',
  '"Marko One", serif',
  '"Marmelad", sans-serif',
  '"Marvel", sans-serif',
  '"Mate", serif',
  '"Mate SC", serif',
  '"Maven Pro", sans-serif',
  '"McLaren", sans-serif',
  '"Meddon", cursive',
  '"MedievalSharp", cursive',
  '"Medula One", sans-serif',
  '"Megrim", sans-serif',
  '"Meie Script", cursive',
  '"Merienda", cursive',
  '"Merienda One", cursive',
  '"Merriweather", serif',
  '"Merriweather Sans", sans-serif',
  '"Metal", sans-serif',
  '"Metal Mania", sans-serif',
  '"Metamorphous", sans-serif',
  '"Metrophobic", sans-serif',
  '"Michroma", sans-serif',
  '"Milonga", sans-serif',
  '"Miltonian", sans-serif',
  '"Miltonian Tattoo", sans-serif',
  '"Miniver", sans-serif',
  '"Miss Fajardose", cursive',
  '"Modern Antiqua", sans-serif',
  '"Molengo", sans-serif',
  '"Molle", cursive',
  '"Monda", sans-serif',
  '"Monofett", sans-serif',
  '"Monoton", sans-serif',
  '"Monsieur La Doulaise", cursive',
  '"Montaga", serif',
  '"Montez", cursive',
  '"Montserrat", sans-serif',
  '"Montserrat Alternates", sans-serif',
  '"Montserrat Subrayada", sans-serif',
  '"Moul", sans-serif',
  '"Moulpali", sans-serif',
  '"Mountains of Christmas", cursive',
  '"Mouse Memoirs", sans-serif',
  '"Mr Bedfort", cursive',
  '"Mr Dafoe", cursive',
  '"Mr De Haviland", cursive',
  '"Mrs Saint Delafield", cursive',
  '"Mrs Sheppards", cursive',
  '"Muli", sans-serif',
  '"Mystery Quest", sans-serif',
  '"Neucha", sans-serif',
  '"Neuton", serif',
  '"New Rocker", sans-serif',
  '"News Cycle", sans-serif',
  '"Niconne", cursive',
  '"Nixie One", sans-serif',
  '"Nobile", sans-serif',
  '"Nokora", sans-serif',
  '"Norican", cursive',
  '"Nosifer", sans-serif',
  '"Nothing You Could Do", cursive',
  '"Noticia Text", serif',
  '"Noto Sans", sans-serif',
  '"Noto Serif", serif',
  '"Nova Cut", sans-serif',
  '"Nova Flat", sans-serif',
  '"Nova Mono", sansospace',
  '"Nova Oval", sans-serif',
  '"Nova Round", sans-serif',
  '"Nova Script", sans-serif',
  '"Nova Slim", sans-serif',
  '"Nova Square", sans-serif',
  '"Numans", sans-serif',
  '"Nunito", sans-serif',
  '"Odor Mean Chey", sans-serif',
  '"Offside", sans-serif',
  '"Old Standard TT", serif',
  '"Oldenburg", sans-serif',
  '"Oleo Script", sans-serif',
  '"Oleo Script Swash Caps", sans-serif',
  '"Open Sans", sans-serif',
  '"Open Sans Condensed", sans-serif',
  '"Oranienbaum", serif',
  '"Orbitron", sans-serif',
  '"Oregano", sans-serif',
  '"Orienta", sans-serif',
  '"Original Surfer", sans-serif',
  '"Oswald", sans-serif',
  '"Over the Rainbow", cursive',
  '"Overlock", sans-serif',
  '"Overlock SC", sans-serif',
  '"Ovo", serif',
  '"Oxygen", sans-serif',
  '"Oxygen Mono", sansospace',
  '"Pacifico", cursive',
  '"Paprika", sans-serif',
  '"Parisienne", cursive',
  '"Passero One", sans-serif',
  '"Passion One", sans-serif',
  '"Pathway Gothic One", sans-serif',
  '"Patrick Hand", cursive',
  '"Patrick Hand SC", sans-serif',
  '"Patua One", sans-serif',
  '"Paytone One", sans-serif',
  '"Peralta", sans-serif',
  '"Permanent Marker", cursive',
  '"Petit Formal Script", cursive',
  '"Petrona", serif',
  '"Philosopher", sans-serif',
  '"Piedra", sans-serif',
  '"Pinyon Script", cursive',
  '"Pirata One", sans-serif',
  '"Plaster", sans-serif',
  '"Play", sans-serif',
  '"Playball", cursive',
  '"Playfair Display", sans-serif',
  '"Playfair Display SC", sans-serif',
  '"Podkova", serif',
  '"Poiret One", sans-serif',
  '"Poller One", sans-serif',
  '"Poly", serif',
  '"Pompiere", sans-serif',
  '"Pontano Sans", sans-serif',
  '"Port Lligat Sans", sans-serif',
  '"Port Lligat Slab", serif',
  '"Pragati Narrow", sans-serif',
  '"Prata", serif',
  '"Preahvihear", sans-serif',
  '"Press Start 2P", sansospace',
  '"Princess Sofia", cursive',
  '"Prociono", serif',
  '"Prosto One", sans-serif',
  '"Puritan", sans-serif',
  '"Quando", serif',
  '"Quantico", sans-serif',
  '"Quattrocento", serif',
  '"Quattrocento Sans", sans-serif',
  '"Questrial", sans-serif',
  '"Quicksand", sans-serif',
  '"Quintessential", cursive',
  '"Qwigley", cursive',
  '"Racing Sans One", sans-serif',
  '"Radley", serif',
  '"Raleway", sans-serif',
  '"Raleway Dots", sans-serif',
  '"Rambla", sans-serif',
  '"Rammetto One", sans-serif',
  '"Ranchers", sans-serif',
  '"Rancho", cursive',
  '"Rationale", sans-serif',
  '"Redressed", cursive',
  '"Reenie Beanie", cursive',
  '"Revalia", sans-serif',
  '"Ribeye", sans-serif',
  '"Ribeye Marrow", sans-serif',
  '"Righteous", sans-serif',
  '"Risque", sans-serif',
  '"Roboto", sans-serif',
  '"Roboto Condensed", sans-serif',
  '"Roboto Slab", serif',
  '"Rochester", cursive',
  '"Rock Salt", cursive',
  '"Rokkitt", serif',
  '"Romanesco", cursive',
  '"Ropa Sans", sans-serif',
  '"Rosario", sans-serif',
  '"Rosarivo", serif',
  '"Rouge Script", cursive',
  '"Rozha One", serif',
  '"Rubik", sans-serif',
  '"Rubik Mono One", sans-serif',
  '"Rubik One", sans-serif',
  '"Ruda", sans-serif',
  '"Rufina", serif',
  '"Ruge Boogie", cursive',
  '"Ruluko", sans-serif',
  '"Rum Raisin", sans-serif',
  '"Ruslan Display", sans-serif',
  '"Russo One", sans-serif',
  '"Ruthie", cursive',
  '"Rye", sans-serif',
  '"Sacramento", cursive',
  '"Sail", sans-serif',
  '"Salsa", sans-serif',
  '"Sanchez", serif',
  '"Sancreek", sans-serif',
  '"Sansita One", sans-serif',
  '"Sarina", sans-serif',
  '"Satisfy", cursive',
  '"Scada", sans-serif',
  '"Schoolbell", cursive',
  '"Seaweed Script", sans-serif',
  '"Sevillana", cursive',
  '"Seymour One", sans-serif',
  '"Shadows Into Light", cursive',
  '"Shadows Into Light Two", cursive',
  '"Shanti", sans-serif',
  '"Share", sans-serif',
  '"Share Tech", sans-serif',
  '"Share Tech Mono", sansospace',
  '"Shojumaru", sans-serif',
  '"Short Stack", cursive',
  '"Siemreap", sans-serif',
  '"Sigmar One", sans-serif',
  '"Signika", sans-serif',
  '"Signika Negative", sans-serif',
  '"Simonetta", sans-serif',
  '"Sintony", sans-serif',
  '"Sirin Stencil", sans-serif',
  '"Six Caps", sans-serif',
  '"Skranji", sans-serif',
  '"Slabo 13px", serif',
  '"Slabo 27px", serif',
  '"Slackey", sans-serif',
  '"Smokum", sans-serif',
  '"Smythe", sans-serif',
  '"Sniglet", sans-serif',
  '"Snippet", sans-serif',
  '"Snowburst One", sans-serif',
  '"Sofadi One", sans-serif',
  '"Sofia", sans-serif',
  '"Sonsie One", sans-serif',
  '"Sorts Mill Goudy", serif',
  '"Source Code Pro", sansospace',
  '"Source Sans Pro", sans-serif',
  '"Source Serif Pro", serif',
  '"Special Elite", sans-serif',
  '"Spicy Rice", sans-serif',
  '"Spinnaker", sans-serif',
  '"Spirax", sans-serif',
  '"Squada One", sans-serif',
  '"Stalemate", cursive',
  '"Stalinist One", sans-serif',
  '"Stardos Stencil", sans-serif',
  '"Stint Ultra Condensed", sans-serif',
  '"Stint Ultra Expanded", sans-serif',
  '"Stoke", serif',
  '"Strait", sans-serif',
  '"Sue Ellen Francisco", cursive',
  '"Sunshiney", cursive',
  '"Supermercado One", sans-serif',
  '"Suwannaphum", sans-serif',
  '"Swanky and Moo Moo", cursive',
  '"Syncopate", sans-serif',
  '"Tangerine", cursive',
  '"Taprom", sans-serif',
  '"Tauri", sans-serif',
  '"Teko", sans-serif',
  '"Telex", sans-serif',
  '"Tenor Sans", sans-serif',
  '"Text Me One", sans-serif',
  '"The Girl Next Door", cursive',
  '"Tienne", serif',
  '"Tinos", serif',
  '"Titan One", sans-serif',
  '"Titillium Web", sans-serif',
  '"Trade Winds", sans-serif',
  '"Trocchi", serif',
  '"Trochut", sans-serif',
  '"Trykker", serif',
  '"Tulpen One", sans-serif',
  '"Ubuntu", sans-serif',
  '"Ubuntu Condensed", sans-serif',
  '"Ubuntu Mono", sansospace',
  '"Ultra", serif',
  '"Uncial Antiqua", sans-serif',
  '"Underdog", sans-serif',
  '"Unica One", sans-serif',
  '"UnifrakturCook", sans-serif',
  '"UnifrakturMaguntia", sans-serif',
  '"Unkempt", sans-serif',
  '"Unlock", sans-serif',
  '"Unna", serif',
  '"VT323", sansospace',
  '"Vampiro One", sans-serif',
  '"Varela", sans-serif',
  '"Varela Round", sans-serif',
  '"Vast Shadow", sans-serif',
  '"Vesper Libre", serif',
  '"Vibur", cursive',
  '"Vidaloka", serif',
  '"Viga", sans-serif',
  '"Voces", sans-serif',
  '"Volkhov", serif',
  '"Vollkorn", serif',
  '"Voltaire", sans-serif',
  '"Waiting for the Sunrise", cursive',
  '"Wallpoet", sans-serif',
  '"Walter Turncoat", cursive',
  '"Warnes", sans-serif',
  '"Wellfleet", sans-serif',
  '"Wendy One", sans-serif',
  '"Wire One", sans-serif',
  '"Yanone Kaffeesatz", sans-serif',
  '"Yellowtail", cursive',
  '"Yeseva One", sans-serif',
  '"Yesteryear", cursive',
  '"Zeyada", cursive'
];

// Get a random word with distribution-based progressive difficulty
export function getRandomWord(wordsTyped: number = 0): string {
  // Calculate difficulty level based on words typed
  const difficultyLevel = Math.floor(wordsTyped / 10);
  
  // Define length categories with their base probabilities
  const lengthCategories = [
    { min: 3, max: 5, baseProb: 0.6 },    // Short words (3-5 letters)
    { min: 6, max: 8, baseProb: 0.25 },   // Medium words (6-8 letters)
    { min: 9, max: 12, baseProb: 0.1 },   // Long words (9-12 letters)
    { min: 13, max: 20, baseProb: 0.04 }, // Very long words (13-20 letters)
    { min: 21, max: 999, baseProb: 0.01 } // Extremely long words (21+ letters)
  ];
  
  // Adjust probabilities based on difficulty level
  const adjustedProbabilities = lengthCategories.map((category, index) => {
    let adjustedProb = category.baseProb;
    
    // Reduce short word probability and increase long word probability as difficulty increases
    if (index === 0) { // Short words
      adjustedProb = Math.max(0.1, category.baseProb - (difficultyLevel * 0.08));
    } else if (index === 1) { // Medium words
      adjustedProb = category.baseProb + (difficultyLevel * 0.02);
    } else if (index === 2) { // Long words
      adjustedProb = category.baseProb + (difficultyLevel * 0.03);
    } else if (index === 3) { // Very long words
      adjustedProb = category.baseProb + (difficultyLevel * 0.02);
    } else { // Extremely long words
      adjustedProb = category.baseProb + (difficultyLevel * 0.01);
    }
    
    return { ...category, adjustedProb };
  });
  
  // Normalize probabilities to sum to 1
  const totalProb = adjustedProbabilities.reduce((sum, cat) => sum + cat.adjustedProb, 0);
  const normalizedProbabilities = adjustedProbabilities.map(cat => ({
    ...cat,
    normalizedProb: cat.adjustedProb / totalProb
  }));
  
  // Debug logging (only for first few calls)
  if (wordsTyped < 5) {
    console.log(`Difficulty Level ${difficultyLevel} (wordsTyped: ${wordsTyped}):`);
    normalizedProbabilities.forEach((cat, i) => {
      console.log(`  ${cat.min}-${cat.max} letters: ${(cat.normalizedProb * 100).toFixed(1)}%`);
    });
  }
  
  // Generate random number to select category
  const random = Math.random();
  let cumulativeProb = 0;
  let selectedCategory = normalizedProbabilities[0];
  
  for (const category of normalizedProbabilities) {
    cumulativeProb += category.normalizedProb;
    if (random <= cumulativeProb) {
      selectedCategory = category;
      break;
    }
  }
  
  // Get available lengths within the selected category
  const availableLengths = AVAILABLE_LENGTHS.filter(length => 
    length >= selectedCategory.min && length <= selectedCategory.max
  );
  
  if (availableLengths.length === 0) {
    // Fallback to any word if no words in selected category
    return WORD_LISTS.combined[Math.floor(Math.random() * WORD_LISTS.combined.length)];
  }
  
  // Select a random length from available lengths in the category
  const selectedLength = availableLengths[Math.floor(Math.random() * availableLengths.length)];
  
  // Get words of the selected length
  const wordsOfLength = WORDS_BY_LENGTH.get(selectedLength)!;
  
  // Get the selected word
  const selectedWord = wordsOfLength[Math.floor(Math.random() * wordsOfLength.length)];
  
  // Track word usage for debugging
  const currentCount = wordUsageCount.get(selectedWord) || 0;
  wordUsageCount.set(selectedWord, currentCount + 1);
  
  // Debug: Log the selected word for verification
  if (wordsTyped < 10) {
    console.log(`Selected word: "${selectedWord}" (${selectedLength} letters, category: ${selectedCategory.min}-${selectedCategory.max})`);
  }
  
  // Log if a word is repeated (should be rare with 2358 words)
  if (currentCount > 0) {
    console.log(`⚠️ Word repeated: "${selectedWord}" (used ${currentCount + 1} times)`);
  }
  
  // Return the selected word
  return selectedWord;
}

// Get a random word from a specific category
export function getRandomWordFromCategory(category: keyof typeof WORD_LISTS, wordsTyped: number = 0): string {
  if (category === 'bip39') {
    return WORD_LISTS.bip39[Math.floor(Math.random() * WORD_LISTS.bip39.length)];
  } else if (category === 'longWords') {
    return WORD_LISTS.longWords[Math.floor(Math.random() * WORD_LISTS.longWords.length)];
  } else if (category === 'phrases') {
    return WORD_LISTS.phrases[Math.floor(Math.random() * WORD_LISTS.phrases.length)];
  } else if (category === 'longPhrases') {
    return WORD_LISTS.longPhrases[Math.floor(Math.random() * WORD_LISTS.longPhrases.length)];
  } else {
    return getRandomWord(wordsTyped);
  }
}

// Get a random BIP39 word specifically
export function getRandomBip39Word(wordsTyped: number = 0): string {
  return WORD_LISTS.bip39[Math.floor(Math.random() * WORD_LISTS.bip39.length)];
}

// Get a random long word specifically
export function getRandomLongWord(wordsTyped: number = 0): string {
  return WORD_LISTS.longWords[Math.floor(Math.random() * WORD_LISTS.longWords.length)];
}

// Get a random phrase specifically
export function getRandomPhrase(wordsTyped: number = 0): string {
  return WORD_LISTS.phrases[Math.floor(Math.random() * WORD_LISTS.phrases.length)];
}

// Get a random long phrase specifically
export function getRandomLongPhrase(wordsTyped: number = 0): string {
  return WORD_LISTS.longPhrases[Math.floor(Math.random() * WORD_LISTS.longPhrases.length)];
}

// Get a random font family
export function getFontFamily(): string {
  return FONT_FAMILIES[Math.floor(Math.random() * FONT_FAMILIES.length)];
}

// Get a font family for BIP39 words (cryptocurrency/security theme)
export function getThemedFontFamily(category: keyof typeof WORD_LISTS): string {
  // Clean, readable fonts for BIP39 words
  return ['"Courier New", monospace', '"Fira Code", monospace', '"Source Code Pro", monospace', '"Roboto Mono", monospace'][
    Math.floor(Math.random() * 4)
  ];
}

export { WORD_LISTS, FONT_FAMILIES };
