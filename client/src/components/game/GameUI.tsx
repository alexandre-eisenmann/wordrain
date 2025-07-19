import { useWordRain } from "../../lib/stores/useWordRain";
import { useGame } from "../../lib/stores/useGame";
import { useAudio } from "../../lib/stores/useAudio";

export default function GameUI() {
  const { phase } = useGame();
  const { score, wordsTyped, accuracy, missedWords } = useWordRain();
  const { toggleMute, isMuted } = useAudio();

  if (phase !== "playing") return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 pointer-events-none">
      {/* Horizontal Bottom Bar */}
      <div className="bg-gray-900 bg-opacity-90 backdrop-blur-sm border-t border-cyan-400 border-opacity-30 pointer-events-auto" style={{boxShadow: "0 -5px 15px rgba(34, 211, 238, 0.1)"}}>
        <div className="flex items-center justify-between px-6 py-3 font-mono">
          {/* Left side - Main Score */}
          <div className="flex items-center space-x-8">
            <div className="text-2xl font-bold text-cyan-400">SCORE: {score}</div>
            <div className="text-sm text-cyan-200">WORDS: {wordsTyped}</div>
            <div className="text-sm text-cyan-200">ACCURACY: {accuracy.toFixed(1)}%</div>
            <div className={`text-sm font-bold ${missedWords >= 3 ? 'text-red-400' : 'text-orange-400'}`}>
              MISSED: {missedWords}/5
            </div>
          </div>
          
          {/* Right side - Controls */}
          <div className="flex items-center">
            <button
              onClick={toggleMute}
              className="text-cyan-300 hover:text-cyan-400 transition-colors duration-200 p-2"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
