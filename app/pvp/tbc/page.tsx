import Link from "next/link";

type BuildCard = {
  title: string;
  detail: string;
  role: string;
  href: string;
  bg: string; // hex
  iconClass: string;
  iconSpec: string;
};

const ICON = (name: string) =>
  `https://wow.zamimg.com/images/wow/icons/large/${name}.jpg`;

// WoW class colors
const COLORS = {
  PRIEST: "#FFFFFF",
  DRUID: "#FF7D0A",
  WARRIOR: "#C79C6E",
  ROGUE: "#FFF569",
  MAGE: "#69CCF0",
  WARLOCK: "#9482C9",
  HUNTER: "#ABD473",
  PALADIN: "#F58CBA",
  SHAMAN: "#0070DE",
} as const;

const S_TIER: BuildCard[] = [
  {
    title: "Disc Priest",
    detail: "Discipline",
    role: "Healer",
    href: "/pvp/tbc/disc-priest",
    bg: COLORS.PRIEST,
    iconClass: "classicon_priest",
    iconSpec: "spell_holy_powerwordshield",
  },
  {
    title: "Restoration Druid",
    detail: "Restoration",
    role: "Healer",
    href: "/pvp/tbc/resto-druid",
    bg: COLORS.DRUID,
    iconClass: "classicon_druid",
    iconSpec: "spell_nature_healingtouch",
  },
  {
    title: "Arms Warrior",
    detail: "Arms",
    role: "Melee DPS",
    href: "/pvp/tbc/arms-warrior",
    bg: COLORS.WARRIOR,
    iconClass: "classicon_warrior",
    iconSpec: "ability_warrior_savageblow",
  },
  {
    title: "Subtlety Rogue",
    detail: "Subtlety",
    role: "Melee DPS",
    href: "/pvp/tbc/sub-rogue",
    bg: COLORS.ROGUE,
    iconClass: "classicon_rogue",
    iconSpec: "ability_stealth",
  },
  {
    title: "Frost Mage",
    detail: "Frost",
    role: "Caster DPS",
    href: "/pvp/tbc/frost-mage",
    bg: COLORS.MAGE,
    iconClass: "classicon_mage",
    iconSpec: "spell_frost_frostbolt02",
  },
  {
    title: "Affliction Warlock",
    detail: "Affliction / Demonology",
    role: "Caster DPS",
    href: "/pvp/tbc/aff-warlock",
    bg: COLORS.WARLOCK,
    iconClass: "classicon_warlock",
    iconSpec: "spell_shadow_gathershadows",
  },
  {
    title: "MM Hunter",
    detail: "Marksmanship",
    role: "Ranged DPS",
    href: "/pvp/tbc/mm-hunter",
    bg: COLORS.HUNTER,
    iconClass: "classicon_hunter",
    iconSpec: "ability_marksmanship",
  },
];

const A_TIER: BuildCard[] = [
  {
    title: "Holy Paladin",
    detail: "Holy",
    role: "Healer",
    href: "/pvp/tbc/holy-paladin",
    bg: COLORS.PALADIN,
    iconClass: "classicon_paladin",
    iconSpec: "spell_holy_holybolt",
  },
  {
    title: "Ret Paladin",
    detail: "Retribution",
    role: "Melee DPS",
    href: "/pvp/tbc/ret-paladin",
    bg: COLORS.PALADIN,
    iconClass: "classicon_paladin",
    iconSpec: "spell_holy_sealofmight",
  },
  {
    title: "Restoration Shaman",
    detail: "Restoration",
    role: "Healer",
    href: "/pvp/tbc/resto-shaman",
    bg: COLORS.SHAMAN,
    iconClass: "classicon_shaman",
    iconSpec: "spell_nature_healingwavegreater",
  },
  {
    title: "Feral Druid",
    detail: "Feral",
    role: "Melee DPS",
    href: "/pvp/tbc/feral-druid",
    bg: COLORS.DRUID,
    iconClass: "classicon_druid",
    iconSpec: "ability_druid_catform",
  },
  {
    title: "BM Hunter",
    detail: "Beast Mastery",
    role: "Ranged DPS",
    href: "/pvp/tbc/bm-hunter",
    bg: COLORS.HUNTER,
    iconClass: "classicon_hunter",
    iconSpec: "ability_druid_ferociousbite",
  },
  {
    title: "Fire Mage",
    detail: "Fire / Arcane",
    role: "Caster DPS",
    href: "/pvp/tbc/fire-mage",
    bg: COLORS.MAGE,
    iconClass: "classicon_mage",
    iconSpec: "spell_fire_fireball02",
  },
];

