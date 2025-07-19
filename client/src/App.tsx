import { useEffect, useState } from "react";
import { useAudio } from "./lib/stores/useAudio";
import { useGame } from "./lib/stores/useGame";
import WordRainCanvas from "./components/game/WordRainCanvas";
import GameUI from "./components/game/GameUI";
import TypingInput from "./components/game/TypingInput";
import "./styles/fonts.css";
import "@fontsource/inter";

function App() {
  const { phase, start, restart } = useGame();
  const { setBackgroundMusic, setHitSound, setSuccessSound } = useAudio();
  const [showCanvas, setShowCanvas] = useState(false);

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
    restart();
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-indigo-900 overflow-hidden">
      {showCanvas && (
        <>
          {/* Game Canvas */}
          <WordRainCanvas />
          
          {/* Game UI Overlay */}
          <GameUI />
          
          {/* Typing Input */}
          <TypingInput />
          
          {/* Start/Restart Menu */}
          {phase === "ready" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
              <div className="text-center p-8 bg-white bg-opacity-10 rounded-2xl backdrop-blur-md border border-white border-opacity-20">
                <h1 className="text-6xl font-bold text-white mb-4 font-serif">
                  Word<span className="text-blue-300">Rain</span>
                </h1>
                <p className="text-xl text-gray-200 mb-8 font-light">
                  Type fast. Think faster. Don't let the words touch the ground.
                </p>
                <button
                  onClick={handleStartGame}
                  className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg text-xl transition-colors duration-200"
                >
                  Start Game
                </button>
              </div>
            </div>
          )}
          
          {/* Game Over Screen */}
          {phase === "ended" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
              <div className="text-center p-8 bg-white bg-opacity-10 rounded-2xl backdrop-blur-md border border-white border-opacity-20">
                <h2 className="text-4xl font-bold text-white mb-4">Game Over</h2>
                <p className="text-lg text-gray-200 mb-6">
                  The words have reached the ground!
                </p>
                <button
                  onClick={handleRestartGame}
                  className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg text-xl transition-colors duration-200"
                >
                  Play Again
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
