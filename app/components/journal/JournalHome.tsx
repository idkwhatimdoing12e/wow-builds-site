"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { DungeonSummary } from "@/app/lib/journal";
import { LINKS } from "@/app/lib/site";
import Window from "./Window";

interface Props {
  dungeons: (DungeonSummary & { art: string | null; gradient: string })[];
  addonVersion: string;
}

export default function JournalHome({ dungeons, addonVersion }: Props) {
  const [q, setQ] = useState("");
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return dungeons;
    return dungeons.filter((d) => d.name.toLowerCase().includes(s) || d.location.toLowerCase().includes(s));
  }, [q, dungeons]);

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
          <span className="wf-round wf-round-active" title="WoW Forever">W</span>
          <span className="wf-round wf-round-off" title="TBC Anniversary — in the addon">W</span>
          <span className="wf-round wf-round-off wf-round-label" title="Raids open December 9">
            <span className="wf-skull" aria-hidden>☠</span>
            <span>RAIDS</span>
          </span>
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
            <span className="wf-card-quests">
              {d.previewOnly ? "opens at launch" : `${d.questCount} quests`}
            </span>
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
