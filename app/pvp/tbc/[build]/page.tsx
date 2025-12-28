import Link from "next/link";

type PvpBuild = {
  slug: string;
  title: string;
  tier: "S" | "A";
  className: string;
  spec: string;
  role: string;
};

const BUILDS: PvpBuild[] = [
  { slug: "disc-priest", title: "Disc Priest", tier: "S", className: "Priest", spec: "Discipline", role: "Healer" },
  { slug: "resto-druid", title: "Restoration Druid", tier: "S", className: "Druid", spec: "Restoration", role: "Healer" },
  { slug: "arms-warrior", title: "Arms Warrior", tier: "S", className: "Warrior", spec: "Arms", role: "Melee DPS" },
  { slug: "sub-rogue", title: "Subtlety Rogue", tier: "S", className: "Rogue", spec: "Subtlety", role: "Melee DPS" },
  { slug: "frost-mage", title: "Frost Mage", tier: "S", className: "Mage", spec: "Frost", role: "Caster DPS" },
  { slug: "aff-warlock", title: "Affliction Warlock", tier: "S", className: "Warlock", spec: "Affliction / Demonology", role: "Caster DPS" },
  { slug: "mm-hunter", title: "MM Hunter", tier: "S", className: "Hunter", spec: "Marksmanship", role: "Ranged DPS" },
  { slug: "holy-paladin", title: "Holy Paladin", tier: "A", className: "Paladin", spec: "Holy", role: "Healer" },
  { slug: "ret-paladin", title: "Ret Paladin", tier: "A", className: "Paladin", spec: "Retribution", role: "Melee DPS" },
  { slug: "resto-shaman", title: "Restoration Shaman", tier: "A", className: "Shaman", spec: "Restoration", role: "Healer" },
  { slug: "feral-druid", title: "Feral Druid", tier: "A", className: "Druid", spec: "Feral", role: "Melee DPS" },
  { slug: "bm-hunter", title: "BM Hunter", tier: "A", className: "Hunter", spec: "Beast Mastery", role: "Ranged DPS" },
  { slug: "fire-mage", title: "Fire Mage", tier: "A", className: "Mage", spec: "Fire / Arcane", role: "Caster DPS" },
];

function normalizeSlug(input: unknown): string {
  if (typeof input !== "string") return "";
  return input
    .trim()
    .toLowerCase()
    .replaceAll("–", "-")
    .replaceAll("—", "-")
    .replaceAll("-", "-");
}

export default function TbcBuildPage({
  params,
}: {
  params?: Record<string, string | string[] | undefined>;
}) {
  // Try common param keys, then fall back to "first value in params"
  const raw =
    params?.build ??
    params?.slug ??
    params?.id ??
    Object.values(params ?? {})[0];

  const rawStr = Array.isArray(raw) ? raw[0] : raw;
  const slug = normalizeSlug(rawStr);

  const build = slug ? BUILDS.find((b) => b.slug === slug) : undefined;

  const title = build?.title ?? (slug || "Missing route param");
  const meta = build
    ? `${build.className} • ${build.spec} • ${build.role} • ${build.tier} Tier`
    : `Params received: ${JSON.stringify(params ?? {})}`;

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
          ← Back to TBC PvP
        </Link>

        <h1 style={{ fontSize: 52, margin: 0 }}>{title}</h1>
        <p style={{ marginTop: 10, color: "rgba(255,255,255,0.7)", fontSize: 18 }}>
          {meta}
        </p>

        <div
          style={{
            marginTop: 24,
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(0,0,0,0.25)",
            padding: 18,
            color: "rgba(255,255,255,0.85)",
          }}
        >
          If this still doesn’t show the right build, the line above will print the exact params Next is passing.
        </div>
      </div>
    </main>
  );
}