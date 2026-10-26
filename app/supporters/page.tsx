import type { Metadata } from "next";
import Link from "next/link";
import supportersFile from "@/data/supporters.json";
import { LINKS, SITE_URL } from "@/app/lib/site";

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
    <div className="journal mx-auto max-w-3xl px-6 pt-24 pb-20">
      <nav className="text-sm text-white/45">
        <Link href="/" className="hover:text-white">Dungeons</Link> <span className="mx-1">/</span> Supporters
      </nav>
      <h1 className="display mt-3 text-4xl">Supporters</h1>
      <p className="mt-3 text-white/70 max-w-2xl">
        Dungeon Journal is free and will stay free. One person builds it, in the evenings, and keeps it updated the day each
        Forever phase lands. The people below pay for that time. Thank you.
      </p>
      <a href={LINKS.patreon} target="_blank" rel="noreferrer noopener" className="btn btn-primary mt-6 inline-flex">
        Become a supporter on Patreon
      </a>

      {supporters.length === 0 ? (
        <p className="mt-10 text-white/45">Names appear here as supporters join.</p>
      ) : (
        tiers.map((tier) => {
          const names = supporters.filter((s) => s.tier === tier);
          if (names.length === 0) return null;
          return (
            <section key={tier} className="mt-10">
              <h2 className="section-title" style={{ color: TIER_COLOR[tier] }}>{tier}</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {names.map((s) => (
                  <li key={s.name} className="badge border-white/15 bg-white/5 text-white/85 text-sm">{s.name}</li>
                ))}
              </ul>
            </section>
          );
        })
      )}
    </div>
  );
}
