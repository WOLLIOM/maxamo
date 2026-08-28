"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * The developer's portrait in a lacquer-framed card that tilts gently toward
 * the cursor (disabled on touch, where pointer position is meaningless).
 */
export function PortraitCard() {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);

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
              src="/images/real/guitar-performance.jpg"
              alt="Simon Maxam, multidisciplinary creator, in Calgary"
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
