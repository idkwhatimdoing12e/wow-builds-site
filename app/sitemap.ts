import type { MetadataRoute } from "next";
import { getChainPageSlugs, getDungeonSlugs, getQuestSlugs } from "@/app/lib/journal";
import { SITE_URL } from "@/app/lib/site";
import { PREFIXED } from "@/app/lib/i18n";
import { pvpSlugs, questPageSlugs } from "@/app/lib/pvp";

// The PvP tab: /pvp, each battleground's page and Honor & Ranks, and Alterac Valley's quests.
const PVP_PATHS = ["pvp", ...pvpSlugs().map((s) => `pvp/${s}`), ...questPageSlugs().map((s) => `pvp/${s}/quests`)];

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    // The home tabs' pages: the quest chains (Sleeping Bag, Onyxia) and Tier Sets.
    ...[...getChainPageSlugs(), "tier-sets", ...PVP_PATHS].map((slug) => ({
      url: `${SITE_URL}/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...getDungeonSlugs().map((slug) => ({
      url: `${SITE_URL}/dungeon/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...getQuestSlugs().map((slug) => ({
      url: `${SITE_URL}/quest/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    // Item pages are noindex (app/item/[slug]/page.tsx), so they stay out.
    // The translated home, dungeon and quest pages: /de, /de/dungeon/x, ...
    ...PREFIXED.flatMap((lang) => [
      { url: `${SITE_URL}/${lang}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.7 },
      ...[...getChainPageSlugs(), "tier-sets", ...PVP_PATHS].map((slug) => ({
        url: `${SITE_URL}/${lang}/${slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
      ...getDungeonSlugs().map((slug) => ({
        url: `${SITE_URL}/${lang}/dungeon/${slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
      ...getQuestSlugs().map((slug) => ({
        url: `${SITE_URL}/${lang}/quest/${slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.4,
      })),
    ]),
  ];
}
