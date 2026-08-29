"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { navLinks, site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { FlipLinkLabel } from "@/components/ui/FlipLink";
import { StickyReserve } from "./StickyReserve";

export function Nav() {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    function onScroll() {
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > last && y > 300 && !open);
      last = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: hidden ? -110 : 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-colors duration-500",
          scrolled ? "glass" : "bg-transparent",
        )}
      >
        <nav
          aria-label="Primary"
          className="mx-auto grid max-w-[1400px] grid-cols-[3rem_1fr_auto] items-center gap-2 px-5 py-4 md:px-10 md:py-5 lg:flex lg:justify-between"
        >
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="flex h-12 w-12 min-h-12 min-w-12 flex-col items-center justify-center gap-[5px] justify-self-start lg:hidden"
          >
            <span className="h-px w-6 bg-ink" />
            <span className="h-px w-6 bg-ink" />
          </button>

          <Link
            href="/"
            className="group flex items-baseline justify-center gap-2 justify-self-center lg:justify-start"
            aria-label={`${site.name} home`}
          >
            <span className="font-serif text-2xl tracking-tight text-ink transition-colors group-hover:text-accent">
              {site.name}
            </span>
          </Link>

          <ul className="hidden items-center gap-8 lg:flex">
            {navLinks.slice(0, -1).map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  prefetch={l.href.startsWith("/#") ? undefined : false}
                  className="group text-[0.72rem] uppercase tracking-wider2 text-muted transition-colors hover:text-ink"
                >
                  <FlipLinkLabel>{l.label}</FlipLinkLabel>
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href="/contact"
            prefetch={false}
            className="inline-flex min-h-12 items-center justify-self-end rounded-full border border-ink/20 bg-elevated/40 px-4 py-3 text-[0.62rem] uppercase tracking-wider2 text-ink backdrop-blur-sm transition-all duration-500 hover:border-accent hover:text-accent lg:px-5 lg:text-[0.68rem]"
          >
            Contact
          </Link>
        </nav>
      </motion.header>

      <StickyReserve hidden={open} />

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[69] bg-bg/60 backdrop-blur-sm lg:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 z-[70] flex w-[min(100%,22rem)] flex-col border-r border-line/60 bg-bg/96 shadow-2xl backdrop-blur-2xl lg:hidden"
            >
              <div className="flex items-center justify-between px-5 py-4">
                <span className="font-serif text-2xl text-ink">{site.name}</span>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="flex h-12 w-12 min-h-12 min-w-12 items-center justify-center text-ink"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
                    <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                </button>
              </div>

              <ul className="flex flex-1 flex-col gap-1 overflow-y-auto px-6 pb-8 pt-4">
                {navLinks.map((l, i) => (
                  <motion.li
                    key={l.href}
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06 + i * 0.05, duration: 0.5 }}
                  >
                    <Link
                      href={l.href}
                      prefetch={l.href.startsWith("/#") ? undefined : false}
                      onClick={() => setOpen(false)}
                      className="flex min-h-14 items-baseline justify-between border-b border-line/50 py-3"
                    >
                      <span className="font-serif text-[clamp(2rem,9vw,2.75rem)] leading-none text-ink">
                        {l.label}
                      </span>
                      {l.jp && (
                        <span className="font-jp text-sm text-muted">{l.jp}</span>
                      )}
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <div className="border-t border-line/60 p-5">
                <Link
                  href="/contact"
                  prefetch={false}
                  onClick={() => setOpen(false)}
                  className="flex min-h-12 w-full items-center justify-center rounded-full bg-accent text-[0.68rem] uppercase tracking-wider2 text-bg transition-all duration-500 hover:brightness-110"
                >
                  Get in touch
                </Link>
              </div>
            </motion.aside>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="fixed inset-0 z-[70] hidden flex-col bg-bg/98 backdrop-blur-xl lg:flex"
            >
              <div className="flex items-center justify-between px-5 py-4 md:px-10">
                <span className="font-serif text-2xl text-ink">{site.name}</span>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="flex h-12 w-12 min-h-12 min-w-12 items-center justify-center text-ink"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
                    <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                </button>
              </div>
              <ul className="flex flex-1 flex-col justify-center gap-2 px-8">
                {navLinks.map((l, i) => (
                  <motion.li
                    key={l.href}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.06, duration: 0.6 }}
                  >
                    <Link
                      href={l.href}
                      prefetch={l.href.startsWith("/#") ? undefined : false}
                      onClick={() => setOpen(false)}
                      className="flex items-baseline justify-between border-b border-line/60 py-4"
                    >
                      <span className="font-serif text-4xl text-ink">{l.label}</span>
                      <span className="font-jp text-base text-muted">{l.jp}</span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
