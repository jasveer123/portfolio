import type { MetadataRoute } from "next";
import { projects } from "@/lib/project-data";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages = ["", "/work", "/experience", "/skills", "/play", "/contact"].map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: p === "" ? 1 : p === "/work" ? 0.9 : 0.6,
  }));
  return [
    ...pages,
    ...projects.map((p) => ({ url: `${SITE_URL}/work/${p.slug}`, lastModified: now, changeFrequency: "yearly" as const, priority: 0.8 })),
  ];
}
