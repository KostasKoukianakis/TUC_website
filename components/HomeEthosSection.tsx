"use client";

import { HeroContactButton } from "@/components/HeroContactButton";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

gsap.registerPlugin(ScrollTrigger);

const pillars = [
  {
    n: "01",
    title: "Imaging & vision",
    body: "Machine vision, non-invasive analysis, and search in image and video archives—turning raw visual data into reliable measurements and insight.",
    cardClass: "bg-[#2a3540] text-[#e8eaec]",
  },
  {
    n: "02",
    title: "Signals & health",
    body: "Biomedical image and signal processing: reception, identification, and diagnosis of operational problems in signals from medicine, industry, and telecommunications.",
    cardClass: "bg-[#364854] text-[#e8eaec]",
  },
  {
    n: "03",
    title: "Learning & models",
    body: "Non-linear system modelling with AI, neural networks, and fuzzy logic; time-series processing and compression for real-world, noisy data.",
    cardClass: "bg-[#425a68] text-[#e8eaec]",
  },
  {
    n: "04",
    title: "Education & impact",
    body: "Undergraduate and postgraduate courses, diploma work, and theses—linking theory to practice inside the Division of Telecommunications at TUC.",
    cardClass: "bg-[#4e6775] text-[#e8eaec]",
  },
] as const;

/**
 * Κουρτίνα scroll (reference page-source): το section ξεκινά clip από δεξιά
 * (inset 0 100% 0 0) και με scrub ανοίγει — από πίσω φαίνεται το bg-app = hero.
 * Hover (md+): κάρτες · Scroll (mobile): clip στις κάρτες.
 */
