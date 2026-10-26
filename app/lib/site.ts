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

// Wowhead hosts WoW Forever's database under /forever/ (dataEnv 16); its
// power.js tooltips pick these links up on hover. A few items the addon lists
// aren't in that database yet; those link to Wowhead Classic instead
// (data/item-icons.json records which database each item was found in).
export const FOREVER_ITEM_URL = (id: number) => `https://www.wowhead.com/forever/item=${id}`;
export const CLASSIC_ITEM_URL = (id: number) => `https://www.wowhead.com/classic/item=${id}`;

export const ADSENSE_CLIENT = "ca-pub-7979214898290780";
