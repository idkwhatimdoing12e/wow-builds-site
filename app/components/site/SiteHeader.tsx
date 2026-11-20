"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LINKS } from "@/app/lib/site";
import { LANGS, href, isTranslated, langInfo, langOf, stripLang, type Lang } from "@/app/lib/i18n";
import { SHELL } from "@/app/lib/shell-strings";
import { ChevronDown, DiscordIcon, DownloadIcon, PatreonIcon, YouTubeIcon } from "./icons";
import SiteSearch from "./SiteSearch";

export interface NavDungeon {
  slug: string;
  name: string;
  level: string;
  forever: boolean;
  previewOnly: boolean;
}

/** "17-26" reads as a range in print: an en dash, no spaces. */
export const levelRange = (level: string) => level.replace(/\s*-\s*/, "–");

function Logo({ lang }: { lang: Lang }) {
  return (
    <Link href={href(lang, "/")} className="sx-logo" aria-label={SHELL[lang].home}>
      {/* the Dungeon Journal's book, on no background */}
      <img src="/journal/ui/journal-book.webp" alt="" width={128} height={128} className="sx-logo-badge sx-logo-book" />
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

function GlobeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.6 2.6 3.9 5.6 3.9 9s-1.3 6.4-3.9 9c-2.6-2.6-3.9-5.6-3.9-9S9.4 5.6 12 3z" />
    </svg>
  );
}

/**
 * The language picker, top right: the current language's code, and a menu of
 * the addon's ten languages in their own names. A translated page (home,
 * dungeon, quest) opens in the new language at the same place; any other page
 * goes to that language's home.
 */
function LangMenu({ lang, pathname }: { lang: Lang; pathname: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const base = stripLang(pathname);
  const target = (l: Lang) => (isTranslated(base) ? href(l, base) : href(l, "/"));

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  return (
    <div
      ref={box}
      className={`sx-lang ${open ? "on" : ""}`}
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          setOpen(false);
          button.current?.focus();
        }
      }}
    >
      <button
        ref={button}
        type="button"
        className="sx-lang-btn"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`${SHELL[lang].language}: ${langInfo(lang).label}`}
        onClick={() => setOpen((v) => !v)}
      >
        <GlobeIcon />
        <span>{langInfo(lang).short}</span>
        <ChevronDown size={13} />
      </button>
      {open && (
        <ul className="sx-lang-menu" aria-label={SHELL[lang].language}>
          {LANGS.map((l) => (
            <li key={l.code}>
              <Link
                href={target(l.code)}
                lang={l.html}
                hrefLang={l.html}
                className={l.code === lang ? "on" : ""}
                aria-current={l.code === lang ? "true" : undefined}
                onClick={(e) => {
                  // keep the open tab or quest (#quest-123) in the new language
                  e.preventDefault();
                  setOpen(false);
                  router.push(target(l.code) + (isTranslated(base) ? window.location.hash : ""));
                }}
              >
                <span className="sx-lang-code">{l.short}</span>
                <span>{l.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * One quiet bar: the logo with the socials and the download button on the
 * left, the menu in the middle, the language picker on the right. The small
 * links (Wago, Privacy and so on) live in the footer and the mobile menu.
 */
export default function SiteHeader({
  dungeons,
  names,
}: {
  dungeons: NavDungeon[];
  /** Dungeon names by slug, per locale (deDE, ...), for the menu in other languages. */
  names: Record<string, Record<string, string>>;
}) {
  const pathname = usePathname() || "/";
  const lang = langOf(pathname);
  const s = SHELL[lang];
  const base = stripLang(pathname);
  const local = names[langInfo(lang).locale] ?? {};
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
  const isActive = (p: string) => (p === "/" ? base === "/" || base.startsWith("/dungeon") : base.startsWith(p));

  const dungeonList = (list: NavDungeon[]) =>
    list.map((d) => (
      <Link key={d.slug} href={href(lang, `/dungeon/${d.slug}`)} className="sx-drop-item" onClick={closeAll}>
        <span>{local[d.slug] ?? d.name}</span>
        <small>{d.previewOnly ? s.soon : levelRange(d.level)}</small>
      </Link>
    ));

  return (
    <div className={`sx-header-wrap ${menuOpen ? "sx-open" : ""}`}>
      <header className="sx-header">
        <div className="sx-bar">
          <span className="sx-bar-start">
            <Logo lang={lang} />
            <Socials />
            <a href={LINKS.curseforge} target="_blank" rel="noreferrer noopener" className="sx-btn sx-btn-gold sx-cta">
              <DownloadIcon /> <span className="sx-cta-label">{s.download}</span>
            </a>
            <SiteSearch lang={lang} s={s} />
          </span>
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
                {s.dungeons} <ChevronDown size={14} />
              </button>
              <div className="sx-drop-panel" id="sx-drop-panel">
                <div className="sx-drop-col">
                  <div className="sx-drop-head">{s.newInForever}</div>
                  {dungeonList(forever)}
                </div>
                <div className="sx-drop-col sx-drop-col-wide">
                  <div className="sx-drop-head">{s.classicDungeons}</div>
                  {/* Level order runs down each column, then on to the next. */}
                  <div
                    className="sx-drop-grid"
                    style={{ "--drop-rows": Math.ceil(classic.length / 3) } as React.CSSProperties}
                  >
                    {dungeonList(classic)}
                  </div>
                </div>
                <Link href={href(lang, "/#dungeons")} className="sx-drop-all" onClick={closeAll}>{s.showAll}</Link>
              </div>
            </div>
            <Link href="/character" className={`sx-nav-link ${isActive("/character") ? "active" : ""}`}>{s.character}</Link>
            <a href={LINKS.donate} target="_blank" rel="noreferrer noopener" className="sx-nav-link">{s.donate}</a>
          </nav>
          <span className="sx-bar-end">
            <LangMenu lang={lang} pathname={pathname} />
            <button
              type="button"
              className="sx-burger"
              aria-label={menuOpen ? s.closeMenu : s.openMenu}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span /><span /><span />
            </button>
          </span>
        </div>

        {menuOpen && (
          <div className="sx-mobile">
            <button
              type="button"
              className="sx-mobile-toggle"
              aria-expanded={listOpen}
              onClick={() => setListOpen((v) => !v)}
            >
              {s.dungeons} <ChevronDown size={16} />
            </button>
            {listOpen && <div className="sx-mobile-list">{dungeonList(dungeons)}</div>}
            <Link href="/character" onClick={closeAll}>{s.character}</Link>
            <a href={LINKS.donate} target="_blank" rel="noreferrer noopener">{s.donate}</a>
            <Link href="/about" onClick={closeAll}>{s.about}</Link>
            <a href={LINKS.patreon} target="_blank" rel="noreferrer noopener">Patreon</a>
            <a href={LINKS.discord} target="_blank" rel="noreferrer noopener">Discord</a>
            <a href={LINKS.wago} target="_blank" rel="noreferrer noopener">Wago</a>
            <a href={LINKS.curseforge} target="_blank" rel="noreferrer noopener" className="sx-btn sx-btn-gold">
              <DownloadIcon /> {s.downloadAddon}
            </a>
          </div>
        )}
      </header>
    </div>
  );
}
