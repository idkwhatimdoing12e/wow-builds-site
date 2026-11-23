// Typed access to data/journal.json, which scripts/lua-to-json.py generates
// straight from the addon's Data/*.lua files. Nothing here is hand-maintained.

import raw from "@/data/journal.json";
import portraitsFile from "@/data/npc-portraits.json";
import gameItemsFile from "@/data/item-game.json";
import tierItemsFile from "@/data/tier-items.json";
import { QUALITY_COLORS, QUALITY_NAMES, questIsFor, zonePin } from "./journal-shared";
// Re-exported for server code; browser components import journal-shared directly.
export { QUALITY_COLORS, QUALITY_NAMES, questIsFor, zonePin };

/* ---------- raw shapes (mirror the Lua tables) ---------- */

// [itemId, name, slot, quality, source?, extra?, tipLines?]
export type LootTuple = [number, string, string, number, string?, string?, string[]?];
// [itemId, name, quality, note?]
export type RewardTuple = [number, string, number, string?];
// [itemId, name, quality, source]
export type ItemRef = [number, string, number, string?];

export interface MapPoint {
  mapID: number;
  x: number;
  y: number;
  label?: string;
  detail?: string;
  targetName?: string;
  markerType?: string;
}

export interface RawQuest {
  id: number;
  name: string;
  level: number;
  requires: number;
  faction: "Both" | "Alliance" | "Horde";
  objective: string;
  pickup: string;
  turnin: string;
  rewardSummary?: string;
  rewards?: string;
  rewardHeader?: string;
  rewardItems?: RewardTuple[];
  rewardChoice?: boolean;
  additionalRewardItems?: RewardTuple[];
  noteRewardItems?: RewardTuple[];
  liveXPFallback?: number;
  showZeroXP?: boolean;
  note?: string;
  warning?: string;
  startsInDungeon?: boolean;
  hideFromMainList?: boolean;
  /** One class token, or since addon 2.1.0 a list of them ("Warrior, Paladin only"). */
  classOnly?: string | string[];
  repeatable?: boolean;
  attunement?: string;
  profession?: string;
  startItem?: ItemRef;
  startObject?: [string, string, string];
  startMap?: MapPoint;
  noteItem?: ItemRef;
  noteItemMap?: MapPoint;
  requiredItems?: ItemRef[];
  requiredItem?: [number, string, number, number];
  providedItem?: ItemRef;
  noteQuestLink?: { id: number; name: string };
  leadsToQuestLink?: { id: number; name: string };
  startQuestLink?: { id: number; name: string };
}

export interface RawBoss {
  name: string;
  npcID?: number;
  description?: string;
  aliases?: string[];
  loot?: LootTuple[];
  rare?: boolean;
  trash?: boolean;
  summonItem?: number;
  factionOnly?: "Alliance" | "Horde";
  customIcon?: string;
}

export interface RawDungeon {
  level: string;
  location: string;
  description: string;
  icon: string;
  quests: RawQuest[];
  bosses: RawBoss[];
  entrance?: MapPoint;
  previewOnly?: boolean;
  fullItemsTBD?: boolean;
}

export interface ChainStep {
  id: number;
  name: string;
  /** An item to collect rather than a quest (e.g. a punch card). */
  itemStep?: boolean;
}

export interface PrereqDetail {
  level?: number;
  requires?: number;
  objective?: string;
  pickup?: string;
  turnin?: string;
  map?: MapPoint;
  note?: string;
  faction?: string;
  description?: string;
  suppressDescription?: boolean;
  warning?: string;
  startItem?: ItemRef;
  startObject?: [string, string, string];
  providedItem?: ItemRef;
  requiredItems?: ItemRef[];
  startsInDungeon?: boolean;
}

