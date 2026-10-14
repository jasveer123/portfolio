"use client";

import Image from "next/image";
import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { experienceStore, useExperience } from "@/lib/experience-store";
import { education, experienceFrames } from "@/lib/experience-data";

export function ExperienceProjection() {
  const active = useExperience((s) => s.activeExperience);
  const reduced = useExperience((s) => s.reducedMotion);
  const reelRef = useRef<HTMLDivElement>(null);
  const f = experienceFrames[active];

  const select = (i: number) => experienceStore.getState().setExperience(i);

  const onReelKey = (e: React.KeyboardEvent) => {
    let n = active;
    if (e.key === "ArrowRight") n = Math.min(experienceFrames.length - 1, active + 1);
    else if (e.key === "ArrowLeft") n = Math.max(0, active - 1);
    else if (e.key === "Home") n = 0;
    else if (e.key === "End") n = experienceFrames.length - 1;
    else return;
    e.preventDefault();
    select(n);
    reelRef.current?.querySelectorAll<HTMLButtonElement>("[role=tab]")[n]?.focus();
  };

  return (
    <article className="proj" aria-labelledby="exp-title">
      <p className="kicker">Slide 03 · Experience</p>
      <h1 id="exp-title" className="title-lg">
        The film reel, 2021 → today.
      </h1>
      <p className="muted" style={{ margin: "0.5em 0 0" }}>
        Drag the filmstrip on the desk, or choose a frame below.
      </p>

      <div ref={reelRef} className="reel" role="tablist" aria-label="Career timeline" onKeyDown={onReelKey}>
        {experienceFrames.map((fr, i) => (
          <button
            key={fr.slug}
            type="button"
            role="tab"
            id={`frame-tab-${fr.slug}`}
            aria-selected={i === active}
            aria-controls={`frame-${fr.slug}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => select(i)}
          >
            <span className="yr">{fr.startYear}</span>
            {fr.company}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.section
          key={f.slug}
          id={`frame-${f.slug}`}
          role="tabpanel"
          aria-labelledby={`frame-tab-${f.slug}`}
          className="film-layout"
          style={{ marginTop: "1.6em" }}
          initial={reduced ? { opacity: 0 } : { opacity: 0, filter: "blur(6px)", x: 18 }}
          animate={{ opacity: 1, filter: "blur(0px)", x: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, filter: "blur(6px)", x: -18 }}
          transition={{ duration: reduced ? 0.12 : 0.32, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <div>
            <div className="film-frame">
              <div className="film-window" style={{ ["--tint" as string]: f.tint }}>
                {f.still ? (
                  <Image src={f.still.src} alt={f.still.alt} fill sizes="(min-width: 1024px) 22vw, 90vw" placeholder="blur" />
                ) : f.logo ? (
                  <Image className="logo" src={f.logo} alt={`${f.company} logo`} />
                ) : (
                  <span className="initials" aria-hidden="true">
                    {f.company
                      .split(" ")
                      .map((w) => w[0])
                      .join("")}
                  </span>
                )}
              </div>
            </div>
            <dl style={{ margin: "1em 0 0", display: "grid", gap: "0.6em" }}>
              <div>
                <dt className="label">Dates</dt>
                <dd style={{ margin: 0 }}>{f.period}</dd>
              </div>
              <div>
                <dt className="label">Where</dt>
                <dd style={{ margin: 0 }}>{f.location}</dd>
              </div>
            </dl>
          </div>

          <div style={{ display: "grid", gap: "1.3em" }}>
            <header>
              <h2 className="title-md" style={{ fontSize: "clamp(22px, 3cqi, 34px)" }}>
                {f.companyUrl ? (
                  <a className="link" href={f.companyUrl} target="_blank" rel="noreferrer" style={{ textDecorationThickness: 1 }}>
                    {f.company}
                  </a>
                ) : (
                  f.company
                )}
              </h2>
              <p className="label" style={{ marginTop: "0.5em" }}>
                {f.role}
              </p>
            </header>
            <section>
              <h3 className="label">Responsibilities</h3>
              <ul className="list">
                {f.responsibilities.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </section>
            <div className="layer-grid two">
              <section>
                <h3 className="label">Products</h3>
                <ul className="list">
                  {f.products.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </section>
              <section>
                <h3 className="label">Key impact</h3>
                <ul className="list">
                  {f.impact.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </section>
            </div>
            <section>
              <h3 className="label">Technologies</h3>
              <ul className="chips">
                {f.technologies.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </section>
          </div>
        </motion.section>
      </AnimatePresence>

      <p className="muted" style={{ marginTop: "2em", fontSize: "0.9em" }}>
        Before the reel: {education.degree}, {education.institution} ({education.period}).
      </p>
    </article>
  );
}
