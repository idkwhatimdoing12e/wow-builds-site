import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/app/lib/site";
import Window from "@/app/components/journal/Window";
import ImportCharacter from "@/app/components/character/ImportCharacter";
import { buildCharacterIndex } from "@/app/lib/character-index";

export const metadata: Metadata = {
  title: "Your character",
  description:
    "Export with /dj export and publish your WoW Forever dungeon progress and Character Logs at a permanent character link.",
  alternates: { canonical: `${SITE_URL}/character` },
  // The import form is not a character profile; profiles live under /c/.
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
          {/* Built here, not in the client component: see character-index.ts. */}
          <ImportCharacter index={buildCharacterIndex()} />
        </div>
      </Window>
    </div>
  );
}
