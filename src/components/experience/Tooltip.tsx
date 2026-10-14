"use client";

import { useEffect, useRef } from "react";
import { createStore, useStore } from "zustand";

type TipState = { text: string | null; x: number; y: number };

/** Hover tooltips for physical objects — appear only after a short delay. */
export const tooltipStore = createStore<TipState>()(() => ({ text: null, x: 0, y: 0 }));

let timer: ReturnType<typeof setTimeout> | null = null;
let pending: string | null = null;

export function showTip(text: string, x: number, y: number) {
  const cur = tooltipStore.getState();
  if (cur.text === text) {
    tooltipStore.setState({ x, y });
    return;
  }
  if (pending === text) {
    tooltipStore.setState({ x, y });
    return;
  }
  pending = text;
  if (timer) clearTimeout(timer);
  tooltipStore.setState({ text: null, x, y });
  timer = setTimeout(() => {
    tooltipStore.setState({ text: pending });
  }, 420);
}

export function hideTip() {
  pending = null;
  if (timer) clearTimeout(timer);
  timer = null;
  tooltipStore.setState({ text: null });
}

export function Tooltip() {
  const text = useStore(tooltipStore, (s) => s.text);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(
    () =>
      tooltipStore.subscribe((s) => {
        if (ref.current) ref.current.style.cssText = `left:${s.x}px;top:${s.y}px`;
      }),
    [],
  );
  return (
    <div ref={ref} className="tip" data-show={text ? "1" : "0"} aria-hidden="true">
      {text}
    </div>
  );
}
