import { getDungeonSummaries, journalMeta } from "@/app/lib/journal";
import { cardArt, cardGradient } from "@/app/lib/art";
import JournalHome from "@/app/components/journal/JournalHome";

export default function HomePage() {
  const dungeons = getDungeonSummaries().map((d) => ({
    ...d,
    art: cardArt(d.name),
    gradient: cardGradient(d.name),
  }));
  return (
    <div className="journal wf-page">
      <JournalHome dungeons={dungeons} addonVersion={journalMeta.addonVersion} />
    </div>
  );
}
