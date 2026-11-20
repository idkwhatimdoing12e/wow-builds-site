// /dungeon-data/<slug>: one dungeon's journal data (map, bosses and loot,
// quests) as a static file, written at build time, with the dungeon page's
// skin (its theme colours and header art). The character page loads it when a
// dungeon card is opened, to show the dungeon's window as the addon does,
// without carrying the whole journal.
import { getDungeonSlugs, getDungeonSummaries } from "@/app/lib/journal";
import { getLocalizedDungeon } from "@/app/lib/i18n-server";
import { bandArt, themeVars } from "@/app/lib/art";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getDungeonSlugs().map((slug) => ({ slug }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = getLocalizedDungeon(slug, "en");
  if (!d) return new Response("Not found", { status: 404 });
  const english = getDungeonSummaries().find((s) => s.slug === slug)?.name ?? d.name;
  const band = bandArt(english);
  const skin = { ...themeVars(english), ...(band ? { "--ej-band": `url("${band}")` } : {}) };
  return Response.json({ ...d, skin });
}
