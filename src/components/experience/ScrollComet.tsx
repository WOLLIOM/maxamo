"use client";

import { useEffect, useRef } from "react";

/**
 * A small gold "comet" — nodding to a sax line trailing off — that streaks
 * across the screen while scrolling down. It travels left→right (and back
 * on scroll up), and the slower you scroll, the further/lower it drifts —
 * "give it a vibe" on scroll instead of a static page.
 */
export function ScrollComet() {
  const dotRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let lastY = window.scrollY;
    let lastT = performance.now();
    let velocity = 0; // px/ms, signed
    let x = 0; // 0..1 across the screen
    let visible = 0; // opacity, eased
    let raf = 0;

    function onScroll() {
      const y = window.scrollY;
      const now = performance.now();
      const dt = Math.max(1, now - lastT);
      velocity = (y - lastY) / dt;
      lastY = y;
      lastT = now;
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    function frame() {
      const speed = Math.min(1, Math.abs(velocity) * 6); // 0..1 intensity
      const dir = velocity >= 0 ? 1 : -1;

      // Comet drifts across based on scroll direction/speed, slowly resets.
      x += dir * speed * 0.012;
      if (x > 1.15) x = -0.15;
      if (x < -0.15) x = 1.15;

      visible += ((speed > 0.02 ? 1 : 0) - visible) * 0.08;

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const px = x * vw;
      // Slower scroll = the comet sits lower/heavier; faster = higher, brighter.
      const py = vh * (0.18 + (1 - speed) * 0.22);

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${px}px, ${py}px, 0) scale(${
          0.6 + speed * 0.8
        })`;
        dotRef.current.style.opacity = String(visible * (0.35 + speed * 0.65));
      }
      if (trailRef.current) {
        trailRef.current.style.transform = `translate3d(${px}px, ${py}px, 0) scaleX(${
          dir * (0.5 + speed)
        })`;
        trailRef.current.style.opacity = String(visible * speed * 0.6);
      }

      // Ease velocity back to 0 between scroll events so it doesn't freeze mid-value.
      velocity *= 0.9;

      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[9997] hidden overflow-hidden md:block"
    >
      <div
        ref={trailRef}
        className="absolute left-0 top-0 h-[2px] w-24 -translate-y-1/2 rounded-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgb(var(--c-gold)/0.8), transparent)",
          opacity: 0,
          filter: "blur(1px)",
        }}
      />
      <div
        ref={dotRef}
        className="absolute left-0 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: "radial-gradient(circle, #f0d8c4, #c4a260 60%, transparent 100%)",
          boxShadow: "0 0 14px 4px rgba(196,162,96,0.65), 0 0 26px 10px rgba(168,32,38,0.25)",
          opacity: 0,
        }}
      />
    </div>
  );
}
