"use client";

import { motion } from "framer-motion";
import { beliefs } from "@/config";
import { useSectionTheme } from "./theme-provider";

export function BeliefsSection() {
  useSectionTheme("lime", "beliefs");

  return (
    <section
      id="beliefs"
      data-scene="lime"
      className="flex min-h-[max(560px,90svh)] flex-col justify-center px-5 py-24 sm:px-10 lg:px-16"
    >
      <div className="mx-auto w-full max-w-5xl">
        <p className="text-sm uppercase tracking-[0.22em] text-ink-muted">Beliefs</p>
        <h2 className="mt-4 max-w-[12ch] font-display text-[clamp(2.4rem,7vw,5rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-ink">
          Great craft is not enough anymore
        </h2>
        <p className="mt-6 max-w-2xl text-lg text-ink-muted">
          Clarity, moments, and empowerment — the three filters I use before shipping.
        </p>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {beliefs.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
            >
              <p className="font-mono text-xs text-ink/50">0{index + 1}</p>
              <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink">
                {item.title}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">{item.body}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
