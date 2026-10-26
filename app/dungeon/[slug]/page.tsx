import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDungeon, getDungeonSlugs, getDungeonSummaries, type Boss, type LootTuple, type Quest } from "@/app/lib/journal";
import { SITE_NAME, SITE_URL } from "@/app/lib/site";
import ItemLink from "@/app/components/journal/ItemLink";
import { ClassBadge, FactionBadge, Pill } from "@/app/components/journal/Badges";
import AdSlot from "@/app/components/journal/AdSlot";

export const dynamicParams = false;

export function generateStaticParams() {
  return getDungeonSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const d = getDungeon(slug);
  if (!d) return {};
  const title = `${d.name} quests & loot (${d.level})`;
  const description = d.previewOnly
    ? `${d.name}, a WoW Forever dungeon in ${d.location}: ${d.description}`
    : `${d.questCount} quests, ${d.bossCount} bosses and every drop in ${d.name} (${d.location}, level ${d.level}) for WoW Forever.`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/dungeon/${d.slug}` },
    openGraph: { title: `${title} — ${SITE_NAME}`, description, url: `${SITE_URL}/dungeon/${d.slug}` },
  };
}

function LootRow({ item, note }: { item: LootTuple; note?: string }) {
  const [id, name, slot, quality] = item;
  return (
    <li className="flex items-baseline justify-between gap-3 py-1.5 border-b border-white/5 last:border-0">
      <span className="min-w-0">
        <ItemLink id={id} name={name} quality={quality} />
        {note && <span className="ml-2 text-xs text-white/40">{note}</span>}
      </span>
      <span className="shrink-0 text-xs text-white/45">{slot}</span>
    </li>
  );
}

function BossCard({ boss }: { boss: Boss }) {
  return (
    <article id={`boss-${encodeURIComponent(boss.name.toLowerCase().replace(/\s+/g, "-"))}`} className="card scroll-mt-24">
      <header className="flex flex-wrap items-center gap-2">
        <h3 className="text-lg font-semibold">{boss.name}</h3>
        {boss.level && <span className="lvl">lvl {boss.level}</span>}
        {boss.rare && <Pill tone="gold">Rare</Pill>}
        {boss.factionOnly && <Pill tone="warn">{boss.factionOnly} only</Pill>}
      </header>
      {boss.description && <p className="mt-1 text-sm text-white/60">{boss.description}</p>}

      {boss.loot.length > 0 ? (
        <ul className="mt-3">
          {boss.loot.map((it) => (
            <LootRow key={it[0]} item={it} />
          ))}
          {boss.shared.map((it) => (
            <LootRow key={`s${it[0]}`} item={it} note="shared drop" />
          ))}
        </ul>
      ) : (
        boss.shared.length > 0 && (
          <ul className="mt-3">
            {boss.shared.map((it) => (
              <LootRow key={`s${it[0]}`} item={it} note="shared drop" />
            ))}
          </ul>
        )
      )}

      {boss.recipes.length > 0 && (
        <details className="mt-3 group">
          <summary className="cursor-pointer text-sm text-white/55 hover:text-white select-none">
            Recipes &amp; Patterns ({boss.recipes.length})
          </summary>
          <ul className="mt-1 pl-1">
            {boss.recipes.map((it) => (
              <LootRow key={it[0]} item={it} />
            ))}
          </ul>
        </details>
      )}
    </article>
  );
}

function QuestRow({ q }: { q: Quest }) {
  return (
    <li>
      <Link href={`/quest/${q.slug}`} className="card card-row block">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-base font-semibold">{q.name}</span>
          <span className="lvl">{q.level}</span>
          <FactionBadge faction={q.faction} />
          <ClassBadge cls={q.classOnly} />
          {q.chain.length > 0 && <Pill tone="neutral">Chain · {q.chain.length + 1} steps</Pill>}
          {q.startsInDungeon && <Pill tone="gold">Starts inside</Pill>}
          {q.repeatable && <Pill tone="muted">Repeatable</Pill>}
        </div>
        <p className="mt-1 text-sm text-white/60 line-clamp-2">{q.objective}</p>
        {q.rewardItems.length > 0 && (
          <p className="mt-2 text-xs text-white/50">
            {q.rewardChoice ? "Choose: " : "Rewards: "}
            {q.rewardItems.map(([id, name, quality], i) => (
              <span key={id}>
                {i > 0 && ", "}
                <ItemLink id={id} name={name} quality={quality} />
              </span>
            ))}
          </p>
        )}
      </Link>
    </li>
  );
}

export default async function DungeonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = getDungeon(slug);
  if (!d) notFound();

  const all = getDungeonSummaries();
  const idx = all.findIndex((x) => x.slug === d.slug);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx < all.length - 1 ? all[idx + 1] : null;

  return (
    <div className="journal mx-auto max-w-5xl px-6 pt-24 pb-20">
      <nav className="text-sm text-white/45">
        <Link href="/" className="hover:text-white">Dungeons</Link> <span className="mx-1">/</span> {d.name}
      </nav>

      <header className="mt-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="display text-4xl">{d.name}</h1>
          <span className="lvl text-sm">level {d.level}</span>
          {d.previewOnly && <Pill tone="gold">Opens at launch</Pill>}
        </div>
        <p className="mt-2 text-white/55">{d.location}</p>
        <p className="mt-3 max-w-3xl text-white/75">{d.description}</p>
        {d.entrance?.detail && (
          <p className="mt-3 text-sm text-white/55">
            <span className="text-white/80 font-medium">Entrance:</span> {d.entrance.detail}
          </p>
        )}
        {d.fullItemsTBD && (
          <p className="mt-3 text-sm text-amber-300/80">Loot lists for this dungeon are still being completed in the addon; what&apos;s shown is verified.</p>
        )}
      </header>

      {!d.previewOnly && (
        <>
          <section className="mt-10">
            <h2 className="display text-2xl">Quests <span className="text-white/35 text-base font-normal">({d.quests.length})</span></h2>
            <ul className="mt-4 space-y-2">
              {d.quests.map((q) => (
                <QuestRow key={q.id} q={q} />
              ))}
            </ul>
          </section>

          <AdSlot />

          <section className="mt-10">
            <h2 className="display text-2xl">Bosses <span className="text-white/35 text-base font-normal">({d.bosses.length})</span></h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {d.bosses.map((b) => (
                <BossCard key={b.name} boss={b} />
              ))}
            </div>
          </section>

          {d.trash.length > 0 && (
            <section className="mt-10">
              <h2 className="display text-2xl">Trash drops</h2>
              <ul className="card mt-4">
                {d.trash.map(({ item, source }) => (
                  <LootRow key={item[0]} item={item} note={source} />
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      <nav className="mt-14 flex justify-between text-sm">
        {prev ? (
          <Link href={`/dungeon/${prev.slug}`} className="hover:text-white text-white/55">← {prev.name}</Link>
        ) : <span />}
        {next ? (
          <Link href={`/dungeon/${next.slug}`} className="hover:text-white text-white/55">{next.name} →</Link>
        ) : <span />}
      </nav>
    </div>
  );
}
