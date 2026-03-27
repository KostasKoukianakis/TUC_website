"use client";

import Link from "next/link";

type Props = {
  href: string;
  /** Default: Learn more — στο ethos section του reference: Join Us */
  label?: string;
  /** default = σκούρο hero · onLight = για bg-neural-fog (κείμενο rich-carbon) */
  variant?: "default" | "onLight";
  /** Εξωτερικό URL (π.χ. display.tuc.gr) */
  external?: boolean;
};

/** Στυλ κουμπιού «Contact Us» από WQF: dot + slide label + corner accents */
export function HeroContactButton({
  href,
  label = "Learn more",
  variant = "default",
  external = false,
}: Props) {
  const isLight = variant === "onLight";
  const text = isLight ? "text-rich-carbon" : "text-off-white";
  const dot = isLight ? "bg-rich-carbon" : "bg-off-white";

  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="group/button relative isolate inline-flex min-h-[40px] min-w-[120px] items-center justify-center motion-reduce:hover:animate-none"
    >
      <div className="flex h-10 items-center justify-center px-5 md:h-[40px] md:px-5">
        <div
          className={`size-2.5 -translate-x-6 rounded-sm opacity-0 blur-xl transition-all duration-400 ease-out group-hover/button:-translate-x-1.5 group-hover/button:opacity-100 group-hover/button:blur-none motion-reduce:hidden motion-reduce:opacity-0 ${dot}`}
          aria-hidden
        />
        <div className="relative isolate flex -translate-x-1 overflow-hidden transition-transform duration-400 ease-out group-hover/button:translate-x-1">
          <span
            className={`${text} font-mono text-[0.688rem] uppercase leading-[0.938rem] transition-transform duration-400 ease-out group-hover/button:-translate-y-full md:text-[0.75rem]`}
          >
            {label}
          </span>
          <span
            className={`absolute inset-0 translate-y-full font-mono text-[0.688rem] uppercase leading-[0.938rem] transition-transform duration-400 ease-out group-hover/button:translate-y-0 md:text-[0.75rem] ${text}`}
            aria-hidden
          >
            {label}
          </span>
        </div>
      </div>
      <CornerAccents className={isLight ? "text-rich-carbon" : "text-off-white"} />
    </Link>
  );
}

function CornerAccents({ className }: { className?: string }) {
  const path =
    "M0.499951 0.199996L0.499952 9.2M0.199951 0.499995L9.19995 0.499995";
  return (
    <>
      <svg
        className={`pointer-events-none absolute left-0 top-0 size-[9px] ${className ?? ""}`}
        viewBox="0 0 10 10"
        fill="none"
        aria-hidden
      >
        <path d={path} stroke="currentColor" />
      </svg>
      <svg
        className={`pointer-events-none absolute right-0 top-0 size-[9px] ${className ?? ""}`}
        viewBox="0 0 10 10"
        fill="none"
        aria-hidden
      >
        <path d={path} stroke="currentColor" />
      </svg>
      <svg
        className={`pointer-events-none absolute bottom-0 left-0 size-[9px] ${className ?? ""}`}
        viewBox="0 0 10 10"
        fill="none"
        aria-hidden
      >
        <path d={path} stroke="currentColor" />
      </svg>
      <svg
        className={`pointer-events-none absolute bottom-0 right-0 size-[9px] ${className ?? ""}`}
        viewBox="0 0 10 10"
        fill="none"
        aria-hidden
      >
        <path d={path} stroke="currentColor" />
      </svg>
    </>
  );
}
