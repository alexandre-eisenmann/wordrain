import { useGame } from "../../lib/stores/useGame";
import { useWordRain } from "../../lib/stores/useWordRain";
import { useGameLoop } from "./useGameLoop";
import FallingWord from "./FallingWord";
import ExplodingLetter from "./ExplodingLetter";

export default function WordRainCanvas() {
  const { phase } = useGame();
  const { words, explodingLetters } = useWordRain();

  // Drives the simulation while phase === "playing".
  useGameLoop();

  // Keep words rendered (frozen) during the stage-clear pause so they sit
  // behind the interstitial card instead of vanishing.
  if (phase !== "playing" && phase !== "stageClear") return null;

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
