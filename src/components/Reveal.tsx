"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";
import { useExperience } from "./Experience";

const EASE = [0.16, 1, 0.3, 1] as const;

/* ── Words rising from behind a mask ────────────────────────
   Real text stays readable to assistive tech via aria-label;
   the animated shards are hidden from it.
   ──────────────────────────────────────────────────────────── */
export function RevealWords({
  text,
  className,
  delay = 0,
  stagger = 0.045,
  as: As = "span",
  once = true,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  as?: "span" | "h1" | "h2" | "h3" | "p";
  once?: boolean;
}) {
  const { still: reduced } = useExperience();
  const words = text.split(" ");

  const container: Variants = {
    hidden: {},
    show: { transition: { delayChildren: delay, staggerChildren: stagger } },
  };

  const word: Variants = reduced
    ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
    : {
        hidden: { y: "110%", opacity: 0, rotateX: -55 },
        show: {
          y: "0%",
          opacity: 1,
          rotateX: 0,
          transition: { duration: 1.05, ease: EASE },
        },
      };

  const MotionAs = motion[As];

  return (
    <MotionAs
      className={className}
      aria-label={text}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount: 0.4 }}
      style={{ perspective: 800 }}
    >
      {words.map((w, i) => (
        <span
          key={`${w}-${i}`}
          aria-hidden
          className="inline-block overflow-hidden align-bottom"
          style={{ paddingBottom: "0.12em", marginBottom: "-0.12em" }}
        >
          <motion.span variants={word} className="inline-block will-change-transform">
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </MotionAs>
  );
}

/* ── Characters, for the hero only ─────────────────────────── */
export function RevealChars({
  text,
  className,
  delay = 0,
  stagger = 0.035,
  active = true,
  gradient = false,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  /** Hold the characters back until the threshold has opened. */
  active?: boolean;
  /**
   * Paint each glyph with its own slice of one word-wide gradient.
   * A single background-clip:text ancestor cannot do this: the
   * transformed per-character spans break the clip.
   */
  gradient?: boolean;
}) {
  const { still: reduced } = useExperience();
  const chars = Array.from(text);

  return (
    <motion.span
      className={className}
      aria-label={text}
      initial="hidden"
      animate={active ? "show" : "hidden"}
      variants={{
        hidden: {},
        show: { transition: { delayChildren: delay, staggerChildren: stagger } },
      }}
    >
      {chars.map((c, i) => (
        <span
          key={i}
          aria-hidden
          className="inline-block overflow-hidden align-bottom"
          style={{ paddingBottom: "0.14em", marginBottom: "-0.14em" }}
        >
          <motion.span
            className={
              gradient
                ? "text-lumen inline-block will-change-transform"
                : "inline-block will-change-transform"
            }
            style={
              gradient
                ? {
                    backgroundSize: `${chars.length * 100}% 100%`,
                    backgroundPosition: `${
                      (i / Math.max(1, chars.length - 1)) * 100
                    }% 50%`,
                  }
                : undefined
            }
            variants={
              reduced
                ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
                : {
                    hidden: { y: "108%", opacity: 0 },
                    show: {
                      y: "0%",
                      opacity: 1,
                      transition: { duration: 1.4, ease: EASE },
                    },
                  }
            }
          >
            {c === " " ? " " : c}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

/* ── A generic fade-and-lift for blocks ────────────────────── */
export function Rise({
  children,
  delay = 0,
  y = 28,
  className,
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}) {
  const { still: reduced } = useExperience();
  return (
    <motion.div
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.25 }}
      transition={{ duration: 1, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/* ── A hairline that draws itself in ───────────────────────── */
export function DrawLine({ className }: { className?: string }) {
  return (
    <motion.div
      className={className}
      style={{
        height: 1,
        background:
          "linear-gradient(to right, transparent, color-mix(in oklab, #eef0f7 22%, transparent), transparent)",
        transformOrigin: "center",
      }}
      initial={{ scaleX: 0, opacity: 0 }}
      whileInView={{ scaleX: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.6, ease: EASE }}
    />
  );
}
