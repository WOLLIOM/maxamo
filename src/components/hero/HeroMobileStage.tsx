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

      const scrollLift = p * 36;
      const scrollFade = 1 - Math.min(1, p * 1.15);

      if (backRef.current) {
        backRef.current.style.transform = `translate3d(${y * 6}px, ${x * 5 - scrollLift * 0.25}px, 0) scale(1.08)`;
        backRef.current.style.opacity = String(0.92 * scrollFade);
      }
      if (heroRef.current) {
        heroRef.current.style.transform = `translate3d(${y * 22}px, ${x * 16 - scrollLift * 0.85}px, 0) rotate(${y * 2.5}deg)`;
        heroRef.current.style.opacity = String(scrollFade);
      }
      if (leftRef.current) {
        leftRef.current.style.transform = `translate3d(${y * 30}px, ${x * 22 - scrollLift}px, 0) rotate(${-y * 4}deg)`;
        leftRef.current.style.opacity = String(scrollFade);
      }
      if (rightRef.current) {
        rightRef.current.style.transform = `translate3d(${y * 26}px, ${x * 18 - scrollLift * 0.9}px, 0) rotate(${y * 5}deg)`;
        rightRef.current.style.opacity = String(scrollFade);
      }

      frame = requestAnimationFrame(apply);
    };
    frame = requestAnimationFrame(apply);
    return () => cancelAnimationFrame(frame);
  }, [tilt]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div ref={backRef} className="absolute inset-0 will-change-transform">
        <ResponsiveImg
          src="/images/real/solaris-earth-moon.png"
          alt=""
          sizes="100vw"
          className="absolute inset-0 h-full w-full object-cover object-[center_35%] opacity-40"
          width={1280}
          height={719}
          priority
        />
        <div className="absolute inset-0 bg-bg/55" />
        <div className="absolute inset-0 bg-gradient-to-b from-bg/10 via-transparent to-bg/95" />
      </div>

      <div
        ref={heroRef}
        className="absolute left-1/2 top-[7%] z-[3] w-[40vw] max-w-[168px] -translate-x-1/2 will-change-transform"
      >
        {use3D ? (
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-[0_18px_40px_rgba(0,0,0,0.45)] ring-1 ring-white/20">
            <MobileGuitarCanvas className="absolute inset-0 h-full w-full" variant="guitar" tilt={tilt} />
          </div>
        ) : (
          <FoodFrame
            src="/images/real/guitar-performance.jpg"
            alt="Simon Maxam playing guitar live performance"
            title="Simon Maxam"
            priority
            className="aspect-[4/5]"
            objectPosition="center 15%"
          />
        )}
      </div>

      {use3D ? (
        <div
          ref={rightRef}
          className="absolute right-[6%] top-[22%] z-[2] h-[26vw] max-h-[104px] w-[26vw] max-w-[104px] will-change-transform"
        >
          <MobileGuitarCanvas className="absolute inset-0 h-full w-full" variant="code" tilt={tilt} />
        </div>
      ) : (
        <>
          <div
            ref={leftRef}
            className="absolute left-[4%] top-[22%] z-[2] w-[28vw] max-w-[108px] will-change-transform"
          >
            <FoodFrame
              src="/images/generated/arch-model-lit.png"
              alt="Architectural model"
              className="aspect-square"
            />
          </div>

          <div
            ref={rightRef}
            className="absolute right-[3%] top-[18%] z-[2] w-[30vw] max-w-[112px] will-change-transform"
          >
            <FoodFrame
              src="/images/real/solaris-rover.png"
              alt="SOLARIS — lunar rover, an educational space-exploration game built in Unreal Engine 5"
              className="aspect-[4/5]"
            />
          </div>
        </>
      )}

      {gyroHint && (
        <p className="absolute left-0 right-0 top-[52%] z-[4] text-center text-[0.58rem] uppercase tracking-ultra text-faint">
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
