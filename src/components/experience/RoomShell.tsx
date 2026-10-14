"use client";

import { useMemo } from "react";
import * as THREE from "three";

/**
 * The baked set is a single wall and floor. When orbiting, these dim side walls
 * and ceiling stand in for the rest of the room so the edge reads as a shadowed
 * corner instead of empty space. Unlit, with a soft vertical falloff.
 */
export function RoomShell() {
  const material = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 4;
    c.height = 256;
    const g = c.getContext("2d")!;
    const grad = g.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, "#0e0a07");
    grad.addColorStop(0.55, "#2a2018");
    grad.addColorStop(1, "#150f0b");
    g.fillStyle = grad;
    g.fillRect(0, 0, 4, 256);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide, toneMapped: false });
  }, []);
  const ceiling = useMemo(() => new THREE.MeshBasicMaterial({ color: "#0c0806", side: THREE.DoubleSide }), []);

  return (
    <group>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 2.5, 1.6, 1.2]} rotation={[0, (side * Math.PI) / 2, 0]} material={material} raycast={() => null}>
          <planeGeometry args={[4.1, 3.2]} />
        </mesh>
      ))}
      <mesh position={[0, 3.2, 1.2]} rotation={[Math.PI / 2, 0, 0]} material={ceiling} raycast={() => null}>
        <planeGeometry args={[5, 4.1]} />
      </mesh>
    </group>
  );
}
