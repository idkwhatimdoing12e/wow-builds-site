import Link from "next/link";
import buildsData from "../../data/builds.json";

type Build = {
  id: string;
  title?: string;
  name?: string;
  subtitle?: string;
  description?: string;
};

type Expansion = {
  id: string;
  name: string;
  builds?: Build[];
};

const data = buildsData as { expansions?: Expansion[] };

function norm(v: unknown) {
  return decodeURIComponent(String(v ?? "")).trim().toLowerCase();
}

export default async function ExpansionBuildsPage({
  params,
}: {
  params: Promise<{ expansion: string }>;
}) {
  const { expansion } = await params;

  const expansions = Array.isArray(data.expansions) ? data.expansions : [];

  // Find by normalized id
  const exp = expansions.find((e) => norm(e.id) === norm(expansion));

  // IMPORTANT: instead of hard 404, show a debug page so you can see the mismatch
  if (!exp) {
    const wanted = norm(expansion);

    return (
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-5xl px-6 py-14">
          <Link
            href="/low-level-builds"
            className="text-sm text-white/70 hover:text-white"
          >
            ← Back to Low Level Builds
          </Link>

          <h1 className="mt-8 text-4xl font-semibold tracking-tight">
            Expansion not found
          </h1>

          <p className="mt-3 text-white/70">
            URL expansion id: <span className="text-white">{wanted}</span>
          </p>

          <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-xl font-semibold">Expansions found in builds.json</h2>
            <p className="mt-2 text-sm text-white/60">
              If you expected <b>wotlk</b>, make sure builds.json has an expansion with
              <code className="ml-2 rounded bg-white/10 px-2 py-1">"id": "wotlk"</code>
              (no extra spaces).
            </p>

            <ul className="mt-4 space-y-2 text-white/75">
              {expansions.map((e) => (
                <li key={String(e.id)}>
                  <span className="text-white/60">id:</span>{" "}
                  <code className="rounded bg-white/10 px-2 py-1">
                    {String(e.id)}
                  </code>{" "}
                  <span className="text-white/60">→ normalized:</span>{" "}
                  <code className="rounded bg-white/10 px-2 py-1">
                    {norm(e.id)}
                  </code>{" "}
                  <Link
                    href={`/low-level-builds/${encodeURIComponent(String(e.id))}`}
                    className="ml-3 text-sm text-white underline decoration-white/30 underline-offset-4 hover:decoration-white/70"
                  >
                    open
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    );
  }

  const builds = Array.isArray(exp.builds) ? exp.builds : [];

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-5xl px-6 py-14">
        <Link
          href="/low-level-builds"
          className="text-sm text-white/70 hover:text-white"
        >
          ← Back to Low Level Builds
        </Link>

        <div className="mt-8 mb-8">
          <h1 className="text-5xl font-semibold tracking-tight">{exp.name}</h1>
          <p className="mt-3 text-lg text-white/60">Pick a build.</p>
        </div>

        {builds.length ? (
          <div className="space-y-4">
            {builds.map((b) => {
              const title = b.title ?? b.name ?? b.id;
              const subtitle = b.subtitle ?? b.description ?? "";

              return (
                <Link
                  key={b.id}
                  href={`/low-level-builds/${encodeURIComponent(
                    String(exp.id)
                  )}/${encodeURIComponent(String(b.id))}`}
                  className="group block rounded-3xl border border-white/15 bg-white/[0.03] p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.05)] transition hover:border-white/25 hover:bg-white/[0.05]"
                >
                  <div className="flex items-center justify-between gap-6">
                    <div className="min-w-0">
                      <h2 className="text-2xl sm:text-3xl font-semibold leading-tight break-words">
  {title}
</h2>
                      {subtitle ? (
                        <p className="mt-1 text-base text-white/55">{subtitle}</p>
                      ) : null}
                    </div>

                    <div className="shrink-0 text-white/60">→</div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-white/60">No builds listed yet.</p>
        )}
      </div>
    </main>
  );
}