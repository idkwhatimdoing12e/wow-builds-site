import Link from "next/link";
import buildsData from "../data/builds.json";

type Build = { id: string; name: string; description?: string };
type Expansion = { id: string; name: string; builds: Build[] };

export default async function ExpansionPage({
  params,
}: {
  params: Promise<{ expansion: string }>;
}) {
  const { expansion } = await params;

  const expansions = (buildsData as { expansions: Expansion[] }).expansions;

  const param = decodeURIComponent(expansion ?? "").trim().toLowerCase();
  const exp = expansions.find((e) => e.id.trim().toLowerCase() === param);

  if (!exp) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <Link href="/" className="text-white/60 hover:text-white">
            ← Back
          </Link>
          <h1 className="mt-6 text-5xl font-semibold tracking-tight">Not found</h1>
          <p className="mt-3 text-white/60">
            Expansion <span className="text-white">“{expansion}”</span> doesn’t exist.
          </p>
          <div className="mt-6 text-sm text-white/40">
            Available: {expansions.map((e) => e.id).join(", ")}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/" className="text-white/60 hover:text-white">
          ← Back
        </Link>

        <h1 className="mt-6 text-5xl font-semibold tracking-tight">{exp.name}</h1>
        <p className="mt-3 text-lg text-white/60">Pick a build.</p>

        <div className="mt-10 space-y-4">
          {exp.builds.map((b) => (
            <Link
              key={b.id}
              href={`/${encodeURIComponent(exp.id)}/${encodeURIComponent(b.id)}`}
              className="group block rounded-2xl border border-white/20 bg-white/5 p-8 transition hover:border-white/40 hover:bg-white/10"
            >
              <div className="text-3xl font-semibold">{b.name}</div>
              {b.description ? <div className="mt-2 text-white/60">{b.description}</div> : null}
              <div className="mt-3 text-white/60">
                Open{" "}
                <span className="transition group-hover:translate-x-1 inline-block">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
