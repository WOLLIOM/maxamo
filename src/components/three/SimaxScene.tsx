"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Float,
  Lightformer,
  ContactShadows,
} from "@react-three/drei";
import * as THREE from "three";
import {
  Guitar,
  RealGuitar,
  MusicNote,
  VinylDisc,
  Planet,
  ArchBlock,
  CodeShape,
  GOLD,
} from "./SimaxModels";

type Look = { x: number; y: number };

export type ScrollProgressRef = React.MutableRefObject<number>;

/**
 * Camera dollies through the object arrangement as the page scrolls —
 * same idea as the Horizon demo, but warm / restaurant, not cosmos.
 * Scroll up reverses it smoothly via the shared progress ref.
 */
function ScrollCamera({
  progressRef,
  lite,
}: {
  progressRef: ScrollProgressRef;
  lite: boolean;
}) {
  const { camera } = useThree();
  const smooth = useRef(0);
  const look = useRef(new THREE.Vector3(0, 0, 0));

  // Keyframes: start wide → glide in → intimate close-up
  const keys = lite
    ? [
        { p: 0, pos: [0, 0.25, 8.4] as const, look: [0, 0, 0] as const },
        { p: 1, pos: [0.4, 0.55, 5.2] as const, look: [0, 0.1, 0] as const },
      ]
    : [
        { p: 0, pos: [0, 0.2, 8.4] as const, look: [0, 0, 0] as const },
        { p: 0.45, pos: [1.1, 0.55, 5.8] as const, look: [0.1, 0.1, -0.2] as const },
        { p: 1, pos: [-0.6, 0.9, 3.6] as const, look: [0, 0.15, 0] as const },
      ];

  useFrame((_, delta) => {
    const target = progressRef.current;
    smooth.current = THREE.MathUtils.damp(smooth.current, target, 3.2, delta);
    const t = smooth.current;

    // Find surrounding keyframes and lerp
    let a = keys[0];
    let b = keys[keys.length - 1];
    for (let i = 0; i < keys.length - 1; i++) {
      if (t >= keys[i].p && t <= keys[i + 1].p) {
        a = keys[i];
        b = keys[i + 1];
        break;
      }
    }
    const span = Math.max(0.0001, b.p - a.p);
    const u = THREE.MathUtils.clamp((t - a.p) / span, 0, 1);
    const e = u * u * (3 - 2 * u); // smoothstep

    camera.position.x = THREE.MathUtils.lerp(a.pos[0], b.pos[0], e);
    camera.position.y = THREE.MathUtils.lerp(a.pos[1], b.pos[1], e);
    camera.position.z = THREE.MathUtils.lerp(a.pos[2], b.pos[2], e);

    look.current.set(
      THREE.MathUtils.lerp(a.look[0], b.look[0], e),
      THREE.MathUtils.lerp(a.look[1], b.look[1], e),
      THREE.MathUtils.lerp(a.look[2], b.look[2], e),
    );
    camera.lookAt(look.current);
  });

  return null;
}

/**
 * Deep-red / gold floating dust motes + soft mist sheets for depth —
 * SIMAX cinematic studio atmosphere, halfway between a stage and a starfield.
 */
function Atmosphere({
  progressRef,
  lite,
}: {
  progressRef: ScrollProgressRef;
  lite: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const mist = useRef<THREE.Mesh>(null);
  const mistMat = useRef<THREE.MeshBasicMaterial>(null);

  const positions = useMemo(() => {
    const count = lite ? 80 : 220;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 14;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 12 - 2;
    }
    return arr;
  }, [lite]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const p = progressRef.current;
    if (group.current) {
      group.current.position.z = THREE.MathUtils.damp(
        group.current.position.z,
        p * 2.4,
        2.5,
        delta,
      );
      group.current.rotation.y = t * 0.02;
    }
    if (mist.current) {
      mist.current.position.z = -4 - p * 3;
    }
    if (mistMat.current) {
      mistMat.current.opacity = 0.08 + p * 0.1;
    }
  });

  return (
    <group ref={group}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#c4a260"
          size={lite ? 0.04 : 0.055}
          sizeAttenuation
          transparent
          opacity={0.55}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <mesh ref={mist} position={[0, 0, -4]}>
        <planeGeometry args={[22, 14]} />
        <meshBasicMaterial
          ref={mistMat}
          color="#7a2a2e"
          transparent
          opacity={0.1}
          depthWrite={false}
        />
      </mesh>
      {!lite && (
        <>
          <mesh position={[-5, -1.5, -6]} rotation={[0.1, 0.3, 0]}>
            <planeGeometry args={[10, 8]} />
            <meshBasicMaterial
              color="#a82026"
              transparent
              opacity={0.05}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[5, 1, -7]} rotation={[-0.1, -0.25, 0]}>
            <planeGeometry args={[9, 7]} />
            <meshBasicMaterial
              color="#b0b6be"
              transparent
              opacity={0.04}
              depthWrite={false}
            />
          </mesh>
        </>
      )}
    </group>
  );
}

