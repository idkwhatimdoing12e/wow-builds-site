"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { DungeonSummary } from "@/app/lib/journal";
import { LINKS } from "@/app/lib/site";
import Window from "./Window";
import { setFaction, useFaction } from "./useFaction";
import HomeEmblems, { FOREVER_ONLY_KEY, type EmblemText } from "./HomeEmblems";
import { useStoredFlag } from "./useStoredFlag";

interface Props {
  dungeons: (DungeonSummary & { art: string | null; gradient: string })[];
  addonVersion: string;
  emblemText: EmblemText;
}

export default function JournalHome({ dungeons, addonVersion, emblemText }: Props) {
  const [q, setQ] = useState("");
  const faction = useFaction();
  const crest = faction === "Horde" ? "/journal/horde.png" : "/journal/alliance.png";
  const foreverOnly = useStoredFlag(FOREVER_ONLY_KEY);
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return dungeons.filter(
      (d) =>
        (!foreverOnly || d.forever) &&
        (!s || d.name.toLowerCase().includes(s) || d.location.toLowerCase().includes(s)),
    );
  }, [q, dungeons, foreverOnly]);

  const search = (
    <label className="wf-search">
      <span className="wf-search-icon" aria-hidden>⌕</span>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search for Dungeons, Items..."
        aria-label="Search dungeons"
      />
    </label>
  );

  return (
    <Window search={search}>
      <div className="wf-toolbar">
        <div className="wf-tabs-round">
          <HomeEmblems text={emblemText} />
        </div>
        <div className="wf-faction-pick" role="group" aria-label="Count quests for">
          {(["Alliance", "Horde"] as const).map((f) => (
            <button
              key={f}
              type="button"
              className={faction === f ? "on" : ""}
              aria-pressed={faction === f}
              title={`Show ${f} quest counts`}
              onClick={() => setFaction(f)}
            >
              <img src={f === "Horde" ? "/journal/horde.png" : "/journal/alliance.png"} alt={f} width={30} height={30} />
            </button>
          ))}
        </div>
        <div className="wf-toolbar-right">
          <a href={LINKS.curseforge} target="_blank" rel="noreferrer noopener" className="wf-btn wf-btn-dark">Download the addon</a>
          <a href={LINKS.patreon} target="_blank" rel="noreferrer noopener" className="wf-btn wf-btn-dark">Support on Patreon</a>
        </div>
      </div>

      <div className="wf-grid">
        {shown.map((d) => (
          <Link
            key={d.slug}
            href={`/dungeon/${d.slug}`}
            className={`wf-card ${d.previewOnly ? "wf-card-preview" : ""}`}
            style={d.art ? { backgroundImage: `url(${d.art})` } : { backgroundImage: d.gradient }}
          >
            <span className="wf-card-name">{d.name}</span>
            {d.previewOnly ? (
              <span className="wf-card-soon">Coming Soon</span>
            ) : (
              <span className="wf-card-quests">
                <img src={crest} alt={faction} width={22} height={22} />
                {d.questsByFaction[faction]} {d.questsByFaction[faction] === 1 ? "quest" : "quests"}
              </span>
            )}
            <span className="wf-card-level">LV {d.level}</span>
          </Link>
        ))}
        {shown.length === 0 && <p className="wf-empty">No dungeon matches “{q}”.</p>}
      </div>

      <p className="wf-foot">
        Web version of the Dungeon Journal addon v{addonVersion} for WoW Forever · <code>/dj</code> in game ·
        every quest, boss and drop below comes straight from the addon&apos;s data.
      </p>
    </Window>
  );
}
