import type { Metadata } from "next";
import { WorkProjection } from "@/components/projection/WorkProjection";

export const metadata: Metadata = {
  title: "Work",
  description: "Five case studies — ASI1.ai, Fetch.ai Integrations, the Jasper Colin Operations Tool, a Web3 payment gateway and Globacap.",
  alternates: { canonical: "/work" },
};

export default function WorkPage() {
  return <WorkProjection />;
}