interface JournalData {
  DB: Record<string, RawDungeon>;
  ORDER: string[];
  BOSS_LEVELS: Record<string, Record<string, string>>;
  STATIC_DISPLAY_IDS: Record<string, number>;
  QUEST_START_MAPS: Record<string, MapPoint>;
  QUEST_PREREQ_CHAINS: Record<string, ChainStep[]>;
  QUEST_PREREQ_DETAILS: Record<string, PrereqDetail>;
  FOREVER_QUEST_XP_FALLBACK: Record<string, number>;
  FOREVER_QUEST_BASE_XP: Record<string, number>;
  PREREQ_REWARD_ITEMS_FALLBACK: Record<string, { choice?: boolean; items?: RewardTuple[] }>;
  PREREQ_REWARD_MONEY_FALLBACK: Record<string, number>;
  SHARED_BY_BOSS: Record<string, Record<string, LootTuple[]>>;
  DUNGEON_MAPS?: Record<string, RawDungeonMap>;
  MAP_LABELS?: Record<string, string>;
  FOREVER_DUNGEONS?: Record<string, boolean>;
  /** The addon's search abbreviations (Data/DungeonAliases.lua): "rfc", "sm gy"... */
  DUNGEON_SEARCH_ALIASES?: Record<string, string[]>;
  meta: { addonVersion: string; dungeonCount: number };
  /** The addon's pages that are one quest chain, not a dungeon (lua-to-json.py). */
  PAGES?: { SLEEPING_BAG_PAGE?: string; ONYXIA_PAGE?: string; SLEEPING_BAG_ITEM?: number };
  /** A chain page's other faction, where its chain differs (the Sleeping Bag's Horde). */
  FACTION_VARIANTS?: Record<string, Partial<Record<Faction, FactionVariant>>>;
  TIER_SETS?: RawTierSets;
}

interface FactionVariant {
  quest: number;
  chain: ChainStep[];
  details: Record<string, PrereqDetail>;
}

interface RawTierSets {
  classes: string[];
  tier0: Record<string, { name: string; items: number[] }>;
  tier05: Record<string, { name: string; versions: { role?: string; items: number[] }[] }>;
  /** For each piece (Head ... Feet), which of the four Tier 0.5 quests gives it (1-4). */
  pieceQuest: number[];
  quests05: number[];
  quests05Names: string[];
  specIcons: Record<string, Record<string, string>>;
}

/* ---------- Map tab (the addon's FDJ.DUNGEON_MAPS) ---------- */

interface RawMapPoint {
  floor?: number;
  x: number;
  y: number;
}
type RawEntrance = RawMapPoint & { angle?: number; labelPos?: string; labelKey?: string; color?: number[] };
interface RawDungeonMap {
  floors: unknown[];
  entrance?: RawEntrance;
  entrances?: RawEntrance[];
  transitions?: (RawMapPoint & { to?: number; note?: boolean; labelKey?: string })[];
  bosses?: (RawMapPoint & { name: string; npcID?: number; quest?: number | number[] })[];
}

export interface MapEntrance {
  floor: number;
  x: number;
  y: number;
  label: string;
  /** Where the label sits relative to the swirl, from the addon's angle/labelPos. */
  side: "left" | "right" | "top";
  color?: string;
}
export interface MapTransition {
  floor: number;
  x: number;
  y: number;
  to?: number;
  /** Shown above the ladder ("Level 2"); empty for note-only markers. */
  label: string;
  /** Hover text. */
  tip: string;
}
export interface MapBossPin {
  floor: number;
  x: number;
  y: number;
  name: string;
  /** Index into Dungeon.bosses, when the pin is a journal boss. */
  bossIndex?: number;
  displayId?: number;
  portraitCrop?: [number, number, number];
  customPortrait?: string;
  /**
   * A quest's target, not a boss (Tunk, Zalfan Moonshadow, Highland Horror):
   * the quest IDs it is for, one per faction where they differ. The addon
   * shows it only for a quest in the list, badged, and opens the quest on a click.
   */
  quests?: number[];
}
export interface DungeonMap {
  floors: string[]; // image URLs, level 1 first
  floorLabels: string[]; // "Level 1", "Level 2", ...
  startFloor: number;
  entrances: MapEntrance[];
  transitions: MapTransition[];
  bosses: MapBossPin[];
}

const data = raw as unknown as JournalData;

/* ---------- helpers ---------- */

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function asList<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

/**
 * A Lua table that carries both a tuple and named keys -- a loot item with its
 * tooltip, a required item with its map -- reaches the JSON as an object keyed
 * "1".."n" rather than an array, so read the tuple out of either shape.
 */
function tupleParts(v: unknown): unknown[] | null {
  if (Array.isArray(v)) return v.slice();
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  if (o["1"] === undefined) return null;
  const parts: unknown[] = [];
  for (let i = 1; o[String(i)] !== undefined; i++) parts.push(o[String(i)]);
  return parts;
}

