import Link from "next/link";

export const metadata = { title: "Lost the thread" };

export default function NotFound() {
  return (
    <main className="relative grid min-h-[100svh] place-items-center px-6">
      <div className="flex flex-col items-center text-center">
        <p className="mono-label mb-8">Error 404</p>
        <h1 className="font-display text-[clamp(3rem,12vw,8rem)] leading-[0.9] tracking-[-0.03em]">
          <span className="text-lumen">Nothing</span>{" "}
          <span className="italic text-ink/90">here</span>
        </h1>
        <p className="mt-8 max-w-sm text-[15px] leading-relaxed text-dim">
          This page never existed, or it has already gone back to the light.
        </p>
        <Link
          href="/"
          className="glass glass-lit mt-10 rounded-full px-7 py-3 text-sm text-ink transition-colors duration-300 hover:bg-white/[0.09]"
        >
          Return
        </Link>
      </div>
    </main>
  );
}
