"use client";

import { useEffect, useRef, useState } from "react";

export default function VideoScrollBackground({
  progress = 0,
  videoSrc = "/videos/carcraft-hero.mp4",
}) {
  const videoRef = useRef(null);
  const frameRef = useRef(null);

  const [mouse, setMouse] = useState({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const handleMouseMove = (event) => {
      setMouse({
        x: event.clientX / window.innerWidth - 0.5,
        y: event.clientY / window.innerHeight - 0.5,
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

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    if (
      !video.duration ||
      !Number.isFinite(video.duration)
    ) {
      return;
    }

    const targetTime =
      Math.max(0, Math.min(1, progress)) *
      video.duration;

    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }

    frameRef.current =
      requestAnimationFrame(() => {
        if (
          Math.abs(
            video.currentTime - targetTime
          ) > 0.015
        ) {
          video.currentTime = targetTime;
        }

        frameRef.current = null;
      });

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [progress]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    const handleLoadedMetadata = () => {
      video.currentTime = 0;
    };

    video.pause();

    video.addEventListener(
      "loadedmetadata",
      handleLoadedMetadata
    );

    return () => {
      video.removeEventListener(
        "loadedmetadata",
        handleLoadedMetadata
      );
    };
  }, []);

  return (
    <div className="carcraft-video-layer">
      <video
        ref={videoRef}
        className="carcraft-scroll-video"
        src={videoSrc}
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        style={{
          "--video-mouse-x": `${mouse.x * 14}px`,
          "--video-mouse-y": `${mouse.y * 9}px`,
        }}
      />

      <div className="carcraft-video-vignette" />

      <div className="carcraft-video-gradient" />
    </div>
  );
}