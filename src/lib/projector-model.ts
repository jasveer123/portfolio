import * as THREE from "three";

/**
 * Projector model contract.
 *
 * Replacing the model:
 *   1. Re-run `scripts/export-projector.py` (see its header) or export your own
 *      GLB to `public/models/projector.glb` with Draco compression.
 *   2. Keep the node names below. Missing nodes are reported in development
 *      and replaced with simple primitives, so the experience keeps working.
 *   3. Pivots matter: rotating parts (focus_wheel, slide_carousel, cooling_fan,
 *      power_switch, Navigation_Dial_Base) must have their origin on their axis.
 *   4. Axes (three.js local space): carousel spins on Y, focus wheel on X,
 *      fan on Z, power switch tilts on X, lens looks down −Z.
 */

export const PROJECTOR_NODES = [
  "Projector_Root",
  "projector_body",
  "projection_lens",
  "focus_ring",
  "focus_wheel",
  "slide_carousel",
  "carousel_lock",
  "slide_gate",
  "slide_01",
  "slide_02",
  "slide_03",
  "slide_04",
  "slide_05",
  "power_switch",
  "next_slide_button",
  "previous_slide_button",
  "eject_button",
  "indicator_lamp",
  "cooling_fan",
  "carrying_handle",
  "power_cable",
  "lens_origin",
  "lens_bulb_glow",
  "carousel_lever",
  "side_indicator_lamp",
] as const;

export const DESK_NODES = [
  "Desk_Top_Rustic",
  "Wall",
  "Floor",
  "Slide_Holder_Wood",
  "Slide_Holder_Drawer",
  "Desk_Slide_01",
  "Desk_Slide_02",
  "Desk_Slide_03",
  "Desk_Slide_04",
  "Desk_Slide_05",
  "Desk_Slide_Loose",
  "Navigation_Dial_Base",
  "Notebook",
  "Fountain_Pen",
] as const;

export type ProjectorNodeName = (typeof PROJECTOR_NODES)[number];
export type DeskNodeName = (typeof DESK_NODES)[number];
export type NodeName = ProjectorNodeName | DeskNodeName;

/** Nodes we can live without (purely decorative). */
const OPTIONAL = new Set<NodeName>(["power_cable", "carrying_handle", "lens_bulb_glow", "side_indicator_lamp", "Fountain_Pen", "Floor"]);

export const CAROUSEL_SLIDES = ["slide_01", "slide_02", "slide_03", "slide_04", "slide_05"] as const;
export const DESK_SLIDES = ["Desk_Slide_01", "Desk_Slide_02", "Desk_Slide_03", "Desk_Slide_04", "Desk_Slide_05"] as const;

export type ModelRig = {
  nodes: Record<NodeName, THREE.Object3D>;
  missing: NodeName[];
  fallbacks: NodeName[];
};

const ivory = () => new THREE.MeshStandardMaterial({ color: "#c8b994", roughness: 0.8 });
const olive = () => new THREE.MeshStandardMaterial({ color: "#3a3d2e", roughness: 0.5, metalness: 0.4 });
const bakelite = () => new THREE.MeshStandardMaterial({ color: "#1b1512", roughness: 0.35 });
const brass = () => new THREE.MeshStandardMaterial({ color: "#a47a3c", roughness: 0.35, metalness: 1 });
const walnut = () => new THREE.MeshStandardMaterial({ color: "#3d2414", roughness: 0.55 });

/** Approximate fallback primitives, in the parent's local space of the real model. */
type FallbackSpec = { parent: NodeName | null; make: () => THREE.Object3D; position: [number, number, number] };

const cyl = (r: number, h: number, mat: THREE.Material, axis: "x" | "y" | "z" = "y") => {
  const geo = new THREE.CylinderGeometry(r, r, h, 24);
  if (axis === "x") geo.rotateZ(Math.PI / 2);
  if (axis === "z") geo.rotateX(Math.PI / 2);
  return new THREE.Mesh(geo, mat);
};
const box = (x: number, y: number, z: number, mat: THREE.Material) => new THREE.Mesh(new THREE.BoxGeometry(x, y, z), mat);

