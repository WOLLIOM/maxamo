"use client";

import { useEffect, useRef, useState } from "react";
import { PixelSmiley } from "@/components/ui/PixelSmiley";

/**
 * A small custom cursor: a dot that eases toward the pointer with a bit of
 * lag, and a text label that pulls in when hovering anything with a
 * `data-cursor-label` attribute. The blob also morphs into a pixel smiley
 * when hovering anything flagged with `data-cursor-mood`. Disabled
 * automatically on touch devices.
 *
 * The headline-pointing arrow used to live here as a plain SVG — it's now
 * handled by <PixelCursorField />, which draws it (and the click effect) as
 * a dot-grid heat trail instead.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const smileyRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [hoveringLink, setHoveringLink] = useState(false);
  const [mood, setMood] = useState<"happy" | "sad" | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const isTouch =
      window.matchMedia("(pointer: coarse)").matches ||
      "ontouchstart" in window;
    if (isTouch) return;
    setEnabled(true);

    let mx = -100;
    let my = -100;
    let rx = -100;
    let ry = -100;

    function onMove(e: PointerEvent) {
      mx = e.clientX;
      my = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      }
      if (smileyRef.current) {
        smileyRef.current.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
      }
      const el = document.elementFromPoint(mx, my) as HTMLElement | null;
      const moodTarget = el?.closest<HTMLElement>("[data-cursor-mood]");
      if (moodTarget) {
        setMood(moodTarget.getAttribute("data-cursor-mood") as "happy" | "sad");
      } else {
        setMood(null);
      }
      const target = el?.closest<HTMLElement>(
        "a, button, [data-cursor-label], [role='button']"
      );
      if (target) {
        setHoveringLink(true);
        setLabel(target.getAttribute("data-cursor-label"));
      } else {
        setHoveringLink(false);
        setLabel(null);
      }
    }

    let raf = 0;
    function tick() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(tick);
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    document.documentElement.classList.add("has-custom-cursor");

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      {/* small solid dot, glued exactly to the pointer — hidden while morphed into a smiley */}
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[10000] h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent transition-opacity duration-200"
        style={{ opacity: mood ? 0 : 1 }}
      />

      {/* the blob "gets pulled into" the smiley shape when hovering one */}
      <div
        ref={smileyRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[10001] h-14 w-14 transition-opacity duration-200"
        style={{ opacity: mood ? 1 : 0 }}
      >
        {mood ? (
          <PixelSmiley
            mood={mood}
            className="h-full w-full drop-shadow-[0_4px_14px_rgba(0,0,0,0.4)]"
          />
        ) : null}
      </div>

      {/* lagging ring / arrow + label, eases toward the pointer */}
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] flex items-center gap-2 transition-[opacity] duration-200"
        style={{ opacity: hoveringLink && !mood ? 1 : 0 }}
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="-translate-x-1 -translate-y-1 text-gold drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]"
          style={{
            transform: `rotate(${hoveringLink ? -45 : 0}deg)`,
            transition: "transform .25s ease",
          }}
        >
          <path d="M7 17 17 7" />
          <path d="M8 7h9v9" />
        </svg>
        {label ? (
          <span className="whitespace-nowrap rounded-full border border-line/60 bg-surface/90 px-3 py-1 text-[0.68rem] uppercase tracking-wider2 text-ink shadow-lg backdrop-blur-sm">
            {label}
          </span>
        ) : null}
      </div>
    </>
  );
}
