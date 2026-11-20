"use client";

import Link from "next/link";
import type { DungeonSummary } from "@/app/lib/journal";
import { setFaction, useFaction } from "./useFaction";
import HomeEmblems, { type EmblemText } from "./HomeEmblems";
import { useHref, useT } from "@/app/components/i18n/I18n";

interface Props {
  dungeons: (DungeonSummary & { art: string | null; gradient: string })[];
  emblemText: EmblemText;
}

/**
 * The addon's home window on the web: search and title in the bar, the
 * emblems, faction choice and the download in the toolbar, then the dungeons as
 * wide painted strips with their name, quest count and level on the art,
 * the way the addon draws them.
 */
export default function JournalHome({ dungeons, emblemText }: Props) {
  const t = useT();
  const h = useHref();
  const faction = useFaction();
  const crest = faction === "Horde" ? "/journal/horde.png" : "/journal/alliance.png";

  return (
    <section className="jw" id="dungeons" aria-labelledby="jw-title">
      <div className="jw-bar">
        <span className="jw-bar-end" />
        <h2 id="jw-title" className="jw-title">{t("DUNGEON_JOURNAL")}</h2>
        <span className="jw-bar-end" />
      </div>

      <div className="jw-toolbar">
        <HomeEmblems text={emblemText} />
        <div className="jw-faction" role="group" aria-label={t("QUESTS")}>
          {(["Alliance", "Horde"] as const).map((f) => (
            <button
              key={f}
              type="button"
              className={faction === f ? "on" : ""}
              aria-pressed={faction === f}
              aria-label={t("s_count_for", t(f === "Horde" ? "s_horde" : "s_alliance"))}
              title={t("s_count_for", t(f === "Horde" ? "s_horde" : "s_alliance"))}
              onClick={() => setFaction(f)}
            >
              <img src={f === "Horde" ? "/journal/horde.png" : "/journal/alliance.png"} alt="" width={26} height={26} />
            </button>
          ))}
        </div>
      </div>

      <ul className="jw-grid">
        {dungeons.map((d) => (
          <li key={d.slug}>
            <Link
              href={h(`/dungeon/${d.slug}`)}
              className={`jw-card ${d.previewOnly ? "jw-card-soon" : ""}`}
              style={d.art ? { backgroundImage: `url(${d.art})` } : { backgroundImage: d.gradient }}
            >
              <span className="jw-card-name">{d.name}</span>
              {d.previewOnly ? (
                <span className="jw-card-quests">{t("COMING_SOON")}</span>
              ) : (
                <span className="jw-card-quests">
                  <img src={crest} alt={faction} width={20} height={20} />
                  {d.questsByFaction[faction]} {d.questsByFaction[faction] === 1 ? t("QUEST") : t("QUESTS_LOWER")}
                </span>
              )}
              <span className="jw-card-level">LV {d.level}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
