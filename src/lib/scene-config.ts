import * as THREE from "three";
import manifest from "../../public/models/bake/manifest.json";

/**
 * Scene facts exported by scripts/bake-projector.py — the Blender camera, the
 * projection rectangle on the wall and the lens position. Blender is Z-up;
 * three.js is Y-up: (x, y, z)_blender → (x, z, −y)_three.
 */
export type LayoutMode = "split" | "stacked";

export const BAKE = manifest as {
  scale: number;
  gamma: number;
  groups: Record<string, number>;
  rect: { x0: number; x1: number; z0: number; z1: number; y: number };
  camera: { location: number[]; rotation_euler: number[]; lens: number; sensor_width: number; aspect: number };
  lens_origin: number[];
  /** present in bakes that split the plant out (live plant shadow) */
  leaf_light?: { location: number[]; direction: number[]; spot_size: number; spot_blend: number; radius: number };
  plant_pivot?: number[];
};

export const toThree = (v: number[]) => new THREE.Vector3(v[0], v[2], -v[1]);

/**
 * The projected frame. Its height comes from the bake; the left edge is pulled
 * in so the olive branches in front of the wall don't cross the text.
 */
const r = { ...BAKE.rect, x0: BAKE.rect.x0 + 0.25, z0: BAKE.rect.z0 - 0.05, z1: BAKE.rect.z1 + 0.04 };
/** Projection rectangle corners on the wall (TL, TR, BR, BL), slightly in front of the plaster. */
export const RECT_CORNERS = [
  new THREE.Vector3(r.x0, r.z1, -r.y + 0.001),
  new THREE.Vector3(r.x1, r.z1, -r.y + 0.001),
  new THREE.Vector3(r.x1, r.z0, -r.y + 0.001),
  new THREE.Vector3(r.x0, r.z0, -r.y + 0.001),
];
export const RECT_BOUNDS = { x0: r.x0, x1: r.x1, y0: r.z0, y1: r.z1, z: -r.y };
export const LENS_ORIGIN = toThree(BAKE.lens_origin);

const cam = BAKE.camera;
/** Horizontal field of view of the Blender camera (sensor fit: horizontal). */
export const CAMERA_HFOV = 2 * Math.atan(cam.sensor_width / 2 / cam.lens);
const REF_ASPECT = cam.aspect;

/** Camera pose in three.js space. */
export const CAMERA_POSE = (() => {
  // Blender XYZ euler = extrinsic X, Y, Z → three order "ZYX" in Blender space
  const [rx, ry, rz] = cam.rotation_euler;
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, "ZYX"));
  const fwdB = new THREE.Vector3(0, 0, -1).applyQuaternion(q);
  const upB = new THREE.Vector3(0, 1, 0).applyQuaternion(q);
  return {
    position: toThree(cam.location),
    forward: new THREE.Vector3(fwdB.x, fwdB.z, -fwdB.y),
    up: new THREE.Vector3(upB.x, upB.z, -upB.y),
  };
})();

/**
 * Vertical FOV for a viewport: keep the Blender framing's width on narrower
 * screens (more floor/ceiling shows) and its height on wider ones (sides crop).
 */
/** Slightly tighter than the Blender camera so the projection fills more of the frame. */
const FRAME_ZOOM = 1.08;
/** Small upward tilt (radians) so the larger projection stays clear of the top edge. */
const FRAME_PITCH = 0.022;

export function verticalFov(aspect: number): number {
  const t = Math.tan(CAMERA_HFOV / 2) / FRAME_ZOOM;
  return 2 * Math.atan(t / Math.max(0.2, Math.min(aspect, REF_ASPECT)));
}

export function applyCamera(camera: THREE.PerspectiveCamera, aspect: number) {
  camera.position.copy(CAMERA_POSE.position);
  camera.up.copy(CAMERA_POSE.up);
  camera.lookAt(CAMERA_POSE.position.clone().add(CAMERA_POSE.forward));
  camera.rotateX(FRAME_PITCH);
  camera.fov = THREE.MathUtils.radToDeg(verticalFov(aspect));
  camera.aspect = aspect;
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld(true);
}

/** Pixel bounding box of the projection rectangle for a viewport. Works without WebGL. */
export function screenRectFor(width: number, height: number) {
  const camera = new THREE.PerspectiveCamera(50, width / height, 0.05, 40);
  applyCamera(camera, width / height);
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const c of RECT_CORNERS) {
    const p = c.clone().project(camera);
    const px = ((p.x + 1) / 2) * width;
    const py = ((1 - p.y) / 2) * height;
    x0 = Math.min(x0, px); x1 = Math.max(x1, px);
    y0 = Math.min(y0, py); y1 = Math.max(y1, py);
  }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

export function layoutModeFor(width: number, height: number): LayoutMode {
  return width >= 1024 && width / height >= 1.25 ? "split" : "stacked";
}
