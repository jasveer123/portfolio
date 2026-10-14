import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        ivory: "var(--ivory)",
        paper: "var(--paper)",
        olive: "var(--olive)",
        charcoal: "var(--charcoal)",
        ink: { DEFAULT: "var(--ink)", muted: "var(--ink-muted)" },
        walnut: "var(--walnut)",
        brass: "var(--brass)",
        terracotta: "var(--terracotta)",
        amber: "var(--amber)",
      },
    },
  },
  plugins: [],
} satisfies Config;
