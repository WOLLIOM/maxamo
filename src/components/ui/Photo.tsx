"use client";

import { useEffect, useRef, useState } from "react";
import type { HTMLAttributes } from "react";
import { motion, useAnimationFrame, useScroll, useTransform } from "framer-motion";
import { imageSources } from "@/lib/media";
import { useDeviceTiltRef } from "@/lib/useDeviceTilt";
import { isTouchDevice } from "@/lib/device";
import { cn } from "@/lib/utils";

/**
 * Real photography with the same cinematic framing as <Plate/>: a subtle
 * scroll parallax, a soft light bloom + vignette, and an optional kanji/label.
 * Uses WebP when available (see npm run optimize-images).
 */
export function Photo({
  src,
  alt,
  kanji,
  label,
  className,
  parallax = true,
  rounded = "rounded-2xl",
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
  width = 1200,
  height = 1500,
  ...rest
}: {
  src: string;
  alt: string;
  kanji?: string;
  label?: string;
  className?: string;
  parallax?: boolean;
  rounded?: string;
  priority?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
} & HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const { fallback, webp } = imageSources(src);

  // Gyro tilt on phones: the whole photo card tips in 3D as the visitor
  // moves their device — Simon wanted the tilt interaction (already on the
  // hero + About portrait) to show up on the other photos across the site
  // too. Desktop is untouched (hook is inert when not a touch device).
  const touch = useRef(isTouchDevice());
  const tilt = useDeviceTiltRef(touch.current);
  useAnimationFrame(() => {
    if (!touch.current || !cardRef.current) return;
    const rx = Math.max(-1, Math.min(1, tilt.current.x * 1.4)) * 7; // pitch
    const ry = Math.max(-1, Math.min(1, tilt.current.y * 1.4)) * 9; // yaw
    cardRef.current.style.transform = `rotateX(${-rx}deg) rotateY(${ry}deg)`;
  });

  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], parallax ? [26, -26] : [0, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.08, 1.02, 1.08]);

  return (
    <div
      ref={ref}
      style={{ perspective: 900 }}
      className={cn("group relative", className)}
      {...rest}
    >
    <div
      ref={cardRef}
      className={cn(
        "relative h-full w-full overflow-hidden bg-surface/50 transition-transform duration-150 ease-out [transform-style:preserve-3d]",
        rounded,
      )}
    >
      <motion.div
        style={{ y, scale }}
        className="absolute inset-0 h-full w-full"
      >
        <picture>
          <source srcSet={webp} type="image/webp" sizes={sizes} />
          <img
            ref={imgRef}
            src={fallback}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            sizes={sizes}
            onLoad={() => setLoaded(true)}
            onError={() => setLoaded(true)}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ease-silk",
              loaded ? "opacity-100" : "opacity-0",
            )}
          />
        </picture>
      </motion.div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_50%_at_28%_15%,rgba(255,255,255,0.14),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(130%_130%_at_50%_50%,transparent_58%,rgba(0,0,0,0.4))]" />
      {kanji && (
        <span className="pointer-events-none absolute bottom-4 right-5 font-jp text-5xl text-white/25 transition-transform duration-700 group-hover:scale-110">
          {kanji}
        </span>
      )}
      {label && (
        <span className="pointer-events-none absolute bottom-4 left-5 text-[0.62rem] uppercase tracking-wider2 text-white/85">
          {label}
        </span>
      )}
    </div>
    </div>
  );
}
