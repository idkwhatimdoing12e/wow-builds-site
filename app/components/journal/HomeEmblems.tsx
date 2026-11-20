"use client";

import Link from "next/link";
import { useHref } from "@/app/components/i18n/I18n";

export interface EmblemText {
  dungeonsTitle: string;
  raidsTitle: string;
  comingSoon: string;
}

/**
 * The addon's top-left home emblems (Systems/ForeverFilter.lua, 2.1.0):
 * - the WoW Forever emblem is the dungeon list's tab: it opens the list of
 *   dungeons, with its soft gold halo so it reads as clickable;
 * - the Raids medallion, greyed out until raids are added.
 */
export default function HomeEmblems({ text }: { text: EmblemText }) {
  const h = useHref();
  return (
    <div className="wf-emblems">
      <Link href={h("/#dungeons")} className="wf-forever on" aria-current="page" aria-label={text.dungeonsTitle}>
        <img className="wf-forever-halo" src="/journal/ui/forever-halo.png" alt="" width={128} height={128} />
        <img className="wf-forever-ring" src="/journal/ui/forever-ring.png" alt="" width={128} height={128} />
        <img className="wf-forever-icon" src="/journal/ui/forever-icon.png" alt="" width={64} height={64} />
        <span className="wf-tip" role="tooltip">
          <span className="wf-tip-title">{text.dungeonsTitle}</span>
        </span>
      </Link>
      <span className="wf-raids" tabIndex={0} aria-label={`${text.raidsTitle}: ${text.comingSoon}`}>
        <img src="/journal/ui/raid-icon.png" alt="" width={128} height={128} />
        <span className="wf-tip" role="tooltip">
          <span className="wf-tip-title">{text.raidsTitle}</span>
          <span>{text.comingSoon}</span>
        </span>
      </span>
    </div>
  );
}
