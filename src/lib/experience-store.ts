import { createStore, useStore } from "zustand";
import { projects, projectIndex, PROJECT_VIEWS, type ProjectView } from "./project-data";
import { experienceFrames, experienceIndex } from "./experience-data";
import {
  buildUrl,
  DEFAULT_VIEW,
  PRIMARY_SECTIONS,
  sameSlide,
  trayIndex,
  type NavTarget,
  type SectionId,
} from "./sections";
import { valueForView, viewForValue, snapValue } from "./focus";
import type { PerformanceTier } from "./performance-tier";
import type { LayoutMode } from "./scene-config";

export type ProjectorState =
  | "off"
  | "warming"
  | "ready"
  | "changing-slide"
  | "focusing"
  | "project-open"
  | "cooling";

export type CarouselSet = "sections" | "projects";

/** Camera: stepped back for the welcome, framed on the desk, or free to orbit. */
export type ViewMode = "intro" | "framed" | "explore";

/** Phase durations (ms). The 3D choreography is tuned to fit inside these. */
export const TIMINGS = {
  change: 780,
  focus: 640,
  warm: 1750,
  warmQuick: 380,
  cool: 1100,
  eject: 520,
  reducedChange: 120,
  reducedFocus: 160,
  reducedWarm: 200,
} as const;

export type UrlRequest = { seq: number; url: string; mode: "push" | "replace" };

export type Transition = {
  id: number;
  kind: "power-on" | "power-off" | "slide" | "eject";
  quick: boolean;
};

export type ExperienceState = {
  projectorState: ProjectorState;
  activeSection: SectionId;
  activeProject: string | null;
  activeProjectView: ProjectView;
  activeExperience: number;
  /** Slide currently highlighted (pointer hover or keyboard focus on its HTML twin). */
  selectedSlide: SectionId | null;
  /** Tray slide sitting in the projector gate, or null after an eject. */
  insertedSlide: SectionId | null;
  carouselSet: CarouselSet;
  carouselIndex: number;
  /** True when the carousel slot at the gate has dropped in (a project slide is projected). */
  carouselDropped: boolean;
  /** Focus wheel position 0..1 (four detents). Drives the projection blur. */
  focusValue: number;
  /** Where the wheel is heading when a view is chosen by tabs / dial / URL. */
  focusTarget: number;
  focusDragging: boolean;
  screenRaised: boolean;
  drawerOpen: boolean;
  lampOn: boolean;
  soundEnabled: boolean;
  reducedMotion: boolean;
  performanceTier: PerformanceTier;
  layoutMode: LayoutMode;
  viewMode: ViewMode;
  /** True once the WebGL scene has loaded. */
  sceneReady: boolean;
  interactionLocked: boolean;
  transition: Transition | null;
  urlRequest: UrlRequest | null;
  /** Last physical control pressed (HTML twin or 3D), so the 3D part can animate. */
  pressed: { control: PressableControl; seq: number } | null;
  hintsSeen: string[];
};

export type PressableControl = "next" | "previous" | "eject" | "power" | "drawer" | "dial";

export type ExperienceActions = {
  powerOn: (opts?: { quick?: boolean }) => void;
  powerOff: () => void;
  togglePower: () => void;
  /** Navigate to a target. `source: "route"` means the URL already changed (back/forward, deep link). */
  navigate: (target: Partial<NavTarget> & { section: SectionId }, source?: "ui" | "route") => void;
  selectSection: (id: SectionId) => void;
  selectProject: (slug: string) => void;
  stepSlide: (dir: 1 | -1) => void;
  eject: () => void;
  setView: (view: ProjectView, source?: "ui" | "wheel" | "route") => void;
  setFocusValue: (value: number) => void;
  setFocusDragging: (dragging: boolean) => void;
  press: (control: PressableControl) => void;
  commitFocus: () => void;
  setExperience: (index: number, source?: "ui" | "route") => void;
  setSelectedSlide: (id: SectionId | null) => void;
  toggleScreen: () => void;
  setDrawerOpen: (open: boolean) => void;
  toggleLamp: () => void;
  setSoundEnabled: (on: boolean) => void;
  setReducedMotion: (on: boolean) => void;
  setPerformanceTier: (tier: PerformanceTier) => void;
  setLayoutMode: (mode: LayoutMode) => void;
  setViewMode: (mode: ViewMode) => void;
  setSceneReady: (ready: boolean) => void;
  markHint: (id: string) => void;
  /** Hydrate from a route without animation (first paint). */
  hydrateRoute: (target: NavTarget) => void;
  dispose: () => void;
};

