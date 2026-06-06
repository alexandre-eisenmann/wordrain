import { useGame } from "../../lib/stores/useGame";
import { useWordRain } from "../../lib/stores/useWordRain";
import { useSettings } from "../../lib/stores/useSettings";
import { getFallSpeed, getMaxWords } from "../../lib/progression";
import { stageTheme, stageMultiplier } from "../../lib/stages";

// Optional, player-facing live stats panel — a polished promotion of the debug
// overlay, toggled from the HUD (persisted). Styled to match the tectonic
// signature: dark, vector-edged, clipped corner.
export default function StatsPanel() {
  const { phase: gamePhase } = useGame();
  const { showStats } = useSettings();
  const {
    intensity,
    phase,
    words,
    stage,
    recentCorrect,
    recentTotal,
    clearHeightEMA,
  } = useWordRain();

  if (!showStats) return null;
  if (gamePhase !== "playing" && gamePhase !== "stageClear") return null;

  const theme = stageTheme(stage);
  const speed = getFallSpeed(intensity, theme);
  const maxWords = getMaxWords(intensity, theme);
  const accuracy = recentTotal > 0.5 ? (recentCorrect / recentTotal) * 100 : 100;
  const precision = (1 - clearHeightEMA) * 100; // higher = clearing nearer the top
  const heat = Math.min(100, intensity * 100);

  const phaseColor: Record<string, string> = {
    warmup: "#22d3ee",
    flow: "#34d399",
    pressure: "#fbbf24",
    storm: "#fb923c",
    chaos: "#f87171",
  };
  const accent = phaseColor[phase] ?? "#22d3ee";

  const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-center justify-between gap-6">
      <span className="text-gray-400">{label}</span>
      <span className="font-bold text-white">{value}</span>
    </div>
  );

  return (
    <div
      className="fixed bottom-3 left-3 z-40 border border-white/10 bg-[#0b0a18]/85 p-3 font-mono text-[11px] leading-relaxed backdrop-blur-sm pointer-events-none"
      style={{
        minWidth: 210,
        clipPath: "polygon(0 0, 100% 0, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
      }}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="font-bold tracking-wider" style={{ color: accent }}>
          STAGE {stage}
        </span>
        <span className="uppercase tracking-widest text-gray-500">{theme.name}</span>
      </div>

      {/* Heat (intensity) meter */}
      <div className="mb-0.5 flex items-center justify-between">
        <span className="text-gray-400">heat</span>
        <span className="uppercase tracking-widest" style={{ color: accent }}>
          {phase}
        </span>
      </div>
      <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-[width] duration-100"
          style={{ width: `${heat}%`, backgroundColor: accent, boxShadow: `0 0 6px ${accent}` }}
        />
      </div>

      <Row label="multiplier" value={`x${stageMultiplier(stage).toFixed(2)}`} />
      <Row label="fall speed" value={`${speed.toFixed(0)} px/s`} />
      <Row label="on screen" value={`${words.length} / ${maxWords}`} />
      <Row label="precision" value={`${precision.toFixed(0)}%`} />
      <Row label="accuracy" value={`${accuracy.toFixed(0)}%`} />
    </div>
  );
}
