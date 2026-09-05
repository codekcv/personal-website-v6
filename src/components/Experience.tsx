"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import AuroraCanvas from "./AuroraCanvas";
import Cursor from "./Cursor";
import SmoothScroll from "./SmoothScroll";
import Threshold from "./Threshold";
import ScrollProgress from "./ScrollProgress";
import Nav from "./Nav";
import CommandPalette from "./CommandPalette";
import {
  entryStore,
  getServerEntry,
  getServerReducedMotion,
  getServerStillness,
  reducedMotionStore,
  stillnessStore,
} from "@/lib/prefs";

type Ctx = {
  still: boolean;
  setStill: (v: boolean) => void;
  paletteOpen: boolean;
  openPalette: () => void;
  closePalette: () => void;
  togglePalette: () => void;
  entered: boolean;
};

const ExperienceCtx = createContext<Ctx | null>(null);

export function useExperience() {
  const ctx = useContext(ExperienceCtx);
  if (!ctx) throw new Error("useExperience must be used inside <Experience>");
  return ctx;
}

/**
 * Owns everything that lives outside the document flow: the field,
 * the cursor, the threshold, the chrome. Sections stay pure.
 */
export default function Experience({ children }: { children: ReactNode }) {
  const systemReduced = useSyncExternalStore(
    reducedMotionStore.subscribe,
    reducedMotionStore.getSnapshot,
    getServerReducedMotion,
  );

  const stillness = useSyncExternalStore(
    stillnessStore.subscribe,
    stillnessStore.getSnapshot,
    getServerStillness,
  );
  const entry = useSyncExternalStore(
    entryStore.subscribe,
    entryStore.getSnapshot,
    getServerEntry,
  );

  // An explicit choice wins; otherwise follow the operating system.
  const still = stillness === "system" ? systemReduced : stillness === "on";

  // The threshold is an entrance, not a gate: it plays once per tab, and
  // never for visitors who asked for less motion.
  const skipThreshold = still || entry === "seen";

  const [opened, setOpened] = useState(false);
  const entered = skipThreshold || opened;

  const setStill = useCallback((v: boolean) => {
    stillnessStore.set(v ? "on" : "off");
  }, []);

  const onOpen = useCallback(() => setOpened(true), []);

  const [paletteOpen, setPaletteOpen] = useState(false);

  // Functional updates, so the ⌘K handler never toggles from a stale value.
  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);
  const togglePalette = useCallback(() => setPaletteOpen((v) => !v), []);

  const value = useMemo(
    () => ({
      still,
      setStill,
      paletteOpen,
      openPalette,
      closePalette,
      togglePalette,
      entered,
    }),
    [still, setStill, paletteOpen, openPalette, closePalette, togglePalette, entered],
  );

  return (
    <ExperienceCtx.Provider value={value}>
      <AuroraCanvas revealed={entered} reducedMotion={still} />
      {!still && <SmoothScroll />}
      {!still && <Cursor />}
      {!skipThreshold && <Threshold onOpen={onOpen} />}
      <ScrollProgress />
      <Nav />
      <CommandPalette />
      {children}
    </ExperienceCtx.Provider>
  );
}
