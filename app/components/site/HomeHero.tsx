"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LINKS } from "@/app/lib/site";

interface Slide {
  image: string;
  kicker: string;
  title: string;
  text: string;
  cta: { label: string; href: string; external?: boolean };
}

const SLIDES: Slide[] = [
  {
    image: "/journal/art/ruins-of-lordaeron-card.webp",
    kicker: "Free forever",
    title: "Get the Addon",
    text: "The same journal in game, updated the day each Forever phase lands. Free on CurseForge and Wago.",
    cta: { label: "Download Dungeon Journal", href: LINKS.curseforge, external: true },
  },
  {
    image: "/journal/maps/the-deadmines-1.webp",
    kicker: "Every dungeon",
    title: "Mapped",
    text: "Boss locations, entrances and the way down to every level, for 27 dungeons. Exactly like the Map tab in game.",
    cta: { label: "Open a Map", href: "/dungeon/the-deadmines#map" },
  },
  {
    image: "/journal/art/city-of-dalaran-card.webp",
    kicker: "Warcraft Forever",
    title: "Dungeon Journal",
    text: "Every quest, boss and drop in WoW Forever's dungeons, from the addon downloaded over 1.5 million times.",
    cta: { label: "Browse Dungeons", href: "#dungeons" },
  },
];

/** RestedXP-style hero: a rounded art card with a centred headline, text and blue button; dots switch slides. */
export default function HomeHero() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = window.setTimeout(() => setI((n) => (n + 1) % SLIDES.length), 7000);
    return () => window.clearTimeout(t);
  }, [i, paused]);

  return (
    <section
      className="sx-hero"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {SLIDES.map((s, n) => (
        <div key={s.title} className={`sx-slide ${n === i ? "on" : ""}`} aria-hidden={n !== i}>
          <div className="sx-slide-bg" style={{ backgroundImage: `url(${s.image})` }} />
          <div className="sx-slide-content">
            <div className="sx-slide-kicker">{s.kicker}</div>
            <h1 className="sx-slide-title">{s.title}</h1>
            <p className="sx-slide-text">{s.text}</p>
            {s.cta.external ? (
              <a href={s.cta.href} target="_blank" rel="noreferrer noopener" className="sx-btn sx-btn-blue sx-btn-lg" tabIndex={n === i ? 0 : -1}>
                {s.cta.label}
              </a>
            ) : (
              <Link href={s.cta.href} className="sx-btn sx-btn-blue sx-btn-lg" tabIndex={n === i ? 0 : -1}>
                {s.cta.label}
              </Link>
            )}
          </div>
        </div>
      ))}
      <div className="sx-dots">
        {SLIDES.map((s, n) => (
          <button
            key={s.title}
            type="button"
            className={n === i ? "on" : ""}
            aria-label={`Slide ${n + 1}: ${s.title}`}
            aria-current={n === i}
            onClick={() => setI(n)}
          />
        ))}
      </div>
    </section>
  );
}

/** RestedXP's closing banner: art on the left, pitch and download button on the right. */
export function DownloadBanner() {
  return (
    <section className="sx-banner">
      <div className="sx-banner-art" style={{ backgroundImage: "url(/journal/art/hall-of-thanes-card.webp)" }} />
      <div className="sx-banner-body">
        <img src="/journal/ui/forever-icon.png" alt="" width={64} height={64} className="sx-banner-badge" />
        <h2>Take the Journal Into the Game</h2>
        <p>
          The Dungeon Journal addon shows all of this in game: quests for your faction, the boss you&apos;re fighting,
          what it drops and where you are on the map. It&apos;s free and updated for every WoW Forever phase.
        </p>
        <a href={LINKS.curseforge} target="_blank" rel="noreferrer noopener" className="sx-btn sx-btn-blue sx-btn-lg">
          Download Dungeon Journal
        </a>
      </div>
    </section>
  );
}
