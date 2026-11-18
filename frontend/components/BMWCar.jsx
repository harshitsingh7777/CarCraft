"use client";

import { Center, useGLTF } from "@react-three/drei";

export default function BMWCar(props) {
  const { scene } = useGLTF("/models/bmw_m4.glb");

  scene.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;

      if (child.material) {
        child.material.envMapIntensity = 1.5;
      }
    }
  });

  return (
    <Center>
      <primitive
        object={scene}
        {...props}
      />
    </Center>
  );
}

useGLTF.preload("/models/bmw_m4.glb");