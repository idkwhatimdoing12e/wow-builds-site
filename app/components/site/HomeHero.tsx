"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LINKS } from "@/app/lib/site";
import { DownloadIcon } from "./icons";
import { levelRange } from "./SiteHeader";

export interface SpreadDungeon {
  slug: string;
  name: string;
  level: string;
  location: string;
  forever: boolean;
  previewOnly: boolean;
  art: string | null;
}

interface Slide {
  image: string;
  title: string;
  text: string;
  cta: { label: string; href: string; external?: boolean };
}

function slidesFor(mapCount: number): Slide[] {
  return [
    {
      image: "/journal/art/city-of-dalaran-card.webp",
      title: "Dungeon Journal",
      text: "Every quest, boss and drop in every dungeon on WoW Forever. A free addon, and the same journal here on the web.",
      cta: { label: "Download the addon", href: LINKS.curseforge, external: true },
    },
    {
      image: "/journal/maps/the-deadmines-1.webp",
      title: "Every dungeon, mapped",
      text: `Boss locations, entrances and the way down to every level, for ${mapCount} dungeons. Exactly like the Map tab in game.`,
      cta: { label: "Open a map", href: "/dungeon/the-deadmines#map" },
    },
    {
      image: "/journal/art/ruins-of-lordaeron-card.webp",
      title: "Browse every dungeon",
      text: "The whole journal right here: quests, bosses, loot and maps for every dungeon in the game.",
      cta: { label: "Browse dungeons", href: "#dungeons" },
    },
  ];
}

function Action({ cta }: { cta: Slide["cta"] }) {
  return cta.external ? (
    <a href={cta.href} target="_blank" rel="noreferrer noopener" className="sx-btn sx-btn-gold sx-btn-lg">
      <DownloadIcon /> {cta.label}
    </a>
  ) : (
    <Link href={cta.href} className="sx-btn sx-btn-gold sx-btn-lg">{cta.label}</Link>
  );
}

/**
 * The opening spread of the guide. Left page: a chapter opener whose painting,
 * title and action turn through three pages. Right page: the contents, every
 * dungeon with a dotted leader to its level range. Pointing at or focusing a
 * contents line turns the left page to that dungeon until the pointer or focus
 * leaves the spread.
 *
 * The pages turn on their own only while nobody is pointing at or inside the
 * spread, never once someone has picked a page, and never under reduced motion.
 */
