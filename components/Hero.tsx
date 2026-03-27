"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { HeroContactButton } from "@/components/HeroContactButton";
import { HeroIntroLoader } from "@/components/HeroIntroLoader";

const HeroScene = dynamic(
  () => import("@/components/HeroScene").then((m) => m.HeroScene),
  {
    ssr: false,
    loading: () => (
      <div
        className="pointer-events-none absolute inset-0 z-0 min-h-[100dvh] w-full bg-app"
        aria-hidden
      />
    ),
  },
);

const HeroLabDotScene = dynamic(
  () => import("@/components/HeroLabDotScene").then((m) => m.HeroLabDotScene),
  {
    ssr: false,
  },
);

const ETHOS_CARDS = [
  {
    n: "01 / 04",
    title: "Imaging & vision",
    body: "Machine vision, non-invasive analysis, and search in image and video archives-turning raw visual data into reliable measurements and insight.",
    image: "/images/image_vision.webp",
    imageAlt: "Imaging and vision dot illustration",
    cardClass: "bg-[#2a3540] text-[#e8eaec]",
  },
  {
    n: "02 / 04",
    title: "Signals & health",
    body: "Biomedical image and signal processing: reception, identification, and diagnosis of operational problems in signals from medicine, industry, and telecommunications.",
    image: "/images/signal_health.webp",
    imageAlt: "Signals and health dot illustration",
    cardClass: "bg-[#364854] text-[#e8eaec]",
  },
  {
    n: "03 / 04",
    title: "Learning & models",
    body: "Non-linear system modelling with AI, neural networks, and fuzzy logic; time-series processing and compression for real-world, noisy data.",
    image: "/images/learning_models.webp",
    imageAlt: "Learning and models dot illustration",
    cardClass: "bg-[#425a68] text-[#e8eaec]",
  },
  {
    n: "04 / 04",
    title: "Education & impact",
    body: "Undergraduate and postgraduate courses, diploma work, and theses-linking theory to practice inside the Division of Telecommunications at TUC.",
    image: "/images/education_impact.webp",
    imageAlt: "Education and impact dot illustration",
    cardClass: "bg-[#4e6775] text-[#e8eaec]",
  },
] as const;

/**
 * Hero: particle grid + wave shaders (reference HTML) + κεντρικό κείμενο / fades / γωνίες.
 */
