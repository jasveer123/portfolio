import type * as THREE from "three";
import { experienceStore, isLit } from "@/lib/experience-store";
import { PRIMARY_SECTIONS } from "@/lib/sections";
import { projects } from "@/lib/project-data";
import { stepFocus, viewForValue } from "@/lib/focus";
import { PROJECT_VIEWS } from "@/lib/project-data";

export type Control =
  | { kind: "power" }
  | { kind: "slide"; index: number }
  | { kind: "skills" }
  | { kind: "carousel"; index: number }
  | { kind: "next" }
  | { kind: "previous" }
  | { kind: "eject" }
  | { kind: "focus" }
  | { kind: "dial" }
  | { kind: "drawer" }
  | { kind: "notebook" };

const NODE_CONTROLS: Record<string, Control> = {
  power_switch: { kind: "power" },
  next_slide_button: { kind: "next" },
  previous_slide_button: { kind: "previous" },
  eject_button: { kind: "eject" },
  carousel_lever: { kind: "eject" },
  // the lens barrel faces the viewer, so it is the main focus control;
  // the side wheel (hidden from the default camera) does the same
  focus_ring: { kind: "focus" },
  projection_lens: { kind: "focus" },
  focus_wheel: { kind: "focus" },
  focus_crank_handle: { kind: "focus" },
  Desk_Slide_01: { kind: "slide", index: 0 },
  Desk_Slide_02: { kind: "slide", index: 1 },
  Desk_Slide_03: { kind: "slide", index: 2 },
  Desk_Slide_04: { kind: "slide", index: 3 },
  Desk_Slide_05: { kind: "slide", index: 4 },
  Desk_Slide_Loose: { kind: "skills" },
  slide_01: { kind: "carousel", index: 0 },
  slide_02: { kind: "carousel", index: 1 },
  slide_03: { kind: "carousel", index: 2 },
  slide_04: { kind: "carousel", index: 3 },
  slide_05: { kind: "carousel", index: 4 },
  Slide_Holder_Drawer: { kind: "drawer" },
  Slide_Holder_Drawer_Knob: { kind: "drawer" },
  Navigation_Dial_Base: { kind: "dial" },
  Navigation_Dial_Brass: { kind: "dial" },
  Navigation_Dial_Knob: { kind: "dial" },
  Notebook: { kind: "notebook" },
};

/** Find the interactive control an intersected object belongs to. */
export function controlFor(object: THREE.Object3D | null): { control: Control; node: THREE.Object3D } | null {
  let o: THREE.Object3D | null = object;
  for (let i = 0; o && i < 8; i++, o = o.parent) {
    const name = o.name.replace(/__hit$/, "");
    const c = NODE_CONTROLS[name];
    if (c) return { control: c, node: o.name.endsWith("__hit") ? o.parent ?? o : o };
  }
  return null;
}

export function tooltipFor(c: Control): string {
  const s = experienceStore.getState();
  switch (c.kind) {
    case "power":
      return isLit(s.projectorState) ? "Switch off" : "Switch on";
    case "slide":
      return `${PRIMARY_SECTIONS[c.index].label} — choose a slide`;
    case "skills":
      return "Skills blueprint";
    case "carousel":
      return s.carouselSet === "projects" ? projects[c.index].title : `${PRIMARY_SECTIONS[c.index].label}`;
    case "next":
      return "Next slide";
    case "previous":
      return "Previous slide";
    case "eject":
      return "Eject slide";
    case "focus":
      return s.activeProject ? "Turn the lens · change layer" : "Turn the lens to focus";
    case "dial":
      return s.activeProject ? "Change view" : "View dial — open a project";
    case "drawer":
      return "Résumé & links";
    case "notebook":
      return "Write to me";
  }
}

export function cursorFor(c: Control): string {
  return c.kind === "focus" ? "grab" : "pointer";
}

/** Click / tap on a physical control. */
export function activate(c: Control) {
  const s = experienceStore.getState();
  switch (c.kind) {
    case "power":
      s.press("power");
      s.togglePower();
      break;
    case "slide":
      s.selectSection(PRIMARY_SECTIONS[c.index].id);
      s.markHint("slides");
      break;
    case "skills":
      s.selectSection("skills");
      s.markHint("slides");
      break;
    case "carousel":
      if (s.carouselSet === "projects") s.selectProject(projects[c.index].slug);
      else s.selectSection(PRIMARY_SECTIONS[c.index].id);
      s.markHint("slides");
      break;
    case "next":
      s.press("next");
      s.stepSlide(1);
      break;
    case "previous":
      s.press("previous");
      s.stepSlide(-1);
      break;
    case "eject":
      s.press("eject");
      s.eject();
      break;
    case "dial": {
      s.press("dial");
      if (!s.activeProject) return;
      const i = PROJECT_VIEWS.indexOf(viewForValue(s.focusTarget));
      s.setView(PROJECT_VIEWS[(i + 1) % PROJECT_VIEWS.length]);
      break;
    }
    case "drawer":
      s.press("drawer");
      s.setDrawerOpen(!s.drawerOpen);
      break;
    case "notebook":
      s.selectSection("contact");
      break;
    case "focus":
      break;
  }
}

/** Mouse wheel over the focus wheel or dial steps one view. */
export function wheelStep(c: Control, deltaY: number) {
  const s = experienceStore.getState();
  if ((c.kind === "focus" || c.kind === "dial") && s.activeProject) {
    const next = stepFocus(s.focusTarget, deltaY > 0 ? 1 : -1);
    s.setView(viewForValue(next));
    s.markHint("focus");
    return true;
  }
  return false;
}
