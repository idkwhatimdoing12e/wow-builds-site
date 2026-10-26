import type { MetadataRoute } from "next";
import { getDungeonSlugs, getQuestSlugs } from "@/app/lib/journal";
import { SITE_URL } from "@/app/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/supporters`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
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
  ];
}
