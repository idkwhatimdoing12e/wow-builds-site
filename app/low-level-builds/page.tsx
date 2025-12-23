import Link from "next/link";
import { EXPANSIONS } from "../data/expansions";

export default function LowLevelBuildsPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-5xl px-6 py-14">
        <div className="mb-10">
          <h1 className="text-5xl font-semibold tracking-tight">Low Level Builds</h1>
          <p className="mt-3 text-lg text-white/60">Pick an expansion.</p>
        </div>

        <div className="space-y-6">
          {EXPANSIONS.map((exp) => (
            <Link
              key={exp.id}
              href={`/low-level-builds/${exp.id}`}
              className="group block rounded-3xl border border-white/15 bg-white/[0.03] p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.05)] transition hover:border-white/25 hover:bg-white/[0.05]"
            >
              <div className="flex items-center gap-6">
                <div className="h-14 w-14 overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10">
                 {/* eslint-disable-next-line @next/next/no-img-element */}
{exp.logoSrc ? (
  <img
    src={exp.logoSrc}
    alt={`${exp.name} logo`}
    className="h-full w-full object-contain p-2"
  />
) : null}

                </div>

                <div className="min-w-0">
                  <div className="flex items-baseline gap-3">
                    <h2 className="truncate text-3xl font-semibold">{exp.name}</h2>
                    <span className="text-white/60">→</span>
                  </div>
                  <p className="mt-1 text-base text-white/55">{exp.subtitle}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
