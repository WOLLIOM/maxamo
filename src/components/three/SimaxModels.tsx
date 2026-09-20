"use client";

import { useMemo, useRef } from "react";
import { RoundedBox, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* Hand-modelled SIMAX icons — no downloads needed. Each one represents a
   discipline (music, architecture, space/games, code) instead of a food item
   piece. Swap in real GLTF models later via the same <Piece> slots in
   SimaxScene.tsx if Simon wants to use his real guitar / building scans. */

const CHERRY_RED = "#a82026";
export const GOLD = "#c4a260";
const SILVER = "#b0b6be";
const INK = "#0f0e10";

/** Simon's real guitar — a scanned/optimized GLB (Draco + WebP textures,
 *  ~1MB, down from a 27MB source export). This is the hero centerpiece;
 *  the hand-built `Guitar()` below is kept as a lightweight fallback for
 *  places that don't want to pay for a GLTF load (e.g. tiny mobile chips). */
export function RealGuitar({
  scale = 3.4,
  recenter = false,
}: {
  scale?: number;
  recenter?: boolean;
}) {
  const { scene } = useGLTF("/models/taylor-guitar.glb");
  // `recenter` shifts the clone so its bounding-box centre sits on the origin,
  // so a parent group rotates it around its true centre instead of swinging it
  // off to one side (used by the mobile hero). Desktop keeps the raw origin.
  const cloned = useMemo(() => {
    const c = scene.clone(true);
    if (recenter) {
      const box = new THREE.Box3().setFromObject(c);
      const center = box.getCenter(new THREE.Vector3());
      c.position.sub(center);
    }
    return c;
  }, [scene, recenter]);
  return (
    // The source scan is lying flat (long axis on X, ~0.76m; thickness on Y,
    // ~0.07m) rather than standing. Rotate 90° on Z to stand it upright, with
    // no extra yaw so it faces the camera straight-on at the origin.
    // If it looks off after a preview, nudge the rotation/scale here.
    <group data-cursor="pick" scale={scale} position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <primitive object={cloned} />
    </group>
  );
}
useGLTF.preload("/models/taylor-guitar.glb");

/** Simon's red Stratocaster — his first guitar. Lighter GLB used further down
 *  the page (Guitar Corner). Rotated 90° on Z so the face/pickups point at
 *  the camera instead of lying flat, and set to slowly auto-spin so it
 *  "plays" itself the moment it's on screen — nobody has to touch it. */
export function RedStrat({
  scale = 3.2,
  autoRotate = true,
}: {
  scale?: number;
  autoRotate?: boolean;
}) {
  const { scene } = useGLTF("/models/red-strat.glb");
  // Clone and recenter: the GLB's own origin isn't at the guitar's centroid,
  // so spinning the raw model makes it orbit off-center. Shift the clone so
  // its bounding-box center sits on (0,0,0) — then the parent group spins
  // around the true center and the model stays framed.
  const cloned = useMemo(() => {
    const c = scene.clone(true);
    const box = new THREE.Box3().setFromObject(c);
    const center = box.getCenter(new THREE.Vector3());
    c.position.sub(center);
    return c;
  }, [scene]);
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (autoRotate && group.current) {
      group.current.rotation.y += delta * 0.35;
    }
  });

  return (
    <group
      ref={group}
      data-cursor="pick"
      scale={scale}
      position={[0, 0, 0]}
      // Front of the body faces the camera: 90° on Z to stand it up, matched
      // to the strat's own flat export axis (same fix as the Taylor above).
      rotation={[0, 0, Math.PI / 2]}
    >
      <primitive object={cloned} />
    </group>
  );
}
useGLTF.preload("/models/red-strat.glb");

