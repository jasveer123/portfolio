import type { Metadata } from "next";
import { PlayProjection } from "@/components/projection/PlayProjection";

export const metadata: Metadata = {
  title: "Play",
  description: "Music and photographs — the off-duty slide.",
  alternates: { canonical: "/play" },
};

export default function PlayPage() {
  return <PlayProjection />;
}
