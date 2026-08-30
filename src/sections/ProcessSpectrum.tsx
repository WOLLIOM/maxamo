"use client";

import { useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { AnimatedHeading } from "@/components/ui/AnimatedHeading";
import { ProcessFlowCanvas } from "@/components/ui/ProcessFlowCanvas";

const STEPS = [
  {
    n: "01",
    title: "Foundations",
    desc: "Where it started: learning the fundamentals in AutoCAD, drawing before I could build.",
  },
  {
    n: "02",
    title: "Modeling",
    desc: "Moved into 3D — AutoCAD alongside Blender, learning to actually see and shape things in space.",
  },
  {
    n: "03",
    title: "Engineering",
    desc: "Picked up Revit for real project work, then coding in Python to make the process my own.",
  },
  {
    n: "04",
    title: "Professional",
    desc: "Now doing it for real: professional IT work, built on everything before it.",
  },
];

/** "Explore. Generate. Refine. Scale." — my own path, told the same way. */
export function ProcessSpectrum() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

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
        <ProcessFlowCanvas className="mt-10 md:mt-14" activeStep={activeStep} />
      </Reveal>

      <Reveal delay={3}>
        <div className="mt-8 grid grid-cols-2 gap-4 md:mt-10 md:grid-cols-4 md:gap-6">
          {STEPS.map((s, i) => (
            <div
              key={s.n}
              className="group relative flex flex-col gap-3 border-t border-line/60 pt-4 transition-opacity duration-300"
              style={{
                opacity: activeStep === null || activeStep === i ? 1 : 0.45,
              }}
              onMouseEnter={() => setActiveStep(i)}
              onMouseLeave={() => setActiveStep(null)}
            >
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-xs text-gold">{s.n}</span>
                <span className="text-sm uppercase tracking-wider2 text-ink">
                  {s.title}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
