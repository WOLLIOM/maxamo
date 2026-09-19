"use client";

import { useEffect, useRef, useState } from "react";

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
      // /16 (was /22) — higher sensitivity so a small phone tilt drives the
      // effect more, matching the 3D scene + ambient orbs.
      const dx = (beta - (base.current.beta ?? 0)) / 16;
      const dy = (gamma - (base.current.gamma ?? 0)) / 16;
      target.current.x = Math.max(-1, Math.min(1, dx));
      target.current.y = Math.max(-1, Math.min(1, dy));
    };

    // Same iOS quirk fixed in SimaxScene: a `deviceorientation` listener
    // registered BEFORE requestPermission() resolves "granted" often never
    // starts firing, even after the grant. Attach now (covers Android +
    // already-granted iOS) AND re-attach whenever the permission button
    // broadcasts a fresh grant, resetting the base pose each time.
    function attach() {
      window.removeEventListener("deviceorientation", onOrient);
      base.current = {};
      window.addEventListener("deviceorientation", onOrient, { passive: true });
    }
    attach();
    window.addEventListener("simax-gyro-granted", attach);

    let frame = 0;
    const tick = () => {
      tilt.current.x += (target.current.x - tilt.current.x) * 0.1;
      tilt.current.y += (target.current.y - tilt.current.y) * 0.1;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("deviceorientation", onOrient);
      window.removeEventListener("simax-gyro-granted", attach);
      cancelAnimationFrame(frame);
    };
  }, [active]);

  return tilt;
}

type DOE = { requestPermission?: () => Promise<PermissionState> };

/** True on iOS 13+ Safari, where DeviceOrientationEvent needs an explicit
 *  requestPermission() call from inside a real click handler before any
 *  'deviceorientation' events fire. False everywhere else (Android, desktop). */
export function needsGyroPermission() {
  if (typeof DeviceOrientationEvent === "undefined") return false;
  return typeof (DeviceOrientationEvent as unknown as DOE).requestPermission === "function";
}

/** iOS 13+ needs a user gesture before gyro events fire. This still listens
 *  for ANY tap on the page as a best-effort background trigger, but a
 *  window-level listener isn't a guaranteed-reliable "real" gesture on every
 *  iOS/Safari version — pair this with the visible button from
 *  useGyroPermissionButton() below for a deterministic prompt. */
export function useGyroPermissionPrompt() {
  useEffect(() => {
    if (!needsGyroPermission()) return;
    const DOE = DeviceOrientationEvent as unknown as DOE;

    let granted = false;
    const ask = () => {
      if (granted) return;
      DOE.requestPermission?.()
        .then((state) => {
          if (state === "granted") {
            granted = true;
            window.removeEventListener("pointerdown", ask);
            window.removeEventListener("touchstart", ask);
          }
        })
        .catch(() => {});
    };
    window.addEventListener("pointerdown", ask, { passive: true });
    window.addEventListener("touchstart", ask, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", ask);
      window.removeEventListener("touchstart", ask);
    };
  }, []);
}

/** Explicit, visible-button version for iOS: returns { needsPrompt, granted,
 *  request } so the UI can render a real tappable element. A direct onClick
 *  on an actual button is the most reliable way to satisfy Safari's "real
 *  user gesture" requirement — more reliable than a generic window listener. */
export function useGyroPermissionButton() {
  const [needsPrompt, setNeedsPrompt] = useState(false);
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    setNeedsPrompt(needsGyroPermission());
  }, []);

  const request = () => {
    const DOE = DeviceOrientationEvent as unknown as DOE;
    DOE.requestPermission?.()
      .then((state) => {
        if (state === "granted") {
          setGranted(true);
          setNeedsPrompt(false);
          // iOS quirk: a `deviceorientation` listener added BEFORE the grant
          // often never starts firing. Broadcast so any listeners (e.g. the
          // 3D scene) can (re)attach their handler now that events will flow.
          window.dispatchEvent(new Event("simax-gyro-granted"));
        }
      })
      .catch(() => {});
  };

  return { needsPrompt: needsPrompt && !granted, granted, request };
}
