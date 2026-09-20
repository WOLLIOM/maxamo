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
function Box({ q, tilt }: Refs) {
  const g = useRef<THREE.Group>(null);
  const spin = useRef(0.6);
  useFrame((_, delta) => {
    if (!g.current) return;
    spin.current += delta * 0.55;
    const t = tilt.current;
    g.current.rotation.y = spin.current + t.y * 1.1 + q.current * 2.4;
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
 * upper-right where it used to live in the hero scene. As the visitor scrolls,
 * it travels down and docks in the bottom-right corner and STAYS there while
 * the rest of the hero scrolls away, still reacting to the phone's gyro.
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

    let raf = 0;
    const tick = () => {
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
        const sway = reduce ? 0 : tilt.current.y * 14 * (0.4 + q.current); // gyro nudges it sideways
        const cx = sx + (ex - sx) * e + sway;
        const cy = sy + (ey - sy) * e;
        el.style.transform = `translate3d(${cx - SIZE / 2}px, ${cy - SIZE / 2}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
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
        <Box q={q} tilt={tilt} />
      </Canvas>
    </div>
  );
}
