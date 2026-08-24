"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

type CursorMode = "default" | "hover" | "grab" | "grabbing";

const INTERACTIVE =
  'a, button, [role="button"], input, textarea, select, summary, label, [data-cursor], .cursor-grab, .cursor-pointer';

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<CursorMode>("default");

  const rawX = useMotionValue(-100);
  const rawY = useMotionValue(-100);
  const x = useSpring(rawX, { stiffness: 500, damping: 35, mass: 0.35 });
  const y = useSpring(rawY, { stiffness: 500, damping: 35, mass: 0.35 });

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    const sync = () => setEnabled(fine.matches && !reduce.matches);
    sync();
    fine.addEventListener("change", sync);
    reduce.addEventListener("change", sync);
    return () => {
      fine.removeEventListener("change", sync);
      reduce.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    document.documentElement.classList.add("has-custom-cursor");

    const resolveMode = (target: EventTarget | null): CursorMode => {
      if (!(target instanceof Element)) return "default";
      if (target.closest(".cursor-grabbing") || document.body.style.cursor === "grabbing") {
        return "grabbing";
      }
      const el = target.closest(INTERACTIVE);
      if (!el) return "default";
      if (el.classList.contains("cursor-grab") || el.getAttribute("data-cursor") === "grab") {
        return "grab";
      }
      return "hover";
    };

    const onMove = (e: PointerEvent) => {
      rawX.set(e.clientX);
      rawY.set(e.clientY);
      setVisible(true);
      setMode(resolveMode(e.target));
    };

    const onDown = (e: PointerEvent) => {
      const next = resolveMode(e.target);
      setMode(next === "grab" || next === "hover" ? "grabbing" : next);
    };

    const onUp = (e: PointerEvent) => setMode(resolveMode(e.target));
    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
    };
  }, [enabled, rawX, rawY]);

  if (!enabled) return null;

  const hovering = mode === "hover" || mode === "grab" || mode === "grabbing";
  const grabbing = mode === "grabbing";

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 z-[9999] hidden lg:block ${
        visible ? "opacity-100" : "opacity-0"
      } transition-opacity duration-200`}
    >
      {/* Outer ring */}
      <motion.div
        className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full border border-ink mix-blend-difference"
        style={{ left: x, top: y }}
        animate={{
          width: grabbing ? 56 : hovering ? 48 : 28,
          height: grabbing ? 56 : hovering ? 48 : 28,
          opacity: visible ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 320, damping: 24 }}
      />
      {/* Inner dot */}
      <motion.div
        className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink mix-blend-difference"
        style={{ left: x, top: y }}
        animate={{
          width: grabbing ? 6 : hovering ? 8 : 6,
          height: grabbing ? 6 : hovering ? 8 : 6,
          scale: grabbing ? 0.6 : hovering ? 0.35 : 1,
          opacity: visible ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
      />
    </div>
  );
}
