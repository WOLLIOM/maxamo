"use client";

import Image from "next/image";

/** Lightweight hero atmosphere when WebGL is skipped on touch devices. */
export function HeroStillBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="relative h-full w-full">
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, rgb(var(--glow)/0.35), transparent 55%), radial-gradient(90% 70% at 80% 100%, rgb(var(--c-accent)/0.12), transparent 50%)",
        }}
      />
      <Image
        src="/images/counter-dusk.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-[0.22] mix-blend-luminosity"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-bg/30 via-bg/55 to-bg/85" />
      </div>
    </div>
  );
}