function TierSection({ title, cards }: { title: string; cards: BuildCard[] }) {
  const cardMinHeight = 140;
  const iconSize = 42;
  const iconGap = 10;
  const rightInset = 22;

  const reservedRight = rightInset + iconSize * 2 + iconGap + 14;

  // Always black text (your request)
  const TITLE = "rgba(11,11,11,0.95)";
  const SUB = "rgba(11,11,11,0.75)";
  const BORDER = "rgba(0,0,0,0.12)";

  return (
    <section style={{ marginTop: 28 }}>
      <h2
        style={{
          textAlign: "center",
          fontSize: 24,
          marginBottom: 16,
          color: "rgba(255,255,255,0.9)",
        }}
      >
        {title}
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 18,
        }}
      >
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            style={{
              textDecoration: "none",
              borderRadius: 16,

              // Use backgroundColor to avoid any shorthand weirdness on mobile
              backgroundColor: c.bg,

              // Prevent inherited filters/blends affecting the card on iOS
              filter: "none",
              WebkitFilter: "none",
              mixBlendMode: "normal",

              color: TITLE,
              border: `1px solid ${BORDER}`,
              boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
              position: "relative",
              overflow: "hidden",
              minHeight: cardMinHeight,
              padding: 18,
              paddingRight: reservedRight,
              display: "flex",
              alignItems: "center",
              transform: "translateZ(0)",
            }}
          >
            {/* TEXT */}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.1, color: TITLE }}>
                {c.title}
              </div>

              <div
                style={{
                  marginTop: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  lineHeight: 1.25,
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                  color: TITLE,
                }}
              >
                {c.detail}
              </div>

              <div
                style={{
                  marginTop: 6,
                  fontSize: 14,
                  lineHeight: 1.25,
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                  color: SUB,
                }}
              >
                {c.role}
              </div>
            </div>

            {/* ICONS */}
            <div
              style={{
                position: "absolute",
                right: rightInset,
                top: "50%",
                transform: "translateY(-50%)",
                display: "flex",
                gap: iconGap,
                alignItems: "center",
              }}
            >
              <img
                src={ICON(c.iconClass)}
                width={iconSize}
                height={iconSize}
                alt=""
                style={{
                  borderRadius: 10,
                  objectFit: "cover",
                  display: "block",
                }}
              />
              <img
                src={ICON(c.iconSpec)}
                width={iconSize}
                height={iconSize}
                alt=""
                style={{
                  borderRadius: 10,
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function PvpTbcPage() {
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
          href="/arena"
          style={{
            display: "inline-block",
            marginBottom: 24,
            color: "rgba(255,255,255,0.65)",
            textDecoration: "none",
          }}
        >
          ← Back
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <img
            src="/expansion-logos/tbc.png"
            width={46}
            height={46}
            alt=""
            style={{ borderRadius: 10 }}
          />
          <h1 style={{ fontSize: 42, margin: 0 }}>The Burning Crusade – Arena Builds</h1>
        </div>

        <TierSection title="S Tier" cards={S_TIER} />
        <TierSection title="A Tier" cards={A_TIER} />
      </div>
    </main>
  );
}