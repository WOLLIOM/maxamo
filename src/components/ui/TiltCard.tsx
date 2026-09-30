"use client";

import { useEffect, useRef } from "react";
import { useDeviceTiltRef } from "@/lib/useDeviceTilt";
import { isTouchDevice } from "@/lib/device";
import { cn } from "@/lib/utils";

/**
 * Wraps content in a card that leans toward the cursor on desktop and follows
 * the phone's gyro on touch devices (same hook as PortraitCard/Photo), with a
 * moving specular glare. Transforms are written straight to the element inside
 * a rAF loop — no React state, so dozens of cards stay cheap.
 */
export function TiltCard({
  children,
  className,
  glow = "#ffffff",
  max = 9,
  as: Tag = "div",
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
  /** Colour of the glare highlight that slides across the card. */
  glow?: string;
  /** Max rotation in degrees. */
  max?: number;
  as?: "div" | "button";
} & Omit<React.HTMLAttributes<HTMLElement>, "children">) {
  const ref = useRef<HTMLElement>(null);
  const glare = useRef<HTMLSpanElement>(null);
  const touch = useRef(false);
  const target = useRef({ x: 0.5, y: 0.5, hover: false });
  const cur = useRef({ x: 0.5, y: 0.5, lift: 0 });
  const inView = useRef(false);

  useEffect(() => {
    touch.current = isTouchDevice();
  }, []);
  const tilt = useDeviceTiltRef(isTouchDevice());

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(([e]) => (inView.current = e.isIntersecting), {
      rootMargin: "80px",
    });
    io.observe(el);

    let frame = 0;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (!inView.current) return;
      const t = target.current;
      if (touch.current) {
        // gyro drives the card whenever it's on screen
        t.x = Math.max(0, Math.min(1, 0.5 + tilt.current.y * 0.8));
        t.y = Math.max(0, Math.min(1, 0.5 + tilt.current.x * 0.8));
      }
      const c = cur.current;
      c.x += (t.x - c.x) * 0.12;
      c.y += (t.y - c.y) * 0.12;
      c.lift += ((t.hover ? 1 : 0) - c.lift) * 0.14;
      const rx = (0.5 - c.y) * 2 * max;
      const ry = (c.x - 0.5) * 2 * max;
      el.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(${(-6 * c.lift).toFixed(2)}px) scale(${(1 + 0.015 * c.lift).toFixed(4)})`;
      const g = glare.current;
      if (g) {
        g.style.background = `radial-gradient(420px circle at ${(c.x * 100).toFixed(1)}% ${(c.y * 100).toFixed(1)}%, ${glow}33, transparent 60%)`;
        g.style.opacity = touch.current ? "0.9" : String(0.25 + 0.75 * c.lift);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
    };
  }, [glow, max, tilt]);

  function onMove(e: React.PointerEvent<HTMLElement>) {
    if (e.pointerType === "touch") return;
    const r = e.currentTarget.getBoundingClientRect();
    target.current.x = (e.clientX - r.left) / r.width;
    target.current.y = (e.clientY - r.top) / r.height;
    target.current.hover = true;
  }
  function onLeave() {
    if (touch.current) return;
    target.current = { x: 0.5, y: 0.5, hover: false };
  }

  const Comp = Tag as "div";
  return (
    <Comp
      ref={ref as React.RefObject<HTMLDivElement>}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cn("relative will-change-transform [transform-style:preserve-3d]", className)}
      {...(rest as React.HTMLAttributes<HTMLDivElement>)}
    >
      {children}
      <span
        ref={glare}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] opacity-0 mix-blend-plus-lighter"
      />
    </Comp>
  );
}
