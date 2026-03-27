/**
 * Wave / blend math extracted from WorldQuant Foundry `main.min.js` (Zi / Gi / Ki).
 */

import type { Matrix4, PerspectiveCamera } from "three";
import { Vector3 } from "three";

export const WQF_LI = 0.01;
export const WQF_JI = 0.015;
export const WQF_NI = 0.02;

export function wqfXi(t: number, e: number, n: number, useCos: boolean): number {
  const r = useCos ? Math.cos : Math.sin;
  return 0.5 * Math.sin(r(t + e * n) * Math.PI);
}

export function wqfGi(
  t: number,
  e: number,
  n: number,
  i: number,
): { x: number; y: number; z: number } {
  return {
    x: wqfXi(t, e, WQF_LI, false),
    y: wqfXi(t, n, WQF_JI, true),
    z: wqfXi(t, i, WQF_NI, false),
  };
}

export function wqfKi(
  out: Float32Array,
  base: number,
  orig: Float32Array,
  wave: { x: number; y: number; z: number },
  waveIntensity: number,
  mouseSmooth: Float32Array,
  isTouch: boolean,
) {
  const e = base * 3;
  out[e] = orig[e] + wave.x * waveIntensity + (isTouch ? 0 : mouseSmooth[e]);
  out[e + 1] = orig[e + 1] + wave.y * waveIntensity + (isTouch ? 0 : mouseSmooth[e + 1]);
  out[e + 2] = orig[e + 2] + wave.z * waveIntensity + (isTouch ? 0 : mouseSmooth[e + 2]);
}

const MOUSE_RADIUS = 125;
const MOUSE_SMOOTH = 0.1;

export function updateWqfTubePositions(opts: {
  time: number;
  positions: Float32Array;
  original: Float32Array;
  waveIntensity: number;
  spatialBlend: number;
  introWaveComplete: boolean;
  isTouch: boolean;
  camera: PerspectiveCamera;
  matrixWorld: Matrix4;
  mouseX: number;
  mouseY: number;
  canvasWidth: number;
  canvasHeight: number;
  mouseDelta: Float32Array;
  mouseSmooth: Float32Array;
}) {
  const {
    time,
    positions,
    original,
    waveIntensity,
    spatialBlend,
    introWaveComplete,
    isTouch,
    camera,
    matrixWorld,
    mouseX,
    mouseY,
    canvasWidth,
    canvasHeight,
    mouseDelta,
    mouseSmooth,
  } = opts;

  const pos = positions;
  const orig = original;
  const count = orig.length / 3;

  const v3a = new Vector3();
  const v3b = new Vector3();

  if (introWaveComplete && !isTouch) {
    const worldMat = matrixWorld;
    for (let p = 0; p < count; p++) {
      const f = p * 3;
      v3a.set(orig[f], orig[f + 1], orig[f + 2]);
      v3a.applyMatrix4(worldMat);
      v3b.copy(v3a).project(camera);
      const mx = (0.5 * v3b.x + 0.5) * canvasWidth;
      const my = (0.5 * -v3b.y + 0.5) * canvasHeight;
      const vx = mx - mouseX;
      const vy = my - mouseY;
      const dist = Math.sqrt(vx * vx + vy * vy);
      if (dist < MOUSE_RADIUS) {
        const w = 1 - dist / MOUSE_RADIUS;
        const ang = Math.atan2(vy, vx);
        mouseDelta[f] = -Math.cos(ang) * w * 1.5;
        mouseDelta[f + 1] = -Math.sin(ang) * w * 1.5;
        mouseDelta[f + 2] = 1.5 * w * 0.5;
      } else {
        mouseDelta[f] = 0;
        mouseDelta[f + 1] = 0;
        mouseDelta[f + 2] = 0;
      }
      mouseSmooth[f] += MOUSE_SMOOTH * (mouseDelta[f] - mouseSmooth[f]);
      mouseSmooth[f + 1] += MOUSE_SMOOTH * (mouseDelta[f + 1] - mouseSmooth[f + 1]);
      mouseSmooth[f + 2] += MOUSE_SMOOTH * (mouseDelta[f + 2] - mouseSmooth[f + 2]);
    }
  }

  for (let g = 0; g < count; g++) {
    const v = orig[g * 3];
    const y = orig[g * 3 + 1];
    const b = orig[g * 3 + 2];
    const w = wqfGi(time, g, g, g);
    const blend = wqfGi(time, v, y, b);
    wqfKi(
      pos,
      g,
      orig,
      {
        x: w.x * (1 - spatialBlend) + blend.x * spatialBlend,
        y: w.y * (1 - spatialBlend) + blend.y * spatialBlend,
        z: w.z * (1 - spatialBlend) + blend.z * spatialBlend,
      },
      waveIntensity,
      mouseSmooth,
      isTouch,
    );
  }
}
