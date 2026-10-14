"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { runtime } from "./runtime";

const vertex = /* glsl */ `
  attribute vec2 aEdge;
  varying vec2 vEdge;
  varying vec3 vWorld;
  void main() {
    vEdge = aEdge;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const fragment = /* glsl */ `
  uniform float uLevel;
  uniform float uTime;
  uniform vec3 uColor;
  varying vec2 vEdge;
  varying vec3 vWorld;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }

  void main() {
    float u = vEdge.x;      // across a face (0 and 1 are the beam's edges)
    float v = vEdge.y;      // 0 at the lens, 1 at the screen
    float feather = smoothstep(0.0, 0.22, u) * smoothstep(1.0, 0.78, u);
    float nearLens = smoothstep(0.0, 0.06, v);
    float falloff = mix(1.0, 0.35, v);
    float streaks = 0.75 + 0.25 * noise(vec2(u * 9.0 + uTime * 0.05, v * 3.0 - uTime * 0.12));
    float haze = 0.85 + 0.15 * noise(vWorld.xy * 6.0 + uTime * 0.2);
    float a = uLevel * feather * nearLens * falloff * streaks * haze * 0.13;
    gl_FragColor = vec4(uColor, a);
  }
`;

/**
 * Low-opacity, feathered light cone from the lens to the screen corners.
 * Rendered additively and double-sided so front and back faces read as volume.
 */
export function ProjectionBeam() {
  const mesh = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(4 * 3 * 3), 3));
    const edge: number[] = [];
    for (let f = 0; f < 4; f++) edge.push(0.5, 0, 0, 1, 1, 1);
    g.setAttribute("aEdge", new THREE.BufferAttribute(new Float32Array(edge), 2));
    return g;
  }, []);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        uniforms: { uLevel: { value: 0 }, uTime: { value: 0 }, uColor: { value: new THREE.Color("#ffc98f") } },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  useFrame((state) => {
    const pos = geometry.attributes.position as THREE.BufferAttribute;
    const { lens, corners } = runtime;
    for (let f = 0; f < 4; f++) {
      const a = corners[f];
      const b = corners[(f + 1) % 4];
      pos.setXYZ(f * 3, lens.x, lens.y, lens.z);
      pos.setXYZ(f * 3 + 1, a.x, a.y, a.z);
      pos.setXYZ(f * 3 + 2, b.x, b.y, b.z);
    }
    pos.needsUpdate = true;
    geometry.computeBoundingSphere();
    material.uniforms.uLevel.value = runtime.level;
    material.uniforms.uTime.value = state.clock.elapsedTime;
    if (mesh.current) mesh.current.visible = runtime.level > 0.002;
  });

  return <mesh ref={mesh} geometry={geometry} material={material} raycast={() => null} renderOrder={10} frustumCulled={false} />;
}
