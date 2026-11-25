// The addon's PvP tab (Systems/PvP.lua, PvPRewards.lua, PvPQuests.lua), from
// data/journal.json's "PVP" (scripts/lua-to-json.py): the battlegrounds'
// cards, each one's rewards page for both sides, Honor & Ranks, and the
// Alterac Valley quests page. Built on the server into plain objects the
// pages hand to their client views.

import raw from "@/data/journal.json";
import gameItemsFile from "@/data/item-game.json";
import tierItemsFile from "@/data/tier-items.json";
import bakedFile from "@/data/baked-portraits.json";
import { itemIconSrc, itemPath } from "./items";
import type { Faction } from "./journal";
import { LANGS, type Lang } from "./i18n";

/* ---------- raw shapes (mirror Data/PvPRewards.lua and Systems/PvP.lua) ---------- */

export type BgKey = "WSG" | "AB" | "DI" | "AV";

interface RawBg {
  key: BgKey;
  min: number;
  level: string;
  size: string;
  art: number;
}
/** { name, quality, itemID, level, itemID, level, ... }; a dict when it carries `choice` or `quest`. */
type RawEntry = (string | number)[] | Record<string, string | number | boolean>;
interface RawVendor {
  mapID: number;
  label: string;
  targetName: string;
  display?: number;
  hall?: string;
}
type RawSide = {
  faction: number;
  factionName: string;
  vendor: RawVendor;
  quests?: number[];
} & Record<string, unknown>;
interface RawHonor {
  sets: Record<Faction, Record<string, [string, ...[number, number, number][]][]>>;
  slotCost: Record<string, [number, number, number]>;
  seals: Record<string, [number, number, number]>;
  ranks: Record<Faction, Record<string, number[][]>>;
  weapons: Record<Faction, number[][]>;
  marks: number[];
  vendors: Record<Faction, RawVendor>;
  fieldOfHonor: RawVendor;
}
interface RawQuestInfo {
  items?: number[];
  choice?: number[];
}
interface RawPvp {
  battlegrounds: RawBg[];
  names: Record<string, Partial<Record<BgKey, string>>>;
  rewards: Record<BgKey, Record<Faction, RawSide>>;
  honor: RawHonor;
  item_names: Record<string, string>;
  quest_info: Record<string, RawQuestInfo>;
  faction_names: Record<string, Record<string, string>>;
}

const data = raw as unknown as {
  PVP?: RawPvp;
  PAGES?: { PVP_AV_PAGE?: string };
  DB: Record<string, { quests?: { id: number }[] }>;
  QUEST_PREREQ_CHAINS: Record<string, { id: number }[]>;
};
const PVP = data.PVP;
const GAME_ITEMS = gameItemsFile as unknown as Record<string, [string, number]>;
const OWN_ITEMS = tierItemsFile as unknown as Record<string, [string, number]>;
const BAKED = new Set((bakedFile as unknown as number[]).map(String));

/* ---------- pages ---------- */

/** The battlegrounds' pages: /pvp/<slug>. */
export const BG_SLUGS: Record<BgKey, string> = {
  WSG: "warsong-gulch",
  AB: "arathi-basin",
  DI: "darkspear-islands",
  AV: "alterac-valley",
};
export const HONOR_SLUG = "honor-and-ranks";
/** Battlegrounds with a quests page of their own (Systems/PvPQuests.lua). */
const QUEST_PAGES: Partial<Record<BgKey, string>> = { AV: data.PAGES?.PVP_AV_PAGE };

export function hasPvp(): boolean {
  return !!PVP;
}

export function bgKeys(): BgKey[] {
  return (PVP?.battlegrounds ?? []).map((b) => b.key);
}

export function bgBySlug(slug: string): BgKey | null {
  return (Object.keys(BG_SLUGS) as BgKey[]).find((k) => BG_SLUGS[k] === slug && PVP?.rewards[k]) ?? null;
}

