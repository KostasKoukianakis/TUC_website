/// <reference lib="webworker" />

import * as THREE from "three";

type BuildRequest = {
  type: "build";
  totalPoints: number;
  seed?: number;
};

type BuildProgress = {
  type: "progress";
  phase: "build-meshes" | "areas" | "sample" | "finalize";
  done: number;
  total: number;
};

type BuildResult = {
  type: "result";
  position: ArrayBuffer;
  color: ArrayBuffer;
  size: ArrayBuffer;
  reveal: ArrayBuffer;
  count: number;
};

// Room constants (must match `HeroScene.tsx` lab shell / fly path for the same look)
const RW = 28;
const RD = 18;
const CH = 3.2;
const hw = RW / 2;
const hd = RD / 2;
const DH = 0.74;
const DTH = 0.045;
const LEG = 0.06;

function postProgress(
  phase: BuildProgress["phase"],
  done: number,
  total: number,
) {
  (self as unknown as DedicatedWorkerGlobalScope).postMessage({
    type: "progress",
    phase,
    done,
    total,
  } satisfies BuildProgress);
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function mkMeshBuilders(meshes: THREE.Mesh[], rand: () => number) {
  const MAT = new THREE.MeshLambertMaterial({ color: 0x1a1c20 });

  function segPlane(n: number, den: number) {
    return Math.max(4, Math.round(n * 6 * den));
  }

  function segBox(n: number, b: number, den: number) {
    return Math.max(2, Math.round(n * b * den));
  }

  function mkPlane(
    w: number,
    d: number,
    x: number,
    y: number,
    z: number,
    rx = 0,
    ry = 0,
    den = 1,
  ) {
    const geo = new THREE.PlaneGeometry(w, d, segPlane(w, den), segPlane(d, den));
    const m = new THREE.Mesh(geo, MAT);
    m.position.set(x, y, z);
    m.rotation.x = rx;
    m.rotation.y = ry;
    m.updateMatrixWorld(true);
    meshes.push(m);
  }

  function mkBox(
    w: number,
    h: number,
    d: number,
    x: number,
    y: number,
    z: number,
    ry = 0,
    den = 1,
  ) {
    const geo = new THREE.BoxGeometry(
      w,
      h,
      d,
      segBox(w, 5, den),
      segBox(h, 5, den),
      segBox(d, 5, den),
    );
    const m = new THREE.Mesh(geo, MAT);
    m.position.set(x, y, z);
    m.rotation.y = ry;
    m.updateMatrixWorld(true);
    meshes.push(m);
  }

  function mkCyl(
    rt: number,
    rb: number,
    h: number,
    segs: number,
    hsegs: number,
    x: number,
    y: number,
    z: number,
    ry = 0,
  ) {
    const geo = new THREE.CylinderGeometry(rt, rb, h, segs, hsegs);
    const m = new THREE.Mesh(geo, MAT);
    m.position.set(x, y, z);
    m.rotation.y = ry;
    m.updateMatrixWorld(true);
    meshes.push(m);
  }

  function mkShelf(x: number, y: number, z: number, w: number, h: number, d: number, ry = 0) {
    mkBox(w, h, d, x, y + h / 2, z, ry, 2);
    const boards = Math.max(2, Math.floor(h / 0.38));
    for (let i = 0; i <= boards; i++) {
      const by = y + (h / boards) * i;
      mkBox(w - 0.06, 0.028, d - 0.06, x, by, z, ry, 1);
    }
    for (let i = 0; i < boards; i++) {
      const by = y + (h / boards) * i + 0.014;
      const nx = Math.round((w - 0.1) / 0.085);
      for (let b = 0; b < nx; b++) {
        const bh = 0.18 + rand() * 0.12;
        const bx = -w / 2 + 0.05 + b * 0.085 + 0.04;
        mkBox(
          0.065,
          bh,
          d * 0.7,
          x + bx * Math.cos(ry),
          by + bh / 2,
          z,
          0,
          1.5,
        );
      }
    }
  }

  function mkDesk(x: number, z: number, w: number, d: number, ry = 0) {
    mkBox(w, DTH, d, x, DH, z, ry, 2.5);
    mkBox(w - 0.1, 0.35, 0.02, x, DH - 0.2, z + (d / 2 - 0.01) * Math.cos(ry), ry, 1.5);
    const lx = w / 2 - 0.07;
    const lz = d / 2 - 0.07;
    ([[lx, lz], [lx, -lz], [-lx, lz], [-lx, -lz]] as const).forEach(([ox, oz]) => {
      mkBox(
        LEG,
        DH - DTH / 2,
        LEG,
        x + ox * Math.cos(ry) - oz * Math.sin(ry),
        (DH - DTH / 2) / 2,
        z + ox * Math.sin(ry) + oz * Math.cos(ry),
        ry,
        1,
      );
    });
    mkBox(
      0.42,
      0.52,
      0.55,
      x + (w / 2 - 0.22) * Math.cos(ry),
      DH - 0.26,
      z,
      ry,
      1.5,
    );
  }

  function mkMonitor(x: number, z: number, ry = 0) {
    const dist = 0.32;
    const mx = x + dist * Math.sin(ry);
    const mz = z - dist * Math.cos(ry);
    mkBox(0.56, 0.34, 0.025, mx, DH + 0.22, mz, ry, 2);
    mkBox(0.6, 0.38, 0.018, mx, DH + 0.22, mz + 0.005 * Math.cos(ry), ry, 1.5);
    mkCyl(0.018, 0.022, 0.18, 8, 2, mx, DH + 0.09, mz, ry);
    mkBox(0.2, 0.016, 0.15, mx, DH + 0.008, mz + 0.04 * Math.cos(ry), ry, 1);
  }

  function mkChair(x: number, z: number, ry = 0) {
    mkBox(0.48, 0.06, 0.48, x, 0.46, z, ry, 2);
    mkBox(0.44, 0.52, 0.06, x, 0.74, z - 0.22 * Math.cos(ry), ry, 2);
    mkBox(0.28, 0.22, 0.04, x, 0.6, z - 0.23 * Math.cos(ry), ry, 1.5);
    [-1, 1].forEach((side) => {
      mkBox(0.05, 0.18, 0.3, x + side * 0.24 * Math.cos(ry), 0.6, z + 0.02, ry, 1);
    });
    mkCyl(0.028, 0.038, 0.3, 8, 2, x, 0.3, z, ry);
    for (let i = 0; i < 5; i++) {
      const ang = ry + (i / 5) * Math.PI * 2;
      mkBox(0.32, 0.03, 0.055, x + Math.sin(ang) * 0.16, 0.03, z + Math.cos(ang) * 0.16, ang, 1);
    }
    for (let i = 0; i < 5; i++) {
      const ang = ry + (i / 5) * Math.PI * 2;
      mkBox(0.06, 0.04, 0.04, x + Math.sin(ang) * 0.3, 0.02, z + Math.cos(ang) * 0.3, ang, 1);
    }
  }

  return {
    MAT,
    mkPlane,
    mkBox,
    mkCyl,
    mkShelf,
    mkDesk,
    mkMonitor,
    mkChair,
  };
}

type MeshSampler = {
  mesh: THREE.Mesh;
  posAttr: THREE.BufferAttribute;
  index: THREE.BufferAttribute | null;
  cdf: Float32Array;
  totalArea: number;
  faceCount: number;
};

function buildSamplerForMesh(mesh: THREE.Mesh): MeshSampler {
  const geo = mesh.geometry as THREE.BufferGeometry;
  const mw = mesh.matrixWorld;
  const pa = geo.attributes.position as THREE.BufferAttribute;
  const ix = geo.index ? (geo.index as unknown as THREE.BufferAttribute) : null;
  const fc = ix ? ix.count / 3 : pa.count / 3;

  const va = new THREE.Vector3();
  const vb = new THREE.Vector3();
  const vc = new THREE.Vector3();
  const cdf = new Float32Array(fc);
  let total = 0;

  for (let i = 0; i < fc; i++) {
    const ia = ix ? ix.getX(i * 3) : i * 3;
    const ib = ix ? ix.getX(i * 3 + 1) : i * 3 + 1;
    const ic = ix ? ix.getX(i * 3 + 2) : i * 3 + 2;
    va.fromBufferAttribute(pa, ia).applyMatrix4(mw);
    vb.fromBufferAttribute(pa, ib).applyMatrix4(mw);
    vc.fromBufferAttribute(pa, ic).applyMatrix4(mw);
    total += new THREE.Triangle(va, vb, vc).getArea();
    cdf[i] = total;
  }

  return { mesh, posAttr: pa, index: ix, cdf, totalArea: total, faceCount: fc };
}

function pickFaceIndex(cdf: Float32Array, r: number) {
  // lower_bound
  let lo = 0;
  let hi = cdf.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (cdf[mid] >= r) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}

function samplePointOnMesh(
  sampler: MeshSampler,
  rand: () => number,
  out: THREE.Vector3,
  va: THREE.Vector3,
  vb: THREE.Vector3,
  vc: THREE.Vector3,
) {
  const r = rand() * sampler.totalArea;
  const fi = pickFaceIndex(sampler.cdf, r);
  const ix = sampler.index;
  const pa = sampler.posAttr;
  const mw = sampler.mesh.matrixWorld;

  const ia = ix ? ix.getX(fi * 3) : fi * 3;
  const ib = ix ? ix.getX(fi * 3 + 1) : fi * 3 + 1;
  const ic = ix ? ix.getX(fi * 3 + 2) : fi * 3 + 2;

  va.fromBufferAttribute(pa, ia).applyMatrix4(mw);
  vb.fromBufferAttribute(pa, ib).applyMatrix4(mw);
  vc.fromBufferAttribute(pa, ic).applyMatrix4(mw);

  const r1 = Math.sqrt(rand());
  const r2 = rand();
  out.set(
    (1 - r1) * va.x + r1 * (1 - r2) * vb.x + r1 * r2 * vc.x,
    (1 - r1) * va.y + r1 * (1 - r2) * vb.y + r1 * r2 * vc.y,
    (1 - r1) * va.z + r1 * (1 - r2) * vb.z + r1 * r2 * vc.z,
  );
}

(self as unknown as DedicatedWorkerGlobalScope).onmessage = (ev: MessageEvent<BuildRequest>) => {
  const msg = ev.data;
  if (!msg || msg.type !== "build") return;

  const totalPoints = msg.totalPoints;
  const seed = typeof msg.seed === "number" ? msg.seed : (Date.now() & 0xffffffff);
  const rand = mulberry32(seed);

  // 1) Build procedural "lab" meshes (CPU-only)
  postProgress("build-meshes", 0, 1);
  const meshes: THREE.Mesh[] = [];
  const b = mkMeshBuilders(meshes, rand);

  // Full lab build: mirror the original procedural layout so silhouettes match.
  b.mkPlane(RW, RD, 0, 0, 0, -Math.PI / 2, 0, 3);
  b.mkPlane(RW, RD, 0, CH, 0, Math.PI / 2, 0, 2);
  b.mkBox(RW, CH, 0.2, 0, CH / 2, -hd, 0, 2);
  b.mkBox(5.5, CH, 0.2, -11.25, CH / 2, hd, 0, 2);
  b.mkBox(12, CH, 0.2, 0, CH / 2, hd, 0, 2);
  b.mkBox(4, CH, 0.2, 12, CH / 2, hd, 0, 2);
  b.mkBox(3, 0.3, 0.2, -8.5, CH - 0.15, hd, 0, 2);
  b.mkBox(4, 0.3, 0.2, 12, CH - 0.15, hd, 0, 2);
  b.mkBox(0.2, CH, RD, -hw, CH / 2, 0, 0, 2);
  b.mkBox(0.2, CH, RD, hw, CH / 2, 0, 0, 2);
  b.mkBox(4, 0.12, 0.25, -5.5, 2.1, -hd + 0.12, 0, 1.5);
  b.mkBox(4, 0.12, 0.25, -5.5, CH - 0.6, -hd + 0.12, 0, 1.5);
  b.mkBox(0.12, 1.5, 0.25, -3.6, 1.45, -hd + 0.12, 0, 1.5);
  b.mkBox(0.12, 1.5, 0.25, -7.4, 1.45, -hd + 0.12, 0, 1.5);
  b.mkBox(4, 0.12, 0.25, 6, 2.1, -hd + 0.12, 0, 1.5);
  b.mkBox(4, 0.12, 0.25, 6, CH - 0.6, -hd + 0.12, 0, 1.5);
  b.mkBox(0.12, 1.5, 0.25, 7.9, 1.45, -hd + 0.12, 0, 1.5);
  b.mkBox(0.12, 1.5, 0.25, 4.1, 1.45, -hd + 0.12, 0, 1.5);
  b.mkBox(10, CH, 0.15, -9, CH / 2, -1, 0, 1.5);

  b.mkShelf(-4.5, 0, -7.5, 0.4, 2.2, 3, 0);
  b.mkShelf(4.5, 0, -7.5, 0.4, 2.2, 3, 0);
  b.mkShelf(12.8, 0, 7, 2, 2, 1.2, 0);
  b.mkShelf(-13.5, 0, -6.5, 0.4, 2.2, 3.5, 0);
  b.mkShelf(-13.5, 0, -1.5, 0.4, 2.2, 3.5, 0);
  b.mkShelf(-13.5, 0, 4, 0.4, 2.2, 3.5, 0);

  b.mkDesk(-12, -7, 1.5, 0.75, 0);
  b.mkMonitor(-12.22, -7, 0);
  b.mkMonitor(-11.78, -7, 0);
  b.mkChair(-12, -6.55, Math.PI);
  b.mkDesk(-12, -4.5, 1.5, 0.75, 0);
  b.mkMonitor(-12.22, -4.5, 0);
  b.mkMonitor(-11.78, -4.5, 0);
  b.mkChair(-12, -4.05, Math.PI);
  b.mkDesk(-9.5, -7, 1.5, 0.75, 0);
  b.mkMonitor(-9.72, -7, 0);
  b.mkMonitor(-9.28, -7, 0);
  b.mkChair(-9.5, -6.55, Math.PI);
  b.mkDesk(-9.5, -4.5, 1.5, 0.75, 0);
  b.mkMonitor(-9.72, -4.5, 0);
  b.mkMonitor(-9.28, -4.5, 0);
  b.mkChair(-9.5, -4.05, Math.PI);
  b.mkDesk(-6, 2, 1.5, 0.75, 0);
  b.mkMonitor(-6.22, 2, 0);
  b.mkMonitor(-5.78, 2, 0);
  b.mkChair(-6, 2.45, 0);
  b.mkDesk(-3.5, 2, 1.5, 0.75, 0);
  b.mkMonitor(-3.72, 2, 0);
  b.mkMonitor(-3.28, 2, 0);
  b.mkChair(-3.5, 2.45, 0);

  // Meeting table + chairs (the "table with chairs" you mentioned)
  b.mkDesk(1.5, 4.5, 4.5, 1.1, 0);
  b.mkChair(0, 4.5, Math.PI / 2);
  b.mkChair(1.5, 5.12, Math.PI);
  b.mkChair(3, 4.5, -Math.PI / 2);
  b.mkChair(1.5, 3.88, 0);

  b.mkDesk(9, -6.5, 1.5, 0.75, 0);
  b.mkMonitor(8.78, -6.5, 0);
  b.mkMonitor(9.22, -6.5, 0);
  b.mkChair(9, -6, Math.PI);
  b.mkDesk(11.5, -6.5, 1.5, 0.75, 0);
  b.mkMonitor(11.28, -6.5, 0);
  b.mkMonitor(11.72, -6.5, 0);
  b.mkChair(11.5, -6, Math.PI);
  b.mkDesk(9, -3.5, 1.5, 0.75, Math.PI);
  b.mkMonitor(8.78, -3.5, Math.PI);
  b.mkMonitor(9.22, -3.5, Math.PI);
  b.mkChair(9, -4, 0);
  b.mkDesk(11.5, -3.5, 1.5, 0.75, Math.PI);
  b.mkMonitor(11.28, -3.5, Math.PI);
  b.mkMonitor(11.72, -3.5, Math.PI);
  b.mkChair(11.5, -4, 0);

  ([
    [-8, -7],
    [-8, -3],
    [-8, 1],
    [0, -5],
    [0, 0],
    [0, 5],
    [8, -7],
    [8, -3],
    [8, 1],
  ] as const).forEach(([x, z]) => {
    b.mkBox(0.14, 0.06, 1.2, x, CH - 0.04, z, 0, 2);
    b.mkBox(0.12, 0.025, 1, x, CH - 0.05, z, 0, 1.5);
  });
  b.mkBox(25, 0.06, 0.1, 0, CH - 0.12, 0, 0, 1.5);
  b.mkBox(0.1, 0.06, 15, -5, CH - 0.12, 0, 0, 1.5);
  b.mkBox(0.06, 0.04, 17.5, -hw + 0.14, 2.8, 0, 0, 1);
  b.mkBox(0.06, 0.04, 17.5, hw - 0.14, 2.8, 0, 0, 1);

  // Frames / board / glass panels (these affect dot silhouettes)
  b.mkBox(0.1, CH, 0.25, -10.25, CH / 2, hd, 0, 1.5);
  b.mkBox(0.1, CH, 0.25, -6.75, CH / 2, hd, 0, 1.5);
  b.mkBox(3.5, 0.12, 0.25, -8.5, CH - 0.06, hd, 0, 1.5);
  b.mkBox(1.55, 2.45, 0.045, -9.2, 1.275, hd - 0.4, -0.28, 1.5);
  b.mkBox(1.55, 2.45, 0.045, -7.8, 1.275, hd - 0.4, 0.28, 1.5);
  b.mkBox(0.1, CH, 0.25, 10.1, CH / 2, hd, 0, 1.5);
  b.mkBox(0.1, CH, 0.25, hw, CH / 2, hd, 0, 1.5);
  b.mkBox(4, 0.12, 0.25, 12, CH - 0.06, hd, 0, 1.5);
  b.mkBox(3.8, 2.45, 0.05, 10.3, 1.275, hd - 1.9, 0, 1.5);

  b.mkBox(3.8, 1.4, 0.06, -5.5, 1.6, -hd + 0.1, 0, 1.8);
  b.mkBox(3.8, 1.4, 0.06, 6, 1.6, -hd + 0.1, 0, 1.8);
  b.mkBox(0.06, 1.4, 0.07, -5.5, 1.6, -hd + 0.1, 0, 1.5);
  b.mkBox(0.06, 1.4, 0.07, 6, 1.6, -hd + 0.1, 0, 1.5);
  b.mkBox(3.8, 0.06, 0.07, -5.5, 1.6, -hd + 0.1, 0, 1.5);
  b.mkBox(3.8, 0.06, 0.07, 6, 1.6, -hd + 0.1, 0, 1.5);

  for (let xi = -6; xi <= 6; xi++) b.mkBox(RW, 0.012, 0.012, 0, CH - 0.01, xi * 1.2, 0, 1);
  for (let zi = -7; zi <= 7; zi++) b.mkBox(0.012, 0.012, RD, 0, CH - 0.01, 0, 0, 1);

  // Board assembly (whiteboard area)
  b.mkBox(4.8, 1.6, 0.032, 0, 2, -hd + 0.1, 0, 2.5);
  b.mkBox(5, 1.72, 0.025, 0, 2, -hd + 0.115, 0, 1.8);
  b.mkBox(5, 0.06, 0.04, 0, 2.82, -hd + 0.12, 0, 1.5);
  b.mkBox(5, 0.06, 0.04, 0, 1.16, -hd + 0.12, 0, 1.5);
  b.mkBox(0.06, 1.72, 0.04, -2.5, 2, -hd + 0.12, 0, 1.5);
  b.mkBox(0.06, 1.72, 0.04, 2.5, 2, -hd + 0.12, 0, 1.5);
  b.mkBox(4.8, 0.05, 0.14, 0, 1.13, -hd + 0.17, 0, 1.5);
  b.mkBox(4.8, 0.06, 0.02, 0, 1.1, -hd + 0.23, 0, 1.5);
  [-1.6, -0.8, 0, 0.8].forEach((mx) =>
    b.mkCyl(0.012, 0.012, 0.13, 8, 2, mx, 1.175, -hd + 0.17, Math.PI / 2),
  );
  b.mkBox(0.14, 0.04, 0.055, 1.6, 1.175, -hd + 0.18, 0, 1.5);
  b.mkBox(0.06, 0.18, 0.08, -2.2, 1.06, -hd + 0.13, 0, 1.5);
  b.mkBox(0.06, 0.18, 0.08, 2.2, 1.06, -hd + 0.13, 0, 1.5);

  // Small props / base trims
  b.mkBox(0.52, 0.55, 0.48, -2, 0.275, -0.5, 0, 2);
  b.mkBox(0.52, 0.06, 0.48, -2, 0.58, -0.5, 0, 1.5);
  b.mkBox(0.45, 0.3, 0.42, -2, 0.85, -0.5, 0, 1.5);
  b.mkCyl(0.12, 0.1, 0.28, 10, 2, -11, 0.14, -6.1, 0);
  b.mkCyl(0.12, 0.1, 0.28, 10, 2, 9.5, 0.14, -5.7, 0);
  b.mkBox(1.1, 0.3, 0.2, 0, 2.85, -hd + 0.15, 0, 2);
  b.mkBox(0.06, 0.18, 0.22, 0.55, 2.88, -hd + 0.2, 0, 1.5);
  b.mkBox(0.06, 0.18, 0.22, -0.55, 2.88, -hd + 0.2, 0, 1.5);
  for (let i = 0; i < 5; i++) b.mkBox(0.06, 0.06, 0.1, -hw + 0.14, 1.8, -6 + i * 1.2, 0, 1.5);
  b.mkBox(RW, 0.1, 0.03, 0, 0.05, -hd + 0.015, 0, 1);
  b.mkBox(RW, 0.1, 0.03, 0, 0.05, hd - 0.015, 0, 1);
  b.mkBox(0.03, 0.1, RD, -hw + 0.015, 0.05, 0, 0, 1);
  b.mkBox(0.03, 0.1, RD, hw - 0.015, 0.05, 0, 0, 1);

  postProgress("build-meshes", 1, 1);

  // 2) Build per-mesh samplers + global weights
  postProgress("areas", 0, meshes.length);
  const samplers = new Array<MeshSampler>(meshes.length);
  let totalArea = 0;
  for (let i = 0; i < meshes.length; i++) {
    const s = buildSamplerForMesh(meshes[i]);
    samplers[i] = s;
    totalArea += s.totalArea;
    postProgress("areas", i + 1, meshes.length);
  }

  // 3) Allocate buffers and fill them directly
  postProgress("sample", 0, totalPoints);
  const pos = new Float32Array(totalPoints * 3);
  const col = new Float32Array(totalPoints * 3);
  const sz = new Float32Array(totalPoints);
  const reveal = new Float32Array(totalPoints);

  // Build per-mesh counts (stable distribution)
  const counts = samplers.map((s) => Math.max(10, Math.round(totalPoints * (s.totalArea / totalArea))));
  // Ensure exact totalPoints (adjust last sampler)
  const sum = counts.reduce((a, b) => a + b, 0);
  counts[counts.length - 1] += totalPoints - sum;

  const p = new THREE.Vector3();
  const va = new THREE.Vector3();
  const vb = new THREE.Vector3();
  const vc = new THREE.Vector3();
  let outIdx = 0;
  for (let mi = 0; mi < samplers.length; mi++) {
    const sampler = samplers[mi];
    const cnt = counts[mi];
    for (let i = 0; i < cnt; i++) {
      samplePointOnMesh(sampler, rand, p, va, vb, vc);

      const base = outIdx * 3;
      pos[base + 0] = p.x;
      pos[base + 1] = p.y;
      pos[base + 2] = p.z;

      const depth = Math.max(0, Math.min(1, (p.z + hd) / (hd * 2)));
      const ht = Math.max(0, Math.min(1, p.y / CH));
      const eyeLvl = 1 - Math.abs(ht - 0.5) * 1.6;
      const edgeX = Math.abs(p.x) / hw;
      const edgeZ = Math.abs(p.z) / hd;
      const edge = Math.pow(Math.max(edgeX, edgeZ), 1.4);
      const floorDark = Math.pow(Math.max(0, 1 - p.y / 0.18), 2) * 0.3;
      const ceilDark = Math.pow(Math.max(0, (p.y - (CH - 0.25)) / 0.25), 2) * 0.2;
      const jit = (rand() - 0.5) * 0.22;
      // Brightness tuning: keep depth/eye-level cues but lift the overall exposure
      // so dots read clearly even on darker displays.
      let bri =
        0.34 +
        depth * 0.34 +
        eyeLvl * 0.42 -
        edge * 0.12 -
        floorDark * 0.85 -
        ceilDark * 0.75 +
        jit;
      bri = Math.max(0.12, Math.min(1, bri));
      col[base + 0] = bri;
      col[base + 1] = bri;
      col[base + 2] = bri;
      sz[outIdx] = 1.4 + rand() * 0.6;
      // Progressive reveal rank in [0,1]:
      // lower rank -> appears earlier.
      // Prioritize structural lab cues first (edges, board wall, key height bands),
      // then fill volumetrically with stochastic detail.
      const nx = Math.min(1, Math.abs(p.x) / hw);
      const nz = Math.min(1, Math.abs(p.z) / hd);
      const edgeProx = Math.max(nx, nz); // near room boundaries

      const floorBand = Math.exp(-Math.pow((p.y - 0.06) / 0.07, 2));
      const deskBand = Math.exp(-Math.pow((p.y - DH) / 0.18, 2));
      const boardBand = Math.exp(-Math.pow((p.y - 2.0) / 0.55, 2));
      const ceilBand = Math.exp(-Math.pow((p.y - (CH - 0.08)) / 0.09, 2));
      const heightBand = Math.max(floorBand, deskBand, boardBand, ceilBand);

      // Whiteboard wall (back wall) receives early priority.
      const boardWallProx = Math.exp(-Math.pow((p.z - (-hd + 0.12)) / 0.25, 2));

      // Spread early points across space to avoid clumping.
      const qx = Math.floor((p.x + hw) * 2.2);
      const qy = Math.floor(p.y * 5.0);
      const qz = Math.floor((p.z + hd) * 2.2);
      const cellHashSeed = qx * 73856093 + qy * 19349663 + qz * 83492791;
      const cellHash = ((Math.sin(cellHashSeed) * 43758.5453123) % 1 + 1) % 1;

      const structural =
        edgeProx * 0.5 +
        boardWallProx * 0.25 +
        heightBand * 0.22 +
        (1 - Math.abs((p.x / hw) * 0.6)) * 0.03;

      const rawNoise =
        ((Math.sin(
          p.x * 12.9898 + p.y * 78.233 + p.z * 37.719 + (outIdx % 97) * 0.1234,
        ) *
          43758.5453123) %
          1 +
          1) %
        1;

      const noise = 0.5 * rawNoise + 0.5 * cellHash;
      const priority = Math.max(0, Math.min(1, structural));
      // Strongly bias early reveal toward structural points so the initial shape
      // reads as a clear lab scaffold instead of an abstract cloud.
      let rank: number;
      if (priority > 0.78) {
        rank = noise * 0.08; // very early
      } else if (priority > 0.62) {
        rank = 0.08 + noise * 0.16; // early
      } else if (priority > 0.48) {
        rank = 0.24 + noise * 0.2; // mid
      } else {
        rank = 0.44 + noise * 0.56; // late fill
      }
      reveal[outIdx] = Math.max(0, Math.min(1, rank));

      outIdx++;
      if ((outIdx & 8191) === 0) postProgress("sample", outIdx, totalPoints);
    }
  }

  postProgress("finalize", 1, 1);

  // 4) Return transferables
  const result: BuildResult = {
    type: "result",
    position: pos.buffer,
    color: col.buffer,
    size: sz.buffer,
    reveal: reveal.buffer,
    count: totalPoints,
  };

  (self as unknown as DedicatedWorkerGlobalScope).postMessage(result, [
    result.position,
    result.color,
    result.size,
    result.reveal,
  ]);
};

