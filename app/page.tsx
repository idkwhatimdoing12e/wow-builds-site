import { getDungeonSummaries, journalMeta, uiLabel } from "@/app/lib/journal";
import { cardArt, cardGradient } from "@/app/lib/art";
import JournalHome from "@/app/components/journal/JournalHome";
import HomeHero, { DownloadBanner } from "@/app/components/site/HomeHero";

export default function HomePage() {
  const dungeons = getDungeonSummaries().map((d) => ({
    ...d,
    art: cardArt(d.name),
    gradient: cardGradient(d.name),
  }));
  return (
    <div className="sx-home">
      <HomeHero />
      <h2 className="sx-section-title" id="dungeons">Select your dungeon</h2>
      <div className="journal wf-page">
      <JournalHome
        dungeons={dungeons}
        addonVersion={journalMeta.addonVersion}
        emblemText={{
          foreverTitle: uiLabel("FOREVER_FILTER_TITLE", "WoW Forever Dungeons"),
          foreverTip: uiLabel("FOREVER_FILTER_TIP", "Click to show only the dungeons that are new in WoW Forever."),
          foreverOn: uiLabel("FOREVER_FILTER_ON", "Showing only WoW Forever dungeons. Click to show all dungeons again."),
          raidsTitle: uiLabel("RAIDS_TITLE", "Raids"),
          comingSoon: uiLabel("COMING_SOON", "Coming Soon"),
        }}
      />
      </div>
      <DownloadBanner />
    </div>
  );
}
