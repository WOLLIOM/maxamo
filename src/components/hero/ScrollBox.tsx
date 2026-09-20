"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useDeviceTiltRef } from "@/lib/useDeviceTilt";
import { isTouchDevice } from "@/lib/device";

const SIZE = 150; // px, square canvas

type Refs = {
  q: React.MutableRefObject<number>; // 0 = in the hero, 1 = docked
  tilt: React.MutableRefObject<{ x: number; y: number }>;
  roll: React.MutableRefObject<number>; // accumulated roll from sliding (radians)
};

/** Glassy wireframe cube (matches the reference image): translucent faces, gold outer
 *  edges, violet inner cube and connectors. Same proportions as the desktop ArchBlock. */
function GlassCube() {
  const { outer, inner, links } = useMemo(() => {
    const W = 0.9, H = 1.2, D = 0.9;
    const outer = new THREE.EdgesGeometry(new THREE.BoxGeometry(W, H, D));
    const inner = new THREE.EdgesGeometry(new THREE.BoxGeometry(W * 0.5, H * 0.5, D * 0.5));
    const pts: THREE.Vector3[] = [];
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
      pts.push(
        new THREE.Vector3((sx * W) / 2, (sy * H) / 2, (sz * D) / 2),
        new THREE.Vector3((sx * W) / 4, (sy * H) / 4, (sz * D) / 4),
      );
    }
    return { outer, inner, links: new THREE.BufferGeometry().setFromPoints(pts) };
  }, []);
  return (
    <>
      <mesh>
        <boxGeometry args={[0.9, 1.2, 0.9]} />
        <meshPhysicalMaterial color="#b9a8ff" transparent opacity={0.13} roughness={0.15} metalness={0.3} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <lineSegments geometry={outer}><lineBasicMaterial color="#f2c66d" /></lineSegments>
      <lineSegments geometry={inner}><lineBasicMaterial color="#b9a8ff" /></lineSegments>
      <lineSegments geometry={links}><lineBasicMaterial color="#8f7bff" transparent opacity={0.7} /></lineSegments>
    </>
  );
}

/** The glass box (same model as the hero scene / desktop). It spins
 *  slowly, rolls with the phone's tilt, and tumbles a bit as it travels. */
function Box({ q, tilt, roll }: Refs) {
  const g = useRef<THREE.Group>(null);
  const spin = useRef(0.6);
  useFrame((_, delta) => {
    if (!g.current) return;
    spin.current += delta * 0.55;
    const t = tilt.current;
    g.current.rotation.y = spin.current * (1 - q.current * 0.85) + t.y * 1.1 + q.current * 2.4 + roll.current;
    g.current.rotation.x = -0.32 + t.x * 0.7 + Math.sin(q.current * Math.PI) * 0.5;
    g.current.rotation.z = t.y * -0.25;
    // grows slightly smaller once docked so it doesn't dominate the corner
    const s = 1.02 - q.current * 0.28;
    g.current.scale.setScalar(s);
  });
  return (
    <group ref={g}>
      <GlassCube />
    </group>
  );
}

/**
 * The 3D box that "comes out" of the hero. At the top of the page it sits
 * upper-left. As the visitor scrolls it travels down and docks at the bottom of
 * the screen, then behaves like a real object under gravity:
 *   - it rests on the bottom edge (the "floor")
 *   - tilting the phone slides/rolls it toward the low side; it bounces off the
 *     screen edges and can be tipped into either corner
 *   - shaking the phone makes it jump, then fall back with gravity
 * Shake needs `devicemotion` (iOS asks permission alongside the tilt button).
 *
 * Touch-only, pointer-events:none (never blocks taps), static spin under
 * reduced-motion. This replaces the flat CSS cube + Pac-Man (which read 2D).
 */
