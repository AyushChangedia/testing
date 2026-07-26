"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, AdaptiveDpr, PerformanceMonitor } from "@react-three/drei";
import { Suspense, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { prefersReducedMotion } from "@/lib/utils";

/* ============================================================
   LIQUID SURFACE — ripples that chase the pointer
   ============================================================ */

const liquidVertex = /* glsl */ `
  uniform float uTime;
  uniform vec2 uPointer;
  uniform float uIntensity;
  varying vec2 vUv;
  varying float vElevation;

  // Cheap 2D value noise — plenty for a liquid surface.
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  void main() {
    vUv = uv;
    vec3 pos = position;

    // Concentric ripples radiating from the pointer position.
    float d = distance(uv, uPointer * 0.5 + 0.5);
    float ripple = sin(d * 26.0 - uTime * 2.6) * exp(-d * 4.5) * 0.11 * uIntensity;

    // Slow ambient swell so the surface is never fully still.
    float swell = noise(uv * 3.2 + uTime * 0.14) * 0.045;
    swell += noise(uv * 7.0 - uTime * 0.09) * 0.022;

    pos.z += ripple + swell;
    vElevation = ripple + swell;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const liquidFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uDeep;
  uniform vec3 uShallow;
  uniform vec3 uGold;
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    float e = smoothstep(-0.06, 0.09, vElevation);
    vec3 col = mix(uDeep, uShallow, e);

    // Gold specular sheen riding the wave crests.
    float sheen = smoothstep(0.045, 0.11, vElevation);
    col = mix(col, uGold, sheen * 0.55);

    // Vignette toward the rim so it reads as liquid in a vessel.
    float r = distance(vUv, vec2(0.5));
    col *= smoothstep(0.62, 0.2, r);
    float alpha = smoothstep(0.6, 0.28, r);

    gl_FragColor = vec4(col, alpha);
    #include <colorspace_fragment>
  }
`;

function LiquidSurface({ reduced }: { reduced: boolean }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const pointer = useRef(new THREE.Vector2(0, 0));
  const target = useRef(new THREE.Vector2(0, 0));

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uIntensity: { value: reduced ? 0.25 : 1 },
      uDeep: { value: new THREE.Color("#150d08") },
      uShallow: { value: new THREE.Color("#5a3a26") },
      uGold: { value: new THREE.Color("#d4af37") },
    }),
    [reduced],
  );

  useFrame((state, delta) => {
    if (!mat.current) return;
    mat.current.uniforms.uTime.value += delta;
    target.current.set(state.pointer.x, state.pointer.y);
    pointer.current.lerp(target.current, 0.06);
    mat.current.uniforms.uPointer.value.copy(pointer.current);
  });

  return (
    <mesh rotation={[-Math.PI / 2.35, 0, 0]} position={[0, -0.62, 0]}>
      <planeGeometry args={[7.5, 7.5, 96, 96]} />
      <shaderMaterial
        ref={mat}
        vertexShader={liquidVertex}
        fragmentShader={liquidFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

/* ============================================================
   COFFEE CUP — lathed porcelain with a liquid disc inside
   ============================================================ */

function CoffeeCup({ reduced }: { reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const surface = useRef<THREE.Mesh>(null);

  // Cup silhouette, revolved around Y.
  const cupGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [];
    // Outer wall: slight taper, subtle belly.
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      const y = -0.5 + t * 1.0;
      const r = 0.52 + Math.sin(t * Math.PI * 0.55) * 0.16;
      points.push(new THREE.Vector2(r, y));
    }
    // Rim roll-over and inner wall back down.
    points.push(new THREE.Vector2(0.66, 0.52));
    for (let i = 16; i >= 0; i--) {
      const t = i / 16;
      const y = -0.42 + t * 0.94;
      const r = (0.52 + Math.sin(t * Math.PI * 0.55) * 0.16) * 0.9;
      points.push(new THREE.Vector2(r, y));
    }
    points.push(new THREE.Vector2(0, -0.42));
    return new THREE.LatheGeometry(points, 96);
  }, []);

  const saucerGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      points.push(new THREE.Vector2(t * 1.15, -0.62 + Math.pow(t, 2.4) * 0.1));
    }
    points.push(new THREE.Vector2(1.18, -0.5));
    points.push(new THREE.Vector2(1.14, -0.52));
    for (let i = 12; i >= 0; i--) {
      const t = i / 12;
      points.push(new THREE.Vector2(t * 1.13, -0.65 + Math.pow(t, 2.4) * 0.1));
    }
    return new THREE.LatheGeometry(points, 80);
  }, []);

  useFrame((state, delta) => {
    if (!group.current) return;
    const speed = reduced ? 0.06 : 0.22;
    group.current.rotation.y += delta * speed;

    if (!reduced) {
      // Gentle tilt tracking the pointer — the cup "looks at" the cursor.
      const px = state.pointer.x;
      const py = state.pointer.y;
      group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, -px * 0.09, 0.05);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, py * 0.07, 0.05);
    }

    if (surface.current) {
      const m = surface.current.material as THREE.MeshPhysicalMaterial;
      // Slow shimmer across the crema.
      m.emissiveIntensity = 0.16 + Math.sin(state.clock.elapsedTime * 1.1) * 0.05;
    }
  });

  return (
    <Float speed={reduced ? 0 : 1.1} rotationIntensity={0} floatIntensity={reduced ? 0 : 0.35}>
      <group ref={group} position={[0, 0.1, 0]}>
        {/* Saucer */}
        <mesh geometry={saucerGeometry} castShadow receiveShadow>
          <meshPhysicalMaterial
            color="#0e0b09"
            roughness={0.28}
            metalness={0.05}
            clearcoat={0.9}
            clearcoatRoughness={0.12}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Cup body */}
        <mesh geometry={cupGeometry} castShadow receiveShadow>
          <meshPhysicalMaterial
            color="#131010"
            roughness={0.22}
            metalness={0.08}
            clearcoat={1}
            clearcoatRoughness={0.08}
            sheen={0.6}
            sheenColor="#d4af37"
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Handle */}
        <mesh position={[0.72, 0.06, 0]} rotation={[0, 0, -0.18]} castShadow>
          <torusGeometry args={[0.26, 0.052, 24, 64, Math.PI * 1.35]} />
          <meshPhysicalMaterial
            color="#131010"
            roughness={0.22}
            metalness={0.08}
            clearcoat={1}
            clearcoatRoughness={0.08}
          />
        </mesh>

        {/* Gold rim */}
        <mesh position={[0, 0.515, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.655, 0.011, 16, 96]} />
          <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.16} />
        </mesh>

        {/* Coffee surface / crema */}
        <mesh ref={surface} position={[0, 0.44, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.6, 72]} />
          <meshPhysicalMaterial
            color="#3a2416"
            roughness={0.14}
            metalness={0.25}
            clearcoat={1}
            clearcoatRoughness={0.05}
            emissive="#7a4a22"
            emissiveIntensity={0.16}
          />
        </mesh>
      </group>
    </Float>
  );
}

