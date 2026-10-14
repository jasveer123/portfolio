import { renderOgImage, OG_SIZE } from "../../og-image";
import { getProject, projects } from "@/lib/project-data";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Case study by Jasveer Singh";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProject(slug);
  return renderOgImage({
    kicker: `Case study · ${p?.year ?? ""}`,
    title: p?.title ?? "Case study",
    subtitle: p?.category ?? "",
  });
}
