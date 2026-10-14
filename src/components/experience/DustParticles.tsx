"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useExperience } from "@/lib/experience-store";
import { TIER_SETTINGS } from "@/lib/performance-tier";
import { runtime } from "./runtime";

const vertex = /* glsl */ `
  uniform vec3 uLens;
  uniform vec3 uC0; uniform vec3 uC1; uniform vec3 uC2; uniform vec3 uC3;
  uniform float uTime;
  uniform float uSize;
  attribute vec4 aParams; // t (along beam), a, b (across), seed
  varying float vAlpha;
  void main() {
    float seed = aParams.w;
    float t = fract(aParams.x + uTime * (0.004 + seed * 0.006));
    float a = clamp(aParams.y + 0.05 * sin(uTime * (0.3 + seed) + seed * 40.0), 0.02, 0.98);
    float b = clamp(aParams.z + 0.05 * cos(uTime * (0.25 + seed * 0.7) + seed * 17.0), 0.02, 0.98);
    vec3 top = mix(uC0, uC1, a);
    vec3 bottom = mix(uC3, uC2, a);
    vec3 target = mix(top, bottom, b);
    vec3 p = mix(uLens, target, t);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.6 + seed) / -mv.z;
    float twinkle = 0.55 + 0.45 * sin(uTime * (1.5 + seed * 3.0) + seed * 60.0);
    // brighter near the lens, fade before the screen
    vAlpha = twinkle * smoothstep(0.02, 0.1, t) * (1.0 - smoothstep(0.75, 0.98, t)) * mix(1.0, 0.45, t);
  }
`;

const fragment = /* glsl */ `
  uniform float uLevel;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float a = smoothstep(0.5, 0.0, d) * vAlpha * uLevel * 0.85;
    gl_FragColor = vec4(1.0, 0.82, 0.58, a);
  }
`;

/** Dust drifting inside the beam — positions live in beam space, so they never leave it. */
export function DustParticles() {
  const tier = useExperience((s) => s.performanceTier);
  const count = tier === "static" ? 0 : TIER_SETTINGS[tier].dust;

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const params = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      // bias towards the lens so density reads as a cone
      params[i * 4] = Math.pow(Math.random(), 1.6);
      params[i * 4 + 1] = Math.random();
      params[i * 4 + 2] = Math.random();
      params[i * 4 + 3] = Math.random();
    }
    g.setAttribute("aParams", new THREE.BufferAttribute(params, 4));
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    return g;
  }, [count]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        uniforms: {
          uLens: { value: new THREE.Vector3() },
          uC0: { value: new THREE.Vector3() },
          uC1: { value: new THREE.Vector3() },
          uC2: { value: new THREE.Vector3() },
          uC3: { value: new THREE.Vector3() },
          uTime: { value: 0 },
          uSize: { value: 9 },
          uLevel: { value: 0 },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  useFrame((state) => {
    const u = material.uniforms;
    u.uLens.value.copy(runtime.lens);
    u.uC0.value.copy(runtime.corners[0]);
    u.uC1.value.copy(runtime.corners[1]);
    u.uC2.value.copy(runtime.corners[2]);
    u.uC3.value.copy(runtime.corners[3]);
    u.uTime.value = state.clock.elapsedTime;
    u.uLevel.value = Math.min(1, runtime.level);
    u.uSize.value = 9 * state.gl.getPixelRatio();
  });

  if (!count) return null;
  return <points geometry={geometry} material={material} frustumCulled={false} raycast={() => null} renderOrder={11} />;
}
