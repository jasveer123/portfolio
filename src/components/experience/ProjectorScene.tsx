"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { experienceStore } from "@/lib/experience-store";
import { BAKE } from "@/lib/scene-config";
import { buildPlaceholderScene, mapModel, type ModelRig } from "@/lib/projector-model";
import { activate, controlFor, cursorFor, tooltipFor, wheelStep, type Control } from "./interaction";
import { hideTip, showTip } from "./Tooltip";
import { runtime } from "./runtime";
import { bakedMaterial, loadBakeTexture, sharedUniforms, type BakedUniforms } from "./bakedMaterial";
import { Projector } from "./Projector";
import { SlideCarousel } from "./SlideCarousel";
import { BrassViewDial } from "./BrassViewDial";
import { ProjectionBeam } from "./ProjectionBeam";
import { DustParticles } from "./DustParticles";
import { CameraRig } from "./CameraRig";
import { InteractionHints } from "./InteractionHints";
import { useFocusWheelDrag } from "./useFocusWheelDrag";
import { PlantSway } from "./PlantSway";
import { RoomShell } from "./RoomShell";

const MODEL_URL = "/models/projector.glb";
const DRACO_PATH = "/draco/";
const BAKE_URL = (group: string, state: "room" | "lamp") => `/models/bake/${group}-${state}.webp`;

export function GLBScene() {
  const gltf = useGLTF(MODEL_URL, DRACO_PATH);
  return <SceneContents root={gltf.scene} baked />;
}

export function PlaceholderScene() {
  const root = useMemo(() => buildPlaceholderScene(), []);
  return <SceneContents root={root} baked={false} />;
}

useGLTF.preload(MODEL_URL, DRACO_PATH);

/** Invisible, generous hit volumes so millimetre-scale controls are easy to hit. */
const HIT_SIZES: Record<string, [number, number, number]> = {
  power_switch: [0.04, 0.045, 0.04],
  next_slide_button: [0.03, 0.035, 0.04],
  previous_slide_button: [0.03, 0.035, 0.04],
  eject_button: [0.045, 0.03, 0.045],
  carousel_lever: [0.035, 0.06, 0.04],
  focus_wheel: [0.06, 0.085, 0.085],
  focus_ring: [0.12, 0.12, 0.09],
  Slide_Holder_Drawer: [0.12, 0.05, 0.06],
  Navigation_Dial_Base: [0.17, 0.14, 0.17],
};

function addHitVolumes(rig: ModelRig) {
  const mat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false });
  for (const [name, size] of Object.entries(HIT_SIZES)) {
    const node = rig.nodes[name as keyof ModelRig["nodes"]];
    if (!node || node.getObjectByName(`${name}__hit`)) continue;
    const hit = new THREE.Mesh(new THREE.BoxGeometry(...size), mat);
    hit.name = `${name}__hit`;
    if (name === "Navigation_Dial_Base") hit.position.y = 0.06;
    node.add(hit);
  }
}

/** Swap every mesh to the baked Cycles lighting. */
function applyBakes(root: THREE.Object3D) {
  const loader = new THREE.TextureLoader();
  const textures: Record<string, { room: THREE.Texture; lamp: THREE.Texture }> = {};
  const materials: THREE.ShaderMaterial[] = [];
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh || mesh.name.endsWith("__hit")) return;
    // glTF keeps extras on the node; multi-material meshes are children of that node
    const group = (mesh.userData.bake ?? mesh.parent?.userData.bake) as string | undefined;
    if (!group || !BAKE.groups[group]) return;
    textures[group] ??= { room: loadBakeTexture(loader, BAKE_URL(group, "room")), lamp: loadBakeTexture(loader, BAKE_URL(group, "lamp")) };
    const m = bakedMaterial(textures[group].room, textures[group].lamp, group === "wall");
    mesh.material = m;
    materials.push(m);
  });
  return { textures, materials };
}

/**
 * Set dressing scale (relative to the Blender model). Each object scales about
 * its own base, so it stays seated on the desk; the projection gets the room.
 */
const SET_SCALE: Record<string, number> = {
  Projector_Root: 0.8,
  Slide_Holder_Wood: 0.84,
  Navigation_Dial_Base: 0.84,
  Desk_Slide_Loose: 0.84,
  Notebook: 0.9,
};

