import { QUALITY_COLORS, QUALITY_NAMES } from "@/app/lib/journal";
import { itemIconSrc, itemUrl } from "@/app/lib/items";

// Links point at Wowhead, so its power.js shows the full item tooltip on hover.

/** Item name in its quality colour. `icon` adds a small inline icon before the name. */
export default function ItemLink({
  id,
  name,
  quality,
  icon = false,
  className = "",
  tip,
}: {
  id: number;
  name: string;
  quality: number;
  icon?: boolean;
  className?: string;
  /** Tooltip lines from the addon, for an item Wowhead has no page for yet. */
  tip?: string[];
}) {
  const color = QUALITY_COLORS[quality] ?? QUALITY_COLORS[1];
  // Not on Wowhead yet (no ID in the game data): name only, stats on hover.
  if (id <= 0) {
    return (
      <span
        className={`wi-link wi-noid ${className}`}
        style={{ color }}
        data-q={quality}
        title={tip?.join("\n")}
      >
        {icon && <img className="wi-inline" src={itemIconSrc(id)} alt="" width={18} height={18} loading="lazy" />}
        {name}
      </span>
    );
  }
  return (
    <a
      href={itemUrl(id)}
      target="_blank"
      rel="noreferrer noopener"
      className={`wi-link ${className}`}
      style={{ color }}
      data-q={quality}
      aria-label={`${name} (${QUALITY_NAMES[quality] ?? "item"}) on Wowhead`}
    >
      {icon && <img className="wi-inline" src={itemIconSrc(id)} alt="" width={18} height={18} loading="lazy" />}
      {name}
    </a>
  );
}

/** Square icon slot (loot rows, quest rewards); also a Wowhead link so it shows the tooltip. */
export function ItemIcon({ id, quality }: { id: number; quality: number }) {
  const color = QUALITY_COLORS[quality] ?? QUALITY_COLORS[1];
  if (id <= 0) {
    return (
      <span className="wp-icon" style={{ borderColor: color }} aria-hidden>
        <img src={itemIconSrc(id)} alt="" width={34} height={34} loading="lazy" />
      </span>
    );
  }
  return (
    <a
      href={itemUrl(id)}
      target="_blank"
      rel="noreferrer noopener"
      className="wp-icon"
      style={{ borderColor: color }}
      tabIndex={-1}
      aria-hidden
    >
      <img src={itemIconSrc(id)} alt="" width={34} height={34} loading="lazy" />
    </a>
  );
}
