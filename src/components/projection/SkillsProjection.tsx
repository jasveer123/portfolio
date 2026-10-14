import Link from "next/link";
import { skillBlueprint } from "@/lib/skills-data";

export function SkillsProjection() {
  return (
    <article className="proj" aria-labelledby="skills-title">
      <div className="blueprint">
        <p className="kicker">Slide B1 · Blueprint</p>
        <h1 id="skills-title" className="title-lg">
          Technical blueprint
        </h1>
        <p style={{ margin: "0.5em 0 0", maxWidth: "58ch", opacity: 0.85 }}>
          The working parts, grouped by where they sit in a product — from the interface down to the instruments that
          watch it run.
        </p>
        <div className="bp-grid">
          <svg className="bp-lines" aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 100 100">
            <path d="M16 30 H84 M16 70 H84 M33 30 V70 M66 30 V70" vectorEffect="non-scaling-stroke" />
          </svg>
          {skillBlueprint.map((g, i) => (
            <section key={g.id} className="bp-box" data-ref={`FIG. ${String(i + 1).padStart(2, "0")}`} aria-labelledby={`bp-${g.id}`}>
              <h2 id={`bp-${g.id}`}>{g.label}</h2>
              <ul>
                {g.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
      <p className="muted" style={{ marginTop: "1.2em", fontSize: "0.92em" }}>
        See these tools in context in the <Link className="link" href="/work">case studies</Link> and on the{" "}
        <Link className="link" href="/experience">timeline</Link>.
      </p>
    </article>
  );
}
