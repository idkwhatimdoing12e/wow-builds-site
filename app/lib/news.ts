// The News page's posts, newest first. To add one, put it at the top.
// `boss` links the post to a boss in the journal: its portrait shows beside the
// post, with a button to that boss's page.

export interface NewsPost {
  /** The post's anchor on the News page: /news#<id>. */
  id: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  title: string;
  paragraphs: string[];
  boss?: { dungeon: string; name: string };
  /** The home banner's picture while this is the newest post. */
  hero?: string;
}

export const NEWS: NewsPost[] = [
  {
    id: "obsidian-sentinel-loot-off",
    date: "2026-11-22",
    title: "Obsidian Sentinel drops no loot for now",
    paragraphs: [
      "Blizzard has switched off the loot from Obsidian Sentinel in Uldaman.",
      "Players found they could slip in through Uldaman's back entrance, reach him fast and kill him over and over, then sell what he dropped for gold. Blizzard didn't like that, so for now he drops nothing.",
      "Honestly, it felt pretty harmless to me: a few players farming one boss in an old dungeon. But it's their call. So thank you, Blizzard, for saving us from farming, I guess.",
      "It's switched off “for now”, so the loot may come back. The journal still shows what he used to drop, and I'll post here as soon as anything changes.",
    ],
    boss: { dungeon: "uldaman", name: "Obsidian Sentinel" },
    hero: "/journal/news/obsidian-sentinel.webp",
  },
];
