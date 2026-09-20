"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import { Magnetic } from "@/components/ui/Magnetic";
import { PixelMarquee } from "@/components/ui/PixelMarquee";
import { HeroMobileStage } from "@/components/hero/HeroMobileStage";
import { QuickNav } from "@/components/hero/QuickNav";
import { shouldAutoLoad3D, isTouchDevice } from "@/lib/device";
import { site } from "@/lib/site";

const SimaxScene = dynamic(() => import("@/components/three/SimaxScene"), {
  ssr: false,
  loading: () => null,
});

/**
 * Cinematic hero inspired by scroll-driven 3D demos (e.g. Horizon):
 * a tall scroll range + sticky stage so scrolling dollys the camera through
 * the SIMAX scene — guitar, planet, architecture block, code shape.
 */
export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  // NOTE: deliberately NOT lazy-initialized from shouldAutoLoad3D() here.
  // This is a static-export site — the HTML is pre-rendered at build time
  // with no `window`, so a lazy initializer would compute `false` in the
  // shipped markup but `true` on a capable client's first hydration pass,
  // which is an actual React hydration mismatch (different component tree:
  // SimaxScene vs HeroMobileStage). Starting both at `false` here matches
  // the static HTML exactly, so hydration is clean; the "two images" flash
  // this used to cause is fixed instead inside HeroMobileStage itself (see
  // its own `mounted` gate) so that branch renders nothing visible during
  // this brief false window regardless.
  const [mountScene, setMountScene] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [progressLabel, setProgressLabel] = useState(0);

  useEffect(() => {
    setIsTouch(isTouchDevice());
    setMountScene(shouldAutoLoad3D());
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    progressRef.current = v;
    setProgressLabel(v);
  });

  const contentOpacity = useTransform(scrollYProgress, [0, 0.35, 0.55], [1, 1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.55], [0, -80]);
  const contentScale = useTransform(scrollYProgress, [0, 0.55], [1, 0.92]);

  const midOpacity = useTransform(scrollYProgress, [0.35, 0.5, 0.75], [0, 1, 0]);
  const midY = useTransform(scrollYProgress, [0.35, 0.75], [40, -40]);

  const endOpacity = useTransform(scrollYProgress, [0.65, 0.82, 1], [0, 1, 1]);
  const endY = useTransform(scrollYProgress, [0.65, 1], [50, 0]);

  // A little shorter so the dolly finishes in roughly one–two scrolls, not three.
  // Was 140vh on touch -- that meant two swipes to get past the hero.
  // Simon wants one normal scroll to carry straight through. 100vh means the
  // sticky stage releases as soon as its own height has scrolled by.
  const runway = isTouch ? "100vh" : "165vh";

  function scrollToMusic() {
    const target = document.getElementById("music");
    if (!target) return;
    const lenis = (window as unknown as { lenis?: { scrollTo: (t: HTMLElement, o?: Record<string, unknown>) => void } }).lenis;
    if (lenis) lenis.scrollTo(target, { duration: 1.4, offset: -80 });
    else target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section
      ref={ref}
      id="hero"
      aria-label="Introduction"
      data-section="hero"
      data-palette="gold"
      className="relative w-full"
      style={{ height: runway }}
    >
      <div className="sticky top-0 h-[100svh] min-h-[560px] w-full overflow-hidden">
        {/* Clean tonal backdrop behind the WebGL scene — no stock/AI imagery,
            just a quiet graphite gradient so the 3D scene stays the focus. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 0%, rgb(var(--c-elevated)/0.9), rgb(var(--c-bg)) 65%)",
          }}
        />

        {/* WebGL scene — the Canvas needs pointer events for the new
            per-object hover effect; the CTAs/text sit in their own
            pointer-events-none layers above so they still take priority. */}
        <div className="absolute inset-0 z-0">
          {mountScene ? (
            <SimaxScene progressRef={progressRef} />
          ) : (
            <HeroMobileStage scrollProgress={progressLabel} />
          )}
        </div>

        {/* Golden top light — the cinematic key light for the whole scene.
            Hidden on phones: the mobile hero rides the vivid theme, where a
            gold wash just looked like a bad blown-out light. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-[60%] max-md:hidden"
          style={{
            background:
              "radial-gradient(60% 100% at 50% 0%, rgb(var(--c-gold)/0.35), transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-px max-md:hidden"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgb(var(--c-gold)/0.9), transparent)",
            boxShadow: "0 0 40px 6px rgb(var(--c-gold)/0.6)",
          }}
        />

        <div
          className="pointer-events-none absolute inset-0 z-[1] max-md:opacity-60"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 8%, rgb(var(--glow)/0.5), transparent 55%)",
          }}
        />

        {/* Bottom fade — blends the 3D scene down into the page background so
            the hand-off to the next section is a soft gradient, not a hard
            horizontal seam. Sits above the scene (z-[3]) but below the text. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-[28%]"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, rgb(var(--c-bg)/0.6) 55%, rgb(var(--c-bg)) 100%)",
          }}
        />

        {/* Stage 1 — brand + CTAs. pointer-events-none so it doesn't sit as
            an invisible full-screen layer blocking hover on the 3D scene
            underneath — only the CTA buttons re-enable pointer events. */}
        <motion.div
          style={{ y: contentY, opacity: contentOpacity, scale: contentScale }}
          className="pointer-events-none relative z-20 mx-auto flex h-full w-full max-w-5xl flex-col items-center px-6 text-center max-md:justify-end max-md:pb-28 max-md:pt-[46vh] md:justify-center"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 bottom-0 -z-10 h-[55%] w-full max-w-lg -translate-x-1/2 rounded-t-[40%] blur-2xl md:top-1/2 md:h-[110%] md:w-[95%] md:-translate-y-1/2 md:rounded-[50%]"
            style={{
              background:
                "radial-gradient(closest-side, rgb(var(--c-bg)/0.78), rgb(var(--c-bg)/0.35) 55%, transparent 78%)",
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15 }}
            className="mb-6 flex items-center gap-3 max-md:hidden"
          >
            <span className="h-px w-10 bg-accent/60" />
            <span className="kicker">Web · Apps · 3D · Code</span>
            <span className="h-px w-10 bg-accent/60" />
          </motion.div>

          <h1 className="font-serif text-[clamp(3.2rem,19vw,5rem)] font-light leading-[0.92] text-ink md:text-fluid-hero md:leading-[0.86]">
            <OverflowLine delay={0.3}>{site.name}</OverflowLine>
            <span className="sr-only"> — Simon Maxam's Interactive Portfolio</span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.55 }}
            className="mt-3 text-[0.9rem] font-medium uppercase tracking-[0.32em] text-accent md:mt-2 md:text-sm md:tracking-wider2"
          >
            By Simon Maxam
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.7 }}
            className="mt-4 max-w-md text-balance text-sm font-medium leading-relaxed text-ink/85 max-md:hidden md:mt-7 md:text-base md:text-lg"
          >
            A developer building modern websites, web apps, and interactive
            3D.
          </motion.p>

          {/* Phones only: ONE short line instead of the long paragraph (desktop keeps it). */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.7 }}
            className="mt-4 text-[1.05rem] font-medium tracking-[0.06em] text-ink/90 md:hidden"
          >
            Websites <span className="text-accent">·</span> Apps <span className="text-accent">·</span> 3D
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.9 }}
            className="relative z-30 mt-7 flex w-full max-w-sm flex-col items-stretch gap-3 pb-4 pointer-events-auto sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-5 md:mt-10 md:pb-0"
          >
            {/* Phones: three big frosted-glass pills (M / C / G) for one-tap jumps.
                Desktop keeps the original two buttons below. */}
            <QuickNav variant="inline" />
            <div className="contents max-md:hidden">
            <Cta href="/contact" primary magnetic={!isTouch}>
              Get in touch
            </Cta>
            </div>
            <span
              aria-hidden
              className="hidden h-px w-8 bg-line/80 sm:block"
            />
            <button
              type="button"
              onClick={scrollToMusic}
              data-cursor-label="Listen"
              className="relative z-10 inline-flex w-full min-h-12 items-center justify-center gap-2 rounded-full border border-ink/40 bg-elevated/50 px-9 py-4 text-[0.72rem] uppercase tracking-wider2 text-ink backdrop-blur-sm transition-all duration-500 hover:border-accent hover:bg-elevated/70 hover:text-accent max-md:hidden sm:w-auto"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M9 17.5a3 3 0 1 1-2-2.83V6l11-2v9.5a3 3 0 1 1-2-2.83V6.29L9 7.77V17.5Z" />
              </svg>
              Hear my songs
            </button>
          </motion.div>

          <div className="mt-6 h-9 w-full max-w-md max-md:hidden md:mt-8 md:h-10">
            <PixelMarquee text="simon maxam — built by hand, run on code   " cell={7} />
          </div>
        </motion.div>

        {/* Stage 2 — mid scroll whisper */}
        <motion.div
          style={{ opacity: midOpacity, y: midY }}
          className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center"
          aria-hidden={progressLabel < 0.35 || progressLabel > 0.75}
        >
          <span className="font-serif text-4xl italic text-ink/80 md:text-5xl">Create. Build. Play.</span>
          <p className="mt-5 max-w-sm text-sm text-muted md:text-base">
            Where music, architecture, code and story converge.
          </p>
        </motion.div>

        {/* Stage 3 — close-up invitation */}
        <motion.div
          style={{ opacity: endOpacity, y: endY }}
          className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center"
          aria-hidden={progressLabel < 0.65}
        >
          <span className="kicker">Simon Maxam</span>
          <p className="mt-4 max-w-md font-serif text-3xl font-light leading-snug text-ink md:text-4xl">
            Scroll in. Welcome to my world.
          </p>
        </motion.div>

        {/* Scroll progress indicator */}
        <div className="pointer-events-none absolute bottom-7 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-2 max-md:hidden sm:bottom-9">
          <span className="text-[0.58rem] uppercase tracking-ultra text-faint">
            Scroll
          </span>
          <div className="h-px w-24 overflow-hidden bg-line/70">
            <div
              className="h-full bg-accent transition-[width] duration-150 ease-out"
              style={{ width: `${Math.min(100, progressLabel * 100)}%` }}
            />
          </div>
          {/* The 01/02 step counter implied a two-stage scroll, which matched
              the old 140vh touch runway -- now that phones scroll straight
              through in one pass, the counter no longer makes sense there. */}
          {!isTouch && (
            <span className="text-[0.58rem] tabular-nums tracking-wider2 text-faint">
              {String(Math.min(2, Math.floor(progressLabel * 2) + 1)).padStart(2, "0")}{" "}
              / 02
            </span>
          )}
        </div>
      </div>
    </section>
  );
}

