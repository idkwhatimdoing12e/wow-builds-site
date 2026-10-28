import Link from "next/link";
import { LINKS, SITE_NAME } from "@/app/lib/site";
import { DiscordIcon, PatreonIcon, YouTubeIcon } from "./icons";

/** Footer in RestedXP's layout: centred logo, blurb, social icons, links, legal lines. */
export default function SiteFooter() {
  return (
    <footer className="sx-footer">
      <div className="sx-footer-in">
        <Link href="/" className="sx-logo sx-logo-foot" aria-label="Dungeon Journal home">
          <img src="/journal/ui/forever-icon.png" alt="" width={64} height={64} className="sx-logo-badge" />
          <span className="sx-logo-text">
            <span className="sx-logo-name">DUNGEON<b>JOURNAL</b></span>
          </span>
        </Link>
        <p className="sx-footer-blurb">
          Dungeon Journal is the free WoW Forever addon that shows every dungeon&apos;s quests, bosses, drops and maps
          in one window. This site is the same journal on the web, built from the addon&apos;s own data.
        </p>
        <div className="sx-footer-social">
          <a href={LINKS.discord} target="_blank" rel="noreferrer noopener" aria-label="Discord"><DiscordIcon size={26} /></a>
          <a href={LINKS.youtube} target="_blank" rel="noreferrer noopener" aria-label="YouTube"><YouTubeIcon size={26} /></a>
          <a href={LINKS.patreon} target="_blank" rel="noreferrer noopener" aria-label="Patreon"><PatreonIcon size={22} /></a>
        </div>
        <nav className="sx-footer-links" aria-label="Footer">
          <Link href="/">Dungeons</Link>
          <Link href="/supporters">Supporters</Link>
          <a href={LINKS.curseforge} target="_blank" rel="noreferrer noopener">CurseForge</a>
          <a href={LINKS.patreon} target="_blank" rel="noreferrer noopener">Patreon</a>
          <Link href="/about">About</Link>
          <Link href="/privacy">Privacy Policy</Link>
        </nav>
        <p className="sx-footer-copy">©{new Date().getFullYear()} {SITE_NAME.toUpperCase()}. ALL RIGHTS RESERVED.</p>
        <p className="sx-footer-legal">
          All trademarks referenced herein are the properties of their respective owners.
          <br />
          {SITE_NAME} is not affiliated with or endorsed by Blizzard Entertainment, Inc.
        </p>
      </div>
    </footer>
  );
}
