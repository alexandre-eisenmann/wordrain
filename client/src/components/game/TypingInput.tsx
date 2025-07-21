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

  // Keep focus on the input during gameplay
  useEffect(() => {
    if (phase === "playing") {
      const interval = setInterval(() => {
        if (inputRef.current && document.activeElement !== inputRef.current) {
          inputRef.current.focus();
        }
      }, 100); // Check every 100ms

      return () => clearInterval(interval);
    }
  }, [phase]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (phase !== "playing") return;

    let key = event.key;
    
    // Handle space key specifically
    if (event.code === "Space") {
      event.preventDefault();
      const result = typeKey(" ");
      
      if (result.hit) {
        playHit();
      }
      if (result.completed) {
        playSuccess();
      }
      return;
    }
    
    // Handle other keys
    key = key.toLowerCase();
    
    // Only handle letter keys and common punctuation
    if (/^[a-z0-9.,!?'-]$/.test(key)) {
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
      className="absolute opacity-0 pointer-events-none"
      style={{
        position: 'absolute',
        left: '-9999px',
        top: '-9999px',
        width: '1px',
        height: '1px',
        opacity: 0,
        pointerEvents: 'none',
        background: 'transparent',
        border: 'none',
        outline: 'none'
      }}
      onKeyDown={handleKeyDown}
      autoComplete="off"
      spellCheck={false}
    />
  );
}
