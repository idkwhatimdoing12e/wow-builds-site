// Typed access to data/journal.json, which scripts/lua-to-json.py generates
// straight from the addon's Data/*.lua files. Nothing here is hand-maintained.

import raw from "@/data/journal.json";
import portraitsFile from "@/data/npc-portraits.json";

/* ---------- raw shapes (mirror the Lua tables) ---------- */

// [itemId, name, slot, quality, source?, extra?]
export type LootTuple = [number, string, string, number, string?, string?];
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
  classOnly?: string;
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
  meta: { addonVersion: string; dungeonCount: number };
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
  bosses?: (RawMapPoint & { name: string; npcID?: number })[];
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

export const QUALITY_COLORS: Record<number, string> = {
  0: "#9d9d9d",
  1: "#ffffff",
  2: "#1eff00",
  3: "#0070dd",
  4: "#a335ee",
  5: "#ff8000",
};

export const QUALITY_NAMES: Record<number, string> = {
  0: "Poor",
  1: "Common",
  2: "Uncommon",
  3: "Rare",
  4: "Epic",
  5: "Legendary",
};

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
}

export type Faction = "Alliance" | "Horde";

/** The addon's QuestMatchesFaction: shared quests count for both sides. */
export function questIsFor(questFaction: string | undefined, faction: Faction): boolean {
  return !questFaction || questFaction === "Both" || questFaction === "Neutral" || questFaction === faction;
}

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
}

export interface TrashDrop {
  item: LootTuple;
  source?: string;
}

export interface Dungeon extends DungeonSummary {
  entrance?: MapPoint;
  quests: Quest[];
  hiddenQuests: Quest[];
  bosses: Boss[];
  trash: TrashDrop[];
  map?: DungeonMap;
}

function mapLabel(key: string | undefined, fallback: string, n?: number): string {
  const text = (key && data.MAP_LABELS?.[key]) || data.MAP_LABELS?.[fallback] || fallback;
  return n === undefined ? text : text.replace("%d", String(n));
}

function buildMap(name: string, slug: string, bosses: Boss[]): DungeonMap | undefined {
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
      label: mapLabel(e.labelKey, "MAP_ENTRANCE"),
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
      label: t.note ? "" : mapLabel(t.labelKey, "MAP_FLOOR", t.to),
      tip: t.note ? mapLabel(t.labelKey, "") : mapLabel(undefined, "MAP_FLOOR", t.to),
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
    };
  });
  const startFloor = Math.min(Math.max(entrances[0]?.floor ?? 1, 1), floors.length);
  const floorLabels = floors.map((_, i) => mapLabel(undefined, "MAP_FLOOR", i + 1));
  return { floors, floorLabels, startFloor, entrances, transitions, bosses: pins };
}


const PORTRAIT_CROPS = (portraitsFile as unknown as { crops: Record<string, [number, number, number]> }).crops;

function minLevelOf(range: string): number {
  const m = range.match(/\d+/);
  return m ? parseInt(m[0], 10) : 0;
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

export function getDungeon(slug: string): Dungeon | null {
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
    const loot = asList<LootTuple>(b.loot);
    if (b.trash) {
      for (const item of loot) trash.push({ item, source: item[4] });
      continue;
    }
    const main = loot.filter((it) => !isRecipe(it[2]));
    const recipes = loot.filter((it) => isRecipe(it[2]));
    const sharedRaw = asList<LootTuple>(sharedByBoss[b.name]);
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

  const map = buildMap(summary.name, summary.slug, bosses);
  return { ...summary, entrance: d.entrance, quests, hiddenQuests, bosses, trash, ...(map ? { map } : {}) };
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
  classOnly?: string;
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
  noteItem?: ItemRef;
  requiredItems: ItemRef[];
  providedItem?: ItemRef;
  chain: ChainStepFull[];
  related: { label: string; id: number; name: string; slug?: string }[];
  dungeonName: string;
  dungeonSlug: string;
  hidden: boolean;
}

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

function buildChainStep(s: ChainStep): ChainStepFull {
  const id = String(s.id);
  const items = data.PREREQ_REWARD_ITEMS_FALLBACK?.[id];
  return {
    ...s,
    slug: s.itemStep ? undefined : slugForQuestId(s.id),
    detail: data.QUEST_PREREQ_DETAILS[id],
    rewardItems: asList<RewardTuple>(items?.items),
    rewardChoice: !!items?.choice,
    xp: s.itemStep ? undefined : (data.FOREVER_QUEST_XP_FALLBACK[id] ?? data.FOREVER_QUEST_BASE_XP[id]),
    money: formatMoney(data.PREREQ_REWARD_MONEY_FALLBACK?.[id] ?? 0),
  };
}

function buildQuest(q: RawQuest, dungeonName: string): Quest {
  const chainRaw = asList<ChainStep>(data.QUEST_PREREQ_CHAINS[String(q.id)]);
  const chain: ChainStepFull[] = chainRaw.map(buildChainStep);
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
    classOnly: q.classOnly,
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
    rewardItems: asList<RewardTuple>(q.rewardItems),
    rewardChoice: !!q.rewardChoice,
    additionalRewardItems: asList<RewardTuple>(q.additionalRewardItems),
    noteRewardItems: asList<RewardTuple>(q.noteRewardItems),
    note: q.note,
    warning: q.warning,
    startItem: q.startItem,
    startObject: q.startObject,
    startMap: q.startMap ?? data.QUEST_START_MAPS[String(q.id)],
    noteItem: q.noteItem,
    requiredItems: asList<ItemRef>(q.requiredItems),
    providedItem: q.providedItem,
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
