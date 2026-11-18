"use client";

import { useMemo } from "react";

const DROPLETS = [
  {
    left: "7%",
    top: "18%",
    size: 34,
    delay: "0s",
    duration: "8s",
    opacity: 0.24,
  },
  {
    left: "18%",
    top: "64%",
    size: 18,
    delay: "-3s",
    duration: "11s",
    opacity: 0.18,
  },
  {
    left: "31%",
    top: "11%",
    size: 13,
    delay: "-6s",
    duration: "9s",
    opacity: 0.2,
  },
  {
    left: "55%",
    top: "21%",
    size: 23,
    delay: "-2s",
    duration: "12s",
    opacity: 0.2,
  },
  {
    left: "67%",
    top: "70%",
    size: 16,
    delay: "-8s",
    duration: "10s",
    opacity: 0.16,
  },
  {
    left: "78%",
    top: "30%",
    size: 31,
    delay: "-5s",
    duration: "13s",
    opacity: 0.2,
  },
  {
    left: "91%",
    top: "57%",
    size: 21,
    delay: "-1s",
    duration: "9s",
    opacity: 0.18,
  },
  {
    left: "84%",
    top: "12%",
    size: 12,
    delay: "-7s",
    duration: "7s",
    opacity: 0.2,
  },
];

export default function LensDroplets() {
  const droplets = useMemo(() => DROPLETS, []);

  return (
    <div
      className="lens-droplets"
      aria-hidden="true"
    >
      {droplets.map((drop, index) => (
        <span
          key={index}
          className="lens-drop"
          style={{
            left: drop.left,
            top: drop.top,
            width: `${drop.size}px`,
            height: `${drop.size * 1.35}px`,
            opacity: drop.opacity,
            animationDelay: drop.delay,
            animationDuration: drop.duration,
          }}
        />
      ))}
    </div>
  );
}