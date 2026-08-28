"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};
const word: Variants = {
  hidden: { y: "110%" },
  visible: {
    y: "0%",
    transition: { duration: 1, ease: [0.22, 1, 0.36, 1] },
  },
};

/**
 * Splits a heading into words that rise from behind a mask, one after another.
 * Renders real, selectable, semantic text for SEO + accessibility.
 */
export function AnimatedHeading({
  text,
  as: Tag = "h2",
  className,
  once = true,
}: {
  text: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
  once?: boolean;
}) {
  const words = text.split(" ");
  return (
    <Tag className={cn("overflow-hidden", className)}>
      <motion.span
        className="inline"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, margin: "-10%" }}
        aria-hidden
      >
        {words.map((w, i) => (
          <span key={i} className="inline-block overflow-hidden align-bottom">
            <motion.span variants={word} className="inline-block">
              {w}
              {i < words.length - 1 ? "\u00A0" : ""}
            </motion.span>
          </span>
        ))}
      </motion.span>
      {/* Accessible, non-animated copy for screen readers & crawlers */}
      <span className="sr-only">{text}</span>
    </Tag>
  );
}
