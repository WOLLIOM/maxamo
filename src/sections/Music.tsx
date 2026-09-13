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
      id="music"
      aria-label="Music"
      data-section="music"
      data-palette="teal"
      data-cursor-note
      className="relative mx-auto max-w-[1400px] scroll-mt-24 px-5 py-24 md:px-10 md:py-36"
    >
      <audio
        ref={audioRef}
        preload="none"
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
          lede="Five songs I wrote, recorded and produced myself — press play on any row to listen right here."
        />
        <p className="shrink-0 text-xs uppercase tracking-[0.2em] text-faint">
          Made by Simon
        </p>
      </div>

      {/* Spotify-style rows: rounded cards, cover art always visible (not
          just >=sm), tighter padding — reads as a playlist rather than a
          plain table of links, especially on phone. */}
      <Reveal delay={1}>
        <ul className="mt-12 flex flex-col gap-1">
          {tracks.map((track, i) => {
            const isActive = playingId === track.id;
            return (
              <li key={track.id}>
                <button
                  type="button"
                  onClick={() => toggle(track.id, track.src)}
                  className={`group relative flex w-full items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-left transition-colors duration-300 hover:bg-surface/70 md:gap-4 md:px-4 md:py-3 ${
                    isActive ? "bg-surface/60" : ""
                  }`}
                >
                  {/* progress fill, subtle like a playback scrubber under the row */}
                  {isActive && (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-accent"
                      style={{ width: `${progress * 100}%` }}
                    />
                  )}

                  {/* generated cover art — always shown, bigger + more rounded */}
                  <span
                    aria-hidden
                    className="relative z-10 h-12 w-12 shrink-0 overflow-hidden rounded-lg shadow-sm md:h-14 md:w-14"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${track.art[0]}, ${track.art[1]})`,
                    }}
                  >
                    <span className="absolute bottom-1 right-1.5 text-[0.7rem] font-semibold text-white/90 drop-shadow">
                      {track.title.slice(0, 1)}
                    </span>
                  </span>

                  <span className="relative z-10 flex-1 min-w-0">
                    <span
                      className={`block truncate text-[0.95rem] font-medium md:text-lg ${
                        isActive ? "text-accent" : "text-ink"
                      }`}
                    >
                      {track.title}
                    </span>
                    <span className="block truncate text-sm text-faint">
                      {track.subtitle}
                    </span>
                  </span>

                  <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink transition-transform duration-300 group-hover:scale-105 group-active:scale-95 md:h-10 md:w-10">
                    {isActive ? (
                      // animated equalizer bars while playing
                      <span className="flex h-3.5 w-3.5 items-end justify-between gap-[2px] text-accent" aria-hidden>
                        <span className="w-[2.5px] animate-eq-bar1 rounded-full bg-current" style={{ height: "100%" }} />
                        <span className="w-[2.5px] animate-eq-bar2 rounded-full bg-current" style={{ height: "60%" }} />
                        <span className="w-[2.5px] animate-eq-bar3 rounded-full bg-current" style={{ height: "80%" }} />
                      </span>
                    ) : (
                      // play icon
                      <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                        <path d="M2 1.2 10.5 6 2 10.8V1.2Z" fill="currentColor" />
                      </svg>
                    )}
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
