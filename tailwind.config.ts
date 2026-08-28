import type { Config } from "tailwindcss";

/**
 * YŪGEN design system.
 *
 * Every colour is driven by a CSS custom property so the entire palette can be
 * re-themed at runtime for the time-of-day system (morning / evening / night)
 * with a single attribute change on <html>. See globals.css for the tokens.
 */
const config: Config = {
  darkMode: ["class", '[data-theme="night"]'],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/sections/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--c-bg) / <alpha-value>)",
        surface: "rgb(var(--c-surface) / <alpha-value>)",
        elevated: "rgb(var(--c-elevated) / <alpha-value>)",
        ink: "rgb(var(--c-ink) / <alpha-value>)",
        muted: "rgb(var(--c-muted) / <alpha-value>)",
        faint: "rgb(var(--c-faint) / <alpha-value>)",
        line: "rgb(var(--c-line) / <alpha-value>)",
        accent: "rgb(var(--c-accent) / <alpha-value>)",
        accentSoft: "rgb(var(--c-accent-soft) / <alpha-value>)",
        gold: "rgb(var(--c-gold) / <alpha-value>)",
        silver: "rgb(var(--c-silver) / <alpha-value>)",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        jp: [
          "Hiragino Mincho ProN",
          "Yu Mincho",
          "Noto Serif JP",
          "MS PMincho",
          "var(--font-serif)",
          "Georgia",
          "serif",
        ],
      },
      letterSpacing: {
        ultra: "0.42em",
        wider2: "0.28em",
      },
      fontSize: {
        "fluid-hero": "clamp(3.5rem, 14vw, 15rem)",
        "fluid-h2": "clamp(2rem, 5vw, 4.5rem)",
        "fluid-h3": "clamp(1.5rem, 3vw, 2.75rem)",
      },
      transitionTimingFunction: {
        silk: "cubic-bezier(0.22, 1, 0.36, 1)",
        ink: "cubic-bezier(0.65, 0, 0.35, 1)",
      },
      transitionDuration: {
        theme: "1200ms",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.9s cubic-bezier(0.22,1,0.36,1) both",
        "spin-slow": "spin-slow 30s linear infinite",
        shimmer: "shimmer 2.4s linear infinite",
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