/**
 * Scroll-driven depth only — the cluster no longer tilts as a whole
 * toward the cursor. Each object now reacts individually on hover
 * instead (see Piece below), which reads as a much more "3D" feel
 * than the whole group swinging together.
 */
function ParallaxRig({
  gyro,
  progressRef,
  children,
}: {
  gyro: React.MutableRefObject<Look>;
  progressRef: ScrollProgressRef;
  children: React.ReactNode;
}) {
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!group.current) return;
    const p = progressRef.current;
    const damp = 1 - p * 0.35;
    // Only device-tilt (mobile/tablet gyro) nudges the whole cluster now —
    // desktop cursor movement no longer rotates it.
    const targetX = gyro.current.x * 0.35 * damp;
    const targetY = gyro.current.y * 0.4 * damp;
    group.current.rotation.x = THREE.MathUtils.damp(
      group.current.rotation.x,
      THREE.MathUtils.clamp(targetX, -0.35, 0.35),
      4,
      delta,
    );
    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      THREE.MathUtils.clamp(targetY, -0.55, 0.55),
      4,
      delta,
    );
    // Parallax depth: whole cluster drifts toward camera a little on scroll.
    group.current.position.z = THREE.MathUtils.damp(
      group.current.position.z,
      p * 1.2,
      2.8,
      delta,
    );
  });
  return <group ref={group}>{children}</group>;
}

function Piece({
  position,
  rotation = [0, 0, 0],
  speed = 1,
  scale = 1,
  float = true,
  depth = 1,
  progressRef,
  children,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  speed?: number;
  scale?: number;
  float?: boolean;
  depth?: number;
  progressRef?: ScrollProgressRef;
  children: React.ReactNode;
}) {
  const offset = useRef<THREE.Group>(null);
  const hoverGroup = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (!offset.current || !progressRef) return;
    const p = progressRef.current;
    offset.current.position.z = THREE.MathUtils.damp(
      offset.current.position.z,
      p * depth * 1.8,
      3,
      delta,
    );

    // Only the hovered piece perks up — a small lift + scale bump reads
    // as genuinely 3D without the whole cluster swinging together.
    if (hoverGroup.current) {
      const targetScale = hovered ? 1.12 : 1;
      const s = THREE.MathUtils.damp(hoverGroup.current.scale.x, targetScale, 6, delta);
      hoverGroup.current.scale.setScalar(s);
      hoverGroup.current.position.y = THREE.MathUtils.damp(
        hoverGroup.current.position.y,
        hovered ? 0.12 : 0,
        6,
        delta,
      );
    }
  });

  const body = (
    <group
      ref={hoverGroup}
      position={position}
      rotation={rotation}
      scale={scale}
      data-cursor="food"
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
      }}
    >
      {children}
    </group>
  );

  return (
    <group ref={offset}>
      {float ? (
        <Float speed={speed} rotationIntensity={0.35} floatIntensity={0.55}>
          {body}
        </Float>
      ) : (
        body
      )}
    </group>
  );
}

