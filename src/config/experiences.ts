export type Experience = {
  company: string;
  role: string;
  period: string;
  location: string;
  companyUrl?: string;
  highlights: string[];
  technologies: string[];
};

export const experiences: Experience[] = [
  {
    company: "Jasper Colin",
    role: "Frontend Engineer",
    period: "May 2025 – Present",
    location: "Onsite · Gurugram",
    highlights: [
      "Built enterprise-grade UI for multiple research studies on the Top Brass platform with Next.js.",
      "Led a 3-month client-portal redesign across four study workflows, shipping AI-powered features and modernized journeys.",
      "Coordinated frontend delivery across Audience, Expert, Vendor, and Admin portals through UAT.",
      "Stabilized multi-vendor study integrations and SIT environments for release readiness.",
      "Built a custom OpenTelemetry package with Grafana and Jaeger for centralized frontend logging, metrics, and tracing.",
      "Shipped an Operations Tool for Admins and Research Associates with dashboards, dialer/Teams integrations, video consent, and RBAC.",
      "Implemented scalable Node.js/Express/MongoDB APIs with encryption, data masking, and audit logging.",
    ],
    technologies: [
      "Next.js",
      "TypeScript",
      "Node.js",
      "Express",
      "MongoDB",
      "OpenTelemetry",
      "Grafana",
      "Jaeger",
    ],
  },
  {
    company: "Hashtrust Technologies",
    role: "Software Engineer",
    period: "July 2022 – April 2025",
    location: "Hybrid · Gurugram",
    companyUrl: "https://hashtrust.com",
    highlights: [
      "Fetch.ai — built responsive marketing and documentation sites with Next.js and Nextra; migrated APIs server-side for ~30% faster loads.",
      "ASI1.ai — delivered an end-to-end conversational AI platform integrating the ASI LLM with session, memory, and chat UX.",
      "Integrations platform — dynamically pulled GitHub integration data via FastAPI/PostgreSQL for real-time ecosystem visibility.",
      "Globacap — pixel-perfect React + styled-components fintech modules with Redux-Saga and complex API flows.",
      "Connect Wallet — Web3 payment gateway with MetaMask, TronLink, and Trust Wallet across ERC-20/TRC-20 networks.",
    ],
    technologies: [
      "Next.js",
      "React",
      "FastAPI",
      "PostgreSQL",
      "Web3.js",
      "Redux-Saga",
      "styled-components",
      "Nextra",
    ],
  },
  {
    company: "Celebal Technologies",
    role: "Associate Software Developer",
    period: "Aug 2021 – Mar 2022",
    location: "Remote · Jaipur",
    companyUrl: "https://celebaltech.com",
    highlights: [
      "Built chatbot applications with Node.js and Microsoft Bot Framework.",
      "Designed conversational flows for BPA Cognitive Search with Adaptive Cards and REST APIs.",
    ],
    technologies: ["Node.js", "Microsoft Bot Framework", "Express", "Adaptive Cards"],
  },
];
