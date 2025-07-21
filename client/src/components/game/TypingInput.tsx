import { useEffect, useRef, useState } from "react";
import { useGame } from "../../lib/stores/useGame";
import { useWordRain } from "../../lib/stores/useWordRain";
import { useAudio } from "../../lib/stores/useAudio";
import { useIsMobile } from "../../hooks/use-is-mobile";

export default function TypingInput() {
  const { phase } = useGame();
  const { typeKey } = useWordRain();
  const { playHit, playSuccess } = useAudio();
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const [isFocused, setIsFocused] = useState(false);

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

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  if (phase !== "playing") return null;

  // For mobile, show a minimal input field that's always accessible
  if (isMobile) {
    return (
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <input
          ref={inputRef}
          type="text"
          className={`w-48 px-3 py-2 bg-gray-900 bg-opacity-40 backdrop-blur-sm border rounded-lg text-white text-center font-mono text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-opacity-50 transition-all duration-200 ${
            isFocused 
              ? 'border-cyan-300 focus:border-cyan-300 focus:ring-cyan-300' 
              : 'border-gray-600 border-opacity-30 focus:border-cyan-300 focus:ring-cyan-300'
          }`}
          placeholder="tap to type..."
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoComplete="off"
          spellCheck={false}
          style={{
            boxShadow: isFocused 
              ? "0 0 15px rgba(34, 211, 238, 0.3)" 
              : "0 0 8px rgba(34, 211, 238, 0.1)"
          }}
        />
      </div>
    );
  }

  // For desktop, keep the hidden input
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
