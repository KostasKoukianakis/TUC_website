"use client";

/**
 * CTA όπως reference #portfolio (page-source): group/button + dot + p2-mono slide + corner-accent SVGs.
 * `theme="light"` → κείμενο neural-fog (σκούρο section / body WQF). `dark` → rich-carbon (ανοιχτό φόντο).
 */
export function PortfolioGlitchLink({
  href,
  label,
  external,
  ariaLabel,
  theme = "light",
}: {
  href: string;
  label: string;
  external?: boolean;
  ariaLabel?: string;
  theme?: "light" | "dark";
}) {
  return (
    <a
      href={href}
      className="group/button hover:animate-glitch-hover relative isolate block motion-reduce:hover:animate-none"
      data-theme={theme}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      aria-label={ariaLabel ?? label}
    >
      <div className="flex h-[40px] items-center justify-center px-[20px]">
        <div
          className="button--dot size-[10px] -translate-x-[24px] rounded-[3px] opacity-0 blur-[20px] transition-all duration-400 motion-reduce:blur-0 motion-reduce:opacity-0 group-data-[theme=dark]/button:bg-rich-carbon group-data-[theme=light]/button:bg-neural-fog ease-[var(--easing)] group-hover/button:-translate-x-[5px] group-hover/button:opacity-100 group-hover/button:blur-[0px] group-active/button:-translate-x-[5px] group-active/button:opacity-100 group-active/button:blur-[0px] motion-reduce:translate-x-0 motion-reduce:group-hover/button:translate-x-0"
          aria-hidden
        />
        <div className="p2-mono group-data-[theme=dark]/button:text-rich-carbon group-data-[theme=light]/button:text-neural-fog relative isolate flex -translate-x-[5px] overflow-hidden transition-transform duration-400 ease-[var(--easing)] group-hover/button:translate-x-[5px] group-active/button:translate-x-[5px] motion-reduce:translate-x-0 motion-reduce:group-hover/button:translate-x-0">
          <span className="transition-transform duration-400 ease-[var(--easing)] group-hover/button:-translate-y-full group-active/button:-translate-y-full motion-reduce:translate-y-0 motion-reduce:group-hover/button:translate-y-0">
            {label}
          </span>
          <span
            className="absolute inset-0 translate-y-full transition-transform duration-400 ease-[var(--easing)] group-hover/button:translate-y-0 group-active/button:translate-y-0 motion-reduce:hidden"
            aria-hidden
          >
            {label}
          </span>
        </div>
      </div>
      <GlitchCorners
        theme={theme}
      />
    </a>
  );
}

function GlitchCorners({ theme }: { theme: "light" | "dark" }) {
  const path =
    "M0.499951 0.199996L0.499952 9.2M0.199951 0.499995L9.19995 0.499995";
  const stroke =
    theme === "light"
      ? "text-neural-fog group-data-[theme=light]/button:text-neural-fog group-data-[theme=dark]/button:text-rich-carbon"
      : "text-rich-carbon group-data-[theme=light]/button:text-neural-fog group-data-[theme=dark]/button:text-rich-carbon";
  return (
    <>
      <svg
        className={`corner-accent size-[9px] transition-opacity duration-400 ease-[var(--easing)] group-active/button:opacity-100 motion-reduce:opacity-100 motion-reduce:transition-none ${stroke}`}
        width="10"
        height="10"
        viewBox="0 0 10 10"
        fill="none"
        aria-hidden
      >
        <path d={path} stroke="currentColor" />
      </svg>
      <svg
        className={`corner-accent size-[9px] transition-opacity duration-400 ease-[var(--easing)] group-active/button:opacity-100 motion-reduce:opacity-100 motion-reduce:transition-none ${stroke}`}
        width="10"
        height="10"
        viewBox="0 0 10 10"
        fill="none"
        aria-hidden
      >
        <path d={path} stroke="currentColor" />
      </svg>
      <svg
        className={`corner-accent size-[9px] transition-opacity duration-400 ease-[var(--easing)] group-active/button:opacity-100 motion-reduce:opacity-100 motion-reduce:transition-none ${stroke}`}
        width="10"
        height="10"
        viewBox="0 0 10 10"
        fill="none"
        aria-hidden
      >
        <path d={path} stroke="currentColor" />
      </svg>
      <svg
        className={`corner-accent size-[9px] transition-opacity duration-400 ease-[var(--easing)] group-active/button:opacity-100 motion-reduce:opacity-100 motion-reduce:transition-none ${stroke}`}
        width="10"
        height="10"
        viewBox="0 0 10 10"
        fill="none"
        aria-hidden
      >
        <path d={path} stroke="currentColor" />
      </svg>
    </>
  );
}
