import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectCaseStudy } from "@/components/projection/ProjectCaseStudy";
import { getProject, projectIndex, projects } from "@/lib/project-data";
import { SITE_URL, site } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  return {
    title: `${p.title} — ${p.category}`,
    description: p.summary,
    alternates: { canonical: `/work/${p.slug}` },
    openGraph: { title: `${p.title} · ${site.name}`, description: p.summary, url: `/work/${p.slug}`, type: "article" },
  };
}

export default async function CaseStudyPage({ params }: Params) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const i = projectIndex(slug);
  const prev = projects[(i - 1 + projects.length) % projects.length];
  const next = projects[(i + 1) % projects.length];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": project.externalUrl && !project.confidential ? "SoftwareApplication" : "CreativeWork",
    name: project.title,
    description: project.summary,
    dateCreated: project.year,
    url: `${SITE_URL}/work/${project.slug}`,
    ...(project.externalUrl ? { sameAs: project.externalUrl } : {}),
    ...(project.externalUrl && !project.confidential ? { applicationCategory: project.category } : {}),
    creator: { "@type": "Person", name: site.name, url: SITE_URL },
    keywords: project.technologies.join(", "),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProjectCaseStudy
        project={project}
        index={i}
        total={projects.length}
        prev={{ slug: prev.slug, title: prev.title }}
        next={{ slug: next.slug, title: next.title }}
      />
    </>
  );
}
