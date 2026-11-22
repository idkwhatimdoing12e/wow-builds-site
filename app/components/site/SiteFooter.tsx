"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LINKS, SITE_NAME } from "@/app/lib/site";
import { href, langOf } from "@/app/lib/i18n";
import { SHELL } from "@/app/lib/shell-strings";
import { DiscordIcon, PatreonIcon, YouTubeIcon } from "./icons";

/** The guide's back page: what this is, where to get it, and the small print. */
export default function SiteFooter() {
  const lang = langOf(usePathname() || "/");
  const s = SHELL[lang];
  return (
    <footer className="sx-footer">
      <div className="sx-footer-in">
        <div className="sx-footer-about">
          <Link href={href(lang, "/")} className="sx-logo sx-logo-foot" aria-label={s.home}>
            <img src="/journal/ui/journal-book.webp" alt="" width={128} height={128} className="sx-logo-badge sx-logo-book" />
            <span className="sx-logo-text">
              <span className="sx-logo-name">Dungeon Journal</span>
              <span className="sx-logo-tag">{s.tag}</span>
            </span>
          </Link>
          <p className="sx-footer-blurb">{s.blurb}</p>
          <div className="sx-footer-social">
            <a href={LINKS.discord} target="_blank" rel="noreferrer noopener" aria-label="Discord"><DiscordIcon size={20} /></a>
            <a href={LINKS.youtube} target="_blank" rel="noreferrer noopener" aria-label="YouTube"><YouTubeIcon size={21} /></a>
            <a href={LINKS.patreon} target="_blank" rel="noreferrer noopener" aria-label="Patreon"><PatreonIcon size={17} /></a>
          </div>
        </div>

        <nav className="sx-footer-col" aria-label={s.journal}>
          <h2>{s.journal}</h2>
          <Link href={href(lang, "/#dungeons")}>{s.dungeons}</Link>
          <Link href="/character">{s.character}</Link>
          <a href={LINKS.donate} target="_blank" rel="noreferrer noopener">{s.donate}</a>
          <Link href="/about">{s.about}</Link>
          <Link href={lang === "de" ? "/de/privacy" : "/privacy"}>{s.privacy}</Link>
        </nav>
        <nav className="sx-footer-col" aria-label={s.getAddon}>
          <h2>{s.getAddon}</h2>
          <a href={LINKS.curseforge} target="_blank" rel="noreferrer noopener">CurseForge</a>
          <a href={LINKS.wago} target="_blank" rel="noreferrer noopener">Wago</a>
          <a href={LINKS.patreon} target="_blank" rel="noreferrer noopener">Patreon</a>
          <a href={LINKS.discord} target="_blank" rel="noreferrer noopener">Discord</a>
        </nav>
      </div>

      <div className="sx-footer-legal">
        <p>&copy; {new Date().getFullYear()} {SITE_NAME}. {s.rights}</p>
        <p>{s.disclaimer}</p>
      </div>
    </footer>
  );
}
