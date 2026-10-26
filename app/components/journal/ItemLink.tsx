import { CLASSIC_ITEM_URL, FOREVER_ITEM_ID_MIN, FOREVER_ITEM_URL } from "@/app/lib/site";
import { QUALITY_COLORS, QUALITY_NAMES } from "@/app/lib/journal";

export function itemUrl(id: number): string | null {
  if (id >= FOREVER_ITEM_ID_MIN) return FOREVER_ITEM_URL ? FOREVER_ITEM_URL(id) : null;
  return CLASSIC_ITEM_URL(id);
}

export default function ItemLink({
  id,
  name,
  quality,
  className = "",
}: {
  id: number;
  name: string;
  quality: number;
  className?: string;
}) {
  const color = QUALITY_COLORS[quality] ?? QUALITY_COLORS[1];
  const url = itemUrl(id);
  const title = `${QUALITY_NAMES[quality] ?? ""} · item ${id}`.trim();
  if (!url) {
    return (
      <span className={`font-medium ${className}`} style={{ color }} title={title}>
        {name}
      </span>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer noopener"
      className={`font-medium hover:underline underline-offset-2 ${className}`}
      style={{ color }}
      data-wowhead={`item=${id}&domain=classic`}
      title={title}
    >
      {name}
    </a>
  );
}
