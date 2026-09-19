"use client";

import { useEffect, useRef, useState } from "react";
import { useAnimationFrame } from "framer-motion";
import { useDeviceTiltRef } from "@/lib/useDeviceTilt";
import { isTouchDevice } from "@/lib/device";

const BOX = 42; // cube edge (px)
const PAC = 40; // pac-man diameter (px)

/**
 * A little 3D box with real-ish gravity, plus a Pac-Man that hunts it.
 *
 *  - After the visitor scrolls past the hero, the box FALLS in from the top
 *    and bounces onto a "floor" along the bottom of the screen.
 *  - Tilting the phone rolls it left/right like a ball on a table (tilt is an
 *    acceleration, it has momentum, it bounces off the screen edges).
 *  - A Pac-Man patrols the same floor and chases the box. If it catches it,
 *    it chomps it, the box vanishes, and a fresh one drops from the sky.
 *
 * Touch-only, pointer-events:none (never blocks taps/reading), static under
 * reduced-motion. Sits at the bottom edge, so it never covers the text.
 */
export function GyroBadge() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const tilt = useDeviceTiltRef(enabled);

  const boxRef = useRef<HTMLDivElement>(null);
  const cubeRef = useRef<HTMLDivElement>(null);
  const pacRef = useRef<HTMLDivElement>(null);
  const pacPathRef = useRef<SVGPathElement>(null);

  // physics state (px, relative to screen centre / floor)
  const S = useRef({
    bx: 0, by: -600, bvx: 0, bvy: 0, spin: 0, // box
    px: 0, pdir: 1, mouth: 0, // pac-man
    eaten: false, respawnAt: 0, eatAnim: 0,
    started: false,
  });

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!isTouchDevice() || reduce) return;
    setEnabled(true);
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useAnimationFrame((t, delta) => {
    if (!enabled || !boxRef.current || !cubeRef.current || !pacRef.current) return;
    const s = S.current;
    const dt = Math.min(delta / 16.7, 2.5);
    const half = window.innerWidth / 2 - BOX / 2 - 6;
    const vh = window.innerHeight;

    // first time the box becomes visible → drop it from above at a random x
    if (visible && !s.started) {
      s.started = true;
      s.bx = (Math.random() - 0.5) * half;
      s.by = -vh * 0.75;
      s.bvy = 0;
      s.px = s.bx > 0 ? -half : half; // pac-man starts on the far side
    }

    if (s.started && !s.eaten) {
      // gravity-style motion: tilt = horizontal acceleration
      s.bvx += Math.max(-1, Math.min(1, tilt.current.y)) * 0.9 * dt;
      s.bvx *= Math.pow(0.965, dt); // rolling friction
      s.bx += s.bvx * dt;
      if (s.bx > half) { s.bx = half; s.bvx *= -0.55; }
      if (s.bx < -half) { s.bx = -half; s.bvx *= -0.55; }
      // vertical: fall + bounce on the floor (by = 0)
      s.bvy += 0.75 * dt;
      s.by += s.bvy * dt;
      if (s.by > 0) {
        s.by = 0;
        s.bvy = Math.abs(s.bvy) > 2.2 ? -s.bvy * 0.45 : 0;
      }
      s.spin += s.bvx * 2.4 * dt; // roll the cube as it travels
    }

    // pac-man: chase the box while it's alive, wander otherwise
    const speed = 1.35 * dt;
    if (s.started) {
      if (!s.eaten) {
        const target = s.bx;
        s.pdir = target >= s.px ? 1 : -1;
        s.px += s.pdir * speed;
        // catch!
        if (Math.abs(s.px - s.bx) < (PAC + BOX) * 0.32 && s.by > -BOX * 0.8) {
          s.eaten = true;
          s.eatAnim = 1;
          s.respawnAt = t + 1600;
          s.bvx = 0;
        }
      } else {
        s.eatAnim = Math.max(0, s.eatAnim - 0.035 * dt);
        // wander off after the meal
        s.px += s.pdir * speed * 0.6;
        if (s.px > half || s.px < -half) s.pdir *= -1;
        if (t > s.respawnAt) {
          s.eaten = false;
          s.bx = (Math.random() - 0.5) * half;
          s.by = -vh * 0.75;
          s.bvx = 0;
          s.bvy = 0;
        }
      }
      s.px = Math.max(-half - 6, Math.min(half + 6, s.px));
    }

    // chomping mouth
    s.mouth += 0.22 * dt;
    const m = 0.08 + 0.5 * Math.abs(Math.sin(s.mouth));
    const r = PAC / 2;
    const x1 = r + r * Math.cos(m), y1 = r - r * Math.sin(m);
    const x2 = r + r * Math.cos(m), y2 = r + r * Math.sin(m);
    pacPathRef.current?.setAttribute(
      "d",
      `M${r},${r} L${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 1 0 ${x2.toFixed(2)},${y2.toFixed(2)} Z`,
    );

    // apply transforms
    const boxScale = s.eaten ? 0 : 1;
    boxRef.current.style.transform = `translate3d(${s.bx}px, ${s.by}px, 0) scale(${boxScale})`;
    boxRef.current.style.transition = s.eaten ? "transform .18s ease-in" : "none";
    cubeRef.current.style.transform = `rotateX(-28deg) rotateY(${s.spin + 30}deg)`;
    pacRef.current.style.transform = `translate3d(${s.px}px, 0, 0) scaleX(${s.pdir})`;
  });

  if (!enabled) return null;

  const h = BOX / 2;
  const face = "absolute inset-0 border border-accent/80 bg-accent/[0.10]";
  return (
    <div
      aria-hidden
      // floor along the bottom edge; children are centred and moved by JS
      className="pointer-events-none fixed inset-x-0 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-30 h-12 md:hidden"
      style={{ opacity: visible ? 1 : 0, transition: "opacity .5s ease" }}
    >
      {/* the box */}
      <div
        ref={boxRef}
        className="absolute bottom-0 left-1/2"
        style={{ width: BOX, height: BOX, marginLeft: -h, perspective: 500 }}
      >
        <div
          ref={cubeRef}
          className="relative"
          style={{ width: BOX, height: BOX, transformStyle: "preserve-3d" }}
        >
          <div className={face} style={{ transform: `translateZ(${h}px)` }} />
          <div className={face} style={{ transform: `rotateY(180deg) translateZ(${h}px)` }} />
          <div className={face} style={{ transform: `rotateY(90deg) translateZ(${h}px)` }} />
          <div className={face} style={{ transform: `rotateY(-90deg) translateZ(${h}px)` }} />
          <div className={face} style={{ transform: `rotateX(90deg) translateZ(${h}px)` }} />
          <div className={face} style={{ transform: `rotateX(-90deg) translateZ(${h}px)` }} />
        </div>
      </div>

      {/* pac-man */}
      <div
        ref={pacRef}
        className="absolute bottom-0 left-1/2"
        style={{ width: PAC, height: PAC, marginLeft: -PAC / 2 }}
      >
        <svg viewBox={`0 0 ${PAC} ${PAC}`} width={PAC} height={PAC} className="overflow-visible">
          <path ref={pacPathRef} fill="rgb(var(--c-gold))" opacity="0.95" />
        </svg>
      </div>
    </div>
  );
}
