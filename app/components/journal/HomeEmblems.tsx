"use client";

import Link from "next/link";
import { useHref, useT } from "@/app/components/i18n/I18n";
import { useFaction } from "./useFaction";

export interface EmblemText {
  dungeonsTitle: string;
  raidsTitle: string;
  comingSoon: string;
}

/** Which of the home tabs is open. */
export type HomeTab = "dungeons" | "sleeping-bag" | "onyxia" | "tier" | "pvp";

/**
 * The pages the tabs open. The two quest chains are the addon's own pages
 * (FDJ.SLEEPING_BAG_PAGE, FDJ.ONYXIA_PAGE), at their names' slugs.
 */
export const HOME_TAB_PATHS: Record<Exclude<HomeTab, "dungeons">, string> = {
  "sleeping-bag": "/cozy-sleeping-bag",
  onyxia: "/onyxia-attunement",
  tier: "/tier-sets",
  pvp: "/pvp",
};

/**
 * The addon's row of home icons (Systems/ForeverFilter.lua, TierSets.lua
 * "hometabs"), working as tabs:
 * - the WoW Forever emblem: the dungeon list;
 * - the Raids medallion, greyed out until raids are added;
 * - the Cozy Sleeping Bag, Onyxia Attunement and Tier Sets icons: their pages;
 * - PvP (Systems/PvP.lua): the battlegrounds, with the game's own PvP tab
 *   icon for the side picked (the gold fist on blue, or on red).
 * The open page's icon is lit (the emblem's gold ring and brighter halo).
 */
export default function HomeEmblems({ text, active = "dungeons" }: { text: EmblemText; active?: HomeTab }) {
  const h = useHref();
  const t = useT();
  const faction = useFaction();
  const tabs: { key: Exclude<HomeTab, "dungeons">; icon: string; title: string; tip: string }[] = [
    { key: "sleeping-bag", icon: "/journal/icons/inv_misc_bag_bigbagofenchantments.webp", title: t.or("SLEEPING_BAG_TITLE", "Cozy Sleeping Bag"), tip: t.or("SLEEPING_BAG_HOW", "How to get Sleeping Bag") },
    { key: "onyxia", icon: "/journal/ui/onyxia-icon.png", title: t.or("ATTUNE_ONYXIA", "Onyxia Attunement"), tip: t.or("ONYXIA_ICON_TIP", "") },
    // The Tier Sets icon: the Vest of Elements (Tier 0 shaman chest).
    { key: "tier", icon: "/journal/icons/inv_chest_chain_11.webp", title: t.or("TIER_TITLE", "Tier Sets"), tip: t.or("TIER_ICON_TIP", "") },
    {
      key: "pvp",
      icon: `/journal/icons/inv_sidetab_honor_${faction === "Horde" ? "horde" : "alliance"}_c60.webp`,
      title: t.or("PVP_TITLE", "PvP"),
      tip: t.or("s_pvp_tip", ""),
    },
  ];
  return (
    <div className="wf-emblems">
      <Link
        href={h("/#dungeons")}
        className={`wf-forever ${active === "dungeons" ? "on" : ""}`}
        aria-current={active === "dungeons" ? "page" : undefined}
        aria-label={text.dungeonsTitle}
      >
        <img className="wf-forever-halo" src="/journal/ui/forever-halo.png" alt="" width={128} height={128} />
        <img className="wf-forever-ring" src="/journal/ui/forever-ring.png" alt="" width={128} height={128} />
        <img className="wf-forever-icon" src="/journal/ui/forever-icon.png" alt="" width={64} height={64} />
        <span className="wf-tip" role="tooltip">
          <span className="wf-tip-title">{text.dungeonsTitle}</span>
        </span>
      </Link>
      <span className="wf-raids" tabIndex={0} aria-label={`${text.raidsTitle}: ${text.comingSoon}`}>
        <img src="/journal/ui/raid-icon.png" alt="" width={128} height={128} />
        <span className="wf-tip" role="tooltip">
          <span className="wf-tip-title">{text.raidsTitle}</span>
          <span>{text.comingSoon}</span>
        </span>
      </span>
      {tabs.map((tab) => {
        const on = active === tab.key;
        return (
          <Link
            key={tab.key}
            // A lit tab goes back to the dungeon list, as in the addon.
            href={on ? h("/#dungeons") : h(HOME_TAB_PATHS[tab.key])}
            className={`wf-forever wf-hometab ${on ? "on" : ""}`}
            aria-current={on ? "page" : undefined}
            aria-label={tab.title}
          >
            <img className="wf-forever-halo" src="/journal/ui/forever-halo.png" alt="" width={128} height={128} />
            <img className="wf-forever-ring" src="/journal/ui/forever-ring.png" alt="" width={128} height={128} />
            <img className="wf-hometab-icon" src={tab.icon} alt="" width={56} height={56} />
            <span className="wf-tip" role="tooltip">
              <span className="wf-tip-title">{tab.title}</span>
              {tab.tip && <span>{tab.tip}</span>}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
