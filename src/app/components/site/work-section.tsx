"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { projects } from "@/config";
import { useSectionTheme } from "./theme-provider";

export function WorkSection() {
  useSectionTheme("clay", "work");

  return (
    <section
      id="work"
      data-scene="clay"
      className="flex min-h-[max(560px,100svh)] flex-col justify-center px-5 py-24 sm:px-10 lg:px-16"
    >
      <div className="mx-auto w-full max-w-5xl">
        <p className="text-sm uppercase tracking-[0.22em] text-ink-muted">Work</p>
        <h2 className="mt-4 max-w-[11ch] font-display text-[clamp(2.4rem,7vw,5rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-ink">
          Products shipped end-to-end
        </h2>
        <p className="mt-6 max-w-xl text-lg text-ink-muted">
          AI platforms, research ops, fintech modules, and Web3 payments.
        </p>

        <div className="mt-14 space-y-5">
          {projects.map((project, index) => (
            <motion.article
              key={project.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: index * 0.04 }}
              className="group grid overflow-hidden rounded-2xl border border-ink/15 bg-canvas-elevated/70 lg:grid-cols-[1.05fr_0.95fr]"
            >
              <div className="flex flex-col justify-between p-6 sm:p-8">
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-medium text-ink/70">{project.subtitle}</p>
                    <p className="font-mono text-xs text-ink-muted">{project.year}</p>
                  </div>
                  <h3 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">
                    {project.title}
                  </h3>
                  <p className="mt-4 max-w-xl leading-relaxed text-ink-muted">
                    {project.description}
                  </p>
                </div>
                <div className="mt-8 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md border border-ink/15 px-2.5 py-1 text-xs text-ink-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="relative min-h-[220px] overflow-hidden lg:min-h-full">
                <Image
                  src={project.image}
                  alt={
                    project.confidential
                      ? `${project.title} — dummy preview`
                      : project.title
                  }
                  fill
                  unoptimized={typeof project.image === "string"}
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                />
                {project.confidential && (
                  <div className="absolute left-4 top-4 rounded-md bg-ink/75 px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] text-canvas">
                    Confidential · dummy cover
                  </div>
                )}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