export function HomeEthosSection() {
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const cardsListRef = useRef<HTMLUListElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sectionEl = sectionRef.current;
    if (!sectionEl) return;

    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      if (!reduced) {
        // Reference (page-source) exact setup for ethos curtain.
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionEl,
            start: "top bottom-=10%",
            end: "top center",
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
        tl.from(sectionEl, {
          css: { clipPath: "inset(0 100% 0 0)" },
          duration: 1.2,
        });
      } else {
        gsap.set(sectionEl, { clearProps: "clipPath" });
      }

      mm.add("(max-width: 767px)", () => {
        const root = cardsListRef.current;
        if (!root) return;
        const lis = root.querySelectorAll<HTMLLIElement>("li");
        lis.forEach((card) => {
          gsap.from(card, {
            clipPath: "inset(0 0 100% 0)",
            duration: 0.6,
            ease: "power3.inOut",
            scrollTrigger: {
              trigger: card,
              start: "top 50%",
              end: "bottom bottom",
            },
          });
        });
      });
    }, sectionEl);

    const refresh = () => {
      ScrollTrigger.refresh();
    };
    requestAnimationFrame(() => {
      requestAnimationFrame(refresh);
    });
    window.addEventListener("load", refresh);
    const onIntroComplete = () => refresh();
    window.addEventListener("display:intro-complete", onIntroComplete);

    let resizeT: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      clearTimeout(resizeT);
      resizeT = setTimeout(refresh, 120);
    };
    window.addEventListener("resize", onResize);

    return () => {
      clearTimeout(resizeT);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", refresh);
      window.removeEventListener("display:intro-complete", onIntroComplete);
      ctx.revert();
      mm.revert();
    };
  }, []);

  return (
    <div className="bg-app">
      <section
        ref={sectionRef}
        className="relative z-[1] bg-neural-fog text-rich-carbon overflow-hidden rounded-t-[20px] pt-[120px] pb-[200px] will-change-[clip-path] md:py-[220px]"
        id="ethos"
        aria-labelledby="ethos-heading"
        style={{ clipPath: "inset(0 0 0 0)" }}
      >
      <div className="mx-auto w-full max-w-[160rem] px-[0.625rem] lg:px-10">
        <div className="mb-10 grid grid-cols-1 gap-x-6 gap-y-6 md:mb-[60px] md:grid-cols-2 md:gap-x-6">
          <div className="flex flex-col gap-3">
            <h2
              id="ethos-heading"
              className="font-mono text-[0.688rem] uppercase leading-[0.938rem] md:text-[0.75rem]"
            >
              Laboratory ethos
            </h2>
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
                Digital Image and Signal Processing Laboratory (DISPLAY Lab)
              </strong>{" "}
              operates under the Division of Telecommunications. We work on the
              reception, identification, and diagnosis of problems in signals
              used in telecommunications, industry, and biomedicine—bridging
              rigorous methods with applications that matter. This isn&apos;t a
              generic blurb: it&apos;s the same mission space described on the
              official lab site, expressed for this new front-end.
            </p>
            <p className="ref-p1 text-rich-carbon/80 mb-6">
              Research spans biomedical imaging, machine vision, video analysis
              and compression, archive search, and intelligent modelling—so ideas
              move from equations to experiments and, when it fits, to deployment.
            </p>
            <p className="ref-p2-mono mb-6 text-rich-carbon/55">
              School of Electrical and Computer Engineering, TUC · Division of
              Telecommunications ·{" "}
              <a
                href="https://www.display.tuc.gr/en/home"
                className="underline decoration-rich-carbon/30 underline-offset-[3px] transition-colors hover:text-rich-carbon hover:decoration-rich-carbon/60"
                target="_blank"
                rel="noopener noreferrer"
              >
                display.tuc.gr
              </a>
            </p>
            <HeroContactButton
              href="/people"
              label="Join us"
              variant="onLight"
            />
          </div>
        </div>

        <ul
          ref={cardsListRef}
          className="group flex flex-col gap-5 md:flex-row md:gap-0"
        >
          {pillars.map((item, index) => {
            const isActive = activeCard === index;

            return (
              <li
                key={item.n}
                className={`group/card w-full shrink-0 transition-[width] delay-100 duration-500 ease-[var(--easing)] md:min-w-0 md:w-[25%] md:group-has-[li.-active]:w-[20%] ${isActive ? "-active md:w-[40%]!" : ""}`}
                onMouseEnter={() => setActiveCard(index)}
                onMouseLeave={() => setActiveCard(null)}
              >
                <div
                  className={`relative h-full min-h-[260px] w-full overflow-hidden rounded-[20px] transition-all delay-100 duration-500 ease-[var(--easing)] md:min-h-[320px] md:w-[125%] md:group-[.-active]/card:w-full`}
                >
                  <div
                    className={`flex h-full min-h-[260px] w-full flex-col items-center justify-between gap-6 px-5 py-10 text-center md:min-h-[320px] md:py-[40px] ${item.cardClass}`}
                  >
                    <h3 className="font-sans text-xl font-medium uppercase leading-none md:max-w-[290px] md:text-2xl lg:text-[1.625rem]">
                      {item.title}
                    </h3>
                    {index === 0 && (
                      <div className="relative w-full max-w-[240px] md:max-w-[280px]">
                        <Image
                          src="/images/image_vision.webp"
                          alt="Imaging and vision dot illustration"
                          width={800}
                          height={1000}
                          className="h-auto w-full object-contain"
                          priority
                        />
                      </div>
                    )}
                    {index === 1 && (
                      <div className="relative w-full max-w-[240px] md:max-w-[280px]">
                        <Image
                          src="/images/signal_health.webp"
                          alt="Signals and health dot illustration"
                          width={800}
                          height={1000}
                          className="h-auto w-full object-contain"
                        />
                      </div>
                    )}
                    {index === 2 && (
                      <div className="relative w-full max-w-[240px] md:max-w-[280px]">
                        <Image
                          src="/images/learning_models.webp"
                          alt="Learning and models dot illustration"
                          width={800}
                          height={1000}
                          className="h-auto w-full object-contain"
                        />
                      </div>
                    )}
                    {index === 3 && (
                      <div className="relative w-full max-w-[240px] md:max-w-[280px]">
                        <Image
                          src="/images/education_impact.webp"
                          alt="Education and impact dot illustration"
                          width={800}
                          height={1000}
                          className="h-auto w-full object-contain"
                        />
                      </div>
                    )}
                    <div className="flex w-full max-w-[260px] flex-col gap-[15px] font-mono text-[0.688rem] uppercase leading-[0.938rem] md:max-w-[280px] md:text-[0.75rem]">
                      <p>{item.n} / 04</p>
                      <p className="h-[4.8em] overflow-hidden text-[0.8125rem] normal-case leading-relaxed opacity-90 md:text-[0.875rem]">
                        {item.body}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
    </div>
  );
}
