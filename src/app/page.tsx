import { SiteNav } from "./components/site/site-nav";
import { HeroSection } from "./components/site/hero-section";
import { BeliefsSection } from "./components/site/beliefs-section";
import { WorkSection } from "./components/site/work-section";
import { ExperienceSection } from "./components/site/experience-section";
import { PlaySection } from "./components/site/play-section";
import { ContactSection } from "./components/site/contact-section";
import { SiteFooter } from "./components/site/site-footer";

export default function Page() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <SiteNav />
      <HeroSection />
      <BeliefsSection />
      <WorkSection />
      <ExperienceSection />
      <PlaySection />
      <ContactSection />
      <SiteFooter />
    </main>
  );
}
