# CLAUDE.md

Guidance for working in this repository.

## What this is

**WordRain** is a fast-paced browser typing game. Words fall from the top of the
screen; the player types them before they reach the bottom. Miss 5 words and the
game ends. It's an **80s-arcade staged** experience: one infinite track where you
clear a per-stage word goal, earn a 1–3 star rating, and advance to the next,
harder stage forever. It's a static single-page app deployed to GitHub Pages.

Live base path is `/wordrain/` (see `vite.config.ts`), so all asset URLs and
routes are prefixed with `/wordrain`.

## Tech stack

- **React 18 + TypeScript**, built with **Vite**
- **Zustand** for state (stores under `client/src/lib/stores/`)
- **Tailwind CSS** + Radix UI primitives (`client/src/components/ui/` is a large
  shadcn-style component library; most of it is unused by the game itself)
- **Framer Motion** for word fall / explosion animations
- **Howler.js** for audio
- **react-router-dom** for routing
- Note: many heavy deps in `package.json` (three.js, pixi, matter-js, etc.) are
  **not used** by the actual game — it renders with plain DOM + Framer Motion.

## Commands

**Always use pnpm** for this project (not npm).

```bash
pnpm install       # install dependencies
pnpm dev           # Vite dev server
pnpm build         # production build → dist/
pnpm preview       # serve the production build locally
pnpm check         # tsc type-check (noEmit)
pnpm deploy        # gh-pages -d dist (manual deploy; CI also auto-deploys)
```

There is **no test suite** and no linter configured. Use `pnpm check` to
verify types after changes.

URL params: `?test=1` forces long-phrases-only; `?debug=1` shows the live
tuning overlay (stage, intensity, phase, derived levers); `?stage=N` starts a run
deep at stage N (tuning late game).

Deployment is automatic via `.github/workflows/` on push to `main` (GitHub
Pages). `DEPLOYMENT.md` has details.

## Project layout

Source lives in `client/src/` (Vite `root` is `client/`):

- `App.tsx` — top-level game component: routing, audio init/unlock (lots of
  mobile audio-context handling), the start/game-over menus, run summary.
