"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { HeroContactButton } from "@/components/HeroContactButton";
import { HeroIntroLoader } from "@/components/HeroIntroLoader";
import { HeroTeamMeet } from "@/components/HeroTeamMeet";

const HeroScene = dynamic(
  () => import("@/components/HeroScene").then((m) => m.HeroScene),
  {
    ssr: false,
    loading: () => (
      <div
        className="pointer-events-none absolute inset-0 z-0 min-h-[100dvh] w-full bg-black"
        aria-hidden
      />
    ),
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
  const smoothstep01 = (t: number) => {
    const x = Math.min(Math.max(t, 0), 1);
    return x * x * (3 - 2 * x);
  };
  // Local hero timeline (0..1): tune ethos to appear earlier and linger longer.
  const heroFade = 1 - seg(0.18, 0.26);

  // Ethos: copy first, cards second (so the text doesn't "arrive late" and instantly fade).
  const ethosTextIn = seg(0.06, 0.14);
  const ethosTextOut = 1 - seg(0.72, 0.86);
  const ethosTextOpacity = ethosTextIn * ethosTextOut;

  const ethosCardsIn = seg(0.18, 0.28);
  // Fade cards out once they have reached the top area.
  const ethosCardsOut = 1 - seg(0.5, 0.66);
  // Make fade-out steeper for a more pronounced disappearance.
  const ethosCardsOpacity = ethosCardsIn * Math.pow(ethosCardsOut, 1.8);

  // Keep old name for downstream transforms that assume an ethos-based parallax.
  const ethosIn = ethosTextIn;
  // Keep parallel narrative to two sections (title -> ethos) for now.
  const pubsIn = 0;
  const zoomT = seg(0.5, 0.92);
  /** Lab dot populate + fly path (same canvas as hero wave — see `HeroScene`). */
  const labHandoffStart = 0.7;
  const labHandoffEnd = 0.9;
  const labReveal = seg(labHandoffStart, labHandoffEnd);
  /** Any lab fly / populate: kill CSS overlays — bloom uses `--color-neural-fog` (#dadada) and reads as a grey wash. */
  const labSceneActive = labReveal > 0.035;
  const overlaySuppress = 1 - seg(0.76, 0.94);
  const bloom = labSceneActive
    ? 0
    : Math.max(0, (zoomT - 0.7) / 0.3) * overlaySuppress;
  const focusGlow = labSceneActive
    ? 0
    : Math.max(0, (zoomT - 0.74) / 0.26) * overlaySuppress;
  const studioLightFade = labSceneActive
    ? 0
    : (1 - seg(0.0, 0.14)) * (1 - labReveal * 0.92);
  /** Top/bottom `from-app` vignettes lift black level over the canvas; hide during lab. */
  const heroVignetteOpacity = labSceneActive ? 0 : 1;
  /** Cinematic left title: short beat, then clears for center copy. */
  const labTeamTitleIn = seg(0.58, 0.66);
  const labTeamTitleOut = 1 - seg(0.64, 0.74);
  const labTeamTitleOpacity = labTeamTitleIn * labTeamTitleOut;
  const labTeamTitleLift = (1 - labTeamTitleIn) * 22;
  /** Centered documentary serif: two beats — rise + blur in, then out. */
  const labNarrative1InT = seg(0.695, 0.762);
  const labNarrative1Out = 1 - seg(0.772, 0.828);
  const labNarrative1Appear = smoothstep01(labNarrative1InT);
  const labNarrative1Vanish = smoothstep01(1 - labNarrative1Out);
  const labNarrative1Opacity = labNarrative1Appear * labNarrative1Out;
  const labNarrative1Rise =
    (1 - labNarrative1Appear) * 32 - labNarrative1Vanish * 32;
  const labNarrative1Blur =
    (1 - labNarrative1Appear) * 11 + labNarrative1Vanish * 11;
  const labNarrative2InT = seg(0.812, 0.888);
  const labNarrative2Out = 1 - seg(0.9, 0.97);
  const labNarrative2Appear = smoothstep01(labNarrative2InT);
  const labNarrative2Vanish = smoothstep01(1 - labNarrative2Out);
  const labNarrative2Opacity = labNarrative2Appear * labNarrative2Out;
  const labNarrative2Rise =
    (1 - labNarrative2Appear) * 32 - labNarrative2Vanish * 32;
  const labNarrative2Blur =
    (1 - labNarrative2Appear) * 11 + labNarrative2Vanish * 11;
  const labNarrativeAny =
    labNarrative1Opacity > 0.04 || labNarrative2Opacity > 0.04;
  /** Meet-the-team strip + modal: fades in as the last narrative line exits. */
  const labTeamMeetReveal = smoothstep01(seg(0.904, 0.968));
  const rightParallax = ((1 - ethosIn) * 20).toFixed(1);
  const leftParallax = ((1 - ethosIn) * 14).toFixed(1);

  return (
    <>
      {!introDone && <HeroIntroLoader onComplete={onIntroComplete} />}

      <section
        ref={rootRef}
        className="relative box-border min-h-[480dvh] overflow-clip bg-black text-off-white"
        aria-label="Introduction"
      >
        <div className="hero-scroll-meter pointer-events-none fixed left-0 top-1/2 z-[70] -translate-y-1/2 transition-opacity duration-200">
          <div className="font-hero-mono rounded-r-md border border-l-0 border-white/20 bg-black/45 px-2 py-1 text-[0.58rem] uppercase tracking-[0.16em] text-white/80 backdrop-blur-sm md:px-2.5">
            {pageScrollPercent.toFixed(2)}%
          </div>
        </div>

        <div className="sticky top-0 h-[100dvh] overflow-hidden pt-[var(--header-height)]">
          <div className="pointer-events-none absolute inset-0 z-0">
            <HeroScene scrollProgress={progress} labReveal={labReveal} />
          </div>

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
            className="pointer-events-none absolute inset-y-0 left-0 z-[15] flex w-[min(100%,400px)] flex-col justify-center pl-[clamp(1rem,4.5vw,2.75rem)] pr-3 sm:w-[min(100%,440px)] sm:pr-6 md:w-[min(100%,480px)]"
            style={{
              opacity: labTeamTitleOpacity,
              transform: `translate3d(0, ${labTeamTitleLift}px, 0)`,
            }}
            aria-hidden={labTeamTitleOpacity < 0.04}
          >
            <div className="hero-lab-team-scan relative">
              <h2 className="font-sans hero-lab-team-breathe text-[clamp(1.65rem,5.8vw,3.15rem)] font-semibold uppercase leading-[0.97] tracking-[0.12em] text-[#e8ecf0] [text-shadow:0_0_48px_rgba(130,170,210,0.2),0_2px_0_rgba(0,0,0,0.88),0_0_1px_rgba(255,255,255,0.32)] sm:tracking-[0.15em] md:text-[clamp(2rem,4.2vw,3.25rem)] md:tracking-[0.18em]">
                The
                <br />
                Lab
                <br />
                Team
              </h2>
              <p className="font-hero-mono mt-3 max-w-[19rem] text-[0.56rem] uppercase leading-relaxed tracking-[0.18em] text-[rgba(155,185,210,0.62)] sm:mt-4 sm:text-[0.6rem] sm:tracking-[0.19em] md:text-[0.64rem] md:tracking-[0.18em]">
                Office 141.A33 · 1st floor · Science Building · University Campus,
                TUC
              </p>
            </div>
          </div>

          <div
            className="pointer-events-none absolute inset-0 z-[16] flex items-center justify-center px-[clamp(1.25rem,6vw,2.5rem)]"
            aria-hidden={!labNarrativeAny}
          >
            <div className="relative mx-auto min-h-[5.5rem] w-full max-w-[min(42rem,94vw)]">
              <p
                className="font-hero-serif absolute inset-x-0 top-1/2 mx-auto max-w-[min(42rem,94vw)] text-center text-[clamp(1.2rem,2.85vw,1.72rem)] font-normal leading-[1.48] tracking-[0.012em] text-white sm:leading-[1.52]"
                style={{
                  opacity: labNarrative1Opacity,
                  transform: `translate3d(0, calc(-50% + ${labNarrative1Rise}px), 0)`,
                  filter:
                    labNarrative1Blur > 0.2
                      ? `blur(${labNarrative1Blur.toFixed(2)}px)`
                      : "none",
                  textShadow:
                    "0 0 2px rgba(0,0,0,1), 0 1px 3px rgba(0,0,0,1), 0 3px 16px rgba(0,0,0,0.92), 0 8px 36px rgba(0,0,0,0.65), 0 0 48px rgba(0,0,0,0.45)",
                }}
              >
                We follow the signal through noise and artifact—
                <br />
                from raw measurement to understanding we can defend.
              </p>
              <p
                className="font-hero-serif absolute inset-x-0 top-1/2 mx-auto max-w-[min(42rem,94vw)] text-center text-[clamp(1.2rem,2.85vw,1.72rem)] font-normal leading-[1.48] tracking-[0.012em] text-white sm:leading-[1.52]"
                style={{
                  opacity: labNarrative2Opacity,
                  transform: `translate3d(0, calc(-50% + ${labNarrative2Rise}px), 0)`,
                  filter:
                    labNarrative2Blur > 0.2
                      ? `blur(${labNarrative2Blur.toFixed(2)}px)`
                      : "none",
                  textShadow:
                    "0 0 2px rgba(0,0,0,1), 0 1px 3px rgba(0,0,0,1), 0 3px 16px rgba(0,0,0,0.92), 0 8px 36px rgba(0,0,0,0.65), 0 0 48px rgba(0,0,0,0.45)",
                }}
              >
                Models, spectra, and code—tools we sharpen until they hold
                <br />
                when the world pushes back with noise and doubt.
              </p>
            </div>
          </div>

          <HeroTeamMeet reveal={labTeamMeetReveal} />

          <div
            className="pointer-events-none absolute left-0 right-0 top-0 z-[4] h-[22%] bg-gradient-to-b from-black to-transparent"
            style={{ opacity: heroVignetteOpacity }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 z-[4] h-[35%] bg-gradient-to-t from-black to-transparent"
            style={{ opacity: heroVignetteOpacity }}
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
              style={{
                opacity:
                  heroFade *
                  (1 - Math.max(ethosTextOpacity, ethosCardsOpacity)),
              }}
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
            style={{ opacity: Math.max(ethosTextOpacity, ethosCardsOpacity) }}
          >
            <div className="absolute left-[8vw] right-[8vw] top-[var(--header-height)] h-px bg-white/5" />
            <div className="mx-auto w-full max-w-[160rem] px-[0.625rem] lg:px-10">
              <div
                className="w-full transition-transform duration-200"
                style={{ transform: `translateY(${leftParallax}px)` }}
              >
              <div
                className="mb-10 grid grid-cols-1 gap-x-6 gap-y-6 md:mb-[60px] md:grid-cols-2 md:gap-x-6"
                style={{ opacity: ethosTextOpacity }}
              >
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
                <div className="relative flex flex-col items-start rounded-2xl border border-white/10 bg-black/35 px-4 py-4 backdrop-blur-[3px] md:px-5 md:py-5">
                  <div
                    className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-black/35 via-black/18 to-black/28"
                    aria-hidden
                  />
                  <p className="ref-p1 border-rich-carbon/30 relative z-[1] mb-6 border-t pt-5 text-white/95 [text-shadow:0_1px_2px_rgba(0,0,0,0.7)] md:mb-8">
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
                  <p className="ref-p1 relative z-[1] mb-6 text-white/92 [text-shadow:0_1px_2px_rgba(0,0,0,0.65)]">
                    Research spans biomedical imaging, machine vision, video
                    analysis and compression, archive search, and intelligent
                    modelling-so ideas move from equations to experiments and,
                    when it fits, to deployment.
                  </p>
                  <p className="ref-p2-mono relative z-[1] mb-6 text-white/85 [text-shadow:0_1px_2px_rgba(0,0,0,0.7)]">
                    School of Electrical and Computer Engineering, TUC ·
                    Division of Telecommunications ·{" "}
                    <a
                      href="https://www.display.tuc.gr/en/home"
                      className="underline decoration-white/45 underline-offset-[3px] transition-colors hover:text-white hover:decoration-white/85"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      display.tuc.gr
                    </a>
                  </p>
                  <span className="font-hero-mono relative z-[1] inline-block border border-white/65 bg-black/30 px-7 py-2.5 text-[0.62rem] uppercase tracking-[0.14em] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.75)]">
                    Join us
                  </span>
                </div>
              </div>

              <ul
                className="group flex flex-col gap-5 md:flex-row md:gap-0"
                style={{ opacity: ethosCardsOpacity }}
              >
                {ETHOS_CARDS.map((card, index) => {
                  const isActive = activeCard === index;
                  return (
                    <li
                      key={card.n}
                      className={`group/card w-full shrink-0 transition-[width] delay-100 duration-500 ease-[var(--easing)] md:min-w-0 md:w-[25%] md:group-has-[li.-active]:w-[20%] ${isActive ? "-active md:w-[40%]!" : ""}`}
                      onMouseEnter={() => setActiveCard(index)}
                      onMouseLeave={() => setActiveCard(null)}
                    >
                      <div className="relative h-[360px] w-full overflow-hidden rounded-[20px] transition-all delay-100 duration-500 ease-[var(--easing)] md:h-[420px] lg:h-[480px] md:w-[125%] md:group-[.-active]/card:w-full">
                        <div
                          className={`flex h-full w-full flex-col items-center justify-between gap-3 px-5 py-5 text-center md:py-6 lg:py-8 ${card.cardClass}`}
                        >
                          <h4 className="font-sans text-lg font-medium uppercase leading-none md:max-w-[290px] md:text-xl lg:text-2xl">
                            {card.title}
                          </h4>
                          <div className="relative h-[110px] w-full max-w-[210px] md:h-[130px] md:max-w-[230px] lg:h-[200px] lg:max-w-[300px]">
                            <Image
                              src={card.image}
                              alt={card.imageAlt}
                              width={800}
                              height={1000}
                              className="h-full w-full object-contain"
                            />
                          </div>
                          <div className="flex w-full max-w-[260px] flex-col gap-3 font-mono text-[0.688rem] uppercase leading-[0.938rem] md:max-w-[280px] md:text-[0.75rem]">
                            <p>{card.n}</p>
                            <p className="text-[0.78rem] normal-case leading-relaxed opacity-90 md:text-[0.85rem]">
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