/* ============================================================
   FLOATING COFFEE BEANS — instanced for a single draw call
   ============================================================ */

function Beans({ count = 34, reduced }: { count?: number; reduced: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        // Kept well outside the cup so beans read as background depth rather
        // than foreground boulders — anything nearer reads huge at fov 42.
        radius: 3.1 + (i % 7) * 0.46,
        speed: 0.1 + ((i * 37) % 20) / 90,
        offset: (i / count) * Math.PI * 2,
        yBase: -1.9 + ((i * 53) % 100) / 26,
        yAmp: 0.25 + ((i * 17) % 30) / 90,
        tilt: ((i * 29) % 100) / 100,
        scale: 0.055 + ((i * 13) % 40) / 900,
      })),
    [count],
  );

  // A bean is a squashed sphere; the crease is faked by the material's normal.
  const beanGeo = useMemo(() => {
    const g = new THREE.SphereGeometry(1, 18, 14);
    g.scale(1, 0.66, 0.78);
    return g;
  }, []);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime * (reduced ? 0.2 : 1);
    seeds.forEach((s, i) => {
      const a = s.offset + t * s.speed;
      dummy.position.set(
        Math.cos(a) * s.radius,
        s.yBase + Math.sin(t * 0.6 + s.offset) * s.yAmp,
        Math.sin(a) * s.radius * 0.72,
      );
      dummy.rotation.set(t * 0.4 + s.tilt * 6, a * 1.6, s.tilt * 3);
      // Real beans are ~1cm against a ~9cm cup; keep that ratio believable.
      dummy.scale.setScalar(s.scale * 0.95);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[beanGeo, undefined, count]} castShadow>
      <meshStandardMaterial color="#4a2f1d" roughness={0.62} metalness={0.15} />
    </instancedMesh>
  );
}

/* ============================================================
   STEAM — additive points drifting upward, nudged by the pointer
   ============================================================ */

