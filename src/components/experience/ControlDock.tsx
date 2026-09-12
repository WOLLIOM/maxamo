"use client";

import { useEffect, useState } from "react";
import { useAudio } from "@/components/providers/AudioProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { timeOfDayLabel, type TimeOfDay } from "@/lib/time-of-day";

/** Fixed dock: ambient-sound toggle + time-of-day switch. */
export function ControlDock() {
  const audio = useAudio();
  const { theme, cycle } = useTheme();

  // The theme/sound state is read from localStorage on the client, so it can
  // differ from the server-rendered default. Render the deterministic default
  // until mounted to avoid a hydration mismatch, then reflect the real state.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const shownTheme: TimeOfDay = mounted ? theme : "evening";
  const shownEnabled = mounted ? audio.enabled : false;

  return (
    <div className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-4 z-[60] flex items-center gap-3 sm:right-5 lg:bottom-7 lg:right-7">
      <button
        onClick={cycle}
        aria-label={`Theme: ${timeOfDayLabel[shownTheme]}. Click to switch.`}
        className="glass group flex min-h-12 items-center gap-2 rounded-full px-4 py-3 text-[0.62rem] uppercase tracking-wider2 text-ink transition-all duration-500 hover:text-accent"
      >
        <span
          aria-hidden
          className="h-3.5 w-3.5 rounded-full border border-ink/20 bg-accent transition-colors duration-500"
        />
        <span className="hidden sm:inline">{timeOfDayLabel[shownTheme]}</span>
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
