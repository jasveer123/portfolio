/** Skills grouped for the blueprint view — sourced from the résumé skills summary. */
export type SkillGroup = { id: string; label: string; items: string[] };

export const skillBlueprint: SkillGroup[] = [
  {
    id: "frontend",
    label: "Frontend",
    items: ["Next.js", "React", "TypeScript", "Redux Toolkit", "Zustand", "TanStack Query", "Tailwind CSS", "Shadcn UI", "Framer Motion", "styled-components", "Web3.js"],
  },
  {
    id: "backend",
    label: "Backend",
    items: ["Node.js", "Express", "FastAPI", "Python", "PostgreSQL", "MongoDB", "Redis", "REST APIs", "JWT / Auth", "SQL"],
  },
  {
    id: "ai",
    label: "AI and LLM",
    items: ["LLM integration", "GenAI", "OpenAI API", "AI SDKs", "MCP"],
  },
  {
    id: "cloud",
    label: "Cloud and DevOps",
    items: ["Docker", "AWS", "CI/CD", "Bash"],
  },
  {
    id: "observability",
    label: "Observability",
    items: ["OpenTelemetry", "Grafana", "Jaeger"],
  },
  {
    id: "tools",
    label: "Developer tools",
    items: ["SonarQube", "Trivy", "OWASP practices", "Cursor", "Claude"],
  },
];
