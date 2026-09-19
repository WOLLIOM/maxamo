"use client";

import { useEffect, useRef, useState } from "react";
import { useAnimationFrame } from "framer-motion";
import { useDeviceTiltRef } from "@/lib/useDeviceTilt";
import { isTouchDevice } from "@/lib/device";

const SIZE = 92; // px edge length of the cube

/**
 * A real 3D box (six-faced CSS-3D cube) that FALLS in from the top once the
 * visitor scrolls past the hero, then floats across the screen following the
 * phone's tilt (tilt left → it travels left, tilt right → right) while
 * tumbling. It's a physical-feeling object, not a corner logo:
 *  - travels nearly the full screen width (not pinned to a corner)
 *  - thin edges + translucent faces so it never hides text
 *  - pointer-events:none, touch-only, static under reduced-motion
 *
 * Simon's brief: "the box floats in 3D, falls as I scroll from the hero, and
 * goes left/right as I move my phone — not a logo in the corner."
 */
export function GyroBadge() {
  const boxRef = useRef<HTMLDivElement>(null);
  const cubeRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const tilt = useDeviceTiltRef(enabled);
  // smoothed physics state so motion feels weighty, not twitchy
  const pos = useRef({ x: 0, y: 0, rx: -24, ry: 32, fall: 0 });
  const spin = useRef(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!isTouchDevice() || reduce) return;
    setEnabled(true);
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useAnimationFrame((_, delta) => {
    if (!enabled || !boxRef.current || !cubeRef.current) return;
    const p = pos.current;
    const dt = Math.min(delta / 16.7, 3);
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // where the box WANTS to be: x follows tilt across ~85% of the width,
    // y hangs around 62% down the screen and sways a touch with front/back tilt
    const tx = Math.max(-1, Math.min(1, tilt.current.y)) * (vw / 2 - SIZE * 0.7);
    const ty = Math.max(-1, Math.min(1, tilt.current.x)) * 46;
    // "fall": eases from -height (above screen) to 0 when it becomes visible
    const fallTarget = visible ? 0 : -(vh * 0.7);

    const k = 1 - Math.pow(0.9, dt); // frame-rate independent easing
    p.x += (tx - p.x) * k * 0.55;
    p.y += (ty - p.y) * k * 0.55;
    p.fall += (fallTarget - p.fall) * (1 - Math.pow(0.93, dt));

    // tumble: slow constant spin + extra rotation in the direction of travel
    spin.current += 0.35 * dt;
    const ry = spin.current + (p.x / vw) * 260;
    const rx = -24 + Math.sin(spin.current * 0.02) * 18 - tilt.current.x * 40;

    boxRef.current.style.transform = `translate3d(${p.x}px, ${p.y + p.fall}px, 0)`;
    cubeRef.current.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
  });

  if (!enabled) return null;

  const half = SIZE / 2;
  const face =
    "absolute inset-0 border border-accent/70 bg-accent/[0.06] backdrop-blur-[0.5px]";
  return (
    <div
      aria-hidden
      // centered horizontally, hanging ~62% down; JS supplies the travel.
      className="pointer-events-none fixed left-1/2 top-[58%] z-30 md:hidden"
      style={{
        marginLeft: -half,
        opacity: visible ? 0.9 : 0,
        transition: "opacity .5s ease",
        perspective: "600px",
      }}
    >
      <div ref={boxRef} style={{ willChange: "transform" }}>
        <div
          ref={cubeRef}
          style={{
            width: SIZE,
            height: SIZE,
            transformStyle: "preserve-3d",
            willChange: "transform",
          }}
          className="relative"
        >
          <div className={face} style={{ transform: `translateZ(${half}px)` }} />
          <div className={face} style={{ transform: `rotateY(180deg) translateZ(${half}px)` }} />
          <div className={face} style={{ transform: `rotateY(90deg) translateZ(${half}px)` }} />
          <div className={face} style={{ transform: `rotateY(-90deg) translateZ(${half}px)` }} />
          <div className={face} style={{ transform: `rotateX(90deg) translateZ(${half}px)` }} />
          <div className={face} style={{ transform: `rotateX(-90deg) translateZ(${half}px)` }} />
          {/* bright core so it reads as a lit object, not just a frame */}
          <div
            className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent"
            style={{ boxShadow: "0 0 18px 4px rgb(var(--c-accent) / 0.55)" }}
          />
        </div>
      </div>
    </div>
  );
}
