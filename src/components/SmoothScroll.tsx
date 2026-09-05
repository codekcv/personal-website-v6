"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Lenis from "lenis";

let lenisInstance: Lenis | null = null;

/* Weighted scrolling. Disabled outright for reduced-motion and
   for touch, where the native inertia is already correct. */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.6,
      wheelMultiplier: 0.95,
    });
    lenisInstance = lenis;

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);

  return null;
}

/**
 * Scroll to a section on the current page — routed through Lenis when it
 * is running. Returns false when the section isn't on this page.
 */
export function scrollToSection(id: string): boolean {
  const el = document.getElementById(id);
  if (!el) return false;

  if (lenisInstance) {
    lenisInstance.scrollTo(el, { duration: 1.5 });
    return true;
  }

  el.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth",
    block: "start",
  });
  return true;
}

/**
 * Section navigation for the chrome, which is global and so can be asked
 * for a section the current page doesn't have (the 404, say). Scrolls when
 * the target is here, otherwise routes home to it rather than failing
 * silently — <Experience> picks the hash up once the entrance is over.
 */
export function useSectionNav() {
  const router = useRouter();
  return useCallback(
    (id: string) => {
      if (!scrollToSection(id)) router.push(`/#${id}`);
    },
    [router],
  );
}

let scrollLocked = false;
const unlockWaiters = new Set<() => void>();

/** Used by the threshold overlay to freeze the page while it plays. */
export function setScrollLocked(locked: boolean) {
  scrollLocked = locked;

  if (lenisInstance) {
    if (locked) lenisInstance.stop();
    else lenisInstance.start();
  }
  document.body.style.overflow = locked ? "hidden" : "";

  if (!locked && unlockWaiters.size) {
    const waiting = [...unlockWaiters];
    unlockWaiters.clear();
    waiting.forEach((fn) => fn());
  }
}

/**
 * Run once the page is scrollable again — immediately if it already is.
 * A scroll requested while the threshold holds the lock is swallowed by
 * the stopped Lenis instance, so deep links have to wait it out.
 * Returns an unsubscribe.
 */
export function whenScrollUnlocked(fn: () => void): () => void {
  if (!scrollLocked) {
    fn();
    return () => {};
  }
  unlockWaiters.add(fn);
  return () => unlockWaiters.delete(fn);
}
