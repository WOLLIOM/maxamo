"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useDeviceTiltRef } from "@/lib/useDeviceTilt";

/**
 * A small, procedural 3D pizza (no model files — a few primitives, so it is a couple of KB
 * and cheap on phones). Eight wedge slices; tap/click pulls the next slice out of the pie,
 * and when the last one is gone a fresh pizza appears. The pie leans toward the pointer and
 * toward the phone's tilt, and only renders while it is on screen.
 */

const SLICES = 8;
const STEP = (Math.PI * 2) / SLICES;
const GAP = 0.02;

// deterministic pseudo-random so the toppings are identical on every load
function rng(seed: number) {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

type Topping = { kind: "pep" | "basil"; r: number; a: number; rot: number };

function makeToppings(i: number): Topping[] {
  const rand = rng(i + 3);
  const out: Topping[] = [];
  const a0 = i * STEP;
  const pick = () => a0 + GAP + rand() * (STEP - GAP * 2);
  out.push({ kind: "pep", r: 0.42 + rand() * 0.2, a: a0 + STEP * 0.5 + (rand() - 0.5) * 0.15, rot: rand() * 6 });
  out.push({ kind: "pep", r: 0.86 + rand() * 0.18, a: pick(), rot: rand() * 6 });
  if (i % 2 === 0) out.push({ kind: "basil", r: 0.65 + rand() * 0.3, a: pick(), rot: rand() * 6 });
  return out;
}

const CRUST = "#d9a35b";
const SAUCE = "#b8291b";
const CHEESE = "#f6dc93";
const PEP = "#a5271b";
const PEP_DARK = "#6e1a12";
const BASIL = "#2f7a2c";

function Slice({ index, taken, resetKey }: { index: number; taken: React.MutableRefObject<boolean[]>; resetKey: React.MutableRefObject<number> }) {
  const g = useRef<THREE.Group>(null);
  const p = useRef(0); // 0 = in the pie, 1 = pulled away
  const toppings = useMemo(() => makeToppings(index), [index]);
  const start = index * STEP + GAP / 2;
  const len = STEP - GAP;
  const mid = index * STEP + STEP / 2;
  const dx = Math.sin(mid);
  const dz = Math.cos(mid);

  useFrame((_, delta) => {
    const el = g.current;
    if (!el) return;
    const goal = taken.current[index] ? 1 : 0;
    p.current += (goal - p.current) * Math.min(1, delta * 5);
    const t = p.current;
    // pull out along its own direction, rise, tip, then shrink away
    el.position.set(dx * t * 1.1, t * 1.4, dz * t * 1.1);
    el.rotation.set(dz * t * 0.5, 0, -dx * t * 0.5);
    el.scale.setScalar(Math.max(0.001, 1 - Math.max(0, t - 0.75) * 4));
    el.visible = t < 0.99 || !taken.current[index];
    void resetKey.current;
  });

  return (
    <group ref={g}>
      <mesh position={[0, 0.14, 0]}>
        <cylinderGeometry args={[1.42, 1.42, 0.3, 40, 1, false, start, len]} />
        <meshStandardMaterial color={CRUST} roughness={0.85} flatShading />
      </mesh>
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[1.22, 1.22, 0.24, 40, 1, false, start, len]} />
        <meshStandardMaterial color={SAUCE} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.17, 0]}>
        <cylinderGeometry args={[1.16, 1.16, 0.25, 40, 1, false, start, len]} />
        <meshStandardMaterial color={CHEESE} roughness={0.55} />
      </mesh>
      {toppings.map((t, k) => {
        const x = Math.sin(t.a) * t.r;
        const z = Math.cos(t.a) * t.r;
        return t.kind === "pep" ? (
          <group key={k} position={[x, 0.3, z]}>
            <mesh>
              <cylinderGeometry args={[0.2, 0.2, 0.04, 20]} />
              <meshStandardMaterial color={PEP} roughness={0.6} />
            </mesh>
            <mesh position={[0, 0.021, 0]}>
              <cylinderGeometry args={[0.13, 0.13, 0.02, 16]} />
              <meshStandardMaterial color={PEP_DARK} roughness={0.7} />
            </mesh>
          </group>
        ) : (
          <mesh key={k} position={[x, 0.31, z]} rotation={[0, t.rot, 0]} scale={[1, 0.25, 0.6]}>
            <sphereGeometry args={[0.18, 10, 8]} />
            <meshStandardMaterial color={BASIL} roughness={0.6} />
          </mesh>
        );
      })}
    </group>
  );
}

function Pie({ taken, resetKey, pointer }: {
  taken: React.MutableRefObject<boolean[]>;
  resetKey: React.MutableRefObject<number>;
  pointer: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const g = useRef<THREE.Group>(null);
  const spin = useRef(0);
  const tilt = useDeviceTiltRef(true);
  const reduce = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  useFrame((_, delta) => {
    const el = g.current;
    if (!el) return;
    if (!reduce) spin.current += delta * 0.35;
    // lean toward the mouse, and toward the phone's tilt
    const tx = 0.95 + pointer.current.y * 0.3 + tilt.current.x * 0.5;
    const tz = -pointer.current.x * 0.3 + tilt.current.y * -0.5;
    el.rotation.x += (tx - el.rotation.x) * Math.min(1, delta * 4);
    el.rotation.z += (tz - el.rotation.z) * Math.min(1, delta * 4);
    el.rotation.y = spin.current + pointer.current.x * 0.6;
  });

  return (
    <group ref={g} rotation={[0.95, 0, 0]}>
      {Array.from({ length: SLICES }, (_, i) => (
        <Slice key={i} index={i} taken={taken} resetKey={resetKey} />
      ))}
    </group>
  );
}

export function PizzaScene({ visible, onTake }: { visible: boolean; onTake: (left: number) => void }) {
  const taken = useRef<boolean[]>(Array(SLICES).fill(false));
  const resetKey = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });

  const takeNext = () => {
    const i = taken.current.findIndex((v) => !v);
    if (i === -1) return;
    taken.current[i] = true;
    const left = taken.current.filter((v) => !v).length;
    onTake(left);
    if (left === 0) {
      setTimeout(() => {
        taken.current = Array(SLICES).fill(false);
        resetKey.current++;
        onTake(SLICES);
      }, 1100);
    }
  };

  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={visible ? "always" : "never"}
      camera={{ position: [0, 0.4, 5.2], fov: 38 }}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      style={{ touchAction: "pan-y", cursor: "pointer" }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        pointer.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
        pointer.current.y = ((e.clientY - r.top) / r.height) * 2 - 1;
      }}
      onPointerLeave={() => (pointer.current = { x: 0, y: 0 })}
      onClick={takeNext}
    >
      <ambientLight intensity={0.85} />
      <hemisphereLight args={["#fff1dc", "#20202a", 0.7]} />
      <directionalLight position={[3, 5, 4]} intensity={2.1} color="#fff1dc" />
      <directionalLight position={[-4, 1, -2]} intensity={0.6} color="#9fb4ff" />
      <Pie taken={taken} resetKey={resetKey} pointer={pointer} />
    </Canvas>
  );
}