function Scene({
  lite,
  progressRef,
}: {
  lite: boolean;
  progressRef: ScrollProgressRef;
}) {
  const gyro = useRef<Look>({ x: 0, y: 0 });

  useEffect(() => {
    let baseBeta: number | null = null;
    let baseGamma: number | null = null;

    function onOrient(e: DeviceOrientationEvent) {
      const beta = e.beta ?? 0;
      const gamma = e.gamma ?? 0;
      if (baseBeta === null) {
        baseBeta = beta;
        baseGamma = gamma;
      }
      gyro.current.x = THREE.MathUtils.clamp((beta - (baseBeta ?? 0)) / 28, -1, 1);
      gyro.current.y = THREE.MathUtils.clamp((gamma - (baseGamma ?? 0)) / 28, -1, 1);
    }

    window.addEventListener("deviceorientation", onOrient, { passive: true });
    return () => window.removeEventListener("deviceorientation", onOrient);
  }, []);

  return (
    <>
      <ScrollCamera progressRef={progressRef} lite={lite} />
      <Atmosphere progressRef={progressRef} lite={lite} />

      <ambientLight intensity={lite ? 0.7 : 0.45} />
      <hemisphereLight args={["#3a2430", "#1a1418", lite ? 0.5 : 0.3]} />
      <directionalLight
        position={[4, 8, 5]}
        intensity={lite ? 1.6 : 2.1}
        castShadow={!lite}
        shadow-mapSize={lite ? [512, 512] : [1024, 1024]}
        color="#f0d8c4"
      />
      {!lite && (
        <>
          <directionalLight position={[-6, 3, -4]} intensity={0.6} color="#a82026" />
          <spotLight
            position={[0, 6, 2]}
            angle={0.55}
            penumbra={0.7}
            intensity={1.4}
            color="#c4a260"
          />
        </>
      )}

      <ParallaxRig gyro={gyro} progressRef={progressRef}>
        {/* Guitar -- the centerpiece, the red-cherry signature object. */}
        <Piece
          position={[0, 0, 0]}
          rotation={[Math.PI / 2.5, 2, Math.PI / -2]}
          speed={0.7}
          scale={1}
          float={!lite}
          depth={0.6}
          progressRef={progressRef}
        >
          <RealGuitar scale={4.4} />
        </Piece>

        {/* Vinyl / music production */}
        <Piece
          position={[-2.35, 0.55, 0.1]}
          rotation={[0.1, 0.45, -0.05]}
          speed={1.1}
          float={!lite}
          depth={2.1}
          progressRef={progressRef}
        >
          <VinylDisc lite={lite} />
        </Piece>

        {/* SOLARIS / space and game dev */}
        <Piece
          position={[2.25, 0.35, -0.35]}
          rotation={[0.08, -0.55, 0.08]}
          speed={1.2}
          float={!lite}
          depth={1.4}
          progressRef={progressRef}
        >
          <Planet />
        </Piece>

        {/* Architecture / Revit */}
        <Piece
          position={[-1.15, -1.35, -0.55]}
          rotation={[0.15, 0.35, 0]}
          speed={1.35}
          scale={0.85}
          float={!lite}
          depth={1.8}
          progressRef={progressRef}
        >
          <ArchBlock lite={lite} />
        </Piece>

        {/* Web development / code */}
        <Piece
          position={[1.55, 1.45, -0.9]}
          rotation={[0.35, -0.2, 0.15]}
          speed={1.15}
          scale={0.85}
          float={!lite}
          depth={2.2}
          progressRef={progressRef}
        >
          <CodeShape lite={lite} />
        </Piece>

        {!lite && (
          <>
            <Piece
              position={[1.9, -1.1, 0.35]}
              rotation={[0.2, -0.3, 0.1]}
              speed={1.05}
              scale={0.9}
              depth={1.0}
              progressRef={progressRef}
            >
              <MusicNote scale={1.1} />
            </Piece>
            <Piece
              position={[-2.0, 1.55, -0.7]}
              rotation={[0.25, 0.5, -0.1]}
              speed={1.25}
              scale={0.75}
              depth={2.0}
              progressRef={progressRef}
            >
              <MusicNote color="#a82026" scale={0.85} />
            </Piece>
            <Piece
              position={[-1.6, -0.5, 1.1]}
              rotation={[0.15, -0.4, 0.05]}
              speed={0.95}
              scale={0.6}
              depth={1.5}
              progressRef={progressRef}
            >
              <MusicNote color={GOLD} scale={0.6} />
            </Piece>
            <Piece
              position={[2.4, 1.9, 0.5]}
              rotation={[0.1, 0.25, -0.15]}
              speed={1.4}
              scale={0.5}
              depth={2.4}
              progressRef={progressRef}
            >
              <MusicNote color="#a82026" scale={0.45} />
            </Piece>
            <Piece
              position={[0.85, -1.85, 0.9]}
              rotation={[0.1, 0.4, 0]}
              speed={0.8}
              scale={0.55}
              depth={0.5}
              progressRef={progressRef}
            >
              <Planet color="#8a3a3a" ring="#b0b6be" />
            </Piece>
          </>
        )}
      </ParallaxRig>

      {!lite && (
        <>
          <ContactShadows
            position={[0, -2.5, 0]}
            opacity={0.32}
            scale={14}
            blur={2.8}
            far={5}
            resolution={256}
            color="#1a0a0c"
          />
          <Environment resolution={256}>
            <Lightformer intensity={1.8} position={[0, 4, 2]} scale={[8, 3, 1]} color="#c4a260" />
            <Lightformer intensity={1.2} position={[-4, 1, 2]} scale={[3, 5, 1]} color="#a82026" />
            <Lightformer intensity={1} position={[4, -1, 3]} scale={[4, 4, 1]} color="#b0b6be" />
          </Environment>
        </>
      )}
    </>
  );
}

function useIsLiteDevice() {
  const [lite, setLite] = useState(false);
  useEffect(() => {
    const touch =
      window.matchMedia("(pointer: coarse)").matches ||
      (navigator.maxTouchPoints > 0 && window.innerWidth < 900);
    const cores = navigator.hardwareConcurrency ?? 8;
    setLite(touch || cores <= 2);
  }, []);
  return lite;
}

export default function SimaxScene({
  progressRef,
}: {
  progressRef: ScrollProgressRef;
}) {
  const lite = useIsLiteDevice();

  return (
    <Canvas
      shadows={!lite}
      dpr={lite ? [1, 1.25] : [1, 1.75]}
      gl={{
        antialias: !lite,
        alpha: true,
        powerPreference: lite ? "low-power" : "high-performance",
        stencil: false,
        premultipliedAlpha: true,
      }}
      camera={{ position: [0, 0.2, 8.4], fov: 36 }}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
      frameloop={lite ? "demand" : "always"}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.domElement.style.pointerEvents = "none";
        gl.domElement.addEventListener(
          "webglcontextlost",
          (e) => e.preventDefault(),
          false,
        );
      }}
    >
      <Suspense fallback={null}>
        <Scene lite={lite} progressRef={progressRef} />
      </Suspense>
    </Canvas>
  );
}
