import Link from "next/link";
import { EXPANSIONS } from "./data/expansions";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="text-5xl font-semibold tracking-tight">WoW Builds</h1>
        <p className="mt-4 text-lg text-white/60">
          Curated wow builds across expansions
        </p>

        {/* Mode cards */}
        <div className="mt-10 grid gap-6 md:grid-cols-2">
         <Link
  href="/low-level-builds"
  className="block rounded-xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition"
>
  <h2 className="text-2xl font-semibold">Low Level Builds</h2>
  <p className="mt-2 text-white/70">
    Level 1 / 10 optimized builds, gear, enchants, and consumables.
  </p>
  <p className="mt-4 text-white/90">Browse expansions →</p>
</Link>


          <Link
            href="/arena"
            className="group rounded-3xl border border-white/20 bg-white/5 p-8 transition hover:bg-white/10"
          >
            <div className="text-2xl font-semibold">Arena PvP Builds</div>
            <div className="mt-2 text-white/60">
              Class-based arena specs per expansion (coming soon).
            </div>
            <div className="mt-6 text-white/70 group-hover:text-white">
              Browse expansions →
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
