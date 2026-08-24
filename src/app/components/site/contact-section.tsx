"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { profile } from "@/config";
import { useSectionTheme } from "./theme-provider";

export function ContactSection() {
  useSectionTheme("sage", "contact");

  return (
    <section
      id="contact"
      data-scene="sage"
      className="flex min-h-[max(520px,90svh)] flex-col justify-center px-5 py-24 sm:px-10 lg:px-16"
    >
      <div className="mx-auto w-full max-w-5xl">
        <p className="text-sm uppercase tracking-[0.22em] text-ink-muted">Connect</p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-4 max-w-[12ch] font-display text-[clamp(2.4rem,7vw,5rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-ink"
        >
          Everything you share is an opportunity
        </motion.h2>
        <p className="mt-6 max-w-xl text-lg text-ink-muted">
          Open to product teams who care about craft — research platforms, AI interfaces,
          fintech, or a good playlist swap.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <a
            href={profile.social.email}
            className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-3.5 text-sm font-semibold text-canvas transition-transform hover:-translate-y-0.5"
          >
            {profile.email}
            <ArrowUpRight className="h-4 w-4" />
          </a>
          <a
            href={profile.social.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-ink/20 px-5 py-3.5 text-sm font-medium text-ink"
          >
            LinkedIn
          </a>
          <a
            href={profile.social.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-ink/20 px-5 py-3.5 text-sm font-medium text-ink"
          >
            GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
