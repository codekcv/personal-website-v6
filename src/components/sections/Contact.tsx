"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { site, socials } from "@/data/site";
import { RevealWords, Rise, DrawLine } from "../Reveal";

export default function Contact() {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard?.writeText(site.email).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      },
      () => {
        /* clipboard unavailable — the mailto link still works */
      },
    );
  };

  return (
    <section id="contact" className="relative">
      <div className="mx-auto max-w-[1400px] px-6 py-[16vh] sm:px-10">
        <DrawLine className="mb-16 w-full sm:mb-24" />

        <div className="flex flex-col items-center text-center">
          <Rise>
            <span className="mb-10 inline-flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.02] px-4 py-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-cyan opacity-60 [animation:ping_2.4s_cubic-bezier(0,0,0.2,1)_infinite]" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan" />
              </span>
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-dim">
                Open to new work
              </span>
            </span>
          </Rise>

          <RevealWords
            as="h2"
            text="Let's build something that outlives the trend."
            className="block max-w-4xl font-display text-[clamp(2.4rem,7.2vw,6rem)] leading-[0.96] tracking-[-0.03em]"
            stagger={0.06}
          />

          <Rise delay={0.25} className="mt-12 sm:mt-16">
            <div className="flex flex-col items-center gap-5 sm:flex-row">
              <a
                href={`mailto:${site.email}`}
                className="group relative font-display text-[clamp(1.3rem,3.4vw,2.4rem)] italic tracking-[-0.01em]"
              >
                <span className="text-lumen [animation:sheen_8s_ease-in-out_infinite]">
                  {site.email}
                </span>
                <span
                  aria-hidden
                  className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-cyan via-violet to-gold transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
                />
              </a>

              <button
                onClick={copy}
                className="glass glass-lit relative overflow-hidden rounded-full px-4 py-2 font-mono text-[10px] tracking-[0.2em] uppercase text-muted transition-colors duration-300 hover:text-ink"
                aria-live="polite"
              >
                <motion.span
                  key={copied ? "copied" : "copy"}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28 }}
                  className="block"
                >
                  {copied ? "Copied" : "Copy"}
                </motion.span>
              </button>
            </div>
          </Rise>

          <Rise delay={0.35} className="mt-16 sm:mt-20">
            <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-baseline gap-2.5 text-[15px] text-dim transition-colors duration-300 hover:text-ink"
                  >
                    <span className="relative">
                      {s.label}
                      <span
                        aria-hidden
                        className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-500 ease-out group-hover:scale-x-100"
                      />
                    </span>
                    <span className="font-mono text-[10px] tracking-[0.14em] text-faint">
                      {s.handle}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </Rise>
        </div>
      </div>
    </section>
  );
}
