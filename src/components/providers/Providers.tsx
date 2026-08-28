"use client";

import { ThemeProvider } from "./ThemeProvider";
import { AudioProvider } from "./AudioProvider";
import { MusicProvider } from "./MusicProvider";
import { SmoothScroll } from "./SmoothScroll";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AudioProvider>
        <MusicProvider>
          <SmoothScroll>{children}</SmoothScroll>
        </MusicProvider>
      </AudioProvider>
    </ThemeProvider>
  );
}
