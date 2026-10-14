"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { experienceStore } from "@/lib/experience-store";

/**
 * Turns the focus wheel towards `focusTarget` whenever a view is chosen by a
 * tab, the brass dial or the URL. Because the projection blur is derived from
 * the wheel position, the current layer defocuses and the next one sharpens
 * on the way — the same path a hand on the wheel would take.
 */
export function FocusDriver() {
  useEffect(() => {
    const proxy = { v: experienceStore.getState().focusValue };
    let tween: gsap.core.Tween | null = null;
    let lastTarget = experienceStore.getState().focusTarget;

    const unsub = experienceStore.subscribe((s) => {
      if (s.focusDragging) {
        tween?.kill();
        tween = null;
        lastTarget = s.focusTarget;
        return;
      }
      if (s.focusTarget === lastTarget) return;
      lastTarget = s.focusTarget;
      tween?.kill();
      if (s.reducedMotion) {
        experienceStore.setState({ focusValue: s.focusTarget });
        return;
      }
      proxy.v = s.focusValue;
      const distance = Math.abs(s.focusTarget - s.focusValue);
      tween = gsap.to(proxy, {
        v: s.focusTarget,
        duration: 0.35 + distance * 0.5,
        ease: "power2.inOut",
        onUpdate: () => experienceStore.setState({ focusValue: proxy.v }),
      });
    });
    return () => {
      unsub();
      tween?.kill();
    };
  }, []);
  return null;
}
