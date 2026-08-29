"use client";

import { useEffect, useRef } from "react";

/* ---------------------------------------------------------------------------
   A single 2D canvas hosts every ambient layer so we only pay for one rAF loop
   and one compositing pass:
     · dust   — luminous motes that brighten toward the cursor (Apple-style)
     · flecks — a few elongated gold flecks gently repelled by the pointer
     · rocket — small ships that grow curious and dart toward the cursor
     · sparks — very occasional drifting gold sparks
     · ripple — soft expanding rings created as the pointer moves / clicks
   Everything scales down on small screens and halts under reduced-motion.
---------------------------------------------------------------------------- */

interface RGB {
  ink: [number, number, number];
  accent: [number, number, number];
}

function readTheme(): RGB {
  const cs = getComputedStyle(document.documentElement);
  const parse = (v: string) =>
    v.trim().split(/\s+/).map(Number) as [number, number, number];
  return {
    ink: parse(cs.getPropertyValue("--c-ink")) ?? [26, 24, 22],
    accent: parse(cs.getPropertyValue("--c-accent")) ?? [176, 58, 46],
  };
}

export function AmbientCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const context = canvasEl.getContext("2d", { alpha: true });
    if (!context) return;
    // Non-null aliases so TS keeps them non-null inside the rAF closures below.
    const canvas: HTMLCanvasElement = canvasEl;
    const ctx: CanvasRenderingContext2D = context;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.innerWidth < 768;

    let W = 0;
    let H = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let theme = readTheme();

    const pointer = { x: -9999, y: -9999, px: -9999, py: -9999, active: false };

    // ---- entity pools -----------------------------------------------------
    const DUST = reduce ? 0 : mobile ? 9 : 46;
    const RICE = reduce ? 0 : mobile ? 1 : 6;
    const ROCKETS = reduce ? 0 : mobile ? 0 : 2;

    interface Dust { x: number; y: number; z: number; r: number; sx: number; sy: number; ph: number; }
    interface Rice { x: number; y: number; vx: number; vy: number; a: number; va: number; len: number; }
    interface Petal { x: number; y: number; vx: number; vy: number; a: number; va: number; s: number; life: number; }
    interface Ripple { x: number; y: number; r: number; max: number; a: number; }
    interface Rocket {
      x: number; y: number; a: number; speed: number; wobble: number;
      phase: number; hue: number; size: number; turn: number;
    }

    const dust: Dust[] = [];
    const rice: Rice[] = [];
    const petals: Petal[] = [];
    const ripples: Ripple[] = [];
    const rockets: Rocket[] = [];

    function seed() {
      dust.length = rice.length = rockets.length = 0;
      for (let i = 0; i < DUST; i++) {
        dust.push({
          x: Math.random() * W,
          y: Math.random() * H,
          z: Math.random(),
          r: 0.4 + Math.random() * 1.4,
          sx: (Math.random() - 0.5) * 0.12,
          sy: (Math.random() - 0.5) * 0.12,
          ph: Math.random() * Math.PI * 2,
        });
      }
      for (let i = 0; i < RICE; i++) {
        rice.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: 0,
          vy: 0,
          a: Math.random() * Math.PI,
          va: (Math.random() - 0.5) * 0.01,
          len: 5 + Math.random() * 3,
        });
      }
      for (let i = 0; i < ROCKETS; i++) {
        rockets.push({
          x: Math.random() * W,
          y: Math.random() * H,
          a: Math.random() * Math.PI * 2,
          speed: 0.5 + Math.random() * 0.4,
          wobble: 0,
          phase: Math.random() * Math.PI * 2,
          hue: Math.random(),
          size: 26 + Math.random() * 16,
          turn: 0,
        });
      }
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.75);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    // ---- pointer ----------------------------------------------------------
    let lastRipple = 0;
    function onMove(e: PointerEvent) {
      pointer.px = pointer.x;
      pointer.py = pointer.y;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
      const now = performance.now();
      const speed = Math.hypot(pointer.x - pointer.px, pointer.y - pointer.py);
      if (!reduce && speed > 6 && now - lastRipple > 90 && ripples.length < 18) {
        ripples.push({ x: pointer.x, y: pointer.y, r: 2, max: 42 + speed, a: 0.28 });
        lastRipple = now;
      }
    }
    function onClick(e: PointerEvent) {
      if (reduce) return;
      ripples.push({ x: e.clientX, y: e.clientY, r: 2, max: 150, a: 0.4 });
    }
    function onLeave() {
      pointer.active = false;
      pointer.x = pointer.y = -9999;
    }

    // ---- drawing ----------------------------------------------------------
    // Renamed in spirit from "rocket" to "note": a small drifting eighth-note
    // that grows curious and glides toward the cursor. Keeps the exact same
    // wander/attraction physics as before — only the shape drawn changed.
    function drawRocket(r: Rocket, time: number) {
      const [ar, ag, ab] = theme.accent;
      const [gr, gg, gb] = [196, 162, 96]; // gold, matches --c-gold
      const s = r.size * 0.6;
      const bob = Math.sin(time * 2 + r.phase) * s * 0.08;
      ctx.save();
      ctx.translate(r.x, r.y + bob);
      ctx.rotate(Math.sin(time * 0.6 + r.phase) * 0.18);

      // soft trailing glow
      const flicker = 0.55 + Math.sin(time * 5 + r.phase) * 0.2;
      ctx.beginPath();
      ctx.arc(0, 0, s * 1.15, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${ar},${ag},${ab},${0.1 * flicker})`;
      ctx.fill();

      // note head (filled oval, slightly tilted)
      ctx.save();
      ctx.translate(-s * 0.15, s * 0.55);
      ctx.rotate(-0.35);
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.36, s * 0.26, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${gr},${gg},${gb},0.42)`;
      ctx.fill();
      ctx.restore();

      // stem
      ctx.beginPath();
      ctx.moveTo(s * 0.18, s * 0.55);
      ctx.lineTo(s * 0.18, -s * 0.9);
      ctx.strokeStyle = `rgba(${gr},${gg},${gb},0.4)`;
      ctx.lineWidth = Math.max(1.4, s * 0.09);
      ctx.stroke();

      // flag
      ctx.beginPath();
      ctx.moveTo(s * 0.18, -s * 0.9);
      ctx.quadraticCurveTo(s * 0.75, -s * 0.72, s * 0.5, -s * 0.32);
      ctx.quadraticCurveTo(s * 0.7, -s * 0.5, s * 0.18, -s * 0.55);
      ctx.closePath();
      ctx.fillStyle = `rgba(${ar},${ag},${ab},0.4)`;
      ctx.fill();

      ctx.restore();
    }


    let raf = 0;
    let time = 0;
    let running = true;

    function tick() {
      time += 0.016;
      ctx.clearRect(0, 0, W, H);

      // DUST
      for (const d of dust) {
        d.x += d.sx + Math.sin(time * 0.4 + d.ph) * 0.06;
        d.y += d.sy + Math.cos(time * 0.3 + d.ph) * 0.05;
        if (d.x < 0) d.x = W;
        if (d.x > W) d.x = 0;
        if (d.y < 0) d.y = H;
        if (d.y > H) d.y = 0;
        const dx = d.x - pointer.x;
        const dy = d.y - pointer.y;
        const dist = Math.hypot(dx, dy);
        const glow = pointer.active ? Math.max(0, 1 - dist / 190) : 0;
        const base = 0.10 + d.z * 0.16;
        const alpha = base + glow * 0.55;
        const [ir, ig, ib] = theme.ink;
        const [ar, ag, ab] = theme.accent;
        const r = Math.round(ir + (ar - ir) * glow);
        const g = Math.round(ig + (ag - ig) * glow);
        const b = Math.round(ib + (ab - ib) * glow);
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r + glow * 1.1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.fill();
      }

      // RIPPLES
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.r += (r.max - r.r) * 0.06;
        r.a *= 0.93;
        const [ir, ig, ib] = theme.ink;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${ir},${ig},${ib},${r.a})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        if (r.a < 0.01) ripples.splice(i, 1);
      }

      // RICE — repelled by pointer, gentle drift + settle
      for (const g of rice) {
        const dx = g.x - pointer.x;
        const dy = g.y - pointer.y;
        const dist = Math.hypot(dx, dy);
        if (pointer.active && dist < 130) {
          const f = (1 - dist / 130) * 0.6;
          g.vx += (dx / (dist || 1)) * f;
          g.vy += (dy / (dist || 1)) * f;
          g.va += 0.02;
        }
        g.vx *= 0.92;
        g.vy *= 0.92;
        g.x += g.vx;
        g.y += g.vy;
        g.a += g.va;
        g.va *= 0.96;
        if (g.x < -10) g.x = W + 10;
        if (g.x > W + 10) g.x = -10;
        if (g.y < -10) g.y = H + 10;
        if (g.y > H + 10) g.y = -10;
        const [ir, ig, ib] = theme.ink;
        ctx.save();
        ctx.translate(g.x, g.y);
        ctx.rotate(g.a);
        ctx.beginPath();
        ctx.ellipse(0, 0, g.len, g.len * 0.34, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${ir},${ig},${ib},0.22)`;
        ctx.fill();
        ctx.restore();
      }

      // ROCKETS — wander + curiosity toward pointer
      for (const r of rockets) {
        let desired = r.a;
        if (pointer.active) {
          const dx = pointer.x - r.x;
          const dy = pointer.y - r.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 320) {
            desired = Math.atan2(dy, dx);
            r.speed = 0.9 + (1 - dist / 320) * 1.3;
          } else {
            r.speed += (0.55 - r.speed) * 0.02;
          }
        } else {
          r.speed += (0.55 - r.speed) * 0.02;
        }
        // idle meander
        r.phase += 0.02;
        desired += Math.sin(time * 0.5 + r.phase) * 0.4;
        // smooth turn
        let diff = desired - r.a;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        r.a += diff * 0.03;
        r.x += Math.cos(r.a) * r.speed;
        r.y += Math.sin(r.a) * r.speed;
        // wrap with margin
        const m = r.size * 2;
        if (r.x < -m) r.x = W + m;
        if (r.x > W + m) r.x = -m;
        if (r.y < -m) r.y = H + m;
        if (r.y > H + m) r.y = -m;
        drawRocket(r, time);
      }

      // SPARKS — spawn occasionally, drift & glint (gold, not petals)
      if (!reduce && Math.random() < 0.008 && petals.length < (mobile ? 6 : 14)) {
        petals.push({
          x: Math.random() * W,
          y: -20,
          vx: -0.3 - Math.random() * 0.5,
          vy: 0.5 + Math.random() * 0.7,
          a: Math.random() * Math.PI,
          va: (Math.random() - 0.5) * 0.05,
          s: 5 + Math.random() * 5,
          life: 1,
        });
      }
      for (let i = petals.length - 1; i >= 0; i--) {
        const p = petals[i];
        p.x += p.vx + Math.sin(time + p.y * 0.01) * 0.5;
        p.y += p.vy;
        p.a += p.va;
        const [ar, ag, ab] = theme.accent;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.a);
        ctx.beginPath();
        // simple spark: two arcs
        ctx.moveTo(0, -p.s);
        ctx.quadraticCurveTo(p.s * 0.7, 0, 0, p.s);
        ctx.quadraticCurveTo(-p.s * 0.7, 0, 0, -p.s);
        ctx.fillStyle = `rgba(${ar},${Math.min(ag + 90, 220)},${Math.min(ab + 90, 210)},0.30)`;
        ctx.fill();
        ctx.restore();
        if (p.y > H + 30) petals.splice(i, 1);
      }

      if (running) raf = requestAnimationFrame(tick);
    }

    function onVisibility() {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    }

    // theme changes: observe data-theme attribute
    const observer = new MutationObserver(() => {
      theme = readTheme();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    resize();
    raf = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onClick);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onClick);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1] h-full w-full"
    />
  );
}
