import { useEffect, useState } from "react";
import { useAudio } from "./lib/stores/useAudio";
import { useGame } from "./lib/stores/useGame";
import WordRainCanvas from "./components/game/WordRainCanvas";
import GameUI from "./components/game/GameUI";
import TypingInput from "./components/game/TypingInput";
import CyberpunkBackground from "./components/game/CyberpunkBackground";
import "./styles/fonts.css";
import "@fontsource/inter";

function App() {
  const { phase, start, restart } = useGame();
  const { setBackgroundMusic, setHitSound, setSuccessSound } = useAudio();
  const [showCanvas, setShowCanvas] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(3); // Start at position 3 (letter 'd')

  // Initialize audio
  useEffect(() => {
    const bgMusic = new Audio("/sounds/background.mp3");
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    setBackgroundMusic(bgMusic);

    const hitAudio = new Audio("/sounds/hit.mp3");
    hitAudio.volume = 0.5;
    setHitSound(hitAudio);

    const successAudio = new Audio("/sounds/success.mp3");
    successAudio.volume = 0.7;
    setSuccessSound(successAudio);

    setShowCanvas(true);
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);

  const handleStartGame = () => {
    start();
  };

  const handleRestartGame = () => {
    console.log("Restart button clicked");
    start(); // Start directly from ended phase
  };

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
    <div className="relative w-full h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-black overflow-hidden" style={{paddingBottom: 0, marginBottom: 0, height: 'calc(100vh + 20px)', minHeight: '100vh', bottom: 0}}>
      {showCanvas && (
        <>
          {/* Cyberpunk Background */}
          <CyberpunkBackground />
          
          {/* Game Canvas */}
          <WordRainCanvas />
          
          {/* Game UI Overlay */}
          <GameUI />
          
          {/* Hidden Typing Input for key capture */}
          <TypingInput />
          
          {/* Start/Restart Menu */}
          {phase === "ready" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
              <div 
                className="text-center p-12 bg-gray-900 bg-opacity-60 rounded-2xl backdrop-blur-md border border-cyan-400 border-opacity-50 shadow-2xl"
                style={{
                  boxShadow: "0 0 30px rgba(0, 255, 255, 0.3), inset 0 0 30px rgba(0, 255, 255, 0.1), 0 0 50px rgba(0, 255, 255, 0.2)",
                  minWidth: "500px",
                  maxWidth: "600px"
                }}
              >
                <h1 
                  className="text-6xl font-bold text-white mb-4 tracking-wider cursor-pointer"
                  style={{ fontFamily: "'Fira Code', 'Courier New', monospace" }}
                  onMouseMove={handleTitleMouseMove}
                  onMouseLeave={handleTitleMouseLeave}
                >
                  {"WordRain".split("").map((letter, index) => (
                    <span
                      key={index}
                      className={`inline-block transition-all duration-200 relative ${
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
                <p className="text-xl text-cyan-100 mb-8 font-light">
                  Type fast. Think faster. Don't miss 5 words.
                </p>
                <button
                  onClick={handleStartGame}
                  className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-black font-semibold rounded-lg text-xl transition-all duration-200 shadow-lg hover:shadow-cyan-400/25"
                  style={{
                    boxShadow: "0 0 20px rgba(34, 211, 238, 0.3)"
                  }}
                >
                  START
                </button>
              </div>
            </div>
          )}
          
          {/* Game Over Overlay - Non-blocking */}
          {phase === "ended" && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
              <div 
                className="text-center p-8 bg-gray-900 bg-opacity-60 rounded-2xl backdrop-blur-md border border-red-400 border-opacity-50 shadow-2xl"
                style={{
                  boxShadow: "0 0 30px rgba(239, 68, 68, 0.3), inset 0 0 30px rgba(239, 68, 68, 0.1), 0 0 50px rgba(239, 68, 68, 0.2)",
                  minWidth: "400px",
                  maxWidth: "500px"
                }}
              >
                <h2 className="text-3xl font-bold text-red-400 mb-3 tracking-wider" style={{ fontFamily: "'Fira Code', 'Courier New', monospace" }}>
                  GAME OVER
                </h2>
                <p className="text-base text-red-200 mb-4">
                  5 words escaped!
                </p>
                <button
                  onClick={handleRestartGame}
                  className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg text-lg transition-all duration-200 shadow-lg hover:shadow-red-400/25"
                  style={{
                    boxShadow: "0 0 20px rgba(239, 68, 68, 0.3)"
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

export default App;
