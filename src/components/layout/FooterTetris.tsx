"use client";

import { useEffect, useRef } from "react";

/**
 * Ported from the original site's footer Tetris easter egg: an ambient
 * auto-building skyline that idles behind the footer, and turns into a full
 * playable Tetris board on click. Colors are pulled from our own palette
 * (accent / gold / silver / ink) instead of the original neon set.
 */
export function FooterTetris() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    const footer = footerRef.current;
    const ov = overlayRef.current;
    const scoreEl = scoreRef.current;
    if (!cv || !footer || !ov || !scoreEl) return;
    const ctxOrNull = cv.getContext("2d");
    if (!ctxOrNull) return;
    const ctx: CanvasRenderingContext2D = ctxOrNull;

    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Palette pulled live from CSS vars so it follows the time-of-day theme.
    function cssVar(name: string) {
      const v = getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();
      return v ? `rgb(${v.replace(/\s+/g, ",")})` : "#888";
    }
    const PAL = [
      cssVar("--c-line"),
      cssVar("--c-accent"),
      cssVar("--c-gold"),
      cssVar("--c-silver"),
      cssVar("--c-accent-soft"),
    ];

    let DPR = Math.min(window.devicePixelRatio || 1, 2);
    const cell = 9;
    let W = 0,
      H = 0,
      cols = 0,
      rows = 0;
    let on = true;
    let phase: "idle" | "flick" | "expand" | "play" = "idle";
    let grid: Int8Array | null = null;

    function hsh(a: number) {
      const n = Math.sin(a * 12.9898) * 43758.5453;
      return n - Math.floor(n);
    }
    function ci(s: number) {
      return 1 + Math.min(4, (hsh(s) * 5) | 0);
    }
    function seed() {
      if (!grid) return;
      for (let c = 0; c < cols; c++) {
        if (hsh(c * 2.3 + 1.1) < 0.3) continue;
        const hh = 1 + Math.floor(hsh(c * 4.7 + 0.5) * (rows * 0.58));
        for (let r = rows - 1; r >= rows - hh && r >= 0; r--)
          grid[r * cols + c] = ci(c * 9.1 + r * 3.7);
      }
    }

    const APCS = [
      [[0, 0], [1, 0], [2, 0], [3, 0]],
      [[0, 0], [1, 0], [0, 1], [1, 1]],
      [[0, 0], [1, 0], [2, 0], [1, 1]],
      [[0, 0], [0, 1], [1, 1], [2, 1]],
      [[0, 0], [1, 0], [2, 0], [2, 1]],
      [[0, 0], [1, 0], [1, 1], [2, 1]],
    ];
    type APiece = { m: number[][]; x: number; y: number; col: number };
    let apiece: APiece | null = null;
    let at = 0,
      afade = 0,
      flick = 0;

    function aspawn() {
      if (!cols) return;
      const m = APCS[(Math.random() * APCS.length) | 0];
      let w = 0;
      for (let i = 0; i < m.length; i++) w = Math.max(w, m[i][0]);
      apiece = {
        m,
        x: (Math.random() * (cols - w)) | 0,
        y: -2,
        col: 1 + Math.min(4, (Math.random() * 5) | 0),
      };
    }
    function ahit(m: number[][], px: number, py: number) {
      for (let i = 0; i < m.length; i++) {
        const gx = px + m[i][0],
          gy = py + m[i][1];
        if (gy >= rows) return true;
        if (gy >= 0 && grid && (gx < 0 || gx >= cols || grid[gy * cols + gx]))
          return true;
      }
      return false;
    }
    function astep() {
      if (afade > 0) return;
      if (!apiece) {
        aspawn();
        return;
      }
      if (ahit(apiece.m, apiece.x, apiece.y + 1)) {
        let top = rows;
        for (let i = 0; i < apiece.m.length; i++) {
          const gx = apiece.x + apiece.m[i][0],
            gy = apiece.y + apiece.m[i][1];
          if (gy >= 0 && gy < rows && grid) {
            grid[gy * cols + gx] = apiece.col;
            if (gy < top) top = gy;
          }
        }
        if (top <= 1) afade = 0.001;
        apiece = null;
      } else apiece.y++;
    }
    function adraw() {
      ctx.clearRect(0, 0, W, H);
      const a = afade > 0 ? Math.max(0, 1 - afade) : 1;
      const fk = Math.floor(flick * 30);
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const g = grid ? grid[r * cols + c] : 0;
          if (!g) continue;
          if (flick > 0 && hsh(c * 7.1 + r * 3.3 + fk * 2.7) < flick) continue;
          ctx.globalAlpha = a;
          ctx.fillStyle = PAL[g - 1];
          ctx.fillRect(c * cell, r * cell, cell - 1, cell - 1);
        }
      if (apiece && flick <= 0) {
        ctx.globalAlpha = 1;
        ctx.fillStyle = PAL[apiece.col - 1];
        for (let i = 0; i < apiece.m.length; i++) {
          const gx = apiece.x + apiece.m[i][0],
            gy = apiece.y + apiece.m[i][1];
          if (gy >= 0) ctx.fillRect(gx * cell, gy * cell, cell - 1, cell - 1);
        }
      }
      ctx.globalAlpha = 1;
    }

    // ---- playable board ----
    const PIECES = [
      { c: 1, m: [[1, 1, 1, 1]] },
      { c: 2, m: [[1, 1], [1, 1]] },
      { c: 4, m: [[0, 1, 0], [1, 1, 1]] },
      { c: 3, m: [[0, 1, 1], [1, 1, 0]] },
      { c: 0, m: [[1, 1, 0], [0, 1, 1]] },
      { c: 1, m: [[1, 0, 0], [1, 1, 1]] },
      { c: 2, m: [[0, 0, 1], [1, 1, 1]] },
    ];
    type Cur = { m: number[][]; c: number; x: number; y: number };
    let curs: Cur[] = [];
    let over = false;
    const dropMs = 300;
    let grav: ReturnType<typeof setTimeout> | undefined;
    let spawnT = 0;
    let score = 0;

    function rot(m: number[][]) {
      const R = m.length,
        C = m[0].length;
      const n: number[][] = [];
      for (let x = 0; x < C; x++) {
        n[x] = [];
        for (let y = 0; y < R; y++) n[x][y] = m[R - 1 - y][x];
      }
      return n;
    }
    function phit(m: number[][], px: number, py: number) {
      for (let y = 0; y < m.length; y++)
        for (let x = 0; x < m[0].length; x++) {
          if (!m[y][x]) continue;
          const gx = px + x,
            gy = py + y;
          if (
            gx < 0 ||
            gx >= cols ||
            gy >= rows ||
            (gy >= 0 && grid && grid[gy * cols + gx])
          )
            return true;
        }
      return false;
    }
    function spawnOne() {
      const cap = Math.max(2, Math.round(cols / 38));
      if (curs.length >= cap) return;
      const p = PIECES[(Math.random() * PIECES.length) | 0];
      const pw = p.m[0].length;
      for (let t = 0; t < 8; t++) {
        const x = (Math.random() * (cols - pw + 1)) | 0;
        if (!phit(p.m, x, 0)) {
          curs.push({ m: p.m, c: p.c, x, y: -p.m.length });
          return;
        }
      }
    }
    function mergeP(pc: Cur) {
      for (let y = 0; y < pc.m.length; y++)
        for (let x = 0; x < pc.m[0].length; x++) {
          if (pc.m[y][x]) {
            const gy = pc.y + y;
            if (gy >= 0 && gy < rows && grid) grid[gy * cols + pc.x + x] = pc.c + 1;
          }
        }
    }
    function setScore() {
      scoreEl!.textContent = ("000000" + score).slice(-6);
    }
    function clearLines() {
      if (!grid) return;
      let n = 0;
      for (let y = rows - 1; y >= 0; y--) {
        let full = true;
        for (let x = 0; x < cols; x++) {
          if (!grid[y * cols + x]) {
            full = false;
            break;
          }
        }
        if (full) {
          for (let yy = y; yy > 0; yy--)
            for (let x2 = 0; x2 < cols; x2++)
              grid[yy * cols + x2] = grid[(yy - 1) * cols + x2];
          for (let x3 = 0; x3 < cols; x3++) grid[x3] = 0;
          n++;
          y++;
        }
      }
      if (n) {
        score += [0, 100, 300, 600, 1000][Math.min(4, n)];
        setScore();
      }
    }
    function pdraw() {
      ctx.clearRect(0, 0, W, H);
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const g = grid ? grid[r * cols + c] : 0;
          if (g) {
            ctx.fillStyle = PAL[g - 1];
            ctx.fillRect(c * cell, r * cell, cell - 1, cell - 1);
          }
        }
      for (let i = 0; i < curs.length; i++) {
        const pc = curs[i];
        ctx.fillStyle = PAL[pc.c];
        for (let yy = 0; yy < pc.m.length; yy++)
          for (let xx = 0; xx < pc.m[0].length; xx++) {
            if (pc.m[yy][xx]) {
              const cy = pc.y + yy;
              if (cy >= 0) ctx.fillRect((pc.x + xx) * cell, cy * cell, cell - 1, cell - 1);
            }
          }
      }
      ov!.classList.toggle("tt-isover", !!over);
    }
    function pmove(d: number) {
      if (over) return;
      let mv = false;
      for (let i = 0; i < curs.length; i++) {
        const c = curs[i];
        if (!phit(c.m, c.x + d, c.y)) {
          c.x += d;
          mv = true;
        }
      }
      if (mv) pdraw();
    }
    function psoft() {
      if (over) return;
      for (let i = 0; i < curs.length; i++) {
        const c = curs[i];
        if (!phit(c.m, c.x, c.y + 1)) c.y++;
      }
      pdraw();
    }
    function protate() {
      if (over) return;
      for (let i = 0; i < curs.length; i++) {
        const c = curs[i];
        const r = rot(c.m);
        const k = [0, -1, 1, -2, 2];
        for (let j = 0; j < k.length; j++) {
          if (!phit(r, c.x + k[j], c.y)) {
            c.m = r;
            c.x += k[j];
            break;
          }
        }
      }
      pdraw();
    }
    function phard() {
      if (over) return;
      for (let i = 0; i < curs.length; i++) {
        const c = curs[i];
        while (!phit(c.m, c.x, c.y + 1)) c.y++;
        mergeP(c);
        if (c.y <= 0) over = true;
      }
      curs = [];
      clearLines();
      pdraw();
    }
    function pstep() {
      if (over) return;
      const still: Cur[] = [];
      for (let i = 0; i < curs.length; i++) {
        const c = curs[i];
        if (phit(c.m, c.x, c.y + 1)) {
          mergeP(c);
          if (c.y <= 0) over = true;
        } else {
          c.y++;
          still.push(c);
        }
      }
      curs = still;
      if (--spawnT <= 0) {
        spawnOne();
        spawnT = 1 + ((Math.random() * 4) | 0);
      }
      clearLines();
      pdraw();
    }
    function gtick() {
      if (phase !== "play" || over) return;
      pstep();
      grav = setTimeout(gtick, dropMs);
    }
    function beginPlay() {
      phase = "play";
      size();
      if (grid) for (let i = 0; i < grid.length; i++) grid[i] = 0;
      over = false;
      score = 0;
      setScore();
      curs = [];
      spawnT = 0;
      spawnOne();
      spawnOne();
      pdraw();
      clearTimeout(grav);
      grav = setTimeout(gtick, dropMs);
    }

    function size() {
      const r = cv!.getBoundingClientRect();
      if (r.width < 2) return;
      W = r.width;
      H = r.height;
      cv!.width = Math.round(W * DPR);
      cv!.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      cols = Math.ceil(W / cell);
      rows = Math.floor(H / cell);
      grid = new Int8Array(cols * rows);
      if (phase === "idle") seed();
    }
    size();

    const resizeObs =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            const wasPlay = phase === "play";
            size();
            if (wasPlay) {
              over = false;
              curs = [];
              spawnT = 0;
              pdraw();
            }
          })
        : null;
    resizeObs?.observe(cv);

    const io =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver((es) => {
            es.forEach((e) => (on = e.isIntersecting));
          })
        : null;
    io?.observe(cv);

    function glideToFooter() {
      const startY = window.pageYOffset || 0;
      const start = performance.now();
      function tick(now: number) {
        const p = Math.min(1, (now - start) / 560);
        const e = 1 - Math.pow(1 - p, 3);
        const maxNow =
          Math.max(document.documentElement.scrollHeight, document.body.scrollHeight) -
          innerHeight;
        window.scrollTo(0, startY + (maxNow - startY) * e);
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
    function startGame() {
      if (phase !== "idle") return;
      phase = "flick";
      flick = 0.001;
    }
    function endGame() {
      phase = "idle";
      footer!.classList.remove("playing");
      clearTimeout(grav);
      flick = 0;
      over = false;
      curs = [];
    }
    function key(e: KeyboardEvent) {
      if (phase !== "play") return;
      if (e.key === "Escape") {
        endGame();
        return;
      }
      if (over) {
        if (e.key === "Enter") beginPlay();
        return;
      }
      if (e.key === "ArrowLeft") {
        pmove(-1);
        e.preventDefault();
      } else if (e.key === "ArrowRight") {
        pmove(1);
        e.preventDefault();
      } else if (e.key === "ArrowDown") {
        psoft();
        e.preventDefault();
      } else if (e.key === "ArrowUp" || e.key === "x" || e.key === "X") {
        protate();
        e.preventDefault();
      } else if (e.key === " ") {
        phard();
        e.preventDefault();
      }
    }
    document.addEventListener("keydown", key);

    function onFooterClick(e: MouseEvent) {
      const t = e.target as HTMLElement;
      if (phase !== "idle" || t.closest(".tt-close,.tt-pad,.tt-again")) return;
      startGame();
    }
    footer.addEventListener("click", onFooterClick);

    const again = ov.querySelector<HTMLButtonElement>(".tt-again");
    const close = ov.querySelector<HTMLButtonElement>(".tt-close");
    const padBtns = ov.querySelectorAll<HTMLButtonElement>(".tt-pad button");
    function onAgain(e: MouseEvent) {
      e.stopPropagation();
      beginPlay();
    }
    function onClose(e: MouseEvent) {
      e.stopPropagation();
      endGame();
    }
    again?.addEventListener("click", onAgain);
    close?.addEventListener("click", onClose);
    const padHandlers: Array<[HTMLButtonElement, (e: MouseEvent) => void]> = [];
    padBtns.forEach((b) => {
      const h = (e: MouseEvent) => {
        e.stopPropagation();
        if (over) {
          beginPlay();
          return;
        }
        const a = b.getAttribute("data-k");
        if (a === "left") pmove(-1);
        else if (a === "right") pmove(1);
        else if (a === "rot") protate();
        else phard();
      };
      b.addEventListener("click", h);
      padHandlers.push([b, h]);
    });

    let raf = 0;
    function loop() {
      if (on && !reduce) {
        if (phase === "idle") {
          at++;
          if (at % 5 === 0) astep();
          if (afade > 0) {
            afade += 0.05;
            if (afade >= 1) {
              grid = new Int8Array(cols * rows);
              seed();
              afade = 0;
            }
          }
          adraw();
        } else if (phase === "flick") {
          flick += 0.06;
          adraw();
          if (flick >= 1) {
            phase = "expand";
            footer!.classList.add("playing");
            glideToFooter();
            setTimeout(beginPlay, 580);
          }
        }
      }
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(grav);
      document.removeEventListener("keydown", key);
      footer.removeEventListener("click", onFooterClick);
      again?.removeEventListener("click", onAgain);
      close?.removeEventListener("click", onClose);
      padHandlers.forEach(([b, h]) => b.removeEventListener("click", h));
      resizeObs?.disconnect();
      io?.disconnect();
    };
  }, []);

  return (
    <div
      ref={footerRef}
      className="tt-footer-game relative h-[calc(var(--tt-cell,9px)*9)] w-full cursor-pointer overflow-hidden transition-[height] duration-500"
      role="button"
      aria-label="Play a hidden Tetris game"
    >
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-x-0 bottom-0 top-auto block h-full w-full" />

      <button
        type="button"
        className="tt-teaser absolute left-1/2 top-1/2 z-[4] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink px-6 py-3 text-[0.68rem] uppercase tracking-wider2 text-bg transition-all duration-300 hover:bg-accent"
        aria-label="Play tetris"
      >
        Psst — play tetris
      </button>

      <div ref={overlayRef} id="tetris" className="pointer-events-none absolute inset-0 z-[3] hidden font-mono">
        <div ref={scoreRef} className="tt-score absolute left-5 top-4 text-lg tracking-wider text-ink">
          000000
        </div>
        <div className="tt-pad pointer-events-auto absolute bottom-5 right-5 grid grid-cols-2 gap-2">
          <button
            data-k="left"
            aria-label="Move left"
            className="grid h-11 w-11 place-items-center rounded-full bg-bg text-ink shadow-lg transition-colors hover:bg-accent hover:text-bg"
          >
            ←
          </button>
          <button
            data-k="right"
            aria-label="Move right"
            className="grid h-11 w-11 place-items-center rounded-full bg-bg text-ink shadow-lg transition-colors hover:bg-accent hover:text-bg"
          >
            →
          </button>
          <button
            data-k="rot"
            aria-label="Rotate"
            className="grid h-11 w-11 place-items-center rounded-full bg-bg text-ink shadow-lg transition-colors hover:bg-accent hover:text-bg"
          >
            ⟳
          </button>
          <button
            data-k="drop"
            aria-label="Hard drop"
            className="grid h-11 w-11 place-items-center rounded-full bg-bg text-ink shadow-lg transition-colors hover:bg-accent hover:text-bg"
          >
            ↓
          </button>
        </div>
        <button
          className="tt-close pointer-events-auto absolute right-5 top-4 z-[6] grid h-9 w-9 place-items-center rounded-full bg-bg text-ink shadow-lg transition-colors hover:bg-accent hover:text-bg"
          aria-label="Close"
        >
          ✕
        </button>
        <div className="tt-over pointer-events-auto absolute inset-0 z-[5] hidden flex-col items-center justify-center gap-4 bg-bg/85 text-center backdrop-blur-sm">
          <span className="text-3xl text-ink">Game over</span>
          <button
            type="button"
            className="tt-again rounded-full bg-ink px-7 py-3 text-sm text-bg transition-colors hover:bg-accent"
          >
            play again
          </button>
        </div>
      </div>

      <style jsx>{`
        .tt-footer-game.playing {
          height: min(52vh, 390px);
        }
        .tt-footer-game.playing .tt-teaser {
          opacity: 0;
          pointer-events: none;
          transform: translate(-50%, -50%) scale(0.86);
        }
        #tetris.tt-isover .tt-over {
          display: flex;
        }
        .tt-footer-game.playing #tetris {
          display: block;
        }
      `}</style>
    </div>
  );
}
