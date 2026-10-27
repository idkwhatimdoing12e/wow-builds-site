"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LINKS } from "@/app/lib/site";
import { ChevronDown, DiscordIcon, DownloadIcon, PatreonIcon, YouTubeIcon } from "./icons";

export interface NavDungeon {
  slug: string;
  name: string;
  level: string;
  forever: boolean;
  previewOnly: boolean;
}

function Logo({ small = false }: { small?: boolean }) {
  return (
    <Link href="/" className={`sx-logo ${small ? "sx-logo-sm" : ""}`} aria-label="Dungeon Journal home">
      <img src="/journal/ui/forever-icon.png" alt="" width={64} height={64} className="sx-logo-badge" />
      <span className="sx-logo-text">
        <span className="sx-logo-name">
          DUNGEON<b>JOURNAL</b>
        </span>
        {!small && <span className="sx-logo-tag">FOR WOW FOREVER</span>}
      </span>
    </Link>
  );
}

function Socials() {
  return (
    <span className="sx-socials">
      <a href={LINKS.discord} target="_blank" rel="noreferrer noopener" aria-label="Discord"><DiscordIcon /></a>
      <a href={LINKS.youtube} target="_blank" rel="noreferrer noopener" aria-label="YouTube"><YouTubeIcon /></a>
      <a href={LINKS.patreon} target="_blank" rel="noreferrer noopener" aria-label="Patreon"><PatreonIcon /></a>
    </span>
  );
}

/**
 * Site header in RestedXP's layout: a thin utility bar (logo, socials, small
 * links) above a frosted, rounded main bar with the menu and a blue download
 * button. No account menu.
 */
export default function SiteHeader({ dungeons }: { dungeons: NavDungeon[] }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);

  // Close menus after navigating.
  useEffect(() => {
    const close = () => { setMenuOpen(false); setDropOpen(false); };
    window.addEventListener("popstate", close);
    return () => window.removeEventListener("popstate", close);
  }, []);
  const closeAll = () => { setMenuOpen(false); setDropOpen(false); };

  const forever = dungeons.filter((d) => d.forever);
  const classic = dungeons.filter((d) => !d.forever);
  const isActive = (href: string) => (href === "/" ? pathname === "/" || pathname.startsWith("/dungeon") : pathname.startsWith(href));

  const dungeonList = (list: NavDungeon[]) =>
    list.map((d) => (
      <Link key={d.slug} href={`/dungeon/${d.slug}`} className="sx-drop-item" onClick={closeAll}>
        <span>{d.name}</span>
        <small>{d.previewOnly ? "Soon" : `LV ${d.level}`}</small>
      </Link>
    ));

  return (
    <div className={`sx-header-wrap ${menuOpen ? "sx-open" : ""}`}>
      <div className="sx-topbar">
        <div className="sx-topbar-in">
          <span className="sx-topbar-left">
            <Logo small />
            <Socials />
          </span>
          <nav className="sx-topbar-links" aria-label="Quick links">
            <a href={LINKS.curseforge} target="_blank" rel="noreferrer noopener">CurseForge</a>
            <a href={LINKS.wago} target="_blank" rel="noreferrer noopener">Wago</a>
            <Link href="/supporters">Supporters</Link>
            <a href={LINKS.discord} target="_blank" rel="noreferrer noopener">Report a Bug</a>
            <Link href="/about">About</Link>
            <Link href="/privacy">Privacy</Link>
          </nav>
        </div>
      </div>

      <header className="sx-header">
        <div className="sx-bar">
          <Logo />
          <nav className="sx-nav" aria-label="Main">
            <div
              className={`sx-drop ${dropOpen ? "on" : ""}`}
              onMouseEnter={() => setDropOpen(true)}
              onMouseLeave={() => setDropOpen(false)}
            >
              <button
                type="button"
                className={`sx-nav-link ${isActive("/") ? "active" : ""}`}
                aria-expanded={dropOpen}
                onClick={() => setDropOpen((v) => !v)}
              >
                Dungeons <ChevronDown />
              </button>
              <div className="sx-drop-panel" role="menu">
                <div className="sx-drop-col">
                  <div className="sx-drop-head">New in WoW Forever</div>
                  {dungeonList(forever)}
                </div>
                <div className="sx-drop-col sx-drop-col-wide">
                  <div className="sx-drop-head">Classic dungeons</div>
                  <div className="sx-drop-grid">{dungeonList(classic)}</div>
                </div>
                <Link href="/#dungeons" className="sx-drop-all" onClick={closeAll}>Show all dungeons</Link>
              </div>
            </div>
            <Link href="/supporters" className={`sx-nav-link ${isActive("/supporters") ? "active" : ""}`}>Supporters</Link>
            <Link href="/about" className={`sx-nav-link ${isActive("/about") ? "active" : ""}`}>About</Link>
            <a href={LINKS.patreon} target="_blank" rel="noreferrer noopener" className="sx-nav-link">Patreon</a>
          </nav>
          <a href={LINKS.curseforge} target="_blank" rel="noreferrer noopener" className="sx-btn sx-btn-blue sx-cta">
            <DownloadIcon /> Download Dungeon Journal
          </a>
          <button
            type="button"
            className="sx-burger"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span /><span /><span />
          </button>
        </div>

        {menuOpen && (
          <div className="sx-mobile">
            <button
              type="button"
              className="sx-mobile-toggle"
              aria-expanded={listOpen}
              onClick={() => setListOpen((v) => !v)}
            >
              Dungeons <ChevronDown size={16} />
            </button>
            {listOpen && <div className="sx-mobile-list">{dungeonList(dungeons)}</div>}
            <Link href="/supporters" onClick={closeAll}>Supporters</Link>
            <Link href="/about" onClick={closeAll}>About</Link>
            <a href={LINKS.patreon} target="_blank" rel="noreferrer noopener">Patreon</a>
            <a href={LINKS.discord} target="_blank" rel="noreferrer noopener">Discord</a>
            <a href={LINKS.curseforge} target="_blank" rel="noreferrer noopener" className="sx-btn sx-btn-blue">
              <DownloadIcon /> Download Dungeon Journal
            </a>
          </div>
        )}
      </header>
    </div>
  );
}
