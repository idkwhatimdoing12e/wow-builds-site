import type { Metadata } from "next";
import Link from "next/link";
import { LINKS, SITE_URL } from "@/app/lib/site";
import Window from "@/app/components/journal/Window";

export const metadata: Metadata = {
  title: "About",
  description: "Dungeon Journal is a free WoW Forever addon and its web version: every dungeon quest, boss and drop.",
  alternates: { canonical: `${SITE_URL}/about` },
};

export default function AboutPage() {
  return (
    <div className="journal wf-page">
      <Window>
        <div className="wf-crumb">
          <Link href="/" className="wf-btn wf-btn-red wf-btn-sm">Dungeons</Link>
        </div>
        <div className="wf-pane wf-pane-single wf-pane-parchment">
          <div className="wp">
            <h1 className="wp-title">About</h1>
            <p className="wp-text">
              Dungeon Journal is a free addon for World of Warcraft: Forever. It shows every dungeon&apos;s quests, bosses and
              drops in one window, so you know what to pick up before you zone in. This site is the same journal on the web,
              generated from the addon&apos;s own data, so both always match.
            </p>
            <p className="wp-text">
              It&apos;s made by one player, Exehn, and updated for each Forever phase.
            </p>
            <p className="wp-text">
              <a href={LINKS.curseforge} target="_blank" rel="noreferrer noopener" className="wf-btn wf-btn-red">Download the addon</a>{" "}
              <a href={LINKS.discord} target="_blank" rel="noreferrer noopener" className="wf-btn wf-btn-dark">Report a bug on Discord</a>
            </p>
            <p className="wp-note">
              World of Warcraft and related trademarks are the property of Blizzard Entertainment. This site is a fan project
              and is not affiliated with Blizzard Entertainment or Wowhead.
            </p>
          </div>
        </div>
      </Window>
    </div>
  );
}
