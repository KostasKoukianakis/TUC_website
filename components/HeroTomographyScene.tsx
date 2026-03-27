"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type Props = {
  reveal: number;
  opacity: number;
};

function TomographyPoints({ reveal, opacity }: Props) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const count = 12000;
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);

    let i = 0;
    while (i < count) {
      const x = Math.random() * 2 - 1;
      const y = Math.random() * 2 - 1;
      const z = Math.random() * 2 - 1;
      const r2 = x * x + y * y + z * z;
      if (r2 > 1) continue;

      // Ellipsoid volume (tomography-like cloud)
      positions[i * 3 + 0] = x * 5.4;
      positions[i * 3 + 1] = y * 3.2;
      positions[i * 3 + 2] = z * 2.4;
      seeds[i] = Math.random();
      i++;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    return geo;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uReveal: { value: 0 },
      uOpacity: { value: 0 },
    }),
    [],
  );

  useFrame((state) => {
    const mat = materialRef.current;
    if (!mat) return;
    mat.uniforms.uTime.value = state.clock.elapsedTime;
    mat.uniforms.uReveal.value += (reveal - mat.uniforms.uReveal.value) * 0.09;
    mat.uniforms.uOpacity.value += (opacity - mat.uniforms.uOpacity.value) * 0.12;
  });

  return (
    <points geometry={geometry} position={[0, -0.4, 0]}>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        vertexShader={`
          attribute float aSeed;
          uniform float uTime;
          uniform float uReveal;
          varying float vAlpha;

          void main() {
            vec3 p = position;

            // subtle breathing deformation
            float t = uTime * 0.55;
            p.x += sin((p.y + aSeed * 2.0) * 1.6 + t) * 0.06;
            p.y += cos((p.z + aSeed * 1.5) * 1.9 + t * 0.9) * 0.05;

            // moving tomography slice from back -> front
            float slice = mix(-2.6, 2.6, uReveal);
            float d = abs(p.z - slice);
            float band = smoothstep(0.48, 0.0, d);

            // keep faint surrounding volume + strong current slice
            float cloud = smoothstep(1.45, 0.0, abs(p.z));
            vAlpha = (cloud * 0.12 + band * 0.9) * (0.6 + 0.4 * aSeed);

            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_PointSize = (1.2 + aSeed * 1.6) * (210.0 / -mv.z);
            gl_Position = projectionMatrix * mv;
          }
        `}
        fragmentShader={`
          uniform float uOpacity;
          varying float vAlpha;

          void main() {
            vec2 uv = gl_PointCoord - vec2(0.5);
            float r = length(uv);
            float a = smoothstep(0.5, 0.08, r);
            if (a < 0.01) discard;

            vec3 col = vec3(0.06, 0.06, 0.07); // near-black dots
            gl_FragColor = vec4(col, a * vAlpha * uOpacity);
          }
        `}
      />
    </points>
  );
}

export function HeroTomographyScene({ reveal, opacity }: Props) {
  if (opacity <= 0.001) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[9]">
      <Canvas
        camera={{ position: [0, 0, 11], fov: 45, near: 0.1, far: 100 }}
        gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
        dpr={[1, 1.35]}
      >
        <TomographyPoints reveal={reveal} opacity={opacity} />
      </Canvas>
    </div>
  );
}

