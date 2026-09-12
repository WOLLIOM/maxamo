"use client";

import { useEffect, useState } from "react";

/**
 * Dotted halftone side strip. Rendered ABSOLUTE inside <main> (full document
 * height) so it scrolls with the content instead of staying pinned to the
 * viewport. Dots are densest at the edge and dissolve inward in an irregular,
 * scattered pattern (a linear density fade intersected with turbulence noise),
 * tinted with the active theme's accent + gold. Desktop only.
 */

// High-contrast turbulence, used as a mask so the dots scatter rather than
// fade uniformly — gives the "coming from the side, breaking apart" look and
// natural denser/sparser patches down the length of the page.
const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='2' seed='7'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 4 -1.4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export function HalftonePanel({ side = "left" }: { side?: "left" | "right" }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Desktop only — skip the decoration (and its work) on touch devices.
    const desktop = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    setShow(desktop);
  }, []);

  if (!show) return null;

  const fade =
    side === "left"
      ? "linear-gradient(to right, black 0%, black 8%, transparent 70%)"
      : "linear-gradient(to left, black 0%, black 8%, transparent 70%)";

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute top-0 z-[20] hidden h-full w-16 overflow-hidden opacity-70 md:block lg:w-24 ${
        side === "left" ? "left-0" : "right-0"
      }`}
      style={{
        backgroundImage:
          "radial-gradient(rgb(var(--c-accent)/0.9) 2.8px, transparent 3.4px), radial-gradient(rgb(var(--c-gold)/0.7) 2.2px, transparent 3px)",
        backgroundSize: "14px 14px, 14px 14px",
        backgroundPosition: "0 0, 7px 7px",
        maskImage: `${fade}, ${NOISE}`,
        maskSize: "100% 100%, 150px 150px",
        maskRepeat: "no-repeat, repeat",
        maskComposite: "intersect",
        WebkitMaskImage: `${fade}, ${NOISE}`,
        WebkitMaskSize: "100% 100%, 150px 150px",
        WebkitMaskRepeat: "no-repeat, repeat",
        WebkitMaskComposite: "source-in",
      }}
    />
  );
}
