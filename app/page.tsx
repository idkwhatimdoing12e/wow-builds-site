import type { Metadata } from "next";
import { readdirSync } from "node:fs";
import path from "node:path";
import { getDungeonSummaries, uiLabel } from "@/app/lib/journal";
import { cardArt, cardGradient } from "@/app/lib/art";
import { SITE_URL } from "@/app/lib/site";
import JournalHome from "@/app/components/journal/JournalHome";
import HomeHero, { DownloadBanner } from "@/app/components/site/HomeHero";

// Every other page declares its canonical; the home page did not, which left
// the site's most linked page without one.
export const metadata: Metadata = {
  alternates: { canonical: SITE_URL },
  openGraph: { url: SITE_URL },
};

// Dungeons with a map: one set of floor images per dungeon in public/journal/maps.
function countMappedDungeons(): number {
  const files = readdirSync(path.join(process.cwd(), "public", "journal", "maps"));
  return new Set(files.filter((f) => f.endsWith(".webp")).map((f) => f.replace(/-\d+\.webp$/, ""))).size;
}

export default function HomePage() {
  const dungeons = getDungeonSummaries().map((d) => ({
    ...d,
    art: cardArt(d.name),
    gradient: cardGradient(d.name),
  }));
  // The contents list strictly by level; the grid keeps the addon's own order.
  const contents = [...dungeons]
    .sort((a, b) => a.minLevel - b.minLevel)
    .map(({ slug, name, level, location, forever, previewOnly, art }) => ({ slug, name, level, location, forever, previewOnly, art }));
  return (
    <div className="sx-home">
      <HomeHero dungeons={contents} mapCount={countMappedDungeons()} />
      <JournalHome
        dungeons={dungeons}
        emblemText={{
          foreverTitle: uiLabel("FOREVER_FILTER_TITLE", "WoW Forever Dungeons"),
          foreverTip: uiLabel("FOREVER_FILTER_TIP", "Click to show only the dungeons that are new in WoW Forever."),
          foreverOn: uiLabel("FOREVER_FILTER_ON", "Showing only WoW Forever dungeons. Click to show all dungeons again."),
          raidsTitle: uiLabel("RAIDS_TITLE", "Raids"),
          comingSoon: uiLabel("COMING_SOON", "Coming Soon"),
        }}
      />
      <DownloadBanner />
    </div>
  );
}
