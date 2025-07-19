import { useEffect, useRef } from "react";
import { useGame } from "../../lib/stores/useGame";
import { useWordRain } from "../../lib/stores/useWordRain";
import { useAudio } from "../../lib/stores/useAudio";

export default function TypingInput() {
  const { phase } = useGame();
  const { typeKey } = useWordRain();
  const { playHit, playSuccess } = useAudio();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (phase === "playing" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [phase]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (phase !== "playing") return;

    const key = event.key.toLowerCase();
    
    // Only handle letter keys and common punctuation
    if (/^[a-z0-9\s.,!?'-]$/.test(key)) {
      event.preventDefault();
      const result = typeKey(key);
      
      if (result.hit) {
        playHit();
      }
      if (result.completed) {
        playSuccess();
      }
    }
  };

  if (phase !== "playing") return null;

  return (
    <input
      ref={inputRef}
      type="text"
      className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-64 px-4 py-2 bg-gray-900 bg-opacity-80 border border-cyan-400 border-opacity-50 rounded-lg text-cyan-300 placeholder-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 backdrop-blur-sm font-mono"
      placeholder="INPUT STREAM..."
      onKeyDown={handleKeyDown}
      autoComplete="off"
      spellCheck={false}
      style={{
        boxShadow: "0 0 15px rgba(34, 211, 238, 0.3)"
      }}
    />
  );
}
