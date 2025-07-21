import { useWordRain } from "../../lib/stores/useWordRain";
import { useGame } from "../../lib/stores/useGame";
import { useAudio } from "../../lib/stores/useAudio";
import { useIsMobile } from "../../hooks/use-is-mobile";

export default function GameUI() {
  const { phase } = useGame();
  const { score, wordsTyped, accuracy, missedWords } = useWordRain();
  const { toggleMute, isMuted } = useAudio();
  const isMobile = useIsMobile();

  if (phase !== "playing" && phase !== "ended") return null;

  return (
    <div 
      className={`fixed left-0 right-0 pointer-events-none z-40 ${isMobile ? 'top-0' : 'bottom-0'}`} 
      style={{
        marginTop: isMobile ? 0 : undefined,
        marginBottom: isMobile ? undefined : 0,
        paddingTop: isMobile ? 0 : undefined,
        paddingBottom: isMobile ? undefined : 0,
        top: isMobile ? 0 : undefined,
        bottom: isMobile ? undefined : 0
      }} 
      data-game-ui="true"
    >
      {/* Floating Stats - No Background Container */}
      <div 
        className="flex items-center justify-between px-6 py-3 font-mono min-h-[40px] relative z-10 pointer-events-auto"
        style={{
          background: 'transparent !important',
          backgroundColor: 'transparent !important',
          backgroundImage: 'none !important',
          backdropFilter: 'none !important',
          border: 'none !important',
          boxShadow: 'none !important',
          outline: 'none !important',
          fontFamily: "'Space Mono', monospace"
        }}
      >
        {/* Evenly distributed stats across the bar */}
        <div className="flex items-center justify-between w-full">
          {/* Score */}
          <div className="text-xs font-normal text-gray-300" style={{textShadow: '0 0 2px rgba(255, 255, 255, 0.08)'}}>
            SCORE <span className="text-cyan-300 font-medium w-8 inline-block ml-1" style={{textShadow: '0 0 2px rgba(34, 211, 238, 0.15)'}}>{score}</span>
          </div>
          
          {/* Words */}
          <div className="text-xs font-normal text-gray-300" style={{textShadow: '0 0 2px rgba(255, 255, 255, 0.08)'}}>
            WORDS <span className="text-white font-medium w-6 inline-block ml-1" style={{textShadow: '0 0 2px rgba(255, 255, 255, 0.1)'}}>{wordsTyped}</span>
          </div>
          
          {/* Accuracy */}
          <div className="text-xs font-normal text-gray-300" style={{textShadow: '0 0 2px rgba(255, 255, 255, 0.08)'}}>
            ACCURACY <span className="text-white font-medium w-8 inline-block ml-1" style={{textShadow: '0 0 2px rgba(255, 255, 255, 0.1)'}}>{Math.round(accuracy)}%</span>
          </div>
          
          {/* Lives Tally System */}
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className={`transition-all duration-300 ${
                  index < (5 - missedWords) 
                    ? 'text-red-400 scale-110' 
                    : 'text-gray-600 scale-90'
                }`}
                style={{
                  filter: index < (5 - missedWords) 
                    ? 'drop-shadow(0 0 2px rgba(239, 68, 68, 0.2))' 
                    : 'none'
                }}
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
          
          {/* Sound Control */}
          <button
            onClick={toggleMute}
            onMouseDown={(e) => e.preventDefault()}
            data-allow-click="true"
            className="relative group p-2 rounded transition-all duration-200 hover:bg-cyan-900/20"
            aria-label={isMuted ? "Unmute" : "Mute"}
            style={{
              border: "1px solid rgba(0, 255, 255, 0.15)",
              boxShadow: "0 0 5px rgba(0, 255, 255, 0.1)"
            }}
          >
            {isMuted ? (
              <svg className="relative z-10 w-3 h-3 text-red-300 group-hover:text-red-200 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="relative z-10 w-3 h-3 text-cyan-300 group-hover:text-cyan-200 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
