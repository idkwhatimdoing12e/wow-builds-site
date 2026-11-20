// The small part of the journal library that browser components use.
//
// Kept apart from journal.ts on purpose: that module imports the whole
// journal (data/journal.json, about 1 MB), and any client component that
// imports a value from it ships all of it to the browser. These helpers need
// none of it. journal.ts re-exports them, so server code can keep importing
// from there.

import zonesFile from "@/data/zones.json";
import type { Faction, MapPoint, ZonePin } from "./journal";

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

/** The addon's QuestMatchesFaction: shared quests count for both sides. */
export function questIsFor(questFaction: string | undefined, faction: Faction): boolean {
  return !questFaction || questFaction === "Both" || questFaction === "Neutral" || questFaction === faction;
}

const ZONES_BUILT = new Set(zonesFile as number[]);

export function zonePin(m?: MapPoint): ZonePin | undefined {
  if (!m || !m.mapID || typeof m.x !== "number" || typeof m.y !== "number") return undefined;
  if (!ZONES_BUILT.has(m.mapID)) return undefined; // no picture: show no map rather than a broken one
  return {
    src: `/journal/zones/${m.mapID}.webp`,
    x: m.x,
    y: m.y,
    label: m.label || m.targetName || "Quest start",
    targetName: m.targetName,
  };
}
