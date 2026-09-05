"use client";

import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect, useRef } from "react";
import { site } from "@/data/site";
import { RevealChars } from "../Reveal";
import { scrollToSection } from "../SmoothScroll";
import { useExperience } from "../Experience";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function Hero() {
  const { entered, still } = useExperience();
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "26%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const blur = useTransform(scrollYProgress, [0, 1], ["blur(0px)", "blur(7px)"]);

  // Pointer tilt for the halo — subtle, spring-damped.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rx = useSpring(useTransform(py, [-0.5, 0.5], [7, -7]), {
    stiffness: 90,
    damping: 22,
  });
  const ry = useSpring(useTransform(px, [-0.5, 0.5], [-9, 9]), {
    stiffness: 90,
    damping: 22,
  });

  useEffect(() => {
    if (still) return;
    const onMove = (e: PointerEvent) => {
      px.set(e.clientX / window.innerWidth - 0.5);
      py.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [px, py, still]);

  const base = 0.15;

  return (
    <section
      id="hero"
      ref={ref}
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden"
    >
      {/* Halo */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 grid place-items-center"
        style={{ perspective: 1000, opacity }}
      >
        <motion.svg
          viewBox="0 0 600 600"
          className="h-[132vmin] w-[132vmin] max-w-none"
          style={{ rotateX: rx, rotateY: ry }}
          initial={{ opacity: 0, scale: 0.86 }}
          animate={entered ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 2.4, ease: EASE, delay: 0.1 }}
        >
          <defs>
            <linearGradient id="haloA" x1="0" y1="0" x2="600" y2="600">
              <stop offset="0%" stopColor="#2fd4dd" stopOpacity="0.55" />
              <stop offset="50%" stopColor="#6c5cff" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#f3c179" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="haloB" x1="600" y1="0" x2="0" y2="600">
              <stop offset="0%" stopColor="#f3c179" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#6c5cff" stopOpacity="0.12" />
            </linearGradient>
          </defs>

          <g
            className={still ? "" : "[animation:spin_120s_linear_infinite]"}
            style={{ transformOrigin: "300px 300px" }}
          >
            <circle
              cx="300"
              cy="300"
              r="248"
              fill="none"
              stroke="url(#haloA)"
              strokeWidth="0.75"
              strokeDasharray="2 10"
            />
          </g>
          <g
            className={still ? "" : "[animation:spin-reverse_200s_linear_infinite]"}
            style={{ transformOrigin: "300px 300px" }}
          >
            <circle
              cx="300"
              cy="300"
              r="212"
              fill="none"
              stroke="url(#haloB)"
              strokeWidth="0.6"
            />
            <circle cx="300" cy="88" r="2.4" fill="#f3c179" opacity="0.85" />
          </g>
          <circle
            cx="300"
            cy="300"
            r="170"
            fill="none"
            stroke="url(#haloA)"
            strokeWidth="0.5"
            opacity="0.5"
          />
        </motion.svg>
      </motion.div>

      {/* Name */}
      <motion.div
        className="relative z-10 flex w-full max-w-[1400px] flex-col items-center px-6 text-center"
        style={{ y, opacity, filter: blur }}
      >
        <motion.p
          className="mono-label mb-8 sm:mb-10"
          initial={{ opacity: 0, y: 12 }}
          animate={entered ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: EASE, delay: base }}
        >
          <span>{site.role}</span>
          <span aria-hidden className="mx-2 hidden sm:inline">
            —
          </span>
          <span className="mt-1.5 block sm:mt-0 sm:inline">{site.location}</span>
        </motion.p>

        <h1 className="font-display leading-[0.84] tracking-[-0.03em]">
          <span className="sr-only">{site.name}</span>
          <span aria-hidden className="block text-[clamp(3.2rem,13.5vw,11.5rem)]">
            <RevealChars
              text="Christian"
              active={entered}
              delay={0.28}
              stagger={0.045}
              gradient
            />
          </span>
          <span
            aria-hidden
            className="block text-[clamp(3.2rem,13.5vw,11.5rem)] italic text-ink/90"
          >
            <RevealChars
              text="Villamin"
              active={entered}
              delay={0.5}
              stagger={0.045}
            />
          </span>
        </h1>

        <motion.p
          className="mt-9 max-w-md text-balance text-[15px] leading-relaxed text-dim sm:mt-11 sm:text-base"
          initial={{ opacity: 0, y: 16 }}
          animate={entered ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.2, ease: EASE, delay: base + 0.9 }}
        >
          {site.tagline}
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col items-center gap-4 sm:mt-12 sm:flex-row"
          initial={{ opacity: 0, y: 16 }}
          animate={entered ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.2, ease: EASE, delay: base + 1.05 }}
        >
          <button
            onClick={() => scrollToSection("work")}
            className="group glass glass-lit relative overflow-hidden rounded-full px-7 py-3 text-sm text-ink transition-colors duration-300 hover:bg-white/[0.09]"
          >
            <span className="relative z-10">See the work</span>
            <span
              aria-hidden
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/12 to-transparent transition-transform duration-[1100ms] ease-out group-hover:translate-x-full"
            />
          </button>
          <a
            href={`mailto:${site.email}`}
            className="rounded-full px-5 py-3 text-sm text-muted underline-offset-8 transition-colors duration-300 hover:text-ink hover:underline"
          >
            {site.email}
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.button
        onClick={() => scrollToSection("ethos")}
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3"
        style={{ opacity }}
        initial={{ opacity: 0 }}
        animate={entered ? { opacity: 1 } : {}}
        transition={{ duration: 1.4, delay: base + 1.4 }}
        aria-label="Scroll to the next section"
      >
        <span className="mono-label text-[10px]">Descend</span>
        <span className="relative block h-12 w-px overflow-hidden bg-white/12">
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-transparent via-cyan to-transparent [animation:drop_2.6s_cubic-bezier(0.65,0,0.35,1)_infinite]"
          />
        </span>
      </motion.button>
    </section>
  );
}
