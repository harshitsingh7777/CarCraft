"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

import { world } from "../../lib/three/worldState";


/*
============================================================
VEHICLE CONTROLLER
============================================================

Controls:

- lane position
- lane weaving
- forward movement
- chase movement
- body roll
- body pitch
- suspension
- hero tracking

The hero car remains the camera reference.

The chase cars dynamically move relative to the hero
so the scene feels like an actual high-speed pursuit.
============================================================
*/


export default function VehicleController({
  lane = 0,
  gap = 0,
  weave = {
    amp: 0.3,
    freq: 0.5,
  },
  zAmp = 0.5,
  phase = 0,
  isHero = false,
  children,
}) {
  const ref = useRef();


  /*
  ------------------------------------------------------------
  INITIAL MOVEMENT STATE
  ------------------------------------------------------------
  */

  const state = useRef({
    z: gap,
    initialized: false,
  });


  useFrame(({ clock }, dt) => {
    const group = ref.current;

    if (!group) {
      return;
    }


    const time = clock.elapsedTime;


    /*
    ----------------------------------------------------------
    WORLD SPEED
    ----------------------------------------------------------

    page.js controls this value.

    Current range:

    1.8 → 4.0

    We multiply it here to turn the cinematic speed
    into actual vehicle movement.
    */

    const speed = Math.max(
      0.1,
      world.speed || 1
    );


    /*
    ----------------------------------------------------------
    INITIALIZE POSITION
    ----------------------------------------------------------
    */

    if (!state.current.initialized) {
      state.current.z = gap;
      state.current.initialized = true;
    }


    /*
    ----------------------------------------------------------
    LANE WEAVE
    ----------------------------------------------------------
    */

    const weaveFrequency =
      weave.freq || 0.5;

    const weaveAmplitude =
      weave.amp || 0.3;

    const angle =
      weaveFrequency * time +
      phase;

    const x =
      lane +
      weaveAmplitude *
        Math.sin(angle);


    /*
    ----------------------------------------------------------
    LATERAL VELOCITY
    ----------------------------------------------------------
    */

    const lateralVelocity =
      weaveAmplitude *
      weaveFrequency *
      Math.cos(angle);


    /*
    ----------------------------------------------------------
    FORWARD VEHICLE MOTION
    ----------------------------------------------------------

    The old controller did not use world.speed here.

    Now vehicles actually travel through the world.

    Hero:
      Moves forward with the road.

    Chasers:
      Move slightly faster and close the gap.
    */

    let movementSpeed = speed;


    if (!isHero) {
      /*
       * Chaser vehicles are intentionally faster.
       *
       * This creates a subtle pursuit effect rather than
       * making every vehicle perfectly locked together.
       */

      movementSpeed =
        speed *
        1.08;
    }


    /*
    ----------------------------------------------------------
    MOVE VEHICLE
    ----------------------------------------------------------
    */

    state.current.z +=
      movementSpeed *
      dt;


    /*
    ----------------------------------------------------------
    KEEP VEHICLES IN A CINEMATIC RANGE
    ----------------------------------------------------------

    We keep the hero around its reference position because
    the camera follows the hero.

    Chasers can move relative to the hero.
    */

    if (isHero) {
      /*
       * Hero remains the camera reference.
       */

      state.current.z =
        gap +
        zAmp *
          Math.sin(
            time * 0.35 +
            phase
          );
    } else {
      /*
       * Chaser distance relative to hero.
       */

      const heroZ =
        world.hero?.z ?? 0;


      /*
       * Desired chase position.

       * Negative gap = behind hero.
       */

      const desiredZ =
        heroZ +
        gap;


      /*
       * Smoothly approach the desired position
       * while still having actual movement.
       */

      const chaseStrength =
        Math.min(
          1,
          dt * 1.8
        );


      state.current.z +=
        (
          desiredZ -
          state.current.z
        ) *
        chaseStrength;


      /*
       * Add subtle independent movement.
       */

      state.current.z +=
        zAmp *
        0.015 *
        Math.sin(
          time * 0.8 +
          phase
        );
    }


    /*
    ----------------------------------------------------------
    HERO WORLD POSITION
    ----------------------------------------------------------
    */

    if (isHero) {
      world.hero.set(
        x,
        0.7,
        state.current.z
      );
    }


    /*
    ----------------------------------------------------------
    FORWARD VELOCITY
    ----------------------------------------------------------
    */

    const forwardVelocity =
      isHero
        ? speed
        : speed * 1.08;


    /*
    ----------------------------------------------------------
    SUSPENSION
    ----------------------------------------------------------
    */

    const suspension =
      0.012 *
      Math.sin(
        time * 9 +
        phase
      ) +
      0.006 *
      Math.sin(
        time * 17 +
        phase * 2
      );


    /*
    ----------------------------------------------------------
    BODY PITCH
    ----------------------------------------------------------
    */

    const pitch =
      -forwardVelocity *
      0.002;


    /*
    ----------------------------------------------------------
    BODY YAW
    ----------------------------------------------------------
    */

    const yaw =
      Math.atan2(
        lateralVelocity,
        Math.max(
          forwardVelocity,
          0.1
        )
      );


    /*
    ----------------------------------------------------------
    BODY ROLL
    ----------------------------------------------------------
    */

    const roll =
      -lateralVelocity *
      0.03;


    /*
    ----------------------------------------------------------
    APPLY TRANSFORM
    ----------------------------------------------------------
    */

    group.position.set(
      x,
      suspension,
      state.current.z
    );


    group.rotation.set(
      pitch,
      yaw,
      roll
    );
  });


  return (
    <group ref={ref}>
      {children}
    </group>
  );
}