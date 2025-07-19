import { useEffect, useRef } from "react";
import { useGame } from "../../lib/stores/useGame";
import { useWordRain } from "../../lib/stores/useWordRain";
import FallingWord from "./FallingWord";
import ExplodingLetter from "./ExplodingLetter";

export default function WordRainCanvas() {
  const { phase } = useGame();
  const { words, explodingLetters, updateGame, spawnWord } = useWordRain();
  const gameLoopRef = useRef<number>();
  const lastSpawnRef = useRef<number>(0);

  // Game loop
  useEffect(() => {
    if (phase !== "playing") {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      return;
    }

    const gameLoop = (timestamp: number) => {
      // Spawn new words based on difficulty
      const timeSinceLastSpawn = timestamp - lastSpawnRef.current;
      const spawnInterval = Math.max(1000, 3000 - words.length * 100); // Faster spawning as score increases
      
      if (timeSinceLastSpawn > spawnInterval) {
        spawnWord();
        lastSpawnRef.current = timestamp;
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
    };
  }, [phase, words.length, updateGame, spawnWord]);

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
