"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

/** Compact reserve pill after the visitor starts scrolling (mobile only). */
export function StickyReserve({ hidden = false }: { hidden?: boolean }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 420);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && !hidden && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none fixed left-0 right-0 top-[4.25rem] z-[45] flex justify-center px-4 lg:hidden"
        >
          <Link
            href="/contact"
            prefetch={false}
            className="pointer-events-auto glass min-h-11 rounded-full px-6 py-2.5 text-[0.64rem] uppercase tracking-wider2 text-ink shadow-lg transition-colors hover:text-accent"
          >
            Get in touch
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
