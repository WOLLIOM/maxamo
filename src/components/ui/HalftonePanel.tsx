"use client";

import { Magnetic } from "@/components/ui/Magnetic";

/**
 * Dotted halftone side strip pinned to the viewport edge. Dots are densest
 * right at the edge and dissolve inward in an irregular, scattered pattern
 * (a linear density fade intersected with turbulence noise), tinted with the
 * active theme's accent + gold. One or two glowing ring "particles" sit in
 * the strip and lean toward the cursor. Desktop only (mounted behind a
 * touch check in ExperienceShell).
 */

// High-contrast turbulence, used as a mask so the dots scatter rather than
// fade uniformly — gives the "coming from the side, breaking apart" look.
const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='2' seed='7'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 4 -1.4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export function HalftonePanel({ side = "left" }: { side?: "left" | "right" }) {
  const fade =
    side === "left"
      ? "linear-gradient(to right, black 0%, black 10%, transparent 72%)"
      : "linear-gradient(to left, black 0%, black 10%, transparent 72%)";

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed top-0 z-[5] hidden h-full w-24 overflow-hidden opacity-75 md:block lg:w-32 ${
        side === "left" ? "left-0" : "right-0"
      }`}
      style={{
        backgroundImage:
          "radial-gradient(rgb(var(--c-accent)/0.9) 2.8px, transparent 3.4px), radial-gradient(rgb(var(--c-gold)/0.7) 2.2px, transparent 3px)",
        backgroundSize: "14px 14px, 14px 14px",
        backgroundPosition: "0 0, 7px 7px",
        // Two mask layers combined with intersect: only where the edge-fade AND
        // the noise are both bright do dots show → dense edge, scattered inward.
        maskImage: `${fade}, ${NOISE}`,
        maskSize: "100% 100%, 150px 150px",
        maskRepeat: "no-repeat, repeat",
        maskComposite: "intersect",
        WebkitMaskImage: `${fade}, ${NOISE}`,
        WebkitMaskSize: "100% 100%, 150px 150px",
        WebkitMaskRepeat: "no-repeat, repeat",
        WebkitMaskComposite: "source-in",
      }}
    >
      {[24, 72].map((topPct, i) => (
        <div
          key={topPct}
          className="pointer-events-auto absolute h-9 w-9"
          style={{
            top: `${topPct}%`,
            [side === "left" ? "left" : "right"]: "16%",
          }}
        >
          <Magnetic strength={0.6}>
            <div
              className="h-9 w-9 rounded-full border transition-all duration-300"
              style={{
                borderColor: i === 0 ? "rgb(var(--c-accent)/0.75)" : "rgb(var(--c-gold)/0.8)",
                boxShadow:
                  i === 0
                    ? "0 0 16px rgb(var(--c-accent)/0.45)"
                    : "0 0 16px rgb(var(--c-gold)/0.5)",
              }}
            />
          </Magnetic>
        </div>
      ))}
    </div>
  );
}
