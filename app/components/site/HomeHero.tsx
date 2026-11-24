"use client";

import Link from "next/link";
import { LINKS } from "@/app/lib/site";
import { DownloadIcon } from "./icons";
import { useT } from "@/app/components/i18n/I18n";

/**
 * The home banner: a painting edge to edge that fades into the page, with the
 * a line (the page's heading) and a button centred over it. Most visitors come from the
 * addon, so it asks them to bring their character (/dj export) rather than
 * to download it; the header and the closing band still offer the download.
 * (The Latest Drama banner it replaced for a while is in git history, commit
 * 0465d2f; its News page is parked in app/_news.)
 */
export default function HomeHero() {
  const t = useT();
  return (
    <section className="sx-hero" aria-label="Dungeon Journal">
      <div className="sx-slide on">
        <div className="sx-slide-art" style={{ backgroundImage: "url(/journal/art/shadowfang-keep-card.webp)" }} />
        <div className="sx-slide-copy">
          <h1 className="sx-slide-text">{t("s_hero_import")}</h1>
          <Link href="/character" className="sx-btn sx-btn-gold sx-btn-lg">
            {t("s_hero_cta")}
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
