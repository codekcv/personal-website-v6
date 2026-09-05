/**
 * Two visitor preferences that live in browser storage rather than in React.
 *
 * They are modelled as external stores so components can read them with
 * useSyncExternalStore — no setState-in-effect, no hydration mismatch, and
 * changes propagate to every reader (and every tab) at once.
 */

type Listener = () => void;

function createStore<T extends string>(
  key: string,
  storage: () => Storage,
  parse: (raw: string | null) => T,
) {
  const listeners = new Set<Listener>();
  let cache: T | undefined;

  const read = (): T => {
    try {
      return parse(storage().getItem(key));
    } catch {
      // Private mode, or storage disabled — fall back to the default.
      return parse(null);
    }
  };

  const emit = () => listeners.forEach((l) => l());

  return {
    subscribe(listener: Listener) {
      listeners.add(listener);
      // Another tab changing the value should be reflected here too.
      const onStorage = (e: StorageEvent) => {
        if (e.key === key || e.key === null) {
          cache = undefined;
          emit();
        }
      };
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", onStorage);
      };
    },
    getSnapshot(): T {
      if (cache === undefined) cache = read();
      return cache;
    },
    set(value: T) {
      cache = value;
      try {
        storage().setItem(key, value);
      } catch {
        // Nothing to persist to; the choice still holds for this visit.
      }
      emit();
    },
  };
}

/** "on" / "off" force the choice; "system" defers to prefers-reduced-motion. */
export type Stillness = "on" | "off" | "system";

export const stillnessStore = createStore<Stillness>(
  "aurelia:stillness",
  () => localStorage,
  (raw) => (raw === "on" || raw === "off" ? raw : "system"),
);

export const getServerStillness = (): Stillness => "system";

/** Whether the threshold has already played in this tab. */
export type Entry = "pending" | "seen";

export const entryStore = createStore<Entry>(
  "aurelia:entered",
  () => sessionStorage,
  (raw) => (raw === "seen" ? "seen" : "pending"),
);

export const getServerEntry = (): Entry => "pending";

/**
 * prefers-reduced-motion, as a store rather than a hook.
 *
 * Read through useSyncExternalStore this matches the server during
 * hydration and only then re-renders with the real value — a plain
 * media-query hook would make the first client render disagree with
 * the server HTML.
 */
const QUERY = "(prefers-reduced-motion: reduce)";

export const reducedMotionStore = {
  subscribe(listener: () => void) {
    const mql = window.matchMedia(QUERY);
    mql.addEventListener("change", listener);
    return () => mql.removeEventListener("change", listener);
  },
  getSnapshot(): boolean {
    return window.matchMedia(QUERY).matches;
  },
};

export const getServerReducedMotion = (): boolean => false;
