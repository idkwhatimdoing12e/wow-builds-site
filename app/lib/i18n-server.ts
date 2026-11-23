// The addon's translations applied to the journal, on the server only (the
// translation files are large; pages send the browser just the text they show).
// data/locales/<locale>.json comes from scripts/locales-to-json.py.

import enUS from "@/data/locales/enUS.json";
import deDE from "@/data/locales/deDE.json";
import frFR from "@/data/locales/frFR.json";
import esES from "@/data/locales/esES.json";
import itIT from "@/data/locales/itIT.json";
import ptBR from "@/data/locales/ptBR.json";
import ruRU from "@/data/locales/ruRU.json";
import koKR from "@/data/locales/koKR.json";
import zhCN from "@/data/locales/zhCN.json";
import zhTW from "@/data/locales/zhTW.json";
import { langInfo, type Lang, type Locale } from "./i18n";
import { JOURNAL_STRINGS } from "./journal-strings";
import { chainPageKind, getChainPage, getDungeon, type ChainStepFull, type Dungeon, type DungeonSummary, type Quest } from "./journal";

interface LocaleDoc {
  ui: Record<string, string>;
  dungeons?: Record<string, { name?: string; location?: string; description?: string }>;
  bosses?: Record<string, string>;
  quests?: Record<string, { name?: string; objective?: string; pickup?: string; turnin?: string; note?: string; warning?: string }>;
}

const DOCS: Record<Locale, LocaleDoc> = {
  enUS: enUS as LocaleDoc,
  deDE: deDE as LocaleDoc,
  frFR: frFR as LocaleDoc,
  esES: esES as LocaleDoc,
  itIT: itIT as LocaleDoc,
  ptBR: ptBR as LocaleDoc,
  ruRU: ruRU as LocaleDoc,
  koKR: koKR as LocaleDoc,
  zhCN: zhCN as LocaleDoc,
  zhTW: zhTW as LocaleDoc,
};

const doc = (lang: Lang) => DOCS[langInfo(lang).locale];

/** The addon's interface strings the site shows (sent to the browser). */
const ADDON_KEYS = [
  "DUNGEONS", "DUNGEON_JOURNAL", "MAP", "BOSSES", "QUESTS", "QUEST", "QUESTS_LOWER", "COMING_SOON", "RAIDS_TITLE",
  "AVAILABLE_FROM_LEVEL", "REQUIRED_QUESTS", "SHOW_WHOLE_CHAIN", "NO_FACTION_QUESTS", "RECIPES_SECTION",
  "OBJECTIVE", "STARTS_AT", "TURN_IN", "NOTES", "REWARD", "REWARDS", "CHOOSE_ONE_REWARD", "ALSO_RECEIVE",
  "SHOW_QUEST_CHAIN", "OPEN_REQUIRED_CHAIN", "CHAIN_REQUIRED", "LEADS_TO", "REQUIRED_PREREQUISITE",
  "REQUIRED_ITEMS", "PROVIDED_ITEM", "SHOW_ON_MAP", "PROF_BLACKSMITHING", "PROF_MINING",
  // the home page's tabs and their pages (Systems/TierSets.lua, OnyxiaAttunement.lua, QuestText.lua)
  "TIER_TITLE", "TIER_0", "TIER_05", "TIER05_FROM", "TIER_ICON_TIP", "TIER_SHOW_CLASSES", "TIER_ALL", "TIER_PIECE_TIP",
  "ATTUNE_ONYXIA", "ONYXIA_ICON_TIP", "SLEEPING_BAG", "SLEEPING_BAG_TITLE", "SLEEPING_BAG_HOW",
];

/** Every string the translated pages show, in one language, English where a translation is missing. */
export function dictFor(lang: Lang): Record<string, string> {
  const out: Record<string, string> = {};
  const en = DOCS.enUS.ui;
  const ui = doc(lang).ui;
  for (const key of ADDON_KEYS) {
    const v = (lang !== "en" && ui[key]) || en[key];
    if (v) out[key] = v;
  }
  // Tier 0.5's spec names (TIER05_SPEC_<CLASS>_<ROLE>), every one the addon has.
  for (const key of Object.keys(en)) {
    if (!key.startsWith("TIER05_SPEC_")) continue;
    const v = (lang !== "en" && ui[key]) || en[key];
    if (v) out[key] = v;
  }
  return { ...out, ...JOURNAL_STRINGS.en, ...JOURNAL_STRINGS[lang] };
}