/** The pages under /pvp/: the battlegrounds and Honor & Ranks. */
export function pvpSlugs(): string[] {
  return PVP ? [...bgKeys().map((k) => BG_SLUGS[k]), HONOR_SLUG] : [];
}

/** The quest-chain page (DB name) of a battleground, by its slug, for /pvp/<slug>/quests. */
export function questPageFor(slug: string): string | null {
  const key = bgBySlug(slug);
  return (key && QUEST_PAGES[key]) || null;
}

export function questPageSlugs(): string[] {
  return bgKeys().filter((k) => QUEST_PAGES[k] && data.DB[QUEST_PAGES[k]!]).map((k) => BG_SLUGS[k]);
}

/* ---------- names ---------- */

function locale(lang: Lang): string {
  return LANGS.find((l) => l.code === lang)?.locale ?? "enUS";
}

/** A battleground's name: the game's own in the language (Darkspear Islands: English for now). */
export function bgName(key: BgKey, lang: Lang): string {
  return PVP?.names[locale(lang)]?.[key] ?? PVP?.names.enUS?.[key] ?? key;
}

/** A faction's name; the addon has the two Alterac Valley ones translated. */
export function factionName(id: number, english: string, lang: Lang): string {
  return (lang !== "en" && PVP?.faction_names[String(id)]?.[locale(lang)]) || english;
}

// The quartermasters' zones in the game's languages (C_Map names), by uiMapID.
const ZONES: Record<number, Partial<Record<string, string>>> = {
  1413: { enUS: "The Barrens", deDE: "Brachland", frFR: "Les Tarides", esES: "Los Baldíos", itIT: "Savane", ptBR: "Sertões", ruRU: "Степи", koKR: "불모의 땅", zhCN: "贫瘠之地", zhTW: "貧瘠之地" },
  1416: { enUS: "Alterac Mountains", deDE: "Alteracgebirge", frFR: "Montagnes d'Alterac", esES: "Montañas de Alterac", itIT: "Montagne d'Alterac", ptBR: "Montanhas de Alterac", ruRU: "Альтеракские горы", koKR: "알터랙 산맥", zhCN: "奥特兰克山脉", zhTW: "奧特蘭克山脈" },
  1417: { enUS: "Arathi Highlands", deDE: "Arathihochland", frFR: "Hautes-terres d'Arathi", esES: "Tierras Altas de Arathi", itIT: "Altopiani d'Arathi", ptBR: "Planalto Arathi", ruRU: "Нагорье Арати", koKR: "아라시 고원", zhCN: "阿拉希高地", zhTW: "阿拉希高地" },
  1440: { enUS: "Ashenvale", deDE: "Eschental", frFR: "Orneval", esES: "Vallefresno", itIT: "Valtetra", ptBR: "Vale Gris", ruRU: "Ясеневый лес", koKR: "잿빛 골짜기", zhCN: "灰谷", zhTW: "梣谷" },
  1446: { enUS: "Gadgetzan", deDE: "Gadgetzan", frFR: "Gadgetzan", esES: "Gadgetzan", itIT: "Gadgetzan", ptBR: "Gadgetzan", ruRU: "Прибамбасск", koKR: "가젯잔", zhCN: "加基森", zhTW: "加基森" },
  1453: { enUS: "Stormwind City", deDE: "Sturmwind", frFR: "Hurlevent", esES: "Ventormenta", itIT: "Roccavento", ptBR: "Ventobravo", ruRU: "Штормград", koKR: "스톰윈드", zhCN: "暴风城", zhTW: "暴風城" },
  1454: { enUS: "Orgrimmar", deDE: "Orgrimmar", frFR: "Orgrimmar", esES: "Orgrimmar", itIT: "Orgrimmar", ptBR: "Orgrimmar", ruRU: "Оргриммар", koKR: "오그리마", zhCN: "奥格瑞玛", zhTW: "奧格瑞瑪" },
};

function zoneName(mapID: number, english: string, lang: Lang): string {
  return ZONES[mapID]?.[locale(lang)] ?? english;
}

