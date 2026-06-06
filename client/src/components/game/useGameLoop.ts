import { useEffect } from "react";
import { useGame } from "../../lib/stores/useGame";
import { useWordRain } from "../../lib/stores/useWordRain";
import { getSpawnInterval, getMaxWords } from "../../lib/progression";
import { stageTheme } from "../../lib/stages";

// The single, stable game loop. One requestAnimationFrame, created when the
// game starts and cancelled when it ends (or pauses for a stage-clear screen).
// It reads live state via Zustand `getState()` rather than React closure deps,
// so the loop is never torn down and recreated mid-game. Each frame it:
//   1. computes real dt (seconds since last frame),
//   2. schedules spawns based on the intensity-driven interval / max-words,
//   3. advances the simulation via `tick(dt)`.
export function useGameLoop() {
  const phase = useGame((s) => s.phase);

  useEffect(() => {
    if (phase !== "playing") return;

    let rafId = 0;
    let lastTime = performance.now();
    let lastSpawn = lastTime - 1e9; // spawn the first word immediately

    const loop = (now: number) => {
      const dtSec = (now - lastTime) / 1000;
      lastTime = now;

      const wr = useWordRain.getState();
      const theme = stageTheme(wr.stage);
      const intensity = wr.intensity;

      const interval = getSpawnInterval(intensity, theme);
      const maxWords = getMaxWords(intensity, theme);

      if (now - lastSpawn >= interval && wr.words.length < maxWords) {
        if (theme.clusters && Math.random() < 0.3) {
          // Storm theme: small bursts of words at once.
          const clusterSize = Math.min(3, maxWords - wr.words.length);
          for (let i = 0; i < clusterSize; i++) {
            setTimeout(() => useWordRain.getState().spawnWord(), i * 40);
          }
        } else {
          wr.spawnWord();
        }
        lastSpawn = now;
      }

      wr.tick(dtSec);
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [phase]);
}
