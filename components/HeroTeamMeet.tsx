"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useId, useState } from "react";
import {
  DISPLAY_LAB_MEMBERS_PAGE,
  LAB_TEAM_MEMBERS,
  labMemberCvHref,
  telHref,
  type LabTeamMember,
} from "@/lib/displayLabMembers";

type Props = {
  /** 0…1 scroll-driven visibility (hero timeline). */
  reveal: number;
};

function EyeStripPlaceholder({ index }: { index: number }) {
  const phase = index * 0.17;
  return (
    <div
      className="relative h-full min-h-[4.5rem] w-full overflow-hidden md:min-h-[6rem]"
      style={{
        background: `
          radial-gradient(ellipse 90% 42% at ${48 + phase * 3}% ${42 + phase * 2}%, rgba(235,235,235,0.92) 0%, rgba(235,235,235,0) 58%),
          radial-gradient(ellipse 70% 36% at ${52 - phase * 2}% ${48 + phase}% , rgba(210,210,210,0.55) 0%, transparent 50%),
          linear-gradient(180deg, #0c0c0c 0%, #1f1f1f 38%, #2a2a2a 50%, #151515 62%, #080808 100%)
        `,
      }}
      aria-hidden
    >
      <div className="absolute inset-x-[18%] top-[38%] h-[10%] rounded-full bg-black/55 blur-[1px]" />
      <div className="absolute inset-x-[18%] top-[52%] h-[10%] rounded-full bg-black/55 blur-[1px]" />
    </div>
  );
}

