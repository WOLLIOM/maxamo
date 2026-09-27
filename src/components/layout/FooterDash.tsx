"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Footer easter egg: a tiny Geometry-Dash-style runner (replaces the old Tetris
 * one — Simon didn't like the all-orange colouring or the amount of on-screen
 * text). Tap/click/space to jump a square over spikes and blocks; every few
 * points passed is a "level" and the whole scene re-skins to a new colour
 * theme, not the site's own orange, so it visibly changes while you play.
 *
 * Deliberately light on text (score number only) and on code: a fixed 60Hz
 * physics step driving plain canvas 2D shapes, no asset files. FooterTetris.tsx
 * is left untouched and simply no longer imported by Footer.tsx.
 */

const STEP = 1 / 60; // fixed physics tick
const GRAVITY = 2200; // px/s^2
const JUMP_V = -760; // px/s
const GROUND_FRAC = 0.78; // ground line, as a fraction of canvas height
const BOX = 26; // player square, px

// A handful of complete colour themes — deliberately NOT the site's orange
// "golden hour" palette, so leveling up visibly reskins the scene.
const THEMES = [
  { bg: "#151a2e", ground: "#20284a", accent: "#7ee3ff", player: "#eaf6ff", ob: "#3d6fb8" },
  { bg: "#1c1030", ground: "#2c1a49", accent: "#c9a6ff", player: "#f3e8ff", ob: "#7a4fd1" },
  { bg: "#0f2418", ground: "#173824", accent: "#7be89a", player: "#eafff2", ob: "#2f8f5a" },
  { bg: "#2a1418", ground: "#3c1e24", accent: "#ff8fa3", player: "#fff0f2", ob: "#c94f68" },
  { bg: "#241d0d", ground: "#3a2f14", accent: "#ffd166", player: "#fff6df", ob: "#c99a2e" },
];
const LEVEL_UP_EVERY = 6; // points per level

type Obstacle = { x: number; w: number; h: number; kind: "spike" | "block"; scoredFlag?: boolean };

