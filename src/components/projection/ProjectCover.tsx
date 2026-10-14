import Image from "next/image";
import type { Project } from "@/lib/project-data";

/**
 * Real screenshot when one exists; otherwise a confidentiality-safe cover — an
 * abstract slide-mount composition of the architecture, never a fake UI.
 */
export function ProjectCover({ project, sizes, priority }: { project: Project; sizes: string; priority?: boolean }) {
  if (project.images.hero) {
    return (
      <Image
        src={project.images.hero}
        alt={project.images.heroAlt ?? project.title}
        fill
        sizes={sizes}
        placeholder="blur"
        priority={priority}
        style={{ objectFit: "cover", objectPosition: "top" }}
      />
    );
  }
  const nodes = project.architecture.nodes;
  return (
    <svg
      viewBox="0 0 320 200"
      role="img"
      aria-label={`${project.title} — abstract cover${project.confidential ? " (confidential work, no product UI shown)" : ""}`}
      style={{ width: "100%", height: "100%", display: "block", background: project.accent }}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id={`v-${project.slug}`} cx="50%" cy="45%" r="75%">
          <stop offset="0" stopColor="#fff3dc" stopOpacity="0.28" />
          <stop offset="1" stopColor="#1a120b" stopOpacity="0.35" />
        </radialGradient>
      </defs>
      <rect width="320" height="200" fill={`url(#v-${project.slug})`} />
      {nodes.map((n, i) => {
        const x = 40 + (i % 2) * 130 + (i > 1 ? 30 : 0);
        const y = 34 + Math.floor(i / 2) * 64 + (i % 2) * 10;
        return (
          <g key={n.id}>
            <rect x={x} y={y} width="110" height="34" rx="2" fill="none" stroke="#f3ecdb" strokeOpacity="0.75" />
            <rect x={x + 8} y={y + 10} width={40 + ((i * 17) % 40)} height="3" fill="#f3ecdb" fillOpacity="0.8" />
            <rect x={x + 8} y={y + 19} width={26 + ((i * 11) % 30)} height="2" fill="#f3ecdb" fillOpacity="0.45" />
          </g>
        );
      })}
      <path d="M95 68 V 98 M 150 51 H 170 M 225 85 V 120" stroke="#f3ecdb" strokeOpacity="0.5" strokeDasharray="3 4" fill="none" />
      <text x="20" y="186" fill="#f3ecdb" fillOpacity="0.9" style={{ font: "500 11px var(--font-mono), monospace", letterSpacing: "0.12em" }}>
        {project.shortTitle.toUpperCase()} · {project.year}
      </text>
      {project.confidential && (
        <text x="300" y="186" textAnchor="end" fill="#f3ecdb" fillOpacity="0.7" style={{ font: "500 9px var(--font-mono), monospace", letterSpacing: "0.14em" }}>
          CONFIDENTIAL
        </text>
      )}
    </svg>
  );
}
