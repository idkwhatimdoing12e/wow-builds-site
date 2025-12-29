"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";

type GearItem = {
  slot: string;
  itemName: string;
  itemId?: number;     // optional direct wowhead item link
  iconName?: string;   // zamimg icon name (optional)
  note?: string;       // stats line
  enchant?: string;    // enchant line
};

type ClassBuildPageData = {
  title: string;
  subtitle: string;
  description?: string;

  notes: string[];

  talentsNote?: string[];
  talentsEmbedUrl?: string;
  talentsImage?: string;

  gear: GearItem[];
};

const ICON = (name?: string) =>
  `https://wow.zamimg.com/images/wow/icons/large/${name || "inv_misc_questionmark"}.jpg`;

const wowheadTbcItemUrl = (itemId: number) =>
  `https://www.wowhead.com/tbc/item=${itemId}`;

const wowheadTbcSearchUrl = (q: string) =>
  `https://www.wowhead.com/tbc/search?q=${encodeURIComponent(q)}`;

const DATA: Record<string, ClassBuildPageData> = {
  "disc-priest": {
    title: "Disc Priest",
    subtitle: "TBC — Arena (Discipline)",
    description: "",

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
      talentsImage: "/pvp-talents/tbc/disc-priest.png",

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

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      style={{
        marginTop: 22,
        borderRadius: 22,
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(0,0,0,0.35)",
        boxShadow: "0 18px 60px rgba(0,0,0,0.45)",
        padding: 18,
      }}
    >
      <div style={{ marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: 28 }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function NotesList({ notes }: { notes: string[] }) {
  if (!notes?.length) return <div style={{ color: "rgba(255,255,255,0.6)" }}>No notes yet.</div>;

  return (
    <ul
      style={{
        margin: 0,
        paddingLeft: 22,
        display: "grid",
        gap: 10,
        color: "rgba(255,255,255,0.9)",
        fontSize: 18,
        lineHeight: 1.35,
      }}
    >
      {notes.map((n, i) => (
        <li key={i}>{n}</li>
      ))}
    </ul>
  );
}

/**
 * Talents: fixed heights per breakpoint + internal iframe scrolling.
 * This avoids dead space on mobile AND avoids chopping by allowing internal scroll.
 * No external “Open calculator” button.
 */
function TalentsEmbed({
  embedUrl,
  imageUrl,
}: {
  embedUrl?: string;
  imageUrl?: string;
}) {
  const [blocked, setBlocked] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const update = () => setIsMobile(window.innerWidth <= 700);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // MOBILE: show image (no dead space)
  if (isMobile && imageUrl) {
    return (
      <div
        style={{
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(0,0,0,0.35)",
          overflow: "hidden",
        }}
      >
        <img
          src={imageUrl}
          alt="Talents"
          style={{
            width: "100%",
            height: "auto",
            display: "block",
          }}
        />
      </div>
    );
  }

  // DESKTOP/TABLET: iframe
  if (!embedUrl || blocked) {
    return (
      <div style={{ color: "rgba(255,255,255,0.70)", fontSize: 14, lineHeight: 1.35 }}>
        Embedded talents could not be displayed.
      </div>
    );
  }

  return (
    <div
      style={{
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(0,0,0,0.35)",
        overflow: "hidden",
      }}
    >
      <iframe
        src={embedUrl}
        title="Talents"
        loading="lazy"
        scrolling="no"
        style={{
          width: "100%",
          height: 760,
          border: 0,
          display: "block",
          background: "transparent",
        }}
        onError={() => setBlocked(true)}
      />
    </div>
  );
}

function GearGrid({ gear }: { gear: GearItem[] }) {
  if (!gear?.length) return <div style={{ color: "rgba(255,255,255,0.6)" }}>No gear added yet.</div>;

  return (
    <>
      <div className="gearGrid">
        {gear.map((g, idx) => {
          const hasId = typeof g.itemId === "number" && g.itemId > 0;
          const href = hasId ? wowheadTbcItemUrl(g.itemId!) : wowheadTbcSearchUrl(g.itemName);
          const subLine = g.enchant || g.note;

          return (
            <div
              key={`${g.slot}-${idx}`}
              className="gearCard"
              onClick={() => window.open(href, "_blank", "noopener,noreferrer")}
            >
              <img className="gearIcon" src={ICON(g.iconName)} alt="" />
              <div className="gearText">
                <div className="gearName" title={g.itemName}>
                  {g.itemName}
                </div>
                {subLine ? (
                  <div className="gearSub" title={subLine}>
                    {subLine}
                  </div>
                ) : null}
              </div>
              <div className="gearArrow">↗</div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .gearGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }
        @media (max-width: 700px) {
          .gearGrid {
            grid-template-columns: 1fr;
          }
        }

        .gearCard {
          cursor: pointer;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.35);
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.4);
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          min-height: 60px;
        }

        .gearIcon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          object-fit: cover;
          display: block;
          flex: 0 0 auto;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.04);
        }

        .gearText {
          min-width: 0;
          flex: 1 1 auto;
        }

        .gearName {
          font-size: 16px;
          font-weight: 700;
          line-height: 1.15;
          color: rgba(255, 255, 255, 0.95);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .gearSub {
          margin-top: 4px;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.65);
          line-height: 1.2;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .gearArrow {
          flex: 0 0 auto;
          opacity: 0.45;
          font-size: 14px;
          padding-left: 4px;
        }
      `}</style>
    </>
  );
}

export default function TbcClassPage() {
  const params = useParams() as { build?: string };
  const slug = params?.build;
  const data = slug ? DATA[slug] : undefined;

  if (!slug || !data) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: "56px 24px",
          background:
            "radial-gradient(1200px 600px at 30% 0%, #1a1a1a 0%, #0b0b0b 55%, #070707 100%)",
          color: "#fff",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Link
            href="/pvp/tbc"
            style={{
              display: "inline-block",
              marginBottom: 24,
              color: "rgba(255,255,255,0.65)",
              textDecoration: "none",
            }}
          >
            ← Back
          </Link>

          <h1 style={{ fontSize: 46, margin: 0 }}>Page not found</h1>
          <div style={{ marginTop: 10, color: "rgba(255,255,255,0.65)" }}>
            Unknown class slug: <b>{String(slug)}</b>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "56px 24px",
        background:
          "radial-gradient(1200px 600px at 30% 0%, #1a1a1a 0%, #0b0b0b 55%, #070707 100%)",
        color: "#fff",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Link
          href="/pvp/tbc"
          style={{
            display: "inline-block",
            marginBottom: 24,
            color: "rgba(255,255,255,0.65)",
            textDecoration: "none",
          }}
        >
          ← Back
        </Link>

        <div style={{ marginBottom: 8 }}>
          <h1 style={{ fontSize: 54, margin: 0 }}>{data.title}</h1>
          <div style={{ marginTop: 10, color: "rgba(255,255,255,0.60)" }}>
            {data.subtitle}
          </div>
          {data.description ? (
            <div style={{ marginTop: 10, color: "rgba(255,255,255,0.70)" }}>
              {data.description}
            </div>
          ) : null}
        </div>

        <SectionCard title="Notes">
          <NotesList notes={data.notes} />
        </SectionCard>

        <SectionCard title="Talents">
          {data.talentsNote?.length ? (
            <ul
              style={{
                margin: "0 0 12px 0",
                paddingLeft: 18,
                display: "grid",
                gap: 8,
                color: "rgba(255,255,255,0.85)",
                fontSize: 16,
                lineHeight: 1.35,
              }}
            >
              {data.talentsNote.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          ) : null}

          <TalentsEmbed embedUrl={data.talentsEmbedUrl} imageUrl={data.talentsImage} />
        </SectionCard>

        <SectionCard title="Gear">
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: -6,
              marginBottom: 12,
              color: "rgba(255,255,255,0.55)",
              fontSize: 14,
            }}
          >
            Click an item to open Wowhead
          </div>

          <GearGrid gear={data.gear} />
        </SectionCard>
      </div>
    </main>
  );
}