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
}: {
  id: number;
  name: string;
  quality: number;
  icon?: boolean;
  className?: string;
}) {
  const color = QUALITY_COLORS[quality] ?? QUALITY_COLORS[1];
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
