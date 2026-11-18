"use client";

import { useMemo } from "react";

import {
  BufferAttribute,
  BufferGeometry,
  Color,
  PointsMaterial,
  AdditiveBlending,
  Points,
} from "three";

import {
  getGlowTexture,
} from "../../lib/three/textures";


/* =========================================================
   DETERMINISTIC RANDOM
========================================================= */

const rng = (seed) => {
  let value = seed;

  return () => {
    value =
      (value * 1664525 +
        1013904223) %
      4294967296;

    return (
      value /
      4294967296
    );
  };
};


/* =========================================================
   MOUNTAIN NOISE
========================================================= */

function mountainNoise(
  x,
  seed
) {
  return (
    Math.sin(
      x * 0.012 +
        seed
    ) *
      0.55 +

    Math.sin(
      x * 0.032 +
        seed * 1.7
    ) *
      0.30 +

    Math.sin(
      x * 0.085 +
        seed * 2.9
    ) *
      0.15
  );
}


/* =========================================================
   MOUNTAIN GEOMETRY
========================================================= */

function createMountain(
  {
    width,
    segments,
    amplitude,
    seed,
  }
) {
  const positions =
    new Float32Array(
      (segments + 1) *
        2 *
        3
    );

  const colors =
    new Float32Array(
      (segments + 1) *
        2 *
        3
    );

  const indices = [];

  const topColor =
    new Color(
      "#172631"
    );

  const bottomColor =
    new Color(
      "#03070b"
    );

  for (
    let i = 0;
    i <= segments;
    i++
  ) {
    const x =
      -width / 2 +
      (width * i) /
        segments;

    const n =
      mountainNoise(
        x,
        seed
      );

    const normalized =
      0.5 +
      n * 0.5;

    const height =
      amplitude *
        Math.pow(
          normalized,
          1.8
        );

    /*
     * Upper vertex
     */

    const topIndex =
      i * 6;

    positions[
      topIndex
    ] = x;

    positions[
      topIndex + 1
    ] =
      -2 +
      height;

    positions[
      topIndex + 2
    ] = 0;

    /*
     * Bottom vertex
     */

    positions[
      topIndex + 3
    ] = x;

    positions[
      topIndex + 4
    ] = -45;

    positions[
      topIndex + 5
    ] = 0;

    /*
     * Gradient
     */

    colors[
      topIndex
    ] = topColor.r;

    colors[
      topIndex + 1
    ] = topColor.g;

    colors[
      topIndex + 2
    ] = topColor.b;

    colors[
      topIndex + 3
    ] = bottomColor.r;

    colors[
      topIndex + 4
    ] = bottomColor.g;

    colors[
      topIndex + 5
    ] = bottomColor.b;

    if (i < segments) {
      const a =
        i * 2;

      indices.push(
        a,
        a + 1,
        a + 2,

        a + 1,
        a + 3,
        a + 2
      );
    }
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
    "color",
    new BufferAttribute(
      colors,
      3
    )
  );

  geometry.setIndex(
    indices
  );

  return geometry;
}


/* =========================================================
   CITY LIGHTS
========================================================= */

