"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { THEME_ORDER, isTheme, type TimeOfDay } from "@/lib/time-of-day";

interface ThemeContextValue {
  theme: TimeOfDay;
  /** Kept for API compatibility with the dock; presets are always manual now. */
  auto: boolean;
  /** Pick a specific preset. */
  setTheme: (t: TimeOfDay) => void;
  /** Advance to the next preset in THEME_ORDER. */
  cycle: () => void;
  /** Apply a theme from the scroll journey (does not persist as a choice). */
  setScene: (t: TimeOfDay) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// Bumped to -v2 so returning visitors pick up the new Monochrome default
// instead of an old saved preference.
const STORAGE_KEY = "simax-theme-v2";
/** Monochrome is the default look on first visit. */
// Vivid is the site's signature look — it's what the hero is designed around,
// so a first-time visitor should land on it rather than the muted mono preset.
const DEFAULT_THEME: TimeOfDay = "vivid";

/** Applies the preset and briefly enables the color-transition class so the
 *  switch animates smoothly without paying that cost the rest of the time. */
function applyTheme(theme: TimeOfDay, animate = false) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (animate) {
    root.classList.add("theme-anim");
    window.clearTimeout((applyTheme as { _t?: number })._t);
    (applyTheme as { _t?: number })._t = window.setTimeout(
      () => root.classList.remove("theme-anim"),
      600,
    );
  }
  root.setAttribute("data-theme", theme);
  // Let canvas visuals (cursor field, etc.) re-read the new accent colors.
  window.dispatchEvent(new CustomEvent("themechange", { detail: theme }));
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<TimeOfDay>(DEFAULT_THEME);
  const mounted = useRef(false);

  // Hydrate from the saved preference (matches the pre-paint script in layout).
  useEffect(() => {
    let pref: string | null = null;
    try {
      pref = localStorage.getItem(STORAGE_KEY);
    } catch {
      pref = null;
    }
    const next = isTheme(pref) ? pref : DEFAULT_THEME;
    setThemeState(next);
    applyTheme(next);
    mounted.current = true;
  }, []);

  const setTheme = (t: TimeOfDay) => {
    setThemeState(t);
    applyTheme(t, true);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      /* storage unavailable — ignore */
    }
  };

  const cycle = () => {
    const idx = THEME_ORDER.indexOf(theme);
    setTheme(THEME_ORDER[(idx + 1) % THEME_ORDER.length]);
  };

  // Scroll journey: apply the section's theme INSTANTLY (no per-element colour
  // transition) so switching while scrolling stays smooth — the animated
  // cross-fade is only for deliberate dock picks.
  const setScene = (t: TimeOfDay) => {
    setThemeState((prev) => {
      if (prev === t || typeof document === "undefined") return prev;
      const root = document.documentElement;
      root.classList.add("theme-instant");
      root.setAttribute("data-theme", t);
      window.dispatchEvent(new CustomEvent("themechange", { detail: t }));
      requestAnimationFrame(() =>
        requestAnimationFrame(() => root.classList.remove("theme-instant")),
      );
      return t;
    });
  };

  const value = useMemo(
    () => ({ theme, auto: false, setTheme, cycle, setScene }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
