"use client";

import { useEffect, useRef, useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";

/**
 * A real, full Geometry Dash engine (physics, level editor, particles, procedural
 * audio) — built by Simon outside this codebase and dropped in as-is at
 * public/geometry-dash.html, rather than rewritten, so its behaviour isn't
 * accidentally changed. This replaces the small FooterDash canvas strip that used
 * to live inside the footer (FooterDash.tsx is left in the codebase, unused, same
 * as FooterTetris before it).
 *
 * Two edits were made to the source file itself (see public/geometry-dash.html):
 *   1. its 4 built-in colour themes now use the SITE's real theme colours (vivid /
 *      mono / blueprint / golden hour) instead of arbitrary purple/cyan/matrix ones.
 *   2. it auto-syncs to whichever theme is currently active on the site (reads
 *      the parent document's data-theme on load, and re-applies on the site's own
 *      "themechange" event) since this loads same-origin via <iframe> — so the
 *      game never looks mismatched against the section around it the way the old
 *      blue-on-orange screenshot did.
 */
export function GeometryDashSection() {
  const boxRef = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), {
      rootMargin: "300px 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="play"
      aria-label="Geometry Dash — a game built for this site"
      data-section="play"
      className="relative mx-auto max-w-[1300px] scroll-mt-24 px-5 py-14 md:px-10 md:py-20"
    >
      <SectionHeading
        kicker="One more thing"
        title="Play Geometry Dash"
        align="center"
        lede="A full game engine, built for this site — physics, a level editor, its own soundtrack. Matches whatever theme you're currently on."
      />
      <div
        ref={boxRef}
        className="relative mx-auto mt-10 aspect-[16/9] w-full max-w-[1100px] overflow-hidden rounded-3xl border border-line/60 bg-black shadow-2xl"
      >
        {near && (
          <iframe
            src="/geometry-dash.html"
            title="Geometry Dash"
            className="absolute inset-0 h-full w-full"
            loading="lazy"
          />
        )}
      </div>
    </section>
  );
}
