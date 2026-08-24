"use client";

import { ThemeProvider } from "./theme-provider";
import { ThemeSwatches } from "./theme-swatches";
import { CustomCursor } from "./custom-cursor";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {/* Outer padding always white; inner content recolors with theme */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-2 z-[60] hidden rounded-3xl shadow-[0_0_0_9999px_#ffffff] md:block"
      />
      <ThemeSwatches />
      <CustomCursor />
      {children}
    </ThemeProvider>
  );
}
