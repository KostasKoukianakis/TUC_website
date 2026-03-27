"use client";

import { FocusIndustriesList } from "@/components/FocusIndustriesList";
import { TunnelTheme } from "@/components/ui/tunnel-hero";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

export function HomeFocusSection() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasPinRef = useRef<HTMLDivElement>(null);
  const focusRef = useRef<HTMLElement>(null);
  const industriesRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const preheadingRef = useRef<HTMLHeadingElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const industriesContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvasPin = canvasPinRef.current;
    const focus = focusRef.current;
    const industries = industriesRef.current;
    const overlay = overlayRef.current;
    const industriesContent = industriesContentRef.current;
    if (!root || !canvasPin || !focus || !industries || !overlay || !industriesContent) return;

    const setOverlayVisible = (visible: boolean) => {
      gsap.set(overlay, { opacity: visible ? 1 : 0, visibility: visible ? "visible" : "hidden" });
    };
    setOverlayVisible(false);
    const io = new IntersectionObserver(
      ([entry]) => {
        setOverlayVisible(entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "0px" },
    );
    io.observe(root);

    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: "bottom bottom",
        pin: canvasPin,
        pinSpacing: false,
        scrub: true,
        markers: false,
      });

      gsap.from([preheadingRef.current, headingRef.current, descriptionRef.current], {
        opacity: 0,
        y: 64,
        ease: "power4.inOut",
        duration: 1.2,
        scrollTrigger: {
          trigger: focus,
          start: "top 50%",
        },
      });

      gsap.from(industriesContent, {
        opacity: 0,
        y: 80,
        duration: 1.2,
        ease: "power4.inOut",
        scrollTrigger: {
          trigger: industries,
          start: "top 60%",
        },
      });
    }, root);

    return () => {
      ctx.revert();
      mm.revert();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      id="focus-industries"
      className="bg-neural-fog text-rich-carbon relative isolate -mt-[2px] overflow-hidden"
    >
      <div ref={canvasPinRef} className="absolute inset-0 z-0 size-full">
        <TunnelTheme />
      </div>

      {/* Reference: fog vignette πάνω από κείμενο + canvas — αλλιώς το fade δεν φαίνεται (z κάτω από content). */}
      <div
        ref={overlayRef}
        className="pointer-events-none fixed inset-0 z-20 h-dvh w-full bg-gradient-to-b from-neural-fog via-transparent to-neural-fog opacity-0"
        aria-hidden
      />

      <section
        ref={focusRef}
        id="focus"
        className="relative z-10 flex h-dvh items-center overflow-hidden"
      >
        <div className="mx-auto w-full max-w-[160rem] px-[0.625rem] text-center lg:px-10">
          <div className="mx-auto flex max-w-[895px] flex-col items-center gap-[30px]">
            <div className="flex flex-col gap-3">
              <h2
                ref={preheadingRef}
                className="p1-mono"
              >
                Our focus
              </h2>
              <h3
                ref={headingRef}
                className="h2 uppercase"
              >
                Imaging intelligence. Signal insight. Real-world impact.
              </h3>
            </div>
            <p
              ref={descriptionRef}
              className="p2 mx-auto max-w-[430px] text-balance text-rich-carbon/90"
            >
              DISPLAY Lab advances computer vision, biomedical signal processing,
              and AI-driven modelling for telecommunications, industry, and
              health. We connect rigorous theory with systems that can be tested,
              validated, and deployed.
            </p>
          </div>
        </div>
      </section>

      <section
        ref={industriesRef}
        id="industries"
        className="relative z-10 -mt-px min-h-dvh py-[40px] md:py-[100px]"
      >
        <div ref={industriesContentRef}>
          <FocusIndustriesList />
        </div>
      </section>
    </div>
  );
}

