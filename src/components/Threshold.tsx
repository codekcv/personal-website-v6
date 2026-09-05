"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { setScrollLocked } from "./SmoothScroll";
import { entryStore } from "@/lib/prefs";

const EASE = [0.16, 1, 0.3, 1] as const;
const EASE_IO = [0.83, 0, 0.17, 1] as const;
const DURATION = 1500;

/* ── The threshold ──────────────────────────────────────────
   A hairline of light draws across the dark, then opens like
   a door onto the field. Skippable with any key or click.

   Whether it plays at all is decided by <Experience>; by the
   time this mounts, it plays.
   ──────────────────────────────────────────────────────────── */
export default function Threshold({ onOpen }: { onOpen: () => void }) {
  const [phase, setPhase] = useState<"draw" | "open" | "gone">("draw");
  const [count, setCount] = useState(0);
  const opened = useRef(false);

  const open = useCallback(() => {
    if (opened.current) return;
    opened.current = true;
    setCount(100);
    setPhase("open");
    onOpen();
    window.setTimeout(() => {
      setPhase("gone");
      setScrollLocked(false);
      entryStore.set("seen");
    }, 1250);
  }, [onOpen]);

  useEffect(() => {
    setScrollLocked(true);
    window.scrollTo(0, 0);

    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION);
      setCount(Math.round(t * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
      else open();
    };
    raf = requestAnimationFrame(tick);

    const skip = (e: Event) => {
      // Tab still needs to reach the skip link underneath.
      if (e instanceof KeyboardEvent && e.key === "Tab") return;
      open();
    };
    window.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", skip);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
      setScrollLocked(false);
    };
  }, [open]);

  const isOpening = phase === "open";

  return (
    <AnimatePresence>
      {phase !== "gone" && (
        <motion.div
          key="threshold"
          className="fixed inset-0 z-[100]"
          role="presentation"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* The two halves of the door */}
          <motion.div
            className="absolute inset-x-0 top-0 bg-void"
            style={{ height: "50%" }}
            animate={isOpening ? { y: "-101%" } : { y: "0%" }}
            transition={{ duration: 1.15, ease: EASE_IO }}
          />
          <motion.div
            className="absolute inset-x-0 bottom-0 bg-void"
            style={{ height: "50%" }}
            animate={isOpening ? { y: "101%" } : { y: "0%" }}
            transition={{ duration: 1.15, ease: EASE_IO }}
          />

          {/* The seam of light */}
          <motion.div
            className="absolute left-0 right-0 top-1/2 h-px origin-center"
            style={{
              background:
                "linear-gradient(to right, transparent, #2fd4dd 18%, #eef0f7 50%, #6c5cff 82%, transparent)",
              boxShadow: "0 0 24px 2px rgba(108,92,255,0.55)",
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={
              isOpening
                ? { scaleX: 1, opacity: 0, transition: { duration: 0.9, ease: EASE } }
                : { scaleX: 1, opacity: 1, transition: { duration: 1.5, ease: EASE } }
            }
          />

          {/* Counter + hint */}
          <motion.div
            className="absolute inset-x-0 bottom-0 flex items-end justify-between px-6 pb-6 sm:px-10 sm:pb-10"
            animate={{ opacity: isOpening ? 0 : 1 }}
            transition={{ duration: 0.4 }}
          >
            <span className="font-mono text-[11px] tracking-[0.3em] text-muted tabular-nums">
              {String(count).padStart(3, "0")}
            </span>
            <span className="font-mono text-[11px] tracking-[0.3em] text-faint">
              PRESS ANY KEY
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
