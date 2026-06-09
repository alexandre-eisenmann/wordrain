// Provider-agnostic ad wrapper.
//
// The game never talks to a specific ad SDK directly — it calls these four
// functions and stays clean. A "provider" is chosen once at load time:
//
//   - If a portal SDK is detected on `window` (e.g. CrazyGames), the matching
//     provider is used and real ads play.
//   - Otherwise (local `pnpm dev`, plain GitHub Pages, `?test=1`) a no-op dev
//     provider is used: interstitials do nothing and rewarded ads resolve as
//     "granted" so the revive flow stays fully testable without an SDK.
//
// GOING LIVE ON A PORTAL (recommended path — CrazyGames):
//   1. Add their SDK <script> to client/index.html (see CRAZYGAMES_SDK_NOTE).
//   2. That's it — `detectProvider()` picks it up automatically. No game-code
//      changes. Verify the exact SDK method names against current CrazyGames
//      docs, since portal SDKs evolve; this file targets their v3 API shape.

export type AdPlacement = "interstitial" | "rewarded";

interface AdProvider {
  readonly name: string;
  init: () => void;
  /** Tell the portal the player is actively playing (un-mutes, resumes ads). */
  gameplayStart: () => void;
  /** Tell the portal gameplay paused (menus, game over, stage breaks). */
  gameplayStop: () => void;
  /** Resolves true only if the reward was actually earned (ad watched). */
  showRewarded: () => Promise<boolean>;
  /** Always resolves (even on no-fill / error) so it can't soft-lock the game. */
  showInterstitial: () => Promise<void>;
}

// Hard cap so a hung/blocked ad call can never freeze stage progression.
const AD_SAFETY_TIMEOUT_MS = 8000;

function withTimeout<T>(p: Promise<T>, fallback: T, ms = AD_SAFETY_TIMEOUT_MS): Promise<T> {
  return new Promise((resolve) => {
    let done = false;
    const finish = (v: T) => {
      if (done) return;
      done = true;
      resolve(v);
    };
    const timer = setTimeout(() => finish(fallback), ms);
    p.then((v) => {
      clearTimeout(timer);
      finish(v);
    }).catch(() => {
      clearTimeout(timer);
      finish(fallback);
    });
  });
}

// ---------------------------------------------------------------------------
// Dev / no-SDK provider: safe no-ops, rewarded auto-grants.
// ---------------------------------------------------------------------------
const devProvider: AdProvider = {
  name: "dev-noop",
  init: () => {},
  gameplayStart: () => {},
  gameplayStop: () => {},
  showRewarded: async () => true,
  showInterstitial: async () => {},
};

// ---------------------------------------------------------------------------
// CrazyGames provider (https://docs.crazygames.com — SDK v3).
// Active only when window.CrazyGames.SDK is present.
// ---------------------------------------------------------------------------
function getCrazyGamesSdk(): any | null {
  const cg = (window as any).CrazyGames;
  return cg && cg.SDK ? cg.SDK : null;
}

const crazyGamesProvider: AdProvider = {
  name: "crazygames",
  init: () => {
    try {
      getCrazyGamesSdk()?.init?.();
    } catch {
      /* ignore — falls back to no-op behavior */
    }
  },
  gameplayStart: () => {
    try {
      getCrazyGamesSdk()?.game?.gameplayStart?.();
    } catch {
      /* ignore */
    }
  },
  gameplayStop: () => {
    try {
      getCrazyGamesSdk()?.game?.gameplayStop?.();
    } catch {
      /* ignore */
    }
  },
  showRewarded: () =>
    new Promise<boolean>((resolve) => {
      const sdk = getCrazyGamesSdk();
      if (!sdk?.ad?.requestAd) {
        resolve(false);
        return;
      }
      let rewarded = false;
      try {
        sdk.ad.requestAd("rewarded", {
          adFinished: () => {
            rewarded = true;
            resolve(true);
          },
          adError: () => resolve(rewarded),
          // adStarted intentionally unused.
        });
      } catch {
        resolve(false);
      }
    }),
  showInterstitial: () =>
    new Promise<void>((resolve) => {
      const sdk = getCrazyGamesSdk();
      if (!sdk?.ad?.requestAd) {
        resolve();
        return;
      }
      try {
        sdk.ad.requestAd("midgame", {
          adFinished: () => resolve(),
          adError: () => resolve(),
        });
      } catch {
        resolve();
      }
    }),
};

// ---------------------------------------------------------------------------
// Provider selection (once, at module load).
// ---------------------------------------------------------------------------
function detectProvider(): AdProvider {
  if (typeof window === "undefined") return devProvider;
  if (getCrazyGamesSdk()) return crazyGamesProvider;
  return devProvider;
}

const provider = detectProvider();
provider.init();

// ---------------------------------------------------------------------------
// Public API — the only thing game code imports.
// ---------------------------------------------------------------------------

/** Notify the ad provider that active gameplay has started. */
export function adGameplayStart(): void {
  provider.gameplayStart();
}

/** Notify the ad provider that active gameplay has paused/ended. */
export function adGameplayStop(): void {
  provider.gameplayStop();
}

/**
 * Show an opt-in rewarded ad. Resolves true only if the reward was earned.
 * Safe against hangs (resolves false after a timeout).
 */
export function showRewarded(): Promise<boolean> {
  return withTimeout(provider.showRewarded(), false);
}

/**
 * Show an interstitial ad at a natural break. Always resolves so it can never
 * block stage progression.
 */
export function showInterstitial(): Promise<void> {
  return withTimeout(provider.showInterstitial(), undefined as void);
}

/** Which provider is active (handy for a debug readout). */
export const activeAdProvider = provider.name;

/**
 * True only when a real ad SDK is present (e.g. CrazyGames Full Launch). Use this
 * to gate ad-dependent UI like the "watch ad to revive" button — it must NOT show
 * in environments with no real ads (local dev, GitHub Pages, CrazyGames Basic
 * Launch), where a non-functional "WATCH AD" button looks broken and violates the
 * Basic Launch no-ads rule.
 */
export const adsEnabled = provider !== devProvider;
