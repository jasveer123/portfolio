"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { experienceStore, useExperience } from "@/lib/experience-store";
import { layoutModeFor, screenRectFor } from "@/lib/scene-config";
import { StaticPortfolioFallback } from "@/components/accessibility/StaticPortfolioFallback";
import { ScreenTitleCard } from "@/components/projection/ScreenTitleCard";
import { PersonalWall } from "@/components/personal/PersonalWall";

const ExperienceCanvas = dynamic(() => import("./ExperienceCanvas").then((m) => m.ExperienceCanvas), {
  ssr: false,
  loading: () => null,
});

/** Keep the projection rectangle (CSS variables) in sync with the camera framing. */
function useProjectionRect(stageRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const root = document.documentElement;
    const update = () => {
      experienceStore.getState().setLayoutMode(layoutModeFor(window.innerWidth, window.innerHeight));
      const { width, height } = el.getBoundingClientRect();
      if (!width || !height) return;
      const r = screenRectFor(width, height);
      root.style.setProperty("--sx", `${r.x.toFixed(1)}px`);
      root.style.setProperty("--sy", `${r.y.toFixed(1)}px`);
      root.style.setProperty("--sw", `${r.w.toFixed(1)}px`);
      root.style.setProperty("--sh", `${r.h.toFixed(1)}px`);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [stageRef]);
}

export function Stage() {
  const stageRef = useRef<HTMLDivElement>(null);
  const tier = useExperience((s) => s.performanceTier);
  const sceneReady = useExperience((s) => s.sceneReady);
  useProjectionRect(stageRef);

  return (
    <div ref={stageRef} className="stage" data-canvas={sceneReady ? "ready" : "loading"} data-tier={tier}>
      {tier === "static" ? (
        <>
          <StaticPortfolioFallback />
          <div className="screen-rect static-light" aria-hidden="true" />
        </>
      ) : (
        <>
          <Image className="stage-poster" src="/projector/poster.webp" alt="" fill priority sizes="100vw" />
          <div className="stage-canvas" aria-hidden="true">
            <ExperienceCanvas />
          </div>
        </>
      )}
      <ScreenTitleCard />
      <PersonalWall />
    </div>
  );
}
