"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

/** Themes from DISPLAY Lab taught courses (TEL 301, 311, 411; INF 417) — short blurbs aligned with official outlines. */
const INDUSTRIES: { title: string; body: string }[] = [
  {
    title: "Digital signal processing",
    body:
      "Discrete-time signals and systems, sampling and quantization, Fourier and Z-transforms, multirate processing, and IIR/FIR filter design.",
  },
  {
    title: "Digital image processing",
    body:
      "Image modelling and perception, colour transforms, 2-D sampling and transforms, enhancement, restoration, and JPEG/MPEG-style coding.",
  },
  {
    title: "Statistical pattern recognition",
    body:
      "Bayes decisions, EM and HMMs, PCA, SVMs, deep networks, clustering, trees, and accuracy estimation with ROC analysis.",
  },
  {
    title: "Machine vision",
    body:
      "Segmentation, morphology, optical flow, stereo and 3D perception, with applications in robotics and automation.",
  },
  {
    title: "Spectral analysis & digital filters",
    body:
      "Power spectrum estimation, windowing, transform analysis of LTI systems, and structures for discrete-time filters.",
  },
  {
    title: "Image restoration & compression",
    body:
      "Deterministic and stochastic restoration, optimisation of restoration filters, and standards-based image and video coding.",
  },
  {
    title: "Classification & regression",
    body:
      "Linear and non-linear classifiers, neural networks, Bayesian networks, non-parametric methods, and cross-validation.",
  },
  {
    title: "Video & dynamic vision",
    body:
      "Motion estimation and tracking, video analysis, photometric stereo, and recovering 3D motion from image sequences.",
  },
  {
    title: "Biomedical signals & imaging",
    body:
      "Algorithms for acquisition, enhancement, segmentation, and diagnosis from multimodal medical and physiological data.",
  },
];

type Box = { width: number; height: number; offsetLeft: number; offsetTop: number };

export function FocusIndustriesList() {
  const listRef = useRef<HTMLUListElement>(null);
  const linkRefs = useRef<(HTMLLIElement | null)[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const animationStartRef = useRef<number | null>(null);
  const [activeLink, setActiveLink] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [box, setBox] = useState<Box>({
    width: 0,
    height: 0,
    offsetLeft: 0,
    offsetTop: 0,
  });

  const updateDimensions = useCallback((link: HTMLLIElement) => {
    const list = listRef.current;
    if (!list) return;
    /* Overlay is positioned vs list.parentElement, not vs ul (same bug as measuring only inside padded content). */
    const offsetParent = list.parentElement;
    if (!offsetParent) return;
    const parentRect = offsetParent.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    setBox({
      width: linkRect.width,
      height: linkRect.height,
      offsetLeft: linkRect.left - parentRect.left,
      offsetTop: linkRect.top - parentRect.top,
    });
  }, []);

  const clearActive = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setActiveLink(null);
  }, []);

  const animationDurationMs = 300;
  const animateUpdate = useCallback(
    (link: HTMLLIElement) => {
      const startedAt = animationStartRef.current;
      if (startedAt === null) return;
      const elapsed = Date.now() - startedAt;
      updateDimensions(link);

      if (elapsed < animationDurationMs) {
        animationFrameRef.current = requestAnimationFrame(() => animateUpdate(link));
      } else {
        animationFrameRef.current = null;
      }
    },
    [updateDimensions],
  );

  const setActive = useCallback(
    (index: number) => {
      setActiveLink(index);
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      window.setTimeout(() => {
        const link = linkRefs.current[index];
        if (link) {
          animationStartRef.current = Date.now();
          animateUpdate(link);
        }
      }, 200);
    },
    [animateUpdate],
  );

  const handleHover = useCallback(
    (index: number) => {
      if (!isMobile) setActive(index);
    },
    [isMobile, setActive],
  );

  const handleMouseLeave = useCallback(() => {
    if (!isMobile) clearActive();
  }, [isMobile, clearActive]);

  const handleClick = useCallback(
    (index: number) => {
      if (activeLink === index) clearActive();
      else setActive(index);
    },
    [activeLink, clearActive, setActive],
  );

  useLayoutEffect(() => {
    const first = linkRefs.current[0];
    if (!first) return;
    updateDimensions(first);
  }, [updateDimensions]);

  useEffect(() => {
    const check = () => {
      const m = window.innerWidth < 768;
      setIsMobile(m);
      if (m) setActive(0);
      else clearActive();
    };
    check();
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("resize", check);
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [setActive, clearActive]);

  const ease = "cubic-bezier(0.62, 0.16, 0.13, 1.01)";

  return (
    <div className="relative mx-auto w-full max-w-[160rem] px-[0.625rem] lg:px-10">
      <ul
        ref={listRef}
        className="relative isolate flex flex-col items-center text-center"
      >
        {INDUSTRIES.map((item, i) => {
          const contentId = `industry-content-${i + 1}`;
          const liProps =
            activeLink === i ? ({ "data-active": "" } as const) : {};
          return (
            <li
              key={item.title}
              ref={(el) => {
                linkRefs.current[i] = el;
              }}
              className="group grid grid-rows-[auto_0fr] px-[40px] py-[10px] text-center transition-[grid-template-rows,padding] duration-500 data-active:grid-rows-[auto_1fr] data-active:py-[60px] motion-reduce:duration-[0ms] md:py-0"
              style={{ transitionTimingFunction: ease }}
              {...liProps}
              onMouseEnter={() => handleHover(i)}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                className="relative isolate w-full overflow-hidden md:cursor-default"
                onClick={() => handleClick(i)}
                aria-expanded={activeLink === i}
                aria-controls={contentId}
              >
                <h3
                  className="h4 min-[360px]:h-vw uppercase transition-transform duration-500 group-data-active:-translate-y-full motion-reduce:duration-[0ms]"
                  style={{ transitionTimingFunction: ease }}
                >
                  {item.title}
                </h3>
                <span
                  aria-hidden
                  className="h4 min-[360px]:h-vw absolute inset-0 translate-y-full uppercase transition-transform duration-500 group-data-active:translate-y-0 motion-reduce:duration-[0ms]"
                  style={{ transitionTimingFunction: ease }}
                >
                  {item.title}
                </span>
              </button>
              <div
                className="flex justify-center overflow-hidden"
                id={contentId}
              >
                <p className="p2 max-w-[430px] pt-[4px] text-rich-carbon/90">
                  {item.body}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      <div
        className="pointer-events-none absolute top-0 left-0 h-full w-full transition-[width,left,top,height,opacity,transform,filter] duration-500 motion-reduce:hidden"
        style={{
          transitionTimingFunction: ease,
          width: box.width ? `${box.width}px` : undefined,
          height: box.height ? `${box.height}px` : undefined,
          left: box.offsetLeft,
          top: box.offsetTop,
          opacity: activeLink !== null ? 1 : 0,
          transform: activeLink !== null ? "scale(1)" : "scale(2)",
          filter: activeLink !== null ? "blur(0)" : "blur(10px)",
        }}
        aria-hidden
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <svg
            key={i}
            className="corner-accent text-pulse-ash md:size-[32px] size-[20px] duration-400"
            style={{ transitionTimingFunction: ease }}
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <path
              d="M0.499951 0.199996L0.499952 9.2M0.199951 0.499995L9.19995 0.499995"
              stroke="currentColor"
            />
          </svg>
        ))}
      </div>
    </div>
  );
}
