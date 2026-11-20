"use client";

import { LINKS } from "@/app/lib/site";
import { DownloadIcon } from "./icons";
import { useT } from "@/app/components/i18n/I18n";

/**
 * The home banner: a painting edge to edge that fades into the page, with the
 * title, a line and the download button centred over it. (It was a carousel;
 * the map and browse slides only pointed further down the same page.)
 */
export default function HomeHero() {
  const t = useT();
  return (
    <section className="sx-hero" aria-label="Dungeon Journal">
      <div className="sx-slide on">
        <div className="sx-slide-art" style={{ backgroundImage: "url(/journal/art/shadowfang-keep-card.webp)" }} />
        <div className="sx-slide-copy">
          <h1 className="sx-slide-title">Dungeon Journal</h1>
          <p className="sx-slide-text">{t("s_hero1_text")}</p>
          <a href={LINKS.curseforge} target="_blank" rel="noreferrer noopener" className="sx-btn sx-btn-gold sx-btn-lg">
            <DownloadIcon /> {t("s_download_addon")}
          </a>
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