/** The game's text escapes (colour codes, inline coin icons) as plain text. */
function plainText(s: string): string {
  return s
    .replace(/\|c[0-9a-fA-F]{8}/g, "")
    .replace(/\|r/g, "")
    .replace(/\|T[^|]*UI-GoldIcon[^|]*\|t/g, "g")
    .replace(/\|T[^|]*UI-SilverIcon[^|]*\|t/g, "s")
    .replace(/\|T[^|]*UI-CopperIcon[^|]*\|t/g, "c")
    .replace(/\|T[^|]*\|t/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** The addon's tooltip body. A nested table is one line split left and right. */
function tipLines(v: unknown): string[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const lines = v
    .map((l) => (Array.isArray(l) ? l.map(String).join("  ") : typeof l === "string" ? l : ""))
    .map(plainText)
    .filter(Boolean);
  return lines.length > 0 ? lines : undefined;
}

// Item name and quality as the game client has them (the in-game dump,
// scripts/item-dump/to-json.py). The addon's data has some wrong: a green item
// listed as blue, a placeholder name. The game wins wherever it is known.
const GAME_ITEMS = gameItemsFile as unknown as Record<string, [string, number]>;
function gameName(id: number, name: string): string {
  return GAME_ITEMS[String(id)]?.[0] ?? name;
}
function gameQuality(id: number, quality: number): number {
  return GAME_ITEMS[String(id)]?.[1] ?? quality;
}

function asLoot(v: unknown): LootTuple[] {
  return asList<unknown>(v).flatMap((entry) => {
    const parts = tupleParts(entry);
    if (!parts) return [];
    const [id, name, slot, quality, source, extra] = parts as LootTuple;
    const tip = tipLines((entry as { tip?: unknown })?.tip);
    const n = Number(id) || 0;
    return [[n, gameName(n, String(name ?? "")), String(slot ?? ""), gameQuality(n, Number(quality ?? 1)), source, extra, tip] as LootTuple];
  });
}

function asItemRef(v: unknown): ItemRef | undefined {
  const parts = tupleParts(v);
  if (!parts) return undefined;
  const [id, name, quality, source] = parts as ItemRef;
  const n = Number(id) || 0;
  return [n, gameName(n, String(name ?? "")), gameQuality(n, Number(quality ?? 1)), source];
}

/** Quest rewards: [id, name, quality, note?], corrected like the rest. */
function asRewards(v: unknown): RewardTuple[] {
  return asList<unknown>(v).flatMap((entry) => {
    const parts = tupleParts(entry);
    if (!parts) return [];
    const [id, name, quality, note] = parts as RewardTuple;
    const n = Number(id) || 0;
    return [[n, gameName(n, String(name ?? "")), gameQuality(n, Number(quality ?? 1)), note] as RewardTuple];
  });
}

function asItemRefs(v: unknown): ItemRef[] {
  return asList<unknown>(v)
    .map(asItemRef)
    .filter((it): it is ItemRef => it !== undefined);
}

export function isRecipe(slot: string): boolean {
  const s = slot.toLowerCase();
  return s.startsWith("recipe") || s.endsWith("recipe") || s.startsWith("pattern") || s.startsWith("plans") || s.startsWith("schematic") || s.startsWith("formula");
}

/* ---------- dungeons ---------- */

export interface DungeonSummary {
  slug: string;
  name: string;
  level: string;
  minLevel: number;
  location: string;
  description: string;
  previewOnly: boolean;
  fullItemsTBD: boolean;
  questCount: number;
  /** New in WoW Forever (the addon's FDJ.FOREVER_DUNGEONS), for the Forever emblem filter. */
  forever: boolean;
  /** Quests the addon's home card counts for each faction (no repeatables). */
  questsByFaction: Record<Faction, number>;
  bossCount: number;
  /** Abbreviations the addon's search knows ("rfc", "bfd", "sm gy"). */
  aliases: string[];
}

export type Faction = "Alliance" | "Horde";

export interface Boss {
  name: string;
  npcID?: number;
  /** Creature display ID (the addon's STATIC_DISPLAY_IDS) for the Wowhead model preview. */
  displayId?: number;
  /** Head crop of that 300x300 preview: [side, left, top] in px. */
  portraitCrop?: [number, number, number];
  /** The addon's own picture for bosses without a model (customIcon). */
  customPortrait?: string;
  description?: string;
  level?: string;
  rare: boolean;
  factionOnly?: "Alliance" | "Horde";
  summonItem?: number;
  loot: LootTuple[];
  recipes: LootTuple[];
  shared: LootTuple[];
  /** RPG Mode on the character page: not found yet, shown as "???" with how to reveal it. */
  rpgHidden?: boolean;
}

export interface TrashDrop {
  item: LootTuple;
  source?: string;
}

export interface Dungeon extends DungeonSummary {
  /** One quest chain, not a dungeon (Onyxia Attunement, Cozy Sleeping Bag): its Quests tab only. */
  chainPage?: boolean;
  entrance?: MapPoint;
  quests: Quest[];
  hiddenQuests: Quest[];
  bosses: Boss[];
  trash: TrashDrop[];
  map?: DungeonMap;
}

/** Translated map labels (the addon's MAP_* strings for a language), when given. */
type Labels = Record<string, string> | undefined;

function mapLabel(key: string | undefined, fallback: string, n?: number, labels?: Labels): string {
  const text =
    (key && (labels?.[key] || data.MAP_LABELS?.[key])) || labels?.[fallback] || data.MAP_LABELS?.[fallback] || fallback;
  return n === undefined ? text : text.replace("%d", String(n));
}

function buildMap(name: string, slug: string, bosses: Boss[], labels?: Labels): DungeonMap | undefined {
  const m = data.DUNGEON_MAPS?.[name];
  if (!m || !m.floors?.length) return undefined;
  const floors = m.floors.map((_, i) => `/journal/maps/${slug}-${i + 1}.webp`);
  const entrances = (m.entrances ?? (m.entrance ? [m.entrance] : [])).map((e) => {
    const rad = ((e.angle ?? 0) * Math.PI) / 180;
    const side: MapEntrance["side"] = e.labelPos === "top" ? "top" : Math.cos(rad) < -0.3 ? "left" : "right";
    const c = e.color;
    return {
      floor: e.floor ?? 1,
      x: e.x,
      y: e.y,
      label: mapLabel(e.labelKey, "MAP_ENTRANCE", undefined, labels),
      side,
      color: c ? `rgb(${c.map((v) => Math.round(v * 255)).join(",")})` : undefined,
    };
  });
  const transitions = (m.transitions ?? [])
    .filter((t) => t.note || (t.to && t.to <= floors.length))
    .map((t) => ({
      floor: t.floor ?? 1,
      x: t.x,
      y: t.y,
      to: t.note ? undefined : t.to,
      label: t.note ? "" : mapLabel(t.labelKey, "MAP_FLOOR", t.to, labels),
      tip: t.note ? mapLabel(t.labelKey, "", undefined, labels) : mapLabel(undefined, "MAP_FLOOR", t.to, labels),
    }));
  const pins = (m.bosses ?? []).map((b) => {
    const bossIndex = bosses.findIndex((x) => x.name === b.name);
    const boss = bosses[bossIndex];
    const displayId = boss?.displayId ?? (b.npcID ? data.STATIC_DISPLAY_IDS[String(b.npcID)] : undefined);
    return {
      floor: b.floor ?? 1,
      x: b.x,
      y: b.y,
      name: b.name,
      bossIndex: bossIndex >= 0 ? bossIndex : undefined,
      displayId,
      portraitCrop: displayId ? PORTRAIT_CROPS[String(displayId)] : undefined,
      customPortrait: boss?.customPortrait,
      ...(b.quest ? { quests: [b.quest].flat().map(Number) } : {}),
    };
  });
  const startFloor = Math.min(Math.max(entrances[0]?.floor ?? 1, 1), floors.length);
  const floorLabels = floors.map((_, i) => mapLabel(undefined, "MAP_FLOOR", i + 1, labels));
  return { floors, floorLabels, startFloor, entrances, transitions, bosses: pins };
}


const PORTRAIT_CROPS = (portraitsFile as unknown as { crops: Record<string, [number, number, number]> }).crops;

function minLevelOf(range: string): number {
  const m = range.match(/\d+/);
  return m ? parseInt(m[0], 10) : 0;
}

/**
 * RPG Mode's Journey counts one page per released dungeon that has a final
 * boss to kill (Systems/RPGMode.lua, Build): the last boss that is neither
 * trash nor a rare, found by NPC ID, or failing that by name.
 */
export function hasJourneyPage(name: string): boolean {
  const d = data.DB[name];
  if (!d || d.previewOnly) return false;
  return asList<RawBoss & { recipeTab?: boolean }>(d.bosses).some(
    (b) => b && !b.trash && !b.rare && (!!b.npcID || (!b.recipeTab && typeof b.name === "string")),
  );
}

export function getDungeonSummaries(): DungeonSummary[] {
  return data.ORDER.filter((n) => data.DB[n]).map((name) => {
    const d = data.DB[name];
    const quests = asList<RawQuest>(d.quests).filter((q) => q && q.id);
    const bosses = asList<RawBoss>(d.bosses).filter((b) => b && !b.trash);
    const counted = quests.filter((q) => !q.hideFromMainList && !q.repeatable);
    return {
      slug: slugify(name),
      name,
      level: d.level,
      minLevel: minLevelOf(d.level),
      location: d.location,
      description: d.description,
      previewOnly: !!d.previewOnly,
      fullItemsTBD: !!d.fullItemsTBD,
      questCount: quests.filter((q) => !q.hideFromMainList).length,
      forever: !!data.FOREVER_DUNGEONS?.[name],
      aliases: asList<string>(data.DUNGEON_SEARCH_ALIASES?.[name]).filter((a) => typeof a === "string"),
      questsByFaction: {
        Alliance: counted.filter((q) => questIsFor(q.faction, "Alliance")).length,
        Horde: counted.filter((q) => questIsFor(q.faction, "Horde")).length,
      },
      bossCount: bosses.length,
    };
  });
}

export function getDungeonSlugs(): string[] {
  return getDungeonSummaries().map((d) => d.slug);
}

export function getDungeon(slug: string, labels?: Labels): Dungeon | null {
  const summary = getDungeonSummaries().find((d) => d.slug === slug);
  if (!summary) return null;
  const d = data.DB[summary.name];
  const rawQuests = asList<RawQuest>(d.quests).filter((q) => q && q.id);
  const quests = rawQuests.filter((q) => !q.hideFromMainList).map((q) => buildQuest(q, summary.name));
  const hiddenQuests = rawQuests.filter((q) => q.hideFromMainList).map((q) => buildQuest(q, summary.name));

  const levels = data.BOSS_LEVELS[summary.name] ?? {};
  const sharedByBoss = data.SHARED_BY_BOSS[summary.name] ?? {};
  const bosses: Boss[] = [];
  const trash: TrashDrop[] = [];

  for (const b of asList<RawBoss>(d.bosses)) {
    if (!b || !b.name) continue;
    const loot = asLoot(b.loot);
    if (b.trash) {
      for (const item of loot) trash.push({ item, source: item[4] });
      continue;
    }
    const main = loot.filter((it) => !isRecipe(it[2]));
    const recipes = loot.filter((it) => isRecipe(it[2]));
    const sharedRaw = asLoot(sharedByBoss[b.name]);
    const seen = new Set(loot.map((it) => it[0]));
    const shared = sharedRaw.filter((it) => !seen.has(it[0]));
    const displayId = b.npcID ? data.STATIC_DISPLAY_IDS[String(b.npcID)] : undefined;
    bosses.push({
      name: b.name,
      npcID: b.npcID,
      displayId,
      portraitCrop: displayId ? PORTRAIT_CROPS[String(displayId)] : undefined,
      customPortrait: b.customIcon ? `/journal/portraits/custom-${slugify(b.name)}.webp` : undefined,
      description: b.description,
      level: levels[b.name],
      rare: !!b.rare,
      factionOnly: b.factionOnly,
      summonItem: b.summonItem,
      loot: main,
      recipes,
      shared,
    });
  }

  const map = buildMap(summary.name, summary.slug, bosses, labels);
  return { ...summary, entrance: d.entrance, quests, hiddenQuests, bosses, trash, ...(map ? { map } : {}) };
}

/* ---------- quest chain pages (the addon's questChainPage) ---------- */

/** The addon's quest-chain pages the site shows. */
function chainPageNames(): string[] {
  const p = data.PAGES ?? {};
  return [p.SLEEPING_BAG_PAGE, p.ONYXIA_PAGE].filter((n): n is string => !!n && !!data.DB[n]);
}

export function getChainPageSlugs(): string[] {
  return chainPageNames().map(slugify);
}

/** Which page a slug is, for the home tabs. */
export function chainPageKind(slug: string): "sleeping-bag" | "onyxia" | null {
  const p = data.PAGES ?? {};
  if (p.SLEEPING_BAG_PAGE && slugify(p.SLEEPING_BAG_PAGE) === slug) return "sleeping-bag";
  if (p.ONYXIA_PAGE && slugify(p.ONYXIA_PAGE) === slug) return "onyxia";
  return null;
}

/**
 * A quest-chain page as a Dungeon with quests only. Where the addon swaps the
 * chain for the other faction (the Sleeping Bag: step 1 is each side's own
 * quest, step 2 starts at that side's plank), that faction gets its own copy
 * of the quest, with its chain.
 */
export function getChainPage(slug: string): Dungeon | null {
  const name = chainPageNames().find((n) => slugify(n) === slug);
  if (!name) return null;
  const d = data.DB[name];
  const raws = asList<RawQuest>(d.quests).filter((q) => q && q.id);
  const variants = Object.entries(data.FACTION_VARIANTS?.[name] ?? {}) as [Faction, FactionVariant][];
  const quests: Quest[] = [];
  for (const q of raws) {
    const built = buildQuest(q, name);
    quests.push(built);
    for (const [faction, v] of variants) {
      if (v.quest !== q.id || faction === q.faction) continue;
      quests.push({ ...built, faction, chain: v.chain.map((s) => buildChainStep(s, v.details[String(s.id)])) });
    }
  }
  const counted = quests.filter((q) => !q.repeatable);
  return {
    slug,
    name,
    level: d.level,
    minLevel: minLevelOf(d.level),
    location: d.location ?? "",
    description: d.description ?? "",
    previewOnly: false,
    fullItemsTBD: false,
    questCount: quests.length,
    forever: false,
    aliases: [],
    questsByFaction: {
      Alliance: counted.filter((q) => questIsFor(q.faction, "Alliance")).length,
      Horde: counted.filter((q) => questIsFor(q.faction, "Horde")).length,
    },
    bossCount: 0,
    chainPage: true,
    quests,
    hiddenQuests: [],
    bosses: [],
    trash: [],
  };
}

/* ---------- Tier Sets (the addon's Systems/TierSets.lua) ---------- */

export interface TierPiece {
  id: number;
  name: string;
  quality: number;
  /** Has an item page on the site (every piece a boss drops). */
  page: boolean;
  /** Every boss (or the trash) whose loot lists it, in the journal's dungeon order. */
  sources: { boss: string; dungeon: string; dungeonSlug: string; bossIndex: number; trash?: boolean }[];
  /** Tier 0.5: which of the four quests gives it (index into TierSets.quests). */
  quest?: number;
}

export interface TierClass {
  token: string;
  tier0: { name: string; pieces: TierPiece[] };
  tier05: { name: string; versions: { role?: string; specIcon?: string; pieces: TierPiece[] }[] } | null;
}

export interface TierSets {
  classes: TierClass[];
  /** The Tier 0.5 quests, in order (An Earnest Proposition ... Saving the Best for Last). */
  quests: { id: number; name: string }[];
}

const TIER_ITEMS = tierItemsFile as unknown as Record<string, [string, number]>;

/** Tier Sets: each class's Tier 0 and Tier 0.5 pieces, Head to Feet, and where each comes from. */
export function getTierSets(): TierSets | null {
  const t = data.TIER_SETS;
  if (!t) return null;
  // Where every item drops: boss loot across the journal's dungeons. The index
  // is the boss's place in the page's Bosses list (trash is not in it).
  const drops = new Map<number, { item: LootTuple; source: TierPiece["sources"][number] }[]>();
  for (const name of data.ORDER) {
    const d = data.DB[name];
    if (!d || d.previewOnly) continue;
    let index = 0;
    for (const b of asList<RawBoss>(d.bosses)) {
      if (!b || !b.name) continue;
      // Trash Drops count too, as in the addon (the Tier 0 belts drop from trash).
      const source = { boss: b.name, dungeon: name, dungeonSlug: slugify(name), bossIndex: b.trash ? -1 : index, ...(b.trash ? { trash: true } : {}) };
      for (const item of asLoot(b.loot)) {
        const list = drops.get(item[0]) ?? [];
        list.push({ item, source });
        drops.set(item[0], list);
      }
      if (!b.trash) index++;
    }
  }
  const piece = (id: number, quest?: number): TierPiece => {
    const found = drops.get(id) ?? [];
    const own = TIER_ITEMS[String(id)];
    const first = found[0]?.item;
    return {
      id,
      name: GAME_ITEMS[String(id)]?.[0] ?? first?.[1] ?? own?.[0] ?? `Item ${id}`,
      quality: GAME_ITEMS[String(id)]?.[1] ?? own?.[1] ?? first?.[3] ?? 3,
      page: found.length > 0,
      sources: found.map((f) => f.source),
      ...(quest !== undefined ? { quest } : {}),
    };
  };
  return {
    quests: t.quests05.map((id, i) => ({ id, name: t.quests05Names[i] ?? "" })),
    classes: t.classes.map((token) => {
      const s0 = t.tier0[token];
      const s05 = t.tier05[token];
      return {
        token,
        tier0: { name: s0?.name ?? "", pieces: (s0?.items ?? []).map((id) => piece(id)) },
        tier05: s05
          ? {
              name: s05.name,
              versions: s05.versions.map((v) => ({
                role: v.role,
                specIcon: v.role ? t.specIcons[token]?.[v.role]?.toLowerCase() : undefined,
                pieces: v.items.map((id, i) => piece(id, (t.pieceQuest[i] ?? 1) - 1)),
              })),
            }
          : null,
      };
    }),
  };
}

/* ---------- quests ---------- */

export interface ChainStepFull extends ChainStep {
  slug?: string; // set when the step is a quest the journal has a page for
  detail?: PrereqDetail;
  /** Rewards as the addon shows them for a prerequisite (its fallback tables). */
  rewardItems: RewardTuple[];
  rewardChoice: boolean;
  xp?: number;
  /** Money reward as "2g 65s 10c". */
  money?: string;
}

export interface Quest {
  slug: string;
  id: number;
  name: string;
  level: number;
  requires: number;
  faction: RawQuest["faction"];
  /** Class tokens the quest is for; absent when any class can take it. */
  classOnly?: string[];
  objective: string;
  pickup: string;
  turnin: string;
  startsInDungeon: boolean;
  repeatable: boolean;
  attunement?: string;
  profession?: string;
  xp?: number;
  rewardSummary?: string;
  rewardsText?: string;
  rewardHeader?: string;
  rewardItems: RewardTuple[];
  rewardChoice: boolean;
  additionalRewardItems: RewardTuple[];
  noteRewardItems: RewardTuple[];
  note?: string;
  warning?: string;
  startItem?: ItemRef;
  startObject?: [string, string, string];
  startMap?: MapPoint;
  /** The start pinned on its zone picture, for the "Show on map" button. */
  startZone?: ZonePin;
  noteItem?: ItemRef;
  requiredItems: ItemRef[];
  providedItem?: ItemRef;
  chain: ChainStepFull[];
  related: { label: string; id: number; name: string; slug?: string }[];
  dungeonName: string;
  dungeonSlug: string;
  hidden: boolean;
}

/**
 * A quest start placed on its zone picture. The pictures are built by
 * scripts/convert-zone-maps.py, one per uiMapID the quest data points at, so a
 * new zone in the data needs that script re-run before a pin can show.
 */
export interface ZonePin {
  src: string;
  /** Normalised 0-1 position on the zone picture, as the addon stores it. */
  x: number;
  y: number;
  label: string;
  targetName?: string;
}

/**
 * The zone maps that were actually built. WoW Forever has zones of its own -
 * Riverglades, for one - that Blizzard's texture repo has never heard of, so
 * the addon can point at a mapID this site has no picture for.
 */

function questSlug(id: number, name: string): string {
  return `${id}-${slugify(name)}`;
}

let questIndex: Map<number, { quest: RawQuest; dungeons: string[] }> | null = null;

function buildQuestIndex() {
  if (questIndex) return questIndex;
  questIndex = new Map();
  for (const name of data.ORDER) {
    const d = data.DB[name];
    if (!d) continue;
    for (const q of asList<RawQuest>(d.quests)) {
      if (!q || !q.id) continue;
      const entry = questIndex.get(q.id);
      if (entry) entry.dungeons.push(name);
      else questIndex.set(q.id, { quest: q, dungeons: [name] });
    }
  }
  return questIndex;
}

function slugForQuestId(id: number): string | undefined {
  const e = buildQuestIndex().get(id);
  return e ? questSlug(e.quest.id, e.quest.name) : undefined;
}

/** Copper to the game's "2g 65s 10c". */
function formatMoney(copper: number): string | undefined {
  if (!copper || copper <= 0) return undefined;
  const g = Math.floor(copper / 10000);
  const s = Math.floor((copper % 10000) / 100);
  const c = copper % 100;
  return [g && `${g}g`, s && `${s}s`, c && `${c}c`].filter(Boolean).join(" ");
}

/** The item tuples in a chain step's detail need the same reading as a quest's. */
function buildPrereqDetail(d?: PrereqDetail): PrereqDetail | undefined {
  if (!d) return undefined;
  return {
    ...d,
    startItem: asItemRef(d.startItem),
    providedItem: asItemRef(d.providedItem),
    requiredItems: asItemRefs(d.requiredItems),
  };
}

function buildChainStep(s: ChainStep, detailOverride?: PrereqDetail): ChainStepFull {
  const id = String(s.id);
  const items = data.PREREQ_REWARD_ITEMS_FALLBACK?.[id];
  return {
    ...s,
    slug: s.itemStep ? undefined : slugForQuestId(s.id),
    detail: buildPrereqDetail(detailOverride ?? data.QUEST_PREREQ_DETAILS[id]),
    rewardItems: asRewards(items?.items),
    rewardChoice: !!items?.choice,
    xp: s.itemStep ? undefined : (data.FOREVER_QUEST_XP_FALLBACK[id] ?? data.FOREVER_QUEST_BASE_XP[id]),
    money: formatMoney(data.PREREQ_REWARD_MONEY_FALLBACK?.[id] ?? 0),
  };
}

function buildQuest(q: RawQuest, dungeonName: string): Quest {
  const chainRaw = asList<ChainStep>(data.QUEST_PREREQ_CHAINS[String(q.id)]);
  const chain: ChainStepFull[] = chainRaw.map((s) => buildChainStep(s));
  const related: Quest["related"] = [];
  const push = (label: string, l?: { id: number; name: string }) => {
    if (l) related.push({ label, id: l.id, name: l.name, slug: slugForQuestId(l.id) });
  };
  push("Starts with", q.startQuestLink);
  push("Leads to", q.leadsToQuestLink);
  push("See also", q.noteQuestLink);

  const xp = q.liveXPFallback ?? data.FOREVER_QUEST_XP_FALLBACK[String(q.id)] ?? data.FOREVER_QUEST_BASE_XP[String(q.id)];

  return {
    slug: questSlug(q.id, q.name),
    id: q.id,
    name: q.name,
    level: q.level,
    requires: q.requires,
    faction: q.faction ?? "Both",
    classOnly: q.classOnly ? [q.classOnly].flat() : undefined,
    objective: q.objective,
    pickup: q.pickup,
    turnin: q.turnin,
    startsInDungeon: !!q.startsInDungeon,
    repeatable: !!q.repeatable,
    attunement: q.attunement,
    profession: q.profession,
    xp: q.showZeroXP ? 0 : xp,
    rewardSummary: q.rewardSummary || undefined,
    rewardsText: q.rewards,
    rewardHeader: q.rewardHeader,
    rewardItems: asRewards(q.rewardItems),
    rewardChoice: !!q.rewardChoice,
    additionalRewardItems: asRewards(q.additionalRewardItems),
    noteRewardItems: asRewards(q.noteRewardItems),
    note: q.note,
    warning: q.warning,
    startItem: asItemRef(q.startItem),
    startObject: q.startObject,
    startMap: q.startMap ?? data.QUEST_START_MAPS[String(q.id)],
    startZone: zonePin(q.startMap ?? data.QUEST_START_MAPS[String(q.id)]),
    noteItem: asItemRef(q.noteItem),
    requiredItems: asItemRefs(q.requiredItems),
    providedItem: asItemRef(q.providedItem),
    chain,
    related,
    dungeonName,
    dungeonSlug: slugify(dungeonName),
    hidden: !!q.hideFromMainList,
  };
}

export interface QuestPage {
  quest: Quest;
  dungeons: { name: string; slug: string }[];
}

export function getQuestSlugs(): string[] {
  const out: string[] = [];
  for (const [, e] of buildQuestIndex()) out.push(questSlug(e.quest.id, e.quest.name));
  return out;
}

export function getQuestBySlug(slug: string): QuestPage | null {
  const id = parseInt(slug.split("-")[0], 10);
  if (!id) return null;
  const e = buildQuestIndex().get(id);
  if (!e) return null;
  const canonical = questSlug(e.quest.id, e.quest.name);
  if (canonical !== slug) return null;
  return {
    quest: buildQuest(e.quest, e.dungeons[0]),
    dungeons: e.dungeons.map((n) => ({ name: n, slug: slugify(n) })),
  };
}

export const journalMeta = data.meta;

/** English UI text from the addon's locale table (tooltips of the home emblems). */
export function uiLabel(key: string, fallback: string): string {
  return data.MAP_LABELS?.[key] ?? fallback;
}
