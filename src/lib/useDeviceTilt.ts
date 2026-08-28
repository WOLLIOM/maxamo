"use client";

import { useEffect, useRef } from "react";

type Tilt = { x: number; y: number };

/** Smoothed device tilt (−1…1). No React state — safe for rAF. */
export function useDeviceTiltRef(active: boolean) {
  const tilt = useRef<Tilt>({ x: 0, y: 0 });
  const target = useRef<Tilt>({ x: 0, y: 0 });
  const base = useRef<{ beta?: number; gamma?: number }>({});

  useEffect(() => {
    if (!active || typeof window === "undefined") return;

    const onOrient = (e: DeviceOrientationEvent) => {
      const beta = e.beta ?? 0;
      const gamma = e.gamma ?? 0;
      if (base.current.beta === undefined) {
        base.current.beta = beta;
        base.current.gamma = gamma;
      }
      const dx = (beta - (base.current.beta ?? 0)) / 22;
      const dy = (gamma - (base.current.gamma ?? 0)) / 22;
      target.current.x = Math.max(-1, Math.min(1, dx));
      target.current.y = Math.max(-1, Math.min(1, dy));
    };

    window.addEventListener("deviceorientation", onOrient, { passive: true });
    let frame = 0;
    const tick = () => {
      tilt.current.x += (target.current.x - tilt.current.x) * 0.1;
      tilt.current.y += (target.current.y - tilt.current.y) * 0.1;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("deviceorientation", onOrient);
      cancelAnimationFrame(frame);
    };
  }, [active]);

  return tilt;
}

/** iOS 13+ needs a user gesture before gyro events fire. */
export function useGyroPermissionPrompt() {
  useEffect(() => {
    type DOE = {
      requestPermission?: () => Promise<PermissionState>;
    };
    const DOE = DeviceOrientationEvent as unknown as DOE;
    if (typeof DOE.requestPermission !== "function") return;

    const ask = () => {
      DOE.requestPermission?.().catch(() => {});
      window.removeEventListener("pointerdown", ask);
    };
    window.addEventListener("pointerdown", ask, { once: true, passive: true });
    return () => window.removeEventListener("pointerdown", ask);
  }, []);
}
