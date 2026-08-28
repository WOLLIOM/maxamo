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
import { tracks } from "@/lib/tracks";

interface MusicContextValue {
  index: number;
  playing: boolean;
  currentTime: number;
  duration: number;
  offlineReady: boolean;
  play: (i: number) => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  seek: (t: number) => void;
}

const MusicCtx = createContext<MusicContextValue | null>(null);

const STORAGE_KEY = "simax-music-index";

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [offlineReady, setOfflineReady] = useState(false);

  // Refs mirroring state so the stable callbacks below always see the
  // latest index without needing to be recreated on every change.
  const indexRef = useRef(index);
  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  const play = useCallback((i: number) => {
    const el = audioRef.current;
    if (!el || !tracks[i]) return;
    if (i !== indexRef.current) {
      el.src = tracks[i].src;
      setIndex(i);
      try {
        localStorage.setItem(STORAGE_KEY, String(i));
      } catch {
        /* ignore */
      }
    }
    el.play().catch(() => setPlaying(false));
  }, []);

  const next = useCallback(() => {
    const i = (indexRef.current + 1) % tracks.length;
    play(i);
  }, [play]);

  const nextRef = useRef(next);
  useEffect(() => {
    nextRef.current = next;
  }, [next]);

  // One <audio> element for the whole app lifetime — switching pages with
  // the router never remounts this provider, so a song keeps playing as you
  // navigate between "/", "/gallery", "/about", etc.
  useEffect(() => {
    const el = new Audio();
    el.preload = "none";
    audioRef.current = el;

    let saved = 0;
    try {
      const raw = Number(localStorage.getItem(STORAGE_KEY));
      if (!Number.isNaN(raw) && raw >= 0 && raw < tracks.length) saved = raw;
    } catch {
      /* ignore */
    }
    setIndex(saved);
    el.src = tracks[saved]?.src ?? "";

    const onTime = () => setCurrentTime(el.currentTime);
    const onDur = () => setDuration(el.duration || 0);
    const onEnd = () => nextRef.current();
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onDur);
    el.addEventListener("ended", onEnd);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);

    // Registers the service worker that caches /audio/*.mp3 for offline
    // playback — once a track has played once, it plays without a network
    // connection from then on.
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => setOfflineReady(true))
        .catch(() => setOfflineReady(false));
    }

    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onDur);
      el.removeEventListener("ended", onEnd);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.pause();
      audioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const togglePlay = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      if (!el.src) el.src = tracks[indexRef.current]?.src ?? "";
      el.play().catch(() => setPlaying(false));
    } else {
      el.pause();
    }
  }, []);

  const prev = useCallback(() => {
    const i = (indexRef.current - 1 + tracks.length) % tracks.length;
    play(i);
  }, [play]);

  const seek = useCallback((t: number) => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = t;
    setCurrentTime(t);
  }, []);

  const value = useMemo(
    () => ({ index, playing, currentTime, duration, offlineReady, play, togglePlay, next, prev, seek }),
    [index, playing, currentTime, duration, offlineReady, play, togglePlay, next, prev, seek],
  );

  return <MusicCtx.Provider value={value}>{children}</MusicCtx.Provider>;
}

export function useMusic() {
  const ctx = useContext(MusicCtx);
  if (!ctx) throw new Error("useMusic must be used within MusicProvider");
  return ctx;
}
