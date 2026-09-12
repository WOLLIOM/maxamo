"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Dotted halftone side strip, absolute inside <main> so it scrolls with the
 * content. Two things make it feel alive:
 *  1. it only appears in some vertical stretches (a banded mask leaves gaps),
 *     so it reads as "some sections have it, some don't" rather than a solid rail.
 *  2. a vivid-coloured layer lights up the dots right around the cursor — hover
 *     over the strip and the dots near your pointer glow purple/cyan, even in
 *     the monochrome sections.
 * Desktop only.
 */

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='2' seed='7'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 4 -1.4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export function HalftonePanel({ side = "left" }: { side?: "left" | "right" }) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef(0);

  useEffect(() => {
    const desktop = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    setShow(desktop);
    if (!desktop) return;

    const onMove = (e: PointerEvent) => {
      if (raf.current) return;
      raf.current = requestAnimationFrame(() => {
        raf.current = 0;
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--hx", `${e.clientX - r.left}px`);
        el.style.setProperty("--hy", `${e.clientY - r.top}px`);
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  if (!show) return null;

  const fade =
    side === "left"
      ? "linear-gradient(to right, black 0%, black 8%, transparent 70%)"
      : "linear-gradient(to left, black 0%, black 8%, transparent 70%)";
  // Vertical on/off bands so the strip appears in stretches, not the whole side.
  const bands =
    "linear-gradient(to bottom, transparent 0 6%, black 12% 34%, transparent 42% 60%, black 66% 88%, transparent 95% 100%)";

  return (
    <div
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute top-0 z-[20] hidden h-full w-16 overflow-hidden opacity-75 md:block lg:w-24 ${
        side === "left" ? "left-0" : "right-0"
      }`}
      style={{
        maskImage: `${fade}, ${NOISE}, ${bands}`,
        maskSize: "100% 100%, 150px 150px, 100% 2200px",
        maskRepeat: "no-repeat, repeat, repeat",
        maskComposite: "intersect",
        WebkitMaskImage: `${fade}, ${NOISE}, ${bands}`,
        WebkitMaskSize: "100% 100%, 150px 150px, 100% 2200px",
        WebkitMaskRepeat: "no-repeat, repeat, repeat",
        WebkitMaskComposite: "source-in",
      }}
    >
      {/* base dots — theme accent + gold */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(rgb(var(--c-accent)/0.9) 2.8px, transparent 3.4px), radial-gradient(rgb(var(--c-gold)/0.7) 2.2px, transparent 3px)",
          backgroundSize: "14px 14px, 14px 14px",
          backgroundPosition: "0 0, 7px 7px",
        }}
      />
      {/* vivid hot dots, revealed only around the cursor */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(#8b5cf6 3px, transparent 3.6px), radial-gradient(#22d3ee 2.4px, transparent 3px)",
          backgroundSize: "14px 14px, 14px 14px",
          backgroundPosition: "0 0, 7px 7px",
          maskImage:
            "radial-gradient(circle 90px at var(--hx, -999px) var(--hy, -999px), black 0%, black 45%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(circle 90px at var(--hx, -999px) var(--hy, -999px), black 0%, black 45%, transparent 75%)",
        }}
      />
    </div>
  );
}
