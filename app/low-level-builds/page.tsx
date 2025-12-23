import Link from "next/link";

type Expansion = {
  id: "vanilla" | "tbc" | "wotlk" | "cata" | "mop";
  title: string;
  subtitle: string;
  logo: string; // path from /public
};

const EXPANSIONS: Expansion[] = [
  {
    id: "vanilla",
    title: "Vanilla / Era",
    subtitle: "Classic Era level 1 BiS builds",
    logo: "/expansion-logos/vanilla.png",
  },
  {
    id: "tbc",
    title: "The Burning Crusade",
    subtitle: "TBC level 1 twink builds",
    logo: "/expansion-logos/tbc.png",
  },
  {
    id: "wotlk",
    title: "Wrath of the Lich King",
    subtitle: "WotLK level 1 builds (coming soon)",
    logo: "/expansion-logos/wotlk.png",
  },
  {
    id: "cata",
    title: "Cataclysm",
    subtitle: "Cata level 1 builds (coming soon)",
    logo: "/expansion-logos/cata.png",
  },
  {
    id: "mop",
    title: "Mists of Pandaria",
    subtitle: "MoP level 1 builds (coming soon)",
    logo: "/expansion-logos/mop.png",
  },
];

export default function LowLevelBuildsIndexPage() {
  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "48px 20px" }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>
          ← Back
        </Link>
      </div>

      <h1 style={{ fontSize: 56, lineHeight: 1.05, margin: 0 }}>Low Level Builds</h1>
      <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 18, marginTop: 10 }}>
        Pick an expansion.
      </p>

      <div style={{ display: "grid", gap: 16, marginTop: 24 }}>
        {EXPANSIONS.map((exp) => (
          <Link
            key={exp.id}
            href={`/low-level-builds/${exp.id}`}
            style={{
              textDecoration: "none",
              color: "inherit",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 24,
              padding: 22,
              background: "rgba(255,255,255,0.03)",
              display: "flex",
              alignItems: "center",
              gap: 18,
            }}
          >
            <div
  style={{
    width: 52,
    height: 52,
    borderRadius: 14,
    background: "rgba(255,255,255,0.06)",
    display: "grid",
    placeItems: "center",
    flex: "0 0 auto",
    overflow: "hidden",
  }}
>
  <img
    src={exp.logo}
    alt={`${exp.title} logo`}
    width={38}
    height={38}
    style={{ display: "block" }}
  />
</div>


            <div style={{ flex: "1 1 auto" }}>
              <div style={{ fontSize: 34, fontWeight: 700, lineHeight: 1.1 }}>{exp.title}</div>
              <div style={{ color: "rgba(255,255,255,0.6)", marginTop: 6, fontSize: 16 }}>
                {exp.subtitle} →
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
