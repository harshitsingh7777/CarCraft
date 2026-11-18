"use client";

import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";

import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  ShaderMaterial,
} from "three";

import { world } from "../../lib/three/worldState";

const H = 30;

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uSlant;
  uniform float uH;
  uniform float uIntensity;

  attribute float aEnd;
  attribute float aSeed;
  attribute float aLength;
  attribute float aSpeed;

  varying float vAlpha;

  void main() {

    vec3 p = position;

    /*
     * Base rain speed.
     *
     * Intensity increases speed.
     */
    float speed =
      aSpeed *
      mix(
        0.75,
        1.65,
        uIntensity
      );

    float fall =
      mod(
        p.y -
        uTime * speed,
        uH
      );

    p.y =
      fall -
      1.0;

    /*
     * Stronger wind at higher intensity.
     */
    float wind =
      uSlant *
      mix(
        0.75,
        1.35,
        uIntensity
      );

    p.x +=
      (uH - fall) *
      wind;

    p.z +=
      (uH - fall) *
      -0.3;

    vec3 dir =
      normalize(
        vec3(
          wind,
          -1.0,
          -0.3
        )
      );

    /*
     * Rain streak length increases
     * with intensity.
     */
    p -=
      dir *
      aLength *
      mix(
        0.6,
        1.45,
        uIntensity
      ) *
      aEnd;

    vec4 mv =
      modelViewMatrix *
      vec4(
        p,
        1.0
      );

    gl_Position =
      projectionMatrix *
      mv;

    float dist =
      -mv.z;

    float distanceFade =
      smoothstep(
        100.0,
        8.0,
        dist
      ) *
      smoothstep(
        0.5,
        3.0,
        dist
      );

    /*
     * Brighter rain at higher intensity.
     */
    float brightness =
      mix(
        0.7,
        1.45,
        uIntensity
      );

    vAlpha =
      distanceFade *
      (
        0.12 +
        0.35 * aSeed
      ) *
      brightness *
      (
        1.0 -
        aEnd * 0.85
      );
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uColor;

  varying float vAlpha;

  void main() {

    gl_FragColor =
      vec4(
        uColor,
        vAlpha
      );
  }
`;

export default function Rain({
  count = 6000,
}) {
  const {
    geo,
    mat,
  } = useMemo(() => {

    const pos =
      new Float32Array(
        count * 2 * 3
      );

    const end =
      new Float32Array(
        count * 2
      );

    const seed =
      new Float32Array(
        count * 2
      );

    const length =
      new Float32Array(
        count * 2
      );

    const speed =
      new Float32Array(
        count * 2
      );

    for (
      let i = 0;
      i < count;
      i++
    ) {
      const x =
        (Math.random() - 0.5) *
        50;

      const y =
        Math.random() *
        H;

      const z =
        12 -
        90 *
          Math.pow(
            Math.random(),
            1.8
          );

      const s =
        Math.random();

      const l =
        0.35 +
        Math.random() *
          1.25;

      const sp =
        20 +
        Math.random() *
          18;

      for (
        let k = 0;
        k < 2;
        k++
      ) {
        const o =
          (i * 2 + k) *
          3;

        pos[o] = x;

        pos[o + 1] = y;

        pos[o + 2] = z;

        end[
          i * 2 + k
        ] = k;

        seed[
          i * 2 + k
        ] = s;

        length[
          i * 2 + k
        ] = l;

        speed[
          i * 2 + k
        ] = sp;
      }
    }

    const g =
      new BufferGeometry();

    g.setAttribute(
      "position",
      new BufferAttribute(
        pos,
        3
      )
    );

    g.setAttribute(
      "aEnd",
      new BufferAttribute(
        end,
        1
      )
    );

    g.setAttribute(
      "aSeed",
      new BufferAttribute(
        seed,
        1
      )
    );

    g.setAttribute(
      "aLength",
      new BufferAttribute(
        length,
        1
      )
    );

    g.setAttribute(
      "aSpeed",
      new BufferAttribute(
        speed,
        1
      )
    );

    const m =
      new ShaderMaterial({
        vertexShader:
          vertex,

        fragmentShader:
          fragment,

        transparent: true,

        depthWrite: false,

        blending:
          AdditiveBlending,

        fog: false,

        uniforms: {
          uTime: {
            value: 0,
          },

          uSlant: {
            value: 0.22,
          },

          uH: {
            value: H,
          },

          uIntensity: {
            value: 0,
          },

          uColor: {
            value:
              new Color(
                "#a9c4e8"
              ),
          },
        },
      });

    return {
      geo: g,
      mat: m,
    };
  }, [count]);

  useFrame(
    ({ clock }) => {
      const t =
        clock.elapsedTime;

      mat.uniforms.uTime.value =
        t;

      /*
       * Connect rain to
       * world intensity.
       */
      mat.uniforms.uIntensity.value =
        world.intensity;

      /*
       * Wind gusts.
       */
      mat.uniforms.uSlant.value =
        0.22 +
        0.07 *
          Math.sin(
            t * 0.4
          ) +
        0.03 *
          Math.sin(
            t * 1.7
          );
    }
  );

  return (
    <lineSegments
      geometry={geo}
      material={mat}
      frustumCulled={false}
      renderOrder={5}
    />
  );
}