function TeamMemberModal({
  member,
  index,
  total,
  onClose,
  onPrev,
  onNext,
  titleId,
}: {
  member: LabTeamMember;
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  titleId: string;
}) {
  const [entered, setEntered] = useState(false);
  const [exit, setExit] = useState(false);

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
        <button
          type="button"
          onClick={requestClose}
          className="absolute right-5 top-5 z-10 rounded-md p-2 text-[#222] transition hover:bg-black/[0.06] md:right-8 md:top-8"
          aria-label="Close"
        >
          <X className="h-5 w-5" strokeWidth={1.35} />
        </button>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-8 pt-10 md:px-10 md:pb-10 md:pt-12">
          <header className="shrink-0 pr-12">
            <h2
              id={titleId}
              className="font-sans text-[clamp(1.25rem,3.2vw,2rem)] font-bold uppercase leading-[1.15] tracking-[0.06em] text-black"
            >
              {member.name}
            </h2>
            <div className="mt-3 flex items-start gap-2.5">
              <span
                className="mt-0.5 block h-3.5 w-3.5 shrink-0 border-l-[2px] border-t-[2px] border-[#888888]"
                aria-hidden
              />
              <p className="font-sans text-[0.7rem] font-medium uppercase leading-snug tracking-[0.16em] text-[#6b6b6b] md:text-[0.75rem]">
                {member.category}
              </p>
            </div>
          </header>

          <div className="mt-8 grid min-h-0 flex-1 grid-cols-1 gap-8 md:grid-cols-2 md:gap-x-12 md:gap-y-8">
            <div className="mx-auto w-full max-w-[16rem] shrink-0 md:mx-0 md:max-w-none">
              <div className="aspect-square w-full overflow-hidden rounded-2xl bg-[#1a1a1a] md:rounded-[1.25rem]">
                <div className="flex h-full w-full items-center justify-center font-sans text-[clamp(2rem,6vw,5rem)] font-semibold uppercase tracking-[0.08em] text-white/88">
                  {member.initials}
                </div>
              </div>
            </div>
            <div className="flex min-h-0 flex-col gap-4 text-left">
              <p className="font-sans text-[0.95rem] leading-[1.65] text-[#1a1a1a] md:text-[1.02rem] md:leading-[1.7]">
                {member.position}
              </p>
              <div className="space-y-2.5 border-t border-black/10 pt-4 font-sans text-[0.88rem] leading-relaxed text-[#2a2a2a] md:text-[0.92rem]">
                <p>{member.office}</p>
                <p>
                  <span className="text-[#666]">Tel:</span>{" "}
                  <a
                    href={telHref(member.tel)}
                    className="text-[#1a1a1a] underline-offset-2 underline decoration-black/25 transition hover:decoration-black/60"
                  >
                    {member.tel}
                  </a>
                </p>
                <p>
                  <span className="text-[#666]">E-mail:</span>{" "}
                  <a
                    href={`mailto:${member.email}`}
                    className="text-[#1a1a1a] underline-offset-2 underline decoration-black/25 transition hover:decoration-black/60"
                  >
                    {member.email}
                  </a>
                </p>
                <p>
                  <Link
                    href={labMemberCvHref(member)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-hero-mono mt-1 inline-block text-[0.62rem] uppercase tracking-[0.14em] text-[#333] underline-offset-2 underline decoration-black/25 transition hover:decoration-black/60"
                  >
                    {member.cvLabel}
                  </Link>
                </p>
              </div>
            </div>
          </div>

          <footer className="mt-10 flex shrink-0 items-center justify-between border-t border-black/10 pt-6 md:mt-12 md:pt-8">
            <button
              type="button"
              onClick={onPrev}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-black/12 bg-[#e4e4e4] text-[#222] transition hover:bg-[#dcdcdc] md:h-11 md:w-11"
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <span className="font-hero-mono text-[0.65rem] uppercase tracking-[0.22em] text-[#666]">
              {String(index + 1).padStart(2, "0")} / {total}
            </span>
            <button
              type="button"
              onClick={onNext}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-black/12 bg-[#e4e4e4] text-[#222] transition hover:bg-[#dcdcdc] md:h-11 md:w-11"
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
  const [openIndex, setOpenIndex] = useState<number | null>(null);
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
    setOpenIndex((i) => {
      if (i === null) return i;
      const n = LAB_TEAM_MEMBERS.length;
      return (i - 1 + n) % n;
    });
  }, []);
  const goNext = useCallback(() => {
    setOpenIndex((i) => {
      if (i === null) return i;
      const n = LAB_TEAM_MEMBERS.length;
      return (i + 1) % n;
    });
  }, []);

  const interactive = reveal > 0.06;
  const openMember =
    openIndex !== null ? LAB_TEAM_MEMBERS[openIndex] : null;

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
          className={`flex w-full max-w-[min(52rem,94vw)] flex-col items-center text-center ${interactive ? "pointer-events-auto" : ""}`}
        >
          <p className="font-hero-mono max-w-[36rem] text-[0.52rem] uppercase leading-relaxed tracking-[0.22em] text-[rgba(220,220,220,0.72)] sm:text-[0.56rem] sm:tracking-[0.24em]">
            Digital image &amp; signal processing at TUC. Research, teaching,
            and partners who turn measurement into models—and models into
            insight.
          </p>

          <div className="relative my-10 sm:my-12">
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
            <span className="font-hero-mono px-10 py-2.5 text-[0.58rem] uppercase tracking-[0.28em] text-white/95 sm:text-[0.62rem]">
              Meet the team
            </span>
          </div>

          <div className="w-full max-w-[min(56rem,96vw)]">
            <div className="grid w-full grid-cols-5 gap-0 overflow-hidden rounded-sm border border-white/10">
              {LAB_TEAM_MEMBERS.map((m, i) => (
                <button
                  key={m.id}
                  type="button"
                  disabled={!interactive}
                  onClick={() => setOpenIndex(i)}
                  className="group relative min-w-0 border-l border-white/10 first:border-l-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(200,220,255,0.5)] disabled:pointer-events-none disabled:cursor-default"
                  aria-label={`Open profile: ${m.name}`}
                >
                  <EyeStripPlaceholder index={i} />
                  <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/15 group-hover:brightness-110" />
                </button>
              ))}
            </div>
          </div>

          <p className="font-sans mt-10 max-w-[min(44rem,92vw)] text-[clamp(1.15rem,2.8vw,1.85rem)] font-semibold uppercase leading-[1.25] tracking-[0.04em] text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.85)] sm:mt-12 sm:tracking-[0.05em]">
            We build signal into meaning—
            <br className="sm:hidden" />
            <span className="sm:ml-1">and meaning into research that lasts.</span>
          </p>

          <Link
            href={DISPLAY_LAB_MEMBERS_PAGE}
            target="_blank"
            rel="noopener noreferrer"
            className="font-hero-mono mt-6 text-[0.5rem] uppercase tracking-[0.2em] text-white/35 underline-offset-4 transition hover:text-white/55 hover:underline"
          >
            display.tuc.gr · lab members
          </Link>
        </div>
      </div>

      {openMember !== null && openIndex !== null ? (
        <TeamMemberModal
          member={openMember}
          index={openIndex}
          total={LAB_TEAM_MEMBERS.length}
          onClose={close}
          onPrev={goPrev}
          onNext={goNext}
          titleId={modalTitleId}
        />
      ) : null}
    </>
  );
}
