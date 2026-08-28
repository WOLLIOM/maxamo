"use client";

import { useState } from "react";

/** Lazy map facade — avoids loading Google Maps until the visitor asks for it. */
export function MapEmbed({
  src,
  title,
  className = "",
}: {
  src: string;
  title: string;
  className?: string;
}) {
  const [active, setActive] = useState(false);

  if (active) {
    return (
      <iframe
        title={title}
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className={`absolute inset-0 h-full w-full grayscale-[0.3] contrast-[1.05] ${className}`}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setActive(true)}
      className={`group absolute inset-0 flex h-full w-full flex-col items-center justify-center gap-3 bg-surface/80 text-center transition-colors hover:bg-surface ${className}`}
      aria-label={`Load map: ${title}`}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-line/80 bg-elevated/80 text-ink transition-colors group-hover:border-accent group-hover:text-accent">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 21s7-4.5 7-11a7 7 0 10-14 0c0 6.5 7 11 7 11z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <circle cx="12" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </span>
      <span className="text-[0.68rem] uppercase tracking-wider2 text-muted transition-colors group-hover:text-ink">
        Tap to load map
      </span>
    </button>
  );
}
