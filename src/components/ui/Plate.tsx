"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

export type PlateTone = "salmon" | "tuna" | "roe" | "matcha" | "wood" | "night" | "ceramic";

const tones: Record<PlateTone, string> = {
  salmon:
    "radial-gradient(120% 100% at 30% 20%, #ffd7b0, #f0996a 38%, #d2603c 72%, #7c2f1c)",
  tuna: "radial-gradient(120% 100% at 30% 20%, #f6b8ac, #d85c50 40%, #9e2f2c 75%, #4d1516)",
  roe: "radial-gradient(120% 100% at 30% 20%, #ffcf94, #f08a3c 42%, #b5471f 78%, #5c2410)",
  matcha:
    "radial-gradient(120% 100% at 30% 20%, #dfe6b6, #9bb066 42%, #5f7a3c 76%, #2f3d1e)",
  wood: "radial-gradient(120% 100% at 30% 20%, #e8c79b, #c69a68 40%, #8f6740 76%, #4a3220)",
  night:
    "radial-gradient(120% 100% at 30% 20%, #3a4a63, #24304a 42%, #141c2e 78%, #080b14)",
  ceramic:
    "radial-gradient(120% 100% at 30% 20%, #f7f2ea, #e4dccd 44%, #c9bfab 78%, #9a8f79)",
};

/**
 * An editorial "plate": a rich, lit gradient surface with a kanji watermark and
 * a soft parallax drift. Used as a premium, zero-payload stand-in for
 * photography — swap `<Plate/>` for a real <img srcset> when assets arrive.
 */
export function Plate({
  tone = "salmon",
  kanji,
  label,
  className,
  parallax = true,
  rounded = "rounded-2xl",
}: {
  tone?: PlateTone;
  kanji?: string;
  label?: string;
  className?: string;
  parallax?: boolean;
  rounded?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], parallax ? [22, -22] : [0, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.05, 1, 1.05]);

  return (
    <div
      ref={ref}
      className={cn("group relative overflow-hidden", rounded, className)}
      role="img"
      aria-label={label ?? "Dish photography"}
    >
      <motion.div
        style={{ y, scale, backgroundImage: tones[tone] }}
        className="absolute inset-0 h-full w-full"
      />
      {/* light bloom */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_28%_18%,rgba(255,255,255,0.4),transparent_60%)] opacity-70" />
      {/* vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_50%,transparent_55%,rgba(0,0,0,0.35))]" />
      {kanji && (
        <span className="pointer-events-none absolute bottom-4 right-5 font-jp text-5xl text-white/25 transition-transform duration-700 group-hover:scale-110">
          {kanji}
        </span>
      )}
      {label && (
        <span className="pointer-events-none absolute bottom-4 left-5 text-[0.62rem] uppercase tracking-wider2 text-white/80">
          {label}
        </span>
      )}
    </div>
  );
}