export function FooterDash() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scoreElRef = useRef<HTMLSpanElement>(null);
  const bestElRef = useRef<HTMLSpanElement>(null);
  // Pure UI state, updated only at transitions (start / game over / retry) —
  // never every frame, so this doesn't fight the imperative game loop below.
  const [active, setActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const cv = canvasRef.current;
    const ctx = cv?.getContext("2d");
    if (!wrap || !cv || !ctx) return;

    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let DPR = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0,
      H = 0,
      ground = 0;
    let playing = false;
    let over = false;

    // Guard against redundant resizes: assigning canvas.width/height — even to
    // the SAME value — wipes its contents to transparent. A ResizeObserver can
    // fire more than once for the same box size (font load, scrollbar, layout
    // settle), which was silently blanking the canvas after it had already
    // drawn a frame. Only touch the canvas when the size actually changed.
    let lastCW = -1,
      lastCH = -1;
    function size() {
      const r = wrap!.getBoundingClientRect();
      W = r.width;
      H = r.height;
      ground = H * GROUND_FRAC;
      const cw = Math.round(W * DPR);
      const ch = Math.round(H * DPR);
      if (cw === lastCW && ch === lastCH) return;
      lastCW = cw;
      lastCH = ch;
      cv!.width = cw;
      cv!.height = ch;
      ctx!.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    size();
    const ro = new ResizeObserver(size);
    ro.observe(wrap);

    // ---- game state ----
    let py = 0; // player y offset above ground (0 = grounded), px
    let vy = 0;
    let grounded = true;
    let speed = 260; // px/s, ramps up slowly with score
    let obstacles: Obstacle[] = [];
    let spawnTimer = 0;
    let score = 0;
    let level = 0;
    let lastLevel = 0;
    let themeMix = 0; // 0..1 blend into the next theme, for a soft transition
    let best = 0;
    try {
      best = Number(localStorage.getItem("simax-dash-best") || 0);
    } catch {}
    if (bestElRef.current) bestElRef.current.textContent = String(best);

    function lerpColor(a: string, b: string, t: number) {
      const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
      const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
      const c = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
      return `rgb(${c[0]},${c[1]},${c[2]})`;
    }
    function theme() {
      const a = THEMES[level % THEMES.length];
      const b = THEMES[(level + 1) % THEMES.length];
      return {
        bg: lerpColor(a.bg, b.bg, themeMix),
        ground: lerpColor(a.ground, b.ground, themeMix),
        accent: lerpColor(a.accent, b.accent, themeMix),
        player: lerpColor(a.player, b.player, themeMix),
        ob: lerpColor(a.ob, b.ob, themeMix),
      };
    }

    function reset() {
      py = 0;
      vy = 0;
      grounded = true;
      speed = 260;
      obstacles = [];
      spawnTimer = 1.1;
      score = 0;
      level = 0;
      lastLevel = 0;
      themeMix = 0;
      over = false;
      setGameOver(false);
      if (scoreElRef.current) scoreElRef.current.textContent = "0";
    }
    reset();

    function jump() {
      if (!playing) {
        playing = true;
        setActive(true);
        return;
      }
      if (over) {
        reset();
        return;
      }
      if (grounded) {
        vy = JUMP_V;
        grounded = false;
      }
    }

    function spawn() {
      const spike = Math.random() < 0.6;
      const h = spike ? 24 + Math.random() * 10 : 26 + Math.random() * 18;
      obstacles.push({ x: W + 20, w: spike ? h * 0.9 : 22 + Math.random() * 14, h, kind: spike ? "spike" : "block" });
    }

    function tick(dt: number) {
      if (!playing || over) return;
      if (!grounded) {
        vy += GRAVITY * dt;
        py -= vy * dt;
        if (py <= 0) {
          py = 0;
          vy = 0;
          grounded = true;
        }
      }
      speed = Math.min(560, speed + dt * 6);
      spawnTimer -= dt;
      if (spawnTimer <= 0) {
        spawn();
        spawnTimer = Math.max(0.62, 1.35 - score * 0.015);
      }
      const px = W * 0.18;
      for (let i = obstacles.length - 1; i >= 0; i--) {
        const o = obstacles[i];
        o.x -= speed * dt;
        if (o.x + o.w < 0) {
          obstacles.splice(i, 1);
          continue;
        }
        if (!o.scoredFlag && o.x + o.w < px - BOX / 2) {
          o.scoredFlag = true;
          score++;
          if (scoreElRef.current) scoreElRef.current.textContent = String(score);
          if (score % LEVEL_UP_EVERY === 0) level++;
        }
        const playerTop = ground - BOX - py;
        const playerBottom = ground - py;
        const obTop = ground - o.h;
        const inset = o.kind === "spike" ? o.w * 0.22 : 0;
        const hit =
          px + BOX / 2 > o.x + inset &&
          px - BOX / 2 < o.x + o.w - inset &&
          playerBottom > obTop + (o.kind === "spike" ? 4 : 0) &&
          playerTop < ground;
        if (hit) {
          over = true;
          if (score > best) {
            best = score;
            try {
              localStorage.setItem("simax-dash-best", String(best));
            } catch {}
            if (bestElRef.current) bestElRef.current.textContent = String(best);
          }
          setGameOver(true);
        }
      }
      themeMix += dt * 0.25;
      if (themeMix > 1) themeMix = 1;
    }

    function draw() {
      const th = theme();
      ctx!.clearRect(0, 0, W, H);
      ctx!.fillStyle = th.bg;
      ctx!.fillRect(0, 0, W, H);
      ctx!.fillStyle = th.ground;
      ctx!.fillRect(0, ground, W, H - ground);
      ctx!.strokeStyle = th.accent;
      ctx!.globalAlpha = 0.5;
      ctx!.beginPath();
      ctx!.moveTo(0, ground + 0.5);
      ctx!.lineTo(W, ground + 0.5);
      ctx!.stroke();
      ctx!.globalAlpha = 1;

      for (const o of obstacles) {
        ctx!.fillStyle = th.ob;
        if (o.kind === "block") {
          ctx!.fillRect(o.x, ground - o.h, o.w, o.h);
        } else {
          ctx!.beginPath();
          ctx!.moveTo(o.x, ground);
          ctx!.lineTo(o.x + o.w / 2, ground - o.h);
          ctx!.lineTo(o.x + o.w, ground);
          ctx!.closePath();
          ctx!.fill();
        }
      }

      const px = W * 0.18;
      const pcy = ground - BOX / 2 - py;
      ctx!.save();
      ctx!.translate(px, pcy);
      if (!grounded && !reduce) ctx!.rotate((-py / 120) * Math.PI * 0.6);
      ctx!.fillStyle = th.player;
      ctx!.fillRect(-BOX / 2, -BOX / 2, BOX, BOX);
      ctx!.strokeStyle = th.accent;
      ctx!.lineWidth = 2;
      ctx!.strokeRect(-BOX / 2, -BOX / 2, BOX, BOX);
      ctx!.restore();
    }

    let raf = 0;
    let last = performance.now();
    let acc = 0;
    function loop(now: number) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (playing && !over) {
        if (level !== lastLevel) {
          themeMix = 0;
          lastLevel = level;
        }
        acc += dt;
        while (acc >= STEP) {
          tick(STEP);
          acc -= STEP;
        }
      } else if (!playing) {
        themeMix = 0;
      }
      draw();
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    function onKey(e: KeyboardEvent) {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        jump();
      }
    }
    wrap.addEventListener("click", jump);
    document.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      wrap.removeEventListener("click", jump);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className={
        "relative w-full cursor-pointer select-none overflow-hidden transition-[height] duration-500 " +
        (active ? "h-[min(38vh,260px)]" : "h-16 md:h-20")
      }
      role="button"
      aria-label="Play a hidden runner game"
    >
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 block h-full w-full" />

      {!active && (
        <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink/90 px-5 py-2 text-[0.62rem] uppercase tracking-wider2 text-bg">
          Tap to play
        </span>
      )}

      {active && (
        <span className="pointer-events-none absolute left-4 top-3 flex items-baseline gap-2 font-mono text-sm text-ink/90">
          <span ref={scoreElRef}>0</span>
          <span className="text-[0.6rem] text-ink/50">best</span>
          <span ref={bestElRef} className="text-[0.6rem] text-ink/50">
            0
          </span>
        </span>
      )}

      {gameOver && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/35">
          <span className="rounded-full bg-ink/90 px-5 py-2 text-[0.62rem] uppercase tracking-wider2 text-bg">
            Tap to retry
          </span>
        </div>
      )}
    </div>
  );
}
