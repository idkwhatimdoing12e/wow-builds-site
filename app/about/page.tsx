import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/" className="text-white/60 hover:text-white">
          ← Back
        </Link>

        <h1 className="mt-6 text-5xl font-semibold tracking-tight">About</h1>

        <p className="mt-6 text-lg text-white/70 leading-relaxed">
          WoW Builds is a curated collection of level 1 twink builds across expansions.
          The goal is simple: fast, clean, “best in slot” setups with direct links to the
          relevant items, enchants, buffs, and consumables.
        </p>

        <p className="mt-4 text-white/70 leading-relaxed">
          This site is maintained by a creator who tests and documents builds in-game.
          If you found this useful, the best way to support it is by sharing it with other
          players.
        </p>
      </div>
    </main>
  );
}
