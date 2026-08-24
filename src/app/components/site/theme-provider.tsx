"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type SceneTheme = "sage" | "lime" | "ink" | "clay" | "mist";

export type ThemeTokens = {
  id: SceneTheme;
  label: string;
  canvas: string;
  elevated: string;
  ink: string;
  muted: string;
  signal: string;
  chrome: string;
};

/**
 * Shared family: muted greens + warm clay + deep green-black.
 * Avoids loud red/black contrast that fights the rest of the site.
 */
export const THEMES: Record<SceneTheme, ThemeTokens> = {
  sage: {
    id: "sage",
    label: "Sage",
    canvas: "#E8EDE4",
    elevated: "#F3F6F0",
    ink: "#1A1F1C",
    muted: "#5A635C",
    signal: "#2F6F62",
    chrome: "#1A1F1C",
  },
  lime: {
    id: "lime",
    label: "Lime",
    canvas: "#D7E89A",
    elevated: "#E5F0B8",
    ink: "#1A1F1C",
    muted: "#4A5338",
    signal: "#1A1F1C",
    chrome: "#1A1F1C",
  },
  ink: {
    id: "ink",
    label: "Ink",
    canvas: "#1A1F1C",
    elevated: "#262C28",
    ink: "#F3F1EC",
    muted: "#A8B0A9",
    signal: "#D7E89A",
    chrome: "#F3F1EC",
  },
  clay: {
    id: "clay",
    label: "Clay",
    canvas: "#E8D5C4",
    elevated: "#F2E6DB",
    ink: "#1A1F1C",
    muted: "#6B584C",
    signal: "#2F6F62",
    chrome: "#1A1F1C",
  },
  mist: {
    id: "mist",
    label: "Mist",
    canvas: "#F6F5F2",
    elevated: "#FFFFFF",
    ink: "#1A1F1C",
    muted: "#5C6570",
    signal: "#2F6F62",
    chrome: "#1A1F1C",
  },
};

type ThemeContextValue = {
  theme: SceneTheme;
  tokens: ThemeTokens;
  setTheme: (theme: SceneTheme) => void;
  cycleTheme: () => void;
  locked: boolean;
  setLocked: (locked: boolean) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const ORDER: SceneTheme[] = ["sage", "lime", "ink", "clay", "mist"];

function applyTokens(tokens: ThemeTokens) {
  const root = document.documentElement;
  root.style.setProperty("--canvas", tokens.canvas);
  root.style.setProperty("--canvas-elevated", tokens.elevated);
  root.style.setProperty("--ink", tokens.ink);
  root.style.setProperty("--ink-muted", tokens.muted);
  root.style.setProperty("--signal", tokens.signal);
  root.dataset.scene = tokens.id;
  // Inner scene color only — outer frame/padding stays white via providers
  document.body.style.backgroundColor = tokens.canvas;
  document.body.style.color = tokens.ink;
  document.documentElement.style.backgroundColor = "#ffffff";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<SceneTheme>("sage");
  const [locked, setLocked] = useState(false);

  const setTheme = useCallback(
    (next: SceneTheme) => {
      setThemeState(next);
      applyTokens(THEMES[next]);
    },
    []
  );

  const cycleTheme = useCallback(() => {
    setThemeState((current) => {
      const idx = ORDER.indexOf(current);
      const next = ORDER[(idx + 1) % ORDER.length];
      applyTokens(THEMES[next]);
      return next;
    });
  }, []);

  useEffect(() => {
    applyTokens(THEMES.sage);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      tokens: THEMES[theme],
      setTheme,
      cycleTheme,
      locked,
      setLocked,
    }),
    [theme, setTheme, cycleTheme, locked]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useSceneTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useSceneTheme must be used within ThemeProvider");
  return ctx;
}

export function useSectionTheme(sectionTheme: SceneTheme, sectionId: string) {
  const { setTheme, locked } = useSceneTheme();

  useEffect(() => {
    const el = document.getElementById(sectionId);
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !locked) {
          setTheme(sectionTheme);
        }
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0.01 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [sectionId, sectionTheme, setTheme, locked]);
}
