import type { StaticImageData } from "next/image";
import integrations from "@/images/integrations.png";
import fetchDocs from "@/images/fetch-docs.png";
import globacap from "@/images/globacap.png";
import projectorPortfolio from "@/images/projects/projector-portfolio.jpg";

/**
 * Case-study content. Every statement here is taken from the résumé or the
 * previous portfolio copy — do not add metrics or responsibilities that are
 * not documented there. Confidential products use abstract covers only.
 */

export type ProjectView = "product" | "architecture" | "engineering" | "impact";
export const PROJECT_VIEWS: ProjectView[] = ["product", "architecture", "engineering", "impact"];
export const VIEW_LABELS: Record<ProjectView, string> = {
  product: "Product",
  architecture: "Architecture",
  engineering: "Engineering",
  impact: "Impact",
};

export type ArchitectureLayer = "client" | "service" | "data" | "external" | "observability";

export type ArchitectureNode = {
  id: string;
  label: string;
  detail?: string;
  layer: ArchitectureLayer;
};

export type ArchitectureEdge = { from: string; to: string; label?: string };

export type Project = {
  slug: string;
  title: string;
  shortTitle: string;
  category: string;
  year: string;
  company: string;
  /** Built at a company (outline only for client work) or a personal project. */
  kind: "company" | "personal";
  summary: string;
  problem: string;
  targetUsers: string;
  experience: string;
  contribution: string[];
  decisions: string[];
  challenges: string[];
  qualityWork: string[];
  technologies: string[];
  results: string[];
  lessons: string[];
  architecture: { nodes: ArchitectureNode[]; edges: ArchitectureEdge[] };
  images: {
    /** Real public screenshot. Omitted for confidential work or when none exists. */
    hero?: StaticImageData;
    heroAlt?: string;
    gallery?: { src: StaticImageData; alt: string; caption: string }[];
  };
  /** Accent colour used on slide mounts and covers — muted, vintage. */
  accent: string;
  confidential?: boolean;
  confidentialityNote?: string;
  externalUrl?: string;
  externalLabel?: string;
};

