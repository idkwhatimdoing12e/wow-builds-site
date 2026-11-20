import { QUALITY_COLORS } from "@/app/lib/journal-shared";
import type { ItemTip } from "@/app/lib/item-tip";

/** Copper to the game's coins, "2g 21s 68c". */
function Coins({ copper }: { copper: number }) {
  const g = Math.floor(copper / 10000);
  const s = Math.floor((copper % 10000) / 100);
  const c = copper % 100;
  return (
    <>
      {g > 0 && <span className="it-coin it-gold">{g}g</span>}
      {s > 0 && <span className="it-coin it-silver">{s}s</span>}
      {c > 0 && <span className="it-coin it-copper">{c}c</span>}
    </>
  );
}

/**
 * The inside of the game's item tooltip. With the in-game dump it is the
 * game's own lines, colours and sell price; without it, what the journal
 * knows: name, slot, the addon's lines and where the item comes from.
 * `heading` makes the name the page's h1 (on the item page).
 */
export default function ItemTooltipBody({ t, heading = false }: { t: ItemTip; heading?: boolean }) {
  const color = QUALITY_COLORS[t.quality] ?? QUALITY_COLORS[1];
  const Name = heading ? "h1" : "p";

  if (t.lines?.length) {
    const [first, ...rest] = t.lines;
    return (
      <>
        <Name className="it-name" style={{ color: first.lc ?? color }}>{first.l || t.name}</Name>
        {rest.map((line, i) =>
          line.price ? (
            <p key={i} className="it-line" style={{ color: line.lc }}>
              {line.l || "Sell Price:"} <Coins copper={line.price} />
            </p>
          ) : line.r ? (
            <p key={i} className="it-row">
              <span style={{ color: line.lc }}>{line.l}</span>
              <span style={{ color: line.rc }}>{line.r}</span>
            </p>
          ) : (
            <p key={i} className={line.l ? "it-line" : "it-gap"} style={{ color: line.lc }}>
              {line.l}
            </p>
          ),
        )}
      </>
    );
  }

  const [slotLeft, slotRight] = (t.slot ?? "").split(",").map((s) => s.trim());
  return (
    <>
      <Name className="it-name" style={{ color }}>{t.name}</Name>
      {t.slot && (
        <p className="it-row">
          <span>{slotLeft}</span>
          {slotRight && <span>{slotRight}</span>}
        </p>
      )}
      {(t.tip ?? [])
        .filter((line) => line !== t.slot)
        .map((line, i) => (
          <p key={i} className="it-line">{line}</p>
        ))}
      {t.source && <p className="it-source">{t.source}</p>}
    </>
  );
}
