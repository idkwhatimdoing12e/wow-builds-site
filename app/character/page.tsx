import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/app/lib/site";
import Window from "@/app/components/journal/Window";
import CharacterPanel from "@/app/components/character/CharacterPanel";

export const metadata: Metadata = {
  title: "Your character",
  description:
    "Bring your WoW Forever character into the journal: export from the addon with /dj export and see which dungeon quests you have finished.",
  alternates: { canonical: `${SITE_URL}/character` },
  // The page is only ever useful with a code in the fragment, and the fragment
  // is a character, not a document: nothing here is worth a search result.
  robots: { index: false, follow: true },
};

export default function CharacterPage() {
  return (
    <div className="journal wf-page">
      <Window>
        <div className="wf-crumb">
          <Link href="/" className="wf-btn wf-btn-red wf-btn-sm">Dungeons</Link>
        </div>
        <div className="wf-pane wf-pane-single wf-pane-parchment">
          <CharacterPanel />
        </div>
      </Window>
    </div>
  );
}
