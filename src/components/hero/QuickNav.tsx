"use client";

import { useEffect, useState } from "react";

/**
 * Three big frosted-glass pills, each a single capital letter over a tiny word, for
 * one-tap jumps on a phone:
 *   M = Music   C = Certificates   G = Guitar chords
 * (Contact stays in the menu; the separate glass "Get in touch" pill was removed on
 * phones so these are the only floating actions.) Uses the same lighter, blurred
 * "glass" look as that pill.
 *
 * `inline`  → lives in the hero in place of the two CTA buttons.
 * `dock`    → fixed to the bottom of the screen after the hero, so the visitor never
 *             has to scroll all the way to find a section; highlights the one in view.
 * Phones only (md:hidden); desktop keeps its original buttons.
 */
const ITEMS = [
  { letter: "M", word: "Music", label: "Jump to Music", id: "music" },
  { letter: "C", word: "Certs", label: "Jump to Certificates", id: "certificates" },
  { letter: "G", word: "Chords", label: "Jump to Guitar chords", id: "guitar" },
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

// Frosted glass: light translucent fill, heavy blur + saturation, hairline light border,
// soft top highlight. Deliberately small so it doesn't pull the eye.
const pill =
  "relative flex flex-col items-center justify-center overflow-hidden rounded-full leading-none text-white transition-all duration-300 active:scale-95 " +
  "border border-white/25 bg-white/[0.12] backdrop-blur-xl backdrop-saturate-150 " +
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_8px_24px_-8px_rgba(0,0,0,0.5)]";

export function QuickNav({ variant }: { variant: "inline" | "dock" }) {
  const [active, setActive] = useState<string | null>(null);
  const [shown, setShown] = useState(variant === "inline");
  const [idle, setIdle] = useState(false); // dock fades back while the visitor isn't scrolling

  useEffect(() => {
    if (variant !== "dock") return;
    let idleTimer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      setIdle(false);
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => setIdle(true), 1800);
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
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(idleTimer);
    };
  }, [variant]);

  const dock = variant === "dock";

  return (
    <nav
      aria-label="Quick jump"
      className={
        dock
          ? "fixed bottom-[calc(0.7rem+env(safe-area-inset-bottom))] left-1/2 z-40 flex -translate-x-1/2 gap-2 transition-all duration-500 md:hidden"
          : "flex w-full justify-center gap-2.5 md:hidden"
      }
      style={
        dock
          ? {
              opacity: shown ? (idle ? 0.45 : 0.9) : 0,
              transform: shown ? "translate(-50%, 0)" : "translate(-50%, 140%)",
              pointerEvents: shown ? "auto" : "none",
            }
          : undefined
      }
    >
      {ITEMS.map((it) => {
        const isActive = dock && active === it.id;
        // glass everywhere; the section you're in lights up with an accent tint + glow
        const size = dock ? "h-10 w-12" : "h-12 w-[5.25rem]";
        const cls = `${pill} ${size} ${isActive ? "!border-accent/70 !bg-accent/35 shadow-[0_0_20px_-4px_rgb(var(--c-accent)/0.75)]" : ""}`;
        const inner = (
          <>
            <span className={dock ? "font-serif text-[1.15rem] font-medium" : "font-serif text-[1.3rem] font-medium"}>
              {it.letter}
            </span>
            {/* words only in the hero (first-time context); the dock is letters only */}
            {!dock && (
              <span className="mt-1 text-[0.5rem] uppercase tracking-wider2 opacity-75">{it.word}</span>
            )}
          </>
        );
        return (
          <button
            key={it.letter}
            type="button"
            aria-label={it.label}
            aria-current={isActive ? "true" : undefined}
            onClick={() => jumpTo(it.id)}
            className={cls}
          >
            {inner}
          </button>
        );
      })}
    </nav>
  );
}
