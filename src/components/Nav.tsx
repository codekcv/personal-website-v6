"use client";

import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import { nav, site } from "@/data/site";
import { useSectionNav } from "./SmoothScroll";
import { useExperience } from "./Experience";
import { cn } from "@/lib/utils";

export default function Nav() {
  const { openPalette, entered } = useExperience();
  const goTo = useSectionNav();
  const [active, setActive] = useState<string>("hero");
  const [condensed, setCondensed] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => setCondensed(y > 80));

  // Which section owns the middle of the viewport.
  useEffect(() => {
    const sections = nav
      .map((n) => document.getElementById(n.id))
      .filter((el): el is HTMLElement => !!el);

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-[70]"
      initial={{ y: -24, opacity: 0 }}
      animate={entered ? { y: 0, opacity: 1 } : { y: -24, opacity: 0 }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
    >
      {/* Scrim: keeps text that scrolls under the bar from colliding with it. */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-28 transition-opacity duration-700",
          condensed ? "opacity-100" : "opacity-0",
        )}
        style={{
          background:
            "linear-gradient(to bottom, rgba(4,5,10,0.92), rgba(4,5,10,0.55) 45%, transparent)",
          maskImage: "linear-gradient(to bottom, #000 55%, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, #000 55%, transparent)",
        }}
      />

      <div
        className={cn(
          "relative mx-auto flex max-w-[1400px] items-center justify-between px-6 transition-all duration-500 sm:px-10",
          condensed ? "py-3" : "py-6",
        )}
      >
        {/* Mark */}
        <button
          onClick={() => goTo("hero")}
          className="group flex items-center gap-3 rounded-full py-1 pr-3"
          aria-label={`${site.name} — back to top`}
        >
          <span className="relative grid h-8 w-8 place-items-center">
            <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden>
              <circle
                cx="16"
                cy="16"
                r="14.5"
                fill="none"
                stroke="url(#markGrad)"
                strokeWidth="1"
                className="opacity-60 transition-opacity duration-500 group-hover:opacity-100"
              />
              <circle cx="16" cy="16" r="3" fill="url(#markGrad)">
                <animate
                  attributeName="r"
                  values="3;3.9;3"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </circle>
              <defs>
                <linearGradient id="markGrad" x1="0" y1="0" x2="32" y2="32">
                  <stop offset="0%" stopColor="#2fd4dd" />
                  <stop offset="55%" stopColor="#6c5cff" />
                  <stop offset="100%" stopColor="#f3c179" />
                </linearGradient>
              </defs>
            </svg>
          </span>
          <span className="font-mono text-[11px] tracking-[0.28em] text-dim transition-colors group-hover:text-ink">
            {site.initials}
          </span>
        </button>

        {/* Sections */}
        <nav
          aria-label="Sections"
          className={cn(
            "hidden items-center gap-1 rounded-full px-2 py-1.5 transition-all duration-500 md:flex",
            condensed ? "glass glass-lit" : "border border-transparent",
          )}
        >
          {nav.slice(1).map((item) => (
            <button
              key={item.id}
              onClick={() => goTo(item.id)}
              aria-current={active === item.id ? "true" : undefined}
              className="relative rounded-full px-4 py-1.5 font-mono text-[11px] tracking-[0.2em] uppercase text-muted transition-colors duration-300 hover:text-ink"
            >
              {active === item.id && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      "color-mix(in oklab, #eef0f7 8%, transparent)",
                    border: "1px solid color-mix(in oklab, #eef0f7 10%, transparent)",
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 34 }}
                />
              )}
              <span
                className={cn(
                  "relative transition-colors duration-300",
                  active === item.id && "text-ink",
                )}
              >
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        {/* Palette trigger */}
        <button
          onClick={openPalette}
          className="glass glass-lit group flex items-center gap-2.5 rounded-full px-3.5 py-2 transition-colors duration-300 hover:bg-white/[0.07]"
          aria-label="Open command palette"
        >
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-muted" aria-hidden>
            <path
              d="M6.5 11.5 2.5 7.5l4-4M9.5 4.5l4 4-4 4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <kbd className="font-mono text-[10px] tracking-[0.18em] text-dim">
            ⌘K
          </kbd>
        </button>
      </div>
    </motion.header>
  );
}