export default function HomeHero({ dungeons, mapCount }: { dungeons: SpreadDungeon[]; mapCount: number }) {
  const slides = slidesFor(mapCount);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [preview, setPreview] = useState<SpreadDungeon | null>(null);
  // The last two paintings shown, so a new one can fade in over the old one.
  const [layers, setLayers] = useState<string[]>([slides[0].image]);

  useEffect(() => {
    if (paused || stopped || preview) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => setI((n) => (n + 1) % slides.length), 8000);
    return () => window.clearTimeout(t);
  }, [i, paused, stopped, preview, slides.length]);

  const image = preview?.art ?? slides[i].image;
  // Adjusted during render rather than in an effect, so the new painting
  // mounts in the same pass that changed it.
  if (layers[layers.length - 1] !== image) setLayers([...layers.slice(-1), image]);

  const slide = slides[i];
  const forever = dungeons.filter((d) => d.forever);
  const classic = dungeons.filter((d) => !d.forever);

  const leave = () => { setPaused(false); setPreview(null); };

  const entry = (d: SpreadDungeon) => (
    <li key={d.slug}>
      <Link
        href={`/dungeon/${d.slug}`}
        className={preview?.slug === d.slug ? "on" : ""}
        onMouseEnter={() => setPreview(d)}
        onFocus={() => setPreview(d)}
      >
        <span className="sx-toc-name">{d.name}</span>
        <i aria-hidden="true" />
        <span className="sx-toc-lvl">{d.previewOnly ? "Soon" : levelRange(d.level)}</span>
      </Link>
    </li>
  );

  const groups = (
    <>
      <div className="sx-toc-group">
        <h3>New in WoW Forever</h3>
        <ol className="sx-toc-list">{forever.map(entry)}</ol>
      </div>
      <div className="sx-toc-group">
        <h3>Classic dungeons</h3>
        <ol className="sx-toc-list">{classic.map(entry)}</ol>
      </div>
    </>
  );

  return (
    <section
      className="sx-spread"
      aria-labelledby="sx-spread-title"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={leave}
      onFocus={() => setPaused(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) leave(); }}
    >
      <h1 id="sx-spread-title" className="sx-visually-hidden">
        Dungeon Journal: every quest, boss and drop in every dungeon on WoW Forever
      </h1>
      <div className="sx-page sx-page-left">
        <div className="sx-plate">
          {layers.map((src, n) => (
            <div
              key={src}
              className={`sx-plate-img ${n === layers.length - 1 ? "top" : ""}`}
              style={{ backgroundImage: `url(${src})` }}
            />
          ))}
        </div>

        {preview ? (
          <div className="sx-opener">
            <h2 className="sx-opener-title">{preview.name}</h2>
            <p className="sx-opener-text">
              {preview.previewOnly ? "Coming soon" : `Levels ${levelRange(preview.level)}`}
              {preview.location ? <> &middot; {preview.location}</> : null}
              {preview.forever ? <> &middot; <span className="sx-new">New in WoW Forever</span></> : null}
            </p>
            <div className="sx-opener-actions">
              <Link href={`/dungeon/${preview.slug}`} className="sx-btn sx-btn-gold sx-btn-lg">Open {preview.name}</Link>
            </div>
          </div>
        ) : (
          <div className="sx-opener">
            <h2 className="sx-opener-title">{slide.title}</h2>
            <p className="sx-opener-text">{slide.text}</p>
            <div className="sx-opener-actions">
              <Action cta={slide.cta} />
              <nav className="sx-folios" aria-label="Pages">
                {slides.map((s, n) => (
                  <button
                    key={s.title}
                    type="button"
                    className={n === i ? "on" : ""}
                    aria-label={`Page ${n + 1}: ${s.title}`}
                    aria-current={n === i}
                    onClick={() => { setI(n); setStopped(true); }}
                  >
                    {n + 1}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        )}
      </div>

      <div className="sx-page sx-page-right">
        {/* Wide screens: the contents as the right page. Phones: folded into a
            row under the opener, closed on first paint. */}
        <div className="sx-toc-desk">
          <h2 className="sx-toc-title">Contents</h2>
          <p className="sx-toc-lede">Every dungeon in the journal, by level.</p>
          {groups}
        </div>
        <details className="sx-toc-mob">
          <summary>Contents &middot; {dungeons.length} dungeons</summary>
          {groups}
        </details>
      </div>
    </section>
  );
}

/** The closing box: the in-game pitch, set like a guide's sidebar. */
export function DownloadBanner() {
  return (
    <section className="sx-banner" aria-labelledby="sx-banner-title">
      <div className="sx-banner-art" style={{ backgroundImage: "url(/journal/art/hall-of-thanes-card.webp)" }} />
      <div className="sx-banner-body">
        <h2 id="sx-banner-title">Take the journal into the game</h2>
        <p>
          The Dungeon Journal addon shows all of this in game: quests for your faction, the boss you&apos;re fighting,
          what it drops and where you are on the map. It&apos;s free and updated for every WoW Forever phase.
        </p>
        <div className="sx-banner-actions">
          <a href={LINKS.curseforge} target="_blank" rel="noreferrer noopener" className="sx-btn sx-btn-gold sx-btn-lg">
            <DownloadIcon /> Download on CurseForge
          </a>
          <a href={LINKS.wago} target="_blank" rel="noreferrer noopener" className="sx-textlink">or get it on Wago</a>
        </div>
      </div>
    </section>
  );
}