function CityLights({
  quality,
}) {
  const points =
    useMemo(() => {
      const random =
        rng(782);

      const count =
        quality.city > 900
          ? 260
          : 130;

      const positions =
        new Float32Array(
          count * 3
        );

      for (
        let i = 0;
        i < count;
        i++
      ) {
        const x =
          -140 +
          random() *
            280;

        const z =
          -135 -
          random() *
            85;

        const y =
          -1 +
          random() *
            18;

        positions[
          i * 3
        ] = x;

        positions[
          i * 3 + 1
        ] = y;

        positions[
          i * 3 + 2
        ] = z;
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

      return geometry;
    }, [quality.city]);

  const material =
    useMemo(() => {
      return new PointsMaterial({
        map: getGlowTexture(),

        color: "#ffb45c",

        size:
          quality.city > 900
            ? 1.8
            : 1.4,

        transparent: true,

        opacity: 0.75,

        depthWrite: false,

        blending:
          AdditiveBlending,

        sizeAttenuation: true,
      });
    }, [quality.city]);

  return (
    <points
      geometry={points}
      material={material}
    />
  );
}


/* =========================================================
   DISTANT RED LIGHTS
========================================================= */

function RedCityLights({
  quality,
}) {
  const points =
    useMemo(() => {
      const random =
        rng(192);

      const count =
        quality.city > 900
          ? 80
          : 40;

      const positions =
        new Float32Array(
          count * 3
        );

      for (
        let i = 0;
        i < count;
        i++
      ) {
        positions[
          i * 3
        ] =
          -120 +
          random() *
            240;

        positions[
          i * 3 + 1
        ] =
          2 +
          random() *
            12;

        positions[
          i * 3 + 2
        ] =
          -145 -
          random() *
            55;
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

      return geometry;
    }, [quality.city]);

  const material =
    useMemo(() => {
      return new PointsMaterial({
        map: getGlowTexture(),

        color: "#ff3030",

        size:
          quality.city > 900
            ? 1.1
            : 0.8,

        transparent: true,

        opacity: 0.55,

        depthWrite: false,

        blending:
          AdditiveBlending,
      });
    }, [quality.city]);

  return (
    <points
      geometry={points}
      material={material}
    />
  );
}


/* =========================================================
   ATMOSPHERIC MIST
========================================================= */

function MistBands() {
  return (
    <>
      <mesh
        position={[
          0,
          2.5,
          -105,
        ]}
        rotation-x={
          -Math.PI / 2
        }
      >
        <planeGeometry
          args={[
            180,
            50,
          ]}
        />

        <meshBasicMaterial
          color="#9ab2c0"
          transparent
          opacity={0.045}
          depthWrite={false}
        />
      </mesh>

      <mesh
        position={[
          0,
          5,
          -175,
        ]}
        rotation-x={
          -Math.PI / 2
        }
      >
        <planeGeometry
          args={[
            240,
            70,
          ]}
        />

        <meshBasicMaterial
          color="#8299a7"
          transparent
          opacity={0.035}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}


/* =========================================================
   MAIN SKYLINE
========================================================= */

export default function Skyline({
  quality,
}) {
  const mountains =
    useMemo(() => {
      return [
        {
          geometry:
            createMountain({
              width: 900,
              segments: 220,
              amplitude: 62,
              seed: 2,
            }),
          position: [
            0,
            0,
            -300,
          ],
          opacity: 0.65,
        },

        {
          geometry:
            createMountain({
              width: 800,
              segments: 220,
              amplitude: 48,
              seed: 7,
            }),
          position: [
            0,
            0,
            -245,
          ],
          opacity: 0.82,
        },

        {
          geometry:
            createMountain({
              width: 700,
              segments: 220,
              amplitude: 38,
              seed: 13,
            }),
          position: [
            0,
            0,
            -205,
          ],
          opacity: 0.96,
        },
      ];
    }, []);

  return (
    <>
      {/* ================================================
          DARK SKY
      ================================================= */}

      <mesh
        position={[
          0,
          65,
          -350,
        ]}
      >
        <planeGeometry
          args={[
            1200,
            500,
          ]}
        />

        <meshBasicMaterial
          color="#050b12"
          fog={false}
          depthWrite={false}
        />
      </mesh>


      {/* ================================================
          MOUNTAINS
      ================================================= */}

      {mountains.map(
        (
          mountain,
          index
        ) => (
          <mesh
            key={index}
            geometry={
              mountain.geometry
            }
            position={
              mountain.position
            }
          >
            <meshBasicMaterial
              vertexColors
              transparent
              opacity={
                mountain.opacity
              }
              fog
              side={2}
            />
          </mesh>
        )
      )}


      {/* ================================================
          CITY LIGHTS
      ================================================= */}

      <CityLights
        quality={quality}
      />

      <RedCityLights
        quality={quality}
      />


      {/* ================================================
          MIST
      ================================================= */}

      <MistBands />
    </>
  );
}