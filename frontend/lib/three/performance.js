
export const QUALITY = {
  high: { dpr: [1, 1.75], rain: 7000, spray: 220, city: 1400, reflector: true, reflectRes: 1024, sirenLight: true },
  low: { dpr: [1, 1.25], rain: 2200, spray: 80, city: 500, reflector: false, reflectRes: 0, sirenLight: false },
};

export function detectQuality() {
  if (typeof window === "undefined") return "high";
  const small = window.matchMedia("(max-width: 820px)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const weak = (navigator.hardwareConcurrency || 8) <= 4;
  return small || coarse || weak ? "low" : "high";
}