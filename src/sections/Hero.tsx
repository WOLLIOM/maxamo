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
import { HeroMobileStage } from "@/components/hero/HeroMobileStage";
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
  const [mountScene, setMountScene] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [progressLabel, setProgressLabel] = useState(0);

  useEffect(() => {
    const touch =
      window.matchMedia("(pointer: coarse)").matches ||
      (navigator.maxTouchPoints > 0 && window.innerWidth < 900);
    setIsTouch(touch);

    // Phones/tablets always get the dedicated mobile stage: just the
    // guitar, gyroscope-driven, far lighter than the full desktop scene.
    // The full multi-object SimaxScene (with its own "lite" mode) is
    // reserved for desktop/pointer devices so it stays visually rich there
    // without dragging phone framerates down.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cores = navigator.hardwareConcurrency ?? 8;
    setMountScene(!reduce && cores > 2 && !touch);
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
  const runway = isTouch ? "140vh" : "165vh";

  return (
    <section
      ref={ref}
      aria-label="Introduction"
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

        {/* WebGL scene — never steals taps from the CTAs */}
        <div className="pointer-events-none absolute inset-0 z-0">
          {mountScene ? (
            <SimaxScene progressRef={progressRef} />
          ) : (
            <HeroMobileStage scrollProgress={progressLabel} />
          )}
        </div>

        {/* Golden top light — the cinematic key light for the whole scene */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-[60%] max-md:h-[45%]"
          style={{
            background:
              "radial-gradient(60% 100% at 50% 0%, rgb(var(--c-gold)/0.35), transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-px"
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

        {/* Stage 1 — brand + CTAs */}
        <motion.div
          style={{ y: contentY, opacity: contentOpacity, scale: contentScale }}
          className="relative z-20 mx-auto flex h-full w-full max-w-5xl flex-col items-center px-6 text-center max-md:justify-end max-md:pb-28 max-md:pt-[46vh] md:justify-center"
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
            className="mb-6 flex items-center gap-3"
          >
            <span className="h-px w-10 bg-accent/60" />
            <span className="kicker">Game Dev · Architecture · Music · Code</span>
            <span className="h-px w-10 bg-accent/60" />
          </motion.div>

          <h1 className="font-serif text-[clamp(2.15rem,11vw,3.35rem)] font-light leading-[0.92] text-ink md:text-fluid-hero md:leading-[0.86]">
            <OverflowLine delay={0.3}>{site.name}</OverflowLine>
            <span className="sr-only"> — Simon Maxam's Interactive Portfolio</span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.55 }}
            className="mt-2 text-[0.72rem] uppercase tracking-wider2 text-accent md:text-sm"
          >
            Simon Maxam
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.7 }}
            className="mt-4 max-w-md text-balance text-sm font-medium leading-relaxed text-ink/85 max-md:mt-3 md:mt-7 md:text-base md:text-lg"
          >
            {site.tagline}. I'm Simon Maxam — a multidisciplinary creator
            building immersive experiences across games, architecture,
            music and code.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.9 }}
            className="relative z-30 mt-6 flex w-full max-w-sm flex-col items-stretch gap-3 pb-4 sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-5 md:mt-10 md:pb-0"
          >
            <Cta href="/contact" primary magnetic={!isTouch}>
              Get in touch
            </Cta>
            <span
              aria-hidden
              className="hidden h-px w-8 bg-line/80 sm:block"
            />
            <Cta href="/gallery" magnetic={!isTouch}>
              View projects
            </Cta>
          </motion.div>
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
        <div className="pointer-events-none absolute bottom-7 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-2 sm:bottom-9">
          <span className="text-[0.58rem] uppercase tracking-ultra text-faint">
            Scroll
          </span>
          <div className="h-px w-24 overflow-hidden bg-line/70">
            <div
              className="h-full bg-accent transition-[width] duration-150 ease-out"
              style={{ width: `${Math.min(100, progressLabel * 100)}%` }}
            />
          </div>
          <span className="text-[0.58rem] tabular-nums tracking-wider2 text-faint">
            {String(Math.min(2, Math.floor(progressLabel * 2) + 1)).padStart(2, "0")}{" "}
            / 02
          </span>
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
