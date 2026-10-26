import type { Metadata } from "next";
import Link from "next/link";
import supportersFile from "@/data/supporters.json";
import { LINKS, SITE_URL } from "@/app/lib/site";
import Window from "@/app/components/journal/Window";

export const metadata: Metadata = {
  title: "Supporters",
  description: "The people who keep Dungeon Journal updated for every WoW Forever phase.",
  alternates: { canonical: `${SITE_URL}/supporters` },
};

type Supporter = { name: string; tier: "Legendary" | "Epic" | "Rare" };

const TIER_COLOR: Record<Supporter["tier"], string> = {
  Legendary: "#ff8000",
  Epic: "#a335ee",
  Rare: "#0070dd",
};

export default function SupportersPage() {
  const supporters = (supportersFile.supporters as Supporter[]) ?? [];
  const tiers: Supporter["tier"][] = ["Legendary", "Epic", "Rare"];

  return (
    <div className="journal wf-page">
      <Window>
        <div className="wf-crumb">
          <Link href="/" className="wf-btn wf-btn-red wf-btn-sm">Dungeons</Link>
        </div>
        <div className="wf-pane wf-pane-single wf-pane-parchment">
          <div className="wp">
            <h1 className="wp-title">Supporters</h1>
            <p className="wp-text">
              Dungeon Journal is free and will stay free. One person builds it, in the evenings, and keeps it updated the day each
              Forever phase lands. The people below pay for that time. Thank you.
            </p>
            <p className="wp-text">
              <a href={LINKS.patreon} target="_blank" rel="noreferrer noopener" className="wf-btn wf-btn-red">Become a supporter on Patreon</a>
            </p>
            {supporters.length === 0 ? (
              <p className="wp-note">Names appear here as supporters join.</p>
            ) : (
              tiers.map((tier) => {
                const names = supporters.filter((s) => s.tier === tier);
                if (names.length === 0) return null;
                return (
                  <div key={tier}>
                    <div className="wp-rewards-head" style={{ color: TIER_COLOR[tier] }}>{tier}</div>
                    <p className="wp-text">{names.map((s) => s.name).join(" · ")}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Window>
    </div>
  );
}