function portrait(display?: number): string | null {
  return display && BAKED.has(String(display)) ? `/journal/portraits/baked/${display}.webp` : null;
}

/* ---------- items ---------- */

export interface PvpItemView {
  id: number;
  name: string;
  quality: number;
  icon: string;
  href: string;
}

/** The game's name and quality first (the dump, then Forever's own items), else the addon's. */
export function pvpItem(id: number, name?: string, quality?: number): PvpItemView {
  const own = GAME_ITEMS[String(id)] ?? OWN_ITEMS[String(id)];
  const n = own?.[0] || PVP?.item_names[String(id)] || name || `Item ${id}`;
  return { id, name: n, quality: own?.[1] ?? quality ?? 1, icon: itemIconSrc(id), href: itemPath(id, n) };
}

/** An entry's fields, whichever shape it has. */
function readEntry(e: RawEntry): { name: string; quality: number; versions: [number, number][]; choice: boolean; quest: boolean } {
  const list: (string | number)[] = Array.isArray(e)
    ? e
    : Object.keys(e)
        .filter((k) => /^\d+$/.test(k))
        .sort((a, b) => Number(a) - Number(b))
        .map((k) => e[k] as string | number);
  const versions: [number, number][] = [];
  for (let i = 2; i < list.length; i += 2) {
    const id = Number(list[i]);
    if (id) versions.push([id, Number(list[i + 1] ?? 0)]);
  }
  return {
    name: String(list[0] ?? ""),
    quality: Number(list[1] ?? 1),
    versions,
    choice: !Array.isArray(e) && !!e.choice,
    quest: !Array.isArray(e) && !!e.quest,
  };
}

/* ---------- the PvP page: the cards ---------- */

export interface PvpCardView {
  key: BgKey;
  slug: string;
  name: string;
  level: string;
  size: string;
  art: string;
}

export function pvpCards(lang: Lang): PvpCardView[] {
  return (PVP?.battlegrounds ?? []).map((b) => ({
    key: b.key,
    slug: BG_SLUGS[b.key],
    name: bgName(b.key, lang),
    level: b.level,
    size: b.size,
    art: `/journal/art/pvp-${b.key.toLowerCase()}.webp`,
  }));
}

/* ---------- a battleground's page ---------- */

export interface PvpEntryView {
  item: PvpItemView;
  /** The item's level versions, lowest first (one entry: "Level 55"). */
  levels: { level: number; item: PvpItemView }[];
  /** A reward of the faction's quest at Exalted (the Darkspear Islands tabards). */
  fromQuest?: boolean;
  /** One of the Hero quest's rewards, pick one. */
  choice?: boolean;
  /** The quest that gives it, on the battleground's quests page. */
  questHref?: string;
}

export interface PvpSectionView {
  /** "5".."8" (Friendly ... Exalted), or questRewards, mounts, supplies. */
  key: string;
  entries: PvpEntryView[];
}

export interface PvpSideView {
  factionName: string;
  vendor: { name: string; where: string; portrait: string | null };
  sections: PvpSectionView[];
}

export interface PvpBgView {
  key: BgKey;
  slug: string;
  name: string;
  level: string;
  size: string;
  sides: Record<Faction, PvpSideView>;
  /** The battleground's quests page (Alterac Valley). */
  questsHref?: string;
}

/** The quest on the battleground's quests page that gives an item: its list quest (a chain step: the quest it leads to). */
function questGiving(key: BgKey, side: RawSide, itemId: number): number | null {
  const page = QUEST_PAGES[key];
  if (!page || !PVP) return null;
  const listed = new Set((data.DB[page]?.quests ?? []).map((q) => q.id));
  for (const qid of side.quests ?? []) {
    const info = PVP.quest_info[String(qid)];
    if (!info || ![...(info.items ?? []), ...(info.choice ?? [])].includes(itemId)) continue;
    if (listed.has(qid)) return qid;
    const main = [...listed].find((m) => (data.QUEST_PREREQ_CHAINS[String(m)] ?? []).some((s) => s.id === qid));
    if (main) return main;
  }
  return null;
}

