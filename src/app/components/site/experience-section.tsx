"use client";

import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { experiences } from "@/config";
import { useSectionTheme } from "./theme-provider";

export function ExperienceSection() {
  useSectionTheme("ink", "experience");

  return (
    <section
      id="experience"
      data-scene="ink"
      className="flex min-h-[max(560px,100svh)] flex-col justify-center px-5 py-24 sm:px-10 lg:px-16"
    >
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-14 max-w-2xl">
          <p className="text-sm uppercase tracking-[0.22em] text-ink-muted">Path</p>
          <h2 className="mt-4 font-display text-[clamp(2.4rem,7vw,5rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-ink">
            Where I&apos;ve built impact
          </h2>
        </div>

        <div>
          {experiences.map((exp, index) => (
            <motion.article
              key={`${exp.company}-${exp.period}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
              className="grid gap-6 border-t border-ink/20 py-10 lg:grid-cols-[260px_1fr]"
            >
              <div>
                <p className="font-mono text-xs text-ink-muted">{exp.period}</p>
                <h3 className="mt-3 flex items-center gap-2 font-display text-2xl font-semibold tracking-tight text-ink">
                  {exp.company}
                  {exp.companyUrl && (
                    <a
                      href={exp.companyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ink-muted transition-colors hover:text-signal"
                      aria-label={`${exp.company} website`}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </h3>
                <p className="mt-1 text-sm text-signal">{exp.role}</p>
                <p className="mt-2 text-sm text-ink-muted">{exp.location}</p>
              </div>

              <div>
                <ul className="space-y-3">
                  {exp.highlights.map((item) => (
                    <li
                      key={item}
                      className="relative pl-4 text-[15px] leading-relaxed text-ink-muted before:absolute before:left-0 before:top-[0.65em] before:h-1 before:w-1 before:bg-signal"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-wrap gap-2">
                  {exp.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-md border border-ink/20 px-2.5 py-1 text-xs text-ink-muted"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
