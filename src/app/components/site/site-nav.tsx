"use client";

import { useEffect, useState } from "react";
import { navigation, profile } from "@/config";
import { cn } from "@/lib/utils";
import { useSceneTheme } from "./theme-provider";

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const { tokens } = useSceneTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={cn(
          "mx-auto flex h-16 max-w-6xl items-center justify-between px-5 transition-all sm:px-10 lg:px-16",
          scrolled && "backdrop-blur-md"
        )}
      >
        <a href="#top" className="font-display text-lg font-semibold tracking-tight text-ink">
          {profile.name.split(" ")[0]}
        </a>

        <nav className="hidden items-center gap-6 md:flex">
          {navigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-ink-muted transition-colors hover:text-ink"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a
          href={profile.social.email}
          className="rounded-xl px-3.5 py-2 text-sm font-semibold transition-transform hover:-translate-y-0.5"
          style={{ background: tokens.ink, color: tokens.canvas }}
        >
          Let&apos;s chat
        </a>
      </div>
    </header>
  );
}
