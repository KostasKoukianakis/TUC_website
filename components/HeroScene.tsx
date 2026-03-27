"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

/** Hero wave field: particle grid + mouse bump. */
const CLEAR_HEX = 0x111111; // match `bg-app` / rich-carbon
const COLS = 120;
const ROWS = 80;
const N = COLS * ROWS;
const TARGET_COL = 63;
const TARGET_ROW = 42;
const TARGET_IDX = TARGET_ROW * COLS + TARGET_COL;

const vertexShader = /* glsl */ `
  attribute float aSize;
  uniform float uTime;
  uniform float uScroll;
  uniform vec2 uMouse;
  varying float vH;
  varying float vDist;

  float waveY(float x, float z, float t) {
    float y = 0.0;
    y += 2.2  * sin(0.40 * x + t * 0.70);
    y += 1.1  * sin(0.75 * x - t * 0.55 + 1.2);
    y += 0.55 * sin(1.10 * x + t * 0.90 - 0.7);
    y += 0.80 * sin(0.35 * z + t * 0.50 + 1.8);
    y += 0.40 * sin(0.70 * z - t * 0.65 + 0.3);
    y += 0.30 * sin(0.45 * x + 0.45 * z + t * 0.38);

    float mxW = uMouse.x * 20.0;
    float mzW = uMouse.y * 14.0;
    float d2  = length(vec2(x - mxW, z - mzW));
    y += 2.0 * exp(-0.06 * d2 * d2) * sin(d2 * 1.2 - t * 2.5);

    float ex = exp(-0.0009 * x * x);
    float ez = exp(-0.0018 * z * z);
    return y * ex * ez;
  }

  void main() {
    vec3 p = position;
    float s = clamp(uScroll, 0.0, 1.0);
    p.x *= 1.0 + s * 0.6;
    p.z = p.z * (1.0 + s * 1.2) - s * 8.0;
    p.y = waveY(position.x / (1.0 + s * 0.6), p.z, uTime) * (1.0 + s * 1.5);

    vH = clamp((p.y + 3.0) / 6.0, 0.0, 1.0);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vDist = -mv.z;

    gl_PointSize = aSize * (400.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  varying float vH;
  varying float vDist;

  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float d  = length(uv);
    float a  = smoothstep(0.5, 0.10, d);
    if (a < 0.01) discard;

    vec3 dark  = vec3(0.40, 0.42, 0.46);
    vec3 light = vec3(0.88, 0.90, 0.93);
    vec3 col   = mix(dark, light, vH);

    float fog = clamp((vDist - 25.0) / 40.0, 0.0, 1.0);
    float alpha = a * (0.55 + 0.45 * vH) * (1.0 - fog * 0.9);

    gl_FragColor = vec4(col, alpha);
  }
`;

function waveYJS(x: number, z: number, t: number) {
  let y = 0;
  y += 2.2 * Math.sin(0.4 * x + t * 0.7);
  y += 1.1 * Math.sin(0.75 * x - t * 0.55 + 1.2);
  y += 0.55 * Math.sin(1.1 * x + t * 0.9 - 0.7);
  y += 0.8 * Math.sin(0.35 * z + t * 0.5 + 1.8);
  y += 0.4 * Math.sin(0.7 * z - t * 0.65 + 0.3);
  y += 0.3 * Math.sin(0.45 * x + 0.45 * z + t * 0.38);
  return y * Math.exp(-0.0009 * x * x) * Math.exp(-0.0018 * z * z);
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
}

