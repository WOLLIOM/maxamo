"use client";

import { useEffect, useRef } from "react";

/**
 * A continuously scrolling strip of chunky pixel text, each cell tinted a
 * little differently for depth — mostly orange (the site accent), with
 * warm gold/yellow highlights and the occasional dark fleck so it reads as
 * lit-from-within rather than a flat silhouette.
 */
export function PixelMarquee({
  text = "the answer is yes we do it   ",
  className,
  cell = 7,
  speed = 0.55,
}: {
  text?: string;
  className?: string;
  cell?: number;
  speed?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;

    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    // palette: mostly the site's orange accent, warm gold for lift, a rare
    // dark fleck for contrast/depth
    const ORANGE = [214, 86, 48];
    const ORANGE_SOFT = [232, 140, 90];
    const GOLD = [220, 168, 98];
    const GOLD_LIGHT = [237, 197, 138];
    const DARK = [26, 20, 18];

    function hash(n: number) {
      const s = Math.sin(n * 12.9898) * 43758.5453;
      return s - Math.floor(s);
    }
    function pickColor(seed: number) {
      const r = hash(seed);
      if (r < 0.08) return DARK; // rare dark fleck for depth/contrast
      if (r < 0.4) return GOLD;
      if (r < 0.52) return GOLD_LIGHT;
      if (r < 0.8) return ORANGE;
      return ORANGE_SOFT;
    }

    let W = 0,
      H = 0,
      cols = 0,
      rows = 0,
      on = true;

    // build an offscreen 1-bit mask of the text using the page's display font
    const maskCanvas = document.createElement("canvas");
    const mctx = maskCanvas.getContext("2d")!;
    let maskW = 0;
    const maskH = 32;
    let maskData: Uint8ClampedArray | null = null;

    function buildMask() {
      const fontSize = 26;
      mctx.font = `600 ${fontSize}px var(--font-serif, serif)`;
      maskW = Math.max(8, Math.ceil(mctx.measureText(text).width) + 20);
      maskCanvas.width = maskW;
      maskCanvas.height = maskH;
      mctx.font = `600 ${fontSize}px var(--font-serif, serif)`;
      mctx.textBaseline = "middle";
      mctx.fillStyle = "#000";
      mctx.clearRect(0, 0, maskW, maskH);
      mctx.fillText(text, 10, maskH / 2);
      maskData = mctx.getImageData(0, 0, maskW, maskH).data;
    }
    buildMask();

    function size() {
      const r = cv!.getBoundingClientRect();
      if (r.width < 2) return;
      W = r.width;
      H = r.height;
      cv!.width = Math.round(W * DPR);
      cv!.height = Math.round(H * DPR);
      ctx!.setTransform(DPR, 0, 0, DPR, 0, 0);
      cols = Math.ceil(W / cell);
      rows = Math.ceil(H / cell);
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

    let scroll = 0;
    let t = 0;

    function frame() {
      if (!cols || !maskData || !rows) return;
      ctx!.clearRect(0, 0, W, H);
      const so = Math.floor(scroll);

      for (let c = 0; c < cols; c++) {
        const mc = (((so + c) % maskW) + maskW) % maskW;
        for (let r = 0; r < rows; r++) {
          const my = Math.min(maskH - 1, Math.floor((r * cell * maskH) / H));
          const alpha = maskData[(my * maskW + mc) * 4 + 3];
          if (alpha > 80) {
            const col = pickColor(c * 1.7 + r * 3.1 + Math.floor(t * 0.05));
            // subtle shimmer per-cell so it feels alive, not static
            const shimmer = 0.85 + 0.15 * Math.sin(c * 0.6 + r * 0.6 - t * 0.05);
            ctx!.fillStyle = `rgb(${Math.min(255, col[0] * shimmer)}, ${Math.min(
              255,
              col[1] * shimmer
            )}, ${Math.min(255, col[2] * shimmer)})`;
            ctx!.fillRect(c * cell, r * cell, cell - 1, cell - 1);
          }
        }
      }
    }

    let raf = 0;
    function loop() {
      if (on) {
        scroll += speed;
        t += 1;
        frame();
      }
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io?.disconnect();
    };
  }, [text, cell, speed]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
