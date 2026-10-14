"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { experienceStore, useExperience, type ViewMode } from "@/lib/experience-store";
import { applyCamera } from "@/lib/scene-config";
import type { ModelRig } from "@/lib/projector-model";
import { runtime } from "./runtime";

type Pose = { position: THREE.Vector3; quaternion: THREE.Quaternion; fov: number };

/** The Blender framing (see scene-config). */
function framedPose(aspect: number): Pose {
  const cam = new THREE.PerspectiveCamera();
  applyCamera(cam, aspect);
  return { position: cam.position.clone(), quaternion: cam.quaternion.clone(), fov: cam.fov };
}

/** A step back from the room — the visitor is standing in the doorway. */
function introPose(aspect: number): Pose {
  const f = framedPose(aspect);
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(f.quaternion);
  // one step back — the baked set is a single wall, so stay inside its edges
  const position = f.position.clone().addScaledVector(forward, -1.0).add(new THREE.Vector3(-0.12, 0.1, 0));
  const look = f.position.clone().addScaledVector(forward, 3.3).add(new THREE.Vector3(0, -0.08, 0));
  const cam = new THREE.PerspectiveCamera();
  cam.position.copy(position);
  cam.lookAt(look);
  return { position, quaternion: cam.quaternion.clone(), fov: f.fov };
}

/**
 * Camera states:
 *   intro   — stepped back from the room behind the welcome note
 *   framed  — the Blender camera; the projection lines up with the HTML
 *   explore — free orbit / pan / zoom around the set, like Blender's viewport
 * Also publishes the drawer's screen position for the résumé drawer overlay.
 */
export function CameraRig({ rig }: { rig: ModelRig }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const mode = useExperience((s) => s.viewMode);
  const controls = useRef<OrbitControlsImpl | null>(null);
  const tween = useRef<gsap.core.Tween | null>(null);
  const moving = useRef(false);
  const prevMode = useRef<ViewMode | null>(null);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const last = useRef("");

  const poseFor = (m: ViewMode, aspect: number) => (m === "intro" ? introPose(aspect) : framedPose(aspect));

  const jump = (p: Pose) => {
    camera.position.copy(p.position);
    camera.quaternion.copy(p.quaternion);
    camera.fov = p.fov;
    camera.updateProjectionMatrix();
  };

  const glide = (to: Pose, duration: number, onDone?: () => void) => {
    tween.current?.kill();
    const fromPos = camera.position.clone();
    const fromQ = camera.quaternion.clone();
    const fromFov = camera.fov;
    const proxy = { t: 0 };
    moving.current = true;
    tween.current = gsap.to(proxy, {
      t: 1,
      duration,
      ease: "power2.inOut",
      onUpdate: () => {
        camera.position.lerpVectors(fromPos, to.position, proxy.t);
        camera.quaternion.slerpQuaternions(fromQ, to.quaternion, proxy.t);
        camera.fov = THREE.MathUtils.lerp(fromFov, to.fov, proxy.t);
        camera.updateProjectionMatrix();
      },
      onComplete: () => {
        moving.current = false;
        onDone?.();
      },
    });
  };

  // aspect changes: snap to the current pose (never mid-orbit)
  useEffect(() => {
    camera.aspect = size.width / size.height;
    camera.updateProjectionMatrix();
    const m = experienceStore.getState().viewMode;
    if (m !== "explore" && !moving.current) jump(poseFor(m, camera.aspect));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, size]);

  // mode transitions
  useEffect(() => {
    const aspect = size.width / size.height;
    const reduced = experienceStore.getState().reducedMotion;
    const from = prevMode.current;
    prevMode.current = mode;
    if (from === null) {
      jump(poseFor(mode === "explore" ? "framed" : mode, aspect));
      return;
    }
    if (mode === "explore") {
      // orbit around a point on the wall straight ahead, so nothing jumps
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      controls.current?.target.copy(camera.position).addScaledVector(forward, 2.2);
      controls.current?.update();
      return;
    }
    glide(poseFor(mode, aspect), reduced ? 0 : from === "intro" ? 2.4 : 1.2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => () => void tween.current?.kill(), []);

  // Esc leaves explore mode
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && experienceStore.getState().viewMode === "explore") experienceStore.getState().setViewMode("framed");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useFrame(({ gl }) => {
    rig.nodes.lens_origin.getWorldPosition(runtime.lens);
    rig.nodes.Slide_Holder_Drawer.getWorldPosition(tmp).project(camera);
    const r = gl.domElement.getBoundingClientRect();
    const x = Math.round(r.left + ((tmp.x + 1) / 2) * r.width);
    const y = Math.round(r.top + ((1 - tmp.y) / 2) * r.height);
    const key = `${x},${y}`;
    if (key !== last.current) {
      last.current = key;
      document.documentElement.style.setProperty("--drawer-x", `${x}px`);
      document.documentElement.style.setProperty("--drawer-y", `${y}px`);
    }
  });

  return (
    <OrbitControls
      ref={controls}
      enabled={mode === "explore"}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.6}
      panSpeed={0.7}
      zoomSpeed={0.8}
      minDistance={0.7}
      maxDistance={2.5}
      minPolarAngle={1.0}
      maxPolarAngle={1.62}
      minAzimuthAngle={-0.32}
      maxAzimuthAngle={0.32}
      screenSpacePanning
      // the set is one wall deep — keep the orbit inside it
    />
  );
}
