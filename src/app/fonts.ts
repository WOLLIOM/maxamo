import { Cormorant_Garamond, Manrope } from "next/font/google";

/** Display serif — the cinematic, editorial voice of the brand. */
export const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-serif",
  display: "swap",
});

/** Utility sans — kickers, nav, UI, body copy. */
export const sans = Manrope({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-sans",
  display: "swap",
});
