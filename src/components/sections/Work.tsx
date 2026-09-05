"use client";

import { motion } from "motion/react";
import { useRef, useState } from "react";
import { projects, type Project } from "@/data/site";
import { RevealWords, Rise } from "../Reveal";
import { useExperience } from "../Experience";
import { cn } from "@/lib/utils";

const ACCENT: Record<Project["accent"], string> = {
  violet: "#6c5cff",
  cyan: "#2fd4dd",
  gold: "#f3c179",
  rose: "#ff7a9c",
};

function ProjectRow({ project, index }: { project: Project; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const { still: reduced } = useExperience();
  const accent = ACCENT[project.accent];

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || reduced) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  const Wrapper = project.href ? "a" : "div";

  return (
    <Rise delay={index * 0.06} y={36}>
      <Wrapper
        {...(project.href
          ? { href: project.href, target: "_blank", rel: "noopener noreferrer" }
          : {})}
        className="block focus-visible:outline-offset-8"
        aria-label={project.href ? `${project.title} — open project` : undefined}
      >
        <div
          ref={ref}
          onPointerMove={onMove}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          className="group relative isolate overflow-hidden rounded-2xl border-t border-white/[0.07] px-2 py-9 transition-[transform,background-color] duration-500 ease-out sm:px-6 sm:py-12 md:hover:-translate-y-0.5"
        >
          {/* Spotlight */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background: `radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), color-mix(in oklab, ${accent} 13%, transparent), transparent 68%)`,
            }}
          />
          {/* Surface */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-white/[0.02] opacity-0 backdrop-blur-sm transition-opacity duration-500 group-hover:opacity-100"
          />
          {/* Accent edge */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 -z-10 h-full w-px origin-top"
            style={{ background: accent }}
            animate={{ scaleY: hovered ? 1 : 0, opacity: hovered ? 0.85 : 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:items-baseline md:gap-8">
            <div className="md:col-span-1">
              <span
                className="font-mono text-[11px] tracking-[0.24em] transition-colors duration-500"
                style={{ color: hovered ? accent : undefined }}
              >
                {project.index}
              </span>
            </div>

            <div className="md:col-span-5">
              <h3 className="font-display text-[clamp(1.9rem,4.4vw,3.1rem)] leading-[1.02] tracking-[-0.02em]">
                <span className="relative inline-block">
                  {project.title}
                  <span
                    aria-hidden
                    className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
                    style={{ background: accent }}
                  />
                </span>
              </h3>
              <div className="mt-5 flex flex-wrap gap-2">
                {project.stack.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-white/[0.08] px-3 py-1 font-mono text-[10px] tracking-[0.14em] uppercase text-muted transition-colors duration-500 group-hover:border-white/[0.14] group-hover:text-dim"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="md:col-span-4">
              <p className="max-w-prose text-[15px] leading-relaxed text-dim/90">
                {project.summary}
              </p>
            </div>

            <div className="flex items-baseline justify-between gap-4 md:col-span-2 md:flex-col md:items-end md:gap-2 md:text-right">
              <span className="font-mono text-[11px] tracking-[0.2em] text-muted">
                {project.year}
              </span>
              <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-faint">
                {project.role}
              </span>
            </div>
          </div>
        </div>
      </Wrapper>
    </Rise>
  );
}

export default function Work() {
  return (
    <section id="work" className="relative">
      <div className="mx-auto max-w-[1400px] px-6 py-[12vh] sm:px-10">
        <header className="mb-14 flex flex-col gap-6 sm:mb-20 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mono-label mb-6">Selected work</p>
            <RevealWords
              as="h2"
              text="Things built with intent."
              className={cn(
                "block font-display text-[clamp(2.2rem,6vw,4.6rem)] leading-[0.98] tracking-[-0.025em]",
              )}
            />
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-muted">
            A small number of projects, carried further than they had to be.
          </p>
        </header>

        <div>
          {projects.map((p, i) => (
            <ProjectRow key={p.index} project={p} index={i} />
          ))}
          <div className="border-t border-white/[0.07]" />
        </div>
      </div>
    </section>
  );
}
