import { PROJECT_VIEWS, type ProjectView } from "./project-data";

/** Total controlled travel of the focus wheel — no endless spinning. */
export const FOCUS_RANGE_DEG = 120;
export const FOCUS_DETENTS = PROJECT_VIEWS.length;
const STEP = 1 / (FOCUS_DETENTS - 1);
/** Maximum projection blur (px) when the wheel sits exactly between two views. */
export const MAX_FOCUS_BLUR = 7;

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function valueForView(view: ProjectView): number {
  return PROJECT_VIEWS.indexOf(view) * STEP;
}

export function nearestDetent(value: number): number {
  return Math.round(clamp01(value) / STEP);
}

export function viewForValue(value: number): ProjectView {
  return PROJECT_VIEWS[nearestDetent(value)];
}

export function snapValue(value: number): number {
  return nearestDetent(value) * STEP;
}

export function angleForValue(value: number): number {
  return clamp01(value) * FOCUS_RANGE_DEG * (Math.PI / 180);
}

/** Distance from the nearest detent, normalised to 0 (sharp) .. 1 (halfway). */
export function defocusAmount(value: number): number {
  const d = Math.abs(clamp01(value) - snapValue(value));
  return Math.min(1, d / (STEP / 2));
}

export function blurForValue(value: number): number {
  // ease so the image stays readable close to a detent
  const d = defocusAmount(value);
  return MAX_FOCUS_BLUR * d * d;
}

/**
 * Apply a drag delta (in focus units) with gentle mechanical resistance:
 * movement slows slightly as it leaves a detent, so the wheel "clicks" in.
 */
export function dragFocus(value: number, delta: number): number {
  const resistance = 1 - 0.35 * (1 - defocusAmount(value));
  return clamp01(value + delta * resistance);
}

export function stepFocus(value: number, dir: 1 | -1): number {
  return clamp01(snapValue(value) + dir * STEP);
}
