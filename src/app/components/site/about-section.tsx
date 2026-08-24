"use client";

import { motion } from "framer-motion";
import { education, profile } from "@/config";

export function AboutSection() {
  return (
    <section id="about" className="scroll-mt-24 border-t border-dashed border-ink/15 py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-signal">
            What&apos;s his deal?
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            About me
          </h2>
        </div>

        <div className="space-y-6">
          {profile.about.map((paragraph, index) => (
            <motion.p
              key={paragraph}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="text-lg leading-relaxed text-ink-muted"
            >
              {paragraph}
            </motion.p>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-4 rounded-[1.5rem] border-2 border-dashed border-ink/15 bg-canvas-elevated p-6"
          >
            <p className="text-sm uppercase tracking-[0.16em] text-ink-muted">Education</p>
            <h3 className="mt-3 font-display text-2xl font-semibold text-ink">
              {education.degree}
            </h3>
            <p className="mt-2 text-ink-muted">{education.institution}</p>
            <p className="mt-1 text-sm text-ink-muted">
              {education.period} · {education.gpa}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
