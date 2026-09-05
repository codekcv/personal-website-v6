"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { nav, site, socials } from "@/data/site";
import { useSectionNav } from "./SmoothScroll";
import { useExperience } from "./Experience";
import { cn } from "@/lib/utils";

type Action = {
  id: string;
  label: string;
  hint: string;
  group: "Navigate" | "Elsewhere" | "Preferences";
  /** Actions that give feedback in place keep the palette open. */
  keepOpen?: boolean;
  run: () => void;
};

const GROUP_ORDER: Action["group"][] = ["Navigate", "Elsewhere", "Preferences"];

/**
 * The dialog only exists while the palette is open, so its query and
 * cursor start fresh on every open with no resetting effect.
 */
function Dialog({
  actions,
  onClose,
}: {
  actions: Action[];
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter(
      (a) =>
        a.label.toLowerCase().includes(q) || a.hint.toLowerCase().includes(q),
    );
  }, [actions, query]);

  // Grouped for display, and flattened in the same order for the keyboard.
  // Both come from one pass so a row's index always addresses the same action.
  const { grouped, ordered } = useMemo(() => {
    const ordered: Action[] = [];
    const grouped = GROUP_ORDER.map((group) => ({
      group,
      items: results
        .filter((r) => r.group === group)
        .map((item) => ({ item, index: ordered.push(item) - 1 })),
    })).filter((g) => g.items.length > 0);
    return { grouped, ordered };
  }, [results]);

  // Take focus on mount; hand it back to whatever opened the palette.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const id = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => {
      window.clearTimeout(id);
      previous?.focus?.();
    };
  }, []);

  // Keep the active row in view.
  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>('[data-active="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  const select = useCallback(
    (action: Action) => {
      action.run();
      if (action.id === "copy-email") {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      }
      if (!action.keepOpen) onClose();
    },
    [onClose],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }
    const count = Math.max(1, ordered.length);
    if (e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey)) {
      e.preventDefault();
      setCursor((c) => (c + 1) % count);
    } else if (e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)) {
      e.preventDefault();
      setCursor((c) => (c - 1 + count) % count);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const action = ordered[cursor];
      if (action) select(action);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[95] flex items-start justify-center px-4 pt-[14vh]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
    >
      <div
        className="absolute inset-0 bg-void/70 backdrop-blur-md"
        onClick={onClose}
        aria-hidden
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="glass glass-lit relative w-full max-w-lg overflow-hidden rounded-2xl shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)]"
        initial={{ y: -14, scale: 0.97, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: -10, scale: 0.98, opacity: 0 }}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-3 border-b border-white/[0.07] px-4">
          <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0 text-muted" aria-hidden>
            <circle cx="7" cy="7" r="4.6" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <path d="m10.6 10.6 3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCursor(0);
            }}
            placeholder="Where would you like to go?"
            aria-label="Search commands"
            className="w-full bg-transparent py-4 text-sm text-ink outline-none placeholder:text-muted"
          />
          <kbd className="hidden shrink-0 rounded border border-white/10 px-1.5 py-0.5 font-mono text-[10px] text-muted sm:block">
            ESC
          </kbd>
        </div>

        <div ref={listRef} className="max-h-[54vh] overflow-y-auto p-2">
          {grouped.length === 0 && (
            <p className="px-3 py-8 text-center font-mono text-[11px] tracking-[0.2em] uppercase text-muted">
              Nothing here
            </p>
          )}

          {grouped.map((g) => (
            <div key={g.group} className="mb-1">
              <p className="mono-label px-3 pb-1.5 pt-3 text-[10px]">{g.group}</p>
              {g.items.map(({ item, index }) => {
                const isActive = index === cursor;
                return (
                  <button
                    key={item.id}
                    data-active={isActive}
                    onMouseEnter={() => setCursor(index)}
                    onClick={() => select(item)}
                    className={cn(
                      "flex w-full items-center justify-between gap-4 rounded-lg px-3 py-2.5 text-left transition-colors duration-150",
                      isActive ? "bg-white/[0.08]" : "hover:bg-white/[0.04]",
                    )}
                  >
                    <span className="text-sm text-ink">
                      {item.id === "copy-email" && copied
                        ? "Copied to clipboard"
                        : item.label}
                    </span>
                    <span className="truncate font-mono text-[10px] tracking-[0.14em] text-muted">
                      {item.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function CommandPalette() {
  const { paletteOpen, closePalette, togglePalette, still, setStill } =
    useExperience();
  const goTo = useSectionNav();

  const actions = useMemo<Action[]>(() => {
    const list: Action[] = nav.map((n) => ({
      id: `nav-${n.id}`,
      label: n.label === "Top" ? "Back to top" : n.label,
      hint: "Section",
      group: "Navigate",
      run: () => goTo(n.id),
    }));

    list.push({
      id: "copy-email",
      label: "Copy email address",
      hint: site.email,
      group: "Elsewhere",
      keepOpen: true,
      run: () => {
        navigator.clipboard?.writeText(site.email).catch(() => {
          // Clipboard blocked — the address is on screen anyway.
        });
      },
    });

    socials.forEach((s) =>
      list.push({
        id: `social-${s.label}`,
        label: `Open ${s.label}`,
        hint: s.handle,
        group: "Elsewhere",
        run: () => window.open(s.href, "_blank", "noopener,noreferrer"),
      }),
    );

    list.push({
      id: "stillness",
      label: still ? "Resume motion" : "Enter stillness",
      hint: still ? "Animate the field" : "Reduce all motion",
      group: "Preferences",
      keepOpen: true,
      run: () => setStill(!still),
    });

    return list;
  }, [still, setStill, goTo]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        togglePalette();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePalette]);

  return (
    <AnimatePresence>
      {paletteOpen && (
        <Dialog key="palette" actions={actions} onClose={closePalette} />
      )}
    </AnimatePresence>
  );
}
