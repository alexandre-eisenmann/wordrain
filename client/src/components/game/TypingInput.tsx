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
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Auto-focus when game starts, with mobile-friendly approach
  useEffect(() => {
    if (phase === "playing" && inputRef.current) {
      // On mobile, try to focus but don't rely on it for keyboard
      if (isMobile) {
        // Set a flag that we can focus after user interaction
        setHasUserInteracted(false);
        setKeyboardVisible(false);
      } else {
        // On desktop, always focus
        inputRef.current.focus();
      }
    }
  }, [phase, isMobile]);

  // Keep focus on the input during gameplay
  useEffect(() => {
    if (phase === "playing") {
      const interval = setInterval(() => {
        if (inputRef.current && document.activeElement !== inputRef.current && !isMobile) {
          inputRef.current.focus();
        }
      }, 100); // Check every 100ms
      return () => clearInterval(interval);
    }
  }, [phase, isMobile]);

  // Detect keyboard visibility on mobile
  useEffect(() => {
    if (!isMobile) return;

    let initialViewportHeight = window.visualViewport?.height || window.innerHeight;
    let timeoutId: NodeJS.Timeout;

    const checkKeyboardVisibility = () => {
      const currentHeight = window.visualViewport?.height || window.innerHeight;
      const isKeyboardOpen = currentHeight < initialViewportHeight * 0.8;
      
      setKeyboardVisible(isKeyboardOpen);
    };

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkKeyboardVisibility, 100);
    };

    window.addEventListener('resize', handleResize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
      clearTimeout(timeoutId);
    };
  }, [isMobile]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (phase !== "playing") return;
    let key = event.key;
    // Handle space key specifically
    if (event.code === "Space") {
      event.preventDefault();
      const result = typeKey(" ");
      if (result.hit) playHit();
      if (result.completed) playSuccess();
      return;
    }
    key = key.toLowerCase();
    if (/^[a-z0-9.,!?'-]$/.test(key)) {
      event.preventDefault();
      const result = typeKey(key);
      if (result.hit) playHit();
      if (result.completed) playSuccess();
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    setHasUserInteracted(true);
    setKeyboardVisible(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setKeyboardVisible(false);
  };

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
      setHasUserInteracted(true);
      setKeyboardVisible(true);
    }
  };

  if (phase !== "playing") return null;

  // For mobile, show button when keyboard is not visible
  if (isMobile) {
    const shouldShowButton = !keyboardVisible;
    
    return (
      <>
        {/* The input is always present for focus/blur tracking and key capture */}
        <input
          ref={inputRef}
          type="text"
          className={shouldShowButton ? "fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-40 h-12 px-4 bg-gray-900 bg-opacity-90 backdrop-blur-md border-2 rounded-xl text-white text-center font-mono text-sm placeholder-gray-400 focus:outline-none transition-all duration-300 border-cyan-500 border-opacity-50 hover:border-cyan-400 hover:border-opacity-70" : "absolute opacity-0 pointer-events-none"}
          placeholder="TAP TO TYPE"
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onClick={handleClick}
          autoComplete="off"
          spellCheck={false}
          style={shouldShowButton ? {
            boxShadow: "0 0 10px rgba(34, 211, 238, 0.2)",
            pointerEvents: 'auto',
            zIndex: 10
          } : {
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
        />
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
      onFocus={handleFocus}
      onBlur={handleBlur}
      autoComplete="off"
      spellCheck={false}
    />
  );
}
