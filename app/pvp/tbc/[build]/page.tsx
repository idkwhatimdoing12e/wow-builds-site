"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";

type GearItem = {
  slot: string;
  itemName: string;
  itemId?: number; // wowhead item id (tbc)
  iconName?: string; // zamimg icon
  note?: string;
  enchant?: string;
};

type ClassBuildPageData = {
  title: string;
  subtitle: string;
  description?: string;

  notes: string[];

  talentsNote?: string[];
  talentsImage?: string;

  gear: GearItem[];
};

const ICON = (name?: string) =>
  `https://wow.zamimg.com/images/wow/icons/large/${
    name || "inv_misc_questionmark"
  }.jpg`;

const wowheadTbcItemUrl = (itemId: number) =>
  `https://www.wowhead.com/tbc/item=${itemId}`;

const wowheadTbcSearchUrl = (q: string) =>
  `https://www.wowhead.com/tbc/search?q=${encodeURIComponent(q)}`;

declare global {
  interface Window {
    whTooltips?: any;
    $WowheadPower?: { refreshLinks?: () => void };
  }
}

const DATA: Record<string, ClassBuildPageData> = {
  "disc-priest": {
    title: "Disc Priest",
    subtitle: "TBC — Arena (Discipline)",
    description: "",

    // DO NOT TOUCH: keeping your notes exactly
    notes: [
      "Horde is Undead, Alliance is Dwarf",
      "Priest is strong but squishy, your partner must save you while you create distance",
      "You play off setups and move out aggressively when you have CC on the enemy",
      "Swap to a spirit weapon after 5s without casting for increased mana regen.",
      "Spam Rank1 Shadow Word Pain to proc blackout when needed ",
      "Use Rank1 Chastise while kiting to save mana",
    ],

    talentsNote: [
      "Standard talents for any comp, you can swap Divine Fury for Spell warding if you are facing a lot of mage and locks double dps.",
      "",
    ],

    // THIS is where it belongs
    talentsImage: "/pvp-talents/tbc/disc-priest.png",

    gear: [
      {
        slot: "Neck",
        itemName: "Light-Collar of the Incarnate",
        itemId: 29376,
        iconName: "inv_jewelry_necklace_36",
        note: "+22 Spell Damage, +14 Spell Hit",
      },
      {
        slot: "Trinket",
        itemName: "Talisman of the Breaker",
        itemId: 29376, // (you had this; change later if needed)
        iconName: "inv_jewelry_talisman_06",
      },
      {
        slot: "Shoulders",
        itemName: "Gladiator's Mooncloth Mantle",
        itemId: 32017,
        iconName: "inv_shoulder_68",
        note: "+6 MP5, +22 Healing",
      },
      {
        slot: "Back",
        itemName: "Stainless Cloak of the Pure Hearted",
        itemId: 29375,
        iconName: "inv_misc_cape_01",
        note: "+20 Spell Penetration",
      },
      {
        slot: "Chest",
        itemName: "Gladiator's Mooncloth Robe",
        itemId: 32016,
        iconName: "inv_chest_cloth_17",
        note: "+15 Resilience",
      },
      {
        slot: "Wrist",
        itemName: "Marshal's Mooncloth Cuffs",
        itemId: 32980,
        iconName: "inv_bracer_07",
        note: "+6 MP5",
      },
      {
        slot: "Main Hand",
        itemName: "Light's Justice",
        itemId: 30787,
        iconName: "inv_staff_31",
        note: "+81 Healing, +27 Spell Damage",
      },
      {
        slot: "Ring",
        itemName: "Signet of Unshakable Faith",
        itemId: 29290,
        iconName: "inv_jewelry_ring_35",
      },
      {
        slot: "Hands",
        itemName: "Gladiator's Mooncloth Gloves",
        itemId: 32015,
        iconName: "inv_gauntlets_25",
        note: "+15 Spell Hit",
      },
      {
        slot: "Waist",
        itemName: "Marshal's Mooncloth Belt",
        itemId: 32979,
        iconName: "inv_belt_22",
      },
      {
        slot: "Legs",
        itemName: "Gladiator's Mooncloth Leggings",
        itemId: 32018,
        iconName: "inv_pants_cloth_16",
        note: "+66 Healing, +22 Spell Damage",
      },
      {
        slot: "Feet",
        itemName: "Boots of the Incorrupt",
        itemId: 29373,
        iconName: "inv_boots_cloth_16",
        enchant: "Minor Speed +9 Stamina",
      },
      {
        slot: "Ring",
        itemName: "Violet Signet of the Grand Restorer",
        itemId: 29294,
        iconName: "inv_jewelry_ring_42",
        note: "+20 Healing, +7 Spell Damage",
      },
      {
        slot: "Ring",
        itemName: "Naaru Lightwarden's Band",
        itemId: 29374,
        iconName: "inv_jewelry_ring_41",
        note: "+20 Healing, +7 Spell Damage",
      },
      {
        slot: "Trinket",
        itemName: "Pendant of the Violet Eye",
        itemId: 28789,
        iconName: "inv_jewelry_necklace_29",
      },
      {
        slot: "Trinket",
        itemName: "Medallion of the Alliance",
        itemId: 28235,
        iconName: "inv_jewelry_trinketpvp_01",
      },
      {
        slot: "Ranged",
        itemName: "Blue Diamond Witchwand",
        itemId: 29272,
        iconName: "inv_wand_20",
      },
    ],
  },
};

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
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
  if (!notes?.length) {
    return <div style={{ color: "rgba(255,255,255,0.6)" }}>No notes yet.</div>;
  }

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