function SceneContents({ root, baked }: { root: THREE.Object3D; baked: boolean }) {
  const gl = useThree((s) => s.gl);

  const rig = useMemo(() => {
    const r = mapModel(root, { warn: process.env.NODE_ENV !== "production" ? (m) => console.warn(m) : undefined });
    for (const [name, k] of Object.entries(SET_SCALE)) {
      const node = r.nodes[name as keyof ModelRig["nodes"]];
      if (node && !node.userData.setScaled) {
        node.scale.multiplyScalar(k);
        node.userData.setScaled = true;
      }
    }
    root.updateMatrixWorld(true);
    addHitVolumes(r);
    return r;
  }, [root]);

  const bakes = useMemo(() => (baked ? applyBakes(root) : null), [root, baked]);

  // the filmstrip is retired from the desk
  useEffect(() => {
    const film = root.getObjectByName("Film_Strip");
    if (film) film.visible = false;
  }, [root]);

  useEffect(() => {
    if (bakes) {
      const aniso = Math.min(8, gl.capabilities.getMaxAnisotropy());
      Object.values(bakes.textures).forEach((t) => (t.room.anisotropy = t.lamp.anisotropy = aniso));
    }
    experienceStore.getState().setSceneReady(true);
    return () => {
      experienceStore.getState().setSceneReady(false);
      bakes?.materials.forEach((m) => m.dispose());
      if (bakes) Object.values(bakes.textures).forEach((t) => (t.room.dispose(), t.lamp.dispose()));
    };
  }, [bakes, gl]);

  // drive every baked material from the bulb level
  useFrame((state) => {
    sharedUniforms.uLevel.value = runtime.level;
    // the room falls back while the projector is the main light
    sharedUniforms.uRoomGain.value = 1 - 0.78 * Math.min(1, runtime.level);
    sharedUniforms.uTime.value = state.clock.elapsedTime;
  });

  // hover: a faint warm lift on baked meshes
  const lastHover = useRef<THREE.Object3D | null>(null);
  const setHighlight = (node: THREE.Object3D | null, on: boolean) => {
    node?.traverse((o) => {
      const u = ((o as THREE.Mesh).material as THREE.ShaderMaterial | undefined)?.uniforms as BakedUniforms | undefined;
      if (u?.uHighlight) u.uHighlight.value.setRGB(on ? 0.05 : 0, on ? 0.032 : 0, on ? 0.012 : 0);
    });
  };

  const focusDrag = useFocusWheelDrag();

  const setHover = (hit: { control: Control; node: THREE.Object3D } | null, e?: ThreeEvent<PointerEvent>) => {
    const node = hit?.node ?? null;
    if (lastHover.current !== node) {
      setHighlight(lastHover.current, false);
      setHighlight(node, true);
      lastHover.current = node;
    }
    runtime.hovered = node?.name.replace(/__hit$/, "") ?? null;
    document.body.style.cursor = hit ? cursorFor(hit.control) : "";
    if (hit && e) showTip(tooltipFor(hit.control), e.nativeEvent.clientX, e.nativeEvent.clientY);
    else hideTip();
  };

  const onMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (e.pointerType === "touch") return;
    setHover(controlFor(e.object), e);
  };

  const onDown = (e: ThreeEvent<PointerEvent>) => {
    const hit = controlFor(e.object);
    if (!hit) return;
    e.stopPropagation();
    if (hit.control.kind === "focus") focusDrag.start(e.nativeEvent);
  };

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    const hit = controlFor(e.object);
    if (!hit) return;
    e.stopPropagation();
    if (hit.control.kind === "focus" || e.delta > 6) return;
    activate(hit.control);
    hideTip();
  };

  const onWheel = (e: ThreeEvent<WheelEvent>) => {
    const hit = controlFor(e.object);
    if (hit && wheelStep(hit.control, e.nativeEvent.deltaY)) e.stopPropagation();
  };

  useEffect(() => () => void (document.body.style.cursor = ""), []);

  return (
    <>
      <CameraRig rig={rig} />
      <primitive
        object={root}
        onPointerMove={onMove}
        onPointerOut={() => setHover(null)}
        onPointerDown={onDown}
        onClick={onClick}
        onWheel={onWheel}
      />
      <RoomShell />
      <Projector rig={rig} />
      <SlideCarousel rig={rig} />
      <BrassViewDial rig={rig} />
      <ProjectionBeam />
      <DustParticles />
      <InteractionHints rig={rig} />
      {baked && BAKE.leaf_light && BAKE.plant_pivot && <PlantSway root={root} />}
    </>
  );
}
