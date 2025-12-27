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

type BuffItem = {
  name: string;
  spellId: number;
  iconName: string;
  note?: string;
};

type ConsumableItem = {
  name: string;
  itemId: number;
  iconName: string;
  note?: string;
};

type Build = {
  id: string;
  title?: string;
  name?: string;
  subtitle?: string;
  description?: string;
  notes?: string[];
  gear?: GearItem[];

  // Optional overrides from builds.json
  buffs?: BuffItem[];
  seasonalBuffs?: BuffItem[];

  // Consumables from builds.json
  consumables?: ConsumableItem[];
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

function wowheadBase(expansionId: string) {
  const exp = norm(expansionId);

  // Default to Classic Era
  let base = "classic";
  if (exp === "tbc" || exp.includes("burning")) base = "tbc";
  else if (exp === "wotlk" || exp.includes("wrath")) base = "wotlk";
  else if (exp === "cata" || exp.includes("cataclysm")) base = "cata";
  else if (exp === "mop" || exp.includes("pandaria") || exp.includes("mists"))
    base = "mop";

  return `https://www.wowhead.com/${base}`;
}

function wowheadItemUrl(itemId: number, expansionId: string) {
  return `${wowheadBase(expansionId)}/item=${itemId}`;
}

function wowheadSpellUrl(spellId: number, expansionId: string) {
  return `${wowheadBase(expansionId)}/spell=${spellId}`;
}

function wowIconUrl(iconName: string) {
  const safe = (iconName || "").trim().toLowerCase();
  return `https://wow.zamimg.com/images/wow/icons/large/${safe}.jpg`;
}

// Defaults (used if builds.json has empty arrays)
const DEFAULT_WORLD_BUFFS: BuffItem[] = [
  {
    name: "Spirit of Zandalar (ZG)",
    spellId: 24425,
    iconName: "ability_creature_poison_05",
  },
  {
    name: "Rallying Cry of the Dragonslayer (Onyxia/Nefarian)",
    spellId: 22888,
    iconName: "inv_misc_head_dragon_01",
  },
  {
    name: "Warchief's Blessing",
    spellId: 16609,
    iconName: "spell_arcane_teleportorgrimmar",
    note: "Horde-only",
  },
];

const DEFAULT_SEASONAL_BUFFS: BuffItem[] = [
  {
    name: "Fire Festival Fortitude (Midsummer)",
    spellId: 29235,
    iconName: "inv_summerfest_firespirit",
    note: "+ Stamina",
  },
  {
    name: "Invocation of the Wickerman (Hallow's End)",
    spellId: 24705,
    iconName: "inv_waepon_bow_zulgrub_d_02",
    note: "+ Stamina / HP",
  },
];

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
              className="text-white underline decoration-white/30 underline-offset-4 hover:decoration-white/70"
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

function BuffColumn({
  title,
  items,
  expansionId,
}: {
  title: string;
  items: BuffItem[];
  expansionId: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="flex items-end justify-between gap-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className="text-xs text-white/45">Click to open Wowhead</span>
      </div>

      {items.length ? (
        <div className="mt-4 grid grid-cols-1 gap-2">
          {items.map((b) => (
            <a
              key={`${b.spellId}-${b.name}`}
              href={wowheadSpellUrl(b.spellId, expansionId)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 transition hover:bg-white/[0.04]"
            >
              <img
                src={wowIconUrl(b.iconName)}
                alt={b.name}
                className="h-9 w-9 shrink-0 rounded-lg border border-white/10 bg-white/[0.03]"
                loading="lazy"
              />

              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{b.name}</div>
                {b.note ? (
                  <div className="truncate text-xs text-white/55">{b.note}</div>
                ) : null}
              </div>

              <div className="text-white/40">↗</div>
            </a>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-white/60">No buffs listed yet.</p>
      )}
    </div>
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

  const buffs: BuffItem[] =
    Array.isArray(buildObj.buffs) && buildObj.buffs.length
      ? buildObj.buffs
      : DEFAULT_WORLD_BUFFS;

  const seasonalBuffs: BuffItem[] =
    Array.isArray(buildObj.seasonalBuffs) && buildObj.seasonalBuffs.length
      ? buildObj.seasonalBuffs
      : DEFAULT_SEASONAL_BUFFS;

  const consumables: ConsumableItem[] = Array.isArray(buildObj.consumables)
    ? buildObj.consumables
    : [];

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

        {/* BUFFS (above Gear like you wanted) */}
        <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
          <div className="flex items-end justify-between gap-6">
            <h2 className="text-2xl font-semibold">Buffs</h2>
            
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <BuffColumn title="World Buffs" items={buffs} expansionId={exp.id} />
            <BuffColumn
              title="Seasonal Buffs"
              items={seasonalBuffs}
              expansionId={exp.id}
            />
          </div>
        </section>

        {/* GEAR (tight layout) */}
        <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
          <div className="flex items-end justify-between gap-6">
            <h2 className="text-2xl font-semibold">Gear</h2>
            <p className="text-sm text-white/50">
              Click an item to open Wowhead
            </p>
          </div>

          {gear.length ? (
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 md:gap-3">
              {gear.map((g) => (
                <a
                  key={`${g.slot}-${g.itemId}`}
                  href={wowheadItemUrl(g.itemId, exp.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 transition hover:bg-white/[0.04]"
                >
                  <img
                    src={wowIconUrl(g.iconName)}
                    alt={g.itemName}
                    className="h-10 w-10 shrink-0 rounded-xl border border-white/10 bg-white/[0.03]"
                    loading="lazy"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-base font-medium leading-tight">
                      {g.itemName}
                    </div>

                    {g.enchant ? (
                      <div className="mt-1 truncate text-sm leading-tight text-white/60">
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

        {/* CONSUMABLES (reads from builds.json) */}
        <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
          <div className="flex items-end justify-between gap-6">
            <h2 className="text-2xl font-semibold">Consumables</h2>
            <p className="text-sm text-white/50">
              Click an item to open Wowhead
            </p>
          </div>

          {consumables.length ? (
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 md:gap-3">
              {consumables.map((c) => (
                <a
                  key={`${c.itemId}-${c.name}`}
                  href={wowheadItemUrl(c.itemId, exp.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 transition hover:bg-white/[0.04]"
                >
                  <img
                    src={wowIconUrl(c.iconName)}
                    alt={c.name}
                    className="h-10 w-10 shrink-0 rounded-xl border border-white/10 bg-white/[0.03]"
                    loading="lazy"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-base font-medium leading-tight">
                      {c.name}
                    </div>

                    {c.note ? (
                      <div className="mt-1 truncate text-sm leading-tight text-white/60">
                        {c.note}
                      </div>
                    ) : null}
                  </div>

                  <div className="text-white/40">↗</div>
                </a>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-white/60">No consumables listed yet.</p>
          )}
        </section>
      </div>
    </main>
  );
}