/**
 * Loads Wowhead tooltips (power.js) once, and refreshes links for SPA.
 */
function useWowheadTooltips(deps: any[] = []) {
  React.useEffect(() => {
    const SCRIPT_ID = "wowhead-powerjs";

    // Ensure config exists BEFORE script loads
    window.whTooltips = window.whTooltips || {
      colorLinks: false,
      iconizeLinks: false,
      renameLinks: false,
    };

    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (!existing) {
      const s = document.createElement("script");
      s.id = SCRIPT_ID;
      s.src = "https://wow.zamimg.com/widgets/power.js";
      s.async = true;
      s.onload = () => window.$WowheadPower?.refreshLinks?.();
      document.body.appendChild(s);
    } else {
      // already loaded
      window.$WowheadPower?.refreshLinks?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    window.$WowheadPower?.refreshLinks?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

function TalentsBlock({
  lines,
  imageUrl,
}: {
  lines?: string[];
  imageUrl?: string;
}) {
  return (
    <div>
      {lines?.length ? (
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
          {lines.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      ) : null}

      {imageUrl ? (
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
      ) : (
        <div style={{ color: "rgba(255,255,255,0.70)", fontSize: 14 }}>
          Missing talents image.
        </div>
      )}
    </div>
  );
}

function GearGrid({ gear }: { gear: GearItem[] }) {
  // Tooltips need real anchors; refresh on gear changes
  useWowheadTooltips([gear?.length]);

  if (!gear?.length) {
    return (
      <div style={{ color: "rgba(255,255,255,0.6)" }}>No gear added yet.</div>
    );
  }

  return (
    <>
      <div className="gearGrid">
        {gear.map((g, idx) => {
          const hasId = typeof g.itemId === "number" && g.itemId > 0;
          const href = hasId
            ? wowheadTbcItemUrl(g.itemId!)
            : wowheadTbcSearchUrl(g.itemName);

          // Wowhead tooltip trigger
          const wowheadAttr = hasId ? `item=${g.itemId}&domain=tbc` : undefined;

          const subLine = g.enchant || g.note;

          return (
            <a
              key={`${g.slot}-${idx}`}
              className="gearCard"
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              data-wowhead={wowheadAttr}
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
            </a>
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
          text-decoration: none;
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
          color: rgba(255, 255, 255, 0.95);
        }

        .gearCard:hover {
          border-color: rgba(255, 255, 255, 0.16);
          background: rgba(255, 255, 255, 0.04);
        }

        .gearIcon {
          width: 38px;
          height: 38px;
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
          font-weight: 800;
          line-height: 1.15;
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
          <TalentsBlock lines={data.talentsNote} imageUrl={data.talentsImage} />
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
            Hover for Wowhead tooltip • Click to open Wowhead
          </div>

          <GearGrid gear={data.gear} />
        </SectionCard>
      </div>
    </main>
  );
}