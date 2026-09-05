"use client";

import { principles, stack } from "@/data/site";
import { RevealWords, Rise } from "../Reveal";
import { useExperience } from "../Experience";

function Marquee({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  const { still } = useExperience();
  // Six copies, translated by half the track: three copies are always wider
  // than any viewport, so the loop point never becomes visible.
  const track = Array.from({ length: 6 }, () => items).flat();

  return (
    <div
      className="relative overflow-hidden py-2"
      style={{
        maskImage:
          "linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)",
      }}
    >
      <div
        className="flex w-max gap-3"
        style={
          still
            ? undefined
            : {
                animation: `${reverse ? "marquee-reverse" : "marquee"} 46s linear infinite`,
              }
        }
      >
        {track.map((item, i) => (
          <span
            key={`${item}-${i}`}
            aria-hidden={i >= items.length}
            className="shrink-0 rounded-full border border-white/[0.07] bg-white/[0.02] px-5 py-2.5 font-mono text-[11px] tracking-[0.18em] uppercase text-dim"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Craft() {
  const half = Math.ceil(stack.length / 2);

  return (
    <section id="craft" className="relative">
      <div className="mx-auto max-w-[1400px] px-6 py-[12vh] sm:px-10">
        <header className="mb-14 sm:mb-20">
          <p className="mono-label mb-6">How it gets made</p>
          <RevealWords
            as="h2"
            text="Three rules, held without exception."
            className="block max-w-3xl font-display text-[clamp(2.2rem,6vw,4.6rem)] leading-[0.98] tracking-[-0.025em]"
          />
        </header>

        <div className="grid gap-4 md:grid-cols-3 md:gap-5">
          {principles.map((p, i) => (
            <Rise key={p.n} delay={i * 0.1} y={32}>
              <article className="glass glass-lit group relative h-full overflow-hidden rounded-2xl p-7 transition-colors duration-500 hover:bg-white/[0.05] sm:p-9">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100"
                  style={{
                    background:
                      "conic-gradient(from 140deg, #2fd4dd, #6c5cff, #f3c179, #2fd4dd)",
                  }}
                />
                <span className="font-display text-[13px] italic tracking-[0.2em] text-muted">
                  {p.n}
                </span>
                <h3 className="mt-6 font-display text-2xl leading-tight tracking-[-0.01em] sm:text-[1.7rem]">
                  {p.title}
                </h3>
                <p className="mt-4 text-[14.5px] leading-relaxed text-dim/85">
                  {p.body}
                </p>
              </article>
            </Rise>
          ))}
        </div>

        <Rise delay={0.15} className="mt-16 sm:mt-24">
          <p className="mono-label mb-6">Instruments</p>
          <div className="flex flex-col gap-3">
            <Marquee items={stack.slice(0, half)} />
            <Marquee items={stack.slice(half)} reverse />
          </div>
        </Rise>
      </div>
    </section>
  );
}
