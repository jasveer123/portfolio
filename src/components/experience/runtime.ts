import * as THREE from "three";
import { LENS_ORIGIN, RECT_CORNERS } from "@/lib/scene-config";

/**
 * Per-frame values shared between scene parts. Mutated inside useFrame —
 * never stored in React state, so animation never triggers re-renders.
 */
export const runtime = {
  /** Bulb output 0..1.1 (flicker during warm-up, slight overexposure on slide change). */
  level: 0,
  /** Cooling-fan angular speed (rad/s). */
  fanSpeed: 0,
  /** Indicator lamp brightness 0..1. */
  indicator: 0,
  /** Desk-lamp output 0..1. */
  lamp: 0,
  /** World-space beam origin (lens) and screen corners (TL, TR, BR, BL). */
  lens: LENS_ORIGIN.clone(),
  corners: RECT_CORNERS.map((c) => c.clone()),
  /** Name of the GLB node under the pointer (hover feedback). */
  hovered: null as string | null,
};

/** Piecewise-linear lamp warm-up curve, matching the CSS `lamp-warm` keyframes. */
const WARM_CURVE: [number, number][] = [
  [0, 0],
  [0.12, 0.35],
  [0.18, 0.08],
  [0.3, 0.55],
  [0.36, 0.3],
  [0.6, 0.85],
  [1, 1],
];

export function warmCurve(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  for (let i = 1; i < WARM_CURVE.length; i++) {
    const [t1, v1] = WARM_CURVE[i];
    const [t0, v0] = WARM_CURVE[i - 1];
    if (t <= t1) return v0 + ((t - t0) / (t1 - t0)) * (v1 - v0);
  }
  return 1;
}

export function damp(current: number, target: number, lambda: number, dt: number) {
  return THREE.MathUtils.damp(current, target, lambda, dt);
}
