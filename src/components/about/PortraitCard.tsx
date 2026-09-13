"use client";

import { useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useDeviceTiltRef } from "@/lib/useDeviceTilt";
import { isTouchDevice } from "@/lib/device";

/**
 * The developer's portrait in a lacquer-framed card that tilts toward the
 * cursor on desktop, and toward the phone's own tilt on touch devices (same
 * gyro hook the hero uses) — Simon asked for the tilt-on-move interaction to
 * reach beyond the hero into other sections like this one.
 */
export function PortraitCard() {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const touch = useRef(isTouchDevice());
  const tilt = useDeviceTiltRef(touch.current);

  // On touch devices, drive mx/my from the gyro ref every frame instead of
  // pointer events (which don't fire meaningfully on touch anyway). Gyro
  // input is amplified (x1.6) before mapping — Simon found the raw signal
  // too subtle to feel on a small portrait card; this makes a normal wrist
  // tilt swing further through the same rotation range.
  useAnimationFrame(() => {
    if (!touch.current) return;
    const ax = Math.max(-1, Math.min(1, tilt.current.x * 1.6));
    const ay = Math.max(-1, Math.min(1, tilt.current.y * 1.6));
    mx.set((ax + 1) / 2);
    my.set((ay + 1) / 2);
  });

  const rotX = useSpring(useTransform(my, [0, 1], [8, -8]), {
    stiffness: 150,
    damping: 18,
  });
  const rotY = useSpring(useTransform(mx, [0, 1], [-8, 8]), {
    stiffness: 150,
    damping: 18,
  });

  function onMove(e: React.PointerEvent) {
    if (e.pointerType === "touch") return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  }
  function reset() {
    mx.set(0.5);
    my.set(0.5);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ rotateX: rotX, rotateY: rotY, transformPerspective: 900 }}
      className="group relative mx-auto w-full max-w-sm [transform-style:preserve-3d]"
    >
      {/* warm glow behind */}
      <div
        className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] opacity-70 blur-2xl"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 30%, rgb(var(--glow)/0.6), transparent 70%)",
        }}
      />
      <div className="relative overflow-hidden rounded-[1.6rem] border border-line/70 bg-surface/60 shadow-2xl shadow-black/30">
        <div className="relative aspect-[3/4] w-full">
          <picture>
            <source srcSet="/images/simon-maxam.webp" type="image/webp" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/real/guitar-performance.webp"
              alt="Simon Maxam, developer, in Calgary"
              width={900}
              height={1200}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              loading="lazy"
              decoding="async"
            />
          </picture>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_0%,transparent_55%,rgba(0,0,0,0.45))]" />
          <span className="pointer-events-none absolute bottom-4 left-5 text-[0.6rem] uppercase tracking-wider2 text-white/85">
            Calgary · Canada
          </span>
        </div>
      </div>
    </motion.div>
  );
}
