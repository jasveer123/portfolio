"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { experienceStore, useExperience } from "@/lib/experience-store";
import { PROJECT_VIEWS, VIEW_LABELS, type Project, type ProjectView } from "@/lib/project-data";
import { blurForValue, snapValue, valueForView, viewForValue } from "@/lib/focus";
import { ArchitectureDiagram } from "./ArchitectureDiagram";
import { ProjectCover } from "./ProjectCover";

type Props = {
  project: Project;
  index: number;
  total: number;
  prev: Pick<Project, "slug" | "title">;
  next: Pick<Project, "slug" | "title">;
};

export function ProjectCaseStudy({ project, index, total, prev, next }: Props) {
  const isActive = useExperience((s) => s.activeProject === project.slug);
  // The visible layer follows the focus wheel — the swap happens at the
  // blurriest point between two detents.
  const shown = useExperience((s): ProjectView => (s.activeProject === project.slug ? viewForValue(s.focusValue) : "product"));
  const layerRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const apply = (v: number) => {
      const el = layerRef.current;
      if (!el) return;
      const blur = blurForValue(v);
      const shift = (v - snapValue(v)) * 26;
      el.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : "";
      el.style.transform = Math.abs(shift) > 0.05 ? `translateX(${shift.toFixed(2)}px)` : "";
      el.style.opacity = String(1 - Math.min(0.35, blur / 20));
    };
    apply(experienceStore.getState().focusValue);
    return experienceStore.subscribe((s, p) => {
      if (s.focusValue !== p.focusValue && s.activeProject === project.slug) apply(s.focusValue);
    });
  }, [project.slug]);

  const choose = (view: ProjectView) => {
    if (!isActive) return;
    experienceStore.getState().setView(view);
  };

  const onTabKey = (e: React.KeyboardEvent) => {
    const i = PROJECT_VIEWS.indexOf(shown);
    let n = i;
    if (e.key === "ArrowRight") n = Math.min(PROJECT_VIEWS.length - 1, i + 1);
    else if (e.key === "ArrowLeft") n = Math.max(0, i - 1);
    else if (e.key === "Home") n = 0;
    else if (e.key === "End") n = PROJECT_VIEWS.length - 1;
    else return;
    e.preventDefault();
    choose(PROJECT_VIEWS[n]);
    tabsRef.current?.querySelectorAll<HTMLButtonElement>("[role=tab]")[n]?.focus();
  };

  const navTo = (e: React.MouseEvent, slug: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    experienceStore.getState().selectProject(slug);
  };

  return (
    <article className="proj" aria-labelledby="case-title">
      <header className="case-head">
        <p className="kicker">
          Project {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")} · {project.company}
        </p>
        <h1 id="case-title" className="title-lg">
          {project.title}
        </h1>
        <div className="case-meta">
          <span className="label" style={{ margin: 0 }}>
            {project.category} · {project.year}
          </span>
          <ProjectTags project={project} />
          {project.externalUrl && (
            <a className="link" href={project.externalUrl} target="_blank" rel="noreferrer">
              {project.externalLabel ?? project.externalUrl} <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
        <p className="lede" style={{ margin: 0, maxWidth: "62ch" }}>
          {project.summary}
        </p>
      </header>

      <div ref={tabsRef} className="view-tabs" role="tablist" aria-label="Case-study layer (focus wheel)" onKeyDown={onTabKey}>
        {PROJECT_VIEWS.map((v) => (
          <button
            key={v}
            type="button"
            role="tab"
            id={`tab-${v}`}
            aria-selected={shown === v}
            aria-controls={`layer-${v}`}
            tabIndex={shown === v ? 0 : -1}
            className="view-tab"
            onClick={() => choose(v)}
          >
            <span className="tick" aria-hidden="true" />
            {VIEW_LABELS[v]}
          </button>
        ))}
      </div>

      <div ref={layerRef} className="layer">
        <Layer id="product" shown={shown}>
          <div className="layer-grid hero">
            <figure className="figure">
              <div className="shot" style={{ position: "relative", aspectRatio: "16 / 10" }}>
                <ProjectCover project={project} sizes="(min-width: 1024px) 34vw, 92vw" priority />
              </div>
              {project.confidentialityNote && <figcaption>{project.confidentialityNote}</figcaption>}
            </figure>
            <div style={{ display: "grid", gap: "1.1em" }}>
              <Block title="The problem">{project.problem}</Block>
              <Block title="Who it’s for">{project.targetUsers}</Block>
              <Block title="The experience">{project.experience}</Block>
            </div>
          </div>
          {project.images.gallery?.map((g) => (
            <figure key={g.caption} className="figure" style={{ marginTop: "1.4em" }}>
              <div className="shot">
                <Image src={g.src} alt={g.alt} sizes="(min-width: 1024px) 50vw, 92vw" placeholder="blur" />
              </div>
              <figcaption>{g.caption}</figcaption>
            </figure>
          ))}
        </Layer>

        <Layer id="architecture" shown={shown}>
          <ArchitectureDiagram project={project} />
          <div className="layer-grid two" style={{ marginTop: "1.2em" }}>
            <section>
              <h2 className="label">Components</h2>
              <ul className="list">
                {project.architecture.nodes.map((n) => (
                  <li key={n.id}>
                    <strong style={{ fontWeight: 600 }}>{n.label}</strong>
                    {n.detail ? <span className="muted"> — {n.detail}</span> : null}
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h2 className="label">Technology</h2>
              <ul className="chips">
                {project.technologies.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </section>
          </div>
        </Layer>

        <Layer id="engineering" shown={shown}>
          <div className="layer-grid two">
            <ListBlock title="My contribution" items={project.contribution} />
            <div style={{ display: "grid", gap: "1.4em" }}>
              <ListBlock title="Key decisions" items={project.decisions} />
              <ListBlock title="Challenges" items={project.challenges} />
              <ListBlock title="Performance · security · scale" items={project.qualityWork} />
            </div>
          </div>
        </Layer>

        <Layer id="impact" shown={shown}>
          <div className="layer-grid two">
            <ListBlock title="Results" items={project.results} />
            <ListBlock title="Lessons" items={project.lessons} />
          </div>
          {project.confidential && (
            <p className="muted" style={{ marginTop: "1.2em", fontSize: "0.9em" }}>
              Measured impact for this client is confidential and is not published here.
            </p>
          )}
        </Layer>
      </div>

      <nav className="case-foot" aria-label="Project navigation">
        <Link href={`/work/${prev.slug}`} className="btn" onClick={(e) => navTo(e, prev.slug)}>
          <span aria-hidden="true">←</span> {prev.title}
        </Link>
        <Link href="/work" className="btn">
          Eject · all work
        </Link>
        <Link href={`/work/${next.slug}`} className="btn" onClick={(e) => navTo(e, next.slug)}>
          {next.title} <span aria-hidden="true">→</span>
        </Link>
      </nav>
    </article>
  );
}

/** Company work vs personal work; company work shows an outline only. */
export function ProjectTags({ project }: { project: Project }) {
  if (project.kind === "personal") return <span className="badge badge-personal">Personal project</span>;
  return (
    <>
      <span className="badge">Company project</span>
      <span className="badge badge-quiet">{project.confidential ? "Confidential · outline only" : "Outline only · client details withheld"}</span>
    </>
  );
}

function Layer({ id, shown, children }: { id: ProjectView; shown: ProjectView; children: React.ReactNode }) {
  return (
    <section id={`layer-${id}`} role="tabpanel" aria-labelledby={`tab-${id}`} hidden={shown !== id} data-focus={valueForView(id)}>
      {children}
    </section>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="label">{title}</h2>
      <p style={{ margin: 0 }}>{children}</p>
    </section>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <section>
      <h2 className="label">{title}</h2>
      <ul className="list">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </section>
  );
}
