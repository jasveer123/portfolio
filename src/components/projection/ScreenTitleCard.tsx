"use client";

import { useExperience } from "@/lib/experience-store";
import { sectionDef } from "@/lib/sections";
import { getProject } from "@/lib/project-data";
import { experienceFrames } from "@/lib/experience-data";

/** Compact projection used on the stacked (mobile / tablet) stage. */
export function ScreenTitleCard() {
  const section = useExperience((s) => s.activeSection);
  const project = useExperience((s) => s.activeProject);
  const frame = useExperience((s) => s.activeExperience);
  const def = sectionDef(section);
  const p = project ? getProject(project) : null;
  const title = p ? p.title : section === "about" ? "Jasveer Singh" : def.label;
  const sub = p
    ? `${p.category} · ${p.year}`
    : section === "experience"
      ? `${experienceFrames[frame].company} · ${experienceFrames[frame].period}`
      : section === "about"
        ? "Software Engineer"
        : def.hint;
  return (
    <div className="screen-rect title-card" aria-hidden="true">
      <p className="kicker">{p ? "Case study" : `Slide ${def.number}`}</p>
      <h2>{title}</h2>
      <p>{sub}</p>
    </div>
  );
}
