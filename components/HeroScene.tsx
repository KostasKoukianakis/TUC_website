"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";

/** Hero wave field + lab dot cloud in one WebGL context (continuous populate). */
const CLEAR_HEX = 0x000000;
const COLS = 120;
const ROWS = 80;
const N = COLS * ROWS;
const TARGET_COL = 63;
const TARGET_ROW = 42;
const TARGET_IDX = TARGET_ROW * COLS + TARGET_COL;

const LAB_RW = 28;
const LAB_RD = 18;
const LAB_CH = 3.2;
const LAB_HW = LAB_RW / 2;
const LAB_HD = LAB_RD / 2;
const LAB_DOOR_X0 = -10.8;
const LAB_DOOR_X1 = -6.2;
const LAB_DOOR_Y0 = 0.08;
const LAB_DOOR_Y1 = 2.75;

const LAB_CAM_ENTRY_OUTSIDE = new THREE.Vector3(2.9, 1.92, 11.42);
const LAB_LOOK_ENTRY_OUTSIDE = new THREE.Vector3(-8.05, 1.5, 8.22);

const BASE_VISIBLE_POINTS = 9000;
const LAB_TOTAL_POINTS = 320000;

const LAB_FLY_PATH = [
  { p: [2.9, 1.92, 11.42], l: [-8.05, 1.5, 8.22] },
  { p: [11, 1.7, 7], l: [6, 1.6, 2] },
  { p: [6, 1.7, 4], l: [0, 1.6, 0] },
  { p: [2, 1.68, 1], l: [-2, 1.58, -3] },
  { p: [-3, 1.65, -1], l: [-1, 1.55, -7] },
  { p: [0, 1.62, -5.5], l: [0, 1.9, -9] },
] as const;

