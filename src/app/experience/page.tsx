import type { Metadata } from "next";
import { ExperienceProjection } from "@/components/projection/ExperienceProjection";

export const metadata: Metadata = {
  title: "Experience",
  description: "Career timeline — Celebal Technologies, Hashtrust Technologies and Jasper Colin.",
  alternates: { canonical: "/experience" },
};

export default function ExperiencePage() {
  return <ExperienceProjection />;
}
