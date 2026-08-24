"use client";

import { motion } from "framer-motion";
import { skillGroups } from "@/config";

export function StackSection() {
  return (
    <section id="stack" className="scroll-mt-24 border-t border-ink/10 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mb-12 max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-signal">
            Tech stack
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Tools I use to ship
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {skillGroups.map((group, index) => (
            <motion.div
              key={group.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="rounded-2xl border border-ink/10 bg-canvas-elevated p-6 sm:p-7"
            >
              <h3 className="font-display text-xl font-semibold text-ink">
                {group.label}
              </h3>
              <div className="mt-5 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-md bg-ink/[0.04] px-3 py-1.5 text-sm text-ink-muted"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
