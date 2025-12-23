import Link from "next/link";
import { notFound } from "next/navigation";
import buildsData from "../../data/builds.json";

type Build = {
  id: string;
  title?: string;
  subtitle?: string;
  name?: string;
  description?: string;
};

type Expansion = {
  id: string;
  name: string;
  builds: Build[];
};

const data = buildsData as { expansions?: Expansion[] };

function norm(v: unknown) {
  return decodeURIComponent(String(v ?? "")).trim().toLowerCase();
}

export default async function ExpansionPage({
  params,
}: {
  params: Promise<{ expansion: string }>;
}) {
  const { expansion } = await params; // IMPORTANT: fixes your 404/notFound

  const expId = norm(expansion);
  const expansions = data.expansions ?? [];
  const exp = expansions.find((e) => norm(e.id) === expId);

  if (!exp) notFound();

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-5xl px-6 py-14">
        <Link
          href="/low-level-builds"
          className="text-sm text-white/70 hover:text-white"
        >
          ← Back to expansions
        </Link>

        <h1 className="mt-4 text-5xl font-semibold tracking-tight">
          {exp.name}
        </h1>

        <div className="mt-10 space-y-4">
          {(!exp.builds || exp.builds.length === 0) && (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/70">
              No builds yet for this expansion.
            </div>
          )}

          {(exp.builds ?? []).map((build) => {
            const title = build.title ?? build.name ?? build.id;
            const subtitle = build.subtitle ?? build.description ?? "";

            return (
              <Link
                key={build.id}
                href={`/low-level-builds/${exp.id}/${build.id}`}
                className="group block rounded-3xl border border-white/15 bg-white/[0.03] p-6 transition hover:border-white/25 hover:bg-white/[0.06]"
              >
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-2xl font-semibold">{title}</h2>
                  <span className="text-white/60 group-hover:text-white">
                    →
                  </span>
                </div>

                {subtitle ? (
                  <p className="mt-2 text-white/70">{subtitle}</p>
                ) : null}
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}