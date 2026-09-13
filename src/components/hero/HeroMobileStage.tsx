"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import dynamic from "next/dynamic";
import { useDeviceTiltRef, useGyroPermissionPrompt } from "@/lib/useDeviceTilt";
import { imageSources } from "@/lib/media";

const MobileGuitarCanvas = dynamic(
  () => import("./MobileGuitarCanvas").then((m) => m.MobileGuitarCanvas),
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
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const [gyroHint, setGyroHint] = useState(true);
  const [use3D, setUse3D] = useState(false);
  const tilt = useDeviceTiltRef(true);
  const progressRef = useRef(scrollProgress);

  useGyroPermissionPrompt();

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

  useEffect(() => {
    let frame = 0;
    const apply = () => {
      const { x, y } = tilt.current;
      const p = progressRef.current;
      if (Math.abs(x) > 0.04 || Math.abs(y) > 0.04) setGyroHint(false);

      const scrollLift = p * 40;
      const scrollFade = 1 - Math.min(1, p * 1.2);
      // No scroll "zoom" on mobile — Simon didn't want the guitar growing as
      // you scroll. It just drifts up and fades with the rest of the hero.

      if (heroRef.current) {
        heroRef.current.style.transform = `translate3d(${y * 18}px, ${x * 14 - scrollLift * 0.85}px, 0) rotate(${y * 2}deg)`;
        heroRef.current.style.opacity = String(scrollFade);
      }
      if (rightRef.current) {
        rightRef.current.style.transform = `translate3d(${y * 30}px, ${x * 22 - scrollLift}px, 0) rotate(${y * 6}deg)`;
        rightRef.current.style.opacity = String(scrollFade);
      }
      if (leftRef.current) {
        leftRef.current.style.transform = `translate3d(${y * 26}px, ${x * 18 - scrollLift * 0.9}px, 0) rotate(${-y * 4}deg)`;
        leftRef.current.style.opacity = String(scrollFade);
      }

      frame = requestAnimationFrame(apply);
    };
    frame = requestAnimationFrame(apply);
    return () => cancelAnimationFrame(frame);
  }, [tilt]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* No painted background — let the vivid theme's aurora show through so
          the phone hero matches the desktop's colourful top. Just a soft
          bottom scrim so the headline/buttons stay readable. */}
      <div
        ref={backRef}
        className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg/90"
      />

      {use3D ? (
        <>
          {/* Big centred acoustic guitar — floating, no frame, facing us.
              Outer div centres via inset-x-0 + mx-auto (margin-based, not a
              transform) so the JS animation's transform on the inner heroRef
              can never clobber the centering — a translate-x-1/2 utility here
              was silently not applying in production. */}
          <div className="absolute inset-x-0 top-[3%] z-[3] mx-auto w-[92vw] max-w-[400px]">
            <div ref={heroRef} className="relative aspect-[3/4] w-full will-change-transform">
              <MobileGuitarCanvas className="absolute inset-0 h-full w-full" variant="guitar" tilt={tilt} />
            </div>
          </div>

          {/* Red rotating code polygon, floating just above the guitar,
              slightly right of centre (Simon wanted this kept on mobile). */}
          <div
            ref={rightRef}
            className="absolute left-[56%] top-[1%] z-[4] aspect-square w-[24vw] max-w-[108px] will-change-transform"
          >
            <MobileGuitarCanvas className="absolute inset-0 h-full w-full" variant="code" tilt={tilt} />
          </div>
        </>
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

      {gyroHint && (
        <p className="absolute left-0 right-0 top-[58%] z-[4] text-center text-[0.58rem] uppercase tracking-ultra text-faint">
          Tilt to explore
        </p>
      )}
    </div>
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