export function ScrollBox() {
  const [enabled, setEnabled] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const q = useRef(0); // eased scroll progress 0..1
  const target = useRef(0);
  const tilt = useDeviceTiltRef(enabled);
  const roll = useRef(0);
  const jump = useRef(0); // pending shake impulse (px/frame)

  useEffect(() => {
    if (!isTouchDevice()) return;
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const onScroll = () => {
      target.current = Math.min(1, window.scrollY / (window.innerHeight * 0.85));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // ---- shake-to-jump: strong device acceleration -> upward impulse -------
    let lastShake = 0;
    const onMotion = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity;
      if (!a) return;
      // magnitude minus 1g: resting/tilting stays ~0, a real shake spikes it
      const excess = Math.abs(Math.hypot(a.x ?? 0, a.y ?? 0, a.z ?? 0) - 9.81);
      const now = performance.now();
      if (excess > 11 && now - lastShake > 450) {
        lastShake = now;
        jump.current = Math.min(30, 12 + excess * 0.8);
      }
    };
    const attachMotion = () => {
      window.removeEventListener("devicemotion", onMotion);
      if (!reduce) window.addEventListener("devicemotion", onMotion, { passive: true });
    };
    attachMotion();
    // iOS: a listener added before the permission grant never fires -> re-attach on grant
    window.addEventListener("simax-gyro-granted", attachMotion);

    // ---- physics: once docked, the box lives on the bottom edge like a floor --
    const phys = { on: false, x: 0, y: 0, vx: 0, vy: 0 };
    let last = performance.now();
    let raf = 0;
    const tick = () => {
      const nowT = performance.now();
      const dt = Math.min((nowT - last) / 16.7, 2.5); // frame-rate independent
      last = nowT;
      // ease toward the scroll target so the box glides instead of snapping
      q.current += (target.current - q.current) * (reduce ? 1 : 0.12);
      const el = wrap.current;
      if (el) {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const e = q.current * q.current * (3 - 2 * q.current); // smoothstep
        // centre of the box: hero spot (upper-left) → docked corner (bottom-right)
        const sx = vw * 0.22, sy = vh * 0.25;
        const ex = vw - SIZE * 0.36, ey = vh - SIZE * 0.42 - 8;
        let cx: number, cy: number;

        if (q.current > 0.96 && !reduce) {
          // -------- docked: gravity + tilt + shake --------
          if (!phys.on) { phys.on = true; phys.x = ex; phys.y = 0; phys.vx = 0; phys.vy = 0; }
          // tilt is an acceleration (gravity pulling toward the low side of the phone)
          const ax = Math.max(-1, Math.min(1, tilt.current.y)) * 0.9;
          phys.vx += ax * dt;
          phys.vx *= Math.pow(0.985, dt); // rolling friction
          phys.x += phys.vx * dt;
          const minX = SIZE * 0.36, maxX = vw - SIZE * 0.36;
          if (phys.x < minX) { phys.x = minX; phys.vx *= -0.45; }
          if (phys.x > maxX) { phys.x = maxX; phys.vx *= -0.45; }
          // shake → jump (only when standing on the floor or nearly)
          if (jump.current > 0) {
            if (phys.y > -4) phys.vy = -jump.current;
            jump.current = 0;
          }
          phys.vy += 0.9 * dt; // gravity (px/frame²), y grows downward
          phys.y += phys.vy * dt;
          if (phys.y > 0) {
            phys.y = 0;
            phys.vy = Math.abs(phys.vy) > 3 ? -phys.vy * 0.42 : 0; // bounce, then settle
          }
          roll.current += phys.vx * 0.06 * dt; // roll as it slides
          cx = phys.x;
          cy = ey + phys.y;
        } else {
          // -------- in the hero / travelling: scripted path --------
          phys.on = false;
          const sway = reduce ? 0 : tilt.current.y * 14 * (0.4 + q.current); // gyro nudges it sideways
          cx = sx + (ex - sx) * e + sway;
          cy = sy + (ey - sy) * e;
        }
        el.style.transform = `translate3d(${cx - SIZE / 2}px, ${cy - SIZE / 2}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("devicemotion", onMotion);
      window.removeEventListener("simax-gyro-granted", attachMotion);
    };
  }, [enabled, tilt]);

  if (!enabled) return null;

  return (
    <div
      ref={wrap}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-30 md:hidden"
      style={{ width: SIZE, height: SIZE, willChange: "transform" }}
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 4.3], fov: 38 }}
        gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
        style={{ background: "transparent" }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <ambientLight intensity={0.9} />
        <hemisphereLight args={["#ffe9c8", "#2a1d3a", 0.8]} />
        <directionalLight position={[3, 4, 5]} intensity={2.2} color="#fff1dc" />
        <directionalLight position={[-3, -1, 2]} intensity={0.8} color="#a99bff" />
        <Box q={q} tilt={tilt} roll={roll} />
      </Canvas>
    </div>
  );
}