- `main.tsx` — React entry, wraps `App` in `BrowserRouter`.
- `components/game/`
  - `useGameLoop.ts` — the **single game loop** (`requestAnimationFrame`). Starts
    when phase is `"playing"`, computes real `dt`, schedules spawns from the
    intensity-driven interval/max-words (using the current stage's theme), and
    calls `tick(dt)`. Reads live state via Zustand `getState()` so the loop is
    never torn down mid-game.
  - `WordRainCanvas.tsx` — rendering only: invokes `useGameLoop()` and maps the
    `words` / `explodingLetters` arrays to components (also renders frozen words
    during the `stageClear` pause).
  - `FallingWord.tsx` — renders one falling word, per-letter cursor highlighting,
    rotation (driven by the word's `rotationSpeed`), and long-phrase line wrapping.
  - `ExplodingLetter.tsx` — letter particle animation on word completion.
  - `TypingInput.tsx` — hidden input that captures keystrokes (desktop keeps it
    focused; mobile shows a "TAP TO TYPE" button to summon the keyboard).
  - `GameUI.tsx` — HUD: lives (hearts), stage + goal bar, score / multiplier /
    words / accuracy, mute toggle.
  - `StageInterstitial.tsx` — the "STAGE CLEAR" star screen shown during the
    `stageClear` pause; its timer calls `advanceStage()` (~1.8s).
  - `CyberpunkBackground.tsx` — decorative animated background shapes.
  - `DebugOverlay.tsx` — dev-only stage/progression overlay (gated by `?debug=1`).
- `lib/stores/` (Zustand)
  - `useGame.tsx` — game phase: `"ready" | "playing" | "stageClear" | "ended"`.
  - `useWordRain.tsx` — **core game state & logic**: words array, spawning,
    `tick(dt)` (dt-based movement, miss detection, intensity update), keystroke
    matching, scoring (× stage multiplier), accuracy, rolling performance signals,
    **stage state** (`stage`, `stageWordsCleared`, star metrics, `advanceStage`,
    `setStage`), explosion generation, text wrapping/bounds math.
  - `useAudio.tsx` — Howler hit/success sounds, mute, audio-context recovery.
- `lib/`
  - `stages.ts` — the **arcade stage system** (see below): pure functions of the
    stage number (goal words, base intensity, theme, multiplier, star rating).
  - `progression.ts` — the **difficulty engine** (see below). Continuous
    `intensity`, phases, and the pure lever functions everything derives from.
    All tuning constants live at the top of this file.
  - `variations.ts` — **stage themes** (`gentle`/`normal`/`storm`/`rotation`/
    `phrase`): per-lever modifiers applied per stage by `stages.ts`. Not
    user-selectable.
  - `gameData.ts` — word selection: combines all word lists, buckets by length,
    picks words for a given size distribution, and the giant `FONT_FAMILIES` list
    used for random per-word fonts.
  - `bip39.ts`, `longWords.ts`, `phrases.ts`, `longPhrases.ts` — word/phrase
    source lists.
  - `utils.ts` — `cn()` Tailwind class helper.
- `hooks/use-is-mobile.tsx` — `< 768px` viewport check.
- `public/` — `sounds/`, `textures/`, `fonts/`, etc. (served under `/wordrain/`).

## How the game works

1. `useGame` phase starts at `"ready"`. Pressing START sets phase to `"playing"`,
   which (via a `useGame.subscribe` in `useWordRain.tsx`) resets the run (stage 1)
   and records the start time. The subscribe **skips** the reset on a
   `stageClear → playing` transition (that's just `advanceStage`).
2. `useGameLoop` runs one stable rAF while playing. Each frame it computes real
   `dt`, decides whether to spawn (interval from `getSpawnInterval`, capped by
   `getMaxWords`, using the current stage's theme), and calls `tick(dt)`.
3. `tick(dt)` moves every word down by `speed * dt` (**px/second** — frame-rate
   independent), marks words past the bottom as `missed`, removes
   off-screen/completed words, recomputes `intensity`/`phase` from the stage base,
   and calls `useGame.end()` once `missedWords >= 5`.
4. `TypingInput` forwards each valid keypress to `typeKey(key)`, which matches the
   char against every active word's cursor position (case-sensitive on the expected
   char; input is lowercased first). On a full match the word "completes" →
   explosion, points, and stage-goal progress.
5. Scoring (all × the stage multiplier): +10 per correct keystroke, +50 per
   completed word, plus up to +100 for clearing a word high on screen. Accuracy =
   correct / total keystrokes.

### Arcade stages (`lib/stages.ts`)

One infinite track. Pure functions of the stage number:
- `stageGoalWords(stage)` — words to clear to finish the stage.
- `stageBaseIntensity(stage)` — the difficulty floor entering the stage (gentle
  early, easing toward 1, then slow overtime climb for infinity).
- `stageTheme(stage)` — the themed wave (gentle on-ramp, then normal with storm /
  rotation / phrase set-pieces on a cycle).
- `stageMultiplier(stage)` — rising score multiplier.
- `computeStars({accuracy, avgClearHeight, misses})` → 1–3 stars.

Flow: clear `stageGoalWords` → `typeKey` computes stars + bonus and calls
`useGame.stageClear()` (phase → `stageClear`, loop pauses, words freeze).
`StageInterstitial` shows the star card ~1.8s then calls `advanceStage()`
(`stage++`, fresh words, reset stage metrics; **intensity carries over** since it
already ramped to the next stage's base) → back to `playing`. Hearts are a
whole-run life bar (5 misses ever = game over); stars are per-stage.

### Progression / difficulty (`lib/progression.ts`)

A single continuous **`intensity`** drives every difficulty lever. It is:
- a **base intensity** — the floor the current stage sets (ramped within the stage
  by goal progress, so crossing the stage line is seamless); plus
- a **skill offset** — a flow-channel modulator dominated by **clear height** (the
  screen-Y where you destroy words) with accuracy + recent misses: clearing high
  pushes intensity up, struggling pulls it back for brief relief.

Intensity is **rate-limited per second** (no cliffs) and may exceed 1 in deep
overtime — there `getFallSpeed` is held at a readable ceiling while `getMaxWords`
and word length keep rising. Named **phases** (`warmup → flow → pressure → storm →
chaos`) gate the *introduction* of mechanics. Levers (`getFallSpeed`,
`getSpawnInterval`, `getMaxWords`, `getRotation`, `getWordSizeDistribution`) are
pure functions of `intensity` + the stage **theme**. **Tune feel via the constants
blocks at the top of `progression.ts` and `stages.ts`**; `?debug=1` shows the live
curve.

### Themes (`lib/variations.ts`)

Not user-selectable — `stages.ts` picks a `Theme` per stage. Each is per-lever
modifiers (`speedMul`, `spawnMul`, `maxWordsMul`, rotation flags, `sizeWeights`,
`fontSize`, `clusters`, `skillSensitivity`). Current set:

- `gentle` — kid-friendly early stages (slow, short words, no rotation/phrases).
- `normal` — the reference theme (all defaults).
- `storm` — slow fall but very dense, word clusters.
- `rotation` — rotation from the start of the stage, amplified.
- `phrase` — `sizeWeights` tilted toward long words and phrases.

To add a theme: define a `Theme` in `variations.ts`, add it to `THEMES`, then map
stages to it in `stageThemeId()` in `stages.ts`.

### Test mode

Append `?test=true` (or `?test=1`) to the URL to force **long-phrases-only**
mode (`getRandomWord` returns only long phrases). A 🧪 badge shows in the UI.

## Conventions & gotchas

- The hot game-loop path is kept **log-free** on purpose (it runs every frame).
  Use the `?debug=1` overlay instead of `console.log` for progression debugging.
  Older audio/mobile code in `App.tsx` still has emoji-prefixed logs.
- All asset paths are hardcoded with the `/wordrain/` prefix — keep that prefix
  when adding sounds/assets, or they break in production.
- `wrapText` / word-bounds logic is **duplicated** in `useWordRain.tsx` and
  `FallingWord.tsx` (and the long-phrase thresholds like `length > 15`). If you
  change wrapping behavior, update both to keep spawn-position math and rendering
  in sync.
- Mobile support is delicate: audio unlocking and keyboard focus have lots of
  special-casing in `App.tsx` and `TypingInput.tsx` — change carefully.
- `@/` path alias maps to `client/src/` (see `vite.config.ts` / `tsconfig.json`),
  though game code mostly uses relative imports.
- TypeScript is in `strict` mode.
