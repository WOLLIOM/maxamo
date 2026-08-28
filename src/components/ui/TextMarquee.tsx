"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/** A slow, scroll-reactive text ribbon used as a breathing divider. */
export function TextMarquee({
  text = "MUSIC · ARCHITECTURE · GAME DEV · CODE · MUSIC · ARCHITECTURE · GAME DEV · CODE ·",
}: {
  text?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const x = useTransform(scrollYProgress, [0, 1], ["8%", "-18%"]);

  return (
    <div ref={ref} className="max-w-full overflow-hidden py-10 md:py-16" aria-hidden>
      <motion.div
        style={{ x }}
        className="whitespace-nowrap font-serif text-[9vw] uppercase leading-none tracking-tight text-ink/[0.07] md:text-[5vw]"
      >
        {`${text} ${text} `}
      </motion.div>
    </div>
  );
}