export function getBattleground(slug: string, lang: Lang, langHref: (p: string) => string): PvpBgView | null {
  const key = bgBySlug(slug);
  const bg = PVP?.battlegrounds.find((b) => b.key === key);
  if (!key || !bg || !PVP) return null;
  const quests = QUEST_PAGES[key] && data.DB[QUEST_PAGES[key]!] ? langHref(`/pvp/${slug}/quests`) : undefined;
  const side = (faction: Faction): PvpSideView => {
    const s = PVP.rewards[key][faction];
    const entries = (list: unknown): PvpEntryView[] =>
      (Array.isArray(list) ? (list as RawEntry[]) : []).map((e) => {
        const r = readEntry(e);
        const levels = r.versions.map(([id, level]) => ({ level, item: pvpItem(id, r.name, r.quality) }));
        // The top version shows: the one most players look for.
        const main = levels[levels.length - 1]?.item ?? pvpItem(0, r.name, r.quality);
        const giver = quests ? questGiving(key, s, main.id) : null;
        return {
          item: main,
          levels: levels.length > 1 || (levels[0]?.level ?? 0) > 0 ? levels : [],
          ...(r.quest ? { fromQuest: true } : {}),
          ...(r.choice ? { choice: true } : {}),
          ...(giver && quests ? { questHref: `${quests}#quest-${giver}` } : {}),
        };
      });
    const sections: PvpSectionView[] = [];
    for (const n of ["5", "6", "7", "8"]) {
      const list = entries(s[n]);
      if (list.length) sections.push({ key: n, entries: list });
    }
    for (const k of ["questRewards", "mounts", "supplies"]) {
      const list = entries(s[k]);
      if (list.length) sections.push({ key: k, entries: list });
    }
    return {
      factionName: factionName(s.faction, s.factionName, lang),
      vendor: { name: s.vendor.targetName, where: zoneName(s.vendor.mapID, s.vendor.label.split(" — ")[1] ?? "", lang), portrait: portrait(s.vendor.display) },
      sections,
    };
  };
  return {
    key,
    slug,
    name: bgName(key, lang),
    level: bg.level,
    size: bg.size,
    sides: { Alliance: side("Alliance"), Horde: side("Horde") },
    ...(quests ? { questsHref: quests } : {}),
  };
}

/* ---------- Honor & Ranks ---------- */

// Which spec each Premier set is for (Systems/PvPRewards.lua SET_SPEC), as
// the Tier 0.5 roles the journal already names, and the spec's icon.
const SET_SPEC: Record<string, [string, string]> = {
  Chevalier: ["PALADIN_MELEE", "spell_holy_auraoflight"], Scaled: ["PALADIN_MELEE", "spell_holy_auraoflight"],
  Luminous: ["PALADIN_HEALER", "spell_holy_holybolt"], Lamellar: ["PALADIN_HEALER", "spell_holy_holybolt"],
  Mooncloth: ["PRIEST_HEALER", "spell_holy_guardianspirit"], Silken: ["PRIEST_HEALER", "spell_holy_guardianspirit"],
  Voidcloth: ["PRIEST_CASTER", "spell_shadow_shadowwordpain"], Satin: ["PRIEST_CASTER", "spell_shadow_shadowwordpain"],
  Flatmail: ["SHAMAN_MELEE", "spell_nature_lightningshield"], Linked: ["SHAMAN_MELEE", "spell_nature_lightningshield"],
  Scalemail: ["SHAMAN_CASTER", "spell_nature_lightning"], Mail: ["SHAMAN_CASTER", "spell_nature_lightning"],
  Linkmail: ["SHAMAN_HEALER", "spell_nature_magicimmunity"], Ringmail: ["SHAMAN_HEALER", "spell_nature_magicimmunity"],
  Beasthide: ["DRUID_FERAL", "ability_racial_bearform"], Dragonhide: ["DRUID_FERAL", "ability_racial_bearform"],
  Lunarhide: ["DRUID_CASTER", "spell_nature_starfall"], Wyrmhide: ["DRUID_CASTER", "spell_nature_starfall"],
  Dreamhide: ["DRUID_HEALER", "spell_nature_healingtouch"], Kodohide: ["DRUID_HEALER", "spell_nature_healingtouch"],
};
const CLASS_ORDER = ["WARRIOR", "PALADIN", "HUNTER", "ROGUE", "PRIEST", "SHAMAN", "MAGE", "WARLOCK", "DRUID"];
const MARK_BG: Record<number, BgKey> = { 20558: "WSG", 20559: "AB", 274895: "DI", 20560: "AV" };

