import Link from "next/link";
import { QUALITY_COLORS, QUALITY_NAMES } from "@/app/lib/journal-shared";
import { itemIconSrc, itemPath } from "@/app/lib/items";

// Links open the site's own item page; data-item gives them the site's own
// hover tooltip (ItemTooltips, mounted once in the layout).

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
  // Not in the game data yet (no ID): name only, the addon's lines on hover.
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
    <Link
      href={itemPath(id, name)}
      prefetch={false}
      className={`wi-link ${className}`}
      style={{ color }}
      data-q={quality}
      data-item={id}
      aria-label={`${name} (${QUALITY_NAMES[quality] ?? "item"})`}
    >
      {icon && <img className="wi-inline" src={itemIconSrc(id)} alt="" width={18} height={18} loading="lazy" />}
      {name}
    </Link>
  );
}

/** Square icon slot (loot rows, quest rewards); also links to the item page.
 *  No quality-coloured frame: the game draws the bare icon (the name carries
 *  the quality colour). */
export function ItemIcon({ id, name }: { id: number; name: string; quality?: number }) {
  if (id <= 0) {
    return (
      <span className="wp-icon" aria-hidden>
        <img src={itemIconSrc(id)} alt="" width={34} height={34} loading="lazy" />
      </span>
    );
  }
  return (
    <Link
      href={itemPath(id, name)}
      prefetch={false}
      className="wp-icon"
      data-item={id}
      tabIndex={-1}
      aria-hidden
    >
      <img src={itemIconSrc(id)} alt="" width={34} height={34} loading="lazy" />
    </Link>
  );
}
