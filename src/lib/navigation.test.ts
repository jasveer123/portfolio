import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { buildUrl, parseRoute } from "./sections";
import { blurForValue, dragFocus, nearestDetent, snapValue, stepFocus, valueForView, viewForValue } from "./focus";
import { decideTier } from "./performance-tier";
import { buildPlaceholderScene, mapModel, PROJECTOR_NODES } from "./projector-model";
import { projects } from "./project-data";
import { experienceFrames } from "./experience-data";

describe("routes", () => {
  it("parses and builds linkable views", () => {
    expect(parseRoute("/work/asi1", "?view=architecture")).toMatchObject({ section: "work", project: "asi1", view: "architecture" });
    expect(parseRoute("/work/unknown")).toMatchObject({ section: "work", project: null });
    expect(parseRoute("/work/asi1", "?view=nonsense").view).toBe("product");
    expect(parseRoute("/experience", "frame=jasper-colin").frame).toBe("jasper-colin");
    expect(parseRoute("/nope").section).toBe("about");
    expect(buildUrl({ section: "work", project: "asi1", view: "impact" })).toBe("/work/asi1?view=impact");
    expect(buildUrl({ section: "work", project: "asi1", view: "product" })).toBe("/work/asi1");
    expect(buildUrl({ section: "contact" })).toBe("/contact");
  });
});

describe("focus wheel", () => {
  it("has four detents across a controlled range", () => {
    expect(viewForValue(0)).toBe("product");
    expect(viewForValue(1)).toBe("impact");
    expect(nearestDetent(0.4)).toBe(1);
    expect(snapValue(0.9)).toBeCloseTo(1);
    expect(valueForView("engineering")).toBeCloseTo(2 / 3);
  });

  it("is sharp at a detent and blurriest halfway", () => {
    expect(blurForValue(1 / 3)).toBeCloseTo(0);
    expect(blurForValue(1 / 6)).toBeGreaterThan(blurForValue(0.25));
  });

  it("resists leaving a detent and never spins past its ends", () => {
    expect(dragFocus(0, 0.1)).toBeLessThan(0.1);
    expect(dragFocus(0.9, 1)).toBe(1);
    expect(dragFocus(0.1, -1)).toBe(0);
    expect(stepFocus(1, 1)).toBe(1);
    expect(stepFocus(0, 1)).toBeCloseTo(1 / 3);
  });
});

describe("performance tier", () => {
  const base = { webgl: true, width: 1440, coarsePointer: false };
  it("falls back to static without WebGL or on very low-power devices", () => {
    expect(decideTier({ ...base, webgl: false })).toBe("static");
    expect(decideTier({ ...base, deviceMemory: 2 })).toBe("static");
    expect(decideTier({ ...base, saveData: true })).toBe("static");
  });
  it("picks lighter tiers for touch devices", () => {
    expect(decideTier({ ...base, width: 390, coarsePointer: true })).toBe("low");
    expect(decideTier({ ...base, width: 1024, coarsePointer: true })).toBe("medium");
    expect(decideTier(base)).toBe("high");
    expect(decideTier({ ...base, forced: "static" })).toBe("static");
  });
});

describe("projector model mapping", () => {
  it("maps every expected node and fills gaps with primitives", () => {
    const root = new THREE.Group();
    const real = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial());
    real.name = "projector_body";
    root.add(real);
    const warnings: string[] = [];
    const rig = mapModel(root, { warn: (m) => warnings.push(m) });
    expect(rig.nodes.projector_body).toBe(real);
    for (const n of PROJECTOR_NODES) expect(rig.nodes[n]).toBeDefined();
    expect(rig.fallbacks).toContain("focus_wheel");
    expect(rig.nodes.slide_03.parent).toBe(rig.nodes.slide_carousel);
    expect(warnings.some((w) => w.includes("missing"))).toBe(true);
  });

  it("builds a complete placeholder projector", () => {
    const scene = buildPlaceholderScene();
    expect(scene.getObjectByName("power_switch")).toBeDefined();
    expect(scene.getObjectByName("slide_05")).toBeDefined();
  });
});

describe("content", () => {
  it("has the five projects and three companies in order", () => {
    expect(projects.map((p) => p.slug)).toEqual(["asi1", "fetch-integrations", "jasper-ops", "web3-gateway", "globacap"]);
    expect(experienceFrames.map((f) => f.company)).toEqual(["Celebal Technologies", "Hashtrust Technologies", "Jasper Colin"]);
    for (const p of projects.filter((x) => x.confidential)) expect(p.images.hero).toBeUndefined();
  });
});
