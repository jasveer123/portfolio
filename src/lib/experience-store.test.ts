import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createExperienceStore, TIMINGS } from "./experience-store";
import { valueForView } from "./focus";

const settle = () => vi.advanceTimersByTime(TIMINGS.warm + TIMINGS.change + TIMINGS.focus + TIMINGS.cool + 50);

describe("projector state machine", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });
  afterEach(() => vi.useRealTimers());

  it("powers on through warming → focusing → ready", () => {
    const store = createExperienceStore();
    expect(store.getState().projectorState).toBe("off");
    store.getState().powerOn();
    expect(store.getState().projectorState).toBe("warming");
    expect(store.getState().interactionLocked).toBe(true);
    vi.advanceTimersByTime(TIMINGS.warm);
    expect(store.getState().projectorState).toBe("focusing");
    vi.advanceTimersByTime(TIMINGS.focus);
    expect(store.getState().projectorState).toBe("ready");
    expect(store.getState().interactionLocked).toBe(false);
    expect(localStorage.getItem("projector:visited")).toBe("1");
  });

  it("quick power-on (returning visitor) is short", () => {
    const store = createExperienceStore();
    store.getState().powerOn({ quick: true });
    vi.advanceTimersByTime(TIMINGS.warmQuick + TIMINGS.focus);
    expect(store.getState().projectorState).toBe("ready");
  });

  it("powers off through cooling", () => {
    const store = createExperienceStore();
    store.getState().powerOn();
    settle();
    store.getState().powerOff();
    expect(store.getState().projectorState).toBe("cooling");
    vi.advanceTimersByTime(TIMINGS.cool);
    expect(store.getState().projectorState).toBe("off");
  });

  it("changes slides: ejects, rotates the carousel, inserts, focuses", () => {
    const store = createExperienceStore();
    store.getState().powerOn();
    settle();
    store.getState().selectSection("experience");
    const s = store.getState();
    expect(s.projectorState).toBe("changing-slide");
    expect(s.insertedSlide).toBe("experience");
    expect(s.carouselIndex).toBe(2);
    expect(s.urlRequest?.url).toBe("/experience");
    vi.advanceTimersByTime(TIMINGS.change);
    expect(store.getState().projectorState).toBe("focusing");
    vi.advanceTimersByTime(TIMINGS.focus);
    expect(store.getState().projectorState).toBe("ready");
  });

  it("lets a new selection interrupt a running change and still settles", () => {
    const store = createExperienceStore();
    store.getState().powerOn();
    settle();
    store.getState().selectSection("work");
    vi.advanceTimersByTime(200);
    store.getState().selectSection("contact");
    expect(store.getState().activeSection).toBe("contact");
    vi.advanceTimersByTime(TIMINGS.change + TIMINGS.focus);
    expect(store.getState().projectorState).toBe("ready");
    expect(store.getState().insertedSlide).toBe("contact");
  });

  it("selecting a slide while switched off loads it and warms up", () => {
    const store = createExperienceStore();
    store.getState().selectSection("play");
    expect(store.getState().activeSection).toBe("play");
    expect(store.getState().projectorState).toBe("warming");
  });

  it("opens projects on the carousel and drops the slide into the gate", () => {
    const store = createExperienceStore();
    store.getState().powerOn();
    settle();
    store.getState().selectProject("web3-gateway");
    const s = store.getState();
    expect(s.activeSection).toBe("work");
    expect(s.carouselSet).toBe("projects");
    expect(s.carouselIndex).toBe(2);
    expect(s.carouselDropped).toBe(true);
    expect(s.urlRequest?.url).toBe("/work/web3-gateway");
    settle();
    expect(store.getState().projectorState).toBe("project-open");
  });

  it("eject closes a case study back to the work index", () => {
    const store = createExperienceStore();
    store.getState().powerOn();
    settle();
    store.getState().selectProject("asi1");
    settle();
    store.getState().eject();
    expect(store.getState().activeProject).toBeNull();
    expect(store.getState().activeSection).toBe("work");
  });

  it("eject on a section leaves the gate empty until a slide is chosen", () => {
    const store = createExperienceStore();
    store.getState().powerOn();
    settle();
    store.getState().eject();
    expect(store.getState().insertedSlide).toBeNull();
    settle();
    expect(store.getState().projectorState).toBe("ready");
    store.getState().selectSection("about");
    expect(store.getState().insertedSlide).toBe("about");
    expect(store.getState().projectorState).toBe("changing-slide");
  });

  it("next / previous step through projects inside a case study", () => {
    const store = createExperienceStore();
    store.getState().powerOn();
    settle();
    store.getState().selectProject("projector-portfolio");
    settle();
    store.getState().stepSlide(1);
    expect(store.getState().activeProject).toBe("asi1");
    settle();
    store.getState().stepSlide(-1);
    expect(store.getState().activeProject).toBe("projector-portfolio");
  });

  it("view changes replace the URL and turn the focus wheel", () => {
    const store = createExperienceStore();
    store.getState().powerOn();
    settle();
    store.getState().selectProject("asi1");
    settle();
    store.getState().setView("architecture");
    expect(store.getState().activeProjectView).toBe("architecture");
    expect(store.getState().focusTarget).toBeCloseTo(valueForView("architecture"));
    expect(store.getState().urlRequest).toMatchObject({ url: "/work/asi1?view=architecture", mode: "replace" });
  });

  it("focus wheel drag snaps to the nearest view on release", () => {
    const store = createExperienceStore();
    store.getState().powerOn();
    settle();
    store.getState().selectProject("asi1");
    settle();
    store.getState().setFocusDragging(true);
    store.getState().setFocusValue(0.61);
    store.getState().commitFocus();
    expect(store.getState().activeProjectView).toBe("engineering");
    expect(store.getState().focusValue).toBeCloseTo(2 / 3);
  });

  it("the wheel springs back to sharp outside a case study", () => {
    const store = createExperienceStore();
    store.getState().powerOn();
    settle();
    store.getState().setFocusValue(0.4);
    store.getState().commitFocus();
    expect(store.getState().focusTarget).toBe(0);
    expect(store.getState().activeProjectView).toBe("product");
  });

  it("deep links hydrate without animation", () => {
    const store = createExperienceStore();
    store.getState().hydrateRoute({ section: "work", project: "globacap", view: "impact", frame: null });
    const s = store.getState();
    expect(s.activeProject).toBe("globacap");
    expect(s.activeProjectView).toBe("impact");
    expect(s.carouselIndex).toBe(3);
    expect(s.urlRequest).toBeNull();
  });

  it("reduced motion shortens every phase", () => {
    const store = createExperienceStore({ reducedMotion: true });
    store.getState().powerOn();
    vi.advanceTimersByTime(TIMINGS.reducedWarm + TIMINGS.reducedFocus);
    expect(store.getState().projectorState).toBe("ready");
    store.getState().selectSection("work");
    vi.advanceTimersByTime(TIMINGS.reducedChange + TIMINGS.reducedFocus);
    expect(store.getState().projectorState).toBe("ready");
  });

  it("remembers the sound preference", () => {
    const store = createExperienceStore();
    store.getState().setSoundEnabled(false);
    expect(localStorage.getItem("projector:sound")).toBe("0");
    expect(createExperienceStore().getState().soundEnabled).toBe(false);
  });

  it("experience frames update the URL in place", () => {
    const store = createExperienceStore();
    store.getState().powerOn();
    settle();
    store.getState().selectSection("experience");
    settle();
    store.getState().setExperience(0);
    expect(store.getState().urlRequest).toMatchObject({ url: "/experience?frame=celebal-technologies", mode: "replace" });
  });
});
