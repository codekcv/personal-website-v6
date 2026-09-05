/**
 * Single source of truth for everything the site says.
 * Edit here — no component contains hard-coded copy.
 */

export const site = {
  name: "Christian Villamin",
  initials: "CV",
  role: "Software Engineer",
  location: "Manila · Remote",
  tagline: "I build interfaces that feel like they were always there.",
  email: "hello@christianvillamin.dev",
  domain: "christianvillamin.dev",
  description:
    "Christian Villamin is a software engineer building fast, considered interfaces for the web — where engineering discipline meets the feeling of light.",
} as const;

export const nav = [
  { id: "hero", label: "Top" },
  { id: "ethos", label: "Ethos" },
  { id: "work", label: "Work" },
  { id: "craft", label: "Craft" },
  { id: "contact", label: "Contact" },
] as const;

/** The scroll-illuminated statement. Kept as one string; split at render. */
export const ethos = {
  eyebrow: "The premise",
  statement:
    "Most software is loud. It interrupts, it insists, it asks you to adapt to it. I am after the opposite — an interface so quiet and so exact that it disappears, and all that remains is the thing you came to do. Every millisecond of latency removed, every pixel put in its right place, every transition weighted like it has mass: these are not decorations. They are respect, made visible.",
  coda: "Build it so it lasts. Build it so it feels inevitable.",
};

export type Project = {
  index: string;
  title: string;
  summary: string;
  year: string;
  role: string;
  stack: string[];
  href?: string;
  accent: "violet" | "cyan" | "gold" | "rose";
};

/** Replace with your real work — the layout adapts to any count. */
export const projects: Project[] = [
  {
    index: "01",
    title: "Aurelia",
    summary:
      "A rendering engine for narrative interfaces. Real-time GPU compositing in under 40KB, with a declarative timeline that designers can actually read.",
    year: "2025",
    role: "Design & Engineering",
    stack: ["WebGL2", "TypeScript", "WASM"],
    accent: "violet",
  },
  {
    index: "02",
    title: "Meridian",
    summary:
      "Observability for teams who ship at midnight. Query a year of traces in under 200ms; the UI never blocks, never blinks, never lies about what it knows.",
    year: "2024",
    role: "Lead Frontend",
    stack: ["Next.js", "Rust", "ClickHouse"],
    accent: "cyan",
  },
  {
    index: "03",
    title: "Quiet Hours",
    summary:
      "A writing surface with no chrome, no counters, no streaks. It opens in 90 milliseconds and then gets out of the way entirely.",
    year: "2024",
    role: "Solo",
    stack: ["Swift", "CRDT", "Local-first"],
    accent: "gold",
  },
  {
    index: "04",
    title: "Cadence",
    summary:
      "Design-system tooling that turns tokens into typed, tree-shakeable primitives — and refuses to let a component drift from its spec.",
    year: "2023",
    role: "Architecture",
    stack: ["Tailwind", "Vite", "Codegen"],
    accent: "rose",
  },
];

export const principles = [
  {
    n: "I",
    title: "Latency is a feeling",
    body: "Speed is not a metric on a dashboard. It is the difference between a tool that trusts you and one that makes you wait for permission.",
  },
  {
    n: "II",
    title: "Motion carries meaning",
    body: "Nothing moves for decoration. Every transition explains where a thing came from, or where it went — and then it stops.",
  },
  {
    n: "III",
    title: "Restraint is the craft",
    body: "The hardest engineering decision is the feature you delete. What remains should feel less like a product and more like a conclusion.",
  },
];

export const stack = [
  "TypeScript",
  "React",
  "Next.js",
  "WebGL",
  "Rust",
  "Node",
  "PostgreSQL",
  "Tailwind",
  "GLSL",
  "Motion",
  "Vitest",
  "Figma",
];

export const socials = [
  { label: "GitHub", href: "https://github.com/codekcv", handle: "@codekcv" },
  { label: "LinkedIn", href: "https://www.linkedin.com/", handle: "in/…" },
  { label: "X", href: "https://x.com/", handle: "@…" },
];
