import Link from "next/link";

/**
 * The addon's window: black title bar with the WoW Forever logo on the left,
 * the journal title in the middle and search (home page) on the right; a
 * bordered brown body below.
 */
export default function Window({
  children,
  search,
  style,
  className = "",
}: {
  children: React.ReactNode;
  search?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <div className={`wf-window ${className}`} style={style}>
      <div className="wf-titlebar">
        <Link href="/" className="wf-logo" aria-label="Dungeon Journal home">
          <img src="/journal/wow-forever-logo.webp" alt="World of Warcraft: Forever" width={76} height={62} />
        </Link>
        <Link href="/" className="wf-title">Dungeon Journal</Link>
        <div className="wf-titlebar-right">{search}</div>
      </div>
      <div className="wf-body">{children}</div>
    </div>
  );
}

export function LevelBadge({ level, size = 28 }: { level?: string | number; size?: number }) {
  if (level === undefined || level === null || level === "") return null;
  return (
    <span className="wf-lvl" style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}>
      {level}
    </span>
  );
}

export function FactionCrest({ faction, size = 22 }: { faction: "Alliance" | "Horde" | "Both"; size?: number }) {
  if (faction === "Both") {
    return (
      <span className="wf-crests" aria-label="Alliance and Horde">
        <img src="/journal/alliance.png" alt="Alliance" width={size} height={size} />
        <img src="/journal/horde.png" alt="Horde" width={size} height={size} />
      </span>
    );
  }
  const src = faction === "Alliance" ? "/journal/alliance.png" : "/journal/horde.png";
  return <img src={src} alt={faction} width={size} height={size} className="wf-crest" />;
}
