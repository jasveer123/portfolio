"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { useFrame } from "@react-three/fiber";
import { experienceStore, isLit, TIMINGS } from "@/lib/experience-store";
import { angleForValue } from "@/lib/focus";
import type { ModelRig } from "@/lib/projector-model";
import { runtime, warmCurve, damp } from "./runtime";

/**
 * The projector body: power switch, indicator lamp, bulb level, cooling fan,
 * running vibration, focus wheel + lens barrel, and button presses.
 * Slide handling lives in SlideCarousel.
 */
const AMBER = new THREE.Color(1, 0.45, 0.08);
const OFF = new THREE.Color("#2a1a10");
const WARM = new THREE.Color(1, 0.78, 0.5);

export function Projector({ rig }: { rig: ModelRig }) {
  const n = rig.nodes;
  const base = useMemo(
    () => ({
      switchX: n.power_switch.rotation.x,
      wheelX: n.focus_wheel.rotation.x,
      ringZ: n.focus_ring.rotation.z,
      bodyY: n.projector_body.position.y,
      carouselY: n.slide_carousel.position.y,
      buttons: {
        next: n.next_slide_button.position.clone(),
        previous: n.previous_slide_button.position.clone(),
        eject: n.eject_button.position.clone(),
      },
      leverX: n.carousel_lever.rotation.x,
    }),
    [n],
  );

  // Lamps that change at runtime get their own unlit materials (everything else is baked).
  const materials = useMemo(() => {
    const own = (node: THREE.Object3D) => {
      const m = new THREE.MeshBasicMaterial({ color: "#1a120c", toneMapped: false });
      node.traverse((o) => {
        if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).material = m;
      });
      return m;
    };
    return {
      indicator: [own(n.indicator_lamp), own(n.side_indicator_lamp)],
      lens: [own(n.lens_bulb_glow)],
    };
  }, [n]);

  const phase = useRef({ start: 0, state: experienceStore.getState().projectorState, kick: 0, autoFocus: 0 });

  // switch + state timing
  useEffect(() => {
    const sw = n.power_switch;
    sw.rotation.x = isLit(experienceStore.getState().projectorState) ? -base.switchX : base.switchX;
    return experienceStore.subscribe((s, p) => {
      if (s.projectorState !== p.projectorState) {
        phase.current.state = s.projectorState;
        phase.current.start = performance.now();
        if (s.projectorState === "warming" || s.projectorState === "cooling") {
          const on = s.projectorState === "warming";
          gsap.to(sw.rotation, { x: on ? -base.switchX : base.switchX, duration: s.reducedMotion ? 0 : 0.09, ease: "power4.out" });
          phase.current.kick = 1;
        }
        if (s.projectorState === "focusing") phase.current.autoFocus = 1;
      }
      // button presses (from the 3D object or its HTML twin)
      if (s.pressed && s.pressed.seq !== p.pressed?.seq && !s.reducedMotion) {
        const c = s.pressed.control;
        if (c === "next" || c === "previous") {
          const node = c === "next" ? n.next_slide_button : n.previous_slide_button;
          gsap.fromTo(node.position, { z: base.buttons[c].z - 0.003 }, { z: base.buttons[c].z, duration: 0.18, ease: "power2.out" });
        } else if (c === "eject") {
          gsap.fromTo(n.eject_button.position, { y: base.buttons.eject.y - 0.003 }, { y: base.buttons.eject.y, duration: 0.2, ease: "power2.out" });
          gsap.fromTo(n.carousel_lever.rotation, { x: base.leverX + 0.35 }, { x: base.leverX, duration: 0.35, ease: "back.out(2)" });
        }
      }
    });
  }, [n, base]);

  useFrame((state, dt) => {
    const s = experienceStore.getState();
    const t = state.clock.elapsedTime;
    const elapsed = (performance.now() - phase.current.start) / 1000;
    const lit = isLit(s.projectorState);

    // bulb level
    let target = 0;
    if (s.projectorState === "warming") {
      const dur = (s.reducedMotion ? TIMINGS.reducedWarm : s.transition?.quick ? TIMINGS.warmQuick : TIMINGS.warm) / 1000;
      target = warmCurve(elapsed / dur);
      runtime.level = target; // follow the flicker exactly
    } else {
      if (s.projectorState === "changing-slide") target = 1.12;
      else if (lit) target = 1;
      runtime.level = damp(runtime.level, target, s.projectorState === "cooling" ? 2.2 : 6, dt);
    }

    // indicator lamp: off / soft pulse (loading) / solid (ready) / blink (changing)
    let ind = 0;
    if (s.projectorState === "warming") ind = 0.45 + 0.4 * Math.sin(t * 6);
    else if (s.projectorState === "changing-slide") ind = Math.sin(t * 28) > 0 ? 1 : 0.15;
    else if (lit) ind = 1;
    runtime.indicator = damp(runtime.indicator, ind, 18, dt);
    for (const m of materials.indicator) m.color.copy(OFF).lerp(AMBER, Math.min(1, runtime.indicator)).multiplyScalar(0.6 + runtime.indicator * 2.4);
    for (const m of materials.lens) m.color.copy(OFF).lerp(WARM, Math.min(1, runtime.level)).multiplyScalar(0.5 + runtime.level * 2.2);

    // fan: accelerates gradually, keeps turning briefly after power-down
    runtime.fanSpeed = damp(runtime.fanSpeed, lit ? 22 : 0, lit ? 1.1 : 0.7, dt);
    n.cooling_fan.rotation.z += runtime.fanSpeed * dt;

    // body vibration while running + a small kick when switched
    phase.current.kick = damp(phase.current.kick, 0, 9, dt);
    const hum = s.reducedMotion ? 0 : (lit ? 0.00014 : 0) * Math.sin(t * 95) + phase.current.kick * 0.0009 * Math.sin(t * 60);
    n.projector_body.position.y = base.bodyY + hum;
    n.slide_carousel.position.y = base.carouselY + hum;

    // focus wheel: follows focusValue; turns itself while auto-focusing
    phase.current.autoFocus = damp(phase.current.autoFocus, 0, s.reducedMotion ? 30 : 3.4, dt);
    const auto = Math.sin(phase.current.autoFocus * Math.PI) * 0.9 * phase.current.autoFocus;
    const angle = angleForValue(s.focusValue) + auto;
    n.focus_wheel.rotation.x = base.wheelX + angle;
    n.focus_ring.rotation.z = base.ringZ + angle; // the barrel turns with the wheel
  });

  return null;
}