const slideMesh = (rotY: number) => {
  const m = box(0.05, 0.05, 0.002, ivory());
  m.rotation.y = rotY;
  return m;
};

const FALLBACKS: Partial<Record<NodeName, FallbackSpec>> = {
  Projector_Root: { parent: null, make: () => new THREE.Group(), position: [0.86, 0.763, 0.1] },
  projector_body: { parent: "Projector_Root", make: () => { const m = box(0.26, 0.135, 0.3, olive()); m.position.y = 0.067; const g = new THREE.Group(); g.add(m); return g; }, position: [0, 0, 0] },
  projection_lens: { parent: "Projector_Root", make: () => cyl(0.04, 0.11, bakelite(), "z"), position: [-0.035, 0.064, -0.157] },
  focus_ring: { parent: "Projector_Root", make: () => cyl(0.046, 0.04, bakelite(), "z"), position: [-0.035, 0.064, -0.207] },
  focus_wheel: { parent: "Projector_Root", make: () => cyl(0.026, 0.018, brass(), "x"), position: [0.138, 0.055, -0.095] },
  slide_carousel: { parent: "Projector_Root", make: () => cyl(0.128, 0.06, bakelite()), position: [0, 0.132, 0.015] },
  carousel_lock: { parent: "slide_carousel", make: () => cyl(0.07, 0.02, bakelite()), position: [0, 0.044, 0] },
  slide_gate: { parent: "Projector_Root", make: () => box(0.064, 0.006, 0.016, brass()), position: [0, 0.126, -0.079] },
  slide_01: { parent: "slide_carousel", make: () => slideMesh(0), position: [0, 0.037, -0.094] },
  slide_02: { parent: "slide_carousel", make: () => slideMesh((72 * Math.PI) / 180), position: [-0.089, 0.037, -0.029] },
  slide_03: { parent: "slide_carousel", make: () => slideMesh((144 * Math.PI) / 180), position: [-0.055, 0.037, 0.076] },
  slide_04: { parent: "slide_carousel", make: () => slideMesh((216 * Math.PI) / 180), position: [0.055, 0.037, 0.076] },
  slide_05: { parent: "slide_carousel", make: () => slideMesh((288 * Math.PI) / 180), position: [0.089, 0.037, -0.029] },
  power_switch: { parent: "Projector_Root", make: () => box(0.014, 0.022, 0.009, bakelite()), position: [0.098, 0.131, 0.128] },
  next_slide_button: { parent: "Projector_Root", make: () => box(0.018, 0.01, 0.008, bakelite()), position: [0.09, 0.09, 0.153] },
  previous_slide_button: { parent: "Projector_Root", make: () => box(0.018, 0.01, 0.008, bakelite()), position: [0.055, 0.09, 0.153] },
  eject_button: { parent: "Projector_Root", make: () => cyl(0.008, 0.007, new THREE.MeshStandardMaterial({ color: "#6b2615" })), position: [0.1, 0.129, -0.122] },
  indicator_lamp: { parent: "Projector_Root", make: () => new THREE.Mesh(new THREE.SphereGeometry(0.008, 16, 8), new THREE.MeshStandardMaterial({ color: "#ff7314" })), position: [0.098, 0.131, 0.105] },
  cooling_fan: { parent: "Projector_Root", make: () => cyl(0.035, 0.012, bakelite(), "z"), position: [-0.055, 0.064, 0.138] },
  carousel_lever: { parent: "Projector_Root", make: () => box(0.011, 0.046, 0.016, bakelite()), position: [0.134, 0.085, -0.02] },
  lens_origin: { parent: "Projector_Root", make: () => new THREE.Object3D(), position: [-0.035, 0.064, -0.215] },
  Desk_Top_Rustic: { parent: null, make: () => { const m = box(2.8, 0.055, 1.2, walnut()); m.position.y = -0.0275; return m; }, position: [0, 0.75, -0.17] },
  Wall: { parent: null, make: () => box(5, 3.2, 0.06, new THREE.MeshStandardMaterial({ color: "#8f7c64", roughness: 0.9 })), position: [0, 1.6, -0.83] },
  Slide_Holder_Wood: { parent: null, make: () => { const m = box(0.615, 0.075, 0.113, walnut()); m.position.y = 0.0375; return m; }, position: [-0.08, 0.75, 0.17] },
  Slide_Holder_Drawer: { parent: "Slide_Holder_Wood", make: () => box(0.1, 0.03, 0.03, walnut()), position: [0.23, 0.015, 0.07] },
  Desk_Slide_01: { parent: "Slide_Holder_Wood", make: () => box(0.095, 0.095, 0.003, ivory()), position: [-0.22, 0.064, -0.02] },
  Desk_Slide_02: { parent: "Slide_Holder_Wood", make: () => box(0.095, 0.095, 0.003, ivory()), position: [-0.11, 0.064, -0.02] },
  Desk_Slide_03: { parent: "Slide_Holder_Wood", make: () => box(0.095, 0.095, 0.003, ivory()), position: [0, 0.064, -0.02] },
  Desk_Slide_04: { parent: "Slide_Holder_Wood", make: () => box(0.095, 0.095, 0.003, ivory()), position: [0.11, 0.064, -0.02] },
  Desk_Slide_05: { parent: "Slide_Holder_Wood", make: () => box(0.095, 0.095, 0.003, ivory()), position: [0.22, 0.064, -0.02] },
  Desk_Slide_Loose: { parent: null, make: () => box(0.1, 0.003, 0.1, ivory()), position: [0.02, 0.752, 0.35] },
  Navigation_Dial_Base: { parent: null, make: () => { const g = new THREE.Group(); const b = cyl(0.075, 0.035, bakelite()); b.position.y = 0.0175; const d = cyl(0.05, 0.05, brass()); d.position.y = 0.06; g.add(b, d); return g; }, position: [0.42, 0.75, 0.32] },
  Notebook: { parent: null, make: () => box(0.3, 0.02, 0.21, new THREE.MeshStandardMaterial({ color: "#0d1f1f" })), position: [-0.78, 0.76, 0.2] },
};

