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
  SHARED_BY_BOSS: Record<string, Record<string, LootTuple[]>>;
  meta: { addonVersion: string; dungeonCount: number };
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
  /** Creature display ID (the addon's STATIC_DISPLAY_IDS), for the portrait render. */
  displayId?: number;
  /** Head crop of the 300x300 render: [side, left, top] in px. */
  portraitCrop?: [number, number, number];
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

  return { ...summary, entrance: d.entrance, quests, hiddenQuests, bosses, trash };
}

/* ---------- quests ---------- */

export interface ChainStepFull extends ChainStep {
  slug?: string; // set when the step is a quest the journal has a page for
  detail?: PrereqDetail;
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

function buildQuest(q: RawQuest, dungeonName: string): Quest {
  const chainRaw = asList<ChainStep>(data.QUEST_PREREQ_CHAINS[String(q.id)]);
  const chain: ChainStepFull[] = chainRaw.map((s) => ({
    ...s,
    slug: slugForQuestId(s.id),
    detail: data.QUEST_PREREQ_DETAILS[String(s.id)],
  }));
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
