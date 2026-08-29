"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { certificates } from "@/lib/site";

const CATEGORY_ORDER = ["3D & Design", "Development", "Data & AI", "Business"] as const;

// Each category gets its own accent so the grid reads at a glance instead
// of being one uniform wall of cards.
const CATEGORY_STYLE: Record<
  (typeof CATEGORY_ORDER)[number],
  { ring: string; dot: string; label: string }
> = {
  "3D & Design": { ring: "hover:border-accent/70", dot: "bg-accent", label: "text-accent" },
  Development: { ring: "hover:border-[#7ee0c3]/70", dot: "bg-[#7ee0c3]", label: "text-[#7ee0c3]" },
  "Data & AI": { ring: "hover:border-[#9fb4ff]/70", dot: "bg-[#9fb4ff]", label: "text-[#9fb4ff]" },
  Business: { ring: "hover:border-[#e0b86a]/70", dot: "bg-[#e0b86a]", label: "text-[#e0b86a]" },
};

// A course whose subject is code gets a monospace / terminal treatment on
// its card, since a serif "C++ Development" title looks odd next to a
// language it's teaching you to write in a fixed-width font.
const MONO_TITLES = new Set([
  "C++ Development: Advanced Concepts, Lambda Expressions, and Best Practices",
  "HTML, CSS, and JavaScript: Building the Web",
  "Getting Started with Python for Finance",
]);

export function Certificates() {
  const [active, setActive] = useState<number | null>(null);
  const activeCert = active !== null ? certificates[active] : null;

  return (
    <section
      id="certificates"
      aria-label="Certificates"
      data-cursor="heart"
      data-section="certificates"
      data-palette="pink"
      className="border-y border-line/60 bg-surface/20 py-16 md:py-20 scroll-mt-24"
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <SectionHeading
          kicker="Always learning"
          title="Certificates"
          lede="Coursework completed across 3D, architecture, code and creative tools. Tap any card to see the certificate."
        />

        <div className="mt-10 flex flex-col gap-10">
          {CATEGORY_ORDER.map((category) => {
            const items = certificates
              .map((c, i) => ({ ...c, i }))
              .filter((c) => c.category === category);
            if (items.length === 0) return null;
            const style = CATEGORY_STYLE[category];

            return (
              <div key={category}>
                <p className={`flex items-center gap-2 text-[0.62rem] uppercase tracking-ultra text-faint`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                  {category}
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map(({ i, ...c }, idx) => (
                    <Reveal key={c.title} delay={idx} className="h-full">
                      <button
                        type="button"
                        onClick={() => setActive(i)}
                        className={`glass flex h-full w-full flex-col gap-2 rounded-2xl border border-line/60 p-5 text-left transition-colors duration-300 ${style.ring}`}
                      >
                        <span
                          className={`text-sm leading-snug text-ink ${
                            MONO_TITLES.has(c.title) ? "font-mono tracking-tight" : "font-medium"
                          }`}
                        >
                          {MONO_TITLES.has(c.title) ? `> ${c.title}` : c.title}
                        </span>
                        <span className="mt-auto flex items-center justify-between text-[0.62rem] uppercase tracking-wider2 text-faint">
                          <span>{c.issuer}</span>
                          <span>{c.date}</span>
                        </span>
                      </button>
                    </Reveal>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail popup -- shows the actual certificate image */}
      <AnimatePresence>
        {activeCert && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-end justify-center p-4 md:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-bg/70 backdrop-blur-md"
              onClick={() => setActive(null)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={activeCert.title}
              initial={{ y: 60, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="glass relative w-full max-w-lg overflow-hidden rounded-3xl p-6 md:p-8"
            >
              <button
                onClick={() => setActive(null)}
                aria-label="Close"
                className="absolute right-5 top-5 z-10 flex h-12 w-12 min-h-12 min-w-12 items-center justify-center rounded-full border border-line bg-bg/70 text-ink backdrop-blur-sm transition-colors hover:text-accent"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
                  <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>

              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-line/60 bg-white">
                <Image
                  src={activeCert.image}
                  alt={`${activeCert.title} certificate`}
                  fill
                  sizes="(max-width: 640px) 100vw, 32rem"
                  className="object-contain"
                />
              </div>

              <span className="kicker mt-5 block">{activeCert.category}</span>
              <h3 className="mt-2 font-serif text-xl text-ink md:text-2xl">
                {activeCert.title}
              </h3>
              <p className="mt-2 text-[0.68rem] uppercase tracking-wider2 text-faint">
                {activeCert.issuer} - {activeCert.date}
              </p>

              <p className="mt-4 text-sm leading-relaxed text-muted">{activeCert.blurb}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
