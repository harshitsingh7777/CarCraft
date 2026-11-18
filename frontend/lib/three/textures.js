import {
  CanvasTexture,
  RepeatWrapping,
  SRGBColorSpace,
} from "three";


function makeCanvas(
  width,
  height
) {
  const canvas =
    document.createElement(
      "canvas"
    );

  canvas.width =
    width;

  canvas.height =
    height;

  const context =
    canvas.getContext(
      "2d"
    );

  return [
    canvas,
    context,
  ];
}


/*
 * ============================================================
 * GLOW
 * ============================================================
 */

let glow;

export function getGlowTexture() {
  if (glow) {
    return glow;
  }

  const [
    canvas,
    context,
  ] = makeCanvas(
    128,
    128
  );

  const gradient =
    context.createRadialGradient(
      64,
      64,
      0,
      64,
      64,
      64
    );

  gradient.addColorStop(
    0,
    "rgba(255,255,255,1)"
  );

  gradient.addColorStop(
    0.35,
    "rgba(255,255,255,0.35)"
  );

  gradient.addColorStop(
    1,
    "rgba(255,255,255,0)"
  );

  context.fillStyle =
    gradient;

  context.fillRect(
    0,
    0,
    128,
    128
  );

  glow =
    new CanvasTexture(
      canvas
    );

  glow.colorSpace =
    SRGBColorSpace;

  return glow;
}


/*
 * ============================================================
 * ROAD MARKINGS
 * ============================================================
 */

export function makeMarkingTexture() {
  const [
    canvas,
    context,
  ] = makeCanvas(
    512,
    512
  );

  context.clearRect(
    0,
    0,
    512,
    512
  );

  /*
   * White road edge.
   */

  context.fillStyle =
    "#dfe8ed";

  context.fillRect(
    33,
    0,
    7,
    512
  );

  context.fillRect(
    472,
    0,
    7,
    512
  );

  /*
   * Center dashed line.
   */

  context.fillRect(
    252,
    0,
    8,
    171
  );

  const texture =
    new CanvasTexture(
      canvas
    );

  texture.colorSpace =
    SRGBColorSpace;

  texture.wrapT =
    RepeatWrapping;

  texture.anisotropy = 8;

  return texture;
}


/*
 * ============================================================
 * WET ROAD / PUDDLES
 * ============================================================
 */

export function makePuddleTexture() {
  const [
    canvas,
    context,
  ] = makeCanvas(
    512,
    512
  );

  /*
   * Medium roughness base.
   */

  context.fillStyle =
    "#6a7074";

  context.fillRect(
    0,
    0,
    512,
    512
  );

  /*
   * Random darker puddles.
   */

  for (
    let i = 0;
    i < 32;
    i++
  ) {
    const x =
      Math.random() *
      512;

    const y =
      Math.random() *
      512;

    const radius =
      20 +
      Math.random() *
        75;

    context.save();

    context.translate(
      x,
      y
    );

    context.scale(
      0.7,
      1.6
    );

    const gradient =
      context.createRadialGradient(
        0,
        0,
        0,
        0,
        0,
        radius
      );

    gradient.addColorStop(
      0,
      "rgba(8,12,14,0.95)"
    );

    gradient.addColorStop(
      0.45,
      "rgba(30,35,38,0.55)"
    );

    gradient.addColorStop(
      1,
      "rgba(80,80,80,0)"
    );

    context.fillStyle =
      gradient;

    context.beginPath();

    context.arc(
      0,
      0,
      radius,
      0,
      Math.PI * 2
    );

    context.fill();

    context.restore();
  }

  const texture =
    new CanvasTexture(
      canvas
    );

  texture.wrapT =
    RepeatWrapping;

  texture.anisotropy = 8;

  return texture;
}


/*
 * ============================================================
 * DAYTIME SKY
 * ============================================================
 */

export function makeSkyTexture() {
  const [
    canvas,
    context,
  ] = makeCanvas(
    512,
    256
  );

  /*
   * Overcast sky gradient.
   */

  const gradient =
    context.createLinearGradient(
      0,
      0,
      0,
      256
    );

  gradient.addColorStop(
    0,
    "#718b9d"
  );

  gradient.addColorStop(
    0.30,
    "#9eb5c3"
  );

  gradient.addColorStop(
    0.58,
    "#c7d5dc"
  );

  gradient.addColorStop(
    0.72,
    "#dce5e8"
  );

  gradient.addColorStop(
    1,
    "#a7bac3"
  );

  context.fillStyle =
    gradient;

  context.fillRect(
    0,
    0,
    512,
    256
  );

  /*
   * Soft sunlight breaking
   * through cloud cover.
   */

  const sunlight =
    context.createRadialGradient(
      360,
      125,
      10,
      360,
      125,
      170
    );

  sunlight.addColorStop(
    0,
    "rgba(255,236,195,0.42)"
  );

  sunlight.addColorStop(
    0.35,
    "rgba(255,236,195,0.18)"
  );

  sunlight.addColorStop(
    1,
    "rgba(255,236,195,0)"
  );

  context.fillStyle =
    sunlight;

  context.fillRect(
    0,
    0,
    512,
    256
  );

  /*
   * Soft cloud bands.
   */

  for (
    let i = 0;
    i < 14;
    i++
  ) {
    const x =
      Math.random() *
      512;

    const y =
      25 +
      Math.random() *
        90;

    const width =
      50 +
      Math.random() *
        130;

    const height =
      10 +
      Math.random() *
        25;

    const cloud =
      context.createRadialGradient(
        x,
        y,
        0,
        x,
        y,
        width
      );

    cloud.addColorStop(
      0,
      "rgba(245,249,250,0.18)"
    );

    cloud.addColorStop(
      1,
      "rgba(245,249,250,0)"
    );

    context.fillStyle =
      cloud;

    context.fillRect(
      x - width,
      y - height,
      width * 2,
      height * 2
    );
  }

  const texture =
    new CanvasTexture(
      canvas
    );

  texture.colorSpace =
    SRGBColorSpace;

  return texture;
}


/*
 * ============================================================
 * MIST
 * ============================================================
 */

let mist;

export function getMistTexture() {
  if (mist) {
    return mist;
  }

  const [
    canvas,
    context,
  ] = makeCanvas(
    128,
    128
  );

  const gradient =
    context.createRadialGradient(
      64,
      64,
      0,
      64,
      64,
      64
    );

  gradient.addColorStop(
    0,
    "rgba(255,255,255,0.55)"
  );

  gradient.addColorStop(
    0.45,
    "rgba(255,255,255,0.18)"
  );

  gradient.addColorStop(
    1,
    "rgba(255,255,255,0)"
  );

  context.fillStyle =
    gradient;

  context.fillRect(
    0,
    0,
    128,
    128
  );

  mist =
    new CanvasTexture(
      canvas
    );

  mist.colorSpace =
    SRGBColorSpace;

  return mist;
}