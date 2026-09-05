"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useMemo, useRef } from "react";
import { ethos } from "@/data/site";
import { useExperience } from "../Experience";

/* Each word is lit by the scroll position — the paragraph is
   read *to* you rather than simply displayed. */
function Word({
  children,
  range,
  progress,
  still,
}: {
  children: string;
  range: [number, number];
  progress: MotionValue<number>;
  still: boolean;
}) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  const blurAmount = useTransform(progress, range, [4, 0]);
  const filter = useTransform(blurAmount, (b) => `blur(${b.toFixed(2)}px)`);

  if (still) return <span className="mr-[0.28em] inline-block">{children}</span>;

  return (
    <span className="relative mr-[0.28em] inline-block">
      <motion.span style={{ opacity, filter }} className="inline-block">
        {children}
      </motion.span>
    </span>
  );
}

export default function Ethos() {
  const { still } = useExperience();
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "end 0.65"],
  });

  const words = useMemo(() => ethos.statement.split(" "), []);
  const codaOpacity = useTransform(scrollYProgress, [0.82, 0.97], [0, 1]);
  const codaY = useTransform(scrollYProgress, [0.82, 0.97], [18, 0]);

  return (
    <section id="ethos" className="relative">
      <div ref={ref} className="mx-auto max-w-[1400px] px-6 py-[16vh] sm:px-10">
        <div className="mx-auto max-w-4xl">
          <p className="mono-label mb-10 sm:mb-14">{ethos.eyebrow}</p>

          <p
            className="font-display text-[clamp(1.6rem,3.7vw,3.05rem)] leading-[1.34] tracking-[-0.015em] text-ink"
            aria-label={ethos.statement}
          >
            <span aria-hidden>
              {words.map((word, i) => {
                const start = i / words.length;
                const end = start + 1 / words.length;
                return (
                  <Word
                    key={`${word}-${i}`}
                    range={[start, Math.min(1, end * 1.25)]}
                    progress={scrollYProgress}
                    still={still}
                  >
                    {word}
                  </Word>
                );
              })}
            </span>
          </p>

          <motion.p
            className="mt-14 font-display text-[clamp(1.15rem,2.1vw,1.7rem)] italic sm:mt-20"
            style={still ? undefined : { opacity: codaOpacity, y: codaY }}
          >
            <span className="text-lumen [animation:sheen_11s_ease-in-out_infinite]">
              {ethos.coda}
            </span>
          </motion.p>
        </div>
      </div>
    </section>
  );
}