export type ExperienceStore = ExperienceState & ExperienceActions;

const storage = {
  get(key: string): string | null {
    try {
      return typeof window === "undefined" ? null : window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* private mode — preference simply isn't remembered */
    }
  },
};

export const STORAGE_KEYS = {
  visited: "projector:visited",
  sound: "projector:sound",
  hints: "projector:hints",
} as const;

export function hasVisitedBefore(): boolean {
  return storage.get(STORAGE_KEYS.visited) === "1";
}

export function initialState(): ExperienceState {
  const hints = storage.get(STORAGE_KEYS.hints);
  return {
    projectorState: "off",
    activeSection: "about",
    activeProject: null,
    activeProjectView: DEFAULT_VIEW,
    activeExperience: experienceFrames.length - 1,
    selectedSlide: null,
    insertedSlide: "about",
    carouselSet: "sections",
    carouselIndex: 0,
    carouselDropped: false,
    focusValue: 0,
    focusTarget: 0,
    focusDragging: false,
    screenRaised: false,
    drawerOpen: false,
    lampOn: false,
    soundEnabled: storage.get(STORAGE_KEYS.sound) !== "0",
    reducedMotion: false,
    performanceTier: "high",
    layoutMode: "split",
    viewMode: "framed",
    sceneReady: false,
    interactionLocked: false,
    transition: null,
    urlRequest: null,
    pressed: null,
    hintsSeen: hints ? hints.split(",").filter(Boolean) : [],
  };
}

/** Mechanical layout implied by a logical target. */
function mechanicsFor(target: NavTarget, prev: Pick<ExperienceState, "carouselIndex" | "carouselSet">) {
  if (target.section === "work") {
    const idx = target.project ? projectIndex(target.project) : prev.carouselSet === "projects" ? prev.carouselIndex : 0;
    return { carouselSet: "projects" as const, carouselIndex: Math.max(0, idx), carouselDropped: !!target.project };
  }
  const idx = trayIndex(target.section);
  return {
    carouselSet: "sections" as const,
    carouselIndex: idx === -1 ? (prev.carouselSet === "sections" ? prev.carouselIndex : 0) : idx,
    carouselDropped: false,
  };
}

