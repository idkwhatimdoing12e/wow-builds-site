import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDungeon, getDungeonSlugs, getDungeonSummaries } from "@/app/lib/journal";
import { bandArt, themeVars } from "@/app/lib/art";
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

  // The game's Encounter Journal skin (.ej): the layout is unchanged, only the
  // look. --ej-band is the picture behind the dungeon's header band.
  const band = bandArt(d.name);
  const style = {
    ...themeVars(d.name),
    ...(band ? { "--ej-band": `url("${band}")` } : {}),
  } as React.CSSProperties;

  return (
    <div className="journal wf-page ej">
      <Window style={style}>
        <DungeonView d={d} prev={prev} next={next} />
      </Window>
      <AdSlot />
    </div>
  );
}