function Steam({ count = 260, reduced }: { count?: number; reduced: boolean }) {
  const points = useRef<THREE.Points>(null);

  const { positions, seeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      seeds[i * 3] = Math.random(); // lifetime offset
      seeds[i * 3 + 1] = 0.5 + Math.random() * 1.6; // rise speed
      seeds[i * 3 + 2] = Math.random() * Math.PI * 2; // sway phase
      positions[i * 3] = (Math.random() - 0.5) * 0.6;
      positions[i * 3 + 1] = 0.5 + Math.random() * 2.4;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.6;
    }
    return { positions, seeds };
  }, [count]);

  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,245,230,0.85)");
    g.addColorStop(0.4, "rgba(230,215,195,0.25)");
    g.addColorStop(1, "rgba(200,180,160,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  useFrame((state, delta) => {
    if (!points.current) return;
    const arr = points.current.geometry.attributes.position.array as Float32Array;
    const t = state.clock.elapsedTime;
    const push = reduced ? 0 : state.pointer.x * 0.9;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      arr[i3 + 1] += delta * seeds[i3 + 1] * (reduced ? 0.25 : 0.55);

      // Sway widens as the plume rises, and leans toward the pointer.
      const h = arr[i3 + 1];
      const spread = Math.max(0, h - 0.5) * 0.34;
      arr[i3] += Math.sin(t * 0.9 + seeds[i3 + 2]) * delta * 0.14 * (1 + spread) + push * delta * 0.3;
      arr[i3 + 2] += Math.cos(t * 0.7 + seeds[i3 + 2]) * delta * 0.11 * (1 + spread);

      if (h > 3.6) {
        arr[i3] = (Math.random() - 0.5) * 0.5;
        arr[i3 + 1] = 0.5;
        arr[i3 + 2] = (Math.random() - 0.5) * 0.5;
      }
    }
    points.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={points} position={[0, 0.1, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        map={texture}
        transparent
        opacity={0.16}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

/* ============================================================
   LIGHTING — warm key, gold rim, moving accent
   ============================================================ */

function Lighting({ reduced }: { reduced: boolean }) {
  const accent = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (!accent.current || reduced) return;
    const t = state.clock.elapsedTime;
    accent.current.position.x = Math.sin(t * 0.36) * 3.4;
    accent.current.position.z = Math.cos(t * 0.28) * 3.4;
    accent.current.intensity = 14 + Math.sin(t * 1.4) * 4;
  });

  return (
    <>
      <ambientLight intensity={0.32} color="#ffd9a0" />
      <spotLight
        position={[4, 6, 3]}
        angle={0.42}
        penumbra={1}
        intensity={62}
        color="#ffcf8a"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
      />
      <pointLight position={[-3.2, 1.4, -2.4]} intensity={22} color="#d4af37" />
      <pointLight ref={accent} position={[2.6, -0.6, 2.2]} intensity={14} color="#a9744f" />
      {/* Rim light picks out the cup silhouette against the dark backdrop. */}
      <directionalLight position={[-2, 2.4, -4]} intensity={2.4} color="#f0dda6" />
    </>
  );
}

/* ============================================================
   CAMERA PARALLAX
   ============================================================ */

function CameraRig({ reduced }: { reduced: boolean }) {
  const { camera } = useThree();
  useFrame((state, delta) => {
    if (reduced) return;
    const targetX = state.pointer.x * 0.85;
    const targetY = 0.55 + state.pointer.y * 0.42;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 2.2, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 2.2, delta);
    camera.lookAt(0, 0.05, 0);
  });
  return null;
}

/* ============================================================
   PUBLIC
   ============================================================ */

export function CoffeeScene({ className }: { className?: string }) {
  const reduced = useMemo(() => prefersReducedMotion(), []);
  const [degraded, setDegraded] = useState(false);

  return (
    <div className={className}>
      <Canvas
        shadows={!degraded}
        dpr={[1, degraded ? 1.2 : 1.8]}
        gl={{
          antialias: !degraded,
          alpha: true,
          powerPreference: "high-performance",
        }}
        camera={{ position: [0, 0.5, 5.9], fov: 42 }}
        // Never block the main thread on a context we can't get.
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.15;
        }}
      >
        {/* Drops quality rather than frames when the GPU struggles. */}
        <PerformanceMonitor onDecline={() => setDegraded(true)} />
        <AdaptiveDpr pixelated />

        <Suspense fallback={null}>
          <Lighting reduced={reduced} />
          <CameraRig reduced={reduced} />
          <CoffeeCup reduced={reduced} />
          <LiquidSurface reduced={reduced} />
          {!degraded && <Beans reduced={reduced} />}
          <Steam count={degraded ? 120 : 260} reduced={reduced} />
          {/*
            Deliberately no <Environment preset> — drei's presets stream an HDR
            from a third-party CDN, which adds an external runtime dependency and
            throws (killing the canvas) whenever that host is unreachable. The
            lighting rig above covers the same ground locally.
          */}
          <fog attach="fog" args={["#050403", 6, 15]} />
        </Suspense>
      </Canvas>
    </div>
  );
}
