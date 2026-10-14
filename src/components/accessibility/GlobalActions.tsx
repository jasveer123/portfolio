"use client";

import { experienceStore, isLit, useExperience } from "@/lib/experience-store";
import { ControlIcon } from "./SlideSymbol";

/** Small global switches in the top-right corner: sound, projector power, explore, step out, résumé drawer. */
export function GlobalActions() {
  const sound = useExperience((s) => s.soundEnabled);
  const lit = useExperience((s) => isLit(s.projectorState));
  const drawerOpen = useExperience((s) => s.drawerOpen);
  const view = useExperience((s) => s.viewMode);
  const store = () => experienceStore.getState();

  if (view === "intro") return null;

  return (
    <div className="global-actions" role="group" aria-label="Global controls">
      <button
        type="button"
        className="ga-btn"
        aria-pressed={!sound}
        aria-label={sound ? "Mute sound" : "Turn sound on"}
        data-tip={sound ? "Sound on" : "Sound off"}
        onClick={() => store().setSoundEnabled(!sound)}
      >
        <ControlIcon name={sound ? "sound" : "mute"} />
      </button>
      <button
        type="button"
        className="ga-btn"
        data-on={lit ? "1" : "0"}
        aria-pressed={lit}
        aria-label={lit ? "Switch the projector off" : "Switch the projector on"}
        data-tip={lit ? "Projector on" : "Projector off"}
        onClick={() => {
          store().press("power");
          store().togglePower();
        }}
      >
        <ControlIcon name="power" />
      </button>
      <button
        type="button"
        className="ga-btn"
        aria-pressed={view === "explore"}
        data-on={view === "explore" ? "1" : "0"}
        aria-label={view === "explore" ? "Back to the projector view" : "Explore the room in 3D"}
        data-tip={view === "explore" ? "Back to the projector" : "Explore the room"}
        onClick={() => store().setViewMode(view === "explore" ? "framed" : "explore")}
      >
        <ControlIcon name="orbit" />
      </button>
      <button
        type="button"
        className="ga-btn"
        aria-label="Step out of the room"
        data-tip="Step out of the room"
        onClick={() => store().setViewMode("intro")}
      >
        <ControlIcon name="door" />
      </button>
      <button
        type="button"
        className="ga-btn"
        aria-expanded={drawerOpen}
        aria-controls="resume-drawer"
        aria-label="Résumé and links"
        data-tip="Résumé & links"
        onClick={() => store().setDrawerOpen(!drawerOpen)}
      >
        <ControlIcon name="drawer" />
      </button>
    </div>
  );
}
