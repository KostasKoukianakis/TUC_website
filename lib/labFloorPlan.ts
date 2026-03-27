import * as THREE from "three";

/** Room from reference HTML: 28×18 m, ceiling 3.2 m */
export const RW = 28;
export const RD = 18;
export const CH = 3.2;
export const hw = RW / 2;
export const hd = RD / 2;

const DH = 0.74;
const DTH = 0.045;
const LEG = 0.06;

function eio(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function createSeededRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Camera path (same as reference): outside → inside → whiteboard */
export const CAMERA_PATH: { p: [number, number, number]; l: [number, number, number] }[] = [
  { p: [10, 2.2, 16], l: [0, 1.6, 4] },
  { p: [8, 1.8, 10], l: [0, 1.55, 2] },
  { p: [2, 1.7, 4], l: [-2, 1.55, -2] },
  { p: [-3, 1.65, -1], l: [-1, 1.55, -7] },
  { p: [0, 1.62, -5.5], l: [0, 1.9, -9] },
];

export function sampleCameraAlongPath(t: number) {
  const tt = Math.min(Math.max(t, 0), 0.9999);
  const n = CAMERA_PATH.length - 1;
  const segFloat = tt * n;
  const si = Math.min(Math.floor(segFloat), n - 1);
  const st = eio(segFloat - si);
  const ca = CAMERA_PATH[si];
  const cb = CAMERA_PATH[si + 1];
  const pos = new THREE.Vector3(
    ca.p[0] + (cb.p[0] - ca.p[0]) * st,
    ca.p[1] + (cb.p[1] - ca.p[1]) * st,
    ca.p[2] + (cb.p[2] - ca.p[2]) * st,
  );
  const look = new THREE.Vector3(
    ca.l[0] + (cb.l[0] - ca.l[0]) * st,
    ca.l[1] + (cb.l[1] - ca.l[1]) * st,
    ca.l[2] + (cb.l[2] - ca.l[2]) * st,
  );
  return { pos, look };
}

const MAT = {
  wall: 0x1a1c20,
  desk: 0x14100c,
  shelf: 0x0e1208,
  chair: 0x0d0f14,
  monitor: 0x080a0d,
  screen: 0x060d18,
  metal: 0x111318,
  board: 0x1c1f1a,
  frame: 0x0f1011,
  glass: 0x0a1520,
  prop: 0x0e0f12,
};

function mkPlane(
  group: THREE.Group,
  meshes: THREE.Mesh[],
  w: number,
  d: number,
  x: number,
  y: number,
  z: number,
  rx: number,
  ry: number,
  mat: THREE.Material,
  seg = 8,
) {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(w, d, seg, seg),
    mat,
  );
  m.position.set(x, y, z);
  m.rotation.x = rx;
  m.rotation.y = ry;
  m.updateMatrixWorld(true);
  group.add(m);
  meshes.push(m);
}

function mkBox(
  group: THREE.Group,
  meshes: THREE.Mesh[],
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  ry = 0,
  mat: THREE.Material,
) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.rotation.y = ry;
  m.updateMatrixWorld(true);
  group.add(m);
  meshes.push(m);
}

function mkCyl(
  group: THREE.Group,
  meshes: THREE.Mesh[],
  rt: number,
  rb: number,
  h: number,
  segs: number,
  x: number,
  y: number,
  z: number,
  ry: number,
  mat: THREE.Material,
) {
  const m = new THREE.Mesh(
    new THREE.CylinderGeometry(rt, rb, h, segs, 1),
    mat,
  );
  m.position.set(x, y, z);
  m.rotation.y = ry;
  m.updateMatrixWorld(true);
  group.add(m);
  meshes.push(m);
}

function solid(hex: number, transparent = false, opacity = 1) {
  return new THREE.MeshBasicMaterial({
    color: hex,
    transparent,
    opacity,
  });
}

/**
 * Full lab geometry for triangle-area point sampling only (solid materials, disposed after sampling).
 * Visible textured floor: {@link createTexturedFloorMesh}.
 */
