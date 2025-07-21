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
  const [showMobileInput, setShowMobileInput] = useState(false);

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
          // On mobile, show the input button when focus is lost
          if (isMobile) {
            setShowMobileInput(true);
          }
        }
      }, 100); // Check every 100ms

      return () => clearInterval(interval);
    }
  }, [phase, isMobile]);

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
    setShowMobileInput(false);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (isMobile) {
      setShowMobileInput(true);
    }
  };

  const handleMobileInputClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  if (phase !== "playing") return null;

  // For mobile, show a subtle floating button when keyboard is dismissed
  if (isMobile) {
    return (
      <>
        {/* Hidden input for actual typing */}
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
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoComplete="off"
          spellCheck={false}
        />
        
        {/* Floating keyboard button - only shows when needed */}
        {showMobileInput && (
          <button
            onClick={handleMobileInputClick}
            className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-gray-900 bg-opacity-60 backdrop-blur-sm border border-cyan-400 border-opacity-30 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-opacity-80 hover:border-opacity-50 hover:scale-110 group"
            style={{
              boxShadow: "0 0 15px rgba(34, 211, 238, 0.2)"
            }}
            aria-label="Show keyboard"
          >
            <svg 
              className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors duration-200" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </button>
        )}
      </>
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
