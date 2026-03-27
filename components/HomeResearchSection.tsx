"use client";

import { PortfolioGlitchLink } from "@/components/PortfolioGlitchLink";
import { ResearchDragCursor } from "@/components/ResearchDragCursor";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import type { Swiper as SwiperType } from "swiper";
import { Mousewheel } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";

gsap.registerPlugin(ScrollTrigger);

/**
 * Πρώτα 6 έργα από https://www.display.tuc.gr/en/research (νεότερα πρώτα).
 * Layout / carousel όπως reference #portfolio (page-source + main.min.css).
 */
const RESEARCH_PROJECTS = [
  {
    title: "GNΩSI",
    description:
      "Greek island Network of Science Interchange (GNΩSI).",
    initials: "GN",
  },
  {
    title: "smartHealth",
    description:
      "European Digital Innovation Hub for Smart Health: precision medicine and innovative e-health services.",
    initials: "sH",
  },
  {
    title: "RE-EURECA-PRO",
    description:
      "Research and innovation dimension of the European University on Responsible Consumption and Production.",
    initials: "RE",
  },
  {
    title: "BorderUAS",
    description:
      "Semi-autonomous border surveillance with next-gen UAVs and ultra-high-resolution multi-sensor payloads.",
    initials: "BU",
  },
  {
    title: "QuaLiSID",
    description:
      "Quality of Life Support System for persons with mental inabilities.",
    initials: "QL",
  },
  {
    title: "AdVISEr",
    description:
      "Automated inspection from aerial video of the Greek power lines network.",
    initials: "AV",
  },
] as const;

/** Hover καρτών: χρώματα κοντά στο επίσημο tuc.css (links #028dc0 / #015574, body bg #80878f). */
const HOVER_VARS = [
  { "--hover-background-color": "#028dc0", "--hover-logo-color": "#f5f5f5" },
  { "--hover-background-color": "#015574", "--hover-logo-color": "#e7e7e7" },
  { "--hover-background-color": "#80878f", "--hover-logo-color": "#111111" },
  { "--hover-background-color": "#5a6b78", "--hover-logo-color": "#f5f5f5" },
  { "--hover-background-color": "#e8e8e8", "--hover-logo-color": "#333333" },
  { "--hover-background-color": "#4a6d8c", "--hover-logo-color": "#f5f5f5" },
] as const;

const RESEARCH_URL = "https://www.display.tuc.gr/en/research";

/** Ίδιο με reference page-source `slider({ breakpoints: { 0: …, 768: … } })` για πιο smooth drag/snap. */
const RESEARCH_SWIPER_TOUCH = {
  longSwipesRatio: 0.15,
  longSwipesMs: 250,
  threshold: 3,
  resistanceRatio: 0.5,
  touchRatio: 1.2,
} as const;

/** Inner card: WQF portfolio slide (cqw + clip before + active expand). Hover χρώματα → globals `.portfolio-card-wqf`. */
const portfolioCardClass =
  "portfolio-card-wqf before:bg-off-white relative isolate flex h-[34.80cqw] w-[50.40cqw] flex-col items-center justify-center gap-[20px] overflow-hidden rounded-none p-0 text-center text-rich-carbon opacity-40 transition-[padding,width,height,border-radius,opacity,color] duration-300 ease-[var(--easing)] group-[.swiper-slide-active]:h-[89.60cqw] group-[.swiper-slide-active]:w-[67.20cqw] group-[.swiper-slide-active]:rounded-[20px] group-[.swiper-slide-active]:p-[24px] group-[.swiper-slide-active]:opacity-100 before:absolute before:inset-0 before:-z-1 before:size-full before:transition-[clip-path,background-color] before:delay-100 before:duration-300 before:ease-[var(--easing)] before:[clip-path:inset(0_0_100%_0)] group-[.swiper-slide-active]:before:[clip-path:inset(0_0_0_0)] md:h-[25.47cqw] md:w-[34.72cqw] xl:gap-[40px] md:group-[.swiper-slide-active]:h-[53.94cqw] md:group-[.swiper-slide-active]:w-[40.52cqw] lg:h-[18cqw] lg:w-[20.83cqw] lg:group-[.swiper-slide-active]:h-[32.36cqw] lg:group-[.swiper-slide-active]:w-[34.31cqw] xl:group-[.swiper-slide-active]:w-[24.31cqw]";