export function Hero() {
  const [introDone, setIntroDone] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pageScrollPercent, setPageScrollPercent] = useState(0);
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const rootRef = useRef<HTMLElement>(null);
  const onIntroComplete = useCallback(() => setIntroDone(true), []);

  useEffect(() => {
    if (!introDone) return;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.dispatchEvent(new CustomEvent("display:intro-complete"));
      });
    });
    return () => cancelAnimationFrame(id);
  }, [introDone]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const rect = root.getBoundingClientRect();
        const total = Math.max(1, root.offsetHeight - window.innerHeight);
        const p = Math.min(Math.max(-rect.top / total, 0), 1);
        setProgress(p);
        ticking = false;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    let ticking = false;
    const onPageScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const max = Math.max(
          1,
          document.documentElement.scrollHeight - window.innerHeight,
        );
        const pct = (window.scrollY / max) * 100;
        setPageScrollPercent(pct);
        ticking = false;
      });
    };

    onPageScroll();
    window.addEventListener("scroll", onPageScroll, { passive: true });
    window.addEventListener("resize", onPageScroll);
    return () => {
      window.removeEventListener("scroll", onPageScroll);
      window.removeEventListener("resize", onPageScroll);
    };
  }, []);

  const seg = (start: number, end: number) =>
    Math.min(Math.max((progress - start) / (end - start), 0), 1);
  // Local hero timeline (0..1): show ethos around 12-15% of hero scroll.
  const heroFade = 1 - seg(0.18, 0.26);
  const ethosIn = seg(0.24, 0.32);
  const ethosOut = 1 - seg(0.5, 0.68);
  const researchOpacity = ethosIn * ethosOut;
  // Keep parallel narrative to two sections (title -> ethos) for now.
  const pubsIn = 0;
  const zoomT = seg(0.5, 0.92);
  /** Wave-field WebGL: fades out; lab picks up exactly at end (no dead scroll gap). */
  const hero3dOpacity = 1 - seg(0.4, 0.54);
  /** Lab: same scroll range as before but starts when wave is gone (no CSS double-fade on canvas). */
  const labReveal = seg(0.54, 0.88);
  const showLab = labReveal > 0.02;
  const showHeroScene = hero3dOpacity > 0.02;
  const bloom = Math.max(0, (zoomT - 0.7) / 0.3);
  const focusGlow = Math.max(0, (zoomT - 0.74) / 0.26);
  const studioLightFade = 1 - seg(0.0, 0.14);
  const rightParallax = ((1 - ethosIn) * 20).toFixed(1);
  const leftParallax = ((1 - ethosIn) * 14).toFixed(1);

  return (
    <>
      {!introDone && <HeroIntroLoader onComplete={onIntroComplete} />}

      <section
        ref={rootRef}
        className="relative box-border min-h-[400dvh] overflow-clip bg-app text-off-white"
        aria-label="Introduction"
      >
        <div className="pointer-events-none fixed left-0 top-1/2 z-[70] -translate-y-1/2">
          <div className="font-hero-mono rounded-r-md border border-l-0 border-white/20 bg-black/45 px-2 py-1 text-[0.58rem] uppercase tracking-[0.16em] text-white/80 backdrop-blur-sm md:px-2.5">
            {pageScrollPercent.toFixed(2)}%
          </div>
        </div>

        <div className="sticky top-0 h-[100dvh] overflow-hidden pt-[var(--header-height)]">
          {showHeroScene && (
            <div
              className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-[480ms] ease-out"
              style={{ opacity: hero3dOpacity }}
            >
              <HeroScene scrollProgress={progress} />
            </div>
          )}

          <div
            className="pointer-events-none absolute inset-0 z-[8] transition-opacity duration-300"
            style={{
              opacity: bloom,
              backgroundColor: "var(--color-neural-fog)",
            }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 z-[8] mix-blend-multiply"
            style={{
              opacity: bloom * 0.55,
              backgroundImage:
                "radial-gradient(rgba(12,12,12,0.22) 0.7px, transparent 0.8px), radial-gradient(rgba(0,0,0,0.18) 0.6px, transparent 0.7px)",
              backgroundSize: "3px 3px, 5px 5px",
              backgroundPosition: "0 0, 1px 2px",
            }}
            aria-hidden
          />
          {showLab && (
            <HeroLabDotScene progress={labReveal} opacity={labReveal} />
          )}
          <div
            className="pointer-events-none absolute inset-0 z-[10] transition-opacity duration-300"
            style={{
              opacity: focusGlow * 0.36,
              background:
                "radial-gradient(ellipse 26% 20% at 62% 54%, rgba(225,240,248,0.52) 0%, rgba(185,212,226,0.18) 42%, rgba(20,20,20,0) 72%)",
              mixBlendMode: "screen",
            }}
            aria-hidden
          />

          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-full"
            style={{ opacity: studioLightFade }}
            aria-hidden
          >
            <div className="h-full w-full bg-[radial-gradient(ellipse_22%_72%_at_50%_0%,rgba(228,232,228,0.13)_0%,rgba(200,212,205,0.06)_45%,transparent_100%),radial-gradient(ellipse_50%_42%_at_50%_0%,rgba(200,210,205,0.025)_0%,transparent_80%)]" />
          </div>

          <div
            className="pointer-events-none absolute left-0 right-0 top-0 z-[4] h-[22%] bg-gradient-to-b from-app to-transparent"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 z-[4] h-[35%] bg-gradient-to-t from-app to-transparent"
            aria-hidden
          />

          <div
            className="pointer-events-none absolute left-[1.2rem] top-[1.2rem] z-[20] h-3.5 w-3.5 border-l border-t border-[#d1d1d1]/25"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute right-[1.2rem] top-[1.2rem] z-[20] h-3.5 w-3.5 border-r border-t border-[#d1d1d1]/25"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute bottom-[1.2rem] left-[1.2rem] z-[20] h-3.5 w-3.5 border-b border-l border-[#d1d1d1]/25"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute bottom-[1.2rem] right-[1.2rem] z-[20] h-3.5 w-3.5 border-b border-r border-[#d1d1d1]/25"
            aria-hidden
          />

          <div className="hero-bottom-animate pointer-events-none absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 md:bottom-10">
            <span className="font-hero-mono text-[0.52rem] uppercase tracking-[0.22em] text-[rgba(200,200,200,0.28)]">
              Scroll
            </span>
            <span className="hero-scroll-line block h-10 w-px" />
          </div>
        </div>

        <div className="absolute inset-x-0 top-0 z-10 h-[300dvh]">
          <section className="pointer-events-none flex h-[100dvh] items-start justify-center p-[20%] pt-[12vh] md:pt-[10vh]">
            <div
              className="relative flex w-full max-w-4xl flex-col items-center text-center"
              style={{ opacity: heroFade * (1 - researchOpacity) }}
            >
              <div
                className="pointer-events-none absolute inset-x-0 top-[14vh] z-[1] mx-auto h-[38vh] w-[min(92vw,980px)] rounded-full bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.46)_0%,rgba(0,0,0,0.26)_42%,rgba(0,0,0,0)_72%)] blur-2xl"
                aria-hidden
              />
              <p className="font-hero-mono hero-eyebrow-animate mb-6 text-[0.6rem] uppercase leading-relaxed tracking-[0.22em] text-[rgba(160,205,220,0.65)] md:mb-7">
                Technical University of Crete &nbsp;·&nbsp; ECE Department
              </p>
              <h1 className="font-sans hero-title-animate relative z-[2] mb-5 text-[clamp(2rem,4.2vw,4rem)] font-semibold uppercase leading-[1.15] tracking-[0.06em] text-[#f2f2f2] [text-shadow:0_4px_26px_rgba(0,0,0,0.72)] md:mb-6">
                Signal &amp; Image
                <br />
                Processing Lab
              </h1>
              <p className="font-hero-mono hero-sub-animate max-w-2xl text-[0.64rem] uppercase leading-relaxed tracking-[0.14em] text-[rgba(200,200,200,0.38)]">
                Computational &nbsp;·&nbsp; Sparse &nbsp;·&nbsp; Adaptive
                &nbsp;·&nbsp; Spectral
              </p>
            </div>
          </section>

          <section
            className="pointer-events-auto flex h-[100dvh] items-end justify-center"
            style={{ opacity: researchOpacity }}
          >
            <div className="absolute left-[8vw] right-[8vw] top-[var(--header-height)] h-px bg-white/5" />
            <div className="mx-auto w-full max-w-[160rem] px-[0.625rem] lg:px-10">
              <div
                className="w-full transition-transform duration-200"
                style={{ transform: `translateY(${leftParallax}px)` }}
              >
              <div className="mb-10 grid grid-cols-1 gap-x-6 gap-y-6 md:mb-[60px] md:grid-cols-2 md:gap-x-6">
                <div className="flex flex-col gap-3">
                  <h3 className="font-mono text-[0.688rem] uppercase leading-[0.938rem] md:text-[0.75rem]">
                    Laboratory ethos
                  </h3>
                  <p className="font-sans text-2xl font-medium uppercase leading-none md:text-[1.875rem]">
                    Science with signal.
                    <br />
                    Systems with purpose.
                  </p>
                </div>
                <div className="flex flex-col items-start">
                  <p className="ref-p1 border-rich-carbon/20 mb-6 border-t border-rich-carbon/20 pt-5 md:mb-8">
                    The{" "}
                    <strong className="font-medium">
                      Digital Image and Signal Processing Laboratory (DISPLAY
                      Lab)
                    </strong>{" "}
                    operates under the Division of Telecommunications. We work
                    on the reception, identification, and diagnosis of problems
                    in signals used in telecommunications, industry, and
                    biomedicine-bridging rigorous methods with applications
                    that matter. This isn&apos;t a generic blurb: it&apos;s the
                    same mission space described on the official lab site,
                    expressed for this new front-end.
                  </p>
                  <p className="ref-p1 mb-6 text-white/90">
                    Research spans biomedical imaging, machine vision, video
                    analysis and compression, archive search, and intelligent
                    modelling-so ideas move from equations to experiments and,
                    when it fits, to deployment.
                  </p>
                  <p className="ref-p2-mono mb-6 text-white/75">
                    School of Electrical and Computer Engineering, TUC ·
                    Division of Telecommunications ·{" "}
                    <a
                      href="https://www.display.tuc.gr/en/home"
                      className="underline decoration-white/35 underline-offset-[3px] transition-colors hover:text-white hover:decoration-white/75"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      display.tuc.gr
                    </a>
                  </p>
                  <span className="font-hero-mono inline-block border border-white/45 px-7 py-2.5 text-[0.62rem] uppercase tracking-[0.14em] text-white">
                    Join us
                  </span>
                </div>
              </div>

              <ul className="group flex flex-col gap-5 md:flex-row md:gap-0">
                {ETHOS_CARDS.map((card, index) => {
                  const isActive = activeCard === index;
                  return (
                    <li
                      key={card.n}
                      className={`group/card w-full shrink-0 transition-[width] delay-100 duration-500 ease-[var(--easing)] md:min-w-0 md:w-[25%] md:group-has-[li.-active]:w-[20%] ${isActive ? "-active md:w-[40%]!" : ""}`}
                      onMouseEnter={() => setActiveCard(index)}
                      onMouseLeave={() => setActiveCard(null)}
                    >
                      <div className="relative h-full min-h-[260px] w-full overflow-hidden rounded-[20px] transition-all delay-100 duration-500 ease-[var(--easing)] md:min-h-[320px] md:w-[125%] md:group-[.-active]/card:w-full">
                        <div
                          className={`flex h-full min-h-[260px] w-full flex-col items-center justify-between gap-6 px-5 py-10 text-center md:min-h-[320px] md:py-[40px] ${card.cardClass}`}
                        >
                          <h4 className="font-sans text-xl font-medium uppercase leading-none md:max-w-[290px] md:text-2xl lg:text-[1.625rem]">
                            {card.title}
                          </h4>
                          <div className="relative w-full max-w-[240px] md:max-w-[280px]">
                            <Image
                              src={card.image}
                              alt={card.imageAlt}
                              width={800}
                              height={1000}
                              className="h-auto w-full object-contain"
                            />
                          </div>
                          <div className="flex w-full max-w-[260px] flex-col gap-[15px] font-mono text-[0.688rem] uppercase leading-[0.938rem] md:max-w-[280px] md:text-[0.75rem]">
                            <p>{card.n}</p>
                            <p className="h-[4.8em] overflow-hidden text-[0.8125rem] normal-case leading-relaxed opacity-90 md:text-[0.875rem]">
                              {card.body}
                            </p>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
              </div>
            </div>
          </section>

          <section
            className="pointer-events-none flex h-[100dvh] items-center justify-center p-[20%]"
            style={{ opacity: pubsIn }}
          >
            <div
              className="max-w-[40rem] text-center transition-transform duration-200"
              style={{
                transform: `translateY(${(24 - pubsIn * 24).toFixed(1)}px)`,
              }}
            >
              <p className="font-hero-mono mb-4 text-[0.6rem] uppercase tracking-[0.22em] text-[rgba(160,205,220,0.55)]">
                02 / Publications
              </p>
              <h2 className="mb-5 font-sans text-[clamp(1.8rem,3.5vw,3.2rem)] font-semibold uppercase leading-[1.15] tracking-[0.04em] text-[#efefef]">
                Advancing the
                <br />
                State of the Art
              </h2>
              <p className="mb-8 text-[0.9rem] font-light leading-[1.9] text-[rgba(200,200,200,0.55)]">
                From dictionary learning to deep unfolding networks, we push
                the boundaries of what is computationally possible in signal
                and image processing.
              </p>
              <span className="font-hero-mono inline-block border border-white/25 px-8 py-3 text-[0.62rem] uppercase tracking-[0.14em] text-[#d1d1d1]">
                View Publications
              </span>
            </div>
          </section>
        </div>
      </section>
    </>
  );
}
