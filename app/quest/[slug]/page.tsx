import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getQuestBySlug, getQuestSlugs, type ItemRef, type RewardTuple } from "@/app/lib/journal";
import { SITE_NAME, SITE_URL } from "@/app/lib/site";
import ItemLink from "@/app/components/journal/ItemLink";
import { ClassBadge, FactionBadge, Pill } from "@/app/components/journal/Badges";
import AdSlot from "@/app/components/journal/AdSlot";

export const dynamicParams = false;

export function generateStaticParams() {
  return getQuestSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = getQuestBySlug(slug);
  if (!page) return {};
  const { quest } = page;
  const where = page.dungeons.map((d) => d.name).join(" / ");
  const title = `${quest.name} — ${where} quest (level ${quest.level})`;
  const description = `${quest.objective} Pick up: ${quest.pickup}. Turn in: ${quest.turnin}.`.slice(0, 160);
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/quest/${quest.slug}` },
    openGraph: { title: `${title} — ${SITE_NAME}`, description, url: `${SITE_URL}/quest/${quest.slug}` },
  };
}

function RewardList({ items, header }: { items: RewardTuple[]; header: string }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-3">
      <p className="text-xs uppercase tracking-wide text-white/45">{header}</p>
      <ul className="mt-1 space-y-1">
        {items.map(([id, name, quality, note]) => (
          <li key={id}>
            <ItemLink id={id} name={name} quality={quality} />
            {note && <span className="ml-2 text-xs text-white/40">{note}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ItemRefLine({ label, item }: { label: string; item?: ItemRef }) {
  if (!item) return null;
  const [id, name, quality, source] = item;
  return (
    <p className="mt-2 text-sm">
      <span className="text-white/50">{label}: </span>
      <ItemLink id={id} name={name} quality={quality} />
      {source && <span className="ml-2 text-white/45">— {source}</span>}
    </p>
  );
}

export default async function QuestPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getQuestBySlug(slug);
  if (!page) notFound();
  const { quest: q, dungeons } = page;

  return (
    <div className="journal mx-auto max-w-3xl px-6 pt-24 pb-20">
      <nav className="text-sm text-white/45">
        <Link href="/" className="hover:text-white">Dungeons</Link>
        <span className="mx-1">/</span>
        <Link href={`/dungeon/${dungeons[0].slug}`} className="hover:text-white">{dungeons[0].name}</Link>
        <span className="mx-1">/</span> {q.name}
      </nav>

      <header className="mt-3">
        <h1 className="display text-4xl">{q.name}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="lvl">level {q.level}</span>
          <Pill tone="muted">requires {q.requires}</Pill>
          <FactionBadge faction={q.faction} />
          <ClassBadge cls={q.classOnly} />
          {q.startsInDungeon && <Pill tone="gold">Starts inside the dungeon</Pill>}
          {q.repeatable && <Pill tone="muted">Repeatable</Pill>}
          {q.attunement && <Pill tone="gold">{q.attunement.charAt(0) + q.attunement.slice(1).toLowerCase()} attunement</Pill>}
          {q.profession && <Pill tone="neutral">{q.profession.charAt(0) + q.profession.slice(1).toLowerCase()}</Pill>}
        </div>
        {dungeons.length > 1 && (
          <p className="mt-3 text-sm text-white/55">
            Appears in: {dungeons.map((d, i) => (
              <span key={d.slug}>
                {i > 0 && ", "}
                <Link href={`/dungeon/${d.slug}`} className="underline underline-offset-2 hover:text-white">{d.name}</Link>
              </span>
            ))}
          </p>
        )}
      </header>

      {q.warning && <p className="mt-6 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">{q.warning}</p>}

      <section className="card mt-6">
        <h2 className="section-title">Objective</h2>
        <p className="mt-1 text-white/85">{q.objective}</p>
      </section>

      <section className="card mt-3">
        <h2 className="section-title">Where to get it</h2>
        <p className="mt-1 text-white/85">{q.pickup}</p>
        {q.startMap?.detail && <p className="mt-1 text-sm text-white/55">{q.startMap.detail}</p>}
        <ItemRefLine label="Started by item" item={q.startItem} />
        {q.startObject && (
          <p className="mt-2 text-sm">
            <span className="text-white/50">Started by object: </span>
            <span className="text-white/85">{q.startObject[0]}</span>
            <span className="ml-2 text-white/45">— {q.startObject[2]}</span>
          </p>
        )}
        <ItemRefLine label="You will need" item={q.noteItem} />
        {q.requiredItems.map((it) => (
          <ItemRefLine key={it[0]} label="Required" item={it} />
        ))}
        <ItemRefLine label="Provided" item={q.providedItem} />
        <p className="mt-3 text-sm">
          <span className="text-white/50">Turn in: </span>
          <span className="text-white/85">{q.turnin}</span>
        </p>
      </section>

      <section className="card mt-3">
        <h2 className="section-title">{q.rewardHeader ?? "Rewards"}</h2>
        {q.rewardsText && q.rewardItems.length === 0 ? (
          <p className="mt-1 whitespace-pre-line text-white/85">{q.rewardsText}</p>
        ) : (
          <>
            <RewardList items={q.rewardItems} header={q.rewardChoice ? "Choose one" : "You receive"} />
            <RewardList items={q.additionalRewardItems} header="Also" />
            <RewardList items={q.noteRewardItems} header="Later in the chain" />
          </>
        )}
        <p className="mt-3 text-sm text-white/60">
          {q.xp !== undefined && <span className="mr-3">{q.xp.toLocaleString("en-US")} XP</span>}
          {q.rewardSummary}
        </p>
      </section>

      {q.note && (
        <section className="card mt-3">
          <h2 className="section-title">Notes</h2>
          <p className="mt-1 text-white/80 whitespace-pre-line">{q.note}</p>
        </section>
      )}

      {q.chain.length > 0 && (
        <section className="mt-8">
          <h2 className="display text-2xl">Quest chain</h2>
          <p className="mt-1 text-sm text-white/50">Complete these first; <strong className="text-white/80">{q.name}</strong> is the final step.</p>
          <ol className="mt-4 space-y-2">
            {q.chain.map((s, i) => (
              <li key={`${s.id}-${i}`} className="card card-row">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="step">{i + 1}</span>
                  {s.slug ? (
                    <Link href={`/quest/${s.slug}`} className="font-semibold hover:underline underline-offset-2">{s.name}</Link>
                  ) : (
                    <span className="font-semibold">{s.name}</span>
                  )}
                  {s.detail?.level && <span className="lvl">{s.detail.level}</span>}
                </div>
                {s.detail?.objective && <p className="mt-1 text-sm text-white/65">{s.detail.objective}</p>}
                {s.detail?.pickup && (
                  <p className="mt-1 text-xs text-white/45">
                    Pick up: {s.detail.pickup}
                    {s.detail.turnin && s.detail.turnin !== s.detail.pickup && <> · Turn in: {s.detail.turnin}</>}
                  </p>
                )}
                {s.detail?.note && <p className="mt-1 text-xs text-white/45">{s.detail.note}</p>}
              </li>
            ))}
            <li className="card card-row border-[color:var(--gold)]/40">
              <div className="flex items-center gap-2">
                <span className="step step-final">{q.chain.length + 1}</span>
                <span className="font-semibold">{q.name}</span>
                <span className="lvl">{q.level}</span>
              </div>
            </li>
          </ol>
        </section>
      )}

      {q.related.length > 0 && (
        <section className="mt-8">
          <h2 className="section-title">Related</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {q.related.map((r) => (
              <li key={`${r.label}-${r.id}`}>
                <span className="text-white/50">{r.label}: </span>
                {r.slug ? (
                  <Link href={`/quest/${r.slug}`} className="underline underline-offset-2 hover:text-white">{r.name}</Link>
                ) : (
                  <span>{r.name}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <AdSlot />

      <p className="mt-6 text-sm text-white/45">
        ← Back to <Link href={`/dungeon/${dungeons[0].slug}`} className="underline underline-offset-2 hover:text-white">{dungeons[0].name}</Link>
      </p>
    </div>
  );
}
