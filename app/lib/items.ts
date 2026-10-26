import iconsFile from "@/data/item-icons.json";
import { CLASSIC_ITEM_URL, FOREVER_ITEM_URL } from "./site";

// item ID -> [icon file name, Wowhead dataEnv it was found in (16 Forever, 4 Classic)]
const ICONS = iconsFile as unknown as Record<string, [string, number]>;
const CLASSIC_ENV = 4;

/** Self-hosted 56px icon from public/journal/icons/. */
export function itemIconSrc(id: number): string {
  const entry = ICONS[id];
  return `/journal/icons/${entry ? entry[0] : "inv_misc_questionmark"}.webp`;
}

/** Wowhead page for the item: the Forever database unless the item is only in Classic's. */
export function itemUrl(id: number): string {
  return ICONS[id]?.[1] === CLASSIC_ENV ? CLASSIC_ITEM_URL(id) : FOREVER_ITEM_URL(id);
}
