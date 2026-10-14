import { getProject, isProjectView, type ProjectView } from "./project-data";
import { experienceFrames } from "./experience-data";

export type SectionId = "about" | "work" | "experience" | "play" | "contact" | "skills";

export type SlideSymbol = "profile" | "briefcase" | "road" | "note" | "envelope" | "blueprint";

export type SectionDef = {
  id: SectionId;
  label: string;
  number: string;
  path: string;
  symbol: SlideSymbol;
  hint: string;
};

/** The five primary slides, in tray / carousel order. */
export const PRIMARY_SECTIONS: SectionDef[] = [
  { id: "about", label: "About", number: "01", path: "/", symbol: "profile", hint: "Who I am" },
  { id: "work", label: "Work", number: "02", path: "/work", symbol: "briefcase", hint: "Five case studies" },
  { id: "experience", label: "Experience", number: "03", path: "/experience", symbol: "road", hint: "The timeline" },
  { id: "play", label: "Play", number: "04", path: "/play", symbol: "note", hint: "Music & photographs" },
  { id: "contact", label: "Contact", number: "05", path: "/contact", symbol: "envelope", hint: "Say hello" },
];

/** Secondary "loose" slide lying on the desk. */
export const SKILLS_SECTION: SectionDef = {
  id: "skills",
  label: "Skills",
  number: "B1",
  path: "/skills",
  symbol: "blueprint",
  hint: "Technical blueprint",
};

export const ALL_SECTIONS = [...PRIMARY_SECTIONS, SKILLS_SECTION];

export function sectionDef(id: SectionId): SectionDef {
  return ALL_SECTIONS.find((s) => s.id === id)!;
}

/** Index in the slide tray / carousel (skills sits outside the carousel → -1). */
export function trayIndex(id: SectionId): number {
  return PRIMARY_SECTIONS.findIndex((s) => s.id === id);
}

export type NavTarget = {
  section: SectionId;
  project: string | null;
  view: ProjectView;
  frame: string | null;
};

export const DEFAULT_VIEW: ProjectView = "product";

export function parseRoute(pathname: string, search: URLSearchParams | string = ""): NavTarget {
  const params = typeof search === "string" ? new URLSearchParams(search) : search;
  const parts = pathname.replace(/\/+$/, "").split("/").filter(Boolean);
  const viewParam = params.get("view");
  const view = isProjectView(viewParam) ? viewParam : DEFAULT_VIEW;
  const base: NavTarget = { section: "about", project: null, view: DEFAULT_VIEW, frame: null };
  switch (parts[0]) {
    case undefined:
      return base;
    case "work":
      if (parts[1] && getProject(parts[1])) return { ...base, section: "work", project: parts[1], view };
      return { ...base, section: "work" };
    case "experience": {
      const frame = params.get("frame");
      return { ...base, section: "experience", frame: experienceFrames.some((f) => f.slug === frame) ? frame : null };
    }
    case "play":
    case "contact":
    case "skills":
      return { ...base, section: parts[0] };
    default:
      return base;
  }
}

export function buildUrl(t: Pick<NavTarget, "section"> & Partial<NavTarget>): string {
  if (t.section === "work" && t.project) {
    const view = t.view && t.view !== DEFAULT_VIEW ? `?view=${t.view}` : "";
    return `/work/${t.project}${view}`;
  }
  if (t.section === "experience" && t.frame) return `/experience?frame=${t.frame}`;
  return sectionDef(t.section).path;
}

export function sameSlide(a: NavTarget, b: NavTarget): boolean {
  return a.section === b.section && a.project === b.project;
}
