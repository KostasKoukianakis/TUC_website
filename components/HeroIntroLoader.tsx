"use client";

import { WqfLogoMark } from "@/components/WqfLogoMark";
import { useEffect, useState } from "react";

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
};

export function HeroIntroLoader({ onComplete }: Props) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"loading" | "exit" | "done">("loading");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const duration = 1400;
    const startTime = Date.now();
    let raf = 0;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const timeProgress = Math.min(elapsed / duration, 1);
      setProgress(Math.round(easing(timeProgress) * 100));

      if (timeProgress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        document.body.style.overflow = "";
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            window.dispatchEvent(new CustomEvent("display:intro-complete"));
          });
        });
        setPhase("exit");
        window.setTimeout(() => {
          setPhase("done");
          onComplete();
        }, 450);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = "";
    };
  }, [onComplete]);

  if (phase === "done") return null;

  return (
    <div
      className={`hero-intro-loader fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0c0c0d] transition-opacity duration-[450ms] ease-wqf ${
        phase === "exit" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      aria-busy={phase === "loading"}
      aria-label="Loading"
    >
      <div className="relative isolate flex w-[120px] items-center justify-center md:w-[200px]">
        <div className="loader--clip-svg inline-flex overflow-hidden">
          <WqfLogoMark className="loader--logo h-14 w-14 text-off-white md:h-[4.5rem] md:w-[4.5rem]" />
        </div>
      </div>
      <span className="font-mono absolute bottom-[30px] left-1/2 -translate-x-1/2 text-xs uppercase tracking-widest text-off-white/60 md:text-sm">
        {progress}%
      </span>
    </div>
  );
}
