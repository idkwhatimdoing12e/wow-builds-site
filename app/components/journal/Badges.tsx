const CLASS_COLORS: Record<string, string> = {
  DRUID: "#ff7c0a",
  HUNTER: "#aad372",
  MAGE: "#3fc7eb",
  PALADIN: "#f48cba",
  PRIEST: "#ffffff",
  ROGUE: "#fff468",
  SHAMAN: "#0070dd",
  WARLOCK: "#8788ee",
  WARRIOR: "#c69b6d",
};

function titleCase(s: string) {
  return s.charAt(0) + s.slice(1).toLowerCase();
}

export function FactionBadge({ faction }: { faction: "Both" | "Alliance" | "Horde" }) {
  if (faction === "Both") return null;
  const cls =
    faction === "Alliance"
      ? "border-sky-400/40 text-sky-300 bg-sky-500/10"
      : "border-red-400/40 text-red-300 bg-red-500/10";
  return <span className={`badge ${cls}`}>{faction}</span>;
}

export function ClassBadge({ cls }: { cls?: string }) {
  if (!cls) return null;
  const color = CLASS_COLORS[cls] ?? "#ddd";
  return (
    <span className="badge border-white/15 bg-white/5" style={{ color }}>
      {titleCase(cls)} only
    </span>
  );
}

export function Pill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "gold" | "warn" | "muted" }) {
  const tones = {
    neutral: "border-white/15 text-white/80 bg-white/5",
    gold: "border-[color:var(--gold)]/40 text-[color:var(--gold)] bg-[color:var(--gold)]/10",
    warn: "border-amber-400/40 text-amber-300 bg-amber-500/10",
    muted: "border-white/10 text-white/50 bg-transparent",
  };
  return <span className={`badge ${tones[tone]}`}>{children}</span>;
}
