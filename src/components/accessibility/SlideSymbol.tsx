import type { SlideSymbol as SymbolName } from "@/lib/sections";

/** 24×24 icon paths shared by the HTML controls and the canvas slide textures. */
export const SYMBOL_PATHS: Record<SymbolName, { d: string; mode: "fill" | "stroke" }> = {
  profile: { d: "M12 12.2a4.1 4.1 0 1 0 0-8.2 4.1 4.1 0 0 0 0 8.2ZM4.5 21a7.5 7.5 0 0 1 15 0Z", mode: "fill" },
  briefcase: {
    d: "M9 7V5.2C9 4.5 9.5 4 10.2 4h3.6c.7 0 1.2.5 1.2 1.2V7M3.8 7h16.4v12H3.8zM3.8 12h16.4",
    mode: "stroke",
  },
  road: { d: "M9.5 3 4 21M14.5 3 20 21M12 4v2.5M12 9.5v3M12 15.5v4", mode: "stroke" },
  note: { d: "M8.8 17.6a2.6 2.6 0 1 1-1.6-2.4V5.4L18.4 3v12.4a2.6 2.6 0 1 1-1.6-2.4V7.4l-8 1.6Z", mode: "fill" },
  envelope: { d: "M3.5 6h17v12h-17zM3.8 6.4 12 12.6l8.2-6.2", mode: "stroke" },
  blueprint: { d: "M12 3.5 5 20.5M12 3.5l7 17M7.6 14h8.8M12 3.5v-1M4 20.5h16", mode: "stroke" },
};

export function SlideSymbol({ name, size = 20, className }: { name: SymbolName; size?: number; className?: string }) {
  const { d, mode } = SYMBOL_PATHS[name];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={className}
      fill={mode === "fill" ? "currentColor" : "none"}
      stroke={mode === "stroke" ? "currentColor" : "none"}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}

/** Small mechanical icons for transport controls. */
export function ControlIcon({ name, size = 16 }: { name: "prev" | "next" | "eject" | "power" | "sound" | "mute" | "drawer" | "screen" | "lamp" | "play" | "pause" | "orbit" | "door"; size?: number }) {
  const paths: Record<typeof name, string> = {
    prev: "M15 6 9 12l6 6",
    next: "M9 6l6 6-6 6",
    eject: "M5 14h14L12 6zM5 18h14",
    power: "M12 3v8M7.1 6.6a7 7 0 1 0 9.8 0",
    sound: "M4 9.5h3.5L12 6v12l-4.5-3.5H4zM15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11",
    mute: "M4 9.5h3.5L12 6v12l-4.5-3.5H4zM16 9.5l5 5M21 9.5l-5 5",
    drawer: "M4 6h16v12H4zM4 12h16M10 9h4",
    screen: "M3 4h18M5 4v10h14V4M12 14v4M10 20h4",
    lamp: "M8 4h8l3 7H5zM12 11v7M8 20h8",
    play: "M8 5v14l11-7z",
    pause: "M8 5h3v14H8zM13 5h3v14h-3z",
    door: "M5 21h14M7 21V4h9v17M13 12h.01M16 6l3 1.5V21",
    orbit: "M12 9.8a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4ZM3 12c0-2.8 4-5 9-5s9 2.2 9 5-4 5-9 5-9-2.2-9-5Z",
  };
  const filled = name === "play" || name === "pause";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill={filled ? "currentColor" : "none"} stroke={filled ? "none" : "currentColor"} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name]} />
    </svg>
  );
}
