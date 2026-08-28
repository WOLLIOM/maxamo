"use client";

import { useEffect, useState } from "react";
import { useAudio } from "@/components/providers/AudioProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { timeOfDayLabel, type TimeOfDay } from "@/lib/time-of-day";

/** Fixed dock: ambient-sound toggle + time-of-day switch. */
export function ControlDock() {
  const audio = useAudio();
  const { theme, auto, cycle } = useTheme();

  // The theme/sound state is read from localStorage on the client, so it can
  // differ from the server-rendered default. Render the deterministic default
  // until mounted to avoid a hydration mismatch, then reflect the real state.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const shownTheme: TimeOfDay = mounted ? theme : "night";
  const shownAuto = mounted ? auto : false;
  const shownEnabled = mounted ? audio.enabled : false;

  return (
    <div className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-4 z-[60] flex items-center gap-3 sm:right-5 lg:bottom-7 lg:right-7">
      <button
        onClick={cycle}
        aria-label={`Ambience: ${
          shownAuto ? "Automatic" : timeOfDayLabel[shownTheme]
        }. Click to change.`}
        className="glass group flex min-h-12 items-center gap-2 rounded-full px-4 py-3 text-[0.62rem] uppercase tracking-wider2 text-ink transition-all duration-500 hover:text-accent"
      >
        <ThemeGlyph theme={shownTheme} />
        <span className="hidden sm:inline">
          {shownAuto ? "Auto" : timeOfDayLabel[shownTheme]}
        </span>
      </button>

      <button
        onClick={audio.toggle}
        aria-pressed={shownEnabled}
        aria-label={shownEnabled ? "Mute ambient sound" : "Play ambient sound"}
        className="glass flex h-12 w-12 min-h-12 min-w-12 items-center justify-center rounded-full text-ink transition-all duration-500 hover:text-accent"
      >
        <MusicNote active={shownEnabled} />
      </button>
    </div>
  );
}

function ThemeGlyph({ theme }: { theme: string }) {
  if (theme === "night") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.4" />
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <line
            key={i}
            x1={12 + Math.cos(a) * 7}
            y1={12 + Math.sin(a) * 7}
            x2={12 + Math.cos(a) * 9.4}
            y2={12 + Math.sin(a) * 9.4}
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

/** A musical note — gently bobs when the ambient track is playing, and shows a
 *  slash when muted, so the on/off state reads at a glance. */
function MusicNote({ active }: { active: boolean }) {
  return (
    <div className="relative flex items-center justify-center">
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
        style={{
          animation: active ? "note-bob 1.6s ease-in-out infinite" : "none",
        }}
      >
        <path
          d="M9 17V5.2l10-2.2v11"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <ellipse
          cx="6.4"
          cy="17.2"
          rx="2.6"
          ry="2.2"
          fill={active ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <ellipse
          cx="16.4"
          cy="14"
          rx="2.6"
          ry="2.2"
          fill={active ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
      {!active && (
        <span className="absolute h-[1.5px] w-[22px] rotate-45 rounded-full bg-current" />
      )}
      <style jsx>{`
        @keyframes note-bob {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-2px);
          }
        }
      `}</style>
    </div>
  );
}
