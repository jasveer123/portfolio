import type { StaticImageData } from "next/image";
import { experiences as configExperiences } from "@/config/experiences";
import { education } from "@/config/tech-stack";
import celebalLogo from "@/images/celebal.png";
import hashtrustLogo from "@/images/hashtrust.png";
import bpa from "@/images/bpa.png";

export type ExperienceFrame = {
  slug: string;
  company: string;
  role: string;
  period: string;
  startYear: string;
  location: string;
  companyUrl?: string;
  responsibilities: string[];
  products: string[];
  technologies: string[];
  impact: string[];
  logo?: StaticImageData;
  still?: { src: StaticImageData; alt: string };
  /** Muted film tint for the frame */
  tint: string;
};

type FrameExtras = Pick<ExperienceFrame, "startYear" | "products" | "impact" | "logo" | "still" | "tint">;

const extras: Record<string, FrameExtras> = {
  "Celebal Technologies": {
    startYear: "2021",
    products: ["BPA Cognitive Search bot", "Chatbot applications on Microsoft Bot Framework"],
    impact: ["Conversational flows and Adaptive Cards delivered to client specifications."],
    logo: celebalLogo,
    still: { src: bpa, alt: "BPA Cognitive Search chatbot answering a compliance documents query in Microsoft Teams" },
    tint: "#6E7B4E",
  },
  "Hashtrust Technologies": {
    startYear: "2022",
    products: ["Fetch.ai website & docs", "ASI1.ai", "Fetch.ai Integrations", "Globacap", "Connect Wallet (Web3 gateway)"],
    impact: [
      "Moved Fetch.ai documentation APIs from client to server side — about 30% faster.",
      "Shipped ASI1.ai, a full conversational AI application on the ASI LLM.",
    ],
    logo: hashtrustLogo,
    tint: "#B9823A",
  },
  "Jasper Colin": {
    startYear: "2025",
    products: ["Research platform UI", "Portal redesign", "Internal operations tool", "OpenTelemetry package"],
    impact: [
      "Led a portal redesign with AI-powered features within a 3-month deadline.",
      "Centralised frontend logging, metrics and tracing across services.",
    ],
    tint: "#A9573A",
  },
};

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/** Chronological (oldest first) — the filmstrip reads left to right. */
export const experienceFrames: ExperienceFrame[] = [...configExperiences].reverse().map((e) => ({
  slug: slugify(e.company),
  company: e.company,
  role: e.role,
  period: e.period,
  location: e.location,
  companyUrl: e.companyUrl,
  responsibilities: e.highlights,
  technologies: e.technologies,
  ...extras[e.company],
}));

export const latestExperienceSlug = experienceFrames[experienceFrames.length - 1].slug;

export function experienceIndex(slug: string | null | undefined): number {
  const i = experienceFrames.findIndex((f) => f.slug === slug);
  return i === -1 ? experienceFrames.length - 1 : i;
}

export { education };