export const projects: Project[] = [
  {
    slug: "asi1",
    title: "ASI1.ai",
    shortTitle: "ASI1",
    category: "Conversational AI",
    year: "2024",
    company: "Hashtrust Technologies · for Fetch.ai",
    kind: "company",
    summary:
      "An end-to-end conversational AI platform built around the ASI LLM — chat interface, memory, sessions and the APIs between them.",
    problem:
      "The ASI LLM needed a real product around it: a conversational experience that felt real-time and kept its context, rather than a bare model endpoint.",
    targetUsers: "People using the ASI LLM through a web chat product.",
    experience:
      "A real-time chat interface with conversation memory and session management, backed by APIs that connect the interface to the model.",
    contribution: [
      "Developed the ASI1.ai platform and the full conversational AI application.",
      "Integrated the ASI LLM into the product.",
      "Built the chat UI, memory handling and session management.",
      "Built the backend APIs between the interface and the model.",
    ],
    decisions: [
      "Treat memory and session state as part of the product, not an afterthought of the chat window.",
      "Keep the model behind backend APIs so the interface stays decoupled from the LLM.",
    ],
    challenges: [
      "Keeping a conversation feeling real-time while carrying context between turns and sessions.",
    ],
    qualityWork: [
      "Session management so conversations survive beyond a single exchange.",
    ],
    technologies: ["Next.js", "TypeScript", "LLM integration", "GenAI", "REST APIs"],
    results: [
      "Shipped the complete conversational application end-to-end.",
      "Live as a public product at asi1.ai.",
    ],
    lessons: [
      "Conversation quality depends as much on state — memory and sessions — as on the model itself.",
    ],
    architecture: {
      nodes: [
        { id: "ui", label: "Chat UI", detail: "Next.js", layer: "client" },
        { id: "api", label: "Backend APIs", detail: "chat · auth", layer: "service" },
        { id: "session", label: "Sessions & memory", detail: "conversation state", layer: "data" },
        { id: "llm", label: "ASI LLM", detail: "model", layer: "external" },
      ],
      edges: [
        { from: "ui", to: "api", label: "messages" },
        { from: "api", to: "session", label: "context" },
        { from: "api", to: "llm", label: "prompt / reply" },
      ],
    },
    images: {},
    accent: "#B9823A",
    externalUrl: "https://asi1.ai",
    externalLabel: "asi1.ai",
    confidentialityNote: "No product screenshot is archived for this project — cover is an illustration.",
  },
  {
    slug: "fetch-integrations",
    title: "Fetch.ai Integrations",
    shortTitle: "Integrations",
    category: "Developer platform",
    year: "2024",
    company: "Hashtrust Technologies · for Fetch.ai",
    kind: "company",
    summary:
      "A dynamic integrations hub that reads live data from GitHub, processes it through FastAPI and presents the Fetch.ai ecosystem in a responsive Next.js UI.",
    problem:
      "Integration listings for the Fetch.ai ecosystem were documented by hand, which created manual docs work and left the ecosystem without real-time visibility.",
    targetUsers: "Developers exploring what Fetch.ai and its uAgents framework integrate with.",
    experience:
      "A browsable catalogue of integrations with search, categories and detail pages, populated from GitHub rather than hand-edited docs.",
    contribution: [
      "Built the Integrations platform, using the GitHub API to retrieve and display integration data dynamically.",
      "Wrote backend services with FastAPI and PostgreSQL.",
      "Optimised backend data handling and frontend responsiveness to meet tight deadlines.",
      "Integrated external systems with the uAgents framework, with examples and documentation for each.",
    ],
    decisions: [
      "Make GitHub the source of truth so listings follow the repositories instead of a docs page.",
      "Process and store integration data server-side (FastAPI + PostgreSQL) so the UI renders prepared data.",
    ],
    challenges: [
      "Tight project deadlines.",
      "Keeping a data-driven catalogue responsive as the data comes from an external API.",
    ],
    qualityWork: [
      "Backend data handling tuned for frontend responsiveness.",
      "On the related Fetch.ai docs, moved API calls from client to server side for faster loads.",
    ],
    technologies: ["Next.js", "Nextra", "FastAPI", "PostgreSQL", "GitHub API", "uAgents"],
    results: [
      "Integration data flows from GitHub instead of manual documentation updates.",
      "Real-time visibility of the ecosystem’s integrations.",
      "Related: Fetch.ai documentation APIs moved server-side — about 30% faster.",
    ],
    lessons: [
      "If content already lives in a repository, render from it — a second copy will drift.",
    ],
    architecture: {
      nodes: [
        { id: "gh", label: "GitHub API", detail: "integration repos", layer: "external" },
        { id: "api", label: "FastAPI service", detail: "fetch · process", layer: "service" },
        { id: "db", label: "PostgreSQL", detail: "prepared data", layer: "data" },
        { id: "ui", label: "Next.js UI", detail: "catalogue", layer: "client" },
      ],
      edges: [
        { from: "gh", to: "api", label: "sync" },
        { from: "api", to: "db", label: "store" },
        { from: "ui", to: "api", label: "query" },
      ],
    },
    images: {
      hero: integrations,
      heroAlt: "Fetch.ai Integrations catalogue page with search and integration cards",
      gallery: [
        { src: fetchDocs, alt: "Fetch.ai developer portal home page", caption: "Related work: Fetch.ai documentation portal" },
      ],
    },
    accent: "#6E7B4E",
    externalUrl: "https://fetch.ai/docs",
    externalLabel: "fetch.ai/docs",
  },
  {
    slug: "web3-gateway",
    title: "Web3 Payment Gateway",
    shortTitle: "Connect Wallet",
    category: "Multi-wallet checkout",
    year: "2023",
    company: "Hashtrust Technologies",
    kind: "company",
    summary:
      "A Web3 payment gateway that accepts token transfers from MetaMask, TronLink and Trust Wallet across ERC-20 and TRC-20 networks.",
    problem:
      "Accept crypto payments from people on different wallets and different chains through a single checkout.",
    targetUsers: "Customers paying with crypto wallets on Ethereum-compatible and Tron networks.",
    experience:
      "Connect a wallet, sign the transaction and track its state and balance — the same flow regardless of wallet or chain.",
    contribution: [
      "Developed a fully functional Web3 payment gateway integrating MetaMask, TronLink and Trust Wallet.",
      "Enabled secure token transfers and blockchain transactions across multiple networks.",
      "Handled transaction signing, wallet state and balance tracking.",
    ],
    decisions: [
      "One checkout flow over several wallet providers so users are not routed by wallet.",
    ],
    challenges: [
      "Different wallets and networks (ERC-20, TRC-20) behave differently during connection and signing.",
    ],
    qualityWork: ["Secure token transfers and transaction signing."],
    technologies: ["React", "Web3.js", "MetaMask", "TronLink", "Trust Wallet", "ERC-20", "TRC-20"],
    results: ["A single checkout supporting three wallets across multiple chains."],
    lessons: ["Wallet integrations need a common state model — connection, signing, confirmation — above the provider APIs."],
    architecture: {
      nodes: [
        { id: "ui", label: "Checkout UI", detail: "React", layer: "client" },
        { id: "wallets", label: "Wallet providers", detail: "MetaMask · TronLink · Trust", layer: "service" },
        { id: "web3", label: "Web3.js", detail: "signing · balances", layer: "service" },
        { id: "chains", label: "ERC-20 · TRC-20", detail: "networks", layer: "external" },
      ],
      edges: [
        { from: "ui", to: "wallets", label: "connect" },
        { from: "ui", to: "web3", label: "sign" },
        { from: "web3", to: "chains", label: "transfer" },
      ],
    },
    images: {},
    accent: "#4F6B66",
    confidential: true,
    confidentialityNote: "Confidential client work — abstract cover, no product UI shown.",
  },
  {
    slug: "globacap",
    title: "Globacap",
    shortTitle: "Globacap",
    category: "Enterprise fintech",
    year: "2023",
    company: "Hashtrust Technologies · for Globacap",
    kind: "company",
    summary:
      "Frontend modules for a private capital markets platform, built pixel-perfect from Figma with Redux-Saga managing complex API flows.",
    problem:
      "A capital-markets product with complex data flows needed responsive, consistent UI delivered faithfully from design.",
    targetUsers: "Teams working in private capital markets on the Globacap platform.",
    experience: "Responsive enterprise screens that match the design system exactly.",
    contribution: [
      "Developed frontend code with React.js, keeping every module responsive.",
      "Created reusable components with styled-components for consistent UI development.",
      "Worked closely with the UI/UX team to deliver pixel-perfect pages from Figma.",
      "Integrated complex APIs and managed state with Redux-Saga.",
    ],
    decisions: [
      "Reusable styled-components primitives so modules share one visual language.",
      "Redux-Saga for side effects so complex API sequences stay testable and out of components.",
    ],
    challenges: ["Complex API integrations behind pixel-perfect design requirements."],
    qualityWork: ["Scalable data flow with Redux-Saga.", "Consistent, reusable component library."],
    technologies: ["React", "Redux-Saga", "styled-components", "REST APIs", "Figma"],
    results: ["Stable, high-performance frontend modules matching design fidelity."],
    lessons: ["Design fidelity scales through shared components, not page-by-page polish."],
    architecture: {
      nodes: [
        { id: "figma", label: "Figma", detail: "design source", layer: "external" },
        { id: "ui", label: "React modules", detail: "styled-components", layer: "client" },
        { id: "saga", label: "Redux + Saga", detail: "state · effects", layer: "service" },
        { id: "api", label: "Platform APIs", detail: "REST", layer: "data" },
      ],
      edges: [
        { from: "figma", to: "ui", label: "spec" },
        { from: "ui", to: "saga", label: "actions" },
        { from: "saga", to: "api", label: "requests" },
      ],
    },
    images: {
      hero: globacap,
      heroAlt: "Globacap marketing page: Transforming private capital markets with advanced technology",
    },
    accent: "#7A4646",
    externalUrl: "https://globacap.com",
    externalLabel: "globacap.com",
  },
  {
    slug: "projector-portfolio",
    title: "Projector Portfolio",
    shortTitle: "This site",
    category: "Interactive 3D portfolio",
    year: "2026",
    company: "Personal project",
    kind: "personal",
    summary:
      "This portfolio: a study modelled in Blender where an old carousel slide projector is the navigation, and the work is projected onto the wall as light.",
    problem:
      "Most portfolios are a scrolling list of cards. I wanted the work to be discovered — physical, a little playful — without losing readable text, links, keyboard access or SEO.",
    targetUsers: "Recruiters, engineers and anyone curious about how I work.",
    experience:
      "Step into the room, switch the projector on and choose a slide. Each project opens as a projection with four focus layers. Switch it off and the wall turns personal — Polaroids, music, a paper airplane.",
    contribution: [
      "Designed and built the whole experience — the concept, the 3D scene, the interactions and the content.",
      "Wrote a Blender pipeline that bakes Cycles lighting into texture atlases and exports a Draco-compressed GLB.",
      "Built the scene in React Three Fiber with a custom shader that mixes the baked room and projector light live.",
      "Built the projection, project layers, experience timeline, skills blueprint and personal wall as real HTML pages.",
    ],
    decisions: [
      "Bake two lighting states (room, projector) and mix them by lamp level — realistic light for one extra texture lookup.",
      "Keep every slide as real HTML blended onto the lit wall, so text stays selectable, linkable, accessible and indexable.",
      "Drive the room from a typed Zustand state machine (off → warming → changing slide → focusing → ready), unit-tested without WebGL.",
      "Real routes for every slide and project (/work/[slug]?view=architecture), so every view is linkable.",
      "Synthesise the projector, switch and focus sounds with the Web Audio API — no audio files for the mechanics.",
    ],
    challenges: [
      "Lining up HTML exactly with a perspective camera on every screen size.",
      "Packing lightmap UVs for a whole room so the desk, wall and projector keep enough texture detail.",
      "Keeping a 3D scene light enough to load fast, with a static fallback when WebGL isn't available.",
    ],
    qualityWork: [
      "Keyboard controls, reduced-motion mode, screen-reader announcements and a no-WebGL fallback.",
      "Static pages with metadata, Open Graph images, sitemap and structured data.",
      "Vitest suite for the state machine, navigation, focus wheel and model fallbacks.",
    ],
    technologies: ["Next.js", "TypeScript", "React Three Fiber", "Three.js", "GLSL", "Blender", "GSAP", "Framer Motion", "Zustand", "Web Audio API", "Vitest"],
    results: [
      "A portfolio that works as an experience and as a plain, accessible website.",
      "About 2 MB of baked lighting for a fully lit room, loaded after the first paint.",
    ],
    lessons: ["Baking light buys realism cheaply — the hard part is everything around the 3D: layout, access and loading."],
    architecture: {
      nodes: [
        { id: "ui", label: "Next.js pages", detail: "HTML slides · routes", layer: "client" },
        { id: "r3f", label: "R3F scene", detail: "shader · state machine", layer: "client" },
        { id: "bake", label: "Bake script", detail: "Blender · Cycles", layer: "service" },
        { id: "assets", label: "GLB + atlases", detail: "Draco · WebP", layer: "data" },
        { id: "blend", label: "Blender model", detail: "the study", layer: "external" },
      ],
      edges: [
        { from: "blend", to: "bake", label: "export" },
        { from: "bake", to: "assets", label: "bake" },
        { from: "r3f", to: "assets", label: "load" },
      ],
    },
    images: {
      hero: projectorPortfolio,
      heroAlt: "The portfolio's study: a technical blueprint projected on the wall above the desk and slide projector",
    },
    accent: "#3d4f5c",
    externalUrl: "https://portfolio-ashy-zeta-39.vercel.app",
    externalLabel: "you are here",
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function projectIndex(slug: string): number {
  return projects.findIndex((p) => p.slug === slug);
}

export function isProjectView(value: unknown): value is ProjectView {
  return typeof value === "string" && (PROJECT_VIEWS as string[]).includes(value);
}
