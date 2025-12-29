"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";

type GearItem = {
  slot: string;
  itemName: string;
  itemId?: number; // if set, links /tbc/item=ID
  iconName?: string; // if set, shows zamimg icon
  note?: string; // stats line
  enchant?: string; // enchant line
};

type ClassBuildPageData = {
  title: string;
  subtitle: string;
  description?: string;

  notes: string[];

  talentsNote?: string[];
  talentsCalculatorUrl?: string;
  talentsEmbedUrl?: string;
  talentsEmbedHeight?: number;

  gear: GearItem[];
};

const ICON = (name?: string) =>
  `https://wow.zamimg.com/images/wow/icons/large/${name || "inv_misc_questionmark"}.jpg`;

const wowheadTbcItemUrl = (itemId: number) => `https://www.wowhead.com/tbc/item=${itemId}`;
const wowheadTbcSearchUrl = (q: string) =>
  `https://www.wowhead.com/tbc/search?q=${encodeURIComponent(q)}`;

const DATA: Record<string, ClassBuildPageData> = {
  "disc-priest": {
    title: "Disc Priest",
    subtitle: "TBC — Arena (Discipline)",
    description: "",
    notes: [
      "Priest is strong but squishy — your partner must peel while you create distance.",
      "You play off setups: push aggressively when you have CC to force a kill.",
      "Swap to a high-spirit weapon after 5s without casting to regen mana while pillar kiting.",
    ],
    talentsNote: ["Standard 46/11/4 Discipline baseline.", "Tweaks depending on comp/matchup (flex points)."],
    talentsCalculatorUrl:
      "https://www.wowhead.com/tbc/talent-calc/priest/5050313130525102031501-230051-04",
    talentsEmbedUrl:
      "https://www.wowhead.com/tbc/talent-calc/embed/priest/5050313130525102031501-230051-04",
    // talentsEmbedHeight: 620, // optional override
    gear: [
      { slot: "Neck", itemName: "Light-Collar of the Incarnate", note: "+22 Spell Damage and +14 Spell Hit Rating" },
      { slot: "Trinket 1", itemName: "Talisman of the Breaker" },
      { slot: "Shoulders", itemName: "Gladiator's Mooncloth Mantle", note: "+6 Mana Per 5 Sec. and +22 Healing" },
      { slot: "Back", itemName: "Stainless Cloak of the Pure Hearted", note: "+20 Spell Penetration" },
      { slot: "Chest", itemName: "Gladiator's Mooncloth Robe", note: "+15 Resilience Rating" },
      { slot: "Wrist", itemName: "Marshal's Mooncloth Cuffs", note: "+6 Mana Per 5 Sec." },
      { slot: "Main Hand", itemName: "Light's Justice", note: "+81 Healing and +27 Spell Damage" },
      { slot: "Ring 1", itemName: "Signet of Unshakable Faith" },
      { slot: "Hands", itemName: "Gladiator's Mooncloth Gloves", note: "+15 Spell Hit Rating" },
      { slot: "Waist", itemName: "Marshal's Mooncloth Belt" },
      { slot: "Legs", itemName: "Gladiator's Mooncloth Leggings", note: "+66 Healing and +22 Spell Damage and +20 Stamina" },
      { slot: "Feet", itemName: "Boots of the Incorrupt", enchant: "Minor Speed and +9 Stamina" },
      { slot: "Ring 2", itemName: "Violet Signet of the Grand Restorer", note: "+20 Healing and +7 Spell Damage" },
      { slot: "Ring 3", itemName: "Naaru Lightwarden's Band", note: "+20 Healing and +7 Spell Damage" },
      { slot: "Trinket 2", itemName: "Pendant of the Violet Eye" },
      { slot: "Trinket 3", itemName: "Medallion of the Alliance" },
      { slot: "Ranged", itemName: "Blue Diamond Witchwand" },
    ],
  },
};

function SectionCard({
  title,
  children,
  compact,
}: {
  title: string;
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <section
      style={{
        marginTop: compact ? 14 : 16, // tighter spacing between sections
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
        <li key={i} style={{ color: "rgba(255,255,255,0.9)" }}>
          {n}
        </li>
      ))}
    </ul>
  );
}

function TalentsEmbed({
  embedUrl,
  fallbackUrl,
  heightPx,
}: {
  embedUrl?: string;
  fallbackUrl?: string;
  heightPx?: number;
}) {
  const [blocked, setBlocked] = React.useState(false);
  const canEmbed = Boolean(embedUrl) && !blocked;

  // This prevents “dead space” by bounding the embed to the viewport.
  // You can still scroll INSIDE the iframe if it's taller.
  const computedHeight = heightPx ?? 640;

  return (
    <div>
      {canEmbed ? (
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
            scrolling="yes"
            style={{
              width: "100%",
              // The clamp is the main fix: no more huge empty slab.
              // Min keeps it usable, max prevents absurd blank space.
              height: `clamp(520px, 70vh, ${computedHeight}px)`,
              border: 0,
              display: "block",
              background: "transparent",
            }}
            onError={() => setBlocked(true)}
          />
        </div>
      ) : (
        <div style={{ color: "rgba(255,255,255,0.70)", fontSize: 14, lineHeight: 1.35 }}>
          Embedded talents could not be displayed.
          {fallbackUrl ? (
            <>
              {" "}
              <a href={fallbackUrl} target="_blank" rel="noreferrer" style={{ color: "rgba(255,255,255,0.9)" }}>
                Open talents on Wowhead
              </a>
              .
            </>
          ) : null}
        </div>
      )}
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

        @media (max-width: 900px) {
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
          background: "radial-gradient(1200px 600px at 30% 0%, #1a1a1a 0%, #0b0b0b 55%, #070707 100%)",
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
        background: "radial-gradient(1200px 600px at 30% 0%, #1a1a1a 0%, #0b0b0b 55%, #070707 100%)",
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
          <div style={{ marginTop: 10, color: "rgba(255,255,255,0.60)" }}>{data.subtitle}</div>
          {data.description ? (
            <div style={{ marginTop: 10, color: "rgba(255,255,255,0.70)" }}>{data.description}</div>
          ) : null}
        </div>

        <SectionCard title="Notes" compact>
          <NotesList notes={data.notes} />
        </SectionCard>

        <SectionCard title="Talents" compact>
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

          <TalentsEmbed
            embedUrl={data.talentsEmbedUrl}
            fallbackUrl={data.talentsCalculatorUrl}
            heightPx={data.talentsEmbedHeight} // optional override per build
          />
        </SectionCard>

        <SectionCard title="Gear" compact>
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