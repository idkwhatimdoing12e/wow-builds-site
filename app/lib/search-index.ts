// The header search's index: every dungeon, boss, quest and item, one small
// entry each, per language. Built at build time and served as a static file
// (/search-index/<lang>), fetched by the browser the first time the search
// box is used; every keystroke then scans this list in memory.

import bakedIds from "@/data/baked-portraits.json";
import { getDungeonSlugs, getDungeonSummaries } from "./journal";
import { getLocalizedDungeon } from "./i18n-server";
import { getItemById, getItemIds } from "./item-index";
import { cardArt } from "./art";
import { href, type Lang } from "./i18n";

/** d dungeon, b boss, q quest, i item. */
export type SearchKind = "d" | "b" | "q" | "i";

export interface SearchEntry {
  t: SearchKind;
  /** The name shown (in the page's language). */
  n: string;
  /** The line under it: level and place, the boss's dungeon, the item's slot. */
  s: string;
  /** Where it goes. */
  h: string;
  /** Icon or picture. */
  i?: string;
  /** Item quality, for its colour. */
  q?: number;
  /** Item ID, so the item's own tooltip shows on hover. */
  id?: number;
  /** Other words that find it: the English name, a dungeon's abbreviations. */
  x?: string;
  /** Quest ID, so the character page can name and link a favourite's quest. */
  qi?: number;
}

const BAKED = new Set<number>(bakedIds as number[]);

export function buildSearchIndex(lang: Lang): SearchEntry[] {
  const out: SearchEntry[] = [];
  const seenQuests = new Set<number>();
  const english = new Map(getDungeonSummaries().map((d) => [d.slug, d]));

  for (const slug of getDungeonSlugs()) {
    const d = getLocalizedDungeon(slug, lang);
    const en = english.get(slug);
    if (!d || !en) continue;
    const enDungeon = lang === "en" ? d : getLocalizedDungeon(slug, "en");
    out.push({
      t: "d",
      n: d.name,
      s: [`LV ${d.level}`, d.location].filter(Boolean).join(" · "),
      h: href(lang, `/dungeon/${slug}`),
      ...(cardArt(en.name) ? { i: cardArt(en.name) as string } : {}),
      x: [lang === "en" ? "" : en.name, ...en.aliases].filter(Boolean).join(" "),
    });

    d.bosses.forEach((b, i) => {
      const enName = enDungeon?.bosses[i]?.name;
      out.push({
        t: "b",
        n: b.name,
        s: d.name,
        h: href(lang, `/dungeon/${slug}#boss-${i}`),
        ...(b.customPortrait
          ? { i: b.customPortrait }
          : b.displayId && BAKED.has(b.displayId)
            ? { i: `/journal/portraits/baked/${b.displayId}.webp` }
            : {}),
        ...(enName && enName !== b.name ? { x: enName } : {}),
      });
    });

    const enQuests = new Map([...(enDungeon?.quests ?? []), ...(enDungeon?.hiddenQuests ?? [])].map((q) => [q.id, q.name]));
    for (const q of [...d.quests, ...d.hiddenQuests]) {
      if (seenQuests.has(q.id)) continue;
      seenQuests.add(q.id);
      const enName = enQuests.get(q.id);
      out.push({
        t: "q",
        n: q.name,
        s: `${d.name} · LV ${q.level}`,
        h: href(lang, `/quest/${q.slug}`),
        qi: q.id,
        ...(enName && enName !== q.name ? { x: enName } : {}),
      });
    }
  }

  // Items keep their English names (the addon does not translate them).
  for (const id of getItemIds()) {
    const it = getItemById(id);
    if (!it) continue;
    out.push({
      t: "i",
      n: it.name,
      s: it.slot ?? it.qualityName,
      h: `/item/${it.slug}`,
      i: it.icon,
      q: it.quality,
      id: it.id,
    });
  }
  return out;
}
