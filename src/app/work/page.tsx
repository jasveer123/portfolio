import type { Metadata } from "next";
import { WorkProjection } from "@/components/projection/WorkProjection";

export const metadata: Metadata = {
  title: "Work",
  description: "Five projects — ASI1.ai, Fetch.ai Integrations, a Web3 payment gateway, Globacap and this projector portfolio.",
  alternates: { canonical: "/work" },
};

export default function WorkPage() {
  return <WorkProjection />;
}
