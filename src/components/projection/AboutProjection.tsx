import Image from "next/image";
import Link from "next/link";
import portrait from "@/images/profile.jpg";
import { site, yearsOfExperience } from "@/lib/site";

export function AboutProjection() {
  const years = yearsOfExperience();
  return (
    <article className="proj" aria-labelledby="about-title">
      <div className="about-grid">
        <div>
          <p className="kicker">Slide 01 · About</p>
          <h1 id="about-title" className="display">
            {site.name}
          </h1>
          <p className="label" style={{ marginTop: "1em" }}>
            {site.role} · {years}+ years · {site.location}
          </p>
          <p className="statement" style={{ marginTop: "0.9em" }}>
            “{site.statement}”
          </p>
          <p className="lede" style={{ marginTop: "1.1em" }}>
            {site.summary}
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6em", marginTop: "1.4em" }}>
            <Link href="/work" className="btn btn-primary">
              See the work <span aria-hidden="true">→</span>
            </Link>
            <a href={site.resumePath} className="btn" download>
              Résumé (PDF)
            </a>
            <Link href="/skills" className="btn">
              Skills blueprint
            </Link>
          </div>
        </div>

        <div style={{ display: "grid", gap: "1.2em" }}>
          <figure className="mount sepia" data-label="JS · 2026" style={{ margin: 0, maxWidth: 280, justifySelf: "center", width: "100%" }}>
            <div className="mount-window">
              <Image src={portrait} alt="Portrait of Jasveer Singh" fill sizes="(min-width: 1024px) 22vw, 60vw" placeholder="blur" />
            </div>
          </figure>
        </div>
      </div>

      <hr className="rule" />

      <div className="layer-grid two">
        <section aria-labelledby="focus-areas">
          <h2 id="focus-areas" className="label">
            Focus areas
          </h2>
          <ul className="chips">
            {site.focusAreas.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="currently">
          <h2 id="currently" className="label">
            Currently
          </h2>
          <p style={{ margin: 0 }}>{site.currentFocus}</p>
          <p className="muted" style={{ margin: "0.8em 0 0" }}>
            {site.about[1]}
          </p>
        </section>
      </div>
    </article>
  );
}
