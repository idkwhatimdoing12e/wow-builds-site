// Every item the journal shows, with every place it comes from, for the
// /item pages. Built on the server from the same data the dungeon and quest
// pages use, so an item page lists exactly what those pages show.

import notesFile from "@/data/item-notes.json";
import tooltipsFile from "@/data/item-tooltips.json";
import slotsFile from "@/data/item-slots.json";
import tierTooltipsFile from "@/data/tier-tooltips.json";
import {
  getDungeon,
  getDungeonSlugs,
  getTierSets,
  QUALITY_NAMES,
  type ItemRef,
  type LootTuple,
  type Quest,
  type RewardTuple,
} from "./journal";
import { itemIconSrc, itemSlug } from "./items";
import type { ItemTip, TooltipLine } from "./item-tip";

/** How the item is tied to a dungeon, boss or quest. */
export type SourceKind =
  | "drop" // a boss's own loot
  | "shared" // a loot table shared by several bosses
  | "recipe" // a boss's recipe drops
  | "trash" // trash mobs in the dungeon
  | "reward" // quest reward ("You receive")
  | "choice" // quest reward, pick one
  | "also" // quest's additional reward
  | "later" // reward later in the quest's chain
  | "starts" // starts the quest
  | "needed" // the quest needs it ("You will need")
  | "provided"; // the quest hands it to you

export interface ItemSource {
  kind: SourceKind;
  /** Absent for a Tier 0.5 piece: its quest belongs to no dungeon. */
  dungeon?: { name: string; slug: string };
  /** Bosses: the name and its place in the dungeon's boss list (for #boss-N). */
  boss?: { name: string; index: number };
  /** Quests: slug is absent for a chain step the journal has no page for. */
  quest?: { id: number; name: string; slug?: string; faction?: string };
  /** The addon's own note on the drop or reward ("Alliance only", a drop source, ...). */
  note?: string;
}

export interface ItemNotes {
  /** Your own text, one paragraph per entry. */
  notes?: string[];
  /** Links to add under the notes (guides, videos). */
  links?: { label: string; url: string }[];
}

export interface ItemEntry {
  id: number;
  slug: string;
  name: string;
  quality: number;
  qualityName: string;
  /** "Back, Cloth", as the addon lists it in loot. Quest rewards carry none. */
  slot?: string;
  /** Tooltip lines the addon carries for some items. */
  tip?: string[];
  icon: string;
  sources: ItemSource[];
  extra?: ItemNotes;
  /** The full tooltip as the game shows it, once /djdump has been run. */
  lines?: TooltipLine[];
}

const NOTES = (notesFile as { items?: Record<string, ItemNotes> }).items ?? {};
const TOOLTIPS = (tooltipsFile as { items?: Record<string, TooltipLine[]> }).items ?? {};
// Forever's Tier 0.5 pieces, which the dump has not seen yet
// (scripts/item-dump/tier-tooltips.py). The dump's own lines win.
const TIER_TOOLTIPS = tierTooltipsFile as Record<string, TooltipLine[]>;
// "One-Hand, Mace" from the client's Item table (scripts/item-dump/item-slots.py),
// for items the loot lists give no slot.
const SLOTS = slotsFile as Record<string, string>;

let index: Map<number, ItemEntry> | null = null;

