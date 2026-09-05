"use client";

import { useEffect, useRef } from "react";
import { damp } from "@/lib/utils";

/* A two-body cursor: a fast dot and a lagging ring that swells
   over anything interactive. Fine pointers only. */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduced.matches) return;

    const root = document.documentElement;
    root.classList.add("has-custom-cursor");

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const s = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      rx: window.innerWidth / 2,
      ry: window.innerHeight / 2,
      scale: 1,
      scaleTarget: 1,
      opacity: 0,
      last: performance.now(),
    };

    const INTERACTIVE = "a, button, [role='button'], input, textarea, select, [data-cursor]";

    const onMove = (e: PointerEvent) => {
      s.x = e.clientX;
      s.y = e.clientY;
      s.opacity = 1;
      const el = e.target as Element | null;
      s.scaleTarget = el?.closest?.(INTERACTIVE) ? 2.2 : 1;
    };
    const onLeave = () => (s.opacity = 0);
    const onDown = () => (s.scaleTarget *= 0.72);
    const onUp = () => {
      s.scaleTarget = document.querySelector(":hover")?.closest?.(INTERACTIVE)
        ? 2.2
        : 1;
    };

    let raf = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - s.last) / 1000);
      s.last = now;

      s.rx = damp(s.rx, s.x, 14, dt);
      s.ry = damp(s.ry, s.y, 14, dt);
      s.scale = damp(s.scale, s.scaleTarget, 12, dt);

      dot.style.transform = `translate3d(${s.x}px, ${s.y}px, 0) translate(-50%, -50%)`;
      dot.style.opacity = String(s.opacity);
      ring.style.transform = `translate3d(${s.rx}px, ${s.ry}px, 0) translate(-50%, -50%) scale(${s.scale})`;
      ring.style.opacity = String(s.opacity * (s.scale > 1.5 ? 0.55 : 0.85));
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      root.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[90] hidden md:block">
      <div
        ref={ringRef}
        className="absolute left-0 top-0 h-8 w-8 rounded-full opacity-0"
        style={{
          border: "1px solid color-mix(in oklab, #eef0f7 55%, transparent)",
          transition: "opacity 220ms linear",
          mixBlendMode: "difference",
        }}
      />
      <div
        ref={dotRef}
        className="absolute left-0 top-0 h-[5px] w-[5px] rounded-full bg-ink opacity-0"
        style={{ transition: "opacity 220ms linear", mixBlendMode: "difference" }}
      />
    </div>
  );
}
