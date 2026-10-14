"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { experienceStore, useExperience } from "@/lib/experience-store";
import { audio } from "@/lib/audio-manager";
import { site } from "@/lib/site";

/**
 * The first thing a visitor sees: the room from the doorway and a short note
 * pinned in front of it. Stepping in glides the camera to the desk.
 */
export function WelcomeNote() {
  const mode = useExperience((s) => s.viewMode);
  const reduced = useExperience((s) => s.reducedMotion);
  const button = useRef<HTMLButtonElement>(null);
  const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  useEffect(() => {
    if (mode === "intro") button.current?.focus({ preventScroll: true });
  }, [mode]);

  const stepIn = () => {
    audio.unlock();
    experienceStore.getState().setViewMode("framed");
  };

  return (
    <AnimatePresence>
      {mode === "intro" && (
        <motion.section
          className="welcome"
          aria-labelledby="welcome-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: reduced ? 0.1 : 0.7 } }}
        >
          <motion.article
            className="letter"
            initial={reduced ? { opacity: 0 } : { opacity: 0, x: -60, rotate: -6 }}
            animate={{ opacity: 1, x: 0, rotate: -1.6 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, x: -40, rotate: -4 }}
            transition={{ duration: reduced ? 0.15 : 1.1, ease: [0.2, 0.8, 0.2, 1], delay: reduced ? 0 : 0.4 }}
          >
            <header className="letter-head">
              <span>J. Singh</span>
              <span aria-hidden="true">·</span>
              <span>The Study, {site.location.split(",")[0]}</span>
            </header>
            <p className="letter-date">{date}</p>

            <h1 id="welcome-title" className="letter-salutation">
              Dear visitor,
            </h1>
            <p>Come in, and close the door gently behind you.</p>
            <p>
              This is the room where I keep my work. Not in tabs or folders, but on slides: small squares of light
              collected over five years of building — AI products that talk back, research platforms people rely on,
              payment systems that had to be right the first time.
            </p>
            <p>
              Pull up the chair. Switch on the old projector, let the bulb warm, and choose a slide. When you’ve seen
              enough of the work, switch it off — the person is still here.
            </p>

            <footer className="letter-foot">
              <div>
                <p className="letter-closing">Yours sincerely,</p>
                <p className="letter-signature">{site.name.split(" ")[0]}</p>
                <p className="letter-ps">P.S. Switch the projector off once — there’s more on the wall.</p>
              </div>
              <span className="wax-seal" aria-hidden="true">
                JS
              </span>
            </footer>

            <button ref={button} type="button" className="letter-enter" onClick={stepIn}>
              Step into the room <span aria-hidden="true">→</span>
            </button>
          </motion.article>
        </motion.section>
      )}
    </AnimatePresence>
  );
}

/** Instructions + exit while orbiting the set. */
export function ExploreBar() {
  const mode = useExperience((s) => s.viewMode);
  return (
    <AnimatePresence>
      {mode === "explore" && (
        <motion.div
          className="explore-bar"
          role="status"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.3 }}
        >
          <span>Drag to orbit · right-drag to pan · scroll to zoom</span>
          <button type="button" onClick={() => experienceStore.getState().setViewMode("framed")}>
            Back to the projector <span aria-hidden="true">↩</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
