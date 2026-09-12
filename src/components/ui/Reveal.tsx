"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

type RevealVariant = "up" | "scale" | "left" | "right";

// Each variant has its own hidden pose; they all clear to the same crisp,
// in-focus resting state. A soft spring gives the entrance a bit of life
// instead of a flat linear fade.
const hiddenFor: Record<RevealVariant, Record<string, number | string>> = {
  up: { opacity: 0, y: 34, scale: 0.98, filter: "blur(8px)" },
  scale: { opacity: 0, y: 22, scale: 0.9, filter: "blur(8px)" },
  left: { opacity: 0, x: -46, scale: 0.98, filter: "blur(8px)" },
  right: { opacity: 0, x: 46, scale: 0.98, filter: "blur(8px)" },
};

function buildVariants(variant: RevealVariant): Variants {
  return {
    hidden: hiddenFor[variant],
    visible: (i: number = 0) => ({
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        // spring on the transform for the "pop", tween the blur/opacity so
        // text never lands blurry
        type: "spring",
        stiffness: 90,
        damping: 16,
        mass: 0.9,
        delay: i * 0.09,
        opacity: { duration: 0.6, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] },
        filter: { duration: 0.7, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] },
      },
    }),
  };
}

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  variant?: RevealVariant;
  as?: "div" | "span" | "li" | "section" | "header" | "figure";
}

/** Reveals content into view once with a springy pop + blur clear. */
export function Reveal({
  children,
  className,
  delay = 0,
  variant = "up",
  as = "div",
}: RevealProps) {
  const MotionTag = motion[as] as typeof motion.div;
  return (
    <MotionTag
      className={cn(className)}
      variants={buildVariants(variant)}
      custom={delay}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
    >
      {children}
    </MotionTag>
  );
}
