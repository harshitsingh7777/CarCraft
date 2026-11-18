"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, Color } from "three";
import { getGlowTexture } from "../../lib/three/textures";

// Colours above 1.0 are what make bloom pick the light up.
const hot = (hex, k) => new Color(hex).multiplyScalar(k);
const HEAD = hot("#e6f0ff", 4);
const TAIL = hot("#ff1208", 3.5);
const RED = hot("#ff1a10", 5);
const BLUE = hot("#2a5bff", 5);

function Halo({ position, size, color, opacity }) {
  return (
    <sprite position={position} scale={[size, size, 1]}>
      <spriteMaterial
        map={getGlowTexture()} color={color} transparent opacity={opacity}
        blending={AdditiveBlending} depthWrite={false} toneMapped={false}
      />
    </sprite>
  );
}

function Pool({ position, size, color, opacity }) {
  return (
    <mesh position={position} rotation-x={-Math.PI / 2} renderOrder={2}>
      <planeGeometry args={size} />
      <meshBasicMaterial
        map={getGlowTexture()} color={color} transparent opacity={opacity}
        blending={AdditiveBlending} depthWrite={false} toneMapped={false}
      />
    </mesh>
  );
}

/** Real spotlight so the wet road actually reflects the headlights. */
function Headlamp({ length, height }) {
  const spot = useRef();
  const target = useRef();
  useEffect(() => {
    if (spot.current && target.current) spot.current.target = target.current;
  }, []);
  return (
    <>
      <spotLight
        ref={spot} position={[0, height * 0.4, length / 2]} angle={0.4} penumbra={1}
        intensity={110} distance={40} decay={2} color="#dbe8ff"
      />
      <object3D ref={target} position={[0, 0, length / 2 + 12]} />
    </>
  );
}

export default function VehicleLights({ dims, siren = false, sirenLight = false }) {
  const { width: w, height: h, length: l } = dims;
  const red = useRef();
  const blue = useRef();
  const light = useRef();

  useFrame(({ clock }) => {
    if (!siren) return;
    const phase = Math.floor(clock.elapsedTime * 5) % 2 === 0;
    if (red.current) red.current.visible = phase;
    if (blue.current) blue.current.visible = !phase;
    if (light.current) light.current.color.setHex(phase ? 0xff1a10 : 0x2a5bff);
  });

  return (
    <>
      <Headlamp length={l} height={h} />

      {/* headlights: thin DRL bars + halo */}
      {[-1, 1].map((s) => (
        <group key={`h${s}`}>
          <mesh position={[s * w * 0.3, h * 0.36, l / 2 - 0.04]}>
            <boxGeometry args={[w * 0.16, h * 0.025, 0.04]} />
            <meshBasicMaterial color={HEAD} toneMapped={false} />
          </mesh>
          <Halo position={[s * w * 0.3, h * 0.36, l / 2 + 0.1]} size={0.7} color="#cfe3ff" opacity={0.4} />
        </group>
      ))}
      <Pool position={[0, 0.03, l / 2 + 5]} size={[w * 1.5, 9]} color="#cfe3ff" opacity={0.08} />

      {/* taillights */}
      {[-1, 1].map((s) => (
        <group key={`t${s}`}>
          <mesh position={[s * w * 0.3, h * 0.55, -l / 2 + 0.04]}>
            <boxGeometry args={[w * 0.22, h * 0.03, 0.04]} />
            <meshBasicMaterial color={TAIL} toneMapped={false} />
          </mesh>
          <Halo position={[s * w * 0.3, h * 0.55, -l / 2 - 0.1]} size={0.6} color="#ff1a10" opacity={0.4} />
        </group>
      ))}
      <Pool position={[0, 0.03, -l / 2 - 1.6]} size={[w * 1.4, 3.5]} color="#ff1408" opacity={0.15} />

      {siren && (
        <>
          <group ref={red}>
            <mesh position={[-w * 0.2, h + 0.03, -0.2]}>
              <boxGeometry args={[w * 0.28, 0.06, 0.16]} />
              <meshBasicMaterial color={RED} toneMapped={false} />
            </mesh>
            <Halo position={[-w * 0.2, h + 0.1, -0.2]} size={1.2} color="#ff1a10" opacity={0.55} />
            <Pool position={[-1.6, 0.03, 1]} size={[6, 6]} color="#ff1a10" opacity={0.14} />
          </group>
          <group ref={blue}>
            <mesh position={[w * 0.2, h + 0.03, -0.2]}>
              <boxGeometry args={[w * 0.28, 0.06, 0.16]} />
              <meshBasicMaterial color={BLUE} toneMapped={false} />
            </mesh>
            <Halo position={[w * 0.2, h + 0.1, -0.2]} size={1.2} color="#2a5bff" opacity={0.55} />
            <Pool position={[1.6, 0.03, 1]} size={[6, 6]} color="#2a5bff" opacity={0.14} />
          </group>
          {sirenLight && <pointLight ref={light} position={[0, h + 0.4, 0.5]} intensity={35} distance={14} decay={2} />}
        </>
      )}
    </>
  );
}