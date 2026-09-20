"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Four equal pills — the old full-width "Get in touch" button split in four — each
 * a single big capital letter over a tiny word, for one-tap jumps on a phone:
 *   T = Touch (contact page)   M = Music   C = Certificates   G = Guitar chords
 *
 * `inline`  → lives in the hero in place of the two CTA buttons.
 * `dock`    → fixed to the bottom of the screen after the hero, so the visitor never
 *             has to scroll all the way to find a section; highlights the one in view.
 * Phones only (md:hidden); desktop keeps its original buttons.
 */
const ITEMS = [
  { letter: "T", word: "Touch", label: "Get in touch", href: "/contact", id: null },
  { letter: "M", word: "Music", label: "Jump to Music", href: null, id: "music" },
  { letter: "C", word: "Certs", label: "Jump to Certificates", href: null, id: "certificates" },
  { letter: "G", word: "Chords", label: "Jump to Guitar chords", href: null, id: "guitar" },
] as const;

function jumpTo(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  const lenis = (window as unknown as {
    lenis?: { scrollTo: (t: HTMLElement, o?: Record<string, unknown>) => void };
  }).lenis;
  if (lenis) lenis.scrollTo(target, { duration: 1.2, offset: -70 });
  else target.scrollIntoView({ behavior: "smooth", block: "start" });
}

const pill =
  "relative flex min-h-12 flex-1 flex-col items-center justify-center rounded-full leading-none transition-all duration-300 active:scale-95";

export function QuickNav({ variant }: { variant: "inline" | "dock" }) {
  const [active, setActive] = useState<string | null>(null);
  const [shown, setShown] = useState(variant === "inline");

  useEffect(() => {
    if (variant !== "dock") return;
    const onScroll = () => {
      // dock appears once the hero is mostly gone
      setShown(window.scrollY > window.innerHeight * 0.7);
      // active = the last target section whose top is above ~45% of the viewport
      let cur: string | null = null;
      for (const it of ITEMS) {
        if (!it.id) continue;
        const el = document.getElementById(it.id);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.45) cur = it.id;
      }
      setActive(cur);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [variant]);

  const dock = variant === "dock";

  return (
    <nav
      aria-label="Quick jump"
      className={
        dock
          ? "fixed inset-x-3 bottom-[calc(0.6rem+env(safe-area-inset-bottom))] z-40 flex gap-2 rounded-full border border-white/10 bg-black/55 p-1.5 backdrop-blur-md transition-all duration-500 md:hidden"
          : "flex w-full gap-2 md:hidden"
      }
      style={
        dock
          ? {
              opacity: shown ? 1 : 0,
              transform: shown ? "translateY(0)" : "translateY(140%)",
              pointerEvents: shown ? "auto" : "none",
            }
          : undefined
      }
    >
      {ITEMS.map((it) => {
        const isActive = dock && it.id !== null && active === it.id;
        // inline: same purple pill as the old "Get in touch"; dock: quieter, active glows
        const cls = dock
          ? `${pill} ${isActive ? "bg-accent text-bg shadow-lg shadow-accent/30" : "bg-white/[0.06] text-ink"}`
          : `${pill} ${it.href ? "bg-accent text-bg shadow-lg shadow-accent/20" : "border border-ink/40 bg-elevated/50 text-ink backdrop-blur-sm"}`;
        const inner = (
          <>
            <span className="font-serif text-[1.35rem] font-medium">{it.letter}</span>
            <span className="mt-1 text-[0.5rem] uppercase tracking-wider2 opacity-75">{it.word}</span>
          </>
        );
        return it.href ? (
          <Link key={it.letter} href={it.href} prefetch={false} aria-label={it.label} className={cls}>
            {inner}
          </Link>
        ) : (
          <button
            key={it.letter}
            type="button"
            aria-label={it.label}
            aria-current={isActive ? "true" : undefined}
            onClick={() => jumpTo(it.id!)}
            className={cls}
          >
            {inner}
          </button>
        );
      })}
    </nav>
  );
}
