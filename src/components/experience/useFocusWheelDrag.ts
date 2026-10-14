"use client";

import { useEffect, useRef } from "react";
import { experienceStore } from "@/lib/experience-store";
import { dragFocus } from "@/lib/focus";

/**
 * Pointer / touch drag on the focus wheel. The wheel follows the hand
 * directly (with slight detent resistance) and snaps to the nearest view
 * on release. Upward or rightward drags turn it forward.
 */
export function useFocusWheelDrag() {
  const state = useRef<{ x: number; y: number; id: number } | null>(null);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const s = state.current;
      if (!s || e.pointerId !== s.id) return;
      const dx = e.clientX - s.x;
      const dy = e.clientY - s.y;
      s.x = e.clientX;
      s.y = e.clientY;
      const store = experienceStore.getState();
      store.setFocusValue(dragFocus(store.focusValue, (dx - dy) / 260));
    };
    const up = (e: PointerEvent) => {
      const s = state.current;
      if (!s || e.pointerId !== s.id) return;
      state.current = null;
      document.body.style.cursor = "";
      const store = experienceStore.getState();
      store.commitFocus();
      store.markHint("focus");
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, []);

  return {
    start(e: PointerEvent) {
      const store = experienceStore.getState();
      if (store.projectorState === "off" || store.projectorState === "cooling") return;
      state.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
      document.body.style.cursor = "grabbing";
      store.setFocusDragging(true);
    },
  };
}