/** Red cherry guitar — simplified body + neck + strings, the site's signature object. */
export function Guitar({ glossy = 0.7 }: { glossy?: number }) {
  const bodyShape = useMemo(() => {
    const s = new THREE.Shape();
    // Rough acoustic-guitar silhouette (figure-eight via two lobes).
    s.absarc(0, 0.55, 0.62, 0, Math.PI * 2, false);
    return s;
  }, []);

  return (
    <group data-cursor="pick">
      {/* Lower bout */}
      <mesh position={[0, -0.35, 0]} castShadow>
        <cylinderGeometry args={[0.72, 0.72, 0.16, 32]} />
        <meshPhysicalMaterial color={CHERRY_RED} roughness={0.25} clearcoat={glossy} metalness={0.05} />
      </mesh>
      {/* Upper bout */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.48, 0.48, 0.16, 32]} />
        <meshPhysicalMaterial color={CHERRY_RED} roughness={0.25} clearcoat={glossy} metalness={0.05} />
      </mesh>
      {/* Sound hole */}
      <mesh position={[0, -0.1, 0.09]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.02, 24]} />
        <meshStandardMaterial color={INK} roughness={0.8} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 1.55, 0]} castShadow>
        <boxGeometry args={[0.14, 1.8, 0.1]} />
        <meshPhysicalMaterial color="#241512" roughness={0.4} clearcoat={0.3} />
      </mesh>
      {/* Headstock */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <boxGeometry args={[0.26, 0.32, 0.08]} />
        <meshPhysicalMaterial color={CHERRY_RED} roughness={0.3} clearcoat={glossy} />
      </mesh>
      {/* Strings */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[-0.06 + i * 0.024, 0.9, 0.085]}>
          <cylinderGeometry args={[0.004, 0.004, 2.3, 6]} />
          <meshStandardMaterial color={SILVER} metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

/** Floating music note — a proper crisp eighth-note silhouette (round,
 *  slightly tilted notehead + thin stem + a curved flag), not just a plain
 *  ring-and-box. Scale controls overall size so we can sprinkle several
 *  around the scene at different sizes. */
export function MusicNote({ color = GOLD, scale = 1 }: { color?: string; scale?: number }) {
  return (
    <group data-cursor="pick" scale={scale}>
      {/* Notehead — a squashed, slightly tilted sphere reads far more like a
          real note than a flat torus. */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, -0.35]} scale={[1, 0.78, 0.55]}>
        <sphereGeometry args={[0.19, 24, 24]} />
        <meshPhysicalMaterial color={color} roughness={0.22} metalness={0.5} clearcoat={0.7} />
      </mesh>
      {/* Stem */}
      <mesh position={[0.17, 0.55, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 1.15, 10]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.25} />
      </mesh>
      {/* Flag — a gentle curved ribbon instead of a flat box, so it doesn't
          read as a stray rectangle floating next to the stem. */}
      <mesh position={[0.24, 1.02, 0.02]} rotation={[0, 0, -0.55]}>
        <torusGeometry args={[0.16, 0.045, 10, 16, Math.PI * 0.9]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.25} />
      </mesh>
    </group>
  );
}

// VinylDisc removed — no longer rendered in the scene (mobile + desktop were
// trimmed to guitar + box + polygon + note). Deleted to drop dead code.

/** Small ringed planet — nods to SOLARIS / space & game dev. */
export function Planet({ color = "#5a3a86", ring = GOLD }: { color?: string; ring?: string }) {
  const rRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (rRef.current) rRef.current.rotation.z += delta * 0.15;
  });
  return (
    <group data-cursor="pick">
      <mesh castShadow>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshPhysicalMaterial color={color} roughness={0.55} clearcoat={0.2} />
      </mesh>
      <mesh ref={rRef} rotation={[Math.PI / 2.4, 0, 0]}>
        <ringGeometry args={[0.78, 1.05, 48]} />
        <meshBasicMaterial color={ring} side={THREE.DoubleSide} transparent opacity={0.55} />
      </mesh>
    </group>
  );
}

/** Small architectural massing block with a wireframe overlay — nods to Revit / arch-viz. */
export function ArchBlock({ lite = false }: { lite?: boolean }) {
  return (
    <group data-cursor="pick">
      <RoundedBox args={[0.9, 1.2, 0.9]} radius={0.02} smoothness={lite ? 2 : 4} castShadow>
        <meshPhysicalMaterial
          color={SILVER}
          roughness={0.4}
          clearcoat={0.25}
          clearcoatRoughness={0.1}
          transparent
          opacity={0.9}
          envMapIntensity={1.2}
        />
      </RoundedBox>
      {!lite && (
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(0.92, 1.22, 0.92)]} />
          <lineBasicMaterial color={GOLD} linewidth={2} />
        </lineSegments>
      )}
    </group>
  );
}

/** Wireframe icosahedron — nods to code / web dev / Three.js. */
export function CodeShape({ lite = false }: { lite?: boolean }) {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (mesh.current) {
      mesh.current.rotation.x += delta * 0.12;
      mesh.current.rotation.y += delta * 0.18;
    }
  });
  return (
    <mesh ref={mesh} data-cursor="pick">
      <icosahedronGeometry args={[0.6, lite ? 0 : 2]} />
      <meshBasicMaterial color={CHERRY_RED} wireframe />
    </mesh>
  );
}

/** The real textured Saturn GLB (optimized 9.3 MB -> 121 KB with WebP textures +
 *  meshopt). Phone hero only, and intentionally NOT preloaded at module scope,
 *  so desktop never downloads it. */
export function SaturnModel({ scale = 1 }: { scale?: number }) {
  const { scene } = useGLTF("/models/saturn.glb");
  const cloned = useMemo(() => scene.clone(true), [scene]);
  return (
    <group data-cursor="pick" scale={scale}>
      <primitive object={cloned} />
    </group>
  );
}

