"use client";

import { useEffect, useRef, useState } from "react";

/** Ίδιο cubic-bezier easing με το page-source του WQF (x-init progress) */
function easing(timeProgress: number): number {
  const p1x = 0.62;
  const p1y = 0.16;
  const p2x = 0.13;
  const p2y = 1.01;

  const cx = 3 * p1x;
  const bx = 3 * (p2x - p1x) - cx;
  const ax = 1 - cx - bx;

  const cy = 3 * p1y;
  const by = 3 * (p2y - p1y) - cy;
  const ay = 1 - cy - by;

  let x = timeProgress;
  for (let i = 0; i < 4; i++) {
    const currentX = ((ax * x + bx) * x + cx) * x;
    const currentSlope = (3 * ax * x + 2 * bx) * x + cx;
    if (currentSlope === 0) break;
    x -= (currentX - timeProgress) / currentSlope;
  }

  return ((ay * x + by) * x + cy) * x;
}

type Props = {
  onComplete: () => void;
  onProgress?: (progress: number) => void;
};

const INTRO_DURATION_MS = 5200;
const EXIT_DURATION_MS = 520;

export function HeroIntroLoader({ onComplete, onProgress }: Props) {
  const progressRef = useRef<HTMLSpanElement>(null);
  const [phase, setPhase] = useState<"loading" | "exit" | "done">("loading");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.classList.add("display-intro-active");
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const duration = prefersReducedMotion ? 900 : INTRO_DURATION_MS;
    const startTime = performance.now();
    let raf = 0;
    let exitTimer = 0;
    let completeTimer = 0;

    const tick = () => {
      const now = performance.now();
      const elapsed = now - startTime;
      const timeProgress = Math.min(elapsed / duration, 1);
      const sceneProgress = timeProgress;
      const percent = Math.round(easing(timeProgress) * 100);
      onProgress?.(sceneProgress);

      if (progressRef.current) {
        progressRef.current.textContent = `${percent}%`;
      }

      if (timeProgress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        document.body.style.overflow = "";
        document.body.classList.remove("display-intro-active");
        exitTimer = window.setTimeout(() => {
          requestAnimationFrame(() => {
            window.dispatchEvent(new CustomEvent("display:intro-complete"));
          });
        }, 60);
        setPhase("exit");
        completeTimer = window.setTimeout(() => {
          setPhase("done");
          onComplete();
        }, EXIT_DURATION_MS);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(exitTimer);
      window.clearTimeout(completeTimer);
      document.body.style.overflow = "";
      document.body.classList.remove("display-intro-active");
    };
  }, [onComplete, onProgress]);

  if (phase === "done") return null;

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[100] overflow-hidden bg-black/35 transition-opacity duration-[520ms] ease-wqf ${
        phase === "exit" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      aria-busy={phase === "loading"}
      aria-label="Loading"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_42%_at_50%_50%,rgba(80,115,135,0.06),rgba(0,0,0,0.12)_58%,rgba(0,0,0,0.38)_100%)]" />
      <span
        ref={progressRef}
        className="font-hero-mono absolute bottom-[30px] left-1/2 -translate-x-1/2 text-xs uppercase tracking-widest text-off-white/60 md:text-sm"
      >
        0%
      </span>
    </div>
  );
}
