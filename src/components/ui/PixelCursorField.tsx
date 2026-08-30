"use client";

import { useEffect, useRef } from "react";

/**
 * The dot-grid "pixel cursor" tech from the deepseek HTML demo, ported to
 * React and trimmed to the things asked for:
 *   1. an arrow made of a trail of heat-dots that bends to point at the
 *      nearest headline (same detection radius/selector as before)
 *   2. a click effect — hold to charge, release for a shockwave of dots;
 *      double-click for a bigger burst
 *   3. a heart zone — hover anything flagged `data-cursor-heart` and the
 *      dot field blooms into a heart shape with a burst of sparks
 *
 * The smiley/mood cursor and its rectangle hover-glow stay exactly where
 * they are in CustomCursor.tsx — this is a separate transparent canvas
 * layered on top that only lights up for the arrow, click, and heart zones.
 */

const CELL = 8; // px per grid cell
const BRUSH = 14; // base brush radius
const ARROW_MARGIN = 150; // px, same reach as the old headline arrow

// same 9x8 heart bitmap as the HTML demo, in cell units
const HEART: [number, number][] = [
  [2, 1], [3, 1], [5, 1], [6, 1],
  [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2],
  [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3],
  [2, 4], [3, 4], [4, 4], [5, 4], [6, 4],
  [3, 5], [4, 5], [5, 5],
  [4, 6],
];

