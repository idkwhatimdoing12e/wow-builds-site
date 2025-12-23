import Link from "next/link";
import { notFound } from "next/navigation";
import buildsData from "../../../data/builds.json";

type GearItem = {
  slot: string;
  itemName: string;
  itemId: number;
  iconName: string;
  enchant?: string;
};

type Build = {
  id: string;
  title?: string;
  name?: string;
  subtitle?: string;
  description?: string;
  notes?: string[];
  gear?: GearItem[];
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

function wowheadItemUrl(itemId: number) {
  return `https://www.wowhead.com/item=${itemId}`;
}

function wowIconUrl(iconName: string) {
  const safe = (iconName || "").trim().toLowerCase();
  return `https://wow.zamimg.com/images/wow/icons/large/${safe}.jpg`;
}

/**
 * Turns plain-text notes into React nodes, auto-linking any http(s) URLs.
 * Keeps everything safe: no HTML injection, just <a>.
 */
function renderNoteText(text: string) {
  const urlRegex = /(https?:\/\/[^\s)]+)(\))?/g;
  const parts: Array<string | { url: string; trailingParen: boolean }> = [];

  let lastIndex = 0;
  for (const match of text.matchAll(urlRegex)) {
    const url = match[1];
    const trailingParen = Boolean(match[2]);
    const idx = match.index ?? 0;

    if (idx > lastIndex) parts.push(text.slice(lastIndex, idx));
    parts.push({ url, trailingParen });

    lastIndex = idx + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));

  return (
    <>
      {parts.map((p, i) => {
        if (typeof p === "string") return <span key={i}>{p}</span>;

        return (
          <span key={i}>
            <a
              href={p.url}
              target="_blank"
              rel="noreferrer"
              className="underline decoration-white/30 underline-offset-4 hover:decoration-white/70 text-white"
            >
              {p.url}
            </a>
            {p.trailingParen ? ")" : ""}
          </span>
        );
      })}
    </>
  );
}

export default async function BuildPage({
  params,
}: {
  params: Promise<{ expansion: string; build: string }>;
}) {
  const { expansion, build } = await params;

  const expansions = data.expansions ?? [];
  const exp = expansions.find((e) => norm(e.id) === norm(expansion));
  if (!exp) notFound();

  const buildObj = (exp.builds ?? []).find((x) => norm(x.id) === norm(build));
  if (!buildObj) notFound();

  const title = buildObj.title ?? buildObj.name ?? buildObj.id;
  const subtitle = buildObj.subtitle ?? buildObj.description ?? "";
  const notes = Array.isArray(buildObj.notes) ? buildObj.notes : [];
  const gear: GearItem[] = Array.isArray(buildObj.gear) ? buildObj.gear : [];

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-5xl px-6 py-14">
        <Link
          href={`/low-level-builds/${encodeURIComponent(exp.id)}`}
          className="text-sm text-white/70 hover:text-white"
        >
          ← Back to {exp.name}
        </Link>

        <h1 className="mt-6 text-6xl font-semibold tracking-tight">{title}</h1>
        {subtitle ? <p className="mt-3 text-white/70">{subtitle}</p> : null}

        <section className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
          <h2 className="text-2xl font-semibold">Notes</h2>

          {notes.length ? (
            <ul className="mt-4 list-disc space-y-2 pl-6 text-white/75">
              {notes.map((n, i) => (
                <li key={i}>{renderNoteText(String(n))}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-white/60">No notes yet.</p>
          )}
        </section>

        <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
          <div className="flex items-end justify-between gap-6">
            <h2 className="text-2xl font-semibold">Gear</h2>
            <p className="text-sm text-white/50">
              Click an item to open Wowhead
            </p>
          </div>

          {gear.length ? (
            <div className="mt-5 divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
              {gear.map((g) => (
                <a
                  key={`${g.slot}-${g.itemId}`}
                  href={wowheadItemUrl(g.itemId)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-4 px-5 py-4 transition hover:bg-white/[0.04]"
                >
                  <div className="w-24 shrink-0 text-sm text-white/60">
                    {g.slot}
                  </div>

                  <img
                    src={wowIconUrl(g.iconName)}
                    alt={g.itemName}
                    className="h-10 w-10 rounded-xl border border-white/10 bg-white/[0.03]"
                    loading="lazy"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{g.itemName}</div>
                    {g.enchant ? (
                      <div className="mt-0.5 text-sm text-white/60">
                        {g.enchant}
                      </div>
                    ) : null}
                  </div>

                  <div className="text-white/40">↗</div>
                </a>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-white/60">No gear listed yet.</p>
          )}
        </section>
      </div>
    </main>
  );
}