import type { Metadata } from "next";
import { SkillsProjection } from "@/components/projection/SkillsProjection";

export const metadata: Metadata = {
  title: "Skills",
  description: "Technical blueprint — frontend, backend, AI and LLM, cloud and DevOps, observability and developer tools.",
  alternates: { canonical: "/skills" },
};

export default function SkillsPage() {
  return <SkillsProjection />;
}
