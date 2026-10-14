"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { experienceStore, isLit, useExperience } from "@/lib/experience-store";
import { PRIMARY_SECTIONS, SKILLS_SECTION, sectionDef, type SectionDef } from "@/lib/sections";
import { getProject } from "@/lib/project-data";

/**
 * Keyboard / screen-reader / touch twin of the physical controls.
 * Desktop: invisible until it receives keyboard focus (the projector is the UI).
 * Small screens: a slim line of text links under the scene.
 */
export function AccessibleControls() {
  const s = useExperience(
    useShallow((st) => ({
      state: st.projectorState,
      section: st.activeSection,
      project: st.activeProject,
      inserted: st.insertedSlide,
      sound: st.soundEnabled,
    })),
  );
  const lit = isLit(s.state);
  const store = () => experienceStore.getState();

  const go = (e: React.MouseEvent, def: SectionDef) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    store().selectSection(def.id);
  };

  return (
    <nav className="kbd-controls" aria-label="Projector controls">
      <ul>
        {[...PRIMARY_SECTIONS, SKILLS_SECTION].map((def) => (
          <li key={def.id}>
            <Link
              href={def.path}
              aria-current={s.section === def.id && s.inserted ? "page" : undefined}
              onClick={(e) => go(e, def)}
              onFocus={() => store().setSelectedSlide(def.id)}
              onBlur={() => store().setSelectedSlide(null)}
            >
              {def.label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="kbd-row">
        <button type="button" onClick={() => (store().press("previous"), store().stepSlide(-1))}>
          ← Prev
        </button>
        <button type="button" disabled={!lit} onClick={() => (store().press("eject"), store().eject())}>
          Eject
        </button>
        <button type="button" onClick={() => (store().press("next"), store().stepSlide(1))}>
          Next →
        </button>
        <button type="button" aria-pressed={lit} onClick={() => (store().press("power"), store().togglePower())}>
          {lit ? "Power off" : "Power on"}
        </button>
        <button type="button" aria-pressed={!s.sound} onClick={() => store().setSoundEnabled(!s.sound)}>
          {s.sound ? "Mute" : "Unmute"}
        </button>
        <button type="button" aria-controls="resume-drawer" onClick={() => store().setDrawerOpen(!store().drawerOpen)}>
          Résumé &amp; links
        </button>
      </div>
      <Announcer />
    </nav>
  );
}

/** Screen-reader announcement of what is being projected. */
function Announcer() {
  const section = useExperience((s) => s.activeSection);
  const project = useExperience((s) => s.activeProject);
  const state = useExperience((s) => s.projectorState);
  const inserted = useExperience((s) => s.insertedSlide);
  const [msg, setMsg] = useState("");
  useEffect(() => {
    if (state === "off") setMsg("Projector off.");
    else if (!inserted) setMsg("Slide ejected. Choose a slide.");
    else if (state === "ready" || state === "project-open") {
      setMsg(`Projecting ${project ? getProject(project)?.title : sectionDef(section).label}.`);
    }
  }, [section, project, state, inserted]);
  return (
    <p className="sr-only" role="status" aria-live="polite">
      {msg}
    </p>
  );
}
