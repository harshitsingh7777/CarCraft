"use client";

import { useFrame } from "@react-three/fiber";
import { Center, useGLTF } from "@react-three/drei";
import { useRef } from "react";

export default function MovingCar({
  position = [0, -1, -6],
  scale = 0.25,
  speed = 2,
}) {
  const carRef = useRef();
  const { scene } = useGLTF("/models/bmw_m4.glb");

  const baseY = position[1];

  useFrame((state, delta) => {
    if (!carRef.current) return;

    // Move the car forward
    carRef.current.position.z += speed * delta;

    // Loop the car back to the distance
    if (carRef.current.position.z > 25) {
      carRef.current.position.z = -35;
    }

    // Small suspension movement
    carRef.current.position.y =
      baseY +
      Math.sin(state.clock.elapsedTime * 8) * 0.008;
  });

  return (
    <group
      ref={carRef}
      position={position}
    >
      <Center>
        <primitive
          object={scene}
          rotation={[0, Math.PI, 0]}
          scale={scale}
        />
      </Center>
    </group>
  );
}

useGLTF.preload("/models/bmw_m4.glb");