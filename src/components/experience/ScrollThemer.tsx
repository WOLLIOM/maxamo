"use client";

import { useEffect } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { isTheme } from "@/lib/time-of-day";

/**
 * Scroll journey: as the visitor scrolls, the active theme changes per section
 * so they experience every preset. Sections are separated by zero-height
 * `data-scene-theme` markers in document order; the active theme is the last
 * marker whose top has scrolled above an activation line near the top of the
 * viewport. This is edge-safe (the first marker wins at the very top, the last
 * at the very bottom) unlike a middle-band observer.
 *
 * Manual dock picks still work — the next marker you scroll past overrides them.
 */
export function ScrollThemer() {
  const { setScene } = useTheme();

  useEffect(() => {
    const markers = Array.from(
      document.querySelectorAll<HTMLElement>("[data-scene-theme]"),
    );
    if (!markers.length) return;

    let raf = 0;
    let last = "";

    const update = () => {
      raf = 0;
      const line = window.innerHeight * 0.35;
      let active = markers[0].getAttribute("data-scene-theme");
      for (const m of markers) {
        if (m.getBoundingClientRect().top <= line) {
          active = m.getAttribute("data-scene-theme");
        } else {
          break;
        }
      }
      if (active && active !== last && isTheme(active)) {
        last = active;
        setScene(active);
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [setScene]);

  return null;
}
