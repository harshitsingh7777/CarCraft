"use client";

import { useEffect, useRef, useState } from "react";

const videos = [
  {
    id: "vehicles",
    src: "/videos/carcraft-hero.mp4",
  },
  {
    id: "services",
    src: "/videos/carcraft-rain.mp4",
  },
  {
    id: "parts",
    src: "/videos/carcraft-mountain.mp4",
  },
  {
    id: "accessories",
    src: "/videos/carcraft-accessories.mp4",
  },
];

export default function CinematicVideoBackground({
  progress = 0,
}) {
  const videoRefs = useRef([]);

  const [mouse, setMouse] = useState({
    x: 0,
    y: 0,
  });

  /* =====================================================
     MOUSE PARALLAX
  ===================================================== */

  useEffect(() => {
    const handleMouseMove = (event) => {
      setMouse({
        x:
          event.clientX / window.innerWidth - 0.5,

        y:
          event.clientY / window.innerHeight - 0.5,
      });
    };

    window.addEventListener(
      "mousemove",
      handleMouseMove,
      {
        passive: true,
      }
    );

    return () => {
      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );
    };
  }, []);

  /* =====================================================
     PLAY VIDEOS
     
     We intentionally DO NOT modify currentTime.
     Therefore scrolling never pauses or seeks the video.
  ===================================================== */

  useEffect(() => {
    const currentVideos = videoRefs.current;

    currentVideos.forEach((video) => {
      if (!video) return;

      const playVideo = () => {
        video.play().catch(() => {});
      };

      if (video.readyState >= 2) {
        playVideo();
      }

      video.addEventListener(
        "loadeddata",
        playVideo
      );

      video._carcraftPlayHandler =
        playVideo;
    });

    return () => {
      currentVideos.forEach((video) => {
        if (!video) return;

        if (video._carcraftPlayHandler) {
          video.removeEventListener(
            "loadeddata",
            video._carcraftPlayHandler
          );
        }
      });
    };
  }, []);

  /* =====================================================
     SCROLL → VIDEO CROSSFADE
     
     Timeline:

     0.00 → 0.25  Vehicles
     0.25 → 0.50  Services
     0.50 → 0.75  Parts
     0.75 → 1.00  Accessories

     Each video stays fully visible for most of
     its section, then crossfades into the next.
  ===================================================== */

  const clampedProgress = Math.max(
    0,
    Math.min(1, progress)
  );

  const totalTransitions =
    videos.length - 1;

  const timelinePosition =
    clampedProgress * totalTransitions;

  const baseIndex = Math.min(
    videos.length - 1,
    Math.floor(timelinePosition)
  );

  const localProgress =
    timelinePosition - baseIndex;

  /*
   * Crossfade begins during the final 25%
   * of each section.
   */

  const transitionStart = 0.75;

  let fadeProgress = 0;

  if (baseIndex < videos.length - 1) {
    if (localProgress > transitionStart) {
      fadeProgress =
        (localProgress - transitionStart) /
        (1 - transitionStart);
    }
  }

  /*
   * Smooth easing for the crossfade.
   */

  const easedFade =
    fadeProgress *
    fadeProgress *
    (3 - 2 * fadeProgress);

  const getOpacity = (index) => {
    /*
     * Final video.
     */
    if (
      baseIndex === videos.length - 1
    ) {
      return index === baseIndex
        ? 1
        : 0;
    }

    /*
     * Current video.
     */
    if (index === baseIndex) {
      return 1 - easedFade;
    }

    /*
     * Next video.
     */
    if (
      index === baseIndex + 1
    ) {
      return easedFade;
    }

    return 0;
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div
      className="cinematic-video-background"
      aria-hidden="true"
    >
      {videos.map((video, index) => {
        const opacity =
          getOpacity(index);

        const parallaxX =
          mouse.x * (10 - index * 1.5);

        const parallaxY =
          mouse.y * (6 - index * 0.8);

        const scale =
          1.035 +
          opacity * 0.02;

        return (
          <video
            key={video.id}
            ref={(element) => {
              videoRefs.current[index] =
                element;
            }}
            className="cinematic-video"
            src={video.src}
            muted
            autoPlay
            loop
            playsInline
            preload="auto"
            style={{
              opacity,

              transform: `
                translate3d(
                  ${parallaxX}px,
                  ${parallaxY}px,
                  0
                )
                scale(${scale})
              `,
            }}
          />
        );
      })}
    </div>
  );
}