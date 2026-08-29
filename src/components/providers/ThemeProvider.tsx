"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  getTimeOfDay,
  msUntilNextPhase,
  type TimeOfDay,
} from "@/lib/time-of-day";

interface ThemeContextValue {
  theme: TimeOfDay;
  /** true when the theme is following the visitor's local clock. */
  auto: boolean;
  /** Manually pick a theme (disables auto). */
  setTheme: (t: TimeOfDay) => void;
  /** Cycle night → morning → evening → auto. */
  cycle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "simax-theme";
/** Golden hour is the default look on first visit. */
const DEFAULT_THEME: TimeOfDay = "evening";

function applyTheme(theme: TimeOfDay) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<TimeOfDay>(DEFAULT_THEME);
  const [auto, setAuto] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate from the saved preference (matches the pre-paint script in layout).
  useEffect(() => {
    let pref: string | null = null;
    try {
      pref = localStorage.getItem(STORAGE_KEY);
    } catch {
      pref = null;
    }
    if (pref === "auto") {
      setAuto(true);
    } else if (pref === "morning" || pref === "evening" || pref === "night") {
      setAuto(false);
      setThemeState(pref);
      applyTheme(pref);
    } else {
      // No stored choice → golden-hour default.
      setAuto(false);
      setThemeState(DEFAULT_THEME);
      applyTheme(DEFAULT_THEME);
    }
  }, []);

  // When in auto mode, follow the local clock and re-check at each phase edge.
  useEffect(() => {
    if (!auto) return;

    function sync() {
      const next = getTimeOfDay();
      setThemeState(next);
      applyTheme(next);
      timer.current = setTimeout(sync, msUntilNextPhase() + 500);
    }
    sync();

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [auto]);

  const persist = (value: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* storage unavailable — ignore */
    }
  };

  const setTheme = (t: TimeOfDay) => {
    setAuto(false);
    setThemeState(t);
    applyTheme(t);
    persist(t);
  };

  const cycle = () => {
    const order: (TimeOfDay | "auto")[] = ["night", "morning", "evening", "auto"];
    const current = auto ? "auto" : theme;
    const idx = order.indexOf(current);
    const next = order[(idx + 1) % order.length];
    if (next === "auto") {
      setAuto(true);
      persist("auto");
    } else {
      setTheme(next);
    }
  };

  const value = useMemo(
    () => ({ theme, auto, setTheme, cycle }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme, auto],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
