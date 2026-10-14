"use client";

import { useEffect } from "react";
import { experienceStore, isLit, TIMINGS, type ExperienceStore } from "@/lib/experience-store";
import { audio } from "@/lib/audio-manager";

/** Translates state-machine changes into mechanical sounds. */
export function AudioController() {
  useEffect(() => {
    let prev: ExperienceStore = experienceStore.getState();
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timeouts.push(setTimeout(fn, ms));

    const unsub = experienceStore.subscribe((s) => {
      if (s.soundEnabled !== prev.soundEnabled) audio.setEnabled(s.soundEnabled);

      if (s.projectorState !== prev.projectorState) {
        if (s.projectorState === "warming") {
          audio.play("switch");
          audio.startProjector(s.transition?.quick ? TIMINGS.warmQuick : TIMINGS.warm);
        }
        if (s.projectorState === "cooling") {
          audio.play("switch");
          audio.stopProjector(TIMINGS.cool);
        }
      }

      const t = s.transition;
      if (t && t.id !== prev.transition?.id && (t.kind === "slide" || t.kind === "eject")) {
        const fast = s.reducedMotion ? 0.15 : 1;
        if (prev.insertedSlide || prev.carouselDropped) audio.play("slideOut");
        if (s.carouselIndex !== prev.carouselIndex || s.carouselSet !== prev.carouselSet) at(120 * fast, () => audio.play("carousel"));
        if (t.kind === "slide") at(640 * fast, () => audio.play("slideIn"));
      }

      if (s.screenRaised !== prev.screenRaised) audio.play("cord");
      if (s.drawerOpen !== prev.drawerOpen) audio.play("drawer");
      if (s.lampOn !== prev.lampOn) audio.play("lamp");
      if (s.activeExperience !== prev.activeExperience && s.activeSection === "experience") audio.play("film");
      if (s.pressed && s.pressed.seq !== prev.pressed?.seq && s.pressed.control !== "power") audio.play("button");

      // focus wheel ticks as it passes notches
      if (isLit(s.projectorState) && Math.floor(s.focusValue * 24) !== Math.floor(prev.focusValue * 24)) audio.play("focusTick");

      prev = s;
    });
    return () => {
      unsub();
      timeouts.forEach(clearTimeout);
    };
  }, []);
  return null;
}
