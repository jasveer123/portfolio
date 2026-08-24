export type SkillGroup = {
  label: string;
  items: string[];
};

export const skillGroups: SkillGroup[] = [
  {
    label: "Languages",
    items: ["TypeScript", "JavaScript", "Python", "SQL", "Bash"],
  },
  {
    label: "Frontend",
    items: [
      "Next.js",
      "React",
      "Redux Toolkit",
      "Zustand",
      "TanStack Query",
      "Tailwind CSS",
      "Shadcn UI",
      "Framer Motion",
    ],
  },
  {
    label: "Backend",
    items: [
      "Node.js",
      "Express",
      "FastAPI",
      "PostgreSQL",
      "MongoDB",
      "Redis",
      "REST APIs",
      "JWT / Auth",
    ],
  },
  {
    label: "Tools & AI",
    items: [
      "Docker",
      "AWS",
      "CI/CD",
      "OpenTelemetry",
      "SonarQube",
      "Web3.js",
      "OpenAI / LLM",
      "MCP",
    ],
  },
];

export const education = {
  degree: "B.Tech in Electronics and Communication Engineering",
  institution: "Guru Nanak Dev Engineering College, Ludhiana",
  period: "July 2017 – July 2021",
  gpa: "GPA 7.4",
} as const;

export const navigation = [
  { label: "Beliefs", href: "#beliefs" },
  { label: "Work", href: "#work" },
  { label: "Path", href: "#experience" },
  { label: "Play", href: "#play" },
  { label: "Connect", href: "#contact" },
] as const;
