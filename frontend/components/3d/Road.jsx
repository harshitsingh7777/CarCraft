"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  MeshReflectorMaterial,
} from "@react-three/drei";

import {
  AdditiveBlending,
  BoxGeometry,
  CylinderGeometry,
  Object3D,
  PlaneGeometry,
} from "three";

import { world } from "../../lib/three/worldState";

import {
  getGlowTexture,
  makeMarkingTexture,
  makePuddleTexture,
} from "../../lib/three/textures";

export const ROAD_WIDTH = 11;

const LENGTH = 240;

const Z_NEAR = 20;

const MID_Z =
  Z_NEAR -
  LENGTH / 2;

export function Road({
  quality,
}) {
  const {
    marks,
    rough,
  } = useMemo(() => {
    const marks =
      makeMarkingTexture();

    const rough =
      makePuddleTexture();

    marks.repeat.set(
      1,
      LENGTH / 12
    );

    rough.repeat.set(
      1,
      LENGTH / 20
    );

    return {
      marks,
      rough,
    };
  }, []);

  useFrame(
    (_, dt) => {
      /*
       * Limit dt so the road doesn't
       * jump after tab switching.
       */

      const safeDt =
        Math.min(
          dt,
          0.05
        );

      /*
       * World speed is controlled
       * by page scrolling.
       */

      const movement =
        world.speed *
        safeDt;

      /*
       * Road markings move faster
       * with speed.
       */

      marks.offset.y -=
        movement / 12;

      /*
       * Reflections/puddle texture
       * also move with the road.
       */

      rough.offset.y -=
        movement / 20;
    }
  );

  return (
    <>
      {/* Ground */}

      <mesh
        rotation-x={
          -Math.PI / 2
        }
        position={[
          0,
          -0.06,
          MID_Z,
        ]}
      >
        <planeGeometry
          args={[
            600,
            LENGTH + 100,
          ]}
        />

        <meshStandardMaterial
          color="#03060a"
          roughness={1}
        />
      </mesh>

      {/* Wet road */}

      <mesh
        rotation-x={
          -Math.PI / 2
        }
        position={[
          0,
          0,
          MID_Z,
        ]}
      >
        <planeGeometry
          args={[
            ROAD_WIDTH,
            LENGTH,
          ]}
        />

        {quality.reflector ? (
          <MeshReflectorMaterial
            color="#0b0e13"
            metalness={0.6}
            roughness={1}
            roughnessMap={rough}
            resolution={
              quality.reflectRes
            }
            blur={[
              300,
              80,
            ]}
            mixBlur={1}
            mixStrength={40}
            mixContrast={1.3}
            mirror={0.85}
          />
        ) : (
          <meshStandardMaterial
            color="#080b10"
            metalness={0.75}
            roughness={1}
            roughnessMap={
              rough
            }
            envMapIntensity={1.2}
          />
        )}
      </mesh>

      {/* Road markings */}

      <mesh
        rotation-x={
          -Math.PI / 2
        }
        position={[
          0,
          0.015,
          MID_Z,
        ]}
        renderOrder={1}
      >
        <planeGeometry
          args={[
            ROAD_WIDTH,
            LENGTH,
          ]}
        />

        <meshBasicMaterial
          map={marks}
          transparent
          opacity={0.8}
          depthWrite={false}
          polygonOffset
          polygonOffsetFactor={-1}
        />
      </mesh>
    </>
  );
}


/*
 * ==========================================
 * SCROLLER
 * ==========================================
 */

