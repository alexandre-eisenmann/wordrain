import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { useAudio } from "./lib/stores/useAudio";
import { useGame } from "./lib/stores/useGame";
import { useWordRain } from "./lib/stores/useWordRain";
import { adGameplayStart, adGameplayStop, showRewarded, adsEnabled } from "./lib/ads";
import WordRainCanvas from "./components/game/WordRainCanvas";
import GameUI from "./components/game/GameUI";
import TypingInput from "./components/game/TypingInput";
import TectonicBackground from "./components/game/TectonicBackground";
import DebugOverlay from "./components/game/DebugOverlay";
import StageInterstitial from "./components/game/StageInterstitial";
import StatsPanel from "./components/game/StatsPanel";
import { Howl, Howler } from "howler";
import "./styles/fonts.css";
import "@fontsource/inter";
import { useIsMobile } from "./hooks/use-is-mobile";

// Extend Window interface for Howler
declare global {
  interface Window {
    Howler: typeof Howler;
    gameStartTime?: number;
  }
}

// Function to get URL parameters
const getUrlParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const test = urlParams.get('test') === 'true' || urlParams.get('test') === '1';
  const debug = urlParams.get('debug') === 'true' || urlParams.get('debug') === '1';
  const stageParam = parseInt(urlParams.get('stage') || '', 10);
  const startStage = Number.isFinite(stageParam) && stageParam > 1 ? stageParam : 1;
  return { test, debug, startStage };
};

