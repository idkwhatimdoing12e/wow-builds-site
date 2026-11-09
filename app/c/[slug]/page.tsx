import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Window from "@/app/components/journal/Window";
import SharedCharacter, {
  type CharacterArt,
  type ItemArt,
} from "@/app/components/character/SharedCharacter";
import { getCharacter } from "@/app/lib/character-cache";
import { validSlug } from "@/app/lib/character-snapshot";
import { cardArt } from "@/app/lib/art";
import { getDungeon, slugify } from "@/app/lib/journal";
import { itemIconSrc, itemUrl } from "@/app/lib/items";
import { SITE_URL } from "@/app/lib/site";
import { CLASS_NAMES } from "@/app/lib/character";
export const revalidate = 3600;
type Props = { params: Promise<{ slug: string }> };
async function load(params: Props["params"]) {
  const { slug } = await params;
  if (!validSlug(slug)) notFound();
  const s = await getCharacter(slug);
  if (!s) notFound();
  return { s, slug };
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { s, slug } = await load(params);
  const title = `${s.name} · Level ${s.level} ${CLASS_NAMES[s.classToken] ?? s.classToken}`;
  const description = `${s.realm} · ${s.dungeons.filter((d) => d.cleared).length} dungeons cleared · ${s.runs.length} Character Logs`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/c/${encodeURIComponent(slug)}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/c/${encodeURIComponent(slug)}`,
      type: "profile",
      images: [
        {
          url: `${SITE_URL}/c/${encodeURIComponent(slug)}/opengraph-image`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}
export default async function Page({ params }: Props) {
  const { s } = await load(params);
  const art: CharacterArt = {};
  const items: ItemArt = {};
  for (const name of new Set([
    ...s.dungeons.map((d) => d.name),
    ...s.runs.map((r) => r.dungeon),
  ])) {
    const d = getDungeon(slugify(name));
    art[name] = { card: cardArt(name), bosses: {} };
    for (const b of d?.bosses ?? [])
      art[name].bosses[b.name] = {
        displayId: b.displayId,
        crop: b.portraitCrop,
        custom: b.customPortrait,
      };
  }
  for (const r of s.runs)
    for (const n of r.needs)
      items[n.id] = { icon: itemIconSrc(n.id), url: itemUrl(n.id) };
  return (
    <div className="journal wf-page">
      <Window>
        <SharedCharacter snapshot={s} art={art} items={items} />
      </Window>
    </div>
  );
}
