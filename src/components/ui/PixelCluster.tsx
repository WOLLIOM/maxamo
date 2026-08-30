"use client";

import { Magnetic } from "@/components/ui/Magnetic";

/**
 * A small, loose scatter of glowing orange pixels — same accent-orange as
 * the cursor particle field — parked along a section edge. Deliberately
 * irregular (not a filled grid) so it reads as an abstract dust of pixels
 * rather than a solid block. The whole cluster leans toward the cursor on
 * hover (via Magnetic), and each pixel drifts on its own slow float so it
 * never looks static even at rest.
 */
export function PixelCluster({
  className = "",
  count = 9,
  seed = 0,
}: {
  className?: string;
  count?: number;
  seed?: number;
}) {
  const pixels = Array.from({ length: count }, (_, i) => {
    // Deterministic pseudo-random layout so SSR/client markup matches.
    // Radial jitter instead of a snapped grid keeps the cluster loose and
    // abstract rather than reading as a filled square.
    const n = (i + 1) * (seed + 7);
    const angle = ((n * 41) % 360) * (Math.PI / 180);
    const radius = 8 + ((n * 29) % 100) * 0.34; // 8–42% from center, uneven
    const gx = 50 + Math.cos(angle) * radius;
    const gy = 50 + Math.sin(angle) * radius;
    const size = 2 + ((n * 13) % 3) * 1.5;
    const delay = ((n * 17) % 20) / 10;
    const opacity = 0.3 + ((n * 11) % 50) / 100;
    return { gx, gy, size, delay, opacity, key: i };
  });

  return (
    <Magnetic strength={0.5} className={`pointer-events-auto ${className}`}>
      <div
        aria-hidden
        className="relative h-14 w-14 opacity-60 transition-opacity duration-500 hover:opacity-100"
      >
        {pixels.map((p) => (
          <span
            key={p.key}
            className="absolute animate-pixel-float rounded-[1px] bg-accent"
            style={{
              left: `${p.gx}%`,
              top: `${p.gy}%`,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
              animationDelay: `${p.delay}s`,
              boxShadow: "0 0 6px rgba(214,86,48,0.55)",
            }}
          />
        ))}
      </div>
    </Magnetic>
  );
}
