import { useWordRain } from "../../lib/stores/useWordRain";
import { useGame } from "../../lib/stores/useGame";
import { useAudio } from "../../lib/stores/useAudio";

export default function GameUI() {
  const { phase } = useGame();
  const { score, wordsTyped, accuracy, missedWords } = useWordRain();
  const { toggleMute, isMuted } = useAudio();

  if (phase !== "playing" && phase !== "ended") return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 pointer-events-none z-40" style={{marginBottom: 0, paddingBottom: 0, bottom: 0}}>
      {/* Discrete Cyberpunk Bottom Bar */}
      <div 
        className="relative pointer-events-auto"
        style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(10,10,15,0.9) 50%, rgba(0,0,0,0.85) 100%)",
          backdropFilter: "blur(10px)",
          borderTop: "1px solid rgba(0, 255, 255, 0.2)",
          boxShadow: "0 -5px 15px rgba(0, 255, 255, 0.1)",
          paddingBottom: 0,
          marginBottom: 0,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 'auto'
        }}
      >
        {/* Subtle scan line effect */}
        <div 
          className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-30"
          style={{
            animation: "scan-line 4s linear infinite",
            boxShadow: "0 0 5px rgba(0, 255, 255, 0.3)"
          }}
        />
        
        {/* Very subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px"
          }}
        />

        <div className="flex items-center justify-between px-6 py-3 font-sans min-h-[45px] relative z-10">
          {/* Evenly distributed stats across the bar */}
          <div className="flex items-center justify-between w-full">
            {/* Score */}
            <div className="text-sm font-normal text-gray-300">
              SCORE: <span className="text-cyan-300 font-medium w-12 inline-block text-right">{score}</span>
            </div>
            
            {/* Words */}
            <div className="text-sm font-normal text-gray-300">
              WORDS: <span className="text-white font-medium w-6 inline-block text-right">{wordsTyped}</span>
            </div>
            
            {/* Accuracy */}
            <div className="text-sm font-normal text-gray-300">
              ACC: <span className="text-white font-medium w-10 inline-block text-right">{accuracy.toFixed(1)}%</span>
            </div>
            
            {/* Missed */}
            <div className={`text-sm font-medium ${missedWords >= 3 ? 'text-red-300' : 'text-orange-300'}`}>
              MISSED: <span className="text-white w-4 inline-block text-right">{missedWords}</span>/5
            </div>
            
            {/* Sound Control */}
            <button
              onClick={toggleMute}
              onMouseDown={(e) => e.preventDefault()}
              className="relative group p-2 rounded transition-all duration-200 hover:bg-cyan-900/20"
              aria-label={isMuted ? "Unmute" : "Mute"}
              style={{
                border: "1px solid rgba(0, 255, 255, 0.15)",
                boxShadow: "0 0 5px rgba(0, 255, 255, 0.1)"
              }}
            >
              {isMuted ? (
                <svg className="relative z-10 w-4 h-4 text-red-300 group-hover:text-red-200 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : (
                <svg className="relative z-10 w-4 h-4 text-cyan-300 group-hover:text-cyan-200 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* Subtle bottom accent line */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-20"
          style={{
            boxShadow: "0 0 3px rgba(0, 255, 255, 0.2)"
          }}
        />
      </div>
    </div>
  );
}
