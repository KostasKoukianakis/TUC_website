import { Hero } from "@/components/Hero";

export default function HomePage() {
  return (
    <div className="space-y-12 md:space-y-16">
      <Hero />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-slate-50 md:text-xl">
          Active Research
        </h2>
        <p className="text-sm text-slate-400">
          A snapshot of ongoing projects across imaging, vision, and signal
          processing.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-slate-50 md:text-xl">
          Lab Highlights
        </h2>
        <p className="text-sm text-slate-400">
          Selected news, recognitions, and recent publications from the lab.
        </p>
      </section>
    </div>
  );
}
