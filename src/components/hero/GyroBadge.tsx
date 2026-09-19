"use client";

import { useEffect, useRef, useState } from "react";
import { useAnimationFrame } from "framer-motion";
import { useDeviceTiltRef } from "@/lib/useDeviceTilt";
import { isTouchDevice } from "@/lib/device";

/**
 * A small wireframe cube that "drops in" once the visitor scrolls past the
 * hero, pins to the bottom-left corner, and slides / rotates with the phone's
 * gyro (tilt left → it drifts left). Touch-only, pointer-events:none so it
 * never blocks taps or reading; fully static under reduced-motion. It's a
 * quiet "spatial instrument" marker that keeps the 3D feel alive after the
 * hero scene scrolls away.
 */
export function GyroBadge() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cubeRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false); // touch + not reduced-motion
  const [visible, setVisible] = useState(false); // scrolled past the hero
  const touch = useRef(false);
  const tilt = useDeviceTiltRef(enabled);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    touch.current = isTouchDevice();
    if (!touch.current || reduce) return;
    setEnabled(true);

    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Slide toward the tilt direction (tilt.y = left/right, tilt.x = front/back)
  // and rotate the cube a little so it reads as a 3D object catching the light.
  useAnimationFrame(() => {
    if (!enabled || !cubeRef.current) return;
    const tx = Math.max(-1, Math.min(1, tilt.current.y)) * 26; // horizontal drift
    const ty = Math.max(-1, Math.min(1, tilt.current.x)) * 18; // vertical drift
    const ry = tilt.current.y * 34; // yaw
    const rx = -tilt.current.x * 26; // pitch
    cubeRef.current.style.transform = `translate3d(${tx}px, ${ty}px, 0) rotateX(${rx}deg) rotateY(${ry}deg)`;
  });

  if (!enabled) return null;

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className="pointer-events-none fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-4 z-40 md:hidden"
      style={{
        perspective: "420px",
        opacity: visible ? 0.85 : 0,
        transform: visible ? "translateY(0)" : "translateY(-28px)",
        transition: "opacity .6s ease, transform .7s cubic-bezier(.22,1,.36,1)",
      }}
    >
      {/* faint drafting label under the cube */}
      <div
        ref={cubeRef}
        style={{ transformStyle: "preserve-3d", willChange: "transform" }}
        className="relative h-16 w-16"
      >
        <WireCube />
      </div>
      <span className="mt-1 block font-mono text-[0.5rem] uppercase tracking-[0.25em] text-accent/70">
        tilt · 3D
      </span>
    </div>
  );
}

/** Isometric wireframe cube in the theme accent — SVG, crisp at any size. */
function WireCube() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
      <g
        fill="none"
        stroke="rgb(var(--c-accent))"
        strokeWidth="1.4"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity="0.9"
      >
        {/* back face */}
        <path d="M32 22 L74 22 L74 64 L32 64 Z" opacity="0.4" />
        {/* front face */}
        <path d="M26 36 L68 36 L68 78 L26 78 Z" />
        {/* connectors */}
        <line x1="32" y1="22" x2="26" y2="36" />
        <line x1="74" y1="22" x2="68" y2="36" />
        <line x1="74" y1="64" x2="68" y2="78" />
        <line x1="32" y1="64" x2="26" y2="78" />
      </g>
      {/* accent node at the front corner */}
      <circle cx="26" cy="36" r="2.4" fill="rgb(var(--c-accent))" />
    </svg>
  );
}
