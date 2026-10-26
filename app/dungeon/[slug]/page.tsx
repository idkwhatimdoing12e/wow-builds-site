import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDungeon, getDungeonSlugs, getDungeonSummaries } from "@/app/lib/journal";
import { themeVars } from "@/app/lib/art";
import { SITE_NAME, SITE_URL } from "@/app/lib/site";
import Window from "@/app/components/journal/Window";
import DungeonView from "@/app/components/journal/DungeonView";
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

export default async function DungeonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = getDungeon(slug);
  if (!d) notFound();

  const all = getDungeonSummaries();
  const idx = all.findIndex((x) => x.slug === d.slug);
  const prev = idx > 0 ? { name: all[idx - 1].name, slug: all[idx - 1].slug } : null;
  const next = idx < all.length - 1 ? { name: all[idx + 1].name, slug: all[idx + 1].slug } : null;

  return (
    <div className="journal wf-page">
      <Window style={themeVars(d.name) as React.CSSProperties}>
        <DungeonView d={d} prev={prev} next={next} />
      </Window>
      <AdSlot />
    </div>
  );
}
