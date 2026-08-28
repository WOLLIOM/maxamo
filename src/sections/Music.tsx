"use client";

import { useRef, useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { tracks } from "@/lib/tracks";

/**
 * A real, playable track list of Simon's own recordings — separate from the
 * small ambient MusicDock. One <audio> element, one track played at a time,
 * a minimal progress bar per row.
 */
export function Music() {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function toggle(id: string, src: string) {
    const audio = audioRef.current;
    if (!audio) return;

    if (playingId === id) {
      audio.pause();
      setPlayingId(null);
      return;
    }

    audio.src = src;
    audio.currentTime = 0;
    audio.play().catch(() => {});
    setPlayingId(id);
  }

  return (
    <section
      aria-label="Music"
      className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-36"
    >
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => {
          const el = e.currentTarget;
          setProgress(el.duration ? el.currentTime / el.duration : 0);
        }}
        onEnded={() => {
          setPlayingId(null);
          setProgress(0);
        }}
      />

      <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
        <SectionHeading
          kicker="Recordings"
          title="Music"
          lede="Eight of my own tracks — press play on any row to listen right here."
        />
      </div>

      <Reveal delay={1}>
        <ul className="mt-12 divide-y divide-line border-y border-line">
          {tracks.map((track, i) => {
            const isActive = playingId === track.id;
            return (
              <li key={track.id}>
                <button
                  type="button"
                  onClick={() => toggle(track.id, track.src)}
                  className="group relative flex w-full items-center gap-5 overflow-hidden py-5 text-left transition-colors hover:bg-surface/60"
                >
                  {/* progress fill */}
                  {isActive && (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-y-0 left-0 bg-ink/[0.04]"
                      style={{ width: `${progress * 100}%` }}
                    />
                  )}

                  <span className="relative z-10 w-7 shrink-0 text-sm tabular-nums text-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-ink transition-colors group-hover:border-ink/40">
                    {isActive ? (
                      // pause icon
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <rect x="2" y="1" width="3" height="10" fill="currentColor" />
                        <rect x="7" y="1" width="3" height="10" fill="currentColor" />
                      </svg>
                    ) : (
                      // play icon
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 1.2 10.5 6 2 10.8V1.2Z" fill="currentColor" />
                      </svg>
                    )}
                  </span>

                  <span className="relative z-10 flex-1 min-w-0">
                    <span className="block truncate text-base font-medium text-ink md:text-lg">
                      {track.title}
                    </span>
                    <span className="block truncate text-sm text-faint">
                      {track.subtitle}
                    </span>
                  </span>

                  <span className="relative z-10 hidden shrink-0 text-xs uppercase tracking-wider text-faint md:block">
                    {isActive ? "Playing" : "Play"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </Reveal>
    </section>
  );
}
