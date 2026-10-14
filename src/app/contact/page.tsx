import type { Metadata } from "next";
import { ContactProjection } from "@/components/projection/ContactProjection";

export const metadata: Metadata = {
  title: "Contact",
  description: "Have an idea worth bringing into focus? Email, LinkedIn, GitHub and résumé.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return <ContactProjection />;
}
