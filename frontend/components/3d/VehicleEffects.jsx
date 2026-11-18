"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";

import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  PointsMaterial,
  TextureLoader,
  Vector3,
} from "three";

import { world } from "../../lib/three/worldState";

const MAX_PARTICLES = 280;

export default function VehicleEffects({
  position = [0, 0, 0],
}) {
  const ref =
    useRef();

  const particles =
    useMemo(() => {
      const positions =
        new Float32Array(
          MAX_PARTICLES * 3
        );

      const velocities =
        new Float32Array(
          MAX_PARTICLES * 3
        );

      const life =
        new Float32Array(
          MAX_PARTICLES
        );

      const maxLife =
        new Float32Array(
          MAX_PARTICLES
        );

      const sizes =
        new Float32Array(
          MAX_PARTICLES
        );

      const offsets =
        new Float32Array(
          MAX_PARTICLES * 3
        );

      for (
        let i = 0;
        i < MAX_PARTICLES;
        i++
      ) {
        /*
         * Spawn around the
         * four tire positions.
         */

        const tire =
          i % 4;

        const side =
          tire % 2 === 0
            ? -1
            : 1;

        const front =
          tire < 2;

        offsets[
          i * 3
        ] =
          side *
          0.72;

        offsets[
          i * 3 + 1
        ] =
          0.16;

        offsets[
          i * 3 + 2
        ] =
          front
            ? -1.35
            : 1.25;

        life[i] =
          Math.random() *
          1.5;

        maxLife[i] =
          0.55 +
          Math.random() *
            0.95;

        sizes[i] =
          0.7 +
          Math.random() *
            1.2;
      }

      const geometry =
        new BufferGeometry();

      geometry.setAttribute(
        "position",
        new BufferAttribute(
          positions,
          3
        )
      );

      geometry.setAttribute(
        "aSize",
        new BufferAttribute(
          sizes,
          1
        )
      );

      return {
        geometry,
        positions,
        velocities,
        life,
        maxLife,
        sizes,
        offsets,
      };
    }, []);

  const texture =
    useMemo(
      () =>
        new TextureLoader().load(
          "/textures/mist.png"
        ),
      []
    );

  useFrame(
    (_, dt) => {
      if (!ref.current)
        return;

      const {
        positions,
        velocities,
        life,
        maxLife,
        offsets,
      } = particles;

      const intensity =
        world.intensity;

      const speed =
        world.speed;

      for (
        let i = 0;
        i < MAX_PARTICLES;
        i++
      ) {
        const p =
          i * 3;

        life[i] -= dt;

        /*
         * Respawn particle.
         */

        if (
          life[i] <= 0
        ) {
          positions[p] =
            offsets[p] +
            (Math.random() -
              0.5) *
              0.18;

          positions[
            p + 1
          ] =
            offsets[p + 1] +
            Math.random() *
              0.12;

          positions[
            p + 2
          ] =
            offsets[p + 2] +
            (Math.random() -
              0.5) *
              0.15;

          /*
           * More intensity =
           * stronger spray.
           */

          velocities[p] =
            (Math.random() -
              0.5) *
            (1.4 +
              intensity *
                2.0);

          velocities[
            p + 1
          ] =
            0.25 +
            Math.random() *
              (0.8 +
                intensity *
                  0.6);

          velocities[
            p + 2
          ] =
            0.5 +
            Math.random() *
              (0.8 +
                intensity *
                  1.5);

          life[i] =
            maxLife[i] *
            (
              0.65 +
              Math.random() *
                0.35
            );
        }

        /*
         * Gravity.
         */

        velocities[
          p + 1
        ] -=
          2.2 * dt;

        /*
         * Drag.
         */

        velocities[p] *=
          0.985;

        velocities[
          p + 1
        ] *=
          0.985;

        velocities[
          p + 2
        ] *=
          0.985;

        /*
         * Move.
         */

        positions[p] +=
          velocities[p] *
          dt;

        positions[
          p + 1
        ] +=
          velocities[
            p + 1
          ] * dt;

        positions[
          p + 2
        ] +=
          velocities[
            p + 2
          ] *
          dt *
          (
            0.7 +
            speed / 40
          );
      }

      ref.current.geometry.attributes.position.needsUpdate =
        true;
    }
  );

  return (
    <points
      ref={ref}
      position={position}
    >
      {particles.geometry && (
        <primitive
          object={
            particles.geometry
          }
        />
      )}

      <pointsMaterial
        map={texture}
        size={1.65}
        transparent
        opacity={0.8}
        depthWrite={false}
        blending={
          AdditiveBlending
        }
        sizeAttenuation
      />
    </points>
  );
}