export function buildLabSamplingMeshes(): THREE.Mesh[] {
  const group = new THREE.Group();
  const meshes: THREE.Mesh[] = [];

  // Floor — same footprint as textured floor; solid mesh for sampling only
  mkPlane(group, meshes, RW, RD, 0, 0, 0, -Math.PI / 2, 0, solid(MAT.wall), 12);

  // Ceiling
  mkPlane(
    group,
    meshes,
    RW,
    RD,
    0,
    CH,
    0,
    Math.PI / 2,
    0,
    solid(MAT.wall),
    8,
  );

  // Back wall
  mkBox(group, meshes, RW, CH, 0.2, 0, CH / 2, -hd, 0, solid(MAT.wall));

  // Front wall segments
  mkBox(group, meshes, 5.5, CH, 0.2, -11.25, CH / 2, hd, 0, solid(MAT.wall));
  mkBox(group, meshes, 12, CH, 0.2, 0, CH / 2, hd, 0, solid(MAT.wall));
  mkBox(group, meshes, 4, CH, 0.2, 12, CH / 2, hd, 0, solid(MAT.wall));
  mkBox(group, meshes, 3, 0.3, 0.2, -8.5, CH - 0.15, hd, 0, solid(MAT.wall));
  mkBox(group, meshes, 4, 0.3, 0.2, 12, CH - 0.15, hd, 0, solid(MAT.wall));

  // Side walls
  mkBox(group, meshes, 0.2, CH, RD, -hw, CH / 2, 0, 0, solid(MAT.wall));
  mkBox(group, meshes, 0.2, CH, RD, hw, CH / 2, 0, 0, solid(MAT.wall));

  // Internal dividing wall
  mkBox(group, meshes, 10, CH, 0.15, -9, CH / 2, -1, 0, solid(MAT.wall));

  // Shelves (simplified)
  function shelf(x: number, y: number, z: number, w: number, h: number, d: number, ry = 0) {
    mkBox(group, meshes, w, h, d, x, y + h / 2, z, ry, solid(MAT.shelf));
  }
  shelf(-4.5, 0, -7.5, 0.4, 2.2, 3.0, 0);
  shelf(4.5, 0, -7.5, 0.4, 2.2, 3.0, 0);
  shelf(12.8, 0, 7.0, 2.0, 2.0, 1.2, 0);
  shelf(-13.5, 0, -6.5, 0.4, 2.2, 3.5, 0);
  shelf(-13.5, 0, -1.5, 0.4, 2.2, 3.5, 0);
  shelf(-13.5, 0, 4.0, 0.4, 2.2, 3.5, 0);

  function deskTop(x: number, z: number, w: number, d: number, ry = 0) {
    mkBox(group, meshes, w, DTH, d, x, DH, z, ry, solid(MAT.desk));
    mkBox(
      group,
      meshes,
      w - 0.1,
      0.35,
      0.02,
      x,
      DH - 0.2,
      z + (d / 2 - 0.01) * Math.cos(ry),
      ry,
      solid(MAT.desk),
    );
    const lx = w / 2 - 0.07;
    const lz = d / 2 - 0.07;
    for (const [ox, oz] of [
      [lx, lz],
      [lx, -lz],
      [-lx, lz],
      [-lx, -lz],
    ] as const) {
      mkBox(
        group,
        meshes,
        LEG,
        DH - DTH / 2,
        LEG,
        x + ox * Math.cos(ry) - oz * Math.sin(ry),
        (DH - DTH / 2) / 2,
        z + ox * Math.sin(ry) + oz * Math.cos(ry),
        ry,
        solid(MAT.metal),
      );
    }
  }

  function monitorScreen(x: number, z: number, ry = 0) {
    const dist = 0.32;
    const mx = x + dist * Math.sin(ry);
    const mz = z - dist * Math.cos(ry);
    mkBox(group, meshes, 0.56, 0.34, 0.025, mx, DH + 0.22, mz, ry, solid(MAT.screen));
    mkBox(
      group,
      meshes,
      0.6,
      0.38,
      0.018,
      mx,
      DH + 0.22,
      mz + 0.005 * Math.cos(ry),
      ry,
      solid(MAT.monitor),
    );
  }

  function chair(x: number, z: number, ry = 0) {
    mkBox(group, meshes, 0.48, 0.06, 0.48, x, 0.46, z, ry, solid(MAT.chair));
    mkBox(
      group,
      meshes,
      0.44,
      0.52,
      0.06,
      x,
      0.74,
      z - 0.22 * Math.cos(ry),
      ry,
      solid(MAT.chair),
    );
    mkCyl(group, meshes, 0.028, 0.038, 0.3, 8, x, 0.3, z, ry, solid(MAT.metal));
  }

  // Desks + monitors + chairs (from reference)
  deskTop(-12, -7.0, 1.5, 0.75, 0);
  monitorScreen(-12.22, -7.0, 0);
  monitorScreen(-11.78, -7.0, 0);
  chair(-12, -6.55, Math.PI);

  deskTop(-12, -4.5, 1.5, 0.75, 0);
  monitorScreen(-12.22, -4.5, 0);
  monitorScreen(-11.78, -4.5, 0);
  chair(-12, -4.05, Math.PI);

  deskTop(-9.5, -7.0, 1.5, 0.75, 0);
  monitorScreen(-9.72, -7.0, 0);
  monitorScreen(-9.28, -7.0, 0);
  chair(-9.5, -6.55, Math.PI);

  deskTop(-9.5, -4.5, 1.5, 0.75, 0);
  monitorScreen(-9.72, -4.5, 0);
  monitorScreen(-9.28, -4.5, 0);
  chair(-9.5, -4.05, Math.PI);

  deskTop(-6, 2.0, 1.5, 0.75, 0);
  monitorScreen(-6.22, 2.0, 0);
  monitorScreen(-5.78, 2.0, 0);
  chair(-6, 2.45, 0);

  deskTop(-3.5, 2.0, 1.5, 0.75, 0);
  monitorScreen(-3.72, 2.0, 0);
  monitorScreen(-3.28, 2.0, 0);
  chair(-3.5, 2.45, 0);

  deskTop(1.5, 4.5, 4.5, 1.1, 0);
  chair(0, 4.5, Math.PI / 2);
  chair(1.5, 5.12, Math.PI);
  chair(3.0, 4.5, -Math.PI / 2);
  chair(1.5, 3.88, 0);

  deskTop(9, -6.5, 1.5, 0.75, 0);
  monitorScreen(8.78, -6.5, 0);
  monitorScreen(9.22, -6.5, 0);
  chair(9, -6.0, Math.PI);

  deskTop(11.5, -6.5, 1.5, 0.75, 0);
  monitorScreen(11.28, -6.5, 0);
  monitorScreen(11.72, -6.5, 0);
  chair(11.5, -6.0, Math.PI);

  deskTop(9, -3.5, 1.5, 0.75, Math.PI);
  monitorScreen(8.78, -3.5, Math.PI);
  monitorScreen(9.22, -3.5, Math.PI);
  chair(9, -4.0, 0);

  deskTop(11.5, -3.5, 1.5, 0.75, Math.PI);
  monitorScreen(11.28, -3.5, Math.PI);
  monitorScreen(11.72, -3.5, Math.PI);
  chair(11.5, -4.0, 0);

  // Whiteboard
  mkBox(group, meshes, 4.8, 1.6, 0.032, 0, 2.0, -hd + 0.1, 0, solid(MAT.board));
  mkBox(group, meshes, 5.0, 1.72, 0.025, 0, 2.0, -hd + 0.115, 0, solid(MAT.frame));

  // Windows (glass)
  mkBox(
    group,
    meshes,
    3.8,
    1.4,
    0.06,
    -5.5,
    1.6,
    -hd + 0.1,
    0,
    solid(MAT.glass, true, 0.35),
  );
  mkBox(
    group,
    meshes,
    3.8,
    1.4,
    0.06,
    6.0,
    1.6,
    -hd + 0.1,
    0,
    solid(MAT.glass, true, 0.35),
  );

  group.updateMatrixWorld(true);
  return meshes;
}

