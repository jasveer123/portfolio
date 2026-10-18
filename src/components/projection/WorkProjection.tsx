import Link from "next/link";
import { projects } from "@/lib/project-data";
import { ProjectCover } from "./ProjectCover";
import { ProjectTags } from "./ProjectCaseStudy";

export function WorkProjection() {
  return (
    <article className="proj" aria-labelledby="work-title">
      <p className="kicker">Slide 02 · Work</p>
      <h1 id="work-title" className="title-lg">
        Five projects, loaded in the carousel.
      </h1>
      <p className="lede" style={{ maxWidth: "52ch", marginTop: "0.6em" }}>
        Pick a slide — from this contact sheet or the projector carousel. Inside each one, turn the lens to move
        between product, architecture, engineering and impact.
      </p>

      <ol className="contact-sheet" style={{ marginTop: "1.6em" }}>
        {projects.map((p, i) => (
          <li key={p.slug}>
            <Link href={`/work/${p.slug}`} className="sheet-card">
              <div className="sheet-frame">
                <ProjectCover project={p} sizes="(min-width: 1024px) 18vw, 90vw" />
              </div>
              <p className="label" style={{ marginTop: "0.8em" }}>
                {String(i + 1).padStart(2, "0")} · {p.category} · {p.year}
              </p>
              <h2 className="title-md">{p.title}</h2>
              <p className="sheet-tags">
                <ProjectTags project={p} />
              </p>
              <p className="muted" style={{ margin: "0.4em 0 0", fontSize: "0.92em" }}>
                {p.summary}
              </p>
            </Link>
          </li>
        ))}
      </ol>
    </article>
  );
}
