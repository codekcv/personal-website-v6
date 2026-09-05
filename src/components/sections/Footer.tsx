"use client";

import { site } from "@/data/site";
import { useExperience } from "../Experience";

export default function Footer() {
  const { still, setStill } = useExperience();
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/[0.06]">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-faint">
          © {year} {site.name}
        </p>

        <div className="flex items-center gap-6">
          <button
            onClick={() => setStill(!still)}
            className="font-mono text-[10px] tracking-[0.2em] uppercase text-faint transition-colors duration-300 hover:text-dim"
            aria-pressed={still}
          >
            {still ? "Motion: off" : "Motion: on"}
          </button>
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-faint">
            {site.domain}
          </p>
        </div>
      </div>
    </footer>
  );
}
