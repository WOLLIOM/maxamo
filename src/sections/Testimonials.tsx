"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";

// Rotating personal principles, not fabricated press quotes — keeps this
// section honest for a portfolio rather than borrowing restaurant-review
// copy from the original template.
const quotes = [
  {
    text: "The best projects come from bringing different disciplines together, not staying in one lane.",
    name: "On combining fields",
    role: "Philosophy",
  },
  {
    text: "Every project is an opportunity to become a better designer, developer, and creator.",
    name: "On growth",
    role: "Philosophy",
  },
  {
    text: "I focus on building projects that are both visually engaging and meaningful.",
    name: "On craft",
    role: "Philosophy",
  },
  {
    text: "Rather than following trends, I try to create experiences that leave a lasting impression.",
    name: "On originality",
    role: "Philosophy",
  },
];

export function Testimonials() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % quotes.length), 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <section
      aria-label="Guiding principles"
      data-section="philosophy"
      data-palette="gold"
      className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-36"
    >
      <SectionHeading kicker="How I think" title="Guiding principles" align="center" />

      <div className="relative mx-auto mt-14 flex min-h-[260px] max-w-3xl items-center justify-center text-center md:min-h-[220px]">
        <AnimatePresence mode="wait">
          <motion.blockquote
            key={i}
            initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -24, filter: "blur(6px)" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            <p className="font-serif text-2xl italic leading-relaxed text-ink md:text-4xl md:leading-[1.25]">
              &ldquo;{quotes[i].text}&rdquo;
            </p>
            <footer className="mt-8">
              <span className="text-sm font-medium text-ink">{quotes[i].name}</span>
              <span className="mx-2 text-faint">·</span>
              <span className="text-[0.7rem] uppercase tracking-wider2 text-muted">
                {quotes[i].role}
              </span>
            </footer>
          </motion.blockquote>
        </AnimatePresence>
      </div>

      <div className="mt-8 flex justify-center gap-2">
        {quotes.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            aria-label={`Show quote ${idx + 1}`}
            className="h-1.5 rounded-full transition-all duration-500"
            style={{
              width: idx === i ? 28 : 8,
              background: idx === i ? "rgb(var(--c-accent))" : "rgb(var(--c-line))",
            }}
          />
        ))}
      </div>
    </section>
  );
}
