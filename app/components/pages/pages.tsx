// The translated pages' bodies and metadata, shared by the English routes
// (/, /dungeon/x, /quest/x) and the prefixed ones (/de, /de/dungeon/x, ...).

import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDungeonSummaries, getQuestBySlug } from "@/app/lib/journal";
import { bandArt, cardArt, cardGradient, themeVars } from "@/app/lib/art";
import { SITE_NAME, SITE_URL } from "@/app/lib/site";
import { LANGS, format, href, type Lang } from "@/app/lib/i18n";
import { dictFor, dungeonText, getLocalizedDungeon, localizeQuest, localizeSummary } from "@/app/lib/i18n-server";
import { I18nProvider } from "@/app/components/i18n/I18n";
import Window from "@/app/components/journal/Window";
import DungeonView from "@/app/components/journal/DungeonView";
import QuestPanel from "@/app/components/journal/QuestPanel";
import AdSlot from "@/app/components/journal/AdSlot";
import JournalHome from "@/app/components/journal/JournalHome";
import HomeHero, { DownloadBanner } from "@/app/components/site/HomeHero";

/** canonical + hreflang for a path that exists in every language. */
function alternates(lang: Lang, p: string): Metadata["alternates"] {
  const languages: Record<string, string> = {};
  for (const l of LANGS) languages[l.html] = `${SITE_URL}${href(l.code, p)}`;
  languages["x-default"] = `${SITE_URL}${p}`;
  return { canonical: `${SITE_URL}${href(lang, p)}`, languages };
}

/* ---------- home ---------- */

export function homeMetadata(lang: Lang): Metadata {
  const dict = dictFor(lang);
  const meta: Metadata = { alternates: alternates(lang, "/"), openGraph: { url: `${SITE_URL}${href(lang, "/")}` } };
  if (lang === "en") return meta;
  return {
    ...meta,
    title: { absolute: `${dict.DUNGEON_JOURNAL} - WoW Forever` },
    description: dict.s_hero1_text,
  };
}

export function HomeBody({ lang }: { lang: Lang }) {
  const dict = dictFor(lang);
  const dungeons = getDungeonSummaries().map((d) => ({
    ...localizeSummary(d, lang),
    art: cardArt(d.name),
    gradient: cardGradient(d.name),
  }));
  return (
    <I18nProvider lang={lang} dict={dict}>
      <div className="sx-home">
        <HomeHero />
        <div className="sx-wrap">
          <JournalHome
            dungeons={dungeons}
            emblemText={{ dungeonsTitle: dict.DUNGEONS, raidsTitle: dict.RAIDS_TITLE, comingSoon: dict.COMING_SOON }}
          />
        </div>
        <DownloadBanner />
      </div>
    </I18nProvider>
  );
}

/* ---------- dungeon ---------- */

export function dungeonMetadata(slug: string, lang: Lang): Metadata {
  const d = getLocalizedDungeon(slug, lang);
  if (!d) return {};
  const dict = dictFor(lang);
  const title =
    lang === "en" ? `${d.name} quests & loot (${d.level})` : `${d.name} - ${dict.QUESTS}, ${dict.BOSSES} (${d.level})`;
  const description =
    lang !== "en"
      ? `${d.description}`.slice(0, 160)
      : d.previewOnly
        ? `${d.name}, a WoW Forever dungeon in ${d.location}: ${d.description}`
        : `${d.questCount} quests, ${d.bossCount} bosses and every drop in ${d.name} (${d.location}, level ${d.level}) for WoW Forever.`;
  const url = `${SITE_URL}${href(lang, `/dungeon/${d.slug}`)}`;
  return {
    title,
    description,
    alternates: alternates(lang, `/dungeon/${d.slug}`),
    openGraph: { title: `${title} - ${SITE_NAME}`, description, url },
  };
}

export function DungeonBody({ slug, lang }: { slug: string; lang: Lang }) {
  const d = getLocalizedDungeon(slug, lang);
  if (!d) notFound();
  const dict = dictFor(lang);
  const all = getDungeonSummaries();
  const idx = all.findIndex((x) => x.slug === slug);
  const english = all[idx].name; // art and themes are keyed by the English name
  const near = (i: number) => (all[i] ? { name: dungeonText(all[i].name, lang).name, slug: all[i].slug } : null);

  // The game's Encounter Journal skin (.ej): --ej-band is the picture behind the header band.
  const band = bandArt(english);
  const style = { ...themeVars(english), ...(band ? { "--ej-band": `url("${band}")` } : {}) } as React.CSSProperties;

  return (
    <I18nProvider lang={lang} dict={dict}>
      <div className="journal wf-page ej">
        <Window style={style} title={dict.DUNGEON_JOURNAL} homeHref={href(lang, "/")}>
          <DungeonView d={d} prev={near(idx - 1)} next={near(idx + 1)} />
        </Window>
        <AdSlot />
      </div>
    </I18nProvider>
  );
}

/* ---------- quest ---------- */

export function questMetadata(slug: string, lang: Lang): Metadata {
  const page = getQuestBySlug(slug);
  if (!page) return {};
  const quest = localizeQuest(page.quest, lang);
  const where = page.dungeons.map((d) => dungeonText(d.name, lang).name).join(" / ");
  const dict = dictFor(lang);
  const title =
    lang === "en" ? `${quest.name} - ${where} quest (level ${quest.level})` : `${quest.name} - ${where} (${format(dict.s_level, quest.level)})`;
  const description =
    lang === "en"
      ? `${quest.objective} Pick up: ${quest.pickup}. Turn in: ${quest.turnin}.`.slice(0, 160)
      : `${quest.objective} ${dict.STARTS_AT}: ${quest.pickup}. ${dict.TURN_IN}: ${quest.turnin}.`.slice(0, 160);
  return {
    title,
    description,
    alternates: alternates(lang, `/quest/${quest.slug}`),
    openGraph: { title: `${title} - ${SITE_NAME}`, description, url: `${SITE_URL}${href(lang, `/quest/${quest.slug}`)}` },
  };
}

export function QuestBody({ slug, lang }: { slug: string; lang: Lang }) {
  const page = getQuestBySlug(slug);
  if (!page) notFound();
  const dict = dictFor(lang);
  const q = localizeQuest(page.quest, lang);
  const dungeons = page.dungeons.map((d) => ({ ...d, label: dungeonText(d.name, lang).name }));

  return (
    <I18nProvider lang={lang} dict={dict}>
      <div className="journal wf-page">
        <Window style={themeVars(dungeons[0].name) as React.CSSProperties} title={dict.DUNGEON_JOURNAL} homeHref={href(lang, "/")}>
          <div className="wf-crumb">
            <Link href={href(lang, "/")} className="wf-btn wf-btn-red wf-btn-sm">{dict.DUNGEONS}</Link>
            <Link href={href(lang, `/dungeon/${dungeons[0].slug}#quest-${q.id}`)} className="wf-btn wf-btn-red wf-btn-sm">{dungeons[0].label}</Link>
            {dungeons.slice(1).map((d) => (
              <Link key={d.slug} href={href(lang, `/dungeon/${d.slug}#quest-${q.id}`)} className="wf-btn wf-btn-dark wf-btn-sm">
                {format(dict.s_also_in, d.label)}
              </Link>
            ))}
          </div>
          <div className="wf-pane wf-pane-single wf-pane-parchment">
            <QuestPanel q={q} full />
          </div>
        </Window>
        <AdSlot />
      </div>
    </I18nProvider>
  );
}