function GameComponent() {
  const { phase, start } = useGame();
  const { setHitSound, setSuccessSound } = useAudio();
  const { setTestMode, setStage, score, wordsTyped, stage, totalStars, revive } = useWordRain();
  const [showCanvas, setShowCanvas] = useState(false);
  const [reviving, setReviving] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(3); // Start at position 3 (letter 'd')
  const [audioContextResumed, setAudioContextResumed] = useState(false);
  const isMobile = useIsMobile();

  // Get URL parameters (test mode, debug overlay, debug start stage)
  const { test, debug, startStage } = getUrlParams();

  // Set test mode in the store from the URL parameter
  useEffect(() => {
    setTestMode(test);
  }, [test, setTestMode]);

  // Start a run; honor ?stage=N (applied after the auto-reset on "playing").
  const beginRun = () => {
    start();
    if (startStage > 1) setStage(startStage);
  };

  // Initialize audio with mobile-specific handling
  useEffect(() => {
    console.log("Initializing audio...");
    
    const hitAudio = new Howl({
      src: [`${import.meta.env.BASE_URL}sounds/hit.mp3`],
      volume: 0.5,
      preload: true,
      html5: true, // Use HTML5 Audio for better mobile compatibility
      onload: () => console.log("Hit sound loaded successfully"),
      onloaderror: (id, error) => console.error("Hit sound load error:", error),
      onplay: () => console.log("Hit sound played"),
      onplayerror: (id, error) => {
        console.error("Hit sound play error:", error);
        // Try to resume audio context on play error
        if (Howler.ctx && Howler.ctx.state === 'suspended') {
          Howler.ctx.resume();
        }
      },
    });
    setHitSound(hitAudio);

    const successAudio = new Howl({
      src: [`${import.meta.env.BASE_URL}sounds/success.mp3`],
      volume: 0.7,
      preload: true,
      html5: true, // Use HTML5 Audio for better mobile compatibility
      onload: () => console.log("Success sound loaded successfully"),
      onloaderror: (id, error) => console.error("Success sound load error:", error),
      onplay: () => console.log("Success sound played"),
      onplayerror: (id, error) => {
        console.error("Success sound play error:", error);
        // Try to resume audio context on play error
        if (Howler.ctx && Howler.ctx.state === 'suspended') {
          Howler.ctx.resume();
        }
      },
    });
    setSuccessSound(successAudio);

    console.log("Audio initialization complete");
    setShowCanvas(true);
  }, [setHitSound, setSuccessSound]);

  // Enhanced audio unlocking for mobile devices
  useEffect(() => {
    const unlockAudio = async () => {
      try {
        // Resume Howler audio context
        if (Howler.ctx && Howler.ctx.state === 'suspended') {
          await Howler.ctx.resume();
          console.log("Audio context resumed");
          setAudioContextResumed(true);
        }

        // Set Howler to unmuted state
        Howler.mute(false);
        
        // Test play a silent sound to unlock audio
        const testSound = new Howl({
          src: ['data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'],
          volume: 0,
          html5: true,
        });
        
        testSound.play();
        testSound.once('play', () => {
          testSound.unload();
          console.log("Audio unlocked successfully");
          // setAudioUnlocked(true); // This line is removed
        });
        
      } catch (error) {
        console.error("Audio unlock failed:", error);
      }
    };

    // More comprehensive event listeners for mobile
    const events = [
      'click', 'touchstart', 'touchend', 'touchmove',
      'keydown', 'keyup', 'mousedown', 'mouseup',
      'scroll', 'focus', 'blur'
    ];

    events.forEach(event => {
      document.addEventListener(event, unlockAudio, { passive: true, once: false });
    });

    // Also try to unlock on window focus
    window.addEventListener('focus', unlockAudio);

    // Periodic audio context check to keep it active
    const audioCheckInterval = setInterval(() => {
      if (Howler.ctx && Howler.ctx.state === 'suspended') {
        console.log("Audio context suspended, attempting to resume...");
        Howler.ctx.resume().catch(error => {
          console.error("Failed to resume audio context during periodic check:", error);
        });
      }
    }, 5000); // Check every 5 seconds

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, unlockAudio);
      });
      window.removeEventListener('focus', unlockAudio);
      clearInterval(audioCheckInterval);
    };
  }, []);

  // Additional mobile-specific audio handling
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && Howler.ctx && Howler.ctx.state === 'suspended') {
        Howler.ctx.resume();
        console.log("Audio context resumed on visibility change");
      }
    };

    const handlePageShow = () => {
      if (Howler.ctx && Howler.ctx.state === 'suspended') {
        Howler.ctx.resume();
        console.log("Audio context resumed on page show");
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  // Disable unwanted mouse events globally - but allow natural interactions
  useEffect(() => {
    const preventUnwantedMouseEvents = (e: MouseEvent) => {
      // Allow clicks on buttons and essential UI elements
      const target = e.target as HTMLElement;
      const isButton = target.tagName === 'BUTTON' || 
                      target.closest('button') !== null ||
                      target.closest('[data-allow-click]') !== null;
      
      // Allow clicks on the title area during ready phase
      const isTitleArea = phase === "ready" && target.closest('h1') !== null;
      
      // Allow clicks on the game UI area
      const isGameUI = target.closest('[data-game-ui]') !== null;
      
      // Allow clicks on the typing input area on mobile
      const isTypingInput = isMobile && target.closest('input') !== null;
      
      if (!isButton && !isTitleArea && !isGameUI && !isTypingInput) {
        // Allow the event but prevent default to maintain natural interactions
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Allow all touch events for pull-to-refresh and natural mobile interactions
    const handleTouchEvents = (e: TouchEvent) => {
      // Allow all touch events to pass through for natural mobile behavior
      return true;
    };

    // Allow drag events but prevent unwanted actions
    const handleDrag = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isButton = target.tagName === 'BUTTON' || 
                      target.closest('button') !== null ||
                      target.closest('[data-allow-click]') !== null;
      
      // Allow all drag events but prevent default on non-interactive elements
      if (!isButton) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Prevent context menu
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Add event listeners
    document.addEventListener('mousedown', preventUnwantedMouseEvents, { capture: true });
    document.addEventListener('dragstart', handleDrag, { capture: true });
    document.addEventListener('contextmenu', preventContextMenu, { capture: true });
    
    // Add touch event listeners for mobile
    if (isMobile) {
      document.addEventListener('touchstart', handleTouchEvents, { passive: true });
      document.addEventListener('touchmove', handleTouchEvents, { passive: true });
      document.addEventListener('touchend', handleTouchEvents, { passive: true });
    }

    return () => {
      document.removeEventListener('mousedown', preventUnwantedMouseEvents, { capture: true });
      document.removeEventListener('dragstart', handleDrag, { capture: true });
      document.removeEventListener('contextmenu', preventContextMenu, { capture: true });
      
      if (isMobile) {
        document.removeEventListener('touchstart', handleTouchEvents);
        document.removeEventListener('touchmove', handleTouchEvents);
        document.removeEventListener('touchend', handleTouchEvents);
      }
    };
  }, [phase, isMobile]);

  const handleStartGame = () => {
    beginRun();
  };

  const handleRestartGame = () => {
    start(); // Always restart a fresh run from stage 1 (ignores debug ?stage)
  };

  // Opt-in rewarded ad on game over: watch an ad to revive with +2 lives and
  // continue the same run. Only revives if the reward was actually earned.
  const handleReviveGame = async () => {
    if (reviving) return;
    setReviving(true);
    try {
      const earned = await showRewarded();
      if (earned) revive();
    } finally {
      setReviving(false);
    }
  };

  // Let the ad provider (portal SDK) know when active gameplay is on, so it can
  // pause/mute ads appropriately. No-op when no SDK is present.
  useEffect(() => {
    if (phase === "playing") adGameplayStart();
    else adGameplayStop();
  }, [phase]);

  const handleTitleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const letterWidth = rect.width / 8; // "WordRain" has 8 characters
    const newPosition = Math.min(Math.max(Math.floor(x / letterWidth), 7), 0);
    setCursorPosition(newPosition);
  };

  const handleTitleMouseLeave = () => {
    setCursorPosition(3); // Reset to position 3 (letter 'd')
  };

  return (
    <div className="relative w-full bg-gradient-to-b from-gray-900 via-purple-900 to-black overflow-hidden" style={{ height: '100dvh' }}>
      {showCanvas && (
        <>
          {/* Tectonic-plate visual signature */}
          <TectonicBackground />
          
          {/* Game Canvas */}
          <WordRainCanvas />
          
          {/* Game UI Overlay */}
          <GameUI />
          
          {/* Hidden Typing Input for key capture */}
          <TypingInput />

          {/* Stage-clear star screen */}
          <StageInterstitial />

          {/* Opt-in stats panel (toggled from the HUD) */}
          <StatsPanel />

          {/* Dev-only progression tuning overlay (?debug=1) */}
          {debug && <DebugOverlay />}
          
          {/* Start/Restart Menu */}
          {phase === "ready" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
              <h1 
                className="text-6xl font-bold text-white mb-4 tracking-wider cursor-pointer"
                style={{ fontFamily: "'Fira Code', 'Courier New', monospace" }}
                onMouseMove={handleTitleMouseMove}
                onMouseLeave={handleTitleMouseLeave}
              >
                {"WordRain".split("").map((letter, index) => (
                  <span
                    key={index}
                    className={`rotate-letter transition-all duration-200 relative ${
                      index < cursorPosition
                        ? "text-green-400 scale-110"
                        : index === cursorPosition
                        ? "text-yellow-300"
                        : "text-white"
                    }`}
                    style={{
                      textShadow: index < cursorPosition 
                        ? "0 0 8px rgba(34, 197, 94, 0.6)" 
                        : index === cursorPosition 
                        ? "0 0 8px rgba(253, 224, 71, 0.8)" 
                        : "2px 2px 4px rgba(0,0,0,0.5)",
                    }}
                  >
                    {letter}
                    {index === cursorPosition && (
                      <span 
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400 animate-pulse"
                        style={{
                          boxShadow: "0 0 4px rgba(253, 224, 71, 0.8)"
                        }}
                      />
                    )}
                  </span>
                ))}
              </h1>

              {/* Test Mode Indicator */}
              {test && (
                <div className="mb-6">
                  <div className="bg-yellow-500 text-black px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                    <span>🧪</span>
                    <span>TEST MODE - LONG PHRASES ONLY</span>
                  </div>
                </div>
              )}

              <p className="text-xl text-cyan-100 mb-8 font-light">
                Type fast. Think faster. Don't miss 5 words.
              </p>

              <button
                onClick={handleStartGame}
                data-allow-click="true"
                className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-black font-semibold rounded-lg text-xl transition-all duration-200 shadow-lg hover:shadow-cyan-400/25"
                style={{
                  boxShadow: "0 0 20px rgba(34, 211, 238, 0.3)"
                }}
              >
                START
              </button>
            </div>
          )}

          {/* Game Over Screen */}
          {phase === "ended" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
              <h2 className="text-4xl font-bold text-red-400 mb-4 tracking-wider" style={{ fontFamily: "'Fira Code', 'Courier New', monospace" }}>
                {"GAME OVER".split("").map((letter, index) => (
                  <span
                    key={index}
                    className="rotate-letter text-red-400"
                    style={{
                      textShadow: "0 0 8px rgba(239, 68, 68, 0.8)"
                    }}
                  >
                    {letter}
                  </span>
                ))}
              </h2>

              {/* Run summary */}
              <div className="mb-8 flex flex-col items-center gap-2">
                <p className="font-mono text-2xl font-bold text-white">
                  Reached <span className="text-cyan-300">Stage {stage}</span>
                </p>
                <p className="flex items-center gap-2 font-mono text-lg text-yellow-300">
                  <span>★ {totalStars} stars</span>
                  <span className="text-gray-500">·</span>
                  <span className="text-white">{score} pts</span>
                  <span className="text-gray-500">·</span>
                  <span className="text-green-300">{wordsTyped} words</span>
                </p>
              </div>

              {/* Test Mode Indicator */}
              {test && (
                <div className="mb-6">
                  <div className="bg-yellow-500 text-black px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                    <span>🧪</span>
                    <span>TEST MODE - LONG PHRASES ONLY</span>
                  </div>
                </div>
              )}

              <div className="flex flex-col items-center gap-4">
                {/* Rewarded ad: opt-in revive with +2 lives, continue this run.
                    Only shown when a real ad SDK is active (CrazyGames Full
                    Launch). Hidden in dev / GitHub Pages / Basic Launch, where a
                    non-functional "WATCH AD" button would look broken. */}
                {adsEnabled && (
                  <button
                    onClick={handleReviveGame}
                    disabled={reviving}
                    data-allow-click="true"
                    className="flex items-center gap-2 px-8 py-4 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-60 disabled:cursor-wait text-black font-bold rounded-lg text-xl transition-all duration-200 shadow-lg hover:shadow-yellow-400/30"
                    style={{
                      boxShadow: "0 0 20px rgba(250, 204, 21, 0.35)"
                    }}
                  >
                    <span>▶</span>
                    <span>{reviving ? "LOADING AD…" : "REVIVE · WATCH AD (+2 LIVES)"}</span>
                  </button>
                )}

                <button
                  onClick={handleRestartGame}
                  data-allow-click="true"
                  className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-black font-semibold rounded-lg text-xl transition-all duration-200 shadow-lg hover:shadow-cyan-400/25"
                  style={{
                    boxShadow: "0 0 20px rgba(34, 211, 238, 0.3)"
                  }}
                >
                  RESTART
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AppRouter() {
  // Render the game on ANY path. Portals like CrazyGames serve the build from an
  // arbitrary URL path inside an iframe, so a catch-all is required — otherwise
  // no route matches and the app renders nothing (blank screen).
  return (
    <Routes>
      <Route path="*" element={<GameComponent />} />
    </Routes>
  );
}

export default AppRouter;