export function HomeResearchSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const swiperRef = useRef<SwiperType | null>(null);
  const [swiperReady, setSwiperReady] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [navAtStart, setNavAtStart] = useState(true);
  const [navAtEnd, setNavAtEnd] = useState(false);

  const totalSlides = RESEARCH_PROJECTS.length;

  const syncNavFromSwiper = (s: SwiperType) => {
    setActiveSlide(s.activeIndex);
    setNavAtStart(s.isBeginning);
    setNavAtEnd(s.isEnd);
  };

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    if (!section || !content) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      gsap.from(content, {
        opacity: 0,
        y: 80,
        duration: 1.2,
        ease: "power4.inOut",
        scrollTrigger: {
          trigger: section,
          start: "top 60%",
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="research"
      className="research-portfolio-section overflow-hidden pt-[170px] pb-[120px] md:pb-[200px]"
    >
      <div
        ref={contentRef}
        className="@container container mx-auto w-full max-w-[160rem] px-[0.625rem] lg:px-10"
        id="portfolio"
      >
        <div className="mx-auto mb-[80px] flex max-w-[668px] flex-col items-center gap-[15px] text-center md:mb-[100px]">
          <h2 className="p1-mono text-rich-carbon">Our research</h2>
          <p className="h5 mb-[24px] text-balance uppercase text-rich-carbon md:mb-[32px]">
            Our projects don&apos;t just join calls. They define consortia and
            outcomes.
          </p>
          <PortfolioGlitchLink
            href={RESEARCH_URL}
            label="View all research"
            external
            ariaLabel="View all research projects on display.tuc.gr"
            theme="dark"
          />
        </div>

        <div>
          <Swiper
            className="research-swiper !overflow-visible"
            modules={[Mousewheel]}
            centeredSlides
            slidesPerView="auto"
            initialSlide={0}
            speed={500}
            slideToClickedSlide
            longSwipesRatio={RESEARCH_SWIPER_TOUCH.longSwipesRatio}
            longSwipesMs={RESEARCH_SWIPER_TOUCH.longSwipesMs}
            threshold={RESEARCH_SWIPER_TOUCH.threshold}
            resistanceRatio={RESEARCH_SWIPER_TOUCH.resistanceRatio}
            touchRatio={RESEARCH_SWIPER_TOUCH.touchRatio}
            breakpoints={{
              768: {
                resistanceRatio: 0.2,
                touchRatio: 1.1,
              },
            }}
            mousewheel={{
              forceToAxis: true,
              releaseOnEdges: true,
            }}
            onSwiper={(s) => {
              swiperRef.current = s;
              setSwiperReady(true);
              syncNavFromSwiper(s);
            }}
            onSlideChange={(s) => syncNavFromSwiper(s)}
            onResize={(s) => syncNavFromSwiper(s)}
          >
            {RESEARCH_PROJECTS.map((p, index) => (
              <SwiperSlide
                key={p.title}
                className="swiper-slide group !w-fit [&_*]:transition-all [&_*]:duration-300 [&_*]:ease-[var(--easing)]"
              >
                <div
                  className={portfolioCardClass}
                  style={
                    HOVER_VARS[index % HOVER_VARS.length] as unknown as CSSProperties
                  }
                >
                  <div className="max-w-[270px] px-[40px] lg:pt-[20px] xl:pt-[36px] md:px-0 lg:opacity-0 lg:group-[.swiper-slide-active]:opacity-100 xl:opacity-100">
                    <button
                      type="button"
                      className="h6 md:h7 pointer-events-none cursor-none uppercase"
                      aria-label={`Focus slide ${p.title}`}
                      onClick={() => swiperRef.current?.slideTo(index)}
                    >
                      {p.title}
                    </button>
                  </div>

                  <div className="logo-mark flex size-[80px] items-center justify-center bg-off-white font-sans text-lg font-medium text-rich-carbon transition-[color,background-color] duration-300 ease-[var(--easing)] group-[.swiper-slide-active]:hover:bg-transparent md:text-xl">
                    {p.initials}
                  </div>

                  <div className="grid h-full w-full grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-[var(--easing)] group-[.swiper-slide-active]:grid-rows-[1fr] md:grid-rows-[auto_0fr] md:group-[.swiper-slide-active]:grid-rows-[auto_1fr]">
                    <div className="flex flex-col items-center justify-center gap-[20px] overflow-hidden">
                      <p className="p2-mono mx-auto mb-auto w-[67.20cqw] max-w-full shrink-0 pt-[15px] text-balance opacity-0 transition-opacity duration-300 group-[.swiper-slide-active]:opacity-60 md:w-[40.52cqw] lg:w-[24.31cqw] xl:max-w-[222px] xl:px-[20px]">
                        {p.description}
                      </p>
                    </div>
                    <div className="mt-auto opacity-0 transition-opacity duration-300 group-[.swiper-slide-active]:opacity-100 group-hover:[&_.button--dot]:bg-[currentColor]!">
                      <PortfolioGlitchLink
                        href={RESEARCH_URL}
                        label="Details"
                        external
                        ariaLabel={`${p.title} — full list on display.tuc.gr`}
                        theme="dark"
                      />
                    </div>
                  </div>

                  <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between p-[24px] opacity-0 transition-opacity duration-300 group-[.swiper-slide-active]:opacity-100">
                    <div className="size-[9px] border-t border-l border-current" />
                    <div className="size-[9px] border-t border-r border-current" />
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          <div
            className="mt-[80px] flex items-center justify-between md:mt-[100px] md:justify-center md:gap-[32px]"
            aria-label="Research carousel navigation"
          >
            <button
              type="button"
              className="research-nav-arrow"
              aria-label="Previous slide"
              disabled={navAtStart}
              onClick={() => swiperRef.current?.slidePrev()}
            >
              <svg
                className="size-[18px]"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <path
                  d="M10.0833 13H8.01667L4 9.02474L8.01667 5H10.0833L8.38333 6.69897L6.56667 8.38144L9.08333 8.29897H14V9.75052H9.08333L6.58333 9.66804L8.43333 11.367L10.0833 13Z"
                  fill="currentColor"
                />
              </svg>
            </button>
            <p className="p2-mono text-rich-carbon md:hidden">
              <span>{String(activeSlide + 1).padStart(2, "0")}</span> /{" "}
              {String(totalSlides).padStart(2, "0")}
            </p>
            <button
              type="button"
              className="research-nav-arrow"
              aria-label="Next slide"
              disabled={navAtEnd}
              onClick={() => swiperRef.current?.slideNext()}
            >
              <svg
                className="size-[18px]"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <path
                  d="M7.91667 13H9.98333L14 9.02474L9.98333 5H7.91667L9.61667 6.69897L11.4333 8.38144L8.91667 8.29897H4V9.75052H8.91667L11.4167 9.66804L9.56667 11.367L7.91667 13Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <ResearchDragCursor active={swiperReady} />
    </section>
  );
}