/** The map's labels (Entrance, Level 2, ...) in a language. */
function mapLabels(lang: Lang): Record<string, string> | undefined {
  if (lang === "en") return undefined;
  const ui = doc(lang).ui;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(ui)) if (k.startsWith("MAP_")) out[k] = v;
  return out;
}

export function dungeonText(name: string, lang: Lang) {
  const t = lang === "en" ? undefined : doc(lang).dungeons?.[name];
  return { name: t?.name || name, location: t?.location, description: t?.description };
}

export function bossName(name: string, lang: Lang): string {
  return (lang !== "en" && doc(lang).bosses?.[name]) || name;
}

function questText(id: number, lang: Lang) {
  return lang === "en" ? undefined : doc(lang).quests?.[String(id)];
}

function localizeStep(s: ChainStepFull, lang: Lang): ChainStepFull {
  const t = questText(s.id, lang);
  if (!t) return s;
  return {
    ...s,
    name: t.name || s.name,
    ...(s.detail
      ? {
          detail: {
            ...s.detail,
            objective: t.objective || s.detail.objective,
            pickup: t.pickup || s.detail.pickup,
            turnin: t.turnin || s.detail.turnin,
            note: t.note || s.detail.note,
            warning: t.warning || s.detail.warning,
          },
        }
      : {}),
  };
}

export function localizeQuest(q: Quest, lang: Lang): Quest {
  if (lang === "en") return q;
  const t = questText(q.id, lang);
  return {
    ...q,
    name: t?.name || q.name,
    objective: t?.objective || q.objective,
    pickup: t?.pickup || q.pickup,
    turnin: t?.turnin || q.turnin,
    note: t?.note || q.note,
    warning: t?.warning || q.warning,
    chain: q.chain.map((s) => localizeStep(s, lang)),
    related: q.related.map((r) => ({ ...r, name: questText(r.id, lang)?.name || r.name })),
    dungeonName: dungeonText(q.dungeonName, lang).name,
  };
}

/** A dungeon summary (home card, menu) in a language. The English name stays searchable. */
export function localizeSummary<T extends DungeonSummary>(d: T, lang: Lang): T {
  if (lang === "en") return d;
  const t = dungeonText(d.name, lang);
  return {
    ...d,
    name: t.name,
    location: t.location || d.location,
    description: t.description || d.description,
    aliases: [...d.aliases, d.name],
  };
}

/** The whole dungeon page in a language: names, quests, bosses and map labels. */
export function getLocalizedDungeon(slug: string, lang: Lang): Dungeon | null {
  const d = getDungeon(slug, mapLabels(lang));
  if (!d || lang === "en") return d;
  const t = dungeonText(d.name, lang);
  return {
    ...d,
    name: t.name,
    location: t.location || d.location,
    description: t.description || d.description,
    quests: d.quests.map((q) => localizeQuest(q, lang)),
    hiddenQuests: d.hiddenQuests.map((q) => localizeQuest(q, lang)),
    bosses: d.bosses.map((b) => ({ ...b, name: bossName(b.name, lang) })),
    ...(d.map ? { map: { ...d.map, bosses: d.map.bosses.map((b) => ({ ...b, name: bossName(b.name, lang) })) } } : {}),
  };
}

/** Dungeon names by slug, per language, for the header's menu. */
export function menuNames(slugsByName: { slug: string; name: string }[]): Record<string, Record<string, string>> {
  const out: Record<string, Record<string, string>> = {};
  for (const locale of Object.keys(DOCS) as Locale[]) {
    if (locale === "enUS") continue;
    const names: Record<string, string> = {};
    for (const { slug, name } of slugsByName) {
      const n = DOCS[locale].dungeons?.[name]?.name;
      if (n) names[slug] = n;
    }
    out[locale] = names;
  }
  return out;
}

/** A quest-chain page (Onyxia Attunement, Cozy Sleeping Bag) in a language: its title is the addon's own string. */
export function getLocalizedChainPage(slug: string, lang: Lang): Dungeon | null {
  const d = getChainPage(slug);
  if (!d) return null;
  const kind = chainPageKind(slug);
  const key = kind === "onyxia" ? "ATTUNE_ONYXIA" : kind === "sleeping-bag" ? "SLEEPING_BAG_TITLE" : "";
  const name = (key && ((lang !== "en" && doc(lang).ui[key]) || DOCS.enUS.ui[key])) || d.name;
  return { ...d, name, quests: d.quests.map((q) => localizeQuest(q, lang)) };
}

/** A quest's name in a language (the addon's translation), English when it has none. */
export function questName(id: number, english: string, lang: Lang): string {
  return questText(id, lang)?.name || english;
}
