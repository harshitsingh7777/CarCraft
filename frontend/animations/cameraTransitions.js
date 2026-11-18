import gsap from "gsap";

// Read every frame by CameraRig. Tween these values to move the camera.
export const cameraState = {
  distance: 7.6, height: 1.1, angle: -0.45, fov: 42,
  lookX: -1.7, lookY: 0.75, lookZ: -3,
};

export const CAMERA_PRESETS = {
  hero: { distance: 7.6, height: 1.1, angle: -0.45, fov: 42, lookX: -1.7, lookY: 0.75, lookZ: -3 },
  low: { distance: 5.2, height: 0.55, angle: 0.5, fov: 38, lookX: 0, lookY: 0.6, lookZ: -1 },
  wide: { distance: 13, height: 2.4, angle: -0.9, fov: 46, lookX: 0, lookY: 0.8, lookZ: -6 },
};

export function flyTo(name, { duration = 2.2, ease = "power3.inOut" } = {}) {
  return gsap.to(cameraState, { ...CAMERA_PRESETS[name], duration, ease, overwrite: true });
}

export function introDolly() {
  Object.assign(cameraState, { distance: 15, height: 3, fov: 32, angle: -0.9 });
  return gsap.to(cameraState, { ...CAMERA_PRESETS.hero, duration: 3.6, ease: "power3.out" });
}