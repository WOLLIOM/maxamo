"use client";

import { useEffect, useRef } from "react";

/* ---------------------------------------------------------------------------
   Direct port of the reference particle-field engine (the "good.html" mouse
   cursor + particle feature): a full-viewport canvas that draws a heat-grid
   of glowing dots which follow the pointer, wander in a Pac-Man style sweep
   when idle, morph into a heart on heart-zones, and explode outward on
   click / hold / double-click. Logic is kept as close to the original as
   possible; only the color palette source and the "heart zone" / current
   "section" lookups are wired to this site's own markup instead of the
   reference file's.
---------------------------------------------------------------------------- */

type Palette = [number, string][];

function readThemeColors(): { bg: [number, number, number]; ink: [number, number, number]; accent: [number, number, number]; accentSoft: [number, number, number] } {
  const cs = getComputedStyle(document.documentElement);
  const parse = (v: string, fallback: [number, number, number]): [number, number, number] => {
    const p = v.trim().split(/\s+/).map(Number);
    return p.length === 3 && p.every((n) => !Number.isNaN(n)) ? (p as [number, number, number]) : fallback;
  };
  return {
    bg: parse(cs.getPropertyValue("--c-bg"), [10, 10, 12]),
    ink: parse(cs.getPropertyValue("--c-ink"), [238, 236, 233]),
    accent: parse(cs.getPropertyValue("--c-accent"), [150, 40, 44]),
    accentSoft: parse(cs.getPropertyValue("--c-accent-soft"), [186, 78, 68]),
  };
}

function themePalette(): Palette {
  const { bg, ink, accent, accentSoft } = readThemeColors();
  const mix = (a: number[], b: number[], f: number) => a.map((v, i) => Math.round(v + (b[i] - v) * f));
  const toHex = (c: number[]) => rgb2hex(c as [number, number, number]);
  return [
    [0.3, toHex(mix(bg, accent, 0.22))],
    [0.46, toHex(mix(bg, accent, 0.55))],
    [0.62, toHex(accent)],
    [0.78, toHex(mix(accent, accentSoft, 0.6))],
  ];
  function rgb2hex(c: [number, number, number]) {
    return (
      "#" +
      c
        .map((v) => {
          v = Math.max(0, Math.min(255, Math.round(v)));
          return (v < 16 ? "0" : "") + v.toString(16);
        })
        .join("")
    );
  }
  void ink;
}

const HEART: [number, number][] = [
  [2, 1], [3, 1], [5, 1], [6, 1],
  [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2],
  [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3],
  [2, 4], [3, 4], [4, 4], [5, 4], [6, 4],
  [3, 5], [4, 5], [5, 5],
  [4, 6],
];