function eio(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function lv(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function sampleLabFlyCamera(t: number, elapsed: number) {
  const path = LAB_FLY_PATH;
  const tt = Math.min(Math.max(t, 0), 0.9999);
  const seg = tt * (path.length - 1);
  const si = Math.min(path.length - 2, Math.floor(seg));
  const st = eio(seg % 1);
  const ca = path[si];
  const cb = path[si + 1];
  const pos = new THREE.Vector3(
    lv(ca.p[0], cb.p[0], st) + Math.sin(elapsed * 0.19) * 0.035,
    lv(ca.p[1], cb.p[1], st) + Math.sin(elapsed * 0.14) * 0.018,
    lv(ca.p[2], cb.p[2], st),
  );
  const look = new THREE.Vector3(
    lv(ca.l[0], cb.l[0], st),
    lv(ca.l[1], cb.l[1], st),
    lv(ca.l[2], cb.l[2], st),
  );
  return { pos, look };
}

function fillLabShellTargets(out: Float32Array, n: number) {
  let w = 0;
  const push = (x: number, y: number, z: number) => {
    if (w >= n) return;
    const o = w * 3;
    out[o] = x;
    out[o + 1] = y;
    out[o + 2] = z;
    w++;
  };

  const faces = 6;
  const perFace = Math.ceil(n / faces);

  for (let fi = 0; fi < faces && w < n; fi++) {
    for (let k = 0; k < perFace && w < n; k++) {
      const g1 = ((k * 0.618033988749895 + fi * 0.37) % 1) * 2 - 1;
      const g2 = ((k * 0.7548776662466927 + fi * 0.19) % 1) * 2 - 1;

      switch (fi) {
        case 0: {
          const x = g1 * LAB_HW * 0.96;
          const z = g2 * LAB_HD * 0.96;
          push(x, 0.045 + (k % 4) * 0.012, z);
          break;
        }
        case 1: {
          const x = g1 * LAB_HW * 0.96;
          const z = g2 * LAB_HD * 0.96;
          push(x, LAB_CH - 0.055 - (k % 3) * 0.01, z);
          break;
        }
        case 2: {
          const z = g1 * LAB_HD * 0.96;
          const y = 0.06 + ((g2 * 0.5 + 0.5) * 0.92) * (LAB_CH - 0.12);
          push(-LAB_HW + 0.11, y, z);
          break;
        }
        case 3: {
          const z = g1 * LAB_HD * 0.96;
          const y = 0.06 + ((g2 * 0.5 + 0.5) * 0.92) * (LAB_CH - 0.12);
          push(LAB_HW - 0.11, y, z);
          break;
        }
        case 4: {
          const x = g1 * LAB_HW * 0.96;
          const y = 0.06 + ((g2 * 0.5 + 0.5) * 0.92) * (LAB_CH - 0.12);
          push(x, y, -LAB_HD + 0.11);
          break;
        }
        default: {
          let x = g1 * LAB_HW * 0.96;
          let y = 0.06 + ((g2 * 0.5 + 0.5) * 0.92) * (LAB_CH - 0.12);
          const z = LAB_HD - 0.11;
          if (x > LAB_DOOR_X0 && x < LAB_DOOR_X1 && y > LAB_DOOR_Y0 && y < LAB_DOOR_Y1) {
            x = LAB_DOOR_X1 + 0.35 + (Math.abs(g1) * 0.5) * (LAB_HW - LAB_DOOR_X1 - 0.4);
          }
          push(x, y, z);
          break;
        }
      }
    }
  }

  while (w < n) {
    const g1 = (w * 0.618033988749895) % 1;
    const g2 = (w * 0.3819660113) % 1;
    push((g1 * 2 - 1) * LAB_HW * 0.96, 0.05, (g2 * 2 - 1) * LAB_HD * 0.96);
  }
}

const waveVertexShader = /* glsl */ `
  attribute float aSize;
  attribute vec3 aTargetPos;
  uniform float uTime;
  uniform float uScroll;
  uniform float uAssemble;
  uniform float uLabReveal;
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
    vec3 pWave = position;
    float s = clamp(uScroll, 0.0, 1.0);
    pWave.x *= 1.0 + s * 0.6;
    pWave.z = pWave.z * (1.0 + s * 1.2) - s * 8.0;
    pWave.y = waveY(position.x / (1.0 + s * 0.6), pWave.z, uTime) * (1.0 + s * 1.5);
    float a = smoothstep(0.0, 1.0, clamp(uAssemble, 0.0, 1.0));
    vec3 p = mix(pWave, aTargetPos, a);

    vH = clamp((p.y + 3.0) / 6.0, 0.0, 1.0);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vDist = -mv.z;

    float labW = smoothstep(0.02, 0.45, uLabReveal);
    float sizeScale = mix(400.0, 180.0, a) * (1.0 - labW * 0.85);
    gl_PointSize = clamp(aSize * (sizeScale / -mv.z), 1.0, 5.0);
    gl_Position = projectionMatrix * mv;
  }
`;

const waveFragmentShader = /* glsl */ `
  precision highp float;
  uniform float uLabReveal;
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
    float fadeLab = 1.0 - smoothstep(0.04, 0.82, uLabReveal);
    float alpha = a * (0.55 + 0.45 * vH) * (1.0 - fog * 0.9) * fadeLab;

    gl_FragColor = vec4(col, alpha);
  }
`;

const labVertexShader = /* glsl */ `
  attribute float size;
  attribute float reveal;
  uniform float uPopulate;
  uniform float uTime;
  varying vec3 vCol;
  varying float vReveal;
  varying vec3 vWorldPos;
  void main(){
    vCol = color;
    vReveal = reveal;
    float t = uTime;
    float amp = 0.017 * smoothstep(0.06, 0.42, uPopulate);
    vec3 pos = position;
    pos.x += sin(t * 1.05 + pos.y * 2.0 + pos.z * 1.25) * amp;
    pos.y += sin(t * 0.92 + pos.x * 1.65 + pos.z * 1.45) * amp * 0.88;
    pos.z += cos(t * 1.02 + pos.x * 1.35 + pos.y * 1.75) * amp;
    vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    float popBoost = mix(0.9, 1.0, smoothstep(0.0, 1.0, uPopulate));
    gl_PointSize = clamp(size * 2.05 * popBoost, 1.4, 3.2);
    gl_Position = projectionMatrix * mv;
  }
`;

const labFragmentShader = /* glsl */ `
  varying vec3 vCol;
  varying float vReveal;
  varying vec3 vWorldPos;
  uniform float uPopulate;
  void main(){
    vec2 uv = gl_PointCoord - 0.5;
    float r = dot(uv, uv);
    if(r > 0.25) discard;
    float a = 1.0 - smoothstep(0.13, 0.25, r);
    float vis = smoothstep(vReveal - 0.012, vReveal + 0.012, uPopulate);
    if(vis < 0.001) discard;
    vec3 col = min(vCol * 1.06, vec3(0.96));
    float outA = a * vis * 0.78;

    const float HW = 14.0;
    const float HD = 9.0;
    const float CH = 3.2;
    vec3 w = vWorldPos;
    float dL = abs(w.x + HW);
    float dR = abs(w.x - HW);
    float dBa = abs(w.z + HD);
    float dFr = abs(w.z - HD);
    float dMin = min(min(dL, dR), min(dBa, dFr));
    float onShell = 1.0 - smoothstep(0.12, 0.52, dMin);
    float wx = 1.0 - smoothstep(0.18, 0.55, min(dL, dR));
    float wz = 1.0 - smoothstep(0.18, 0.55, min(dBa, dFr));
    float wSum = wx + wz + 1e-4;
    float yMid = abs(w.y - CH * 0.5) / (CH * 0.5 + 0.01);
    float edgeLR = max(abs(w.z) / HD, yMid);
    float edgeFB = max(abs(w.x) / HW, yMid);
    float edgeAlong = (wx * edgeLR + wz * edgeFB) / wSum;
    float edgeBlend = smoothstep(0.0, 0.9, edgeAlong);
    float g = onShell * mix(0.26, 1.0, edgeBlend);
    vec3 wallBlack = vec3(0.02, 0.022, 0.028);
    col = mix(col, wallBlack, g * 0.72);
    outA *= mix(1.0, 0.48, g * 0.65);

    gl_FragColor = vec4(col, outA);
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

type HeroDriveProps = {
  scrollProgress: number;
  labReveal: number;
  waveGeometry: THREE.BufferGeometry;
};

function HeroDrive({ scrollProgress, labReveal, waveGeometry }: HeroDriveProps) {
  const waveMatRef = useRef<THREE.ShaderMaterial>(null);
  const labMatRef = useRef<THREE.ShaderMaterial>(null);
  const mouseRef = useRef({ tx: 0, ty: 0, x: 0, y: 0 });
  const introStartRef = useRef<number | null>(null);
  const smoothProgressRef = useRef(0);
  const camStartRef = useRef(new THREE.Vector3(0, 10, 16));
  const camEndRef = useRef(new THREE.Vector3());
  const lookStartRef = useRef(new THREE.Vector3());
  const lookEndRef = useRef(new THREE.Vector3());
  const tmpCamRef = useRef(new THREE.Vector3());
  const tmpLookRef = useRef(new THREE.Vector3());
  const blendLookRef = useRef(new THREE.Vector3());
  const labRevealRef = useRef(labReveal);
  labRevealRef.current = labReveal;

  const targetBaseX = (TARGET_COL / (COLS - 1) - 0.5) * 50;
  const targetBaseZ = (TARGET_ROW / (ROWS - 1) - 0.5) * 38;

  const [labGeo, setLabGeo] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    let worker: Worker | null = null;
    try {
      worker = new Worker(
        new URL("../workers/heroLabDots.worker.ts", import.meta.url),
        { type: "module" },
      );
      worker.onmessage = (e: MessageEvent<{ type?: string; position?: ArrayBuffer; color?: ArrayBuffer; size?: ArrayBuffer; reveal?: ArrayBuffer; count?: number }>) => {
        const data = e.data;
        if (!data || data.type !== "result") return;
        const pos = new Float32Array(data.position!);
        const col = new Float32Array(data.color!);
        const sz = new Float32Array(data.size!);
        const rv = new Float32Array(data.reveal!);
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
        geo.setAttribute("size", new THREE.BufferAttribute(sz, 1));
        geo.setAttribute("reveal", new THREE.BufferAttribute(rv, 1));
        setLabGeo(geo);
      };
      worker.postMessage({ type: "build", totalPoints: LAB_TOTAL_POINTS });
    } catch {
      /* worker optional */
    }
    return () => {
      if (worker) worker.terminate();
      setLabGeo((g) => {
        if (g) g.dispose();
        return null;
      });
    };
  }, []);

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

  const waveUniforms = useMemo(
    () => ({
      uTime: { value: 0.0 },
      uScroll: { value: 0.0 },
      uAssemble: { value: 0.0 },
      uLabReveal: { value: 0.0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
    }),
    [],
  );

  const labUniforms = useMemo(
    () => ({
      uPopulate: { value: 0 },
      uTime: { value: 0 },
    }),
    [],
  );

  useFrame((state) => {
    const waveMat = waveMatRef.current;
    const labMat = labMatRef.current;
    const lr = labRevealRef.current;

    const elapsed = state.clock.elapsedTime;
    const t = elapsed * 0.5;

    smoothProgressRef.current += (scrollProgress - smoothProgressRef.current) * 0.06;
    const pAll = smoothProgressRef.current;
    const s1s2 = Math.min(pAll / 0.65, 1);
    const zoomT = smoothstep(0.5, 0.88, pAll);
    const zoomEased = easeInOutCubic(zoomT);
    const assembleT = smoothstep(0.46, 0.72, pAll);
    const assemble = easeInOutCubic(assembleT);

    const m = mouseRef.current;
    m.x += (m.tx - m.x) * 0.05;
    m.y += (m.ty - m.y) * 0.05;
    const mouseFactor = Math.max(0, 1 - zoomEased * 1.2);

    if (introStartRef.current === null) introStartRef.current = elapsed;
    const introElapsed = elapsed - introStartRef.current;
    const pIntro = Math.min(introElapsed / 3.0, 1.0);
    const ep = 1 - Math.pow(1 - pIntro, 3);

    const CAM_HERO = { x: 0, y: 22, z: 28 };
    const CAM_S2 = { x: 0, y: 10, z: 16 };
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

    tmpCamRef.current.lerpVectors(camStartRef.current, camEndRef.current, zoomEased);
    tmpLookRef.current.lerpVectors(lookStartRef.current, lookEndRef.current, zoomEased);

    const assembleCam = smoothstep(0.12, 0.92, assemble);
    tmpCamRef.current.lerp(LAB_CAM_ENTRY_OUTSIDE, assembleCam);
    tmpLookRef.current.lerp(LAB_LOOK_ENTRY_OUTSIDE, assembleCam);

    if (waveMat) {
      waveMat.uniforms.uTime.value = t;
      waveMat.uniforms.uScroll.value = s1s2;
      waveMat.uniforms.uAssemble.value = assemble;
      waveMat.uniforms.uLabReveal.value = lr;
      waveMat.uniforms.uMouse.value.set(m.x * mouseFactor, m.y * mouseFactor);
    }

    if (labMat) {
      labMat.uniforms.uTime.value = elapsed;
      if (lr < 0.015) {
        labMat.uniforms.uPopulate.value = 0;
      } else {
        const baseRatio = Math.min(1, BASE_VISIBLE_POINTS / LAB_TOTAL_POINTS);
        const tFast = Math.min(1, Math.max(0, (lr - 0.02) / 0.33));
        const populate = baseRatio + (1 - baseRatio) * (tFast * tFast * (3 - 2 * tFast));
        labMat.uniforms.uPopulate.value = populate;
      }
    }

    const heroCam = tmpCamRef.current;
    const heroLook = tmpLookRef.current;
    if (lr < 0.001) {
      camera.position.copy(heroCam);
      camera.lookAt(heroLook);
    } else {
      const { pos: labPos, look: labLook } = sampleLabFlyCamera(lr, elapsed);
      const hb = smoothstep(0.0, 0.14, lr);
      camera.position.lerpVectors(heroCam, labPos, hb);
      blendLookRef.current.lerpVectors(heroLook, labLook, hb);
      camera.lookAt(blendLookRef.current);
    }
  });

  useEffect(() => {
    return () => {
      waveGeometry.dispose();
    };
  }, [waveGeometry]);

  return (
    <>
      <points geometry={waveGeometry} frustumCulled={false}>
        <shaderMaterial
          ref={waveMatRef}
          vertexShader={waveVertexShader}
          fragmentShader={waveFragmentShader}
          uniforms={waveUniforms}
          transparent
          depthWrite={false}
          fog={false}
        />
      </points>
      {labGeo ? (
        <points geometry={labGeo} frustumCulled={false}>
          <shaderMaterial
            ref={labMatRef}
            vertexShader={labVertexShader}
            fragmentShader={labFragmentShader}
            uniforms={labUniforms}
            vertexColors
            transparent
            depthWrite={false}
            fog={false}
          />
        </points>
      ) : null}
      <LabDust labReveal={labReveal} />
    </>
  );
}

const FN = 950;
function LabDust({ labReveal }: { labReveal: number }) {
  const labRevealRef = useRef(labReveal);
  labRevealRef.current = labReveal;

  const fp = useMemo(() => {
    const arr = new Float32Array(FN * 3);
    for (let i = 0; i < FN; i++) {
      arr[i * 3] = (Math.random() - 0.5) * (LAB_RW - 2);
      arr[i * 3 + 1] = Math.random() * LAB_CH;
      arr[i * 3 + 2] = (Math.random() - 0.5) * (LAB_RD - 2);
    }
    return arr;
  }, []);
  const fv = useMemo(() => {
    const a = new Float32Array(FN);
    const ph = new Float32Array(FN);
    for (let i = 0; i < FN; i++) {
      a[i] = 0.0012 + Math.random() * 0.0028;
      ph[i] = Math.random() * Math.PI * 2;
    }
    return { a, ph };
  }, []);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(fp, 3));
    return g;
  }, [fp]);

  useFrame((state) => {
    const et = state.clock.elapsedTime;
    const inLab = labRevealRef.current > 0.03;
    const wxy = inLab ? 0.0016 : 0.00075;
    const attr = geo.getAttribute("position") as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < FN; i++) {
      arr[i * 3 + 1] += fv.a[i];
      arr[i * 3] += Math.sin(et * 0.38 + fv.ph[i]) * wxy;
      arr[i * 3 + 2] += Math.cos(et * 0.31 + fv.ph[i] * 1.31) * wxy * 0.85;
      if (arr[i * 3 + 1] > LAB_CH) arr[i * 3 + 1] = 0.02;
    }
    attr.needsUpdate = true;
  });

  useEffect(() => {
    return () => geo.dispose();
  }, [geo]);

  const inLab = labReveal > 0.03;

  return (
    <points geometry={geo} frustumCulled={false}>
      <pointsMaterial
        key={inLab ? "lab-dust" : "hero-dust"}
        color={inLab ? 0x7a8aa0 : 0x99aacc}
        size={inLab ? 0.024 : 0.03}
        transparent
        opacity={inLab ? 0.052 : 0.12}
        sizeAttenuation
        depthWrite={false}
        blending={inLab ? THREE.NormalBlending : THREE.AdditiveBlending}
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
    scene.fog = null;
    return () => {
      scene.fog = null;
    };
  }, [gl, scene]);
  return null;
}

function WaveGeometryProvider({ children }: { children: (geo: THREE.BufferGeometry) => ReactNode }) {
  const geometry = useMemo(() => {
    const positions = new Float32Array(N * 3);
    const sizes = new Float32Array(N);
    const targetPos = new Float32Array(N * 3);
    let idx = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = (c / (COLS - 1) - 0.5) * 50;
        const z = (r / (ROWS - 1) - 0.5) * 38;
        positions[idx * 3 + 0] = x;
        positions[idx * 3 + 1] = 0;
        positions[idx * 3 + 2] = z;
        sizes[idx] = 0.6 + Math.random() * 0.7;
        if (idx === TARGET_IDX) sizes[idx] = 1.4;
        idx++;
      }
    }
    fillLabShellTargets(targetPos, N);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute("aTargetPos", new THREE.BufferAttribute(targetPos, 3));
    return geo;
  }, []);

  return <>{children(geometry)}</>;
}

export function HeroScene({
  scrollProgress = 0,
  labReveal = 0,
}: {
  scrollProgress?: number;
  labReveal?: number;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 min-h-[100dvh] w-full">
      <Canvas
        className="block h-full min-h-[100dvh] w-full"
        style={{ display: "block", width: "100%", height: "100%", minHeight: "100dvh" }}
        camera={{
          position: [0, 32, 14],
          fov: 65,
          near: 0.05,
          far: 150,
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
        <WaveGeometryProvider>
          {(waveGeo) => (
            <HeroDrive scrollProgress={scrollProgress} labReveal={labReveal} waveGeometry={waveGeo} />
          )}
        </WaveGeometryProvider>
      </Canvas>
    </div>
  );
}
