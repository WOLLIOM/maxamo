"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { experiences } from "@/lib/experiences";

/**
 * Formerly a fully walkable 3D restaurant (WASD / joystick, proximity
 * hotspots, orbit + walk modes). Removed for chunk 4 — it was heavy,
 * restaurant-table-specific, and needs real Simon-provided assets (studio
 * scan, guitar model, etc.) before it's worth rebuilding as "walk through
 * my creative world." This is a lighter card-based stand-in that reuses the
 * nice detail-modal pattern from the original. Swap back to a 3D walkthrough
 * later once real 3D assets are ready — see PROMPT/notes for asset needs.
 */
export function Experience() {
  const [selected, setSelected] = useState<number | null>(null);
  const active = selected !== null ? experiences[selected] : null;

  return (
    <section
      id="experience"
      aria-label="Experience"
      className="relative border-y border-line/60 bg-surface/30 py-20 md:py-28"
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <SectionHeading
          kicker="Step inside"
          title="Explore my world"
          lede="A look into the different spaces I create in — music, architecture, games, and code."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {experiences.map((exp, i) => (
            <button
              key={exp.name}
              onClick={() => setSelected(i)}
              className="glass group relative flex flex-col items-start gap-3 overflow-hidden rounded-3xl border border-line/60 p-6 text-left transition-all duration-500 hover:border-accent/60"
            >
              <span className="kicker text-accent">{exp.seat}</span>
              <h3 className="font-serif text-2xl text-ink">{exp.name}</h3>
              <p className="text-sm leading-relaxed text-muted">{exp.summary}</p>
              <span className="mt-2 text-[0.65rem] uppercase tracking-wider2 text-faint transition-colors group-hover:text-accent">
                View details →
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Detail popup */}
      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-end justify-center p-4 md:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-bg/70 backdrop-blur-md"
              onClick={() => setSelected(null)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={active.name}
              initial={{ y: 60, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="glass relative w-full max-w-lg rounded-3xl p-8 md:p-10"
            >
              <button
                onClick={() => setSelected(null)}
                aria-label="Close"
                className="absolute right-5 top-5 flex h-12 w-12 min-h-12 min-w-12 items-center justify-center rounded-full border border-line text-ink transition-colors hover:text-accent"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
                  <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>

              <span className="kicker">{active.seat}</span>
              <h3 className="mt-3 font-serif text-3xl text-ink md:text-4xl">{active.name}</h3>

              <p className="mt-5 text-sm leading-relaxed text-muted">{active.summary}</p>

              <ul className="mt-6 flex flex-col gap-2.5">
                {active.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-3 text-sm text-ink">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                    {h}
                  </li>
                ))}
              </ul>

              <Link
                href="/contact"
                className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-accent px-8 py-4 text-[0.72rem] uppercase tracking-wider2 text-bg transition-all duration-500 hover:brightness-110"
              >
                Get in touch
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
