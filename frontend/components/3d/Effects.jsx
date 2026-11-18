"use client";

import {
  EffectComposer,
  Bloom,
  Vignette,
  Noise,
  ToneMapping,
} from "@react-three/postprocessing";

import {
  BlendFunction,
  ToneMappingMode,
} from "postprocessing";


export default function Effects({
  quality,
}) {
  return (
    <EffectComposer
      multisampling={
        quality.reflector
          ? 4
          : 0
      }
    >

      {/* =================================================
          HEADLIGHT / CITY LIGHT BLOOM
      ================================================= */}

      <Bloom
        mipmapBlur
        intensity={
          quality.reflector
            ? 0.62
            : 0.45
        }
        luminanceThreshold={0.75}
        luminanceSmoothing={0.18}
        radius={0.85}
      />


      {/* =================================================
          CINEMATIC HDR
      ================================================= */}

      <ToneMapping
        mode={
          ToneMappingMode.ACES_FILMIC
        }
      />


      {/* =================================================
          NIGHT VIGNETTE
      ================================================= */}

      <Vignette
        offset={0.28}
        darkness={0.72}
      />


      {/* =================================================
          FILM GRAIN
      ================================================= */}

      <Noise
        opacity={0.045}
        blendFunction={
          BlendFunction.SOFT_LIGHT
        }
      />

    </EffectComposer>
  );
}