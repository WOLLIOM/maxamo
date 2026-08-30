"use client";

import { useEffect, useRef } from "react";

const PAL = ["#d65630", "#e88c5a", "#dca862", "#edc58a"];
const CELL = 7;

// pixel heart shape, same grid pattern as the reference site
const HEART: [number, number][] = [
  [2,1],[3,1],[5,1],[6,1],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2],
  [1,3],[2,3],[3,3],[4,3],[5,3],[6,3],[7,3],[2,4],[3,4],[4,4],[5,4],[6,4],
  [3,5],[4,5],[5,5],[4,6],
];

/** Click anywhere: a random burst — either a pixel heart pop or a square explosion — in the site's orange/gold palette. */
export function ClickBurst() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;

    function size() {
      cv!.width = innerWidth;
      cv!.height = innerHeight;
    }
    size();
    window.addEventListener("resize", size);

    type Square = { x: number; y: number; vx: number; vy: number; s: number; life: number; col: string };
    type Heart = { ox: number; oy: number; born: number };
    let squares: Square[] = [];
    let hearts: Heart[] = [];

    function explode(x: number, y: number) {
      for (let i = 0; i < 26; i++) {
        const a = (i / 26) * Math.PI * 2 + Math.random() * 0.3;
        const sp = 2 + Math.random() * 5;
        squares.push({
          x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
          s: 5 + Math.random() * 6, life: 1,
          col: PAL[(Math.random() * PAL.length) | 0],
        });
      }
    }
    function heartPop(x: number, y: number) {
      hearts.push({ ox: x, oy: y, born: performance.now() });
    }
    function onDown(e: PointerEvent) {
      const t = e.target as HTMLElement;
      if (t.closest("a, button, input, textarea, select")) return;
      Math.random() < 0.5 ? explode(e.clientX, e.clientY) : heartPop(e.clientX, e.clientY);
    }
    window.addEventListener("pointerdown", onDown);

    let raf = 0;
    function loop() {
      ctx!.clearRect(0, 0, cv!.width, cv!.height);

      for (let i = squares.length - 1; i >= 0; i--) {
        const s = squares[i];
        s.x += s.vx; s.y += s.vy; s.vx *= 0.95; s.vy *= 0.95; s.vy += 0.08; s.life -= 0.02;
        if (s.life <= 0) { squares.splice(i, 1); continue; }
        ctx!.globalAlpha = Math.max(0, s.life);
        ctx!.fillStyle = s.col;
        ctx!.fillRect(s.x - s.s / 2, s.y - s.s / 2, s.s, s.s);
      }
      ctx!.globalAlpha = 1;

      const now = performance.now();
      for (let i = hearts.length - 1; i >= 0; i--) {
        const h = hearts[i];
        const age = (now - h.born) / 1000;
        if (age > 0.9) { hearts.splice(i, 1); continue; }
        const scale = 1.6 * (age < 0.15 ? age / 0.15 : 1); // quick pop-in
        const fade = 1 - Math.max(0, (age - 0.5) / 0.4);
        ctx!.globalAlpha = Math.min(1, fade);
        for (const [dx, dy] of HEART) {
          const col = PAL[(dx + dy) % PAL.length];
          ctx!.fillStyle = col;
          const px = h.ox + (dx - 4) * CELL * scale;
          const py = h.oy + (dy - 4) * CELL * scale;
          ctx!.fillRect(px, py, CELL * scale, CELL * scale);
        }
      }
      ctx!.globalAlpha = 1;

      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
      window.removeEventListener("pointerdown", onDown);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9998]"
    />
  );
}
