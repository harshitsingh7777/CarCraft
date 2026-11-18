"use client";

import {
  Environment,
  Lightformer,
  useGLTF,
} from "@react-three/drei";

import VehicleController from "../components/3d/VehicleController";
import VehicleModel from "../components/3d/VehicleModel";
import VehicleLights from "../components/3d/VehicleLights";
import VehicleEffects from "../components/3d/VehicleEffects";
import CameraRig from "../components/3d/CameraRig";
import Effects from "../components/3d/Effects";
import Rain from "../components/3d/Rain";
import Skyline from "../components/3d/Skyline";

import {
  Road,
  Roadside,
} from "../components/3d/Road";

import {
  HIGHWAY_TRAFFIC,
  VEHICLES,
  getVehicle,
} from "../data/vehicles";


/* =========================================================
   PRELOAD VEHICLES
========================================================= */

VEHICLES.forEach((vehicle) => {
  useGLTF.preload(vehicle.model);
});


/* =========================================================
   TRAFFIC
========================================================= */

function Traffic({ quality }) {
  return HIGHWAY_TRAFFIC.map((traffic) => {
    const vehicle =
      getVehicle(
        traffic.vehicleId
      );

    return (
      <VehicleController
        key={traffic.id}
        {...traffic.motion}
        isHero={
          traffic.role === "hero"
        }
      >
        <VehicleModel
          url={vehicle.model}
          length={vehicle.length}
          flip={vehicle.flip}
        >
          {(dims) => (
            <>
              <VehicleLights
                dims={dims}
                siren={traffic.siren}
                sirenLight={
                  quality.sirenLight
                }
              />

              <VehicleEffects
                dims={dims}
                count={quality.spray}
              />
            </>
          )}
        </VehicleModel>
      </VehicleController>
    );
  });
}


/* =========================================================
   MAIN NIGHT HIGHWAY
========================================================= */

export default function RainyHighway({
  quality,
}) {
  return (
    <>
      {/* ===================================================
          NIGHT SKY
      =================================================== */}

      <color
        attach="background"
        args={["#02050a"]}
      />

      {/* Deep blue atmospheric fog */}

      <fogExp2
        attach="fog"
        args={[
          "#07121c",
          0.008,
        ]}
      />

      {/* ===================================================
          NIGHT AMBIENT LIGHT
      =================================================== */}

      <hemisphereLight
        args={[
          "#14283b",
          "#020305",
          0.55,
        ]}
      />

      {/* Cool moonlight */}

      <directionalLight
        position={[
          -15,
          25,
          10,
        ]}
        intensity={0.7}
        color="#8fb9dc"
      />

      {/* Very subtle blue fill */}

      <directionalLight
        position={[
          15,
          8,
          -20,
        ]}
        intensity={0.25}
        color="#496f94"
      />

      {/* ===================================================
          NIGHT ENVIRONMENT
      =================================================== */}

      <Environment
        frames={1}
        resolution={256}
        environmentIntensity={0.28}
      >

        {/* Cool sky reflection */}

        <Lightformer
          form="rect"
          intensity={2}
          color="#132b42"
          position={[
            0,
            12,
            0,
          ]}
          rotation-x={
            Math.PI / 2
          }
          scale={[
            18,
            8,
            1,
          ]}
        />

        {/* Blue horizon */}

        <Lightformer
          form="rect"
          intensity={1.8}
          color="#16344c"
          position={[
            0,
            4,
            -20,
          ]}
          rotation-x={
            Math.PI / 2
          }
          scale={[
            16,
            3,
            1,
          ]}
        />

        {/* Very subtle warm city reflection */}

        <Lightformer
          form="rect"
          intensity={1.2}
          color="#6b3d22"
          position={[
            -10,
            3,
            -25,
          ]}
          scale={[
            8,
            3,
            1,
          ]}
        />

      </Environment>

      {/* ===================================================
          MOUNTAINS + CITY
      =================================================== */}

      <Skyline
        quality={quality}
      />

      {/* ===================================================
          WET HIGHWAY
      =================================================== */}

      <Road
        quality={quality}
      />

      <Roadside />

      {/* ===================================================
          VEHICLES
      =================================================== */}

      <Traffic
        quality={quality}
      />

      {/* ===================================================
          RAIN
      =================================================== */}

      <Rain
        count={quality.rain}
      />

      {/* ===================================================
          CINEMATIC CAMERA
      =================================================== */}

      <CameraRig />

      {/* ===================================================
          POST PROCESSING
      =================================================== */}

      <Effects
        quality={quality}
      />
    </>
  );
}