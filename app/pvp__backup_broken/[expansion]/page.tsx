import Link from "next/link";
import { notFound } from "next/navigation";

type Card = {
  slug: string;
  title: string;
  tier: "S" | "A";
  classColor: string;
  specLine: string;
  roleLine: string;
};

const TBC_CARDS: { s: Card[]; a: Card[] } = {
  s: [
    { slug: "disc-priest", title: "Disc Priest", tier: "S", classColor: "#FFFFFF", specLine: "Discipline", roleLine: "Healer" },
    { slug: "resto-druid", title: "Restoration Druid", tier: "S", classColor: "#FF7D0A", specLine: "Restoration", roleLine: "Healer" },
    { slug: "arms-warrior", title: "Arms Warrior", tier: "S", classColor: "#C79C6E", specLine: "Arms", roleLine: "Melee DPS" },
    { slug: "sub-rogue", title: "Subtlety Rogue", tier: "S", classColor: "#FFF569", specLine: "Subtlety", roleLine: "Melee DPS" },
    { slug: "frost-mage", title: "Frost Mage", tier: "S", classColor: "#69CCF0", specLine: "Frost", roleLine: "Caster DPS" },
    { slug: "aff-warlock", title: "Affliction Warlock", tier: "S", classColor: "#9482C9", specLine: "Affliction / Demonology", roleLine: "Caster DPS" },
    { slug: "mm-hunter", title: "MM Hunter", tier: "S", classColor: "#ABD473", specLine: "Marksmanship", roleLine: "Ranged DPS" },
  ],
  a: [
    { slug: "holy-paladin", title: "Holy Paladin", tier: "A", classColor: "#F58CBA", specLine: "Holy", roleLine: "Healer" },
    { slug: "ret-paladin", title: "Ret Paladin", tier: "A", classColor: "#F58CBA", specLine: "Retribution", roleLine: "Melee DPS" },
    { slug: "resto-shaman", title: "Restoration Shaman", tier: "A", classColor: "#0070DE", specLine: "Restoration", roleLine: "Healer" },
    { slug: "feral-druid", title: "Feral Druid", tier: "A", classColor: "#FF7D0A", specLine: "Feral", roleLine: "Melee DPS" },
    { slug: "bm-hunter", title: "BM Hunter", tier: "A", classColor: "#ABD473", specLine: "Beast Mastery", roleLine: "Ranged DPS" },
    { slug: "fire-mage", title: "Fire Mage", tier: "A", classColor: "#69CCF0", specLine: "Fire / Arcane", roleLine: "Caster DPS" },
  ],
};

function TierSection({ title, items, expansion }: { title: string; items: Card[]; expansion: string }) {
  return (
    <section style={{ marginTop: 22 }}>
      <div style={{ textAlign: "center", fontSize: 34, fontWeight: 800, marginBottom: 16, color: "rgba(255,255,255,0.88)" }}>
        {title}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 }}>
        {items.map((c) => (
          <Link
            key={c.slug}
            href={`/pvp/${expansion}/${c.slug}`}
            style={{
              textDecoration: "none",
              color: "#111",
              background: c.classColor,
              borderRadius: 22,
              padding: 22,
              minHeight: 150,
              boxShadow: "0 18px 60px rgba(0,0,0,0.55)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div style={{ fontSize: 34, fontWeight: 900, lineHeight: 1.05 }}>{c.title}</div>
            <div style={{ marginTop: 10, fontSize: 18, fontWeight: 700 }}>{c.specLine}</div>
            <div style={{ marginTop: 4, fontSize: 18, opacity: 0.85 }}>{c.roleLine}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function PvpExpansionPage({ params }: { params: { expansion: string } }) {
  const expansion = (params.expansion || "").toLowerCase();

  // Only TBC is wired right now.
  if (expansion !== "tbc") return notFound();

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
        <Link href="/pvp" style={{ display: "inline-block", marginBottom: 24, color: "rgba(255,255,255,0.65)", textDecoration: "none" }}>
          ← Back
        </Link>

        <h1 style={{ fontSize: 54, margin: 0, letterSpacing: -0.6 }}>TBC — PvP Tier List</h1>
        <p style={{ marginTop: 10, color: "rgba(255,255,255,0.65)", fontSize: 18 }}>Click a spec to open its page.</p>

        <TierSection title="S Tier" items={TBC_CARDS.s} expansion={expansion} />
        <TierSection title="A Tier" items={TBC_CARDS.a} expansion={expansion} />
      </div>
    </main>
  );
}