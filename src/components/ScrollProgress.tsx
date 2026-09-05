"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** A hairline of light across the top edge, tracking read progress. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 40,
    restDelta: 0.0005,
  });

  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[80] h-px origin-left"
      style={{
        scaleX,
        background:
          "linear-gradient(to right, #2fd4dd, #6c5cff 55%, #f3c179)",
        boxShadow: "0 0 12px rgba(108,92,255,0.6)",
      }}
    />
  );
}
