"use client";

import Link from "next/link";
import { LINKS } from "@/app/lib/site";
import { DownloadIcon } from "./icons";
import { useT } from "@/app/components/i18n/I18n";
import { NEWS } from "@/app/lib/news";

/**
 * The home banner: Latest Drama. The newest post's picture sits sharp in the
 * middle, with a blurred copy of it filling the sides (the screenshots are
 * narrower than the banner), and the title, a line and a button over it.
 * My Character stays in the header (s_hero_import / s_hero_cta are its old
 * line and button, kept for when it comes back here). The page's h1 stays the
 * site's name for search engines, hidden.
 */
export default function HomeHero() {
  const t = useT();
  const pic = NEWS[0]?.hero ?? "/journal/art/shadowfang-keep-card.webp";
  return (
    <section className="sx-hero sx-hero-drama" aria-label={t("s_hero_news_cta")}>
      <div className="sx-slide on">
        <div className="sx-slide-art sx-drama-blur" style={{ backgroundImage: `url(${pic})` }} />
        <div className="sx-drama-pic" style={{ backgroundImage: `url(${pic})` }} />
        <div className="sx-slide-copy">
          <h1 className="sx-sr">Dungeon Journal</h1>
          <p className="sx-slide-title sx-drama-title">{t("s_hero_news_cta")}</p>
          <p className="sx-slide-text">{t("s_hero_news")}</p>
          <Link href="/news" className="sx-btn sx-btn-gold sx-btn-lg">
            {t("s_hero_news_read")}
          </Link>
        </div>
      </div>
    </section>
  );
}

/** The closing band: a painting edge to edge with the in-game pitch over its left side. */
export function DownloadBanner() {
  const t = useT();
  return (
    <section className="sx-banner" aria-labelledby="sx-banner-title">
      <div className="sx-banner-art" style={{ backgroundImage: "url(/journal/art/hall-of-thanes-card.webp)" }} />
      <div className="sx-banner-body">
        <div className="sx-banner-copy">
        <h2 id="sx-banner-title">{t("s_banner_title")}</h2>
        <p>{t("s_banner_text")}</p>
        <div className="sx-banner-actions">
          <a href={LINKS.curseforge} target="_blank" rel="noreferrer noopener" className="sx-btn sx-btn-gold sx-btn-lg">
            <DownloadIcon /> {t("s_banner_cta")}
          </a>
          <a href={LINKS.wago} target="_blank" rel="noreferrer noopener" className="sx-textlink">{t("s_banner_alt")}</a>
        </div>
        </div>
      </div>
    </section>
  );
}
