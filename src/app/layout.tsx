import type { Metadata, Viewport } from "next";
import { Caveat, Fraunces, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { ProjectorExperience } from "@/components/experience/ProjectorExperience";
import { SITE_URL, site, yearsOfExperience } from "@/lib/site";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-display-face",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const caveat = Caveat({
  variable: "--font-hand",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const description = `${site.name} — software engineer with ${yearsOfExperience()}+ years building full-stack products, AI and LLM platforms, research technology and fintech. Explore the work through a restored carousel slide projector.`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${site.name} — Software Engineer`,
    template: `%s · ${site.name}`,
  },
  description,
  applicationName: `${site.name} — Portfolio`,
  authors: [{ name: site.name, url: SITE_URL }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — Software Engineer`,
    description,
    url: "/",
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image", title: `${site.name} — Software Engineer`, description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#120e0b",
  colorScheme: "dark",
};

/**
 * Runs before paint: first visits to the home page start with the projector
 * switched off; returning visitors and deep links warm up immediately.
 * Without JavaScript none of this runs and the content is simply visible.
 */
const preload = `(function(){try{var d=document.documentElement;var v=localStorage.getItem("projector:visited")==="1";var home=location.pathname==="/";d.dataset.projector=(v||!home)?"warming":"off";d.dataset.quick="1";d.dataset.boot=(v||!home)?"auto":"off";d.dataset.view=home?"intro":"framed";if(matchMedia("(prefers-reduced-motion: reduce)").matches)d.dataset.reducedMotion="1";}catch(e){}})();`;

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  jobTitle: site.role,
  url: SITE_URL,
  email: `mailto:${site.email}`,
  address: { "@type": "PostalAddress", addressLocality: "Gurugram", addressCountry: "IN" },
  sameAs: [site.social.github, site.social.linkedin],
  alumniOf: { "@type": "CollegeOrUniversity", name: "Guru Nanak Dev Engineering College, Ludhiana" },
  knowsAbout: ["Full-stack development", "Next.js", "React", "Node.js", "LLM integration", "OpenTelemetry", "Web3"],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${fraunces.variable} ${plexSans.variable} ${plexMono.variable} ${caveat.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: preload }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      </head>
      <body>
        <ProjectorExperience>{children}</ProjectorExperience>
      </body>
    </html>
  );
}
