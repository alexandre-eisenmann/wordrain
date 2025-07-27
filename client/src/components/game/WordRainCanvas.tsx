import { useEffect, useRef } from "react";
import { useGame } from "../../lib/stores/useGame";
import { useWordRain } from "../../lib/stores/useWordRain";
import { useVariation } from "../../lib/stores/useVariation";
import FallingWord from "./FallingWord";
import ExplodingLetter from "./ExplodingLetter";

export default function WordRainCanvas() {
  const { phase } = useGame();
  const { words, explodingLetters, updateGame, spawnWord, score, wordsTyped } = useWordRain();
  const { getCurrentVariation } = useVariation();
  const gameLoopRef = useRef<number>();
  const lastSpawnRef = useRef<number>(0);
  const gameStartTimeRef = useRef<number>(0);

  // Initialize game start time when phase changes to playing
  useEffect(() => {
    if (phase === "playing" && gameStartTimeRef.current === 0) {
      gameStartTimeRef.current = Date.now();
    } else if (phase !== "playing") {
      gameStartTimeRef.current = 0;
    }
  }, [phase]);

  // Game loop
  useEffect(() => {
    if (phase !== "playing") {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      return;
    }

    // Fallback timer to ensure words spawn
    const fallbackTimer = setInterval(() => {
      if (phase === "playing" && words.length < 20) { // Higher limit for fallback
        console.log("🎮 FALLBACK SPAWN - words.length:", words.length);
        spawnWord();
      }
    }, 2000); // Spawn every 2 seconds as fallback

    const gameLoop = (timestamp: number) => {
      const variation = getCurrentVariation();
      
      // Calculate pace based on words typed, not score
      const pace = Math.floor(wordsTyped / 20); // Increase pace every 20 words typed
      
      // Calculate spawn interval based on variation and pace
      const baseInterval = Math.max(500, (variation.wordPace.baseInterval * 1000) - 
        (pace * variation.wordPace.paceScaling * 1000));
      
      // Add random variation to interval
      const intervalVariation = variation.wordPace.intervalVariation * 1000;
      const finalInterval = Math.max(300, baseInterval + (Math.random() - 0.5) * intervalVariation);
      
      // Calculate max words based on variation and pace - much higher limits
      const maxWords = variation.id === 'word-storm' ? 
        Math.min(100, 20 + Math.floor(pace / 2)) : // Much higher max for Word Storm
        variation.specialEffects.multipleWords ? 
          Math.min(50, 10 + Math.floor(pace / 2)) : 
          Math.min(30, 8 + Math.floor(pace / 3));
      
      const timeSinceLastSpawn = timestamp - lastSpawnRef.current;
      
      // Always spawn words if enough time has passed, regardless of user activity
      if (timeSinceLastSpawn > finalInterval && words.length < maxWords) {
        console.log("🎮 SPAWNING WORD - timeSinceLastSpawn:", timeSinceLastSpawn, "finalInterval:", finalInterval, "words.length:", words.length, "maxWords:", maxWords);
        
        // Handle word clusters for Word Storm variation
        if (variation.id === 'word-storm' && Math.random() < 0.4) {
          // Spawn multiple words at once for Word Storm
          const clusterSize = Math.min(6, maxWords - words.length);
          for (let i = 0; i < clusterSize; i++) {
            setTimeout(() => spawnWord(), i * 25); // Very quick cluster spawns
          }
        } else if (variation.specialEffects.wordClusters && Math.random() < 0.3) {
          // Spawn multiple words at once for other variations
          const clusterSize = Math.min(3, maxWords - words.length);
          for (let i = 0; i < clusterSize; i++) {
            setTimeout(() => spawnWord(), i * 100); // Stagger cluster spawns
          }
        } else {
          spawnWord();
        }
        lastSpawnRef.current = timestamp;
      } else {
        console.log("🎮 NOT SPAWNING - timeSinceLastSpawn:", timeSinceLastSpawn, "finalInterval:", finalInterval, "words.length:", words.length, "maxWords:", maxWords);
      }

      // Update game state
      updateGame();

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      clearInterval(fallbackTimer); // Clean up fallback timer
    };
  }, [phase, words.length, updateGame, spawnWord, getCurrentVariation, score, wordsTyped]);

  if (phase !== "playing") return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Falling Words */}
      {words.map((word) => (
        <FallingWord key={word.id} word={word} />
      ))}
      
      {/* Exploding Letters */}
      {explodingLetters.map((letter) => (
        <ExplodingLetter key={letter.id} letter={letter} />
      ))}
    </div>
  );
}
