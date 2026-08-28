"use client";

import { useEffect, useState } from "react";
import { useMusic } from "@/components/providers/MusicProvider";
import { tracks } from "@/lib/tracks";

/**
 * A small "my mixtape" player, separate from the site's ambient sound
 * toggle (see ControlDock). Lists Simon's own recordings — persists across
 * page navigation (single <audio> element lives in MusicProvider) and,
 * once a track has loaded once, keeps playing with no network connection
 * thanks to the service worker in /public/sw.js.
 */
export function MusicDock() {
  const music = useMusic();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (tracks.length === 0) return null;

  const current = tracks[music.index];
  const playing = mounted && music.playing;

  return (
    <div className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] left-4 z-[60] sm:left-5 lg:bottom-7 lg:left-7">
      {open && (
        <div className="glass mb-3 w-[min(88vw,320px)] rounded-2xl p-3">
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-[0.6rem] uppercase tracking-wider2 text-muted">
              My recordings
            </span>
            {mounted && music.offlineReady && (
              <span className="text-[0.58rem] uppercase tracking-wider2 text-accent">
                Offline ready
              </span>
            )}
          </div>
          <ul className="max-h-52 space-y-1 overflow-y-auto">
            {tracks.map((t, i) => (
              <li key={t.id}>
                <button
                  onClick={() => music.play(i)}
                  className={`flex w-full min-h-11 items-center justify-between rounded-xl px-3 py-2 text-left transition-colors duration-300 ${
                    i === music.index
                      ? "bg-accent/15 text-accent"
                      : "text-ink hover:bg-elevated/60"
                  }`}
                >
                  <span className="truncate">
                    <span className="block text-sm">{t.title}</span>
                    <span className="block text-[0.65rem] text-muted">{t.subtitle}</span>
                  </span>
                  {i === music.index && playing && (
                    <span aria-hidden className="ml-2 flex shrink-0 gap-[2px]">
                      {[0, 1, 2].map((b) => (
                        <span
                          key={b}
                          className="w-[3px] rounded-full bg-accent"
                          style={{
                            height: 10,
                            animation: `dock-bar 0.9s ease-in-out ${b * 0.15}s infinite`,
                          }}
                        />
                      ))}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>

          {durationBar(music, mounted)}

          <div className="mt-2 flex items-center justify-center gap-4 px-1">
            <button
              aria-label="Previous track"
              onClick={music.prev}
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:text-accent"
            >
              ‹
            </button>
            <button
              aria-label={playing ? "Pause" : "Play"}
              onClick={music.togglePlay}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-accent hover:text-accent"
            >
              {playing ? <PauseIcon /> : <PlayIcon />}
            </button>
            <button
              aria-label="Next track"
              onClick={music.next}
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:text-accent"
            >
              ›
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close my recordings player" : "Open my recordings player"}
        className="glass flex min-h-12 items-center gap-2 rounded-full px-4 py-3 text-[0.62rem] uppercase tracking-wider2 text-ink transition-all duration-500 hover:text-accent"
        title={current?.title}
      >
        <span aria-hidden>{playing ? <PauseIcon small /> : <PlayIcon small />}</span>
        <span className="hidden max-w-[9rem] truncate sm:inline">
          {current?.title ?? "My mixtape"}
        </span>
      </button>

      <style jsx>{`
        @keyframes dock-bar {
          0%,
          100% {
            transform: scaleY(0.4);
          }
          50% {
            transform: scaleY(1);
          }
        }
      `}</style>
    </div>
  );
}

function durationBar(music: ReturnType<typeof useMusic>, mounted: boolean) {
  const dur = mounted ? music.duration : 0;
  const cur = mounted ? music.currentTime : 0;
  const pct = dur > 0 ? Math.min(100, (cur / dur) * 100) : 0;
  return (
    <div className="mt-2 px-1">
      <input
        type="range"
        min={0}
        max={dur || 0}
        step={0.1}
        value={cur}
        onChange={(e) => music.seek(Number(e.target.value))}
        aria-label="Seek"
        className="h-1 w-full accent-[rgb(var(--c-accent))]"
        style={{
          background: `linear-gradient(90deg, rgb(var(--c-accent)) ${pct}%, rgb(var(--c-line)/0.7) ${pct}%)`,
        }}
      />
    </div>
  );
}

function PlayIcon({ small }: { small?: boolean }) {
  const s = small ? 13 : 16;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden>
      <path d="M8 5v14l11-7z" fill="currentColor" />
    </svg>
  );
}

function PauseIcon({ small }: { small?: boolean }) {
  const s = small ? 13 : 16;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden>
      <rect x="6" y="5" width="4" height="14" fill="currentColor" />
      <rect x="14" y="5" width="4" height="14" fill="currentColor" />
    </svg>
  );
}
