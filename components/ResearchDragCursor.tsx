"use client";

import gsap from "gsap";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";

function isExternalUrl(href: string | null): boolean {
  if (!href) return false;
  if (href.startsWith("mailto:")) return true;
  if (!href.includes("http")) return false;
  try {
    const u = new URL(href, window.location.origin);
    return u.hostname !== window.location.hostname;
  } catch {
    return false;
  }
}

export function ResearchDragCursor({ active }: { active: boolean }) {
  const elRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const red = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setEnabled(mq.matches && !red.matches);
    sync();
    mq.addEventListener("change", sync);
    red.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      red.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    if (!active || !enabled || !mounted) return;
    const el = elRef.current;
    const swiper = document.querySelector(".research-swiper");
    if (!el || !swiper) return;

    swiper.classList.add("research-swiper--drag-cursor");

    gsap.set(el, { xPercent: -50, yPercent: -50 });
    const quickX = gsap.quickTo(el, "x", {
      duration: 0.3,
      ease: "power2.out",
    });
    const quickY = gsap.quickTo(el, "y", {
      duration: 0.3,
      ease: "power2.out",
    });

    let isExternalLink = false;

    const onMove = (e: MouseEvent | TouchEvent) => {
      const clientX =
        "touches" in e ? (e.touches[0]?.clientX ?? 0) : e.clientX;
      const clientY =
        "touches" in e ? (e.touches[0]?.clientY ?? 0) : e.clientY;
      if (clientX === 0 && clientY === 0) return;
      quickX(clientX);
      quickY(clientY);
    };

    const animateToVisit = () => {
      gsap.to(el, { width: 135, duration: 0.3, ease: "power2.out" });
      const spans = el.querySelectorAll("span");
      gsap.to(spans, { y: "-100%", duration: 0.3, ease: "power2.out" });
    };

    const animateToDrag = () => {
      gsap.to(el, { width: "auto", duration: 0.3, ease: "power2.out" });
      const spans = el.querySelectorAll("span");
      gsap.to(spans, { y: "0%", duration: 0.3, ease: "power2.out" });
    };

    const show = () => {
      gsap.to(el, {
        opacity: 1,
        scale: 1,
        duration: 0.2,
        ease: "power4.inOut",
      });
    };

    const hide = () => {
      gsap.to(el, {
        opacity: 0,
        scale: 0.2,
        duration: 0.2,
        ease: "power4.inOut",
      });
    };

    const handleLinkEnter = (a: HTMLAnchorElement) => {
      const href = a.getAttribute("href");
      if (href && isExternalUrl(href)) {
        isExternalLink = true;
        animateToVisit();
      }
    };

    const handleLinkLeave = () => {
      if (isExternalLink) {
        isExternalLink = false;
        animateToDrag();
      }
    };

    const cleanups: Array<() => void> = [];
    const slides = swiper.querySelectorAll(".swiper-slide");

    slides.forEach((slide) => {
      const slideEl = slide as HTMLElement & { _dragCursorBound?: boolean };
      if (slideEl._dragCursorBound) return;
      slideEl._dragCursorBound = true;

      const onSlideEnter = () => show();
      const onSlideLeave = () => {
        isExternalLink = false;
        animateToDrag();
        hide();
      };

      slideEl.addEventListener("mouseenter", onSlideEnter);
      slideEl.addEventListener("mouseleave", onSlideLeave);
      cleanups.push(() => {
        slideEl.removeEventListener("mouseenter", onSlideEnter);
      });
      cleanups.push(() => {
        slideEl.removeEventListener("mouseleave", onSlideLeave);
      });

      slideEl.querySelectorAll("a[href]").forEach((node) => {
        const a = node as HTMLAnchorElement;
        const le = () => handleLinkEnter(a);
        const ll = () => handleLinkLeave();
        a.addEventListener("mouseenter", le);
        a.addEventListener("mouseleave", ll);
        cleanups.push(() => a.removeEventListener("mouseenter", le));
        cleanups.push(() => a.removeEventListener("mouseleave", ll));
      });

      slideEl.querySelectorAll("button").forEach((node) => {
        const btn = node as HTMLButtonElement;
        const be = () => hide();
        const bl = () => show();
        btn.addEventListener("mouseenter", be);
        btn.addEventListener("mouseleave", bl);
        cleanups.push(() => btn.removeEventListener("mouseenter", be));
        cleanups.push(() => btn.removeEventListener("mouseleave", bl));
      });
    });

    document.addEventListener("mousemove", onMove);
    document.addEventListener("touchmove", onMove, { passive: true });

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("touchmove", onMove);
      cleanups.forEach((c) => c());
      slides.forEach((slide) => {
        const s = slide as HTMLElement & { _dragCursorBound?: boolean };
        s._dragCursorBound = false;
      });
      swiper.classList.remove("research-swiper--drag-cursor");
      gsap.killTweensOf(el);
    };
  }, [active, enabled, mounted]);

  if (!enabled || !active || !mounted) return null;

  return createPortal(
    <div
      ref={elRef}
      className="p2-mono pointer-events-none fixed top-0 left-0 z-[1000] flex h-8 items-center justify-center overflow-hidden rounded-full bg-rich-carbon px-4 uppercase text-off-white opacity-0"
      aria-hidden
    >
      <div className="relative flex w-full flex-col overflow-hidden text-center">
        <span className="whitespace-nowrap">Drag</span>
        <span
          className="absolute top-full w-full whitespace-nowrap"
          aria-hidden
        >
          Go to website
        </span>
      </div>
    </div>,
    document.body,
  );
}