function buildIndex(): Map<number, ItemEntry> {
  if (index) return index;
  const out = new Map<number, ItemEntry>();
  const seen = new Set<string>();

  const add = (
    id: number,
    name: string,
    quality: number,
    source: ItemSource,
    extra: { slot?: string; tip?: string[] } = {},
  ) => {
    if (!id || id <= 0 || !name) return;
    let e = out.get(id);
    if (!e) {
      e = {
        id,
        slug: itemSlug(id, name),
        name,
        quality,
        qualityName: QUALITY_NAMES[quality] ?? "",
        icon: itemIconSrc(id),
        sources: [],
        ...(NOTES[String(id)] ? { extra: NOTES[String(id)] } : {}),
        ...(TOOLTIPS[String(id)]?.length
          ? { lines: TOOLTIPS[String(id)] }
          : TIER_TOOLTIPS[String(id)]?.length
            ? { lines: TIER_TOOLTIPS[String(id)] }
            : {}),
      };
      out.set(id, e);
    }
    // Loot rows know the slot and the addon's tooltip lines; rewards do not.
    if (extra.slot && !e.slot) e.slot = extra.slot;
    if (extra.tip?.length && !e.tip) e.tip = extra.tip;
    const key = [id, source.kind, source.dungeon?.slug ?? "", source.boss?.name ?? "", source.quest?.id ?? ""].join("|");
    if (seen.has(key)) return;
    seen.add(key);
    e.sources.push(source);
  };

  const loot = (it: LootTuple, kind: SourceKind, base: Omit<ItemSource, "kind">) => {
    const [id, name, slot, quality, src, , tip] = it;
    add(id, name, quality, { ...base, kind, ...(src ? { note: src } : {}) }, { slot, tip });
  };
  const reward = (it: RewardTuple | ItemRef | undefined, kind: SourceKind, base: Omit<ItemSource, "kind">) => {
    if (!it) return;
    const [id, name, quality, note] = it;
    add(id, name, quality, { ...base, kind, ...(note ? { note } : {}) });
  };

  for (const slug of getDungeonSlugs()) {
    const d = getDungeon(slug);
    if (!d) continue;
    const dungeon = { name: d.name, slug: d.slug };

    d.bosses.forEach((b, i) => {
      const base = { dungeon, boss: { name: b.name, index: i } };
      b.loot.forEach((it) => loot(it, "drop", base));
      b.recipes.forEach((it) => loot(it, "recipe", base));
      b.shared.forEach((it) => loot(it, "shared", base));
    });
    d.trash.forEach((t) => loot(t.item, "trash", { dungeon, boss: { name: "Trash", index: d.bosses.length } }));

    const questItems = (q: Quest) => {
      const base = { dungeon, quest: { id: q.id, name: q.name, slug: q.slug, faction: q.faction } };
      q.rewardItems.forEach((it) => reward(it, q.rewardChoice ? "choice" : "reward", base));
      q.additionalRewardItems.forEach((it) => reward(it, "also", base));
      q.noteRewardItems.forEach((it) => reward(it, "later", base));
      reward(q.startItem, "starts", base);
      reward(q.noteItem, "needed", base);
      q.requiredItems.forEach((it) => reward(it, "needed", base));
      reward(q.providedItem, "provided", base);
      // Earlier steps of the quest's chain, as the quest page lists them.
      for (const s of q.chain) {
        const stepBase = { dungeon, quest: { id: s.id, name: s.name, slug: s.slug } };
        s.rewardItems.forEach((it) => reward(it, s.rewardChoice ? "choice" : "reward", stepBase));
        reward(s.detail?.startItem, "starts", stepBase);
        (s.detail?.requiredItems ?? []).forEach((it) => reward(it, "needed", stepBase));
        reward(s.detail?.providedItem, "provided", stepBase);
      }
    };
    d.quests.forEach(questItems);
    d.hiddenQuests.forEach(questItems);
  }

  // Tier 0.5 pieces: rewards of the four Tier 0.5 quests, which no dungeon
  // page lists. The Tier Sets tab links to them.
  const tiers = getTierSets();
  for (const c of tiers?.classes ?? []) {
    for (const v of c.tier05?.versions ?? []) {
      for (const p of v.pieces) {
        const q = p.quest !== undefined ? tiers?.quests[p.quest] : undefined;
        add(p.id, p.name, p.quality, {
          kind: "reward",
          ...(q ? { quest: { id: q.id, name: q.name } } : {}),
          note: "Tier 0.5",
        });
      }
    }
  }

  for (const e of out.values()) {
    // "Head" / "Leather" from the tooltip's slot row, for items no loot list gives a slot.
    if (!e.slot && e.lines && !SLOTS[String(e.id)]) {
      const row = e.lines.slice(1, 5).find((l) => l.r && !l.price);
      if (row) e.slot = `${row.l}, ${row.r}`;
    }
    if (!e.slot && SLOTS[String(e.id)]) e.slot = SLOTS[String(e.id)];
  }

  index = out;
  return out;
}

export function getItemIds(): number[] {
  return [...buildIndex().keys()];
}

/** The tooltip for an item: the game's own lines when dumped, else the journal's facts. */
export function itemTip(e: ItemEntry): ItemTip {
  const drop = e.sources.find((s) => s.kind === "drop" || s.kind === "shared" || s.kind === "recipe");
  const trash = e.sources.find((s) => s.kind === "trash");
  const reward = e.sources.find((s) => s.kind === "reward" || s.kind === "choice" || s.kind === "also" || s.kind === "later");
  const source = drop
    ? `Dropped by ${drop.boss?.name} (${drop.dungeon?.name})`
    : trash
      ? `Dropped by trash in ${trash.dungeon?.name}`
      : reward
        ? `Reward from ${reward.quest?.name}`
        : undefined;
  return {
    id: e.id,
    name: e.name,
    quality: e.quality,
    icon: e.icon,
    ...(e.slot ? { slot: e.slot } : {}),
    ...(e.lines ? { lines: e.lines } : {}),
    ...(e.tip ? { tip: e.tip } : {}),
    ...(source ? { source } : {}),
  };
}

export function getItemSlugs(): string[] {
  return [...buildIndex().values()].map((e) => e.slug);
}

/** The item for /item/<id>-<name>; null when no journal page shows that ID. */
export function getItemById(id: number): ItemEntry | null {
  return buildIndex().get(id) ?? null;
}
