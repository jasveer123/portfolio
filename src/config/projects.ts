import type { StaticImageData } from "next/image";
import fetchDocs from "@/images/fetch-docs.png";
import integrations from "@/images/integrations.png";
import globacap from "@/images/globacap.png";

export type Project = {
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  /** Real screenshot or a public dummy cover path for confidential work */
  image: StaticImageData | string;
  year: string;
  /** When true, shows a non-product dummy cover (no confidential UI) */
  confidential?: boolean;
};

export const projects: Project[] = [
  {
    title: "Fetch.ai Integrations",
    subtitle: "Developer platform",
    description:
      "Dynamic integrations hub that pulls live data from GitHub, processes it through FastAPI, and presents a responsive Next.js UI—cutting manual docs work and giving the ecosystem real-time visibility.",
    tags: ["Next.js", "FastAPI", "GitHub API", "PostgreSQL"],
    image: integrations,
    year: "2024",
  },
  {
    title: "ASI1.ai",
    subtitle: "Conversational AI",
    description:
      "End-to-end AI platform integrating the ASI LLM with chat UI, memory handling, session management, and backend APIs for a smooth real-time conversational experience.",
    tags: ["Next.js", "LLM", "GenAI", "APIs"],
    image: fetchDocs,
    year: "2024",
  },
  {
    title: "Web3 Payment Gateway",
    subtitle: "Multi-wallet checkout",
    description:
      "Fully functional Web3 payment gateway supporting ERC-20, TRC-20, and multi-chain transfers with MetaMask, TronLink, and Trust Wallet—including signing, wallet state, and balance tracking.",
    tags: ["Web3.js", "MetaMask", "TronLink", "React"],
    image: "/projects/web3-gateway-dummy.png",
    year: "2023",
    confidential: true,
  },
  {
    title: "Jasper Colin Ops Tool",
    subtitle: "Research operations",
    description:
      "Operations and outreach platform for Admins and Research Associates—dashboards, RA workflows, dialer integrations, video consent, RBAC, encryption, masking, and OpenTelemetry tracing.",
    tags: ["Next.js", "Node.js", "MongoDB", "OTEL"],
    image: "/projects/jasper-ops-dummy.png",
    year: "2025",
    confidential: true,
  },
  {
    title: "Globacap",
    subtitle: "Enterprise fintech",
    description:
      "Enterprise frontend modules with pixel-perfect Figma fidelity, complex API integration, and Redux-Saga for scalable state—delivering a stable, high-performance capital markets experience.",
    tags: ["React", "Redux-Saga", "styled-components"],
    image: globacap,
    year: "2023",
  },
];