function Scroller({
  count,
  spacing,
  x,
  phase = 0,
  geometry,
  children,
}) {
  const ref =
    useRef();

  const dummy =
    useMemo(
      () =>
        new Object3D(),
      []
    );

  const z =
    useMemo(
      () =>
        Float32Array.from(
          {
            length: count,
          },
          (_, i) =>
            Z_NEAR -
            phase -
            i * spacing
        ),
      [
        count,
        spacing,
        phase,
      ]
    );

  const span =
    count * spacing;

  useFrame(
    (_, dt) => {
      const mesh =
        ref.current;

      if (!mesh)
        return;

      const safeDt =
        Math.min(
          dt,
          0.05
        );

      const movement =
        world.speed *
        safeDt;

      for (
        let i = 0;
        i < count;
        i++
      ) {
        z[i] -= movement;

        if (
          z[i] <
          Z_NEAR - span
        ) {
          z[i] += span;
        }

        dummy.position.set(
          x,
          0,
          z[i]
        );

        dummy.updateMatrix();

        mesh.setMatrixAt(
          i,
          dummy.matrix
        );
      }

      mesh.instanceMatrix.needsUpdate =
        true;
    }
  );

  return (
    <instancedMesh
      ref={ref}
      args={[
        geometry,
        undefined,
        count,
      ]}
      frustumCulled={false}
    >
      {children}
    </instancedMesh>
  );
}


/*
 * ==========================================
 * ROADSIDE
 * ==========================================
 */

export function Roadside() {
  const g =
    useMemo(() => {
      const out = {
        post:
          new BoxGeometry(
            0.12,
            0.7,
            0.12
          ).translate(
            0,
            0.35,
            0
          ),

        pole:
          new CylinderGeometry(
            0.07,
            0.09,
            8,
            8
          ).translate(
            0,
            4,
            0
          ),
      };

      [-1, 1].forEach(
        (s) => {
          out[
            `head${s}`
          ] =
            new BoxGeometry(
              1.1,
              0.12,
              0.4
            ).translate(
              -s * 0.6,
              8,
              0
            );

          out[
            `pool${s}`
          ] =
            new PlaneGeometry(
              7,
              7
            )
              .rotateX(
                -Math.PI / 2
              )
              .translate(
                -s * 1.9,
                0.03,
                0
              );
        }
      );

      out.rail =
        new BoxGeometry(
          0.06,
          0.28,
          LENGTH
        );

      return out;
    }, []);

  return (
    <>
      {[-1, 1].map(
        (s) => (
          <group key={s}>

            {/* Guard rail */}

            <mesh
              geometry={
                g.rail
              }
              position={[
                s * 7,
                0.62,
                MID_Z,
              ]}
            >
              <meshStandardMaterial
                color="#2a2f36"
                metalness={0.8}
                roughness={0.35}
              />
            </mesh>

            {/* Road posts */}

            <Scroller
              count={60}
              spacing={4}
              x={s * 7}
              geometry={
                g.post
              }
            >
              <meshStandardMaterial
                color="#1b2027"
                metalness={0.7}
                roughness={0.5}
              />
            </Scroller>

            {/* Light poles */}

            <Scroller
              count={13}
              spacing={18}
              x={s * 6.4}
              phase={
                s > 0
                  ? 9
                  : 0
              }
              geometry={
                g.pole
              }
            >
              <meshStandardMaterial
                color="#14181d"
                metalness={0.8}
                roughness={0.5}
              />
            </Scroller>

            {/* Lamps */}

            <Scroller
              count={13}
              spacing={18}
              x={s * 6.4}
              phase={
                s > 0
                  ? 9
                  : 0
              }
              geometry={
                g[`head${s}`]
              }
            >
              <meshBasicMaterial
                color="#ffb45e"
                toneMapped={
                  false
                }
              />
            </Scroller>

            {/* Light pools */}

            <Scroller
              count={13}
              spacing={18}
              x={s * 6.4}
              phase={
                s > 0
                  ? 9
                  : 0
              }
              geometry={
                g[`pool${s}`]
              }
            >
              <meshBasicMaterial
                map={getGlowTexture()}
                color="#ff9a3c"
                transparent
                opacity={0.35}
                blending={
                  AdditiveBlending
                }
                depthWrite={
                  false
                }
                toneMapped={
                  false
                }
              />
            </Scroller>

          </group>
        )
      )}
    </>
  );
}