export function ReferenceParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const TOUCH = !(window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches);
    if (TOUCH) return;

    const cv = canvasRef.current;
    if (!cv) return;
    const context = cv.getContext("2d");
    if (!context) return;
    const canvas: HTMLCanvasElement = cv;
    const ctx: CanvasRenderingContext2D = context;

    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const cell = 9;
    const BRUSH = 10;
    let W = 0,
      H = 0,
      cols = 0,
      rows = 0;
    let heat: Float32Array = new Float32Array(0);
    let dis: Float32Array = new Float32Array(0);
    let t = 0;
    const SEED = Math.random() * 1000;

    interface Wave {
      x: number;
      y: number;
      t0: number;
      pow: number;
    }
    let waves: Wave[] = [];
    let shake = 0;
    let mx = -1,
      my = -1;
    let hov = false;

    let BANDSNOW: Palette = themePalette();

    let themeRefresh = 0;

    function size() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      cols = Math.ceil(W / cell) + 1;
      rows = Math.ceil(H / cell) + 1;
      heat = new Float32Array(cols * rows);
      dis = new Float32Array(cols * rows);
    }
    let lastW = window.innerWidth;
    size();
    function onResize() {
      if (window.innerWidth !== lastW) {
        lastW = window.innerWidth;
        size();
      }
    }
    window.addEventListener("resize", onResize);

    // ── heart / pac-man state ──
    let pacOn = false,
      pacx = 0,
      pacy = 0,
      pacDir = 1,
      pacStart = 0,
      pacAge = 0,
      PFOOD = 34;
    let pmx = -1,
      pmy = -1,
      lastMove = -9,
      cursorZone = "";
    let wasHeart = false;
    interface Spark {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
    }
    let hsparks: Spark[] = [];

    let charging = false,
      chT0 = 0,
      chx = 0,
      chy = 0;

    function hsh(c: number, r: number) {
      const n = Math.sin(c * 127.1 + r * 311.7 + SEED * 0.13) * 43758.5453;
      return n - Math.floor(n);
    }

    function dep(x: number, y: number, amt: number, sig: number) {
      const cc = x / cell,
        cr = y / cell,
        rad = Math.ceil(sig * 1.6),
        inv = 1 / (2 * sig * sig * 0.18);
      for (let dr = -rad; dr <= rad; dr++)
        for (let dc = -rad; dc <= rad; dc++) {
          const c = (cc + dc) | 0,
            r = (cr + dr) | 0;
          if (c < 0 || r < 0 || c >= cols || r >= rows) continue;
          const dx = c + 0.5 - cc,
            dy = r + 0.5 - cr,
            w = Math.exp(-(dx * dx + dy * dy) * inv);
          if (w < 0.02) continue;
          const id = r * cols + c,
            vv = heat[id] + amt * w;
          heat[id] = vv > 1 ? 1 : vv;
        }
    }

    function follow(x: number, y: number, sig: number) {
      if (pmx < 0) {
        pmx = x;
        pmy = y;
      }
      const dx = x - pmx,
        dy = y - pmy,
        dl = Math.sqrt(dx * dx + dy * dy),
        steps = Math.max(1, Math.min(48, Math.round(dl / (cell * 0.8))));
      for (let s = 1; s <= steps; s++) {
        const f = s / steps;
        dep(pmx + dx * f, pmy + dy * f, 0.16, sig);
      }
      pmx = x;
      pmy = y;
    }

    function pacman(cx: number, cy: number, rad: number, ang: number, mouth: number, val: number) {
      const c0 = Math.floor((cx - rad) / cell),
        c1 = Math.ceil((cx + rad) / cell),
        r0 = Math.floor((cy - rad) / cell),
        r1 = Math.ceil((cy + rad) / cell),
        rr = rad * rad;
      for (let r = r0; r <= r1; r++)
        for (let c = c0; c <= c1; c++) {
          if (c < 0 || r < 0 || c >= cols || r >= rows) continue;
          const dx = (c + 0.5) * cell - cx,
            dy = (r + 0.5) * cell - cy;
          if (dx * dx + dy * dy > rr) continue;
          const da = Math.abs((((Math.atan2(dy, dx) - ang) % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI) - Math.PI);
          if (da < mouth) continue;
          const id = r * cols + c,
            v = val + 0.03 * Math.sin(c * 0.7 + r * 0.7 - t * 0.01);
          if (v > heat[id]) heat[id] = v;
        }
    }

    function wander(restx: number, resty: number) {
      if (!pacOn) {
        pacOn = true;
        pacDir = restx < W * 0.5 ? 1 : -1;
        pacx = restx;
        pacy = resty;
        pacStart = restx;
        pacAge = 0;
        PFOOD = BRUSH * 3.4;
      }
      const rad = BRUSH * 3.4;
      pacAge++;
      pacx += pacDir * 2.6;
      if (pacx > W + rad + 12 || pacx < -rad - 12) {
        pacDir = Math.random() < 0.5 ? 1 : -1;
        pacy = 70 + Math.random() * (H - 140);
        pacx = pacDir > 0 ? -rad : W + rad;
        pacStart = pacx;
        pacAge = 0;
      }
      const ang = pacDir > 0 ? 0 : Math.PI;
      const pr = Math.round(pacy / cell);
      for (let k = 1; k <= 80; k++) {
        const px = pacStart + pacDir * PFOOD * k;
        if (px < -20 || px > W + 20) continue;
        if (pacDir * (px - pacx) > rad * 0.7) {
          const pc = Math.round(px / cell);
          if (pc >= 0 && pr >= 0 && pc < cols && pr < rows) {
            const pid = pr * cols + pc;
            if (0.72 > heat[pid]) heat[pid] = 0.72;
          }
        }
      }
      const mouth = 0.05 + 0.6 * Math.abs(Math.sin(pacAge * 0.16));
      pacman(pacx, pacy, rad, ang, mouth, 0.72);
    }

    function stampHeart(cx: number, cy: number) {
      const S = 2,
        bc = Math.round(cx / cell),
        br = Math.round(cy / cell),
        o = 4 * S;
      for (let k = 0; k < HEART.length; k++) {
        for (let yy = 0; yy < S; yy++)
          for (let xx = 0; xx < S; xx++) {
            const C = bc + HEART[k][0] * S + xx - o,
              R = br + HEART[k][1] * S + yy - o;
            if (C < 0 || R < 0 || C >= cols || R >= rows) continue;
            const id = R * cols + C,
              w = 0.86 + 0.12 * Math.sin(C * 0.6 + R * 0.6 - t * 0.006);
            if (w > heat[id]) heat[id] = w;
          }
      }
    }

    function heartBoom(x: number, y: number) {
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * 6.2832,
          sp = BRUSH * (0.7 + hsh(i, x) * 0.7);
        hsparks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1 });
      }
    }

    function resolveHeartZone(target: Element | null): boolean {
      return !!(target && target.closest('[data-cursor="heart"]'));
    }

    function onMove(e: PointerEvent) {
      lastMove = performance.now() / 1000;
      pacOn = false;
      mx = e.clientX;
      my = e.clientY;
      hov = true;
      const target = document.elementFromPoint(mx, my);
      cursorZone = resolveHeartZone(target) ? "heart" : "";
    }
    window.addEventListener("pointermove", onMove);

    function onScroll() {
      if (!hov || mx < 0) return;
      lastMove = performance.now() / 1000;
      pacOn = false;
      const target = document.elementFromPoint(mx, my);
      cursorZone = resolveHeartZone(target) ? "heart" : "";
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    function releaseExplosion() {
      if (!charging) return;
      charging = false;
      const ns = performance.now() / 1000;
      const ch = Math.min((ns - chT0) / 2.2, 1);
      waves.push({ x: chx, y: chy, t0: ns, pow: 0.35 + ch * 2.1 });
      dep(chx, chy, 1, BRUSH * (2.5 + ch * 18));
      shake = 0.45 + ch * 1.9;
    }

    function onDown(e: PointerEvent) {
      const target = e.target as HTMLElement;
      if (target.closest && target.closest("a, button, input, textarea, select, .fret, .play-btn")) return;
      charging = true;
      chT0 = performance.now() / 1000;
      chx = e.clientX;
      chy = e.clientY;
    }
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", releaseExplosion);
    window.addEventListener("pointercancel", releaseExplosion);

    function onDblClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target.closest && target.closest("a, button, input, textarea, select, .fret, .play-btn")) return;
      const ns = performance.now() / 1000;
      waves.push({ x: e.clientX, y: e.clientY, t0: ns, pow: 2.8 });
      dep(e.clientX, e.clientY, 1, BRUSH * 22);
      shake = 2.4;
    }
    window.addEventListener("dblclick", onDblClick);

    function getBottomAnchor(): number {
      const hero = document.getElementById("hero");
      if (!hero) return -Infinity;
      return hero.getBoundingClientRect().bottom;
    }

    function render() {
      const ns = performance.now() / 1000;

      themeRefresh++;
      if (themeRefresh % 90 === 0) BANDSNOW = themePalette();

      const heroBottom = getBottomAnchor();
      for (let i = 0; i < heat.length; i++) {
        if (dis[i] > 0 && ((i / cols) | 0) * cell > heroBottom) {
          dis[i] -= 0.007;
          if (dis[i] <= 0) {
            dis[i] = 0;
            heat[i] = 0;
          } else if (dis[i] < 0.3) {
            heat[i] *= 0.88;
          } else {
            heat[i] = Math.max(heat[i] * 0.95, 0.9);
          }
        } else {
          if (dis[i] > 0) dis[i] = 0;
          heat[i] *= 0.878;
          if (heat[i] < 0.003) heat[i] = 0;
        }
      }

      if (hov && mx > 0 && cursorZone === "heart") {
        if (!wasHeart) heartBoom(mx, my);
        stampHeart(mx, my);
        pmx = mx;
        pmy = my;
        wasHeart = true;
      } else {
        if (wasHeart) wasHeart = false;
        if (hov && mx > 0 && !cursorZone) {
          const idle = ns - lastMove;
          if (idle > 1.5) {
            wander(mx, my);
            pmx = mx;
            pmy = my;
          } else {
            follow(mx, my, my > heroBottom ? BRUSH * 0.5 : BRUSH);
            pmx = mx;
            pmy = my;
          }
        }
      }

      for (let hi = hsparks.length - 1; hi >= 0; hi--) {
        const hsp = hsparks[hi];
        hsp.x += hsp.vx;
        hsp.y += hsp.vy;
        hsp.vx *= 0.88;
        hsp.vy *= 0.88;
        hsp.life -= 0.06;
        if (hsp.life <= 0) {
          hsparks.splice(hi, 1);
          continue;
        }
        dep(hsp.x, hsp.y, 0.45 + 0.45 * hsp.life, 1.6);
      }

      for (let wi = waves.length - 1; wi >= 0; wi--) {
        const wv = waves[wi],
          age = ns - wv.t0;
        if (age > 1.5) {
          waves.splice(wi, 1);
          continue;
        }
        const pw = wv.pow || 1,
          R = age * Math.hypot(W, H) * 1.7,
          sig = cell * 5.5 * pw,
          amp = Math.max(0, 1 - age / 1.5) * 1.2 * pw,
          inv = 1 / (2 * sig * sig);
        for (let r = 0; r < rows; r++)
          for (let c = 0; c < cols; c++) {
            const dx = (c + 0.5) * cell - wv.x,
              dy = (r + 0.5) * cell - wv.y,
              dd = Math.sqrt(dx * dx + dy * dy),
              g = amp * Math.exp(-((dd - R) * (dd - R)) * inv);
            if (g > 0.02) {
              const id = r * cols + c;
              if (g > heat[id]) heat[id] = g;
              if ((r + 0.5) * cell > heroBottom && g > 0.25 && dis[id] === 0) dis[id] = 0.45 + hsh(c, r) * 0.7;
            }
          }
      }

      if (charging) {
        const chg = Math.min((ns - chT0) / 2.2, 1);
        dep(chx, chy, 0.45 + chg * 0.5, BRUSH * (2 + chg * 8));
        if (shake < 0.12 + chg * 0.35) shake = 0.12 + chg * 0.35;
      }

      ctx.save();
      ctx.clearRect(-40, -40, W + 80, H + 80);
      if (shake > 0.01) {
        shake *= 0.9;
        ctx.translate((Math.random() - 0.5) * shake * 20, (Math.random() - 0.5) * shake * 20);
      } else shake = 0;

      const rad = (cell - 1) / 2;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const v = heat[r * cols + c];
          if (v < 0.06) continue;
          let col = BANDSNOW[0][1];
          if (v >= BANDSNOW[1][0]) col = BANDSNOW[1][1];
          if (v >= BANDSNOW[2][0]) col = BANDSNOW[2][1];
          if (v >= BANDSNOW[3][0]) col = BANDSNOW[3][1];
          if (v >= 0.86 && v < 1.02) col = BANDSNOW[3][1];
          const cx = c * cell + rad;
          const cy = r * cell + rad;
          ctx.globalAlpha = Math.min(0.85, v + 0.1);
          ctx.beginPath();
          ctx.fillStyle = col;
          ctx.arc(cx, cy, rad * (0.55 + v * 0.35), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    let raf = 0;
    let lastTs = 0;
    function loop(ts: number) {
      if (!lastTs) lastTs = ts;
      t += ts - lastTs;
      lastTs = ts;
      render();
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", releaseExplosion);
      window.removeEventListener("pointercancel", releaseExplosion);
      window.removeEventListener("dblclick", onDblClick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[70]"
    />
  );
}
