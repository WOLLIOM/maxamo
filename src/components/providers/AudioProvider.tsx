"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface AudioContextValue {
  enabled: boolean;
  toggle: () => void;
  enable: () => void;
  /** Fade out + pause the ambient track WITHOUT touching the persisted
   *  on/off preference — used when a real recording (Music section) starts
   *  playing, so the two don't mix. Pairs with resumeAfterTrack(). */
  duckForTrack: () => void;
  /** Resume the ambient track after a duckForTrack(), but only if it was
   *  actually playing beforehand (and the visitor hasn't since muted it). */
  resumeAfterTrack: () => void;
}

const AudioCtx = createContext<AudioContextValue | null>(null);

const TRACK = "/audio/replay.mp3";
const TARGET_VOLUME = 0.32;
const FADE_MS = 1600;
const STORAGE_KEY = "simax-sound";

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const enabledRef = useRef(false);
  // True while the ambient track has been paused specifically for a
  // recording (not by the visitor muting it) — resumeAfterTrack() only acts
  // when this is true, so it can't accidentally un-mute someone who muted
  // ambient sound on their own.
  const duckedRef = useRef(false);
  const [enabled, setEnabled] = useState(false);

  const setEnabledBoth = useCallback((v: boolean) => {
    enabledRef.current = v;
    setEnabled(v);
  }, []);

  const fadeTo = useCallback(
    (target: number, onDone?: () => void, ms: number = FADE_MS) => {
      const el = audioRef.current;
      if (!el) return;
      if (fadeRef.current) clearInterval(fadeRef.current);
      const start = el.volume;
      const startTime = performance.now();
      fadeRef.current = setInterval(() => {
        const t = Math.min(1, (performance.now() - startTime) / ms);
        el.volume = Math.max(0, Math.min(1, start + (target - start) * t));
        if (t >= 1) {
          if (fadeRef.current) clearInterval(fadeRef.current);
          onDone?.();
        }
      }, 40);
    },
    [],
  );

  const persist = (value: "on" | "off") => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* storage unavailable — ignore */
    }
  };

  const enable = useCallback(() => {
    const el = audioRef.current;
    if (!el || enabledRef.current) return;
    el.play()
      .then(() => {
        setEnabledBoth(true);
        persist("on");
        fadeTo(TARGET_VOLUME);
      })
      .catch(() => {
        // Autoplay still blocked — a later gesture will retry.
        setEnabledBoth(false);
      });
  }, [fadeTo, setEnabledBoth]);

  const toggle = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (enabledRef.current) {
      fadeTo(0, () => el.pause());
      setEnabledBoth(false);
      persist("off");
    } else {
      el.play()
        .then(() => {
          setEnabledBoth(true);
          persist("on");
          fadeTo(TARGET_VOLUME);
        })
        .catch(() => setEnabledBoth(false));
    }
  }, [fadeTo, setEnabledBoth]);

  const duckForTrack = useCallback(() => {
    const el = audioRef.current;
    if (!el || !enabledRef.current) return; // nothing playing to duck
    duckedRef.current = true;
    fadeTo(0, () => {
      if (audioRef.current) audioRef.current.pause();
    }, 400); // quick fade — a recording is about to start right after
  }, [fadeTo]);

  const resumeAfterTrack = useCallback(() => {
    const el = audioRef.current;
    if (!el || !duckedRef.current) return;
    duckedRef.current = false;
    if (!enabledRef.current) return; // visitor muted ambient in the meantime
    el.play()
      .then(() => fadeTo(TARGET_VOLUME, undefined, 1200))
      .catch(() => {});
  }, [fadeTo]);

  // Create the element and, unless the visitor previously muted, arm the
  // soundtrack to begin on the very first interaction (autoplay-policy safe).
  useEffect(() => {
    const el = new Audio(TRACK);
    el.loop = true;
    el.preload = "none";
    el.volume = 0;
    audioRef.current = el;

    let pref: string | null = null;
    try {
      pref = localStorage.getItem(STORAGE_KEY);
    } catch {
      pref = null;
    }

    // On phones the soundtrack stays off until the visitor explicitly turns it
    // on (no arming on the first tap); on desktop it arms unless muted before.
    const isTouch =
      typeof window !== "undefined" &&
      (window.matchMedia?.("(pointer: coarse)").matches || "ontouchstart" in window);
    const armAuto = isTouch ? pref === "on" : pref !== "off";

    let cleanupGesture: (() => void) | undefined;
    if (armAuto) {
      // Try immediately (works if the tab already has engagement), otherwise
      // wait for the first gesture anywhere on the page.
      el.play()
        .then(() => {
          setEnabledBoth(true);
          fadeTo(TARGET_VOLUME);
        })
        .catch(() => {
          const start = () => {
            enable();
            cleanupGesture?.();
          };
          const events = ["pointerdown", "keydown", "wheel", "touchstart"] as const;
          events.forEach((e) =>
            window.addEventListener(e, start, { once: true, passive: true }),
          );
          cleanupGesture = () =>
            events.forEach((e) => window.removeEventListener(e, start));
        });
    }

    return () => {
      cleanupGesture?.();
      el.pause();
      audioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When the visitor looks away (tab hidden or window blurred) fade the track
  // all the way out and pause it; when they return, resume and fade it back in.
  useEffect(() => {
    function away() {
      const el = audioRef.current;
      if (!el || !enabledRef.current) return;
      fadeTo(
        0,
        () => {
          if (audioRef.current && enabledRef.current) audioRef.current.pause();
        },
        2200,
      );
    }
    function back() {
      const el = audioRef.current;
      if (!el || !enabledRef.current) return;
      el.play()
        .then(() => fadeTo(TARGET_VOLUME, undefined, 1800))
        .catch(() => {});
    }
    function onVisibility() {
      if (document.hidden) away();
      else back();
    }
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", away);
    window.addEventListener("focus", back);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", away);
      window.removeEventListener("focus", back);
    };
  }, [fadeTo]);

  const value = useMemo(
    () => ({ enabled, toggle, enable, duckForTrack, resumeAfterTrack }),
    [enabled, toggle, enable, duckForTrack, resumeAfterTrack],
  );

  return <AudioCtx.Provider value={value}>{children}</AudioCtx.Provider>;
}

export function useAudio() {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error("useAudio must be used within AudioProvider");
  return ctx;
}
