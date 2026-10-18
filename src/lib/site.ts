import { profile } from "@/config/profile";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://jasveersingh.vercel.app").replace(/\/$/, "");

/** First professional role started Aug 2021 (Celebal Technologies). */
const CAREER_START = new Date("2021-08-01T00:00:00Z");

export function yearsOfExperience(now = new Date()): number {
  const years = (now.getTime() - CAREER_START.getTime()) / (365.25 * 24 * 3600 * 1000);
  return Math.floor(years * 2) / 2; // nearest half year, rounded down
}

export const site = {
  ...profile,
  // the résumé text predates the current year count
  summary: profile.summary.replace("4.5+", `${yearsOfExperience()}+`),
  statement: "I turn complex systems into clear, fast and thoughtful products.",
  focusAreas: [
    "Full-stack development",
    "AI and LLM products",
    "Scalable systems",
    "Research technology",
    "Fintech and Web3",
  ],
  currentFocus:
    "Leading frontend delivery on a research platform at Jasper Colin — multi-portal workflows, AI-powered features and OpenTelemetry observability.",
} as const;
