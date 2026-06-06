import { useGame } from "../../lib/stores/useGame";
import { useWordRain } from "../../lib/stores/useWordRain";
import {
  getFallSpeed,
  getSpawnInterval,
  getMaxWords,
  getRotation,
} from "../../lib/progression";
import {
  stageTheme,
  stageGoalWords,
  stageBaseIntensity,
  stageMultiplier,
} from "../../lib/stages";

// Live tuning overlay, gated behind ?debug=1. Shows the master intensity, the
// current stage/phase, and every derived lever so the curve can be dialed in by
// feel. Dev aid only — never shown in normal play.
export default function DebugOverlay() {
  const { phase: gamePhase } = useGame();
  const {
    intensity,
    phase,
    words,
    stage,
    stageWordsCleared,
    recentCorrect,
    recentTotal,
    recentMissEMA,
    clearHeightEMA,
  } = useWordRain();

  if (gamePhase !== "playing" && gamePhase !== "stageClear") return null;

  const theme = stageTheme(stage);
  const speed = getFallSpeed(intensity, theme);
  const interval = getSpawnInterval(intensity, theme);
  const maxWords = getMaxWords(intensity, theme);
  const rot = getRotation(intensity, theme);
  const occupancy = words.length / Math.max(1, maxWords);
  const accuracy = recentTotal > 0.5 ? recentCorrect / recentTotal : 1;
  const goal = stageGoalWords(stage);

  const phaseColors: Record<string, string> = {
    warmup: "#22d3ee",
    flow: "#34d399",
    pressure: "#fbbf24",
    storm: "#fb923c",
    chaos: "#f87171",
  };

  const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between gap-4">
      <span className="text-gray-400">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  );

  return (
    <div
      className="fixed bottom-3 left-3 z-50 rounded-lg bg-black/80 p-3 font-mono text-[11px] leading-relaxed backdrop-blur-sm pointer-events-none"
      style={{ minWidth: 230 }}
    >
      <div className="mb-1 flex items-center justify-between">
        <span className="font-bold text-cyan-300">
          STAGE {stage} · {theme.name}
        </span>
        <span
          className="rounded px-2 py-0.5 text-[10px] font-bold uppercase text-black"
          style={{ backgroundColor: phaseColors[phase] ?? "#fff" }}
        >
          {phase}
        </span>
      </div>

      {/* Intensity bar */}
      <div className="mb-2 h-2 w-full overflow-hidden rounded bg-gray-700">
        <div
          className="h-full transition-[width] duration-75"
          style={{
            width: `${Math.min(100, intensity * 100)}%`,
            backgroundColor: phaseColors[phase] ?? "#fff",
          }}
        />
      </div>

      <Row label="intensity" value={intensity.toFixed(3)} />
      <Row label="stage base" value={stageBaseIntensity(stage).toFixed(3)} />
      <Row label="goal" value={`${stageWordsCleared} / ${goal}`} />
      <Row label="multiplier" value={`x${stageMultiplier(stage).toFixed(2)}`} />
      <Row label="fall speed" value={`${speed.toFixed(0)} px/s`} />
      <Row label="spawn every" value={`${interval.toFixed(0)} ms`} />
      <Row label="words" value={`${words.length} / ${maxWords}`} />
      <Row label="occupancy" value={`${(occupancy * 100).toFixed(0)}%`} />
      <Row label="clear height" value={`${(clearHeightEMA * 100).toFixed(0)}% (less=better)`} />
      <Row label="rot chance" value={`${(rot.chance * 100).toFixed(0)}%`} />
      <Row label="acc (roll)" value={`${(accuracy * 100).toFixed(0)}%`} />
      <Row label="misses (ema)" value={recentMissEMA.toFixed(2)} />
    </div>
  );
}
