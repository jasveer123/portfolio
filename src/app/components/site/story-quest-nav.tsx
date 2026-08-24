"use client";

import { useEffect, useState } from "react";
import { storyChapters } from "@/config";
import { cn } from "@/lib/utils";

export function StoryQuestNav() {
  const [active, setActive] = useState("top");

  useEffect(() => {
    const nodes = storyChapters
      .map((c) => document.getElementById(c.id))
      .filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActive(visible.target.id);
      },
      { rootMargin: "-35% 0px -45% 0px", threshold: [0.15, 0.4, 0.7] }
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Story chapters"
      className="fixed right-3 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-2 md:flex"
    >
      {storyChapters.map((chapter) => (
        <a
          key={chapter.id}
          href={`#${chapter.id}`}
          title={chapter.label}
          className={cn(
            "group flex items-center justify-end gap-2",
            active === chapter.id ? "text-ink" : "text-ink-muted"
          )}
        >
          <span className="translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 text-[11px] font-medium">
            {chapter.label}
          </span>
          <span
            className={cn(
              "grid h-8 w-8 place-items-center rounded-full border text-[10px] font-mono transition-all",
              active === chapter.id
                ? "border-ink bg-ink text-canvas scale-110"
                : "border-ink/20 bg-canvas/80 hover:border-ink/40"
            )}
          >
            {chapter.cue}
          </span>
        </a>
      ))}
    </nav>
  );
}
