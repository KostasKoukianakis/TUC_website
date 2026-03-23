import Link from "next/link";
import { ArrowRight, Waves } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 px-6 py-10 shadow-xl shadow-slate-950/60 md:px-10 md:py-14">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-16 top-10 h-64 w-64 rounded-full bg-blue-600/25 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950/80 to-transparent" />
        <div className="absolute inset-0 opacity-20">
          <div className="h-full w-full bg-[radial-gradient(circle_at_top,_#22d3ee_0,_transparent_45%),repeating-linear-gradient(135deg,_rgba(148,163,184,0.35)_0,_rgba(148,163,184,0.35)_1px,_transparent_1px,_transparent_4px)]" />
        </div>
      </div>

      <div className="relative space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-blue-200">
          <Waves className="h-3 w-3" />
          Digital Image & Signal Processing
        </div>

        <div className="max-w-2xl space-y-4">
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-50 md:text-4xl lg:text-5xl">
            DISPLAY Lab at{" "}
            <span className="text-blue-400">Technical University of Crete</span>
          </h1>
          <p className="max-w-xl text-sm text-slate-300 md:text-base">
            Research in computer vision, imaging, and signal processing—building
            principled methods that translate data into insight.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/people"
            className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/40 transition hover:bg-blue-400"
          >
            Join the Lab
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/research"
            className="text-sm font-medium text-slate-200 hover:text-blue-300"
          >
            Explore research
          </Link>
        </div>
      </div>
    </section>
  );
}

