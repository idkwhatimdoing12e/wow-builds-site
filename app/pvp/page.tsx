import Link from "next/link";

export default function PvpLandingPage() {
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
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <Link
          href="/"
          style={{
            display: "inline-block",
            marginBottom: 24,
            color: "rgba(255,255,255,0.65)",
            textDecoration: "none",
          }}
        >
          ← Back
        </Link>

        <h1 style={{ fontSize: 56, lineHeight: 1.05, margin: 0 }}>PvP</h1>
        <p style={{ marginTop: 12, marginBottom: 28, color: "rgba(255,255,255,0.65)", fontSize: 18 }}>
          Pick an expansion.
        </p>

        <div style={{ display: "grid", gap: 16 }}>
          <Link
            href="/pvp/tbc"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "22px 22px",
              borderRadius: 18,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(0,0,0,0.25)",
              textDecoration: "none",
              color: "#fff",
            }}
          >
            <div>
              <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: -0.3 }}>The Burning Crusade</div>
              <div style={{ marginTop: 6, color: "rgba(255,255,255,0.65)" }}>
                Tier list + spec pages
              </div>
            </div>
            <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 18 }}>→</div>
          </Link>

          <div
            style={{
              padding: "22px 22px",
              borderRadius: 18,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(0,0,0,0.18)",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            Wrath / Cata / MoP coming later.
          </div>
        </div>
      </div>
    </main>
  );
}