"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type Props = {
  opacity: number;
  progress: number;
};

const RW = 28;
const RD = 18;
const CH = 3.2;
const hw = RW / 2;
const hd = RD / 2;
const DH = 0.74;
const DTH = 0.045;
const LEG = 0.06;

function eio(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function lv(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function disposeMaterial(mat: THREE.Material | THREE.Material[]) {
  if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
  else mat.dispose();
}

export function HeroLabDotScene({ opacity, progress }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(progress);

  progressRef.current = progress;

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const W = () => wrap.clientWidth;
    const H = () => wrap.clientHeight;
    const meshes: THREE.Mesh[] = [];
    const disposables: Array<THREE.Object3D | THREE.Material | THREE.BufferGeometry> = [];

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W(), H(), false);
    renderer.setClearColor(0x060708, 1);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060708);

    const camera = new THREE.PerspectiveCamera(65, W() / H(), 0.05, 150);
    camera.position.set(11, 1.7, 7);
    camera.lookAt(6, 1.6, 2);

    const onResize = () => {
      renderer.setSize(W(), H(), false);
      camera.aspect = W() / H();
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    scene.add(new THREE.AmbientLight(0x0a0e14, 1.0));
    const ceilLight = new THREE.DirectionalLight(0xc8d8f0, 0.55);
    ceilLight.position.set(2, 10, 3);
    scene.add(ceilLight);
    const fillLight = new THREE.DirectionalLight(0xf0e8d8, 0.18);
    fillLight.position.set(-8, 3, 12);
    scene.add(fillLight);
    const rimLight = new THREE.DirectionalLight(0x8899bb, 0.12);
    rimLight.position.set(0, 2, -12);
    scene.add(rimLight);

    const MAT = {
      wall: new THREE.MeshLambertMaterial({
        color: 0x1a1c20,
        transparent: true,
        opacity: 0.2,
        depthWrite: false,
      }),
      desk: new THREE.MeshLambertMaterial({ transparent: true, opacity: 0, depthWrite: false }),
      shelf: new THREE.MeshLambertMaterial({ transparent: true, opacity: 0, depthWrite: false }),
      chair: new THREE.MeshLambertMaterial({ transparent: true, opacity: 0, depthWrite: false }),
      monitor: new THREE.MeshLambertMaterial({ transparent: true, opacity: 0, depthWrite: false }),
      screen: new THREE.MeshLambertMaterial({ transparent: true, opacity: 0, depthWrite: false }),
      metal: new THREE.MeshLambertMaterial({ transparent: true, opacity: 0, depthWrite: false }),
      board: new THREE.MeshLambertMaterial({ transparent: true, opacity: 0, depthWrite: false }),
      frame: new THREE.MeshLambertMaterial({ transparent: true, opacity: 0, depthWrite: false }),
      glass: new THREE.MeshLambertMaterial({ transparent: true, opacity: 0, depthWrite: false }),
      prop: new THREE.MeshLambertMaterial({ transparent: true, opacity: 0, depthWrite: false }),
      marker: new THREE.MeshLambertMaterial({ transparent: true, opacity: 0, depthWrite: false }),
    };
    Object.values(MAT).forEach((mat) => disposables.push(mat));

    function mkPlane(
      w: number,
      d: number,
      x: number,
      y: number,
      z: number,
      rx = 0,
      ry = 0,
      den = 1,
      mat = MAT.wall,
    ) {
      const seg = (n: number) => Math.max(4, Math.round(n * 6 * den));
      const geo = new THREE.PlaneGeometry(w, d, seg(w), seg(d));
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.rotation.x = rx;
      m.rotation.y = ry;
      m.updateMatrixWorld(true);
      meshes.push(m);
      scene.add(m);
      disposables.push(geo, m);
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
      mat = MAT.wall,
    ) {
      const seg = (n: number, b: number) => Math.max(2, Math.round(n * b * den));
      const geo = new THREE.BoxGeometry(w, h, d, seg(w, 5), seg(h, 5), seg(d, 5));
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.rotation.y = ry;
      m.updateMatrixWorld(true);
      meshes.push(m);
      scene.add(m);
      disposables.push(geo, m);
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
      mat = MAT.metal,
    ) {
      const geo = new THREE.CylinderGeometry(rt, rb, h, segs, hsegs);
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.rotation.y = ry;
      m.updateMatrixWorld(true);
      meshes.push(m);
      scene.add(m);
      disposables.push(geo, m);
    }

    function mkShelf(x: number, y: number, z: number, w: number, h: number, d: number, ry = 0) {
      mkBox(w, h, d, x, y + h / 2, z, ry, 2, MAT.shelf);
      const boards = Math.max(2, Math.floor(h / 0.38));
      for (let i = 0; i <= boards; i++) {
        const by = y + (h / boards) * i;
        mkBox(w - 0.06, 0.028, d - 0.06, x, by, z, ry, 1, MAT.shelf);
      }
      for (let i = 0; i < boards; i++) {
        const by = y + (h / boards) * i + 0.014;
        const nx = Math.round((w - 0.1) / 0.085);
        for (let b = 0; b < nx; b++) {
          const bh = 0.18 + Math.random() * 0.12;
          const bx = -w / 2 + 0.05 + b * 0.085 + 0.04;
          mkBox(
            0.065,
            bh,
            d * 0.7,
            x + bx * Math.cos(ry),
            by + bh / 2,
            z + bx * Math.sin(ry) * 0,
            0,
            1.5,
            MAT.prop,
          );
        }
      }
    }

    function mkDesk(x: number, z: number, w: number, d: number, ry = 0) {
      mkBox(w, DTH, d, x, DH, z, ry, 2.5, MAT.desk);
      mkBox(w - 0.1, 0.35, 0.02, x, DH - 0.2, z + (d / 2 - 0.01) * Math.cos(ry), ry, 1.5, MAT.desk);
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
          MAT.metal,
        );
      });
      mkBox(
        0.42,
        0.52,
        0.55,
        x + (w / 2 - 0.22) * Math.cos(ry),
        DH - 0.26,
        z + (w / 2 - 0.22) * Math.sin(ry) * 0.1,
        ry,
        1.5,
        MAT.desk,
      );
    }

    function mkMonitor(x: number, z: number, ry = 0) {
      const dist = 0.32;
      const mx = x + dist * Math.sin(ry);
      const mz = z - dist * Math.cos(ry);
      mkBox(0.56, 0.34, 0.025, mx, DH + 0.22, mz, ry, 2, MAT.screen);
      mkBox(0.6, 0.38, 0.018, mx, DH + 0.22, mz + 0.005 * Math.cos(ry), ry, 1.5, MAT.monitor);
      mkCyl(0.018, 0.022, 0.18, 8, 2, mx, DH + 0.09, mz, ry, MAT.metal);
      mkBox(0.2, 0.016, 0.15, mx, DH + 0.008, mz + 0.04 * Math.cos(ry), ry, 1, MAT.metal);
    }

    function mkChair(x: number, z: number, ry = 0) {
      mkBox(0.48, 0.06, 0.48, x, 0.46, z, ry, 2, MAT.chair);
      mkBox(0.44, 0.52, 0.06, x, 0.74, z - 0.22 * Math.cos(ry), ry, 2, MAT.chair);
      mkBox(0.28, 0.22, 0.04, x, 0.6, z - 0.23 * Math.cos(ry), ry, 1.5, MAT.chair);
      [-1, 1].forEach((side) => {
        mkBox(
          0.05,
          0.18,
          0.3,
          x + side * 0.24 * Math.cos(ry),
          0.6,
          z + side * 0.24 * Math.sin(ry) * 0 + 0.02,
          ry,
          1,
          MAT.metal,
        );
      });
      mkCyl(0.028, 0.038, 0.3, 8, 2, x, 0.3, z, ry, MAT.metal);
      for (let i = 0; i < 5; i++) {
        const ang = ry + (i / 5) * Math.PI * 2;
        mkBox(0.32, 0.03, 0.055, x + Math.sin(ang) * 0.16, 0.03, z + Math.cos(ang) * 0.16, ang, 1, MAT.metal);
      }
      for (let i = 0; i < 5; i++) {
        const ang = ry + (i / 5) * Math.PI * 2;
        mkBox(0.06, 0.04, 0.04, x + Math.sin(ang) * 0.3, 0.02, z + Math.cos(ang) * 0.3, ang, 1, MAT.metal);
      }
    }

    mkPlane(RW, RD, 0, 0, 0, -Math.PI / 2, 0, 3, MAT.wall);
    mkPlane(RW, RD, 0, CH, 0, Math.PI / 2, 0, 2, MAT.wall);
    mkBox(RW, CH, 0.2, 0, CH / 2, -hd, 0, 2, MAT.wall);
    mkBox(5.5, CH, 0.2, -11.25, CH / 2, hd, 0, 2, MAT.wall);
    mkBox(12, CH, 0.2, 0, CH / 2, hd, 0, 2, MAT.wall);
    mkBox(4, CH, 0.2, 12, CH / 2, hd, 0, 2, MAT.wall);
    mkBox(3, 0.3, 0.2, -8.5, CH - 0.15, hd, 0, 2, MAT.wall);
    mkBox(4, 0.3, 0.2, 12, CH - 0.15, hd, 0, 2, MAT.wall);
    mkBox(0.2, CH, RD, -hw, CH / 2, 0, 0, 2, MAT.wall);
    mkBox(0.2, CH, RD, hw, CH / 2, 0, 0, 2, MAT.wall);
    mkBox(4, 0.12, 0.25, -5.5, 2.1, -hd + 0.12, 0, 1.5, MAT.wall);
    mkBox(4, 0.12, 0.25, -5.5, CH - 0.6, -hd + 0.12, 0, 1.5, MAT.wall);
    mkBox(0.12, 1.5, 0.25, -3.6, 1.45, -hd + 0.12, 0, 1.5, MAT.wall);
    mkBox(0.12, 1.5, 0.25, -7.4, 1.45, -hd + 0.12, 0, 1.5, MAT.wall);
    mkBox(4, 0.12, 0.25, 6, 2.1, -hd + 0.12, 0, 1.5, MAT.wall);
    mkBox(4, 0.12, 0.25, 6, CH - 0.6, -hd + 0.12, 0, 1.5, MAT.wall);
    mkBox(0.12, 1.5, 0.25, 7.9, 1.45, -hd + 0.12, 0, 1.5, MAT.wall);
    mkBox(0.12, 1.5, 0.25, 4.1, 1.45, -hd + 0.12, 0, 1.5, MAT.wall);
    mkBox(10, CH, 0.15, -9, CH / 2, -1, 0, 1.5, MAT.wall);

    mkShelf(-4.5, 0, -7.5, 0.4, 2.2, 3, 0);
    mkShelf(4.5, 0, -7.5, 0.4, 2.2, 3, 0);
    mkShelf(12.8, 0, 7, 2, 2, 1.2, 0);
    mkShelf(-13.5, 0, -6.5, 0.4, 2.2, 3.5, 0);
    mkShelf(-13.5, 0, -1.5, 0.4, 2.2, 3.5, 0);
    mkShelf(-13.5, 0, 4, 0.4, 2.2, 3.5, 0);

    mkDesk(-12, -7, 1.5, 0.75, 0);
    mkMonitor(-12.22, -7, 0);
    mkMonitor(-11.78, -7, 0);
    mkChair(-12, -6.55, Math.PI);
    mkDesk(-12, -4.5, 1.5, 0.75, 0);
    mkMonitor(-12.22, -4.5, 0);
    mkMonitor(-11.78, -4.5, 0);
    mkChair(-12, -4.05, Math.PI);
    mkDesk(-9.5, -7, 1.5, 0.75, 0);
    mkMonitor(-9.72, -7, 0);
    mkMonitor(-9.28, -7, 0);
    mkChair(-9.5, -6.55, Math.PI);
    mkDesk(-9.5, -4.5, 1.5, 0.75, 0);
    mkMonitor(-9.72, -4.5, 0);
    mkMonitor(-9.28, -4.5, 0);
    mkChair(-9.5, -4.05, Math.PI);
    mkDesk(-6, 2, 1.5, 0.75, 0);
    mkMonitor(-6.22, 2, 0);
    mkMonitor(-5.78, 2, 0);
    mkChair(-6, 2.45, 0);
    mkDesk(-3.5, 2, 1.5, 0.75, 0);
    mkMonitor(-3.72, 2, 0);
    mkMonitor(-3.28, 2, 0);
    mkChair(-3.5, 2.45, 0);
    mkDesk(1.5, 4.5, 4.5, 1.1, 0);
    mkChair(0, 4.5, Math.PI / 2);
    mkChair(1.5, 5.12, Math.PI);
    mkChair(3, 4.5, -Math.PI / 2);
    mkChair(1.5, 3.88, 0);
    mkDesk(9, -6.5, 1.5, 0.75, 0);
    mkMonitor(8.78, -6.5, 0);
    mkMonitor(9.22, -6.5, 0);
    mkChair(9, -6, Math.PI);
    mkDesk(11.5, -6.5, 1.5, 0.75, 0);
    mkMonitor(11.28, -6.5, 0);
    mkMonitor(11.72, -6.5, 0);
    mkChair(11.5, -6, Math.PI);
    mkDesk(9, -3.5, 1.5, 0.75, Math.PI);
    mkMonitor(8.78, -3.5, Math.PI);
    mkMonitor(9.22, -3.5, Math.PI);
    mkChair(9, -4, 0);
    mkDesk(11.5, -3.5, 1.5, 0.75, Math.PI);
    mkMonitor(11.28, -3.5, Math.PI);
    mkMonitor(11.72, -3.5, Math.PI);
    mkChair(11.5, -4, 0);

    [[-8, -7], [-8, -3], [-8, 1], [0, -5], [0, 0], [0, 5], [8, -7], [8, -3], [8, 1]].forEach(([x, z]) => {
      mkBox(0.14, 0.06, 1.2, x, CH - 0.04, z, 0, 2, MAT.metal);
      mkBox(0.12, 0.025, 1, x, CH - 0.05, z, 0, 1.5, MAT.metal);
    });
    mkBox(25, 0.06, 0.1, 0, CH - 0.12, 0, 0, 1.5, MAT.metal);
    mkBox(0.1, 0.06, 15, -5, CH - 0.12, 0, 0, 1.5, MAT.metal);
    mkBox(0.06, 0.04, 17.5, -hw + 0.14, 2.8, 0, 0, 1, MAT.metal);
    mkBox(0.06, 0.04, 17.5, hw - 0.14, 2.8, 0, 0, 1, MAT.metal);

    mkBox(0.1, CH, 0.25, -10.25, CH / 2, hd, 0, 1.5, MAT.frame);
    mkBox(0.1, CH, 0.25, -6.75, CH / 2, hd, 0, 1.5, MAT.frame);
    mkBox(3.5, 0.12, 0.25, -8.5, CH - 0.06, hd, 0, 1.5, MAT.frame);
    mkBox(1.55, 2.45, 0.045, -9.2, 1.275, hd - 0.4, -0.28, 1.5, MAT.prop);
    mkBox(1.55, 2.45, 0.045, -7.8, 1.275, hd - 0.4, 0.28, 1.5, MAT.prop);
    mkBox(0.1, CH, 0.25, 10.1, CH / 2, hd, 0, 1.5, MAT.frame);
    mkBox(0.1, CH, 0.25, hw, CH / 2, hd, 0, 1.5, MAT.frame);
    mkBox(4, 0.12, 0.25, 12, CH - 0.06, hd, 0, 1.5, MAT.frame);
    mkBox(3.8, 2.45, 0.05, 10.3, 1.275, hd - 1.9, 0, 1.5, MAT.prop);

    mkBox(3.8, 1.4, 0.06, -5.5, 1.6, -hd + 0.1, 0, 1.8, MAT.glass);
    mkBox(3.8, 1.4, 0.06, 6, 1.6, -hd + 0.1, 0, 1.8, MAT.glass);
    mkBox(0.06, 1.4, 0.07, -5.5, 1.6, -hd + 0.1, 0, 1.5, MAT.frame);
    mkBox(0.06, 1.4, 0.07, 6, 1.6, -hd + 0.1, 0, 1.5, MAT.frame);
    mkBox(3.8, 0.06, 0.07, -5.5, 1.6, -hd + 0.1, 0, 1.5, MAT.frame);
    mkBox(3.8, 0.06, 0.07, 6, 1.6, -hd + 0.1, 0, 1.5, MAT.frame);

    for (let xi = -6; xi <= 6; xi++) mkBox(RW, 0.012, 0.012, 0, CH - 0.01, xi * 1.2, 0, 1, MAT.wall);
    for (let zi = -7; zi <= 7; zi++) mkBox(0.012, 0.012, RD, 0, CH - 0.01, 0, 0, 1, MAT.wall);

    mkBox(4.8, 1.6, 0.032, 0, 2, -hd + 0.1, 0, 2.5, MAT.board);
    mkBox(5, 1.72, 0.025, 0, 2, -hd + 0.115, 0, 1.8, MAT.frame);
    mkBox(5, 0.06, 0.04, 0, 2.82, -hd + 0.12, 0, 1.5, MAT.metal);
    mkBox(5, 0.06, 0.04, 0, 1.16, -hd + 0.12, 0, 1.5, MAT.metal);
    mkBox(0.06, 1.72, 0.04, -2.5, 2, -hd + 0.12, 0, 1.5, MAT.metal);
    mkBox(0.06, 1.72, 0.04, 2.5, 2, -hd + 0.12, 0, 1.5, MAT.metal);
    mkBox(4.8, 0.05, 0.14, 0, 1.13, -hd + 0.17, 0, 1.5, MAT.metal);
    mkBox(4.8, 0.06, 0.02, 0, 1.1, -hd + 0.23, 0, 1.5, MAT.metal);
    [-1.6, -0.8, 0, 0.8].forEach((mx) => mkCyl(0.012, 0.012, 0.13, 8, 2, mx, 1.175, -hd + 0.17, Math.PI / 2, MAT.marker));
    mkBox(0.14, 0.04, 0.055, 1.6, 1.175, -hd + 0.18, 0, 1.5, MAT.prop);
    mkBox(0.06, 0.18, 0.08, -2.2, 1.06, -hd + 0.13, 0, 1.5, MAT.metal);
    mkBox(0.06, 0.18, 0.08, 2.2, 1.06, -hd + 0.13, 0, 1.5, MAT.metal);

    mkBox(0.52, 0.55, 0.48, -2, 0.275, -0.5, 0, 2, MAT.prop);
    mkBox(0.52, 0.06, 0.48, -2, 0.58, -0.5, 0, 1.5, MAT.prop);
    mkBox(0.45, 0.3, 0.42, -2, 0.85, -0.5, 0, 1.5, MAT.prop);
    mkCyl(0.12, 0.1, 0.28, 10, 2, -11, 0.14, -6.1, 0, MAT.metal);
    mkCyl(0.12, 0.1, 0.28, 10, 2, 9.5, 0.14, -5.7, 0, MAT.metal);
    mkBox(1.1, 0.3, 0.2, 0, 2.85, -hd + 0.15, 0, 2, MAT.prop);
    mkBox(0.06, 0.18, 0.22, 0.55, 2.88, -hd + 0.2, 0, 1.5, MAT.metal);
    mkBox(0.06, 0.18, 0.22, -0.55, 2.88, -hd + 0.2, 0, 1.5, MAT.metal);
    for (let i = 0; i < 5; i++) mkBox(0.06, 0.06, 0.1, -hw + 0.14, 1.8, -6 + i * 1.2, 0, 1.5, MAT.metal);
    mkBox(RW, 0.1, 0.03, 0, 0.05, -hd + 0.015, 0, 1, MAT.wall);
    mkBox(RW, 0.1, 0.03, 0, 0.05, hd - 0.015, 0, 1, MAT.wall);
    mkBox(0.03, 0.1, RD, -hw + 0.015, 0.05, 0, 0, 1, MAT.wall);
    mkBox(0.03, 0.1, RD, hw - 0.015, 0.05, 0, 0, 1, MAT.wall);

    function sampleMesh(mesh: THREE.Mesh, count: number) {
      const pts: THREE.Vector3[] = [];
      const geo = mesh.geometry as THREE.BufferGeometry;
      const mw = mesh.matrixWorld;
      const pa = geo.attributes.position as THREE.BufferAttribute;
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
      for (let s = 0; s < count; s++) {
        const r = Math.random() * total;
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
        const r1 = Math.sqrt(Math.random());
        const r2 = Math.random();
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

    let totalArea = 0;
    const mAreas: number[] = [];
    {
      const va = new THREE.Vector3();
      const vb = new THREE.Vector3();
      const vc = new THREE.Vector3();
      meshes.forEach((mesh) => {
        const geo = mesh.geometry as THREE.BufferGeometry;
        const mw = mesh.matrixWorld;
        const pa = geo.attributes.position as THREE.BufferAttribute;
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
    }

    const TOTAL_PTS = 320000;
    const allPts: THREE.Vector3[] = [];
    meshes.forEach((mesh, mi) => {
      const cnt = Math.max(10, Math.round(TOTAL_PTS * (mAreas[mi] / totalArea)));
      sampleMesh(mesh, cnt).forEach((p) => allPts.push(p));
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
      const depth = Math.max(0, Math.min(1, (p.z + hd) / (hd * 2)));
      const ht = Math.max(0, Math.min(1, p.y / CH));
      const eyeLvl = 1 - Math.abs(ht - 0.5) * 1.6;
      const edgeX = Math.abs(p.x) / hw;
      const edgeZ = Math.abs(p.z) / hd;
      const edge = Math.pow(Math.max(edgeX, edgeZ), 1.4);
      const floorDark = Math.pow(Math.max(0, 1 - p.y / 0.18), 2) * 0.3;
      const ceilDark = Math.pow(Math.max(0, (p.y - (CH - 0.25)) / 0.25), 2) * 0.2;
      const jit = (Math.random() - 0.5) * 0.22;
      let bri = 0.25 + depth * 0.3 + eyeLvl * 0.35 - edge * 0.15 - floorDark - ceilDark + jit;
      bri = Math.max(0.05, Math.min(1, bri));
      col[i * 3] = bri;
      col[i * 3 + 1] = bri;
      col[i * 3 + 2] = bri;
      sz[i] = 1.4 + Math.random() * 0.6;
    }

    const geo3 = new THREE.BufferGeometry();
    geo3.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo3.setAttribute("color", new THREE.BufferAttribute(col, 3));
    geo3.setAttribute("size", new THREE.BufferAttribute(sz, 1));
    disposables.push(geo3);

    const pointMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        attribute float size;
        varying vec3 vCol;
        void main(){
          vCol = color;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = clamp(size * 2.2, 2.0, 4.0);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        varying vec3 vCol;
        void main(){
          vec2 uv = gl_PointCoord - 0.5;
          float r = dot(uv, uv);
          if(r > 0.25) discard;
          float a = 1.0 - smoothstep(0.13, 0.25, r);
          gl_FragColor = vec4(vCol, a);
        }`,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
    });
    const cloud = new THREE.Points(geo3, pointMaterial);
    scene.add(cloud);
    disposables.push(pointMaterial, cloud);

    const FN = 700;
    const fp = new Float32Array(FN * 3);
    const fv = new Float32Array(FN);
    const fph = new Float32Array(FN);
    for (let i = 0; i < FN; i++) {
      fp[i * 3] = (Math.random() - 0.5) * (RW - 2);
      fp[i * 3 + 1] = Math.random() * CH;
      fp[i * 3 + 2] = (Math.random() - 0.5) * (RD - 2);
      fv[i] = 0.0015 + Math.random() * 0.003;
      fph[i] = Math.random() * Math.PI * 2;
    }
    const fgeo = new THREE.BufferGeometry();
    fgeo.setAttribute("position", new THREE.BufferAttribute(fp, 3));
    const fmat = new THREE.PointsMaterial({
      color: 0x99aacc,
      size: 0.032,
      transparent: true,
      opacity: 0.2,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const dust = new THREE.Points(fgeo, fmat);
    scene.add(dust);
    disposables.push(fgeo, fmat, dust);

    const path = [
      { p: [11, 1.7, 7], l: [6, 1.6, 2] },
      { p: [6, 1.7, 4], l: [0, 1.6, 0] },
      { p: [2, 1.68, 1], l: [-2, 1.58, -3] },
      { p: [-3, 1.65, -1], l: [-1, 1.55, -7] },
      { p: [0, 1.62, -5.5], l: [0, 1.9, -9] },
    ] as const;

    const clock = new THREE.Clock();
    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const et = clock.getElapsedTime();
      const t = Math.min(Math.max(progressRef.current, 0), 0.9999);
      const seg = t * (path.length - 1);
      const si = Math.min(path.length - 2, Math.floor(seg));
      const st = eio(seg % 1);
      const ca = path[si];
      const cb = path[si + 1];

      camera.position.set(
        lv(ca.p[0], cb.p[0], st) + Math.sin(et * 0.19) * 0.035,
        lv(ca.p[1], cb.p[1], st) + Math.sin(et * 0.14) * 0.018,
        lv(ca.p[2], cb.p[2], st),
      );
      camera.lookAt(
        lv(ca.l[0], cb.l[0], st),
        lv(ca.l[1], cb.l[1], st),
        lv(ca.l[2], cb.l[2], st),
      );

      for (let i = 0; i < FN; i++) {
        fp[i * 3 + 1] += fv[i];
        fp[i * 3] += Math.sin(et * 0.3 + fph[i]) * 0.0007;
        if (fp[i * 3 + 1] > CH) fp[i * 3 + 1] = 0.02;
      }
      (fgeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      scene.clear();
      disposables.forEach((d) => {
        if (d instanceof THREE.Object3D && d.parent) d.parent.remove(d);
      });
      disposables.forEach((d) => {
        if (d instanceof THREE.BufferGeometry) d.dispose();
        if (d instanceof THREE.Material) disposeMaterial(d);
      });
      renderer.dispose();
    };
  }, []);

  if (opacity <= 0.02) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[9]" style={{ opacity }}>
      <div ref={wrapRef} className="h-full w-full overflow-hidden bg-[#060708]">
        <canvas ref={canvasRef} className="block h-full w-full" />
      </div>
    </div>
  );
}
