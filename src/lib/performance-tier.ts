/**
 * Performance tiers:
 *  - high:   desktop — full room, more dust, DPR up to 2
 *  - medium: tablets / modest GPUs — fewer particles, DPR ≤ 1.5
 *  - low:    phones — simplified scene, DPR ≤ 1.25
 *  - static: no WebGL or very low-power device — cinematic still + HTML portfolio
 */
export type PerformanceTier = "high" | "medium" | "low" | "static";

export type TierSettings = {
  dpr: [number, number];
  dust: number;
  antialias: boolean;
  shadows: boolean;
};

export const TIER_SETTINGS: Record<Exclude<PerformanceTier, "static">, TierSettings> = {
  high: { dpr: [1, 2], dust: 650, antialias: true, shadows: false },
  medium: { dpr: [1, 1.5], dust: 320, antialias: true, shadows: false },
  low: { dpr: [1, 1.25], dust: 140, antialias: false, shadows: false },
};

export type TierSignals = {
  webgl: boolean;
  forced?: string | null;
  width: number;
  coarsePointer: boolean;
  deviceMemory?: number;
  hardwareConcurrency?: number;
  saveData?: boolean;
};

export function decideTier(s: TierSignals): PerformanceTier {
  if (s.forced === "static" || s.forced === "high" || s.forced === "medium" || s.forced === "low") {
    return s.forced === "static" || s.webgl ? (s.forced as PerformanceTier) : "static";
  }
  if (!s.webgl) return "static";
  if (s.saveData) return "static";
  if ((s.deviceMemory ?? 8) <= 2 || (s.hardwareConcurrency ?? 8) <= 2) return "static";
  if (s.coarsePointer && s.width < 768) return "low";
  if (s.coarsePointer || s.width < 1100 || (s.deviceMemory ?? 8) <= 4) return "medium";
  return "high";
}

export function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export function detectTier(): PerformanceTier {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  const forced = new URLSearchParams(window.location.search).get("quality");
  return decideTier({
    webgl: hasWebGL(),
    forced,
    width: window.innerWidth,
    coarsePointer: window.matchMedia("(pointer: coarse)").matches,
    deviceMemory: nav.deviceMemory,
    hardwareConcurrency: nav.hardwareConcurrency,
    saveData: nav.connection?.saveData,
  });
}