function ParticleWaveField({ scrollProgress }: { scrollProgress: number }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const mouseRef = useRef({ tx: 0, ty: 0, x: 0, y: 0 });
  const introStartRef = useRef<number | null>(null);
  const smoothProgressRef = useRef(0);
  const camStartRef = useRef(new THREE.Vector3(0, 10, 16));
  const camEndRef = useRef(new THREE.Vector3());
  const lookStartRef = useRef(new THREE.Vector3());
  const lookEndRef = useRef(new THREE.Vector3());
  const lookRef = useRef(new THREE.Vector3());
  const targetBaseX = (TARGET_COL / (COLS - 1) - 0.5) * 50;
  const targetBaseZ = (TARGET_ROW / (ROWS - 1) - 0.5) * 38;

  const geometry = useMemo(() => {
    const positions = new Float32Array(N * 3);
    const sizes = new Float32Array(N);
    let idx = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = (c / (COLS - 1) - 0.5) * 50;
        const z = (r / (ROWS - 1) - 0.5) * 38;
        positions[idx * 3 + 0] = x;
        positions[idx * 3 + 1] = 0;
        positions[idx * 3 + 2] = z;
        sizes[idx] = 0.6 + Math.random() * 0.7;
        if (idx === TARGET_IDX) {
          sizes[idx] = 1.4;
        }
        idx++;
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0.0 },
      uScroll: { value: 0.0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
    }),
    [],
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      mouseRef.current.tx = (e.clientX / W - 0.5) * 2;
      mouseRef.current.ty = -(e.clientY / H - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const { camera } = useThree();

  useFrame((state) => {
    const mat = materialRef.current;
    if (!mat) return;

    const elapsed = state.clock.elapsedTime;
    const t = elapsed * 0.5;
    mat.uniforms.uTime.value = t;

    smoothProgressRef.current += (scrollProgress - smoothProgressRef.current) * 0.06;
    const pAll = smoothProgressRef.current;
    // Overlap approach + zoom to avoid dead-zone pause/snap.
    const s1s2 = Math.min(pAll / 0.65, 1);
    const zoomT = smoothstep(0.5, 0.88, pAll);
    const zoomEased = easeInOutCubic(zoomT);
    mat.uniforms.uScroll.value = s1s2;

    const m = mouseRef.current;
    m.x += (m.tx - m.x) * 0.05;
    m.y += (m.ty - m.y) * 0.05;
    const mouseFactor = Math.max(0, 1 - zoomEased * 1.2);
    mat.uniforms.uMouse.value.set(m.x * mouseFactor, m.y * mouseFactor);

    if (introStartRef.current === null) introStartRef.current = elapsed;
    const introElapsed = elapsed - introStartRef.current;
    const p = Math.min(introElapsed / 3.0, 1.0);
    const ep = 1 - Math.pow(1 - p, 3);

    const CAM_HERO = { x: 0, y: 22, z: 28 };
    const CAM_S2 = { x: 0, y: 10, z: 16 };
    // Base camera path (always computed) so transition to zoom has continuity.
    const ty = CAM_HERO.y + (CAM_S2.y - CAM_HERO.y) * s1s2;
    const tz = CAM_HERO.z + (CAM_S2.z - CAM_HERO.z) * s1s2;
    const targetCamX = m.x * 2.5;
    camStartRef.current.set(
      targetCamX,
      36 + (ty - 36) * ep + m.y * 1.2 * (1 - s1s2),
      12 + (tz - 12) * ep,
    );
    lookStartRef.current.set(0, 4 - s1s2 * 8, 0);

    const baseX = targetBaseX;
    const baseZ = targetBaseZ;
    const px = baseX * (1 + s1s2 * 0.6);
    const pz = baseZ * (1 + s1s2 * 1.2) - s1s2 * 8;
    const py = waveYJS(baseX / (1 + s1s2 * 0.6), pz, t) * (1 + s1s2 * 1.5);
    camEndRef.current.set(px * 0.08, py + 0.12, pz + 0.18);
    lookEndRef.current.set(px, py, pz);

    camera.position.lerpVectors(camStartRef.current, camEndRef.current, zoomEased);
    lookRef.current.lerpVectors(lookStartRef.current, lookEndRef.current, zoomEased);
    camera.lookAt(lookRef.current);
  });

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  return (
    <points geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </points>
  );
}

function SceneSetup() {
  const { gl, scene } = useThree();
  useEffect(() => {
    gl.setClearColor(CLEAR_HEX, 1);
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.toneMapping = THREE.NoToneMapping;
    gl.toneMappingExposure = 1;
    scene.fog = new THREE.Fog(CLEAR_HEX, 35, 70);
    return () => {
      scene.fog = null;
    };
  }, [gl, scene]);
  return null;
}

export function HeroScene({ scrollProgress = 0 }: { scrollProgress?: number }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 min-h-[100dvh] w-full"
      style={{
        maskImage:
          "linear-gradient(0deg, transparent 0%, black 30%, black 78%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(0deg, transparent 0%, black 30%, black 78%, transparent 100%)",
      }}
    >
      <Canvas
        className="block h-full min-h-[100dvh] w-full"
        style={{ display: "block", width: "100%", height: "100%", minHeight: "100dvh" }}
        camera={{
          position: [0, 32, 14],
          fov: 55,
          near: 0.1,
          far: 200,
        }}
        gl={{
          alpha: false,
          antialias: false,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
        dpr={[1, 1.5]}
      >
        <SceneSetup />
        <ParticleWaveField scrollProgress={scrollProgress} />
      </Canvas>
    </div>
  );
}
