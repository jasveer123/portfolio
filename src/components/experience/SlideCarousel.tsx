"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { useFrame } from "@react-three/fiber";
import { experienceStore, type ExperienceStore } from "@/lib/experience-store";
import { PRIMARY_SECTIONS, trayIndex, type SectionId } from "@/lib/sections";
import {
  CAROUSEL_SLIDES,
  DESK_SLIDES,
  type ModelRig,
} from "@/lib/projector-model";
import { runtime, damp } from "./runtime";

const SLOT = (Math.PI * 2) / 5;
const DROP = 0.032;

type Home = {
  pos: THREE.Vector3;
  quat: THREE.Quaternion;
  scale: THREE.Vector3;
};

/** Tray slide index for a section: 0–4 primary, 5 = loose blueprint slide. */
function deskIndex(id: SectionId | null): number {
  if (!id) return -1;
  return id === "skills" ? 5 : trayIndex(id);
}

export function SlideCarousel({ rig }: { rig: ModelRig }) {
  const n = rig.nodes;
  const carousel = n.slide_carousel;
  const carouselSlides = useMemo(() => CAROUSEL_SLIDES.map((k) => n[k]), [n]);
  const deskSlides = useMemo(
    () => [...DESK_SLIDES.map((k) => n[k]), n.Desk_Slide_Loose],
    [n],
  );

  const homes = useMemo<Home[]>(
    () =>
      deskSlides.map((d) => ({
        pos: d.position.clone(),
        quat: d.quaternion.clone(),
        scale: d.scale.clone(),
      })),
    [deskSlides],
  );
  const slotHomeY = useMemo(
    () => carouselSlides.map((s) => s.position.y),
    [carouselSlides],
  );

  // Orientation of a slide standing in the gate, relative to the gate itself.
  const gateRel = useMemo(() => {
    carousel.parent?.updateMatrixWorld(true);
    const gateQ = n.slide_gate.getWorldQuaternion(new THREE.Quaternion());
    const slideQ = carouselSlides[0].getWorldQuaternion(new THREE.Quaternion());
    return gateQ.invert().multiply(slideQ);
  }, [carousel, carouselSlides, n.slide_gate]);

  const flying = useRef<boolean[]>(deskSlides.map(() => false));
  const lifts = useRef<number[]>(deskSlides.map(() => 0));
  const tl = useRef<gsap.core.Timeline | null>(null);
  const angle = useRef({ v: 0 });

  /** Place everything at the state's end position with no animation. */
  const settle = (s: ExperienceStore) => {
    angle.current.v = -s.carouselIndex * SLOT;
    carousel.rotation.y = angle.current.v;
    carouselSlides.forEach((slide, i) => {
      slide.position.y =
        slotHomeY[i] - (s.carouselDropped && i === s.carouselIndex ? DROP : 0);
    });
    const inserted = deskIndex(s.insertedSlide);
    deskSlides.forEach((d, i) => {
      d.position.copy(homes[i].pos);
      d.quaternion.copy(homes[i].quat);
      d.scale.copy(homes[i].scale);
      d.visible = i !== inserted && !d.userData.layoutHidden;
      flying.current[i] = false;
    });
  };

  /** Path of a tray slide between its home and the projector gate (u: 0 → 1). */
  const flightPath = (i: number) => {
    const d = deskSlides[i];
    const parent = d.parent!;
    parent.updateMatrixWorld(true);
    const home = homes[i];
    const homeW = parent.localToWorld(home.pos.clone());
    const gate = n.slide_gate.getWorldPosition(new THREE.Vector3());
    const hover = gate.clone().add(new THREE.Vector3(0, 0.1, 0));
    const final = gate.clone().add(new THREE.Vector3(0, 0.012, 0));
    const lifted = homeW.clone().add(new THREE.Vector3(0, 0.07, 0.02));
    const mid = lifted
      .clone()
      .lerp(hover, 0.5)
      .add(new THREE.Vector3(0, 0.12, 0.04));
    const curve = new THREE.CatmullRomCurve3(
      [homeW, lifted, mid, hover, final],
      false,
      "centripetal",
    );
    const parentQ = parent.getWorldQuaternion(new THREE.Quaternion());
    const parentQi = parentQ.clone().invert();
    const homeQW = parentQ.clone().multiply(home.quat);
    const gateQW = n.slide_gate
      .getWorldQuaternion(new THREE.Quaternion())
      .multiply(gateRel);
    const tmpQ = new THREE.Quaternion();
    const tmpP = new THREE.Vector3();
    return (u: number) => {
      curve.getPoint(u, tmpP);
      d.position.copy(parent.worldToLocal(tmpP));
      const r = THREE.MathUtils.smoothstep(u, 0.2, 0.78);
      tmpQ.slerpQuaternions(homeQW, gateQW, r);
      d.quaternion.copy(parentQi).multiply(tmpQ);
      const sc = THREE.MathUtils.lerp(
        1,
        0.53,
        THREE.MathUtils.smoothstep(u, 0.45, 1),
      );
      d.scale.copy(home.scale).multiplyScalar(sc);
    };
  };

  useEffect(() => {
    settle(experienceStore.getState());
    return experienceStore.subscribe((s, p) => {
      const mechChanged =
        s.insertedSlide !== p.insertedSlide ||
        s.carouselIndex !== p.carouselIndex ||
        s.carouselSet !== p.carouselSet ||
        s.carouselDropped !== p.carouselDropped;
      if (!mechChanged) return;
      tl.current?.kill();
      if (s.reducedMotion) {
        settle(s);
        return;
      }

      const t = gsap.timeline();
      tl.current = t;

      // 1. lift the previously dropped carousel slide out of the gate
      carouselSlides.forEach((slide, i) => {
        const shouldDrop = s.carouselDropped && i === s.carouselIndex;
        if (!shouldDrop && slide.position.y < slotHomeY[i] - 0.001) {
          t.to(
            slide.position,
            { y: slotHomeY[i], duration: 0.16, ease: "power2.out" },
            0,
          );
        }
      });

      // 2. eject the previous tray slide back to the tray
      const prevI = deskIndex(p.insertedSlide);
      const nextI = deskIndex(s.insertedSlide);
      if (prevI !== -1 && prevI !== nextI) {
        const d = deskSlides[prevI];
        const path = flightPath(prevI);
        const proxy = { u: 1 };
        flying.current[prevI] = true;
        t.call(
          () => {
            d.visible = !d.userData.layoutHidden;
            path(1);
          },
          [],
          0,
        );
        t.to(
          proxy,
          {
            u: 0,
            duration: 0.38,
            ease: "power2.inOut",
            onUpdate: () => path(proxy.u),
          },
          0.02,
        );
        t.call(
          () => {
            flying.current[prevI] = false;
            d.position.copy(homes[prevI].pos);
            d.quaternion.copy(homes[prevI].quat);
            d.scale.copy(homes[prevI].scale);
          },
          [],
          0.42,
        );
      }

      // 3. rotate the carousel: short acceleration, small overshoot, settle
      const target = -s.carouselIndex * SLOT;
      const from = angle.current.v;
      let to =
        target + Math.PI * 2 * Math.round((from - target) / (Math.PI * 2));
      const setChanged = s.carouselSet !== p.carouselSet;
      if (setChanged && Math.abs(to - from) < 0.01) to -= Math.PI * 2;
      if (Math.abs(to - from) > 0.001 || setChanged) {
        t.to(
          angle.current,
          {
            v: to,
            duration: 0.42 + Math.min(0.2, Math.abs(to - from) * 0.05),
            ease: "back.out(1.15)",
            onUpdate: () => {
              carousel.rotation.y = angle.current.v;
            },
          },
          0.12,
        );
      }

      // 4. the new tray slide rises, travels and drops into the gate
      if (nextI !== -1 && nextI !== prevI) {
        const d = deskSlides[nextI];
        const proxy = { u: 0 };
        let path: ((u: number) => void) | null = null;
        t.call(
          () => {
            flying.current[nextI] = true;
            d.visible = !d.userData.layoutHidden;
            path = flightPath(nextI);
          },
          [],
          0.18,
        );
        t.to(
          proxy,
          {
            u: 1,
            duration: 0.5,
            ease: "power2.inOut",
            onUpdate: () => path?.(proxy.u),
          },
          0.2,
        );
        t.call(
          () => {
            d.visible = false;
            flying.current[nextI] = false;
          },
          [],
          0.72,
        );
      }

      // 5. project slides drop from the carousel into the gate
      if (s.carouselDropped) {
        const slide = carouselSlides[s.carouselIndex];
        t.to(
          slide.position,
          {
            y: slotHomeY[s.carouselIndex] - DROP,
            duration: 0.14,
            ease: "power3.in",
          },
          0.58,
        );
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => void tl.current?.kill(), []);

  // hover / keyboard-focus lift for tray slides
  useFrame((_, dt) => {
    const s = experienceStore.getState();
    deskSlides.forEach((d, i) => {
      if (flying.current[i] || !d.visible) return;
      const name = d.name;
      const sectionId = i === 5 ? "skills" : PRIMARY_SECTIONS[i].id;
      const active = runtime.hovered === name || s.selectedSlide === sectionId;
      lifts.current[i] = damp(lifts.current[i], active ? 1 : 0, 14, dt);
      const home = homes[i];
      d.position.set(
        home.pos.x,
        home.pos.y + lifts.current[i] * 0.012,
        home.pos.z + lifts.current[i] * 0.004,
      );
    });
  });

  return null;
}
