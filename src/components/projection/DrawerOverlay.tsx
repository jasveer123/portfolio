"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { experienceStore, useExperience } from "@/lib/experience-store";
import { site } from "@/lib/site";

/** The small drawer in the slide tray: résumé and profiles as plain links. */
export function DrawerOverlay() {
  const open = useExperience((s) => s.drawerOpen);
  const reduced = useExperience((s) => s.reducedMotion);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    ref.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") experienceStore.getState().setDrawerOpen(false);
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Element;
      if (ref.current?.contains(t) || t.closest?.("[aria-controls='resume-drawer']") || t.closest?.(".ga-btn") || t.tagName === "CANVAS") return;
      experienceStore.getState().setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          id="resume-drawer"
          role="dialog"
          aria-label="Résumé and links"
          className="drawer-pop"
          tabIndex={-1}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: -14, rotate: 3 }}
          animate={{ opacity: 1, y: 0, rotate: 1.2 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: -10, rotate: 2 }}
          transition={{ duration: reduced ? 0.12 : 0.28, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <button
            type="button"
            className="note-close"
            aria-label="Close"
            onClick={() => experienceStore.getState().setDrawerOpen(false)}
          >
            ×
          </button>
          <p className="note-head">From the desk drawer</p>
          <ul className="note-list">
            <li>
              <a href={site.resumePath} download>
                <span>Résumé</span>
                <i aria-hidden="true" />
                <span>PDF ↓</span>
              </a>
            </li>
            <li>
              <a href={site.social.email}>
                <span>Email</span>
                <i aria-hidden="true" />
                <span>{site.email}</span>
              </a>
            </li>
            <li>
              <a href={site.social.linkedin} target="_blank" rel="noreferrer">
                <span>LinkedIn</span>
                <i aria-hidden="true" />
                <span>jasveer-singh ↗</span>
              </a>
            </li>
            <li>
              <a href={site.social.github} target="_blank" rel="noreferrer">
                <span>GitHub</span>
                <i aria-hidden="true" />
                <span>jasveer123 ↗</span>
              </a>
            </li>
          </ul>
          <p className="note-sign">— J.S.</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
