import Link from "next/link";
import { EXPANSIONS } from "../data/expansions";

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

        <h1 style={{ fontSize: 56, lineHeight: 1.05, margin: 0 }}>Arena PvP Builds</h1>
        <p style={{ marginTop: 12, marginBottom: 28, color: "rgba(255,255,255,0.65)", fontSize: 18 }}>
          Pick an expansion.
        </p>

        <div style={{ display: "grid", gap: 16 }}>
          {EXPANSIONS.filter((e) => e.id !== "vanilla").map((e) => (
            <Link
              key={e.id}
              href={`/pvp/${e.id}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                padding: "22px 22px",
                borderRadius: 18,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(0,0,0,0.25)",
                textDecoration: "none",
                color: "#fff",
              }}
            >
              <img
                src={e.logoSrc}
                alt={`${e.name} logo`}
                width={54}
                height={54}
                style={{ borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)" }}
              />

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.3 }}>{e.name}</div>
                <div style={{ marginTop: 6, color: "rgba(255,255,255,0.65)" }}>
                  Arena builds (coming soon)
                </div>
              </div>

              <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 18 }}>→</div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}