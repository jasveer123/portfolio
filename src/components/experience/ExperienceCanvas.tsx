"use client";

import { Component, Suspense, type ReactNode } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, PerformanceMonitor } from "@react-three/drei";
import { experienceStore, useExperience } from "@/lib/experience-store";
import { TIER_SETTINGS } from "@/lib/performance-tier";
import { GLBScene, PlaceholderScene } from "./ProjectorScene";

class SceneBoundary extends Component<{ fallback: ReactNode; children: ReactNode; onError?: (e: Error) => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error) {
    this.props.onError?.(error);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export function ExperienceCanvas() {
  const tier = useExperience((s) => s.performanceTier);
  if (tier === "static") return null;
  const settings = TIER_SETTINGS[tier];

  return (
    <SceneBoundary
      fallback={null}
      onError={(e) => {
        console.warn("[projector] WebGL unavailable, switching to the static portfolio.", e);
        experienceStore.getState().setPerformanceTier("static");
      }}
    >
      <Canvas
        dpr={settings.dpr}
        gl={{ antialias: settings.antialias, powerPreference: "high-performance", alpha: false, stencil: false }}
        camera={{ fov: 30, near: 0.05, far: 30, position: [0, 1.27, 2.5] }}
        style={{ touchAction: "pan-y" }}
        onCreated={({ gl, scene }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          gl.outputColorSpace = THREE.SRGBColorSpace;
          scene.background = new THREE.Color("#120e0b");
        }}
      >
        <PerformanceMonitor
          onDecline={() => {
            const t = experienceStore.getState().performanceTier;
            if (t === "high") experienceStore.getState().setPerformanceTier("medium");
            else if (t === "medium") experienceStore.getState().setPerformanceTier("low");
          }}
        />
        <AdaptiveDpr />
        <SceneBoundary
          fallback={<PlaceholderScene />}
          onError={(e) => console.warn("[projector] model failed to load — using placeholder projector.", e)}
        >
          <Suspense fallback={null}>
            <GLBScene />
          </Suspense>
        </SceneBoundary>
      </Canvas>
    </SceneBoundary>
  );
}
