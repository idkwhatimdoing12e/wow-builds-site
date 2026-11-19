import Link from "next/link";
import { LINKS, SITE_NAME } from "@/app/lib/site";
import { DiscordIcon, PatreonIcon, YouTubeIcon } from "./icons";

/** The guide's back page: what this is, where to get it, and the small print. */
export default function SiteFooter() {
  return (
    <footer className="sx-footer">
      <div className="sx-footer-in">
        <div className="sx-footer-about">
          <Link href="/" className="sx-logo sx-logo-foot" aria-label="Dungeon Journal home">
            <img src="/journal/ui/forever-icon.png" alt="" width={64} height={64} className="sx-logo-badge" />
            <span className="sx-logo-text">
              <span className="sx-logo-name">Dungeon Journal</span>
              <span className="sx-logo-tag">for WoW Forever</span>
            </span>
          </Link>
          <p className="sx-footer-blurb">
            Dungeon Journal is the free WoW Forever addon that shows every dungeon&apos;s quests, bosses, drops and maps
            in one window. This site is the same journal on the web, built from the addon&apos;s own data.
          </p>
          <div className="sx-footer-social">
            <a href={LINKS.discord} target="_blank" rel="noreferrer noopener" aria-label="Discord"><DiscordIcon size={20} /></a>
            <a href={LINKS.youtube} target="_blank" rel="noreferrer noopener" aria-label="YouTube"><YouTubeIcon size={21} /></a>
            <a href={LINKS.patreon} target="_blank" rel="noreferrer noopener" aria-label="Patreon"><PatreonIcon size={17} /></a>
          </div>
        </div>

        <nav className="sx-footer-col" aria-label="The journal">
          <h2>The journal</h2>
          <Link href="/#dungeons">Dungeons</Link>
          <Link href="/character">My Character</Link>
          <Link href="/supporters">Supporters</Link>
          <Link href="/about">About</Link>
        </nav>
        <nav className="sx-footer-col" aria-label="Get the addon">
          <h2>Get the addon</h2>
          <a href={LINKS.curseforge} target="_blank" rel="noreferrer noopener">CurseForge</a>
          <a href={LINKS.wago} target="_blank" rel="noreferrer noopener">Wago</a>
          <a href={LINKS.patreon} target="_blank" rel="noreferrer noopener">Patreon</a>
          <a href={LINKS.discord} target="_blank" rel="noreferrer noopener">Discord</a>
        </nav>
      </div>

      <div className="sx-footer-legal">
        <p>&copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved. <Link href="/privacy">Privacy Policy</Link></p>
        <p>
          All trademarks referenced herein are the properties of their respective owners. {SITE_NAME} is not affiliated
          with or endorsed by Blizzard Entertainment, Inc.
        </p>
      </div>
    </footer>
  );
}
