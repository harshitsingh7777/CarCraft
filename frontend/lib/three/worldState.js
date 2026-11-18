import { Vector3 } from "three";

export const world = {
  /*
   * Highway speed
   */
  speed: 30,

  /*
   * Main hero vehicle position
   */
  hero: new Vector3(0, 0.7, 0),

  /*
   * Page scroll.
   *
   * 0 = top
   * 1 = bottom
   */
  scroll: 0,

  /*
   * Cinematic intensity
   */
  intensity: 0,

  /*
   * Mouse parallax
   */
  mouseX: 0,

  mouseY: 0,
};