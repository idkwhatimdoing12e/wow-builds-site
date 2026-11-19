"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { DungeonSummary } from "@/app/lib/journal";
import { LINKS } from "@/app/lib/site";
import { setFaction, useFaction } from "./useFaction";
import HomeEmblems, { FOREVER_ONLY_KEY, type EmblemText } from "./HomeEmblems";
import { useStoredFlag } from "./useStoredFlag";

interface Props {
  dungeons: (DungeonSummary & { art: string | null; gradient: string })[];
  emblemText: EmblemText;
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5 21 21" />
    </svg>
  );
}

/**
 * The addon's home window on the web: search and title in the bar, the
 * emblems, faction choice and the download in the toolbar, then the dungeons as
 * wide painted strips with their name, quest count and level on the art,
 * the way the addon draws them.
 */
export default function JournalHome({ dungeons, emblemText }: Props) {
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

  return (
    <section className="jw" id="dungeons" aria-labelledby="jw-title">
      <div className="jw-bar">
        <label className="jw-search">
          <SearchIcon />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search for dungeons or zones"
            aria-label="Search dungeons"
          />
        </label>
        <h2 id="jw-title" className="jw-title">Dungeon Journal</h2>
        <span className="jw-bar-end" />
      </div>

      <div className="jw-toolbar">
        <HomeEmblems text={emblemText} />
        <div className="jw-faction" role="group" aria-label="Count quests for">
          {(["Alliance", "Horde"] as const).map((f) => (
            <button
              key={f}
              type="button"
              className={faction === f ? "on" : ""}
              aria-pressed={faction === f}
              aria-label={`Count ${f} quests`}
              title={`Count ${f} quests`}
              onClick={() => setFaction(f)}
            >
              <img src={f === "Horde" ? "/journal/horde.png" : "/journal/alliance.png"} alt="" width={26} height={26} />
            </button>
          ))}
        </div>
        <div className="jw-toolbar-end">
          <a href={LINKS.curseforge} target="_blank" rel="noreferrer noopener" className="jw-btn">Download the addon</a>
        </div>
      </div>

      <ul className="jw-grid">
        {shown.map((d) => (
          <li key={d.slug}>
            <Link
              href={`/dungeon/${d.slug}`}
              className={`jw-card ${d.previewOnly ? "jw-card-soon" : ""}`}
              style={d.art ? { backgroundImage: `url(${d.art})` } : { backgroundImage: d.gradient }}
            >
              <span className="jw-card-name">{d.name}</span>
              {d.previewOnly ? (
                <span className="jw-card-quests">Coming soon</span>
              ) : (
                <span className="jw-card-quests">
                  <img src={crest} alt={faction} width={20} height={20} />
                  {d.questsByFaction[faction]} {d.questsByFaction[faction] === 1 ? "quest" : "quests"}
                </span>
              )}
              <span className="jw-card-level">LV {d.level}</span>
            </Link>
          </li>
        ))}
      </ul>
      {shown.length === 0 && (
        <p className="jw-empty">
          No dungeon or zone matches &ldquo;{q}&rdquo;.{" "}
          <button type="button" className="sx-textlink" onClick={() => setQ("")}>Clear the search</button>
        </p>
      )}
    </section>
  );
}
