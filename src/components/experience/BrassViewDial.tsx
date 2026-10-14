"use client";

import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { experienceStore } from "@/lib/experience-store";
import { nearestDetent } from "@/lib/focus";
import type { ModelRig } from "@/lib/projector-model";

/**
 * Brass view-selector: the octagonal knob turns a quarter for each case-study
 * view (Product · Architecture · Engineering · Impact). Outside a case study it
 * only gives a small "locked" wiggle.
 */
export function BrassViewDial({ rig }: { rig: ModelRig }) {
  const knob = rig.nodes.Navigation_Dial_Base.getObjectByName("Navigation_Dial_Knob") ?? rig.nodes.Navigation_Dial_Base;
  const baseY = useMemo(() => knob.rotation.y, [knob]);
  const tween = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const angleFor = (i: number) => baseY - i * (Math.PI / 2);
    knob.rotation.y = angleFor(nearestDetent(experienceStore.getState().focusTarget));
    return experienceStore.subscribe((s, p) => {
      const pressed = s.pressed?.control === "dial" && s.pressed.seq !== p.pressed?.seq;
      if (s.focusTarget === p.focusTarget && !pressed) return;
      tween.current?.kill();
      if (pressed && !s.activeProject) {
        tween.current = gsap.fromTo(knob.rotation, { y: knob.rotation.y + 0.12 }, { y: knob.rotation.y, duration: 0.45, ease: "elastic.out(1, 0.35)" });
        return;
      }
      tween.current = gsap.to(knob.rotation, {
        y: angleFor(nearestDetent(s.focusTarget)),
        duration: s.reducedMotion ? 0 : 0.45,
        ease: "back.out(1.6)",
      });
    });
  }, [knob, baseY]);

  return null;
}