function Cta({
  href,
  primary,
  magnetic,
  children,
}: {
  href: string;
  primary?: boolean;
  magnetic?: boolean;
  children: React.ReactNode;
}) {
  const cls = primary
    ? "relative z-10 inline-flex w-full min-h-12 items-center justify-center rounded-full bg-accent px-9 py-4 text-[0.72rem] uppercase tracking-wider2 text-bg shadow-lg shadow-accent/20 transition-all duration-500 hover:brightness-110 sm:w-auto"
    : "relative z-10 inline-flex w-full min-h-12 items-center justify-center rounded-full border border-ink/40 bg-elevated/50 px-9 py-4 text-[0.72rem] uppercase tracking-wider2 text-ink backdrop-blur-sm transition-all duration-500 hover:border-accent hover:bg-elevated/70 hover:text-accent sm:w-auto";

  const link = (
    <Link href={href} prefetch={false} className={cls}>
      {children}
    </Link>
  );

  if (!magnetic) return <div className="relative isolate">{link}</div>;
  return (
    <Magnetic strength={0.22} className="relative isolate">
      {link}
    </Magnetic>
  );
}

function OverflowLine({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <span className="block overflow-hidden">
      <motion.span
        className="block"
        initial={false}
        animate={{ y: "0%" }}
        transition={{ duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }}
        style={{ y: "110%" }}
      >
        {children}
      </motion.span>
    </span>
  );
}
