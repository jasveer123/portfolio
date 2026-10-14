"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { experienceStore, isLit, useExperience } from "@/lib/experience-store";
import type { ModelRig } from "@/lib/projector-model";

/**
 * Teaches the interface one step at a time — never all instructions at once:
 *   off → "Switch on to view my work." label at the power switch
 *   first lit → "Choose a slide" over the tray
 *   first case study → "Drag to focus" at the focus wheel
 *   first timeline → "Drag the film" over the filmstrip
 */
export function InteractionHints({ rig }: { rig: ModelRig }) {
  const state = useExperience((s) => s.projectorState);
  const project = useExperience((s) => s.activeProject);
  const section = useExperience((s) => s.activeSection);
  const seen = useExperience((s) => s.hintsSeen);
  const layoutMode = useExperience((s) => s.layoutMode);
  const view = useExperience((s) => s.viewMode);
  const settled = state === "ready" || state === "project-open";
  const [delayed, setDelayed] = useState(false);

  // give people a moment before nudging them
  useEffect(() => {
    setDelayed(false);
    if (!settled) return;
    const t = setTimeout(() => setDelayed(true), 1400);
    return () => clearTimeout(t);
  }, [settled, section, project]);

  // a slide chosen any other way also counts as learning the tray
  useEffect(
    () =>
      experienceStore.subscribe((s, p) => {
        if (s.activeSection !== p.activeSection && isLit(s.projectorState)) s.markHint("slides");
      }),
    [],
  );

  const pos = (o: THREE.Object3D, lift = 0.06) => {
    const v = o.getWorldPosition(new THREE.Vector3());
    return [v.x, v.y + lift, v.z] as [number, number, number];
  };

  let hint: { at: [number, number, number]; text: string; action?: () => void } | null = null;
  if (state === "off") {
    hint = {
      at: pos(rig.nodes.slide_carousel, 0.1),
      text: "Switch on to view my work.",
      action: () => experienceStore.getState().togglePower(),
    };
  } else if (delayed && layoutMode === "split") {
    if (!seen.includes("slides")) hint = { at: pos(rig.nodes.Slide_Holder_Wood, 0.16), text: "Choose a slide" };
    else if (project && !seen.includes("focus")) hint = { at: pos(rig.nodes.focus_ring, 0.09), text: "Drag the lens to focus" };
  }

  if (!hint || view !== "framed") return null;
  return (
    <Html position={hint.at} zIndexRange={[30, 20]} style={{ pointerEvents: "none" }}>
      <div className="hint-label">
        <div className="bob">
          {hint.action ? (
            <button type="button" tabIndex={-1} className="paper" style={{ pointerEvents: "auto" }} onClick={hint.action}>
              {hint.text}
            </button>
          ) : (
            <span className="paper ghost">{hint.text}</span>
          )}
          <span className="stem" aria-hidden="true" />
        </div>
      </div>
    </Html>
  );
}
