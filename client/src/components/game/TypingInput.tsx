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
    // Scroll the input into view on mobile
    if (isMobile && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 100);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  if (phase !== "playing") return null;

  // For mobile, show a sexy cyberpunk button-style input
  if (isMobile) {
    return (
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="relative group">
          {/* Glow effect */}
          <div 
            className={`absolute inset-0 rounded-xl blur-sm transition-all duration-300 ${
              isFocused 
                ? 'bg-cyan-400 opacity-60' 
                : 'bg-cyan-400 opacity-20'
            }`}
          />
          
          {/* Button container */}
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              className={`w-40 h-12 px-4 bg-gray-900 bg-opacity-90 backdrop-blur-md border-2 rounded-xl text-white text-center font-mono text-sm placeholder-gray-400 focus:outline-none transition-all duration-300 ${
                isFocused 
                  ? 'border-cyan-300 shadow-lg shadow-cyan-300/50' 
                  : 'border-cyan-500 border-opacity-50 hover:border-cyan-400 hover:border-opacity-70'
              }`}
              placeholder="TAP TO TYPE"
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
              autoComplete="off"
              spellCheck={false}
              style={{
                boxShadow: isFocused 
                  ? "0 0 20px rgba(34, 211, 238, 0.4), inset 0 0 20px rgba(34, 211, 238, 0.1)" 
                  : "0 0 10px rgba(34, 211, 238, 0.2)"
              }}
            />
            
            {/* Animated border effect */}
            <div 
              className={`absolute inset-0 rounded-xl border-2 border-transparent transition-all duration-300 ${
                isFocused ? 'border-cyan-300 opacity-100' : 'opacity-0'
              }`}
              style={{
                background: isFocused 
                  ? 'linear-gradient(45deg, transparent, rgba(34, 211, 238, 0.3), transparent)' 
                  : 'transparent'
              }}
            />
          </div>
        </div>
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
