"use client";

import { THEMES, useSceneTheme, type SceneTheme } from "./theme-provider";

const SWATCHES: SceneTheme[] = ["sage", "lime", "ink", "clay", "mist"];

export function ThemeSwatches() {
  const { theme, setTheme, setLocked } = useSceneTheme();

  return (
    <div className="pointer-events-none fixed right-4 top-20 z-[70] sm:right-8 sm:top-24">
      <div
        className="pointer-events-auto flex flex-col gap-1.5 rounded-2xl border border-black/10 bg-white/90 p-2 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.25)] backdrop-blur"
        title="Change section colors"
      >
        {SWATCHES.map((id) => (
          <button
            key={id}
            type="button"
            aria-label={`Set ${THEMES[id].label} theme`}
            onClick={() => {
              setLocked(true);
              setTheme(id);
              window.setTimeout(() => setLocked(false), 1200);
            }}
            className={`h-4 w-4 rounded-full border transition-transform hover:scale-110 ${
              theme === id ? "scale-125 border-black/70" : "border-black/20"
            }`}
            style={{ background: THEMES[id].canvas }}
          />
        ))}
      </div>
    </div>
  );
}
