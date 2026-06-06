import { useEffect } from "react";
import { useGame } from "../../lib/stores/useGame";
import { useWordRain } from "../../lib/stores/useWordRain";
import { stageTheme, stageMultiplier } from "../../lib/stages";

// How long the stage-clear screen holds before the next stage begins.
const INTERSTITIAL_MS = 1800;

// 80s-arcade "STAGE CLEAR" card: shows the 1-3 stars earned, the bonus, and the
// next stage banner, then auto-advances. Rendered only while phase === "stageClear".
export default function StageInterstitial() {
  const { phase } = useGame();
  const { stage, lastStageStars, lastStageBonus, advanceStage } = useWordRain();

  useEffect(() => {
    if (phase !== "stageClear") return;
    const t = setTimeout(() => advanceStage(), INTERSTITIAL_MS);
    return () => clearTimeout(t);
  }, [phase, advanceStage]);

  if (phase !== "stageClear") return null;

  const nextStage = stage + 1;
  const nextTheme = stageTheme(nextStage);
  const nextMult = stageMultiplier(nextStage);

  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-none">
      {/* Stars */}
      <div className="mb-4 flex items-center gap-3">
        {[0, 1, 2].map((i) => {
          const earned = i < lastStageStars;
          return (
            <span
              key={i}
              className="text-5xl transition-all duration-300"
              style={{
                color: earned ? "#fbbf24" : "#374151",
                textShadow: earned ? "0 0 16px rgba(251, 191, 36, 0.8)" : "none",
                transform: earned ? "scale(1.15)" : "scale(1)",
              }}
            >
              {earned ? "★" : "☆"}
            </span>
          );
        })}
      </div>

      <h2
        className="mb-1 text-2xl font-bold tracking-[0.3em] text-cyan-300"
        style={{ fontFamily: "'Fira Code', 'Courier New', monospace" }}
      >
        STAGE CLEAR
      </h2>

      <p className="mb-10 font-mono text-lg text-yellow-300">+{lastStageBonus}</p>

      <div className="flex flex-col items-center gap-1">
        <span
          className="text-4xl font-bold tracking-widest text-white"
          style={{ fontFamily: "'Fira Code', 'Courier New', monospace" }}
        >
          STAGE {nextStage}
        </span>
        <span className="font-mono text-sm uppercase tracking-widest text-cyan-100/70">
          {nextTheme.name} · x{nextMult.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
