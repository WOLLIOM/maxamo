"use client";

import { Magnetic } from "@/components/ui/Magnetic";

/**
 * Dotted halftone side strip pinned to the actual viewport edge (fixed, not
 * tied to any section's content width), so it never creeps into cards or
 * text no matter how wide the content column gets. Mixes the accent-orange
 * with a warmer gold/yellow so it reads as more than a single flat tint —
 * still clearly "the same family" as the cursor's orange circle, just with
 * a little more color in it. One or two glowing ring "particles" sit in
 * the strip and lean toward the cursor when you get close, echoing the
 * cursor dot itself.
 */
export function HalftonePanel({ side = "left" }: { side?: "left" | "right" }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed top-0 z-[5] hidden h-full w-16 overflow-hidden opacity-70 md:block lg:w-20 ${
        side === "left" ? "left-0" : "right-0"
      }`}
      style={{
        // Bigger, cursor-sized dots on a wider grid.
        backgroundImage:
          "radial-gradient(rgb(var(--c-accent)/0.6) 2.4px, transparent 3px), radial-gradient(rgb(var(--c-gold)/0.6) 2.4px, transparent 3px)",
        backgroundSize: "20px 20px, 20px 20px",
        backgroundPosition: "0 0, 10px 10px",
        // Concentrate the dots into a soft central "vein" patch that hugs the
        // edge and fades out in every direction — no longer a full-height wall.
        maskImage:
          side === "left"
            ? "radial-gradient(130% 42% at 0% 50%, black 0%, black 34%, transparent 72%)"
            : "radial-gradient(130% 42% at 100% 50%, black 0%, black 34%, transparent 72%)",
        WebkitMaskImage:
          side === "left"
            ? "radial-gradient(130% 42% at 0% 50%, black 0%, black 34%, transparent 72%)"
            : "radial-gradient(130% 42% at 100% 50%, black 0%, black 34%, transparent 72%)",
      }}
    >
      {[28, 68].map((topPct, i) => (
        <div
          key={topPct}
          className="pointer-events-auto absolute h-9 w-9"
          style={{
            top: `${topPct}%`,
            [side === "left" ? "left" : "right"]: "22%",
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

