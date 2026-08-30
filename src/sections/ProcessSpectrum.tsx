"use client";

import { Reveal } from "@/components/ui/Reveal";
import { AnimatedHeading } from "@/components/ui/AnimatedHeading";

const SPLIT = [
  { label: "Exploring", value: 60 },
  { label: "Building", value: 20 },
  { label: "Refining", value: 20 },
];

/** "Explore. Generate. Refine. Scale." — how the work actually breaks down. */
export function ProcessSpectrum() {
  return (
    <section
      aria-label="How the work breaks down"
      className="relative mx-auto max-w-[1400px] px-5 py-24 scroll-mt-24 md:px-10 md:py-36"
    >
      <div className="relative">
        <svg
          width="34"
          height="34"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className="absolute -left-2 -top-8 -rotate-45 text-accent md:-left-10 md:-top-4"
        >
          <path d="M7 17 17 7" />
          <path d="M8 7h9v9" />
        </svg>

        <AnimatedHeading
          text="Explore. Generate. Refine. Scale."
          className="text-fluid-h2 leading-[1.05] text-ink"
        />
      </div>

      <Reveal delay={1}>
        <p className="mt-8 max-w-xl text-base leading-relaxed text-muted md:text-lg">
          The machine makes the options, we make the calls. In practice that
          works out to roughly 60 percent exploring, 20 building, 20
          refining.
        </p>
      </Reveal>

      <Reveal delay={2}>
        <div className="mt-12 flex max-w-xl overflow-hidden rounded-full border border-line/60">
          {SPLIT.map((s, i) => (
            <div
              key={s.label}
              className="group relative flex h-12 items-center justify-center text-[0.65rem] uppercase tracking-wider2"
              style={{
                width: `${s.value}%`,
                background:
                  i === 0
                    ? "rgb(var(--c-accent))"
                    : i === 1
                      ? "rgb(var(--c-gold))"
                      : "rgb(var(--c-silver))",
                color: "rgb(var(--c-bg))",
              }}
              title={`${s.label} — ${s.value}%`}
            >
              <span className="hidden sm:inline">{s.label}</span>
              <span className="sm:hidden">{s.value}%</span>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