export function createExperienceStore(overrides: Partial<ExperienceState> = {}) {
  let timers: ReturnType<typeof setTimeout>[] = [];
  let transitionSeq = 0;
  let urlSeq = 0;
  let pressSeq = 0;

  const clearTimers = () => {
    timers.forEach(clearTimeout);
    timers = [];
  };
  const later = (ms: number, fn: () => void) => {
    timers.push(setTimeout(fn, ms));
  };

  return createStore<ExperienceStore>()((set, get) => {
    const currentTarget = (): NavTarget => {
      const s = get();
      return {
        section: s.activeSection,
        project: s.activeProject,
        view: s.activeProjectView,
        frame: s.activeSection === "experience" ? experienceFrames[s.activeExperience].slug : null,
      };
    };

    const requestUrl = (url: string, mode: UrlRequest["mode"]) => {
      set({ urlRequest: { seq: ++urlSeq, url, mode } });
    };

    const settledState = (): ProjectorState => (get().activeProject ? "project-open" : "ready");

    /** Run the focusing phase, then settle. */
    const focusThenSettle = (id: number) => {
      const { reducedMotion } = get();
      set({ projectorState: "focusing" });
      later(reducedMotion ? TIMINGS.reducedFocus : TIMINGS.focus, () => {
        if (get().transition?.id !== id) return;
        set({ projectorState: settledState(), transition: null, interactionLocked: false });
      });
    };

    const applyTarget = (target: NavTarget) => {
      const s = get();
      set({
        activeSection: target.section,
        activeProject: target.project,
        activeProjectView: target.project ? target.view : DEFAULT_VIEW,
        focusValue: target.project ? valueForView(target.view) : 0,
        focusTarget: target.project ? valueForView(target.view) : 0,
        activeExperience: target.section === "experience" ? experienceIndex(target.frame) : s.activeExperience,
        insertedSlide: target.section,
        screenRaised: false,
        ...mechanicsFor(target, s),
      });
    };

    return {
      ...initialState(),
      ...overrides,

      hydrateRoute(target) {
        applyTarget(target);
      },

      powerOn(opts = {}) {
        const s = get();
        if (s.projectorState !== "off" && s.projectorState !== "cooling") return;
        clearTimers();
        const quick = !!opts.quick;
        const id = ++transitionSeq;
        set({
          projectorState: "warming",
          interactionLocked: true,
          transition: { id, kind: "power-on", quick },
          insertedSlide: s.insertedSlide ?? s.activeSection,
        });
        storage.set(STORAGE_KEYS.visited, "1");
        const warm = s.reducedMotion ? TIMINGS.reducedWarm : quick ? TIMINGS.warmQuick : TIMINGS.warm;
        later(warm, () => {
          if (get().transition?.id !== id) return;
          focusThenSettle(id);
        });
      },

      powerOff() {
        const s = get();
        if (s.projectorState === "off" || s.projectorState === "cooling") return;
        clearTimers();
        const id = ++transitionSeq;
        set({
          projectorState: "cooling",
          interactionLocked: true,
          transition: { id, kind: "power-off", quick: false },
          drawerOpen: false,
          focusDragging: false,
        });
        later(s.reducedMotion ? TIMINGS.reducedWarm : TIMINGS.cool, () => {
          if (get().transition?.id !== id) return;
          set({ projectorState: "off", transition: null, interactionLocked: false });
        });
      },

      togglePower() {
        const st = get().projectorState;
        if (st === "off" || st === "cooling") get().powerOn({ quick: hasVisitedBefore() });
        else get().powerOff();
      },

      navigate(partial, source = "ui") {
        const s = get();
        const target: NavTarget = {
          section: partial.section,
          project: partial.section === "work" ? partial.project ?? null : null,
          view: partial.view ?? DEFAULT_VIEW,
          frame: partial.section === "experience" ? partial.frame ?? null : null,
        };
        const current = currentTarget();
        const url = buildUrl(target);

        // Same slide already in the gate → only a layer / frame change, no slide swap.
        if (sameSlide(target, current) && s.insertedSlide && s.projectorState !== "off") {
          if (target.project && target.view !== s.activeProjectView) get().setView(target.view, source === "route" ? "route" : "ui");
          if (target.section === "experience" && target.frame) get().setExperience(experienceIndex(target.frame), source);
          if (s.screenRaised) set({ screenRaised: false });
          return;
        }

        if (source === "ui") requestUrl(url, "push");

        // Projector off: load the slide, then warm the lamp up.
        if (s.projectorState === "off" || s.projectorState === "cooling") {
          applyTarget(target);
          get().powerOn({ quick: true });
          return;
        }
        // Still warming: swap which slide will be shown when the lamp is ready.
        if (s.projectorState === "warming") {
          applyTarget(target);
          return;
        }

        clearTimers();
        const id = ++transitionSeq;
        set({ projectorState: "changing-slide", transition: { id, kind: "slide", quick: false }, drawerOpen: false });
        applyTarget(target);
        later(s.reducedMotion ? TIMINGS.reducedChange : TIMINGS.change, () => {
          if (get().transition?.id !== id) return;
          focusThenSettle(id);
        });
      },

      selectSection(id) {
        get().navigate({ section: id });
      },

      selectProject(slug) {
        get().navigate({ section: "work", project: slug, view: DEFAULT_VIEW });
      },

      stepSlide(dir) {
        const s = get();
        if (s.activeSection === "work" && s.activeProject) {
          const i = projectIndex(s.activeProject);
          const next = projects[(i + dir + projects.length) % projects.length];
          get().selectProject(next.slug);
          return;
        }
        if (s.activeSection === "experience") {
          const n = s.activeExperience + dir;
          if (n >= 0 && n < experienceFrames.length) {
            get().setExperience(n);
            return;
          }
        }
        const i = trayIndex(s.activeSection);
        const base = i === -1 ? 0 : i;
        const next = PRIMARY_SECTIONS[(base + dir + PRIMARY_SECTIONS.length) % PRIMARY_SECTIONS.length];
        get().selectSection(next.id);
      },

      eject() {
        const s = get();
        if (s.projectorState === "off" || s.projectorState === "cooling" || s.projectorState === "warming") return;
        if (s.activeProject) {
          get().navigate({ section: "work" });
          return;
        }
        if (!s.insertedSlide) return;
        clearTimers();
        const id = ++transitionSeq;
        set({
          projectorState: "changing-slide",
          transition: { id, kind: "eject", quick: false },
          insertedSlide: null,
          carouselDropped: false,
          drawerOpen: false,
        });
        later(s.reducedMotion ? TIMINGS.reducedChange : TIMINGS.eject, () => {
          if (get().transition?.id !== id) return;
          set({ projectorState: "ready", transition: null });
        });
      },

      setView(view, source = "ui") {
        const s = get();
        if (!s.activeProject) return;
        const changed = view !== s.activeProjectView;
        set({
          activeProjectView: view,
          // when the wheel chose the view it is already there; otherwise the
          // wheel turns towards it (FocusDriver tweens focusValue → focusTarget)
          focusTarget: source === "wheel" ? s.focusValue : valueForView(view),
        });
        if (changed && source !== "route") requestUrl(buildUrl({ section: "work", project: s.activeProject, view }), "replace");
      },

      setFocusValue(value) {
        set({ focusValue: Math.min(1, Math.max(0, value)) });
      },

      setFocusDragging(dragging) {
        set({ focusDragging: dragging });
      },

      commitFocus() {
        const s = get();
        set({ focusDragging: false });
        if (s.activeProject) {
          const view = viewForValue(s.focusValue);
          const snapped = snapValue(s.focusValue);
          set({ focusValue: snapped, focusTarget: snapped });
          get().setView(view, "wheel");
        } else {
          // outside a case study the wheel only focuses — it springs back to sharp
          set({ focusTarget: 0 });
        }
      },

      setExperience(index, source = "ui") {
        const i = Math.min(experienceFrames.length - 1, Math.max(0, index));
        const s = get();
        if (s.activeSection !== "experience") {
          get().navigate({ section: "experience", frame: experienceFrames[i].slug }, source);
          return;
        }
        if (i === s.activeExperience) return;
        set({ activeExperience: i });
        if (source === "ui") requestUrl(buildUrl({ section: "experience", frame: experienceFrames[i].slug }), "replace");
      },

      press(control) {
        set({ pressed: { control, seq: ++pressSeq } });
      },

      setSelectedSlide(id) {
        set({ selectedSlide: id });
      },

      toggleScreen() {
        set({ screenRaised: !get().screenRaised });
      },

      setDrawerOpen(open) {
        set({ drawerOpen: open });
      },

      toggleLamp() {
        set({ lampOn: !get().lampOn });
      },

      setSoundEnabled(on) {
        storage.set(STORAGE_KEYS.sound, on ? "1" : "0");
        set({ soundEnabled: on });
      },

      setReducedMotion(on) {
        set({ reducedMotion: on });
      },

      setPerformanceTier(tier) {
        set({ performanceTier: tier });
      },

      setLayoutMode(mode) {
        if (get().layoutMode !== mode) set({ layoutMode: mode });
      },

      setViewMode(mode) {
        if (get().viewMode === mode) return;
        set({ viewMode: mode, drawerOpen: false });
      },

      setSceneReady(ready) {
        set({ sceneReady: ready });
      },

      markHint(id) {
        const seen = get().hintsSeen;
        if (seen.includes(id)) return;
        const next = [...seen, id];
        storage.set(STORAGE_KEYS.hints, next.join(","));
        set({ hintsSeen: next });
      },

      dispose() {
        clearTimers();
      },
    };
  });
}

export const experienceStore = createExperienceStore();

export function useExperience<T>(selector: (s: ExperienceStore) => T): T {
  return useStore(experienceStore, selector);
}

export const PROJECT_VIEW_COUNT = PROJECT_VIEWS.length;

/** True while the projector is producing light. */
export function isLit(state: ProjectorState): boolean {
  return state !== "off" && state !== "cooling";
}
