"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { experienceStore } from "@/lib/experience-store";
import { BAKE, RECT_BOUNDS, toThree } from "@/lib/scene-config";
import { audio } from "@/lib/audio-manager";
import { sharedUniforms } from "./bakedMaterial";
import { hideTip, showTip } from "./Tooltip";

/**
 * The olive plant in the vase. A click brushes it: the branches swing on a
 * damped spring around the vase rim, and their shadow on the wall — cast live
 * from the same spot light that lit the Blender scene — swings with them.
 * The plant's shadow is excluded from the bake so only this live one shows.
 */
export function PlantSway({ root }: { root: THREE.Object3D }) {
  const gl = useThree((s) => s.gl);
  const plant = useMemo(() => root.getObjectByName("olive_plant") ?? null, [root]);
  const pivot = useMemo(() => new THREE.Group(), []);
  const spring = useRef({ ax: 0, vx: 0, az: 0, vz: 0, flutter: 0 });

  const leaf = BAKE.leaf_light!;

  // light + shadow catcher
  const light = useMemo(() => {
    const l = new THREE.SpotLight("#ffffff", 0); // casts the shadow only; the bake provides the light
    l.position.copy(toThree(leaf.location));
    const dir = toThree(leaf.direction);
    l.target.position.copy(l.position).add(dir.multiplyScalar(3));
    l.angle = leaf.spot_size / 2;
    l.penumbra = leaf.spot_blend;
    l.castShadow = true;
    l.shadow.mapSize.set(1024, 1024);
    l.shadow.camera.near = 0.3;
    l.shadow.camera.far = 6;
    l.shadow.radius = 5;
    l.shadow.blurSamples = 16;
    l.shadow.bias = -0.0004;
    return l;
  }, [leaf]);

  const catcher = useMemo(() => {
    const m = new THREE.ShadowMaterial({ color: new THREE.Color("#1d120a"), opacity: 0.42, transparent: true, depthWrite: false });
    // the shadow only removes room light — inside the lit projection it fades away
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uLevel = sharedUniforms.uLevel;
      shader.uniforms.uBounds = { value: new THREE.Vector4(RECT_BOUNDS.x0, RECT_BOUNDS.y0, RECT_BOUNDS.x1, RECT_BOUNDS.y1) };
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nvarying vec3 vWorldPos;")
        .replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nvWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;");
      shader.fragmentShader = shader.fragmentShader
        .replace("#include <common>", "#include <common>\nvarying vec3 vWorldPos;\nuniform float uLevel;\nuniform vec4 uBounds;")
        .replace(
          "#include <fog_fragment>",
          `#include <fog_fragment>
          vec2 p = (vWorldPos.xy - uBounds.xy) / (uBounds.zw - uBounds.xy);
          float inRect = step(0.0, p.x) * step(p.x, 1.0) * step(0.0, p.y) * step(p.y, 1.0);
          gl_FragColor.a *= 1.0 - inRect * clamp(uLevel, 0.0, 1.0) * 0.9;`,
        );
    };
    return m;
  }, []);

  useEffect(() => {
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.VSMShadowMap;
    gl.shadowMap.autoUpdate = false;
    gl.shadowMap.needsUpdate = true;
  }, [gl]);

  // re-parent the plant under a pivot at the vase rim, keeping its world transform
  useEffect(() => {
    if (!plant) return;
    const parent = plant.parent!;
    pivot.position.copy(toThree(BAKE.plant_pivot!));
    parent.add(pivot);
    pivot.updateMatrixWorld(true);
    pivot.attach(plant);
    plant.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true;
        o.userData.control = "plant";
      }
    });
    gl.shadowMap.needsUpdate = true;
    return () => {
      parent.attach(plant);
      parent.remove(pivot);
    };
  }, [plant, pivot, gl]);

  const brush = (e?: ThreeEvent<MouseEvent>) => {
    e?.stopPropagation();
    const s = spring.current;
    const reduced = experienceStore.getState().reducedMotion;
    const k = reduced ? 0.25 : 1;
    // push away from the side that was touched
    const side = e ? Math.sign(e.point.x - pivot.getWorldPosition(new THREE.Vector3()).x) || 1 : 1;
    s.vz += -side * 0.9 * k;
    s.vx += (Math.random() * 0.5 + 0.35) * k;
    s.flutter = 1;
    audio.play("rustle");
    hideTip();
  };

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 1 / 30);
    const s = spring.current;
    const moving = Math.abs(s.ax) + Math.abs(s.az) + Math.abs(s.vx) + Math.abs(s.vz) > 0.0004;
    if (!moving) return;
    // damped springs, slightly different stiffness per axis so it doesn't look mechanical
    s.vz += (-38 * s.az - 3.2 * s.vz) * dt;
    s.vx += (-30 * s.ax - 3.0 * s.vx) * dt;
    s.az += s.vz * dt;
    s.ax += s.vx * dt;
    s.flutter = Math.max(0, s.flutter - dt * 0.8);
    const t = performance.now() / 1000;
    pivot.rotation.set(s.ax * 0.18 + Math.sin(t * 13) * 0.006 * s.flutter, 0, s.az * 0.22 + Math.sin(t * 11) * 0.008 * s.flutter);
    gl.shadowMap.needsUpdate = true;
  });

  const r = BAKE.rect;
  const hitPos = useMemo(() => toThree([BAKE.plant_pivot![0], BAKE.plant_pivot![1], BAKE.plant_pivot![2] + 0.15]), []);

  return (
    <>
      <primitive object={light} />
      <primitive object={light.target} />
      {/* shadow catcher on the wall */}
      <mesh position={[0, (r.z0 + r.z1) / 2, -r.y + 0.003]} receiveShadow raycast={() => null} material={catcher}>
        <planeGeometry args={[5, 3.2]} />
      </mesh>
      {/* generous hit volume around vase + branches */}
      <mesh
        position={hitPos}
        onClick={brush}
        onPointerMove={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
          showTip("Brush the plant", e.nativeEvent.clientX, e.nativeEvent.clientY);
        }}
        onPointerOut={() => {
          document.body.style.cursor = "";
          hideTip();
        }}
      >
        <boxGeometry args={[0.5, 0.75, 0.35]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>
    </>
  );
}
