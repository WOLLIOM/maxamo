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
export function RealGuitar({ scale = 3.4 }: { scale?: number }) {
  const { scene } = useGLTF("/models/taylor-guitar.glb");
  const cloned = useMemo(() => scene.clone(true), [scene]);
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
  const cloned = useMemo(() => scene.clone(true), [scene]);
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

/** Thin vinyl-style disc with grooves — nods to music production / FL Studio. */
export function VinylDisc({ lite = false }: { lite?: boolean }) {
  const grooves = useMemo(
    () => (lite ? [] : Array.from({ length: 8 }).map((_, i) => 0.68 - i * 0.06)),
    [lite],
  );
  return (
    <group data-cursor="pick">
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.72, 0.72, 0.04, 48]} />
        <meshPhysicalMaterial color={INK} roughness={0.35} clearcoat={0.6} />
      </mesh>
      <mesh position={[0, 0.021, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.001, 32]} />
        <meshPhysicalMaterial color={CHERRY_RED} roughness={0.3} clearcoat={0.6} />
      </mesh>
      {grooves.map((r, i) => (
        <mesh key={i} position={[0, 0.021, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[r, r + 0.008, 48]} />
          <meshBasicMaterial color="#2a2830" side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

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
        <meshPhysicalMaterial color={SILVER} roughness={0.5} clearcoat={0.15} transparent opacity={0.85} />
      </RoundedBox>
      {!lite && (
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(0.92, 1.22, 0.92)]} />
          <lineBasicMaterial color={GOLD} />
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
