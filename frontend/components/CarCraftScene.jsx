"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";

import RainyHighway from "../scenes/RainyHighway";
import { QUALITY, detectQuality } from "../lib/three/performance";
import LensDroplets from "./3d/LensDroplets";

export default function CarCraftScene() {
  const [tier, setTier] = useState(null);

  useEffect(() => {
    setTier(detectQuality());
  }, []);

  if (!tier) {
    return (
      <div className="fixed inset-0 bg-[#020304]" />
    );
  }

  const q = QUALITY[tier];

  return (
    <div className="fixed inset-0 bg-[#020304]">
      <Canvas
        flat
        dpr={q.dpr}
        camera={{
          fov: 42,
          near: 0.1,
          far: 600,
          position: [-2, 3, 15],
        }}
        gl={{
          antialias: false,
          powerPreference: "high-performance",
        }}
      >
        <PerformanceMonitor
          flipflops={2}
          onFallback={() => setTier("low")}
        />

        <Suspense fallback={null}>
          <RainyHighway quality={q} />
        </Suspense>
      </Canvas>

      <LensDroplets />
    </div>
  );
}