export function PixelCursorField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const isTouch =
      window.matchMedia("(pointer: coarse)").matches ||
      "ontouchstart" in window;
    if (isTouch) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // colours pulled from the site's own CSS vars — two tones, same as the
    // rest of the pixel UI (accent for the body of the effect, gold for hot
    // crests / wave fronts)
    const root = getComputedStyle(document.documentElement);
    const ACCENT = root.getPropertyValue("--c-accent").trim() || "214 86 48";
    // Was --c-gold, which reads as a washed-out pale yellow on the hot tips.
    // accent-soft is a richer warm orange that actually matches the
    // golden-hour palette.
    const GOLD = root.getPropertyValue("--c-accent-soft").trim() || "232 140 90";

    let DPR = 1,
      W = 0,
      H = 0,
      cols = 0,
      rows = 0;
    let heat: Float32Array | null = null;
    let mx = -1,
      my = -1,
      hov = false;
    let charging = false,
      chT0 = 0,
      chx = 0,
      chy = 0,
      shake = 0;
    let wasHeart = false;
    const waves: { x: number; y: number; t0: number; pow: number }[] = [];
    const hsparks: { x: number; y: number; vx: number; vy: number; life: number }[] = [];
    let animId = 0;

    function size() {
      W = window.innerWidth;
      H = window.innerHeight;
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.round(W * DPR);
      canvas!.height = Math.round(H * DPR);
      ctx!.setTransform(DPR, 0, 0, DPR, 0, 0);
      cols = Math.ceil(W / CELL) + 1;
      rows = Math.ceil(H / CELL) + 1;
      heat = new Float32Array(cols * rows);
    }
    size();
    const onResize = () => size();
    window.addEventListener("resize", onResize, { passive: true });

    function dep(cx: number, cy: number, amt: number, sig: number) {
      if (!heat) return;
      const cc = cx / CELL,
        cr = cy / CELL,
        rad = Math.ceil(sig * 1.6),
        inv = 1 / (2 * sig * sig * 0.18);
      for (let dr = -rad; dr <= rad; dr++) {
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
    }

    // ── arrow: same headline detection as before, plus hysteresis so it
    // doesn't flicker between two nearby targets ──
    let headlineEls: HTMLElement[] = [];
    let currentTargetEl: HTMLElement | null = null;
    function collectHeadlines() {
      headlineEls = Array.from(
        document.querySelectorAll<HTMLElement>("h1, h2, h3, [data-cursor-arrow]")
      ).filter((el) => !el.closest("nav, footer"));
    }
    collectHeadlines();
    window.addEventListener("load", collectHeadlines);
    const mo = new MutationObserver(() => collectHeadlines());
    mo.observe(document.body, { childList: true, subtree: true });

    // switching to a new target only happens if it's clearly closer than
    // the one we're already locked onto — otherwise two headlines sitting
    // near each other cause the arrow to twitch back and forth every frame
    const SWITCH_MARGIN = 40;

    function nearestHeadline(x: number, y: number) {
      let best: { cx: number; cy: number; el: HTMLElement } | null = null;
      let bd = Infinity;
      let currentDist = Infinity;
      for (const el of headlineEls) {
        const r = el.getBoundingClientRect();
        if (r.width < 2) continue;
        if (r.bottom < -40 || r.top > H + 40) continue;
        if (
          x < r.left - ARROW_MARGIN ||
          x > r.right + ARROW_MARGIN ||
          y < r.top - ARROW_MARGIN ||
          y > r.bottom + ARROW_MARGIN
        )
          continue;
        const cx = r.left + r.width / 2,
          cy = r.top + r.height / 2,
          d = Math.hypot(x - cx, y - cy);
        if (el === currentTargetEl) currentDist = d;
        if (d < bd) {
          bd = d;
          best = { cx, cy, el };
        }
      }
      if (!best) {
        currentTargetEl = null;
        return null;
      }
      // keep the current target unless the new one is meaningfully closer
      if (
        currentTargetEl &&
        currentTargetEl !== best.el &&
        currentDist < bd + SWITCH_MARGIN
      ) {
        const r = currentTargetEl.getBoundingClientRect();
        if (r.width >= 2) {
          return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
        }
      }
      currentTargetEl = best.el;
      return { cx: best.cx, cy: best.cy };
    }

    function pointArrow(x: number, y: number, ang: number, tt: number) {
      const L = BRUSH * 8.5,
        ca = Math.cos(ang),
        sa = Math.sin(ang),
        tipx = x + ca * L,
        tipy = y + sa * L;
      const pulse = (tt * 0.9) % 1,
        steps = Math.max(16, Math.round(L / (CELL * 0.5)));
      for (let i = 0; i <= steps; i++) {
        const f = i / steps,
          hi = Math.exp(-Math.pow((f - pulse) * 3.0, 2));
        dep(x + ca * L * f, y + sa * L * f, 0.5 + 0.46 * hi, 0.95);
      }
      const hl = BRUSH * 3.4;
      for (let s = -1; s <= 1; s += 2) {
        const ba = ang + Math.PI + s * 0.62,
          bsteps = Math.max(8, Math.round(hl / (CELL * 0.5)));
        for (let j = 0; j <= bsteps; j++) {
          const g = j / bsteps;
          dep(tipx + Math.cos(ba) * hl * g, tipy + Math.sin(ba) * hl * g, 0.72, 0.95);
        }
      }
    }

    function pickColor(v: number) {
      return v >= 0.86 ? GOLD : ACCENT;
    }

    // ── heart zone: hover anything with [data-cursor-heart] ──
    function getHeartZone() {
      const el = document.querySelector<HTMLElement>("[data-cursor-heart]");
      if (!el) return null;
      const r = el.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return null;
      return { x: r.left, y: r.top, w: r.width, h: r.height };
    }

    function hsh(c: number, r: number) {
      const n = Math.sin(c * 127.1 + r * 311.7) * 43758.5453;
      return n - Math.floor(n);
    }

    function heartBoom(x: number, y: number) {
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * 6.2832,
          sp = BRUSH * (0.7 + hsh(i, x) * 0.7);
        hsparks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1 });
      }
    }

    function stampHeart(cx: number, cy: number) {
      if (!heat) return;
      const S = 2,
        bc = Math.round(cx / CELL),
        br = Math.round(cy / CELL),
        o = 4 * S;
      for (const [hx, hy] of HEART) {
        for (let yy = 0; yy < S; yy++) {
          for (let xx = 0; xx < S; xx++) {
            const C = bc + hx * S + xx - o,
              R = br + hy * S + yy - o;
            if (C < 0 || R < 0 || C >= cols || R >= rows) continue;
            const id = R * cols + C,
              w = 0.86 + 0.12 * Math.sin(C * 0.6 + R * 0.6 - t * 0.006);
            if (w > heat[id]) heat[id] = w;
          }
        }
      }
    }

    let t = 0;
    function render() {
      if (!heat) return;
      const ns = performance.now() / 1000;

      // decay
      for (let i = 0; i < heat.length; i++) {
        heat[i] *= 0.9;
        if (heat[i] < 0.003) heat[i] = 0;
      }

      // waves (click bursts)
      for (let wi = waves.length - 1; wi >= 0; wi--) {
        const wv = waves[wi],
          age = ns - wv.t0;
        if (age > 1.5) {
          waves.splice(wi, 1);
          continue;
        }
        const pw = wv.pow || 1,
          R = age * Math.hypot(W, H) * 1.7,
          sig = CELL * 5.5 * pw,
          amp = Math.max(0, 1 - age / 1.5) * 1.2 * pw,
          inv = 1 / (2 * sig * sig);
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const dx = (c + 0.5) * CELL - wv.x,
              dy = (r + 0.5) * CELL - wv.y,
              dd = Math.sqrt(dx * dx + dy * dy),
              g = amp * Math.exp(-((dd - R) * (dd - R)) * inv);
            if (g > 0.02) {
              const id = r * cols + c;
              if (g > heat[id]) heat[id] = g;
            }
          }
        }
      }

      // heart sparks: drift outward and fade, depositing their own trail
      for (let hi = hsparks.length - 1; hi >= 0; hi--) {
        const hp = hsparks[hi];
        hp.x += hp.vx;
        hp.y += hp.vy;
        hp.vx *= 0.88;
        hp.vy *= 0.88;
        hp.life -= 0.06;
        if (hp.life <= 0) {
          hsparks.splice(hi, 1);
          continue;
        }
        dep(hp.x, hp.y, 0.45 + 0.45 * hp.life, 1.6);
      }

      // arrow toward nearest headline, unless hovering a heart zone
      if (hov && mx > 0) {
        const hz = getHeartZone();
        const inHeart =
          hz && mx >= hz.x && mx <= hz.x + hz.w && my >= hz.y && my <= hz.y + hz.h;
        if (inHeart) {
          if (!wasHeart) heartBoom(mx, my);
          stampHeart(mx, my);
          wasHeart = true;
        } else {
          wasHeart = false;
          const target = nearestHeadline(mx, my);
          if (target) {
            const ang = Math.atan2(target.cy - my, target.cx - mx);
            pointArrow(mx, my, ang, ns);
          }
        }
      }

      // charging build-up while holding down
      if (charging) {
        const chg = Math.min((ns - chT0) / 2.2, 1);
        dep(chx, chy, 0.45 + chg * 0.5, BRUSH * (2 + chg * 8));
        if (shake < 0.12 + chg * 0.35) shake = 0.12 + chg * 0.35;
      }

      ctx!.save();
      if (shake > 0.01) {
        shake *= 0.9;
        ctx!.translate((Math.random() - 0.5) * shake * 14, (Math.random() - 0.5) * shake * 14);
      } else {
        shake = 0;
      }
      ctx!.clearRect(-30, -30, W + 60, H + 60);

      const radius = Math.max(1, CELL / 2 - 1);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const v = heat[r * cols + c];
          if (v < 0.3 && !(v >= 0.86 && v < 1.02)) continue;
          ctx!.beginPath();
          ctx!.arc((c + 0.5) * CELL, (r + 0.5) * CELL, radius, 0, 2 * Math.PI);
          ctx!.fillStyle = `rgb(${pickColor(v)})`;
          ctx!.globalAlpha = Math.min(1, v);
          ctx!.fill();
        }
      }
      ctx!.globalAlpha = 1;
      ctx!.restore();
    }

    function loop(ts: number) {
      t = ts;
      render();
      animId = requestAnimationFrame(loop);
    }

    function onPointerMove(e: PointerEvent) {
      mx = e.clientX;
      my = e.clientY;
      hov = true;
    }
    function onPointerLeave() {
      hov = false;
      mx = -1;
      my = -1;
    }
    function onPointerDown(e: PointerEvent) {
      if ((e.target as HTMLElement)?.closest("a, button, input, select, label")) return;
      charging = true;
      chT0 = performance.now() / 1000;
      chx = e.clientX;
      chy = e.clientY;
    }
    function onPointerUp() {
      if (!charging) return;
      charging = false;
      const ns = performance.now() / 1000,
        ch = Math.min((ns - chT0) / 2.2, 1);
      waves.push({ x: chx, y: chy, t0: ns, pow: 0.35 + ch * 2.1 });
      dep(chx, chy, 1, BRUSH * (2.5 + ch * 18));
      shake = 0.45 + ch * 1.9;
    }
    function onDoubleClick(e: MouseEvent) {
      if ((e.target as HTMLElement)?.closest("a, button, input, select, label")) return;
      waves.push({ x: e.clientX, y: e.clientY, t0: performance.now() / 1000, pow: 2.8 });
      dep(e.clientX, e.clientY, 1, BRUSH * 22);
      shake = 2.4;
    }

    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave, { passive: true });
    document.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.addEventListener("pointerup", onPointerUp, { passive: true });
    document.addEventListener("dblclick", onDoubleClick, { passive: true });

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", collectHeadlines);
      mo.disconnect();
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("dblclick", onDoubleClick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9998]"
      style={{ width: "100%", height: "100%" }}
    />
  );
}
