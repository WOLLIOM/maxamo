"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { faqs } from "@/lib/faq";

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="faq"
      aria-label="Frequently asked questions"
      className="border-t border-line/50 bg-surface/20"
    >
      <div className="mx-auto max-w-3xl px-5 py-24 md:px-10 md:py-32">
        <Reveal>
          <SectionHeading
            kicker="Good to know"
            title="Frequently asked"
            lede="Projects, tools, timelines, and how to get in touch."
            align="center"
          />
        </Reveal>

        <Reveal delay={1}>
          <dl className="mt-14 divide-y divide-line/60 border-y border-line/60">
            {faqs.map((f, i) => {
              const isOpen = open === i;
              return (
                <div key={f.q}>
                  <dt>
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      className="flex min-h-14 w-full items-center justify-between gap-6 py-5 text-left md:min-h-16"
                    >
                      <span className="font-serif text-lg text-ink md:text-2xl">{f.q}</span>
                      <span
                        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line/60 text-accent transition-transform duration-500"
                        style={{ transform: isOpen ? "rotate(45deg)" : "none" }}
                        aria-hidden
                      >
                        <span className="absolute h-px w-4 bg-current" />
                        <span className="absolute h-4 w-px bg-current" />
                      </span>
                    </button>
                  </dt>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.dd
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-2xl pb-6 text-sm leading-relaxed text-muted md:text-base">
                          {f.a}
                        </p>
                      </motion.dd>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </dl>
        </Reveal>

        <Reveal delay={2}>
          <p className="mt-10 text-center text-sm text-muted">
            Still have a question?{" "}
            <Link href="/contact" className="text-ink underline-offset-4 hover:text-accent hover:underline">
              Get in touch
            </Link>
            .
          </p>
        </Reveal>
      </div>
    </section>
  );
}