/** Single visible floor plane with lab floor texture (everything else = particles only). */
export function createTexturedFloorMesh(floorMap: THREE.Texture): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(RW, RD, 12, 12);
  const mat = new THREE.MeshBasicMaterial({
    map: floorMap,
    color: 0xffffff,
    toneMapped: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.updateMatrixWorld(true);
  return mesh;
}

export function disposeMeshList(meshes: THREE.Mesh[]) {
  for (const m of meshes) {
    m.geometry.dispose();
    const mat = m.material;
    if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
    else mat.dispose();
  }
}

function sampleMesh(mesh: THREE.Mesh, count: number, random: () => number) {
  const pts: THREE.Vector3[] = [];
  const geo = mesh.geometry;
  const mw = mesh.matrixWorld;
  const pa = geo.getAttribute("position") as THREE.BufferAttribute;
  const ix = geo.index;
  const fc = ix ? ix.count / 3 : pa.count / 3;
  const va = new THREE.Vector3();
  const vb = new THREE.Vector3();
  const vc = new THREE.Vector3();
  const areas = new Float32Array(fc);
  let total = 0;
  for (let i = 0; i < fc; i++) {
    const ia = ix ? ix.getX(i * 3) : i * 3;
    const ib = ix ? ix.getX(i * 3 + 1) : i * 3 + 1;
    const ic = ix ? ix.getX(i * 3 + 2) : i * 3 + 2;
    va.fromBufferAttribute(pa, ia).applyMatrix4(mw);
    vb.fromBufferAttribute(pa, ib).applyMatrix4(mw);
    vc.fromBufferAttribute(pa, ic).applyMatrix4(mw);
    const a = new THREE.Triangle(va, vb, vc).getArea();
    areas[i] = a;
    total += a;
  }
  if (total <= 0) return pts;
  for (let s = 0; s < count; s++) {
    const r = random() * total;
    let cum = 0;
    let fi = 0;
    for (let i = 0; i < fc; i++) {
      cum += areas[i];
      if (cum >= r) {
        fi = i;
        break;
      }
    }
    const ia = ix ? ix.getX(fi * 3) : fi * 3;
    const ib = ix ? ix.getX(fi * 3 + 1) : fi * 3 + 1;
    const ic = ix ? ix.getX(fi * 3 + 2) : fi * 3 + 2;
    va.fromBufferAttribute(pa, ia).applyMatrix4(mw);
    vb.fromBufferAttribute(pa, ib).applyMatrix4(mw);
    vc.fromBufferAttribute(pa, ic).applyMatrix4(mw);
    const r1 = Math.sqrt(random());
    const r2 = random();
    pts.push(
      new THREE.Vector3(
        (1 - r1) * va.x + r1 * (1 - r2) * vb.x + r1 * r2 * vc.x,
        (1 - r1) * va.y + r1 * (1 - r2) * vb.y + r1 * r2 * vc.y,
        (1 - r1) * va.z + r1 * (1 - r2) * vb.z + r1 * r2 * vc.z,
      ),
    );
  }
  return pts;
}

export function buildPointCloudFromMeshes(
  meshes: THREE.Mesh[],
  totalPts: number,
  seed = 0x2f6e2b1,
): THREE.BufferGeometry {
  const random = createSeededRng(seed);
  let totalArea = 0;
  const mAreas: number[] = [];
  const va = new THREE.Vector3();
  const vb = new THREE.Vector3();
  const vc = new THREE.Vector3();

  meshes.forEach((mesh) => {
    const geo = mesh.geometry;
    const mw = mesh.matrixWorld;
    const pa = geo.getAttribute("position") as THREE.BufferAttribute;
    const ix = geo.index;
    const fc = ix ? ix.count / 3 : pa.count / 3;
    let a = 0;
    for (let i = 0; i < fc; i++) {
      const ia = ix ? ix.getX(i * 3) : i * 3;
      const ib = ix ? ix.getX(i * 3 + 1) : i * 3 + 1;
      const ic = ix ? ix.getX(i * 3 + 2) : i * 3 + 2;
      va.fromBufferAttribute(pa, ia).applyMatrix4(mw);
      vb.fromBufferAttribute(pa, ib).applyMatrix4(mw);
      vc.fromBufferAttribute(pa, ic).applyMatrix4(mw);
      a += new THREE.Triangle(va, vb, vc).getArea();
    }
    mAreas.push(a);
    totalArea += a;
  });

  const allPts: THREE.Vector3[] = [];
  meshes.forEach((mesh, mi) => {
    const cnt = Math.max(
      4,
      Math.round(totalPts * (mAreas[mi] / Math.max(totalArea, 1e-6))),
    );
    sampleMesh(mesh, cnt, random).forEach((p) => allPts.push(p));
  });

  const N = allPts.length;
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  const sz = new Float32Array(N);

  for (let i = 0; i < N; i++) {
    const p = allPts[i];
    pos[i * 3] = p.x;
    pos[i * 3 + 1] = p.y;
    pos[i * 3 + 2] = p.z;

    const ht = Math.max(0, Math.min(1, p.y / CH));
    const edgeX = Math.abs(p.x) / hw;
    const edgeZ = Math.abs(p.z) / hd;
    const edge = Math.max(edgeX, edgeZ);
    const horizon = 1 - Math.abs(ht - 0.45) * 1.8;
    const jit = (random() - 0.5) * 0.08;
    let bri =
      0.1 + ht * 0.28 + horizon * 0.55 - edge * 0.1 + jit;
    bri = Math.max(0.08, Math.min(1.0, bri));
    const warmth = Math.max(0, 0.5 - p.y / CH);
    col[i * 3] = bri * (0.82 + warmth * 0.08);
    col[i * 3 + 1] = bri * (0.86 + ht * 0.04);
    col[i * 3 + 2] = bri * (0.94 + ht * 0.06);
    sz[i] = 0.35 + random() * 0.85;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  geo.setAttribute("aSize", new THREE.BufferAttribute(sz, 1));
  return geo;
}
