import { useWordRain } from "../../lib/stores/useWordRain";
import { useGame } from "../../lib/stores/useGame";
import { useAudio } from "../../lib/stores/useAudio";
import { useIsMobile } from "../../hooks/use-is-mobile";

export default function GameUI() {
  const { phase } = useGame();
  const { score, wordsTyped, accuracy, missedWords, testMode } = useWordRain();
  const { toggleMute, isMuted } = useAudio();
  const isMobile = useIsMobile();

  if (phase !== "playing" && phase !== "ended") return null;

  return (
    <div 
      className="fixed left-0 right-0 top-0 pointer-events-none z-40" 
      data-game-ui="true"
    >
      {/* Floating Stats - No Background Container */}
      <div className="flex justify-between items-start p-4 pointer-events-auto">
        {/* Left side - Lives indicator and test mode */}
        <div className="flex flex-col gap-3 items-start">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className={`transition-all duration-300 ${
                  index < (5 - missedWords) 
                    ? 'text-red-400' 
                    : 'text-gray-600'
                }`}
              >
                <svg 
                  className="w-4 h-4" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
            ))}
          </div>
          
          {/* Test Mode Indicator - moved under hearts */}
          {testMode && (
            <div className="pointer-events-auto">
              <div className="bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                <span>🧪</span>
                <span>TEST MODE</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Right side - Scoreboard and sound toggle */}
        <div className="flex flex-col gap-1 items-end">
          <div className="flex flex-col items-end">
            <span className="text-cyan-300 text-xs font-mono opacity-80">SCORE</span>
            <div className="w-12 text-right">
              <span className="text-white text-sm font-bold font-mono">{score}</span>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="text-green-300 text-xs font-mono opacity-80">WORDS</span>
            <div className="w-12 text-right">
              <span className="text-white text-sm font-bold font-mono">{wordsTyped}</span>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="text-yellow-300 text-xs font-mono opacity-80">ACCURACY</span>
            <div className="w-12 text-right">
              <span className="text-white text-sm font-bold font-mono">
                {accuracy > 0 ? Math.round(accuracy) : 0}%
              </span>
            </div>
          </div>
          
          {/* Sound Control */}
          <button
            onClick={toggleMute}
            onMouseDown={(e) => e.preventDefault()}
            data-allow-click="true"
            className="relative group pt-2 self-end"
            aria-label={isMuted ? "Unmute" : "Mute"}
            style={{ lineHeight: 0 }}
          >
            {isMuted ? (
              <svg className="relative z-10 w-4 h-4 text-red-400/60 group-hover:text-red-300 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="relative z-10 w-4 h-4 text-cyan-400/60 group-hover:text-cyan-300 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
