"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LINKS } from "@/app/lib/site";
import { DownloadIcon } from "./icons";

interface Slide {
  image: string;
  title: string;
  text: string;
  cta: { label: string; href: string; external?: boolean };
}

function slidesFor(mapCount: number): Slide[] {
  return [
    {
      image: "/journal/art/shadowfang-keep-card.webp",
      title: "Dungeon Journal",
      text: "Every quest, boss and drop in every dungeon on WoW Forever. A free addon, and the same journal here on the web.",
      cta: { label: "Download the addon", href: LINKS.curseforge, external: true },
    },
    {
      image: "/journal/art/the-deadmines-card.webp",
      title: "Every dungeon, mapped",
      text: `Boss locations, entrances and the way down to every level, for ${mapCount} dungeons. Exactly like the Map tab in game.`,
      cta: { label: "Open a map", href: "/dungeon/the-deadmines#map" },
    },
    {
      image: "/journal/art/gnomeregan-card.webp",
      title: "Browse every dungeon",
      text: "The whole journal right here: quests, bosses, loot and maps for every dungeon in the game.",
      cta: { label: "Browse dungeons", href: "#dungeons" },
    },
  ];
}

/**
 * The home banner: a painting edge to edge that fades into the page, with the
 * title, a line and the slide's action centred over it. The slides use the
 * widest, sharpest paintings the addon exports (1200px), since they run full
 * width. Three
 * slides; they turn on their own only while nobody points at or focuses the
 * banner, never after someone picks a slide, and never under reduced motion.
 */
export default function HomeHero({ mapCount }: { mapCount: number }) {
  const slides = slidesFor(mapCount);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [stopped, setStopped] = useState(false);

  useEffect(() => {
    if (paused || stopped) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => setI((n) => (n + 1) % slides.length), 8000);
    return () => window.clearTimeout(t);
  }, [i, paused, stopped, slides.length]);

  return (
    <section
      className="sx-hero"
      aria-roledescription="carousel"
      aria-label="Dungeon Journal"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false); }}
    >
      {slides.map((s, n) => (
        <div key={s.title} className={`sx-slide ${n === i ? "on" : ""}`} aria-hidden={n !== i}>
          <div className="sx-slide-art" style={{ backgroundImage: `url(${s.image})` }} />
          <div className="sx-slide-copy">
            {n === 0 ? <h1 className="sx-slide-title">{s.title}</h1> : <h2 className="sx-slide-title">{s.title}</h2>}
            <p className="sx-slide-text">{s.text}</p>
            {s.cta.external ? (
              <a href={s.cta.href} target="_blank" rel="noreferrer noopener" className="sx-btn sx-btn-gold sx-btn-lg" tabIndex={n === i ? 0 : -1}>
                <DownloadIcon /> {s.cta.label}
              </a>
            ) : (
              <Link href={s.cta.href} className="sx-btn sx-btn-gold sx-btn-lg" tabIndex={n === i ? 0 : -1}>
                {s.cta.label}
              </Link>
            )}
          </div>
        </div>
      ))}
      <nav className="sx-folios" aria-label="Slides">
        {slides.map((s, n) => (
          <button
            key={s.title}
            type="button"
            className={n === i ? "on" : ""}
            aria-label={`Slide ${n + 1}: ${s.title}`}
            aria-current={n === i}
            onClick={() => { setI(n); setStopped(true); }}
          >
            {n + 1}
          </button>
        ))}
      </nav>
    </section>
  );
}

/** The closing band: a painting edge to edge with the in-game pitch over its left side. */
export function DownloadBanner() {
  return (
    <section className="sx-banner" aria-labelledby="sx-banner-title">
      <div className="sx-banner-art" style={{ backgroundImage: "url(/journal/art/hall-of-thanes-card.webp)" }} />
      <div className="sx-banner-body">
        <div className="sx-banner-copy">
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
      </div>
    </section>
  );
}
