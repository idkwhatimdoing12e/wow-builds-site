import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { getItemById, getItemSlugs, itemTip, type ItemEntry, type ItemSource } from "@/app/lib/item-index";
import { QUALITY_COLORS } from "@/app/lib/journal";
import { themeVars } from "@/app/lib/art";
import { SITE_NAME, SITE_URL } from "@/app/lib/site";
import Window from "@/app/components/journal/Window";
import AdSlot from "@/app/components/journal/AdSlot";
import ItemTooltipBody from "@/app/components/journal/ItemTooltipBody";
import BackLink from "@/app/components/site/BackLink";

export function generateStaticParams() {
  return getItemSlugs().map((slug) => ({ slug }));
}

/** An old or differently spelled name still lands on the item: the ID decides. */
function resolve(slug: string): ItemEntry | null {
  const id = parseInt(slug.split("-")[0], 10);
  if (!id) return null;
  const item = getItemById(id);
  if (!item) return null;
  if (item.slug !== slug) permanentRedirect(`/item/${item.slug}`);
  return item;
}

const DROP_KINDS = new Set(["drop", "shared", "recipe", "trash"]);
const REWARD_KINDS = new Set(["reward", "choice", "also", "later"]);

function where(s: ItemSource): string {
  return s.boss?.name === "Trash" ? `/dungeon/${s.dungeon.slug}#trash` : `/dungeon/${s.dungeon.slug}#boss-${s.boss?.index ?? 0}`;
}

/** One line of the drop sources, a sentence a reader can follow. */
function sourceLine(s: ItemSource): string {
  if (s.kind === "trash") return s.note ? `Trash: ${s.note}` : "Trash mobs";
  if (s.kind === "shared") return `${s.boss?.name}, from a loot table shared with other bosses`;
  return s.boss?.name ?? "";
}

const REWARD_TAG: Record<string, string> = {
  reward: "Reward",
  choice: "Choose one",
  also: "Also rewarded",
  later: "Later in the chain",
};
const USE_TAG: Record<string, string> = {
  starts: "Starts the quest",
  needed: "Needed for the quest",
  provided: "Given by the quest",
};

/** "Horde", "Alliance", or nothing for a quest both sides can do. */
function side(s: ItemSource): string {
  const f = s.quest?.faction;
  return f === "Horde" || f === "Alliance" ? `${f} · ` : "";
}

function QuestName({ s }: { s: ItemSource }) {
  return s.quest?.slug ? (
    <Link href={`/quest/${s.quest.slug}`} className="wp-link">{s.quest.name}</Link>
  ) : (
    <span>{s.quest?.name}</span>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const id = parseInt(slug.split("-")[0], 10);
  const item = id ? getItemById(id) : null;
  if (!item) return {};
  const kind = [item.qualityName, item.slot].filter(Boolean).join(" ");
  const title = `${item.name}${kind ? ` - ${kind}` : ""}`;
  const source = itemTip(item).source;
  const description = `${item.name}, a WoW Forever item.${source ? ` ${source}.` : ""}`.slice(0, 160);
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/item/${item.slug}` },
    openGraph: { title: `${title} - ${SITE_NAME}`, description, url: `${SITE_URL}/item/${item.slug}` },
  };
}

export default async function ItemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = resolve(slug);
  if (!item) notFound();

  const color = QUALITY_COLORS[item.quality] ?? QUALITY_COLORS[1];
  const tip = itemTip(item);
  const drops = item.sources.filter((s) => DROP_KINDS.has(s.kind));
  const rewards = item.sources.filter((s) => REWARD_KINDS.has(s.kind));
  const uses = item.sources.filter((s) => s.kind in USE_TAG);
  const home = item.sources[0].dungeon;
  const extra = item.extra;

  return (
    <div className="journal wf-page">
      <Window style={themeVars(home.name) as React.CSSProperties}>
        {/* back to the boss or quest the reader came from */}
        <BackLink fallback={`/dungeon/${home.slug}`} />
        <div className="wf-crumb">
          <Link href="/" className="wf-btn wf-btn-red wf-btn-sm">Dungeons</Link>
          <Link href={`/dungeon/${home.slug}`} className="wf-btn wf-btn-red wf-btn-sm">{home.name}</Link>
        </div>
        <div className="wf-pane wf-pane-single wf-pane-parchment">
          <div className="wp it">
            {/* The game's tooltip, with the icon beside it. The source line is
                left out here: the sections below say it in full. */}
            <div className="it-top">
              <span className="it-icon" style={{ borderColor: color }}>
                <img src={item.icon} alt="" width={56} height={56} />
              </span>
              <div className="it-tip">
                <ItemTooltipBody t={{ ...tip, source: undefined }} heading />
              </div>
            </div>

            {drops.length > 0 && (
              <section>
                <h2 className="wp-rewards-head">Drops from</h2>
                <ul className="it-list">
                  {drops.map((s, i) => (
                    <li key={i}>
                      <Link href={where(s)} className="wp-link">{sourceLine(s)}</Link>
                      <span className="it-where">{s.dungeon.name}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {rewards.length > 0 && (
              <section>
                <h2 className="wp-rewards-head">Quest reward</h2>
                <ul className="it-list">
                  {rewards.map((s, i) => (
                    <li key={i}>
                      <QuestName s={s} />
                      <span className="it-where">
                        {side(s)}
                        {REWARD_TAG[s.kind]}
                        {s.note ? ` · ${s.note}` : ""} · {s.dungeon.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {uses.length > 0 && (
              <section>
                <h2 className="wp-rewards-head">Used in quests</h2>
                <ul className="it-list">
                  {uses.map((s, i) => (
                    <li key={i}>
                      <QuestName s={s} />
                      <span className="it-where">
                        {side(s)}
                        {USE_TAG[s.kind]} · {s.dungeon.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {extra && ((extra.notes?.length ?? 0) > 0 || (extra.links?.length ?? 0) > 0) && (
              <section className="it-notes">
                <h2 className="wp-rewards-head">Notes</h2>
                {(extra.notes ?? []).map((p, i) => (
                  <p key={i} className="wp-text">{p}</p>
                ))}
                {(extra.links ?? []).length > 0 && (
                  <ul className="it-list">
                    {(extra.links ?? []).map((l) => (
                      <li key={l.url}>
                        <a href={l.url} target="_blank" rel="noreferrer noopener" className="wp-link">{l.label}</a>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}
          </div>
        </div>
      </Window>
      <AdSlot />
    </div>
  );
}
