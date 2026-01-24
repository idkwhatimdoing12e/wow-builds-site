import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Top-aligned container */}
      <div className="flex justify-center">
        <div className="w-full px-6">
          {/* Centered column */}
          <div className="mx-auto max-w-xl text-center pt-28">
            {/* Title */}
            <h1 className="text-5xl font-semibold tracking-tight">
              WoW Builds
            </h1>

            <p className="mt-4 text-lg text-white/60">
              Curated wow builds across expansions
            </p>

            {/* Card */}
            <div className="mt-12">
              <Link
                href="/low-level-builds"
                className="block rounded-2xl border border-white/15 bg-white/5 p-8 transition hover:bg-white/10"
              >
                <h2 className="text-2xl font-semibold">
                  Low Level Builds
                </h2>

                <p className="mt-3 text-white/70">
                  Level 1 / 10 optimized builds, gear, enchants, and consumables.
                </p>

                <p className="mt-6 text-white/90">
                  Browse expansions →
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}