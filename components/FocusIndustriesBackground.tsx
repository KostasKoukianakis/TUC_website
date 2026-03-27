"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const CAMERA_Z = 15;
const FOV = 60;
const TORUS_RADIUS = 3;
const TUBE_RADIUS = 1;
const RADIAL_SEGMENTS = 102;
const TUBULAR_SEGMENTS = 180;
const BASE_X = 0;
const BASE_Y = 3;
const BASE_Z = 14;
const BASE_ROT_X = 0;
const BASE_ROT_Y = 90;
const BASE_ROT_Z = 0;
const DOT_COLOR = "#A9A9A9";
const DOT_SIZE = 0.04;
const DOT_ATTENUATION = 170;

const degToRad = (v: number) => (v * Math.PI) / 180;

const WOBBLE = {
  centerX: 0,
  rangeX: degToRad(20),
  centerY: degToRad(90),
  rangeY: degToRad(20),
};

export function FocusIndustriesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const width = () => Math.max(1, canvas.clientWidth || window.innerWidth);
    const height = () => Math.max(1, canvas.clientHeight || window.innerHeight);

    const camera = new THREE.PerspectiveCamera(FOV, width() / height(), 0.1, 1000);
    camera.position.z = CAMERA_Z;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      powerPreference: "high-performance",
      antialias: false,
    });
    renderer.setSize(width(), height());
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xdadada, 1);

    const torus = new THREE.TorusGeometry(
      TORUS_RADIUS,
      TUBE_RADIUS,
      RADIAL_SEGMENTS,
      TUBULAR_SEGMENTS
    );
    const points = new THREE.Points(
      torus,
      new THREE.ShaderMaterial({
        uniforms: {
          color: { value: new THREE.Color(DOT_COLOR) },
          size: { value: DOT_SIZE },
          sizeAttenuation: { value: DOT_ATTENUATION },
        },
        vertexShader: `
          uniform float size;
          uniform float sizeAttenuation;
          void main() {
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (sizeAttenuation / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          uniform vec3 color;
          void main() {
            vec2 center = gl_PointCoord - vec2(0.5);
            if (dot(center, center) > 0.25) discard;
            gl_FragColor = vec4(color, 1.0);
          }
        `,
        transparent: false,
      })
    );
    points.position.set(BASE_X, BASE_Y, BASE_Z);
    points.rotation.set(
      degToRad(BASE_ROT_X),
      degToRad(BASE_ROT_Y),
      degToRad(BASE_ROT_Z)
    );
    scene.add(points);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let visible = true;
    let hasRenderedOnce = false;
    let time = 0;
    let raf = 0;
    let lastW = width();
    let lastH = height();

    const observer = new IntersectionObserver(
      (entries) => {
        visible = Boolean(entries[0]?.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(canvas);

    const onResize = () => {
      const currentW = width();
      const currentH = height();
      if (currentW === lastW && currentH === lastH) return;
      lastW = currentW;
      lastH = currentH;
      camera.aspect = currentW / currentH;
      camera.updateProjectionMatrix();
      renderer.setSize(currentW, currentH);
    };

    const animate = () => {
      raf = window.requestAnimationFrame(animate);
      if (!visible) return;

      if (reduced) {
        if (hasRenderedOnce) return;
        hasRenderedOnce = true;
        points.rotation.set(WOBBLE.centerX, WOBBLE.centerY, 0);
        points.position.set(BASE_X, BASE_Y, BASE_Z);
        renderer.render(scene, camera);
        return;
      }

      time += 0.005;
      const wave = Math.sin(time);
      points.rotation.set(
        WOBBLE.centerX + WOBBLE.rangeX * wave,
        WOBBLE.centerY + WOBBLE.rangeY * wave,
        -time
      );
      points.position.set(BASE_X, BASE_Y + 0.3 * wave, BASE_Z);
      renderer.render(scene, camera);
    };

    window.addEventListener("resize", onResize);
    animate();

    return () => {
      window.removeEventListener("resize", onResize);
      observer.disconnect();
      window.cancelAnimationFrame(raf);
      torus.dispose();
      points.geometry.dispose();
      (points.material as THREE.Material).dispose();
      scene.clear();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="size-full"
      style={{
        maskImage:
          "linear-gradient(0deg, transparent 0%, black 20%, black 80%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(0deg, transparent 0%, black 20%, black 80%, transparent 100%)",
      }}
      aria-hidden
    />
  );
}