export interface HonorPieceView {
  slot: number;
  rare: PvpItemView;
  epic: PvpItemView;
  cost?: { honor: number; mark: PvpItemView; marks: number };
  seal?: { item: PvpItemView; rank: number; honor: number };
}
export interface HonorSetView {
  name: string;
  /** The spec's name key (TIER05_SPEC_<CLASS>_<ROLE>, or s_spec_feral) and icon. */
  spec?: { key: string; icon: string };
  pieces: HonorPieceView[];
}
export interface HonorClassView {
  token: string;
  sets: HonorSetView[];
}
export interface HonorRankView {
  rank: number;
  item: PvpItemView;
  honor?: number;
  mark?: PvpItemView;
  marks?: number;
}
export interface HonorSideView {
  hall: { key: "PVP_HALL_A" | "PVP_HALL_H"; zone: string; vendor: string; portrait: string | null };
  classes: HonorClassView[];
  ranks: HonorRankView[];
}
export interface HonorView {
  sides: Record<Faction, HonorSideView>;
  marks: { item: PvpItemView; bg: string }[];
  field: { vendor: string; where: string; portrait: string | null };
}

export function getHonor(lang: Lang): HonorView | null {
  const H = PVP?.honor;
  if (!H) return null;
  const mark = (id: number) => pvpItem(id, undefined, 1);
  const side = (faction: Faction): HonorSideView => {
    const sets = H.sets[faction] ?? {};
    const classes = CLASS_ORDER.filter((c) => sets[c]).map((token) => ({
      token,
      sets: sets[token].map(([material, ...pieces]) => {
        const chest = pieces.find((p) => p[0] === 5) ?? pieces[0];
        const spec = SET_SPEC[material];
        return {
          name: pvpItem(chest[1], undefined, 3).name,
          ...(spec
            ? { spec: { key: spec[0] === "DRUID_FERAL" ? "s_spec_feral" : `TIER05_SPEC_${spec[0]}`, icon: `/journal/icons/${spec[1]}.webp` } }
            : {}),
          pieces: pieces.map(([slot, rare, epic]) => {
            const cost = H.slotCost[String(slot)];
            const seal = H.seals[String(slot)];
            return {
              slot,
              rare: pvpItem(rare, undefined, 3),
              epic: pvpItem(epic, undefined, 4),
              ...(cost ? { cost: { honor: cost[0], mark: mark(cost[1]), marks: cost[2] } } : {}),
              ...(seal ? { seal: { item: pvpItem(seal[0], undefined, 3), rank: seal[1], honor: seal[2] } } : {}),
            };
          }),
        };
      }),
    }));
    // What each rank unlocks: the rank rewards, the seals, the rank 14 weapons.
    const ranks: HonorRankView[] = [];
    for (const [rank, items] of Object.entries(H.ranks[faction] ?? {})) {
      for (const [id, honor, m, marks] of items) {
        ranks.push({ rank: Number(rank), item: pvpItem(id), ...(honor ? { honor } : {}), ...(m ? { mark: mark(m), marks } : {}) });
      }
    }
    for (const seal of Object.values(H.seals)) ranks.push({ rank: seal[1], item: pvpItem(seal[0], undefined, 3), honor: seal[2] });
    for (const [id, honor, m, marks] of H.weapons[faction] ?? []) {
      ranks.push({ rank: 14, item: pvpItem(id, undefined, 4), honor, ...(m ? { mark: mark(m), marks } : {}) });
    }
    ranks.sort((a, b) => a.rank - b.rank || a.item.id - b.item.id);
    const v = H.vendors[faction];
    return {
      hall: { key: faction === "Horde" ? "PVP_HALL_H" : "PVP_HALL_A", zone: zoneName(v.mapID, "", lang), vendor: v.targetName, portrait: portrait(v.display) },
      classes,
      ranks,
    };
  };
  const f = H.fieldOfHonor;
  return {
    sides: { Alliance: side("Alliance"), Horde: side("Horde") },
    marks: H.marks.map((id) => ({ item: mark(id), bg: bgName(MARK_BG[id], lang) })),
    field: { vendor: f.targetName, where: zoneName(f.mapID, "Gadgetzan", lang), portrait: portrait(f.display) },
  };
}

