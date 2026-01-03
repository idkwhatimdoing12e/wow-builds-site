"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";

type Role = "Healer" | "Melee DPS" | "Ranged DPS" | "Caster DPS" | "Tank";

type Tier = "S Tier" | "A Tier" | "B Tier" | "C Tier";

type SpecCard = {
  slug: string; // used for routing later if you want click-to-open
  className: string; // "Disc Priest"
  specName: string; // "Discipline"
  role: Role; // "Healer"
  // Right-side ability icons (zamimg icon names)
  icons: string[];
  // Optional custom background color per card
  bg?: string;
};

type TierSection = {
  tier: Tier;
  cards: SpecCard[];
};

const ICON = (name?: string) =>
  `https://wow.zamimg.com/images/wow/icons/large/${name || "inv_misc_questionmark"}.jpg`;

/**
 * Placeholder data:
 * - Keep the same content for now
 * - You can edit later
 * - Add more slugs/cards to instantly get more pages
 */
const TIER_PAGE_BY_SLUG: Record<string, { title: string; sections: TierSection[] }> = {
  "tbc-arena-tierlist": {
    title: "TBC Arena Tier List",
    sections: [
      {
        tier: "S Tier",
        cards: [
          {
            slug: "disc-priest",
            className: "Disc\nPriest",
            specName: "Discipline",
            role: "Healer",
            icons: ["spell_holy_powerwordshield", "spell_holy_painsupression"],
            bg: "#ffffff",
          },
          {
            slug: "resto-druid",
            className: "Restoration\nDruid",
            specName: "Restoration",
            role: "Healer",
            icons: ["spell_nature_healingtouch", "inv_misc_herb_10"],
            bg: "#f08a35",
          },
          {
            slug: "arms-warrior",
            className: "Arms\nWarrior",
            specName: "Arms",
            role: "Melee DPS",
            icons: ["ability_warrior_savageblow", "inv_sword_27"],
            bg: "#c4a27a",
          },
          {
            slug: "sub-rogue",
            className: "Subtlety\nRogue",
            specName: "Subtlety",
            role: "Melee DPS",
            icons: ["ability_stealth", "ability_backstab"],
            bg: "#fbf27d",
          },
          {
            slug: "frost-mage",
            className: "Frost\nMage",
            specName: "Frost",
            role: "Caster DPS",
            icons: ["spell_frost_frostbolt02", "spell_frost_icestorm"],
            bg: "#7fc7ea",
          },
          {
            slug: "affli-warlock",
            className: "Affliction\nWarlock",
            specName: "Affliction /\nDemonology",
            role: "Caster DPS",
            icons: ["spell_shadow_deathcoil", "spell_shadow_shadowwordpain"],
            bg: "#8e82c6",
          },
          {
            slug: "mm-hunter",
            className: "MM\nHunter",
            specName: "Marksmanship",
            role: "Ranged DPS",
            icons: ["ability_marksmanship", "inv_weapon_bow_07"],
            bg: "#b9d77b",
          },
        ],
      },
      {
        tier: "A Tier",
        cards: [
          {
            slug: "holy-paladin",
            className: "Holy\nPaladin",
            specName: "Holy",
            role: "Healer",
            icons: ["spell_holy_holybolt", "spell_holy_divineintervention"],
            bg: "#e8a1c4",
          },
          {
            slug: "ret-paladin",
            className: "Ret\nPaladin",
            specName: "Retribution",
            role: "Melee DPS",
            icons: ["spell_holy_auraoflight", "inv_sword_2h_blood_c_01"],
            bg: "#e7a1c4",
          },
          {
            slug: "resto-shaman",
            className: "Restoration\nShaman",
            specName: "Restoration",
            role: "Healer",
            icons: ["spell_nature_magicimmunity", "spell_nature_healingwavegreater"],
            bg: "#2f6ed6",
          },
          {
            slug: "feral-druid",
            className: "Feral\nDruid",
            specName: "Feral",
            role: "Melee DPS",
            icons: ["ability_druid_catform", "ability_druid_rake"],
            bg: "#f08a35",
          },
        ],
      },
    ],
  },

  /**
   * OPTIONAL: if you want each class to have its own page immediately:
   * Just add another key below and keep the same sections for now.
   * Example:
   * "disc-priest": { title: "Disc Priest", sections: SAME_SECTIONS },
   * "resto-druid": { title: "Restoration Druid", sections: SAME_SECTIONS },
   *
   * For now we keep one master page.
   */
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

function TierGrid({ sections }: { sections: TierSection[] }) {
  return (
    <div style={{ display: "grid", gap: 28 }}>
      {sections.map((sec) => (
        <div key={sec.tier}>
          <div
            style={{
              textAlign: "center",
              color: "rgba(255,255,255,0.9)",
              fontSize: 26,
              fontWeight: 700,
              marginBottom: 16,
            }}
          >
            {sec.tier}
          </div>

          <div className="grid">
            {sec.cards.map((c) => (
              <div
                key={c.slug}
                className="card"
                style={{
                  background: c.bg ?? "rgba(255,255,255,0.08)",
                  color: "#111",
                }}
              >
                <div className="left">
                  <div className="title">{c.className}</div>
                  <div className="spec">{c.specName}</div>
                  <div className="role">{c.role}</div>
                </div>

                <div className="icons">
                  {c.icons.slice(0, 3).map((icon, i) => (
                    <img key={i} src={ICON(icon)} className="icon" alt="" />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <style jsx>{`
            .grid {
              display: grid;
              grid-template-columns: repeat(4, minmax(0, 1fr));
              gap: 22px;
              align-items: stretch;
            }

            @media (max-width: 1100px) {
              .grid {
                grid-template-columns: repeat(2, minmax(0, 1fr));
              }
            }

            @media (max-width: 650px) {
              .grid {
                grid-template-columns: 1fr;
              }
            }

            .card {
              border-radius: 22px;
              padding: 18px 18px;
              min-height: 120px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              box-shadow: 0 14px 40px rgba(0, 0, 0, 0.35);
            }

            .left {
              display: grid;
              gap: 8px;
            }

            .title {
              white-space: pre-line;
              font-size: 28px;
              font-weight: 900;
              line-height: 1.05;
            }

            .spec {
              white-space: pre-line;
              font-size: 18px;
              font-weight: 800;
              opacity: 0.9;
            }

            .role {
              font-size: 18px;
              opacity: 0.85;
            }

            .icons {
              display: flex;
              gap: 10px;
              align-items: center;
              justify-content: flex-end;
              margin-left: 14px;
            }

            .icon {
              width: 44px;
              height: 44px;
              border-radius: 12px;
              border: 2px solid rgba(0, 0, 0, 0.22);
              object-fit: cover;
              display: block;
            }
          `}</style>
        </div>
      ))}
    </div>
  );
}

export default function TbcTierPage() {
  const params = useParams() as { spec?: string };
  const slug = params?.spec || "tbc-arena-tierlist";

  const page = TIER_PAGE_BY_SLUG[slug] ?? TIER_PAGE_BY_SLUG["tbc-arena-tierlist"];

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
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
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

        <SectionCard title={page.title}>
          <TierGrid sections={page.sections} />
        </SectionCard>
      </div>
    </main>
  );
}