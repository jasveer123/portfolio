"use client";

import { useEffect } from "react";
import { experienceStore } from "@/lib/experience-store";

/**
 * Follows `prefers-reduced-motion`. In reduced-motion mode the state machine
 * shortens every phase to a fade, the 3D parts jump to their end positions and
 * CSS replaces focus pulls, grain and flicker with simple fades.
 */
export function ReducedMotionExperience() {
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => experienceStore.getState().setReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return null;
}