/** Music note GLB model — loaded from disk instead of procedural. */
export function NotaGLB({ scale = 1 }: { scale?: number }) {
  const { scene } = useGLTF("/models/music-note.glb");
  const cloned = useMemo(() => scene.clone(true), [scene]);
  return (
    <group data-cursor="pick" scale={scale}>
      <primitive object={cloned} />
    </group>
  );
}
useGLTF.preload("/models/music-note.glb");

/** Dark faceted asteroid — seeded vertex jitter on a low-poly icosahedron so every
 *  rock is a different lumpy shape. Cheap (a few dozen triangles), slow tumble. */
export function Rock({ seed = 1, radius = 0.2 }: { seed?: number; radius?: number }) {
  const geo = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(radius, 1);
    const p = g.attributes.position;
    let s = seed * 9301 + 49297;
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    // jitter by unique position so shared vertices move together (no cracks)
    const seen = new Map<string, number>();
    for (let i = 0; i < p.count; i++) {
      const key = `${p.getX(i).toFixed(3)},${p.getY(i).toFixed(3)},${p.getZ(i).toFixed(3)}`;
      let k = seen.get(key);
      if (k === undefined) {
        k = 0.72 + rnd() * 0.56;
        seen.set(key, k);
      }
      p.setXYZ(i, p.getX(i) * k, p.getY(i) * k * 0.9, p.getZ(i) * k);
    }
    g.computeVertexNormals();
    return g;
  }, [seed, radius]);
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, d) => {
    if (!ref.current) return;
    ref.current.rotation.x += d * 0.12 * (1 + (seed % 3));
    ref.current.rotation.y += d * 0.09 * (1 + (seed % 2));
  });
  return (
    <mesh ref={ref} geometry={geo}>
      <meshStandardMaterial
        color="#2b2238"
        roughness={0.85}
        metalness={0.15}
        flatShading
        emissive="#4a2a8a"
        emissiveIntensity={0.22}
      />
    </mesh>
  );
}

/** A tilted ring of golden sparkles slowly orbiting — the "stardust ring" around the hero. */
export function OrbitSparkles({
  count = 140,
  rx = 2.3,
  rz = 1.0,
  tilt = [1.15, 0.25, -0.5] as [number, number, number],
  color = "#f2c66d",
  size = 0.075,
}: {
  count?: number;
  rx?: number;
  rz?: number;
  tilt?: [number, number, number];
  color?: string;
  size?: number;
}) {
  const g = useRef<THREE.Group>(null);
  const { positions, tex } = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + Math.random() * 0.2;
      const spread = 0.7 + Math.random() * 0.6; // thickness of the band
      arr[i * 3] = Math.cos(a) * rx * spread;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 0.18;
      arr[i * 3 + 2] = Math.sin(a) * rz * spread;
    }
    const c = document.createElement("canvas");
    c.width = c.height = 32;
    const x = c.getContext("2d")!;
    const gr = x.createRadialGradient(16, 16, 0, 16, 16, 16);
    gr.addColorStop(0, "rgba(255,255,255,1)");
    gr.addColorStop(0.4, "rgba(255,255,255,0.5)");
    gr.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = gr;
    x.fillRect(0, 0, 32, 32);
    return { positions: arr, tex: new THREE.CanvasTexture(c) };
  }, [count, rx, rz]);
  useFrame((_, d) => {
    if (g.current) g.current.rotation.y += d * 0.06;
  });
  return (
    <group rotation={tilt}>
      <group ref={g}>
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          </bufferGeometry>
          <pointsMaterial
            color={color}
            size={size}
            map={tex}
            alphaTest={0.01}
            transparent
            opacity={0.9}
            depthWrite={false}
            sizeAttenuation
            blending={THREE.AdditiveBlending}
          />
        </points>
      </group>
    </group>
  );
}

/** A faint elliptical orbit line (the thin rings drawn around the scene). */
export function OrbitLine({
  rx = 2.0,
  rz = 1.2,
  tilt = [1.2, 0, 0] as [number, number, number],
  color = "#9b7bff",
  opacity = 0.35,
}: {
  rx?: number;
  rz?: number;
  tilt?: [number, number, number];
  color?: string;
  opacity?: number;
}) {
  const geo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * rx, 0, Math.sin(a) * rz));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [rx, rz]);
  // <line> in JSX means the SVG element, so build a real THREE.Line and mount it
  // with <primitive> (types + behaviour are then unambiguous).
  const obj = useMemo(
    () =>
      new THREE.Line(
        geo,
        new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false }),
      ),
    [geo, color, opacity],
  );
  return (
    <group rotation={tilt}>
      <primitive object={obj} />
    </group>
  );
}
