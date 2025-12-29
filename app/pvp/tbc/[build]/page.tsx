"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";

/* =========================
   TYPES
========================= */

type GearItem = {
  slot: string;
  itemName: string;
  itemId?: number;
  iconName?: string;
  note?: string;
  enchant?: string;
};

type ClassBuildPageData = {
  title: string;
  subtitle: string;
  notes: string[];

  talentsNote?: string[];
  talentsEmbedUrl?: string;

  gear: GearItem[];
};

/* =========================
   HELPERS
========================= */

const ICON = (name?: string) =>
  `https://wow.zamimg.com/images/wow/icons/large/${name || "inv_misc_questionmark"}.jpg`;

const wowheadSearch = (q: string) =>
  `https://www.wowhead.com/tbc/search?q=${encodeURIComponent(q)}`;

/* =========================
   DATA
========================= */

const DATA: Record<string, ClassBuildPageData> = {
  "disc-priest": {
    title: "Disc Priest",
    subtitle: "TBC — Arena (Discipline)",

    notes: [
      "Priest is strong but squishy — your partner must peel while you create distance.",
      "You play off setups and punish with CC windows.",
      "Swap to a spirit weapon after 5s without casting for regen.",
    ],

    talentsNote: [
      "Standard 46/11/4 Discipline baseline.",
      "Flex points depend on comp and matchup.",
    ],

    talentsEmbedUrl:
      "https://www.wowhead.com/tbc/talent-calc/embed/priest/5050313130525102031501-230051-04",

    gear: [
      { slot: "Neck", itemName: "Light-Collar of the Incarnate", note: "+22 Spell Damage, +14 Spell Hit" },
      { slot: "Trinket", itemName: "Talisman of the Breaker" },
      { slot: "Shoulders", itemName: "Gladiator's Mooncloth Mantle", note: "+6 MP5, +22 Healing" },
      { slot: "Back", itemName: "Stainless Cloak of the Pure Hearted", note: "+20 Spell Penetration" },
      { slot: "Chest", itemName: "Gladiator's Mooncloth Robe", note: "+15 Resilience" },
      { slot: "Wrist", itemName: "Marshal's Mooncloth Cuffs", note: "+6 MP5" },
      { slot: "Main Hand", itemName: "Light's Justice", note: "+81 Healing, +27 Spell Damage" },
      { slot: "Ring", itemName: "Signet of Unshakable Faith" },

      { slot: "Hands", itemName: "Gladiator's Mooncloth Gloves", note: "+15 Spell Hit" },
      { slot: "Waist", itemName: "Marshal's Mooncloth Belt" },
      { slot: "Legs", itemName: "Gladiator's Mooncloth Leggings", note: "+66 Healing, +22 Spell Damage" },
      { slot: "Feet", itemName: "Boots of the Incorrupt", enchant: "Minor Speed +9 Stamina" },
      { slot: "Ring", itemName: "Violet Signet of the Grand Restorer", note: "+20 Healing, +7 Spell Damage" },
      { slot: "Ring", itemName: "Naaru Lightwarden's Band", note: "+20 Healing, +7 Spell Damage" },
      { slot: "Trinket", itemName: "Pendant of the Violet Eye" },
      { slot: "Trinket", itemName: "Medallion of the Alliance" },
      { slot: "Ranged", itemName: "Blue Diamond Witchwand" },
    ],
  },
};

/* =========================
   UI COMPONENTS
========================= */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

/* =========================
   TALENTS (FINAL FIX)
========================= */

function TalentsEmbed({ url }: { url?: string }) {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const update = () => setIsMobile(window.innerWidth <= 640);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  if (!url) return null;

  return (
    <div className="talentsWrap">
      <iframe
        src={url}
        title="Talents"
        scrolling="yes"
        style={{
          width: "100%",
          height: isMobile ? 420 : 760,
          border: 0,
        }}
      />
    </div>
  );
}

/* =========================
   GEAR
========================= */

function GearGrid({ gear }: { gear: GearItem[] }) {
  return (
    <div className="gearGrid">
      {gear.map((g, i) => (
        <div
          key={i}
          className="gearCard"
          onClick={() => window.open(wowheadSearch(g.itemName), "_blank")}
        >
          <img src={ICON(g.iconName)} className="gearIcon" />
          <div className="gearText">
            <div className="gearName">{g.itemName}</div>
            {(g.note || g.enchant) && (
              <div className="gearSub">{g.note || g.enchant}</div>
            )}
          </div>
          <div className="gearArrow">↗</div>
        </div>
      ))}
    </div>
  );
}

/* =========================
   PAGE
========================= */

export default function Page() {
  const { build } = useParams() as { build?: string };
  const data = build ? DATA[build] : null;

  if (!data) return <div>Not found</div>;

  return (
    <main className="page">
      <Link href="/pvp/tbc" className="back">← Back</Link>

      <h1>{data.title}</h1>
      <div className="subtitle">{data.subtitle}</div>

      <Section title="Notes">
        <ul className="notes">
          {data.notes.map((n, i) => <li key={i}>{n}</li>)}
        </ul>
      </Section>

      <Section title="Talents">
        {data.talentsNote && (
          <ul className="notes small">
            {data.talentsNote.map((n, i) => <li key={i}>{n}</li>)}
          </ul>
        )}
        <TalentsEmbed url={data.talentsEmbedUrl} />
      </Section>

      <Section title="Gear">
        <div className="hint">Click an item to open Wowhead</div>
        <GearGrid gear={data.gear} />
      </Section>

      {/* STYLES */}
      <style jsx>{`
        .page {
          padding: 48px 20px;
          color: white;
          background: radial-gradient(1200px 600px at 30% 0%, #1a1a1a, #070707);
        }

        .back { color: #aaa; text-decoration: none; }
        h1 { font-size: 48px; margin: 12px 0; }
        .subtitle { color: #aaa; margin-bottom: 24px; }

        .section {
          margin-top: 28px;
          padding: 18px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(0,0,0,0.35);
        }

        h2 { margin: 0 0 12px; }

        .notes { padding-left: 20px; }
        .notes.small { font-size: 15px; color: #ccc; }

        .talentsWrap {
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
        }

        .gearGrid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        @media (max-width: 700px) {
          .gearGrid { grid-template-columns: 1fr; }
        }

        .gearCard {
          display: flex;
          gap: 10px;
          padding: 12px;
          border-radius: 16px;
          background: rgba(0,0,0,0.35);
          border: 1px solid rgba(255,255,255,0.1);
          cursor: pointer;
        }

        .gearIcon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
        }

        .gearName { font-weight: 700; }
        .gearSub { font-size: 13px; color: #aaa; }
        .gearArrow { margin-left: auto; opacity: 0.5; }

        .hint {
          text-align: right;
          font-size: 13px;
          color: #888;
          margin-bottom: 10px;
        }
      `}</style>
    </main>
  );
}