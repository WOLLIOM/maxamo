"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Side dot rail — a real <canvas> that draws the EXACT same dots as the
 * cursor field (PixelCursorField): 8px grid, 3px arc discs, theme colours,
 * and a purple→blue vivid shimmer near the pointer. The rail is dense at the
 * screen edge and dissolves inward with a per-cell dither so the inner edge
 * is organic (no straight line). Fixed to the viewport edge, desktop only.
 */

const CELL = 8; // same grid as PixelCursorField
const RADIUS = Math.max(1, CELL / 2 - 1); // = 3px, identical to the cursor dots

// Stable per-cell pseudo-random in [0,1) — used for the dithered edge so dots
// don't flicker frame to frame.
function hash(c: number, r: number) {
  const s = Math.sin(c * 127.1 + r * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

export function HalftonePanel({ side = "left" }: { side?: "left" | "right" }) {
  const [show, setShow] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const desktop = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    setShow(desktop);
    if (!desktop) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Theme colours, re-read on every theme switch (same as the cursor field).
    let ACCENT = "236 236 240";
    let GOLD = "212 212 216";
    let theme = document.documentElement.getAttribute("data-theme") || "mono";
    function readColors() {
      const root = getComputedStyle(document.documentElement);
      ACCENT = root.getPropertyValue("--c-accent").trim() || ACCENT;
      GOLD = root.getPropertyValue("--c-gold").trim() || GOLD;
      theme = document.documentElement.getAttribute("data-theme") || theme;
    }
    readColors();
    window.addEventListener("themechange", readColors);

    let W = 0, H = 0, DPR = 1, cols = 0, rows = 0, left = 0;
    function size() {
      const vw = window.innerWidth;
      H = window.innerHeight;
      W = Math.min(150, Math.round(vw * 0.1)); // ~10% of screen, capped
      left = side === "left" ? 0 : vw - W;
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.round(W * DPR);
      canvas!.height = Math.round(H * DPR);
      canvas!.style.width = `${W}px`;
      canvas!.style.height = `${H}px`;
      canvas!.style.left = `${left}px`;
      ctx!.setTransform(DPR, 0, 0, DPR, 0, 0);
      cols = Math.ceil(W / CELL) + 1;
      rows = Math.ceil(H / CELL) + 1;
    }
    size();
    const onResize = () => size();
    window.addEventListener("resize", onResize, { passive: true });

    // Pointer in viewport coords; converted to canvas-local x below.
    let px = -9999, py = -9999;
    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    // Cursor reveal ellipse — wide ("laying down") so the glow spreads across.
    const ERX = 150, ERY = 90;

    let animId = 0;
    function frame(t: number) {
      const ns = t / 1000;
      ctx!.clearRect(0, 0, W, H);
      const rainbow = theme === "vivid";
      const localPx = px - left; // pointer x within the canvas

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = (c + 0.5) * CELL;
          const y = (r + 0.5) * CELL;

          // Density: 1 at the screen edge → 0 at the inner edge.
          const edge = side === "left" ? 1 - x / W : x / W;
          // Dither the dissolve: keep a dot only where the edge density beats
          // this cell's stable random value. Dense at edge, sparse + organic
          // inward — no straight cutoff line.
          const h = hash(c, r);
          const kept = edge > h * 0.95;

          // Cursor proximity (elliptical) — lights dots up around the pointer.
          const dx = (localPx - x) / ERX;
          const dy = (py - y) / ERY;
          const near = 1 - Math.min(1, Math.sqrt(dx * dx + dy * dy));

          if (!kept && near <= 0) continue;

          if (near > 0.02) {
            // Hot dot near the cursor — vivid purple→blue shimmer (same band
            // as the cursor field), fading with distance.
            const hue = 230 + ((c * 4 + r * 4 + ns * 30) % 70);
            ctx!.fillStyle = `hsl(${hue} 85% ${60 + near * 12}%)`;
            ctx!.globalAlpha = Math.min(1, 0.25 + near);
          } else {
            // Base dot — theme accent / gold, alpha stronger toward the edge.
            ctx!.fillStyle = rainbow
              ? `hsl(${250 + ((c * 5 + r * 5) % 60)} 70% 62%)`
              : `rgb(${(c + r) % 2 === 0 ? ACCENT : GOLD})`;
            ctx!.globalAlpha = 0.35 + edge * 0.5;
          }

          ctx!.beginPath();
          ctx!.arc(x, y, RADIUS, 0, 2 * Math.PI);
          ctx!.fill();
        }
      }
      ctx!.globalAlpha = 1;
      animId = requestAnimationFrame(frame);
    }
    animId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("themechange", readColors);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
    };
  }, [side]);

  if (!show) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed top-0 z-[20] hidden md:block"
    />
  );
}
