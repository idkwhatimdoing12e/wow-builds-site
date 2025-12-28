import Link from "next/link";

export default function PvpExpansionPage({
  params,
}: {
  params: { expansion: string };
}) {
  // allow BOTH tbc and "tbc" (just in case of casing issues)
  const id = (params.expansion || "").toLowerCase();

  if (id !== "tbc") {
    return (
      <main style={{ minHeight: "100vh", padding: "56px 24px", color: "#fff" }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <Link href="/arena" style={{ color: "rgba(255,255,255,0.65)", textDecoration: "none" }}>
            ← Back
          </Link>
          <h1 style={{ marginTop: 24 }}>Not found</h1>
          <p style={{ color: "rgba(255,255,255,0.65)" }}>
            You opened: <b>{params.expansion}</b>
          </p>
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
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
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

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
          <img
            src="/expansion-logos/tbc.png"
            width={54}
            height={54}
            style={{ borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)" }}
          />
          <h1 style={{ fontSize: 46, margin: 0 }}>The Burning Crusade – Arena Builds</h1>
        </div>

        <Link
          href="/pvp/tbc/disc-priest"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            padding: "22px 24px",
            borderRadius: 18,
            background: "linear-gradient(135deg, #ffffff 0%, #f2f2f2 100%)",
            color: "#0b0b0b",
            textDecoration: "none",
            border: "1px solid rgba(255,255,255,0.9)",
            boxShadow: "0 10px 30px rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ display: "flex", gap: 10 }}>
            <img src="/class-icons/priest.png" width={44} height={44} />
            <img src="/spec-icons/discipline.png" width={44} height={44} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 28, fontWeight: 900 }}>Disc Priest</div>
            <div style={{ marginTop: 6, color: "rgba(0,0,0,0.65)" }}>
              TBC Arena – Discipline specialization
            </div>
          </div>

          <div style={{ fontSize: 20, color: "rgba(0,0,0,0.6)" }}>→</div>
        </Link>
      </div>
    </main>
  );
}