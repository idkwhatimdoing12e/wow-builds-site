import iconsFile from "@/data/item-icons.json";

// item ID -> [icon file name, source it was found in (16 Forever, 4 Classic)]
const ICONS = iconsFile as unknown as Record<string, [string, number]>;

/** Self-hosted 56px icon from public/journal/icons/. */
export function itemIconSrc(id: number): string {
  const entry = ICONS[id];
  return `/journal/icons/${entry ? entry[0] : "inv_misc_questionmark"}.webp`;
}

/** Kept apart from journal.ts's slugify so client components stay light. */
function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** "5443-gold-plated-buckler": the item page's slug. */
export function itemSlug(id: number, name: string): string {
  return `${id}-${slugifyName(name)}`;
}

/** The site's own page for the item. */
export function itemPath(id: number, name: string): string {
  return `/item/${itemSlug(id, name)}`;
}
