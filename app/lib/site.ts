// Single place for the site's identity and outbound links.
// Change the domain here when the rebrand happens; everything else reads it.

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://wowbuilds.pro";
export const SITE_NAME = "Dungeon Journal";
export const SITE_TAGLINE = "Every quest, boss and drop in WoW Forever's dungeons";

export const LINKS = {
  curseforge: "https://www.curseforge.com/wow/addons/dungeonjournal",
  wago: "https://addons.wago.io/addons/dungeon-journal",
  patreon: "https://www.patreon.com/c/DungeonJournalWoW",
  discord: "https://discord.com/invite/Hu3YYaS8vz",
  youtube: "https://www.youtube.com/@Exehn",
};

// Wowhead's Classic database covers original-vanilla item IDs. Items added by
// Forever (IDs in the 200000+ range) have no public database yet; they render
// as plain text until one exists. Flip this to a URL template when it does.
export const CLASSIC_ITEM_URL = (id: number) => `https://www.wowhead.com/classic/item=${id}`;
export const FOREVER_ITEM_URL: ((id: number) => string) | null = null;
export const FOREVER_ITEM_ID_MIN = 200000;

export const ADSENSE_CLIENT = "ca-pub-7979214898290780";
