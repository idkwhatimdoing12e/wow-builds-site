"use client";

import { setStoredFlag, useStoredFlag } from "./useStoredFlag";

export const FOREVER_ONLY_KEY = "dj-forever-only";

export interface EmblemText {
  foreverTitle: string;
  foreverTip: string;
  foreverOn: string;
  raidsTitle: string;
  comingSoon: string;
}

/**
 * The addon's top-left home emblems (Systems/ForeverFilter.lua):
 * - the WoW Forever emblem, with its soft gold halo; click it to show only the
 *   dungeons that are new in WoW Forever (brighter halo and a gold ring while on),
 *   click again to show every dungeon;
 * - the Raids medallion, greyed out until raids are added.
 */
export default function HomeEmblems({ text }: { text: EmblemText }) {
  const on = useStoredFlag(FOREVER_ONLY_KEY);
  return (
    <div className="wf-emblems">
      <button
        type="button"
        className={`wf-forever ${on ? "on" : ""}`}
        aria-pressed={on}
        aria-label={text.foreverTitle}
        onClick={() => setStoredFlag(FOREVER_ONLY_KEY, !on)}
      >
        <img className="wf-forever-halo" src="/journal/ui/forever-halo.png" alt="" width={64} height={64} />
        <img className="wf-forever-ring" src="/journal/ui/forever-ring.png" alt="" width={64} height={64} />
        <img className="wf-forever-icon" src="/journal/ui/forever-icon.png" alt="" width={64} height={64} />
        <span className="wf-tip" role="tooltip">
          <span className="wf-tip-title">{text.foreverTitle}</span>
          <span>{on ? text.foreverOn : text.foreverTip}</span>
        </span>
      </button>
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
