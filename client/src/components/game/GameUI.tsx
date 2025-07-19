import { useWordRain } from "../../lib/stores/useWordRain";
import { useGame } from "../../lib/stores/useGame";
import { useAudio } from "../../lib/stores/useAudio";

export default function GameUI() {
  const { phase } = useGame();
  const { score, wordsTyped, accuracy } = useWordRain();
  const { toggleMute, isMuted } = useAudio();

  if (phase !== "playing") return null;

  return (
    <div className="absolute top-4 left-4 right-4 pointer-events-none">
      {/* Score and Stats */}
      <div className="flex justify-between items-start">
        <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-4 text-white pointer-events-auto">
          <div className="space-y-2">
            <div className="text-2xl font-bold">Score: {score}</div>
            <div className="text-sm opacity-80">Words: {wordsTyped}</div>
            <div className="text-sm opacity-80">Accuracy: {accuracy.toFixed(1)}%</div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-4 pointer-events-auto">
          <button
            onClick={toggleMute}
            className="text-white hover:text-yellow-300 transition-colors duration-200"
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

      {/* Game Instructions */}
      <div className="mt-4 text-center">
        <div className="inline-block bg-black bg-opacity-30 backdrop-blur-sm rounded-lg px-4 py-2 text-white text-sm">
          Type the falling words before they reach the bottom!
        </div>
      </div>
    </div>
  );
}
