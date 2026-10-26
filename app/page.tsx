import Link from "next/link";
import { getDungeonSummaries, journalMeta } from "@/app/lib/journal";
import { LINKS, SITE_TAGLINE } from "@/app/lib/site";
import { Pill } from "@/app/components/journal/Badges";

export default function HomePage() {
  const dungeons = getDungeonSummaries();
  const live = dungeons.filter((d) => !d.previewOnly);
  const questTotal = live.reduce((n, d) => n + d.questCount, 0);
  const bossTotal = live.reduce((n, d) => n + d.bossCount, 0);

  return (
    <div className="journal">
      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pt-28 pb-12 text-center">
        <p className="eyebrow">WoW Forever · in-game addon &amp; web reference</p>
        <h1 className="display mt-3 text-5xl sm:text-6xl">Dungeon Journal</h1>
        <p className="mt-4 text-lg text-white/65 max-w-2xl mx-auto">{SITE_TAGLINE} — {questTotal} quests and {bossTotal} bosses across {live.length} dungeons, straight from the addon&apos;s data.</p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a href={LINKS.curseforge} target="_blank" rel="noreferrer noopener" className="btn btn-primary">
            Download the addon
          </a>
          <a href={LINKS.patreon} target="_blank" rel="noreferrer noopener" className="btn">
            Support on Patreon
          </a>
          <a href={LINKS.discord} target="_blank" rel="noreferrer noopener" className="btn">
            Discord
          </a>
        </div>
        <p className="mt-4 text-xs text-white/40">Addon v{journalMeta.addonVersion} · free on CurseForge · <code>/dj</code> in game</p>
      </section>

      {/* Dungeon grid */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="flex items-baseline justify-between">
          <h2 className="display text-2xl">Dungeons</h2>
          <span className="text-sm text-white/40">sorted by level</span>
        </div>

        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {dungeons.map((d) => (
            <li key={d.slug}>
              <Link
                href={`/dungeon/${d.slug}`}
                className={`card block h-full ${d.previewOnly ? "card-preview" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold leading-snug">{d.name}</h3>
                  <span className="lvl shrink-0">{d.level}</span>
                </div>
                <p className="mt-1 text-sm text-white/50">{d.location}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  {d.previewOnly ? (
                    <Pill tone="gold">Opens at launch</Pill>
                  ) : (
                    <>
                      <Pill tone="muted">{d.questCount} quests</Pill>
                      <Pill tone="muted">{d.bossCount} bosses</Pill>
                      {d.fullItemsTBD && <Pill tone="warn">loot being completed</Pill>}
                    </>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-center text-sm text-white/40">
          Looking for the level 1–10 twink builds? They moved to{" "}
          <Link href="/low-level-builds" className="underline underline-offset-2 hover:text-white">
            Low Level Builds
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
