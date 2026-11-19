"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { DungeonSummary } from "@/app/lib/journal";
import { LINKS } from "@/app/lib/site";
import { levelRange } from "@/app/components/site/SiteHeader";
import { setFaction, useFaction } from "./useFaction";
import HomeEmblems, { FOREVER_ONLY_KEY, type EmblemText } from "./HomeEmblems";
import { useStoredFlag } from "./useStoredFlag";

interface Props {
  dungeons: (DungeonSummary & { art: string | null; gradient: string })[];
  emblemText: EmblemText;
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5 21 21" />
    </svg>
  );
}

/**
 * The home page's dungeon chapter: a heading with search, the addon's emblems
 * and faction choice, then one page per dungeon with its painting on top and
 * the same facts under every one (levels, zone, quests for your faction).
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
    <section className="gd-chapter" id="dungeons" aria-labelledby="gd-title">
      <header className="gd-head">
        <div>
          <h2 id="gd-title" className="gd-title">The dungeons</h2>
          <p className="gd-lede">
            {foreverOnly
              ? `The ${shown.length} dungeons new in WoW Forever.`
              : `All ${dungeons.length} dungeons in the journal.`}{" "}
            Quest counts are for the {faction}.
          </p>
        </div>
        <label className="gd-search">
          <SearchIcon />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Find a dungeon or zone"
            aria-label="Search dungeons"
          />
        </label>
      </header>

      <div className="gd-toolbar">
        <HomeEmblems text={emblemText} />
        <div className="gd-faction" role="group" aria-label="Count quests for">
          {(["Alliance", "Horde"] as const).map((f) => (
            <button
              key={f}
              type="button"
              className={faction === f ? "on" : ""}
              aria-pressed={faction === f}
              onClick={() => setFaction(f)}
            >
              <img src={f === "Horde" ? "/journal/horde.png" : "/journal/alliance.png"} alt="" width={22} height={22} />
              {f}
            </button>
          ))}
        </div>
        <div className="gd-toolbar-links">
          <a href={LINKS.curseforge} target="_blank" rel="noreferrer noopener" className="sx-textlink">Download the addon</a>
          <a href={LINKS.patreon} target="_blank" rel="noreferrer noopener" className="sx-textlink">Support on Patreon</a>
        </div>
      </div>

      <ol className="gd-grid">
        {shown.map((d) => (
          <li key={d.slug}>
            <Link href={`/dungeon/${d.slug}`} className={`gd-card ${d.previewOnly ? "gd-card-soon" : ""}`}>
              <span
                className="gd-card-art"
                style={d.art ? { backgroundImage: `url(${d.art})` } : { backgroundImage: d.gradient }}
              />
              <span className="gd-card-body">
                <span className="gd-card-name">{d.name}</span>
                <span className="gd-card-facts">
                  <span>{d.previewOnly ? "Coming soon" : `Levels ${levelRange(d.level)}`}</span>
                  {d.location && <span>{d.location}</span>}
                </span>
                <span className="gd-card-foot">
                  {d.previewOnly ? (
                    <span className="gd-card-quests">Not in the journal yet</span>
                  ) : (
                    <span className="gd-card-quests">
                      <img src={crest} alt="" width={18} height={18} />
                      <b className="sx-disc">{d.questsByFaction[faction]}</b>
                      {d.questsByFaction[faction] === 1 ? "quest" : "quests"}
                    </span>
                  )}
                  {d.forever && <span className="sx-new">New in Forever</span>}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
      {shown.length === 0 && (
        <p className="gd-empty">
          No dungeon or zone matches &ldquo;{q}&rdquo;.{" "}
          <button type="button" className="sx-textlink" onClick={() => setQ("")}>Clear the search</button>
        </p>
      )}
    </section>
  );
}
