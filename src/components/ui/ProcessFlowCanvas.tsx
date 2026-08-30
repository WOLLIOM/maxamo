"use client";

import { useEffect, useRef } from "react";

/**
 * The pixel "double helix" strip from the process section: two frayed blue
 * strands on the left resolve into a clean yellow helix with rungs on the
 * right (Explore -> Generate -> Refine -> Scale). Snapped to a 9px grid.
 * Move the pointer over it and the strands part around your cursor, then
 * spring back when you leave. Hovering one of the four step labels below
 * spotlights that quarter of the helix and dims the rest.
 */
export function ProcessFlowCanvas({
  className,
  activeStep = null,
}: {
  className?: string;
  /** Index (0-3) of the step currently hovered below, or null for none. */
  activeStep?: number | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeStepRef = useRef<number | null>(activeStep);

  useEffect(() => {
    activeStepRef.current = activeStep;
  }, [activeStep]);

  useEffect(() => {
    const cv = canvasRef.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;

    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const CELL = 9;
    const COOL = "#3b5bd9";
    const YEL = "#f5c518";

    let W = 0,
      H = 0,
      cols = 0,
      rows = 0,
      on = true;

    function mix(a: string, b: string, t: number) {
      if (t <= 0) return a;
      if (t >= 1) return b;
      const ar = parseInt(a.slice(1, 3), 16),
        ag = parseInt(a.slice(3, 5), 16),
        ab = parseInt(a.slice(5, 7), 16),
        br = parseInt(b.slice(1, 3), 16),
        bg = parseInt(b.slice(3, 5), 16),
        bb = parseInt(b.slice(5, 7), 16);
      return (
        "rgb(" +
        (((ar + (br - ar) * t) | 0) +
          "," +
          ((ag + (bg - ag) * t) | 0) +
          "," +
          ((ab + (bb - ab) * t) | 0)) +
        ")"
      );
    }
    function rnd(s: number) {
      const x = Math.sin(s * 12.9898) * 43758.5453;
      return x - Math.floor(x);
    }
    function ss(x: number) {
      x = x < 0 ? 0 : x > 1 ? 1 : x;
      return x * x * (3 - 2 * x);
    }
    function prof(x: number) {
      return 0.06 + 0.94 * Math.pow(Math.abs(2 * x - 1), 1.2);
    }
    function pick(seed: number, x: number) {
      return rnd(seed) < ss(x) ? YEL : COOL;
    }
    function dep(za: number, rk: number) {
      return Math.max(0, Math.min(1, 0.5 + 0.5 * (za / Math.max(1, rk))));
    }
    function size() {
      const r = cv!.getBoundingClientRect();
      if (r.width < 2) return;
      W = r.width;
      H = r.height;
      cv!.width = Math.round(W * DPR);
      cv!.height = Math.round(H * DPR);
      ctx!.setTransform(DPR, 0, 0, DPR, 0, 0);
      cols = Math.ceil(W / CELL);
      rows = Math.ceil(H / CELL);
    }
    size();

    const ro = new ResizeObserver(size);
    ro.observe(cv);

    let io: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver((es) => {
        es.forEach((e) => {
          on = e.isIntersecting;
        });
      });
      io.observe(cv);
    }

    // pointer: part the strands around the cursor, ease the influence in/out
    let pmx = 0,
      pmy = 0,
      pstr = 0,
      ptgt = 0;
    function moveAt(cx: number, cy: number) {
      const r = cv!.getBoundingClientRect();
      pmx = cx - r.left;
      pmy = cy - r.top;
      ptgt = pmx >= -40 && pmx <= W + 40 && pmy >= -40 && pmy <= H + 40 ? 1 : 0;
    }
    function onMove(e: PointerEvent) {
      moveAt(e.clientX, e.clientY);
    }
    function onLeave() {
      ptgt = 0;
    }
    cv.addEventListener("pointermove", onMove, { passive: true });
    cv.addEventListener("pointerleave", onLeave);

    const M = 400,
      turns = 3.2;
    let clk = 0;

    // per-quarter emphasis, eased toward 1 (lit) or 0.16 (dimmed) based on activeStepRef
    const EM = [1, 1, 1, 1];
    function aOf(u: number) {
      const st = activeStepRef.current;
      if (st === null || st === undefined) return 1;
      const g = u * 4 - 0.5;
      const q = Math.floor(g);
      const f = ss(Math.min(1, Math.max(0, (g - q - 0.35) / 0.3)));
      const a0 = EM[Math.max(0, Math.min(3, q))];
      const a1 = EM[Math.max(0, Math.min(3, q + 1))];
      return a0 + (a1 - a0) * f;
    }

    type Item = { c: number; r: number; d: number; col: string; a: number };

    function frame() {
      if (!cols) return;
      ctx!.clearRect(0, 0, W, H);
      pstr += (ptgt - pstr) * 0.09;
      const st = activeStepRef.current;
      for (let e = 0; e < 4; e++) {
        const tgt = st === null || st === undefined || st === e ? 1 : 0.16;
        EM[e] += (tgt - EM[e]) * 0.07;
      }
      const RAD = H * 0.55,
        AMP = H * 0.42,
        repel = pstr > 0.01;
      const cy = H / 2,
        R = H * 0.42;
      const items: Item[] = [];

      function push(it: { sx: number; sy: number; d: number; col: string; a: number }) {
        if (repel) {
          const dx = it.sx - pmx,
            dy = it.sy - pmy,
            dist = Math.sqrt(dx * dx + dy * dy) + 0.001;
          if (dist < RAD) {
            let f = 1 - dist / RAD;
            f = f * f * pstr;
            it.sx += (dx / dist) * f * AMP;
            it.sy += (dy / dist) * f * AMP;
          }
        }
        items.push({ c: (it.sx / CELL) | 0, r: (it.sy / CELL) | 0, d: it.d, col: it.col, a: it.a });
      }

      // two strands: frayed blue at the mouth tightening into a clean yellow helix
      for (let s = 0; s < 2; s++) {
        const ph0 = s * Math.PI;
        for (let i = 0; i < M; i++) {
          const u = (i / M + clk * 0.0013) % 1;
          const rk = R * prof(u);
          const chaos = Math.pow(1 - u, 1.05);
          const ang = u * turns * 6.2832 + ph0 + (rnd(i * 3.1 + s * 40) - 0.5) * 2.9 * chaos;
          const jr = rk * (1 + (rnd(i * 7.7 + s * 9) - 0.5) * 1.9 * chaos);
          const za = Math.cos(ang) * jr,
            ya = Math.sin(ang) * jr,
            depth = dep(za, rk);
          push({
            sx: u * W + za * 0.34,
            sy: cy + ya * 0.92,
            d: depth,
            col: mix("#ffffff", pick(i * 2.3 + s * 70, u), 0.3 + 0.65 * depth),
            a: aOf(u),
          });
        }
      }

      // rungs that knit the two clean strands together on the resolved (right) half
      for (let uu = 0; uu < 1; uu += 0.04) {
        const u2 = (uu + clk * 0.0013) % 1;
        if (u2 < 0.5) continue;
        const rk2 = R * prof(u2),
          ang2 = u2 * turns * 6.2832;
        for (let w = 0; w <= 1.001; w += 0.12) {
          const f2 = 1 - 2 * w,
            za2 = Math.cos(ang2) * rk2 * f2,
            ya2 = Math.sin(ang2) * rk2 * f2,
            depth2 = dep(za2, rk2);
          push({
            sx: u2 * W + za2 * 0.34,
            sy: cy + ya2 * 0.92,
            d: depth2 - 0.01,
            col: mix("#ffffff", YEL, 0.3 + 0.5 * depth2),
            a: aOf(u2),
          });
        }
      }

      items.sort((a, b) => a.d - b.d);
      for (const it of items) {
        if (it.r < 0 || it.r >= rows || it.c < 0 || it.c >= cols) continue;
        ctx!.globalAlpha = it.a;
        ctx!.fillStyle = it.col;
        ctx!.fillRect(it.c * CELL, it.r * CELL, CELL - 1, CELL - 1);
      }
      ctx!.globalAlpha = 1;
    }

    let raf = 0;
    function loop() {
      if (on) {
        clk++;
        frame();
      }
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io?.disconnect();
      cv.removeEventListener("pointermove", onMove);
      cv.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div className={className} style={{ width: "100%", aspectRatio: "3 / 1" }}>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
}
