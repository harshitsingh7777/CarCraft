"use client";

import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { MathUtils, Vector3 } from "three";

import { world } from "../../lib/three/worldState";

const SHOTS = [
  {
    name: "rear-chase",

    distance: 7.6,
    height: 1.15,
    angle: -0.45,

    lookX: -1.7,
    lookY: 0.75,
    lookZ: -3.0,

    fov: 42,
  },

  {
    name: "side-tracking",

    distance: 6.5,
    height: 1.0,
    angle: -1.15,

    lookX: 0.0,
    lookY: 0.75,
    lookZ: -2.6,

    fov: 44,
  },

  {
    name: "front-three-quarter",

    distance: 7.2,
    height: 1.45,
    angle: 2.45,

    lookX: 0.25,
    lookY: 0.75,
    lookZ: -2.0,

    fov: 43,
  },

  {
    name: "low-performance",

    distance: 5.8,
    height: 0.55,
    angle: -0.15,

    lookX: -0.15,
    lookY: 0.45,
    lookZ: -2.1,

    fov: 46,
  },

  {
    name: "wide-reveal",

    distance: 10.5,
    height: 2.6,
    angle: -0.7,

    lookX: 0.0,
    lookY: 0.8,
    lookZ: -3.6,

    fov: 48,
  },
];

function easeInOutCubic(t) {
  if (t < 0.5) {
    return 4 * t * t * t;
  }

  return 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpAngle(a, b, t) {
  const difference = Math.atan2(
    Math.sin(b - a),
    Math.cos(b - a)
  );

  return a + difference * t;
}

export default function CameraRig() {
  const camera = useMemo(
    () => ({
      position: new Vector3(),
      target: new Vector3(),

      desiredPosition: new Vector3(),
      desiredTarget: new Vector3(),
    }),
    []
  );

  useFrame(
    ({ camera: threeCamera, clock }, dt) => {
      const time = clock.elapsedTime;

      const hero = world.hero;

      /*
       * Scroll value:
       *
       * 0 = beginning
       * 1 = end
       */
      const scroll = MathUtils.clamp(
        world.scroll ?? 0,
        0,
        1
      );

      /*
       * Convert scroll into camera shot position.
       *
       * 0 → shot 1
       * 0.25 → shot 2
       * 0.50 → shot 3
       * 0.75 → shot 4
       * 1 → shot 5
       */
      const scaled =
        scroll * (SHOTS.length - 1);

      let shotIndex = Math.floor(scaled);

      /*
       * Prevent index from becoming 5
       */
      shotIndex = Math.min(
        shotIndex,
        SHOTS.length - 2
      );

      const rawProgress =
        scaled - shotIndex;

      const progress =
        easeInOutCubic(rawProgress);

      const from = SHOTS[shotIndex];
      const to = SHOTS[shotIndex + 1];

      /*
       * Interpolate camera properties
       */
      let distance = lerp(
        from.distance,
        to.distance,
        progress
      );

      let height = lerp(
        from.height,
        to.height,
        progress
      );

      let angle = lerpAngle(
        from.angle,
        to.angle,
        progress
      );

      let lookX = lerp(
        from.lookX,
        to.lookX,
        progress
      );

      let lookY = lerp(
        from.lookY,
        to.lookY,
        progress
      );

      let lookZ = lerp(
        from.lookZ,
        to.lookZ,
        progress
      );

      let fov = lerp(
        from.fov,
        to.fov,
        progress
      );

      /*
       * Cinematic transition arc.
       *
       * Gives the camera a little extra
       * movement between shots.
       */
      const transitionArc =
        Math.sin(rawProgress * Math.PI);

      distance +=
        transitionArc * 0.45;

      height +=
        transitionArc * 0.10;

      angle +=
        transitionArc * 0.08;

      /*
       * Driving intensity
       */
      const intensity =
        MathUtils.clamp(
          world.intensity ?? 0,
          0,
          1
        );

      fov += intensity * 1.8;

      /*
       * Subtle camera breathing
       */
      const breathing =
        Math.sin(time * 0.23) * 0.035;

      /*
       * Driving vibration
       */
      const vibration =
        intensity * 0.009;

      const shakeX =
        Math.sin(time * 8.0) *
        vibration;

      const shakeY =
        Math.sin(time * 11.0) *
        vibration;

      /*
       * Mouse parallax
       */
      const mouseX =
        (world.mouseX ?? 0) * 0.12;

      const mouseY =
        (world.mouseY ?? 0) * 0.07;

      /*
       * Calculate camera position
       */
      camera.desiredPosition.set(
        hero.x +
          Math.sin(angle) *
            distance +
          mouseX +
          shakeX,

        height +
          breathing +
          shakeY -
          mouseY,

        hero.z +
          Math.cos(angle) *
            distance
      );

      /*
       * Calculate look target
       */
      camera.desiredTarget.set(
        hero.x + lookX,
        lookY,
        hero.z + lookZ
      );

      /*
       * Smooth camera movement
       */
      const positionSmooth =
        1 - Math.exp(-4.5 * dt);

      const targetSmooth =
        1 - Math.exp(-5.5 * dt);

      camera.position.lerp(
        camera.desiredPosition,
        positionSmooth
      );

      camera.target.lerp(
        camera.desiredTarget,
        targetSmooth
      );

      /*
       * Apply camera
       */
      threeCamera.position.copy(
        camera.position
      );

      threeCamera.lookAt(
        camera.target
      );

      threeCamera.fov =
        MathUtils.damp(
          threeCamera.fov,
          fov,
          3.5,
          dt
        );

      threeCamera.updateProjectionMatrix();
    }
  );

  return null;
}