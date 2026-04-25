"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  LAB_TEAM_MEMBERS,
  labMemberCvHref,
  telHref,
  type LabTeamMember,
} from "@/lib/displayLabMembers";

type Props = {
  /** 0…1 scroll-driven visibility (hero timeline). */
  reveal: number;
};

function EyeStripPlaceholder({
  member,
  index,
  expanded,
}: {
  member: LabTeamMember;
  index: number;
  expanded: boolean;
}) {
  const edgeBoost = index === 0 || index === LAB_TEAM_MEMBERS.length - 1;
  return (
    <div
      className="relative h-full min-h-[5.5rem] w-full overflow-hidden md:min-h-[7rem]"
      aria-hidden
    >
      <Image
        src={member.photoUrl}
        alt={member.name}
        fill
        sizes={expanded ? "(max-width: 768px) 80vw, 40vw" : "(max-width: 768px) 40vw, 24vw"}
        quality={95}
        className={`${edgeBoost ? "scale-[1.99] object-[50%_24%]" : "scale-[1.7] object-[50%_30%]"} object-cover grayscale contrast-125 brightness-95`}
      />
    </div>
  );
}

function TeamMemberModal({
  member,
  index,
  total,
  slideDirection,
  onClose,
  onPrev,
  onNext,
  titleId,
}: {
  member: LabTeamMember;
  index: number;
  total: number;
  slideDirection: "prev" | "next";
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  titleId: string;
}) {
  const [entered, setEntered] = useState(false);
  const [exit, setExit] = useState(false);
  const [displayedMember, setDisplayedMember] = useState({ member, index });
  const [contentPhase, setContentPhase] = useState<"idle" | "exit" | "enter">("idle");

  const requestClose = useCallback(() => {
    setExit(true);
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setEntered(true));
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    if (index === displayedMember.index) return;

    setContentPhase("exit");
    let settle = 0;
    const swap = window.setTimeout(() => {
      setDisplayedMember({ member, index });
      setContentPhase("enter");
      settle = window.setTimeout(() => setContentPhase("idle"), 520);
    }, 230);

    return () => {
      window.clearTimeout(swap);
      window.clearTimeout(settle);
    };
  }, [displayedMember.index, index, member]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [requestClose, onPrev, onNext]);

  const onPanelTransitionEnd = useCallback(
    (e: React.TransitionEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget) return;
      if (e.propertyName !== "transform") return;
      if (exit) onClose();
    },
    [exit, onClose],
  );

  const panelTransform =
    exit ? "translateX(100%)" : entered ? "translateX(0)" : "translateX(100%)";
  const shownMember = displayedMember.member;
  const shownIndex = displayedMember.index;
  const contentAnimation =
    contentPhase === "idle"
      ? undefined
      : `teamMember${contentPhase === "exit" ? "Exit" : "Enter"}${
          slideDirection === "next" ? "Next" : "Prev"
        } ${contentPhase === "exit" ? 230 : 520}ms cubic-bezier(0.22, 1, 0.36, 1) both`;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-stretch justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className={`team-modal-backdrop absolute inset-0 border-0 bg-black/28 backdrop-blur-[56px] backdrop-saturate-[1.12] transition-opacity duration-300 ease-out [box-shadow:inset_0_0_80px_rgba(0,0,0,0.15)] ${
          entered && !exit ? "opacity-100" : "opacity-0"
        }`}
        aria-label="Close"
        onClick={requestClose}
      />
      <div
        className="relative z-[1] flex h-full min-h-0 w-full max-w-full flex-col bg-[#f0f0f0] text-[#111] shadow-[-20px_0_80px_rgba(0,0,0,0.42)] will-change-transform md:max-w-[min(66vw,56rem)] md:rounded-l-[2rem]"
        style={{
          transform: panelTransform,
          transition:
            "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
        onTransitionEnd={onPanelTransitionEnd}
      >
        <style>{`
          @keyframes teamMemberExitNext {
            from { opacity: 1; transform: translate3d(0, 0, 0); }
            to { opacity: 0; transform: translate3d(-22px, 2px, 0); }
          }
          @keyframes teamMemberExitPrev {
            from { opacity: 1; transform: translate3d(0, 0, 0); }
            to { opacity: 0; transform: translate3d(22px, 2px, 0); }
          }
          @keyframes teamMemberEnterNext {
            0% { opacity: 0; transform: translate3d(34px, 8px, 0); }
            55% { opacity: 1; }
            100% { opacity: 1; transform: translate3d(0, 0, 0); }
          }
          @keyframes teamMemberEnterPrev {
            0% { opacity: 0; transform: translate3d(-34px, 8px, 0); }
            55% { opacity: 1; }
            100% { opacity: 1; transform: translate3d(0, 0, 0); }
          }
        `}</style>
        <button
          type="button"
          onClick={requestClose}
          className="absolute right-5 top-5 z-10 rounded-md p-2 text-[#222] transition hover:bg-black/[0.06] md:right-8 md:top-8"
          aria-label="Close"
        >
          <X className="h-5 w-5" strokeWidth={1.35} />
        </button>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-8 pt-10 md:px-10 md:pb-10 md:pt-12">
          <div
            className="min-h-0 flex-1 will-change-transform"
            style={{ animation: contentAnimation }}
          >
            <div className="relative z-20 mb-8 pr-12">
              <h2
                id={titleId}
                className="font-sans text-[clamp(1.45rem,3.2vw,2.15rem)] font-black uppercase leading-none tracking-[0.035em] text-[#0b0b0b]"
              >
                {shownMember.name}
              </h2>
              <div className="mt-3 flex items-center gap-3">
                <span
                  className="block h-3.5 w-3.5 shrink-0 border-l-[2px] border-t-[2px] border-[#888888]"
                  aria-hidden
                />
                <p className="font-hero-mono text-[0.72rem] uppercase tracking-[0.2em] text-[#666]">
                  {shownMember.category}
                </p>
              </div>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-1 gap-8 md:grid-cols-[minmax(13rem,16rem)_1fr] md:gap-x-10 md:gap-y-8">
              <div className="mx-auto w-full max-w-[16rem] shrink-0 text-left md:mx-0 md:max-w-none">
                <div className="aspect-square w-full overflow-hidden rounded-2xl bg-[#1a1a1a] md:rounded-[1.25rem]">
                  <Image
                    src={shownMember.photoUrl}
                    alt={shownMember.name}
                    width={900}
                    height={900}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <div className="flex min-h-0 flex-col gap-5 text-left">
                <p className="font-sans max-w-[34rem] text-[1.08rem] font-semibold leading-snug tracking-[0.01em] text-[#171717] md:text-[1.18rem]">
                  {shownMember.position}
                </p>
                <div className="space-y-2.5 border-t border-black/10 pt-5 font-sans text-[0.88rem] leading-relaxed text-[#2a2a2a] md:text-[0.92rem]">
                  <p>{shownMember.office}</p>
                  <p>
                    <span className="text-[#666]">Tel:</span>{" "}
                    <a
                      href={telHref(shownMember.tel)}
                      className="text-[#1a1a1a] underline-offset-2 underline decoration-black/25 transition hover:decoration-black/60"
                    >
                      {shownMember.tel}
                    </a>
                  </p>
                  <p>
                    <span className="text-[#666]">E-mail:</span>{" "}
                    <a
                      href={`mailto:${shownMember.email}`}
                      className="text-[#1a1a1a] underline-offset-2 underline decoration-black/25 transition hover:decoration-black/60"
                    >
                      {shownMember.email}
                    </a>
                  </p>
                  <p>
                    <Link
                      href={labMemberCvHref(shownMember)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-hero-mono mt-2 inline-flex items-center rounded-md border border-black/15 bg-[#e7e7e7] px-4 py-2 text-[0.72rem] uppercase tracking-[0.14em] text-[#222] transition hover:bg-[#dfdfdf]"
                    >
                      Open {shownMember.cvLabel}
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <footer className="mt-10 flex shrink-0 items-center justify-between border-t border-black/10 pt-6 md:mt-12 md:pt-8">
            <button
              type="button"
              onClick={onPrev}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-black/12 bg-[#e4e4e4] text-[#222] transition hover:bg-[#dcdcdc] md:h-11 md:w-11"
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <span className="font-hero-mono text-[0.82rem] uppercase tracking-[0.22em] text-[#666]">
              {String(shownIndex + 1).padStart(2, "0")} / {total}
            </span>
            <button
              type="button"
              onClick={onNext}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-black/12 bg-[#e4e4e4] text-[#222] transition hover:bg-[#dcdcdc] md:h-11 md:w-11"
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}

export function HeroTeamMeet({ reveal }: Props) {
  const stripRef = useRef<HTMLDivElement>(null);
  const infoBarRef = useRef<HTMLDivElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [cursorVisible, setCursorVisible] = useState(false);
  const [cursorX, setCursorX] = useState(0);
  const [cursorY, setCursorY] = useState(0);
  const [slideDirection, setSlideDirection] = useState<"prev" | "next">("next");
  const modalTitleId = useId();

  useEffect(() => {
    const open = openIndex !== null;
    if (open) {
      document.documentElement.setAttribute("data-team-modal-open", "true");
    } else {
      document.documentElement.removeAttribute("data-team-modal-open");
    }
    return () => document.documentElement.removeAttribute("data-team-modal-open");
  }, [openIndex]);

  const close = useCallback(() => setOpenIndex(null), []);
  const goPrev = useCallback(() => {
    setSlideDirection("prev");
    setOpenIndex((i) => {
      if (i === null) return i;
      const n = LAB_TEAM_MEMBERS.length;
      return (i - 1 + n) % n;
    });
  }, []);
  const goNext = useCallback(() => {
    setSlideDirection("next");
    setOpenIndex((i) => {
      if (i === null) return i;
      const n = LAB_TEAM_MEMBERS.length;
      return (i + 1) % n;
    });
  }, []);

  const interactive = reveal > 0.06;
  const openMember =
    openIndex !== null ? LAB_TEAM_MEMBERS[openIndex] : null;
  const expandedMember =
    expandedIndex !== null ? LAB_TEAM_MEMBERS[expandedIndex] : null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpandedIndex(null);
    };
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (
        !target ||
        stripRef.current?.contains(target) ||
        infoBarRef.current?.contains(target)
      ) return;
      setExpandedIndex(null);
    };
    if (expandedIndex === null) return;
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [expandedIndex]);

  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 z-[17] flex flex-col items-center justify-center px-[clamp(1rem,4vw,2rem)] pt-[calc(var(--header-height)+0.5rem)]"
        style={{
          opacity: reveal,
          transform: `translate3d(0, ${(1 - reveal) * 18}px, 0)`,
        }}
        aria-hidden={reveal < 0.04}
      >
        <div
          className={`flex w-full max-w-[95vw] flex-col items-center text-center ${interactive ? "pointer-events-auto" : ""}`}
        >
          <div className="absolute top-[calc(var(--header-height)+0.85rem)] left-1/2 flex w-full max-w-[52rem] -translate-x-1/2 flex-col items-center px-4">
            <p className="font-hero-mono max-w-[46rem] text-[0.72rem] uppercase leading-relaxed tracking-[0.2em] text-[rgba(220,220,220,0.78)] sm:text-[0.82rem] sm:tracking-[0.22em]">
              Digital image &amp; signal processing at TUC. Research, teaching,
              and partners who turn measurement into models—and models into
              insight.
            </p>

            <div className="relative mt-6">
              <span
                className="pointer-events-none absolute -left-1 -top-1 h-3 w-3 border-l border-t border-white/75"
                aria-hidden
              />
              <span
                className="pointer-events-none absolute -right-1 -top-1 h-3 w-3 border-r border-t border-white/75"
                aria-hidden
              />
              <span
                className="pointer-events-none absolute -bottom-1 -left-1 h-3 w-3 border-b border-l border-white/75"
                aria-hidden
              />
              <span
                className="pointer-events-none absolute -bottom-1 -right-1 h-3 w-3 border-b border-r border-white/75"
                aria-hidden
              />
              <span className="font-hero-mono px-10 py-2.5 text-[0.82rem] uppercase tracking-[0.26em] text-white/95 sm:text-[0.96rem]">
                Meet the team
              </span>
            </div>
          </div>

          <div className="relative w-full max-w-[95vw]">
            <div
              ref={stripRef}
              className={`relative grid w-full grid-cols-5 items-center gap-0 overflow-visible rounded-sm border border-white/10 ${
                interactive ? "cursor-none [&_*]:cursor-none" : ""
              }`}
              onMouseMove={(e) => {
                const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                setCursorX(e.clientX - rect.left);
                setCursorY(e.clientY - rect.top);
              }}
            >
              {LAB_TEAM_MEMBERS.map((m, i) => (
                <button
                  key={m.id}
                  type="button"
                  disabled={!interactive}
                  onClick={() => {
                    setExpandedIndex((cur) => (cur === i ? null : i));
                  }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex((cur) => (cur === i ? null : cur))}
                  className={`group relative h-[5.5rem] min-w-0 self-center overflow-visible border-l border-white/10 first:border-l-0 transition-[opacity,filter,transform] duration-500 ease-wqf focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(200,220,255,0.5)] disabled:pointer-events-none disabled:cursor-default md:h-[7rem] ${
                    hoveredIndex === null && expandedIndex === null
                      ? "opacity-100"
                      : hoveredIndex === i || expandedIndex === i
                        ? "z-[2] opacity-100 brightness-110"
                        : "opacity-45 saturate-50"
                  } ${
                    expandedIndex === i
                      ? "z-[25] shadow-[0_24px_80px_rgba(0,0,0,0.86)]"
                      : ""
                  } ${interactive ? "cursor-none" : ""}`}
                  aria-label={`Open profile: ${m.name}`}
                  onPointerEnter={() => setCursorVisible(true)}
                  onPointerLeave={() => setCursorVisible(false)}
                >
                  <div
                    className={`absolute left-0 top-1/2 w-full origin-center -translate-y-1/2 overflow-hidden transition-[height,clip-path] duration-500 ease-wqf [backface-visibility:hidden] ${
                      expandedIndex === i
                        ? "h-[min(54vh,34rem)] [clip-path:inset(0_0_0_0)]"
                        : "h-[5.5rem] [clip-path:inset(0_0_0_0)] md:h-[7rem]"
                    }`}
                  >
                    <EyeStripPlaceholder member={m} index={i} expanded={expandedIndex === i} />
                  </div>
                </button>
              ))}
              <div
                className={`p2-mono pointer-events-none absolute left-0 top-0 z-[60] flex h-8 items-center justify-center overflow-hidden rounded-full bg-rich-carbon px-4 uppercase text-off-white transition-opacity duration-200 ${
                  cursorVisible && hoveredIndex !== null ? "opacity-100" : "opacity-0"
                }`}
                style={{ transform: `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)` }}
                aria-hidden
              >
                {expandedIndex !== null && hoveredIndex === expandedIndex
                  ? "Hide"
                  : "View"}
              </div>
            </div>

            {expandedMember !== null && expandedIndex !== null ? (
              <div
                ref={infoBarRef}
                className="pointer-events-auto absolute left-0 top-1/2 z-[30] w-full translate-y-[calc(min(27vh,17rem)+1.25rem)] text-white"
              >
                <div className="relative pb-3">
                  <p className="font-hero-mono absolute left-0 top-0 text-[0.74rem] uppercase tracking-[0.18em] text-white/66">
                    {expandedIndex + 1} / {LAB_TEAM_MEMBERS.length}
                  </p>
                  <p className="font-hero-mono text-center text-[0.78rem] uppercase tracking-[0.18em] text-white/84">
                    {expandedMember.name} · {expandedMember.category}
                  </p>
                </div>
                <div className="h-px w-full bg-white/70" aria-hidden />
                <div className="mt-3 flex items-start justify-between gap-6">
                  <p className="font-sans max-w-[38rem] text-left text-[0.96rem] font-medium leading-snug tracking-[0.03em] text-white/66">
                    {expandedMember.position}
                  </p>
                  <div className="flex shrink-0 justify-end gap-3">
                  <a
                    href={expandedMember.linkedinUrl ?? `mailto:${expandedMember.email}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-hero-mono inline-flex items-center rounded-md border border-white/25 px-4 py-2 text-[0.72rem] uppercase tracking-[0.14em] text-white transition hover:bg-white/8"
                  >
                    Connect with {expandedMember.name.split(" ")[0]}
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenIndex(expandedIndex);
                      setExpandedIndex(null);
                      setHoveredIndex(null);
                      setCursorVisible(false);
                    }}
                    className="font-hero-mono inline-flex cursor-pointer items-center rounded-md border border-white/55 bg-white px-4 py-2 text-[0.72rem] uppercase tracking-[0.14em] text-black transition hover:bg-white/90"
                  >
                    Full Bio
                  </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <p className="font-sans mt-10 max-w-[min(44rem,92vw)] text-[clamp(1.15rem,2.8vw,1.85rem)] font-semibold uppercase leading-[1.25] tracking-[0.04em] text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.85)] sm:mt-12 sm:tracking-[0.05em]">
            We build signal into meaning—
            <br className="sm:hidden" />
            <span className="sm:ml-1">and meaning into research that lasts.</span>
          </p>

        </div>
      </div>

      {openMember !== null && openIndex !== null ? (
        <TeamMemberModal
          member={openMember}
          index={openIndex}
          total={LAB_TEAM_MEMBERS.length}
          slideDirection={slideDirection}
          onClose={close}
          onPrev={goPrev}
          onNext={goNext}
          titleId={modalTitleId}
        />
      ) : null}
    </>
  );
}
