"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LINKS } from "@/app/lib/site";
import { ChevronDown, DiscordIcon, DownloadIcon, PatreonIcon, YouTubeIcon } from "./icons";

export interface NavDungeon {
  slug: string;
  name: string;
  level: string;
  forever: boolean;
  previewOnly: boolean;
}

/** "17-26" reads as a range in print: an en dash, no spaces. */
export const levelRange = (level: string) => level.replace(/\s*-\s*/, "–");

function Logo() {
  return (
    <Link href="/" className="sx-logo" aria-label="Dungeon Journal home">
      <img src="/journal/ui/forever-icon.png" alt="" width={64} height={64} className="sx-logo-badge" />
      <span className="sx-logo-name">Dungeon Journal</span>
    </Link>
  );
}

function Socials() {
  return (
    <span className="sx-socials">
      <a href={LINKS.discord} target="_blank" rel="noreferrer noopener" aria-label="Discord"><DiscordIcon size={16} /></a>
      <a href={LINKS.youtube} target="_blank" rel="noreferrer noopener" aria-label="YouTube"><YouTubeIcon size={17} /></a>
      <a href={LINKS.patreon} target="_blank" rel="noreferrer noopener" aria-label="Patreon"><PatreonIcon size={14} /></a>
    </span>
  );
}

/**
 * One quiet bar: the logo on the left, the menu in the middle, the socials and
 * the download button on the right. The small links (Wago, Privacy and so on)
 * live in the footer and the mobile menu.
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

  // The Dungeons panel also closes on a click anywhere outside it.
  const drop = useRef<HTMLDivElement>(null);
  const dropButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!dropOpen) return;
    const onDown = (e: PointerEvent) => {
      if (drop.current && !drop.current.contains(e.target as Node)) setDropOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [dropOpen]);

  const forever = dungeons.filter((d) => d.forever);
  const classic = dungeons.filter((d) => !d.forever);
  const isActive = (href: string) => (href === "/" ? pathname === "/" || pathname.startsWith("/dungeon") : pathname.startsWith(href));

  const dungeonList = (list: NavDungeon[]) =>
    list.map((d) => (
      <Link key={d.slug} href={`/dungeon/${d.slug}`} className="sx-drop-item" onClick={closeAll}>
        <span>{d.name}</span>
        <small>{d.previewOnly ? "Soon" : levelRange(d.level)}</small>
      </Link>
    ));

  return (
    <div className={`sx-header-wrap ${menuOpen ? "sx-open" : ""}`}>
      <header className="sx-header">
        <div className="sx-bar">
          <Logo />
          <nav className="sx-nav" aria-label="Main">
            <div
              ref={drop}
              className={`sx-drop ${dropOpen ? "on" : ""}`}
              onMouseEnter={() => setDropOpen(true)}
              onMouseLeave={() => setDropOpen(false)}
              onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDropOpen(false); }}
              onKeyDown={(e) => {
                if (e.key === "Escape" && dropOpen) {
                  setDropOpen(false);
                  dropButton.current?.focus();
                }
              }}
            >
              <button
                ref={dropButton}
                type="button"
                className={`sx-nav-link ${isActive("/") ? "active" : ""}`}
                aria-expanded={dropOpen}
                aria-controls="sx-drop-panel"
                onClick={() => setDropOpen((v) => !v)}
              >
                Dungeons <ChevronDown size={14} />
              </button>
              <div className="sx-drop-panel" id="sx-drop-panel">
                <div className="sx-drop-col">
                  <div className="sx-drop-head">New in WoW Forever</div>
                  {dungeonList(forever)}
                </div>
                <div className="sx-drop-col sx-drop-col-wide">
                  <div className="sx-drop-head">Classic dungeons</div>
                  <div className="sx-drop-grid">{dungeonList(classic)}</div>
                </div>
                <Link href="/#dungeons" className="sx-drop-all" onClick={closeAll}>Show all dungeons with their art</Link>
              </div>
            </div>
            <Link href="/character" className={`sx-nav-link ${isActive("/character") ? "active" : ""}`}>My Character</Link>
            <Link href="/supporters" className={`sx-nav-link ${isActive("/supporters") ? "active" : ""}`}>Supporters</Link>
            <Link href="/about" className={`sx-nav-link ${isActive("/about") ? "active" : ""}`}>About</Link>
          </nav>
          <span className="sx-bar-end">
            <Socials />
            <a href={LINKS.curseforge} target="_blank" rel="noreferrer noopener" className="sx-btn sx-btn-gold sx-cta">
              <DownloadIcon /> Download
            </a>
          </span>
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
            <Link href="/character" onClick={closeAll}>My Character</Link>
            <Link href="/supporters" onClick={closeAll}>Supporters</Link>
            <Link href="/about" onClick={closeAll}>About</Link>
            <a href={LINKS.patreon} target="_blank" rel="noreferrer noopener">Patreon</a>
            <a href={LINKS.discord} target="_blank" rel="noreferrer noopener">Discord</a>
            <a href={LINKS.wago} target="_blank" rel="noreferrer noopener">Wago</a>
            <Link href="/privacy" onClick={closeAll}>Privacy</Link>
            <a href={LINKS.curseforge} target="_blank" rel="noreferrer noopener" className="sx-btn sx-btn-gold">
              <DownloadIcon /> Download the addon
            </a>
          </div>
        )}
      </header>
    </div>
  );
}
