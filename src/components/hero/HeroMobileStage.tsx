"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import dynamic from "next/dynamic";
import { useGyroPermissionButton } from "@/lib/useDeviceTilt";
import { imageSources } from "@/lib/media";

// Full 3D scene with guitar, polygon, box, and particles — same as desktop,
// just adapted for mobile viewport and gyro control.
const SimaxScene = dynamic(
  () => import("@/components/three/SimaxScene").then((m) => m.default),
  { ssr: false, loading: () => null },
);

/**
 * Phone hero — on capable phones, two live 3D objects (the red-cherry
 * guitar centerpiece + a small red wireframe "code" polygon) nudged by the
 * device gyro, replacing the old static architecture/rover photos so the
 * mobile hero finally matches the desktop cluster's spirit while staying
 * light. Falls back to real photography + CSS parallax on low-end phones
 * or when gyro/3D isn't available.
 */
export function HeroMobileStage({ scrollProgress = 0 }: { scrollProgress?: number }) {
  const backRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const [use3D, setUse3D] = useState(false);
  const progressRef = useRef(scrollProgress);

  // SimaxScene handles gyro internally. Only the EXPLICIT button below asks
  // for iOS permission now — a background any-tap listener used to run
  // alongside it (useGyroPermissionPrompt), which could fire requestPermission()
  // on some unrelated early tap (e.g. scrolling) before the user consciously
  // tapped the button. If that unnoticed prompt got dismissed/denied, iOS
  // remembers that answer and silently refuses every request after, even
  // from the real button — likely why gyro "sometimes" stopped working.
  const { needsPrompt: needsGyroTap, request: requestGyro } = useGyroPermissionButton();

  // Diagnostic-only: visit with ?gyrodebug=1 to see live orientation values.
  // Tells us whether iOS is actually delivering motion events at all.
  const [debug, setDebug] = useState(false);
  const [gyroDbg, setGyroDbg] = useState("waiting for motion…");
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!new URLSearchParams(window.location.search).has("gyrodebug")) return;
    setDebug(true);
    let count = 0;
    const onOrient = (e: DeviceOrientationEvent) => {
      count += 1;
      setGyroDbg(
        `events:${count} beta:${(e.beta ?? 0).toFixed(1)} gamma:${(e.gamma ?? 0).toFixed(1)} abs:${e.absolute}`,
      );
    };
    window.addEventListener("deviceorientation", onOrient);
    const onGrant = () => setGyroDbg("granted — waiting for motion…");
    window.addEventListener("simax-gyro-granted", onGrant);
    return () => {
      window.removeEventListener("deviceorientation", onOrient);
      window.removeEventListener("simax-gyro-granted", onGrant);
    };
  }, []);

  useEffect(() => {
    // Very low-end phones (few cores, reduced-motion) keep the flat photo;
    // everything else gets the real, live 3D guitar.
    const cores = navigator.hardwareConcurrency ?? 4;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setUse3D(cores >= 4 && !reduce);
  }, []);

  useEffect(() => {
    progressRef.current = scrollProgress;
  }, [scrollProgress]);

  // SimaxScene handles its own animations (gyro, scroll-driven depth) — no
  // manual transform updates needed here.

  return (
    <>
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* No painted background — let the vivid theme's aurora show through so
          the phone hero matches the desktop's colourful top. Just a soft
          bottom scrim so the headline/buttons stay readable. */}
      <div
        ref={backRef}
        className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg/90"
      />

      {use3D ? (
        // Full 3D scene: guitar, polygon, box, all objects from desktop.
        // SimaxScene has built-in gyro support — no need to pass tilt.
        <SimaxScene progressRef={progressRef} />
      ) : (
        <>
          <div className="absolute inset-x-0 top-[6%] z-[3] mx-auto w-[62vw] max-w-[240px]">
           <div ref={heroRef} className="will-change-transform">
            <FoodFrame
              src="/images/real/guitar-performance.webp"
              alt="Simon Maxam playing guitar live performance"
              title="Simon Maxam"
              priority
              className="aspect-[4/5]"
              objectPosition="center 15%"
            />
           </div>
          </div>
          <div
            ref={rightRef}
            className="absolute right-[4%] top-[4%] z-[2] w-[30vw] max-w-[112px] will-change-transform"
          >
            <FoodFrame
              src="/images/real/solaris-rover.webp"
              alt="SOLARIS — lunar rover, an educational space-exploration game built in Unreal Engine 5"
              className="aspect-[4/5]"
            />
          </div>
        </>
      )}

      {/* The old "Tilt to explore" hint lived at top-[58%], which is exactly
          where the hero's text block (By Simon Maxam / paragraph) sits on
          phones — Simon found the two overlapping and unreadable. Removed:
          the explicit "Tap to enable tilt" button below covers the same
          need without covering any text. */}
    </div>
    {needsGyroTap && (
      // Rendered OUTSIDE the pointer-events-none wrapper above (this whole
      // decorative layer ignores taps) so this button is actually tappable.
      // iOS Safari only grants motion-sensor access from inside a real click
      // handler on a real element — this is that element.
      // Parked right under the header, over the guitar's headstock — the
      // hero's text block is anchored to the BOTTOM on phones (see Hero.tsx's
      // max-md:justify-end), so this top strip is guaranteed clear of it
      // regardless of device height, instead of the old percentage guess
      // that landed on top of "By Simon Maxam".
      <button
        type="button"
        onClick={requestGyro}
        className="absolute left-1/2 top-[calc(env(safe-area-inset-top)+4rem)] z-[6] -translate-x-1/2 rounded-full border border-white/30 bg-black/50 px-4 py-2 text-[0.62rem] uppercase tracking-wider2 text-white backdrop-blur-sm"
      >
        Tap to see something cool
      </button>
    )}
    {debug && (
      <div className="fixed left-2 top-24 z-[999] rounded bg-black/80 px-3 py-2 font-mono text-[0.6rem] text-lime-300">
        {gyroDbg}
      </div>
    )}
    </>
  );
}

function FoodFrame({
  src,
  alt,
  title,
  className = "",
  priority = false,
  objectPosition,
}: {
  src: string;
  alt: string;
  title?: string;
  className?: string;
  priority?: boolean;
  objectPosition?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl shadow-[0_18px_40px_rgba(0,0,0,0.45)] ring-1 ring-white/20 ${className}`}
    >
      <ResponsiveImg
        src={src}
        alt={alt}
        title={title}
        width={400}
        height={500}
        sizes="28vw"
        priority={priority}
        className="h-full w-full object-cover"
        style={objectPosition ? { objectPosition } : undefined}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/10" />
    </div>
  );
}

function ResponsiveImg({
  src,
  alt,
  title,
  width,
  height,
  sizes,
  className,
  priority,
  style,
}: {
  src: string;
  alt: string;
  title?: string;
  width: number;
  height: number;
  sizes: string;
  className?: string;
  priority?: boolean;
  style?: CSSProperties;
}) {
  const { fallback, webp } = imageSources(src);
  return (
    <picture>
      <source srcSet={webp} type="image/webp" sizes={sizes} />
      <img
        src={fallback}
        alt={alt}
        title={title}
        width={width}
        height={height}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={className}
        style={style}
      />
    </picture>
  );
}
