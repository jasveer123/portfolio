import { site } from "@/lib/site";

export function ContactProjection() {
  return (
    <article className="proj" aria-labelledby="contact-title">
      <p className="kicker">Slide 05 · Contact</p>
      <div className="postcard">
        <svg className="stamp" viewBox="0 0 80 96" aria-hidden="true">
          <path
            d="M4 4h72v88H4z"
            fill="#efe4c8"
            stroke="#a9573a"
            strokeWidth="2"
            strokeDasharray="3 3"
          />
          <rect x="12" y="12" width="56" height="58" fill="#a9573a" opacity="0.85" />
          <circle cx="40" cy="38" r="12" fill="#efe4c8" opacity="0.9" />
          <path d="M22 70 L36 52 L46 62 L58 46 L68 70Z" fill="#5f6b47" />
          <text x="40" y="86" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="#5d5147">
            IN · 2026
          </text>
        </svg>
        <div>
          <h1 id="contact-title" className="title-lg" style={{ maxWidth: "14ch" }}>
            Have an idea worth bringing into focus?
          </h1>
          <p className="lede" style={{ marginTop: "0.8em", maxWidth: "44ch" }}>
            I’m {site.availability.toLowerCase()} — full-stack roles, AI and LLM products, and teams that care about
            how complicated software feels to use. Email is the quickest way to reach me.
          </p>
          <p className="label" style={{ marginTop: "1.2em" }}>
            Postmarked {site.location}
          </p>
        </div>
        <div className="address">
          <h2 className="label">Send it to</h2>
          <ul>
            <li>
              <a href={site.social.email}>
                <span>Email</span>
                <span>{site.email}</span>
              </a>
            </li>
            <li>
              <a href={site.social.linkedin} target="_blank" rel="noreferrer">
                <span>LinkedIn</span>
                <span>jasveer-singh ↗</span>
              </a>
            </li>
            <li>
              <a href={site.social.github} target="_blank" rel="noreferrer">
                <span>GitHub</span>
                <span>jasveer123 ↗</span>
              </a>
            </li>
            <li>
              <a href={site.resumePath} download>
                <span>Résumé</span>
                <span>PDF ↓</span>
              </a>
            </li>
          </ul>
          <a className="btn btn-primary" href={site.social.email} style={{ marginTop: "1.2em" }}>
            Write to me <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </article>
  );
}
