"use client";

import { Suspense, useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { experienceStore, isLit } from "@/lib/experience-store";
import { parseRoute } from "@/lib/sections";
import { detectTier } from "@/lib/performance-tier";
import { audio } from "@/lib/audio-manager";
import { Stage } from "./Stage";
import { RouteSync } from "./RouteSync";
import { AudioController } from "./AudioController";
import { FocusDriver } from "./FocusDriver";
import { Tooltip } from "./Tooltip";
import { AccessibleControls } from "@/components/accessibility/AccessibleControls";
import { GlobalActions } from "@/components/accessibility/GlobalActions";
import { ReducedMotionExperience } from "@/components/accessibility/ReducedMotionExperience";
import { DrawerOverlay } from "@/components/projection/DrawerOverlay";
import { ExploreBar, WelcomeNote } from "@/components/projection/WelcomeNote";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Mirror the state machine onto <html> data attributes so CSS can react. */
function useDocumentState() {
  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      const s = experienceStore.getState();
      root.dataset.projector = s.projectorState;
      root.dataset.inserted = s.insertedSlide ? "slide" : "none";
      root.dataset.screen = s.screenRaised ? "raised" : "down";
      root.dataset.section = s.activeSection;
      root.dataset.layout = s.layoutMode;
      root.dataset.quick = s.transition?.quick ? "1" : "0";
      root.dataset.reducedMotion = s.reducedMotion ? "1" : "0";
      root.dataset.view = s.viewMode;
    };
    apply();
    return experienceStore.subscribe(apply);
  }, []);
}

export function ProjectorExperience({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const booted = useRef(false);
  const mainRef = useRef<HTMLElement>(null);

  // Hydrate the store from the URL and decide how the projector boots —
  // before the first paint so nothing flashes.
  useIsoLayoutEffect(() => {
    if (booted.current) return;
    booted.current = true;
    const store = experienceStore.getState();
    store.hydrateRoute(parseRoute(window.location.pathname, window.location.search));
    const tier = detectTier();
    store.setPerformanceTier(tier);
    if (document.documentElement.dataset.view === "intro") store.setViewMode("intro");
    const boot = document.documentElement.dataset.boot;
    if (tier === "static" || boot === "auto") store.powerOn({ quick: true });
  }, []);

  useDocumentState();

  // Audio can only start inside a user gesture.
  useEffect(() => {
    const unlock = () => {
      audio.unlock();
      const s = experienceStore.getState();
      audio.setEnabled(s.soundEnabled);
      if (isLit(s.projectorState)) audio.startProjector(300);
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  // Keep the projected content scrolled to the top on slide changes.
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  const skipIntro = () => {
    const s = experienceStore.getState();
    if (s.projectorState === "off" || s.projectorState === "cooling") s.powerOn({ quick: true });
    if (!s.insertedSlide) s.selectSection(s.activeSection);
    if (s.screenRaised) s.toggleScreen();
    // content becomes visible once the lamp has warmed up
    window.setTimeout(() => mainRef.current?.focus(), 450);
  };

  return (
    <div className="experience">
      <a href="#content" className="skip-link" onClick={skipIntro}>
        Skip to content
      </a>
      <ReducedMotionExperience />
      <Stage />
      <GlobalActions />
      <AccessibleControls />
      <main id="content" ref={mainRef} className="projected" tabIndex={-1}>
        {children}
      </main>
      <DrawerOverlay />
      <WelcomeNote />
      <ExploreBar />
      <Tooltip />
      <Suspense fallback={null}>
        <RouteSync />
      </Suspense>
      <AudioController />
      <FocusDriver />
    </div>
  );
}
