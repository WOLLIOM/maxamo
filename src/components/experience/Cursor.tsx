"use client";

import { useEffect, useRef, useState } from "react";
import { lerp } from "@/lib/utils";

type CursorMode = "default" | "pick" | "action" | "text";

/**
 * A small spinning disc (record/CD) that replaces the native cursor on fine
 * pointers — a nod to the music side of SIMAX instead of a plain arrow.
 * - default: spins slowly, steady
 * - pick ([data-cursor="pick"], the 3D objects — guitars, vinyl, planet,
 *   arch block, code shape, notes): spins up faster, like it's "playing",
 *   and throws a few small particles off its rim
 * - action (links/buttons): scales up, gold ring, spins fastest
 * Position is driven by a single rAF loop with no React re-renders, so it
 * stays pinned at 60fps; only the rotation speed changes per mode.
 */
export function Cursor() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const discRef = useRef<HTMLDivElement>(null);
  const particleWrapRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<CursorMode>("default");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only enable on fine pointers (skip touch devices entirely).
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine) return;

    document.documentElement.classList.add("custom-cursor-active");

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const pos = { ...target };
    let raf = 0;
    let spinDeg = 0;
    let currentMode: CursorMode = "default";
    let particleTimer = 0;
    let lastTime = performance.now();

    function resolveMode(el: Element | null): CursorMode {
      if (!el) return "default";
      const tagged = el.closest<HTMLElement>("[data-cursor]");
      if (tagged) return (tagged.dataset.cursor as CursorMode) || "default";
      if (el.closest("a, button, [role='button'], input, textarea, select, label"))
        return "action";
      return "default";
    }

    function onMove(e: PointerEvent) {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!visibleRef.current) {
        visibleRef.current = true;
        setVisible(true);
      }
      const next = resolveMode(document.elementFromPoint(e.clientX, e.clientY));
      if (next !== currentMode) {
        currentMode = next;
        setMode(next);
      }
    }

    const visibleRef = { current: false };
    function onLeave() {
      visibleRef.current = false;
      setVisible(false);
    }
    function onDown() {
      if (wrapRef.current) wrapRef.current.style.setProperty("--press", "0.82");
    }
    function onUp() {
      if (wrapRef.current) wrapRef.current.style.setProperty("--press", "1");
    }

    function spawnParticle() {
      const wrap = particleWrapRef.current;
      if (!wrap || reduce) return;
      const dot = document.createElement("span");
      const angle = Math.random() * Math.PI * 2;
      const dist = 16 + Math.random() * 10;
      dot.style.cssText = `
        position:absolute; left:0; top:0; width:3px; height:3px; border-radius:50%;
        background:#c4a260; pointer-events:none;
        transform: translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px);
        opacity:0.9; transition: transform 0.5s ease-out, opacity 0.5s ease-out;
      `;
      wrap.appendChild(dot);
      requestAnimationFrame(() => {
        dot.style.transform = `translate(${Math.cos(angle) * (dist + 22)}px, ${
          Math.sin(angle) * (dist + 22)
        }px)`;
        dot.style.opacity = "0";
      });
      setTimeout(() => dot.remove(), 520);
    }

    function frame(now: number) {
      const dt = now - lastTime;
      lastTime = now;

      const ease = reduce ? 1 : 0.18;
      pos.x = lerp(pos.x, target.x, ease);
      pos.y = lerp(pos.y, target.y, ease);

      if (wrapRef.current) {
        wrapRef.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      }

      // Spin speed per mode — faster = "louder" / more energetic.
      let degPerFrame = 1.1; // default resting spin
      let particleRate = 0;
      if (currentMode === "pick") {
        degPerFrame = 4.2;
        particleRate = 90; // ms between sparks
      } else if (currentMode === "action") {
        degPerFrame = 6.5;
        particleRate = 60;
      }

      spinDeg = (spinDeg + degPerFrame) % 360;
      if (discRef.current) {
        discRef.current.style.transform = `rotate(${spinDeg}deg)`;
      }

      if (particleRate) {
        particleTimer += dt;
        if (particleTimer > particleRate) {
          particleTimer = 0;
          spawnParticle();
        }
      } else {
        particleTimer = 0;
      }

      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      document.documentElement.classList.remove("custom-cursor-active");
    };
  }, []);

  const size = mode === "action" ? 30 : mode === "pick" ? 27 : 22;

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[10002] hidden [--press:1] md:block"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 0.4s ease",
      }}
    >
      <div
        className="relative -translate-x-1/2 -translate-y-1/2"
        style={{ transform: "scale(var(--press))", transition: "transform 0.14s ease" }}
      >
        {/* Spark particles thrown off the rim while "playing" */}
        <div ref={particleWrapRef} className="absolute left-0 top-0 h-0 w-0" />

        {/* The disc itself — dark vinyl grooves, cherry-red label, gold rim */}
        <div
          className="relative"
          style={{
            width: size,
            height: size,
            transition: "width 0.18s ease, height 0.18s ease",
            filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))",
          }}
        >
          <div
            ref={discRef}
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "conic-gradient(from 0deg, #17151a, #2a2830 8%, #17151a 16%, #2a2830 24%, #17151a 32%, #2a2830 40%, #17151a 48%, #2a2830 56%, #17151a 64%, #2a2830 72%, #17151a 80%, #2a2830 88%, #17151a 100%)",
              border: "1px solid rgba(196,162,96,0.55)",
            }}
          >
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: "40%",
                height: "40%",
                background: "#a82026",
                boxShadow: "0 0 0 1px rgba(196,162,96,0.7) inset",
              }}
            />
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0f0e10]"
              style={{ width: "12%", height: "12%" }}
            />
          </div>
        </div>

        {/* Gold glow ring for action targets */}
        <div
          className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-gold"
          style={{
            opacity: mode === "action" ? 0.9 : 0,
            transform: `translate(-50%,-50%) scale(${mode === "action" ? 1 : 0.6})`,
            transition: "all 0.3s cubic-bezier(0.22,1,0.36,1)",
          }}
        />
      </div>
    </div>
  );
}