/* ---------- item pages: where each PvP item comes from ---------- */

export interface PvpItemSource {
  /** The page: /pvp/<slug>. */
  href: string;
  /** "Warsong Gulch" or "Honor & Ranks". */
  page: string;
  faction: Faction;
  /** "Illiyana Moonblaze, Silverwing Sentinels, Honored", "Rank 8", ... */
  note: string;
}

const STANDING_EN: Record<string, string> = { "5": "Friendly", "6": "Honored", "7": "Revered", "8": "Exalted" };

/** Every PvP item with the vendors and ranks it comes from (English, for the item pages). */
export function pvpItemSources(): Map<number, { item: PvpItemView; sources: PvpItemSource[] }> {
  const out = new Map<number, { item: PvpItemView; sources: PvpItemSource[] }>();
  if (!PVP) return out;
  const add = (item: PvpItemView, src: PvpItemSource) => {
    if (!item.id) return;
    const e = out.get(item.id) ?? { item, sources: [] };
    if (!e.sources.some((s) => s.href === src.href && s.faction === src.faction && s.note === src.note)) e.sources.push(src);
    out.set(item.id, e);
  };
  const noHref = (p: string) => p;
  for (const key of bgKeys()) {
    const view = getBattleground(BG_SLUGS[key], "en", noHref);
    if (!view) continue;
    for (const faction of ["Alliance", "Horde"] as Faction[]) {
      const s = view.sides[faction];
      for (const sec of s.sections) {
        const what =
          STANDING_EN[sec.key] ? `${s.vendor.name}, ${s.factionName} ${STANDING_EN[sec.key]}`
          : sec.key === "questRewards" ? "Quest reward"
          : sec.key === "supplies" ? `${s.vendor.name}, supplies`
          : s.vendor.name;
        for (const e of sec.entries) {
          const versions = e.levels.length ? e.levels : [{ level: 0, item: e.item }];
          for (const v of versions) {
            add(v.item, { href: `/pvp/${view.slug}`, page: view.name, faction, note: v.level ? `${what} · level ${v.level}` : what });
          }
        }
      }
    }
  }
  const honor = getHonor("en");
  if (honor) {
    for (const faction of ["Alliance", "Horde"] as Faction[]) {
      const s = honor.sides[faction];
      const page = { href: `/pvp/${HONOR_SLUG}`, page: "Honor & Ranks", faction };
      for (const c of s.classes) {
        for (const set of c.sets) {
          for (const p of set.pieces) {
            add(p.rare, { ...page, note: `${s.hall.vendor}, Premier gear` });
            add(p.epic, { ...page, note: p.seal ? `Rank ${p.seal.rank}: ${p.seal.item.name} and the rare piece` : "Premier gear" });
          }
        }
      }
      for (const r of s.ranks) add(r.item, { ...page, note: `${s.hall.vendor}, Rank ${r.rank}` });
    }
    for (const m of honor.marks) add(m.item, { href: `/pvp/${HONOR_SLUG}`, page: "Honor & Ranks", faction: "Alliance", note: `Marks of Honor · ${m.bg}` });
  }
  return out;
}