/**
 * Map the loaded scene onto the expected node names. Missing required nodes are
 * replaced by primitives so every interaction keeps a target.
 */
export function mapModel(root: THREE.Object3D, opts: { warn?: (msg: string) => void } = {}): ModelRig {
  const nodes = {} as Record<NodeName, THREE.Object3D>;
  const missing: NodeName[] = [];
  const fallbacks: NodeName[] = [];
  const all = [...PROJECTOR_NODES, ...DESK_NODES] as NodeName[];

  for (const name of all) {
    const found = root.getObjectByName(name);
    if (found) nodes[name] = found;
  }
  // build fallbacks parents-first
  const ordered = all.filter((n) => !nodes[n]).sort((a, b) => depth(a) - depth(b));
  for (const name of ordered) {
    missing.push(name);
    const spec = FALLBACKS[name];
    if (!spec) {
      if (!OPTIONAL.has(name)) opts.warn?.(`[projector] required node "${name}" is missing and has no fallback`);
      nodes[name] = new THREE.Object3D(); // inert placeholder keeps refs valid
      nodes[name].name = name;
      continue;
    }
    const obj = spec.make();
    obj.name = name;
    obj.position.set(...spec.position);
    (spec.parent ? nodes[spec.parent] ?? root : root).add(obj);
    nodes[name] = obj;
    fallbacks.push(name);
  }
  const required = missing.filter((n) => !OPTIONAL.has(n));
  if (required.length) {
    opts.warn?.(`[projector] model is missing ${required.length} node(s); using primitives for: ${required.join(", ")}`);
  }
  return { nodes, missing, fallbacks };
}

function depth(name: NodeName): number {
  let d = 0;
  let p = FALLBACKS[name]?.parent ?? null;
  while (p) {
    d++;
    p = FALLBACKS[p]?.parent ?? null;
  }
  return d;
}

/** Build a complete placeholder rig when the GLB cannot be loaded at all. */
export function buildPlaceholderScene(): THREE.Group {
  const group = new THREE.Group();
  group.name = "placeholder_scene";
  mapModel(group);
  return group;
}
