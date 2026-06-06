import { useEffect, useRef } from "react";
import { useWordRain } from "../../lib/stores/useWordRain";

// ============================================================================
// WordRain visual signature: falling tectonic plates.
// ----------------------------------------------------------------------------
// A canvas of large, angular vector plates in dark tones. New plates form at
// the top and drift DOWNWARD under gravity — recycling to the top when they
// exit the bottom — so the screen always feels like fresh tectonic blocks being
// created and falling, mirroring the falling words. A little horizontal sway and
// slow spin keep it organic; the fall speed and edge glow rise with the game's
// intensity, so the world accelerates as the stages heat up.
// ============================================================================

interface Plate {
  pts: [number, number][];
  maxR: number; // furthest vertex from center (for recycle threshold)
  x: number;
  y: number;
  color: string; // "r,g,b"
  alpha: number;
  ax: number; // horizontal sway amplitude
  sp: number; // sway speed
  phase: number;
  rot: number; // base rotation
  rotSp: number; // rotation speed
  vy: number; // downward fall speed (px/s)
}

// Dark tones with enough spread that adjacent plates read as distinct, while
// staying low-lightness so falling words remain clearly readable on top.
const PALETTE: [number, number, number][] = [
  [26, 32, 70], // navy
  [40, 24, 64], // violet
  [14, 38, 58], // teal
  [20, 15, 30], // near-black plum
  [30, 38, 66], // slate blue
];

const PLATE_COUNT = 11;

export default function TectonicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let plates: Plate[] = [];
    let raf = 0;

    // Build one plate. `atTop` spawns it just above the screen (a freshly formed
    // block); otherwise it's placed somewhere on screen (initial fill).
    const makePlate = (atTop: boolean): Plate => {
      const span = Math.max(w, h);
      const radius = (0.3 + Math.random() * 0.32) * span;
      const verts = 4 + Math.floor(Math.random() * 3); // 4-6 sided
      const baseAng = Math.random() * Math.PI * 2;
      const pts: [number, number][] = [];
      let maxR = 0;
      for (let v = 0; v < verts; v++) {
        const ang = baseAng + (v / verts) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
        const r = radius * (0.6 + Math.random() * 0.55);
        const px = Math.cos(ang) * r;
        const py = Math.sin(ang) * r;
        pts.push([px, py]);
        maxR = Math.max(maxR, Math.hypot(px, py));
      }
      const c = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      return {
        pts,
        maxR,
        x: Math.random() * w,
        y: atTop ? -maxR - Math.random() * h * 0.4 : Math.random() * h,
        color: `${c[0]},${c[1]},${c[2]}`,
        alpha: 0.35 + Math.random() * 0.4,
        ax: 16 + Math.random() * 26,
        sp: 0.09 + Math.random() * 0.13,
        phase: Math.random() * Math.PI * 2,
        rot: Math.random() * Math.PI * 2,
        rotSp: (Math.random() - 0.5) * 0.06,
        vy: 7 + Math.random() * 18,
      };
    };

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      plates = Array.from({ length: PLATE_COUNT }, () => makePlate(false));
    };
    resize();
    window.addEventListener("resize", resize);

    const t0 = performance.now();
    let last = t0;
    const frame = (now: number) => {
      const t = (now - t0) / 1000;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      // Subtle reactivity: the world falls faster and glows more as it heats up.
      const tension = Math.min(1.4, useWordRain.getState().intensity);
      const fallScale = 1 + tension * 0.8;

      // Deep base gradient.
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#0b0a18");
      g.addColorStop(0.55, "#140d24");
      g.addColorStop(1, "#07060f");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      for (const p of plates) {
        if (!reduce) {
          // Gravity: plates drift downward, recycling as new blocks at the top.
          p.y += p.vy * dt * fallScale;
          if (p.y - p.maxR > h + 40) Object.assign(p, makePlate(true));
        }
        const ox = reduce ? 0 : Math.sin(t * p.sp + p.phase) * p.ax;
        const rot = p.rot + (reduce ? 0 : t * p.rotSp);

        ctx.save();
        ctx.translate(p.x + ox, p.y);
        ctx.rotate(rot);
        ctx.beginPath();
        p.pts.forEach((pt, idx) =>
          idx === 0 ? ctx.moveTo(pt[0], pt[1]) : ctx.lineTo(pt[0], pt[1]),
        );
        ctx.closePath();
        ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
        ctx.fill();
        ctx.restore();
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
