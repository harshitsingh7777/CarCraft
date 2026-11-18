"use client";

import { useEffect, useRef, useState } from "react";

export default function VideoScrollBackground({
  progress = 0,
  videoSrc = "/videos/carcraft-hero.mp4",
}) {
  const videoRef = useRef(null);
  const frameRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  const [mouse, setMouse] = useState({
    x: 0,
    y: 0,
  });

  /*
   * Mouse parallax
   */
  useEffect(() => {
    const handleMouseMove = (event) => {
      setMouse({
        x: event.clientX / window.innerWidth - 0.5,
        y: event.clientY / window.innerHeight - 0.5,
      });
    };

    window.addEventListener("mousemove", handleMouseMove, {
      passive: true,
    });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  /*
   * Keep video playing.
   */
  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    const startVideo = () => {
      video
        .play()
        .catch(() => {
          // Browser may block autoplay until interaction.
        });
    };

    if (video.readyState >= 2) {
      startVideo();
    }

    video.addEventListener("loadeddata", startVideo);

    return () => {
      video.removeEventListener("loadeddata", startVideo);
    };
  }, []);

  /*
   * Scroll controls the video position.
   *
   * When scrolling:
   * - progress determines the target position
   *
   * After scrolling:
   * - video continues playing normally
   */
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

    frameRef.current = requestAnimationFrame(() => {
      /*
       * Only seek when the scroll position is
       * meaningfully different.
       */
      if (
        Math.abs(video.currentTime - targetTime) > 0.08
      ) {
        video.currentTime = targetTime;
      }

      /*
       * Make sure playback continues.
       */
      if (video.paused) {
        video
          .play()
          .catch(() => {});
      }

      frameRef.current = null;
    });

    /*
     * After scrolling stops, continue playing.
     */
    clearTimeout(scrollTimeoutRef.current);

    scrollTimeoutRef.current = setTimeout(() => {
      if (video.paused) {
        video
          .play()
          .catch(() => {});
      }
    }, 150);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }

      clearTimeout(scrollTimeoutRef.current);
    };
  }, [progress]);

  /*
   * Initial video setup.
   */
  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    const handleLoadedMetadata = () => {
      video.currentTime = 0;

      video
        .play()
        .catch(() => {});
    };

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
        autoPlay
        loop
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