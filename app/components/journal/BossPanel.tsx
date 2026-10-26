import type { Boss, LootTuple, TrashDrop } from "@/app/lib/journal";
import ItemLink from "./ItemLink";
import { LevelBadge } from "./Window";

function LootRow({ item, note }: { item: LootTuple; note?: string }) {
  const [id, name, slot, quality] = item;
  return (
    <li className="wb-loot">
      <span className="wp-icon" aria-hidden />
      <span className="wb-loot-text">
        <ItemLink id={id} name={name} quality={quality} />
        <span className="wb-slot">
          {slot}
          {note && <span className="wb-note"> · {note}</span>}
        </span>
      </span>
    </li>
  );
}

/** Right-hand pane of the Bosses tab: boss name, level, loot list. */
export function BossPanel({ boss }: { boss: Boss }) {
  return (
    <div className="wb">
      <h2 className="wb-title">{boss.name}</h2>
      <div className="wb-meta">
        <LevelBadge level={boss.level} size={30} />
        {boss.rare && <span className="wb-tag">Rare</span>}
        {boss.factionOnly && <span className="wb-tag">{boss.factionOnly} only</span>}
      </div>
      {boss.description && <p className="wb-desc">{boss.description}</p>}

      {boss.loot.length === 0 && boss.shared.length === 0 && boss.recipes.length === 0 && (
        <p className="wb-desc">No loot recorded yet.</p>
      )}
      <ul className="wb-loot-list">
        {boss.loot.map((it) => (
          <LootRow key={it[0]} item={it} />
        ))}
        {boss.shared.map((it) => (
          <LootRow key={`s${it[0]}`} item={it} note="shared drop" />
        ))}
      </ul>
      {boss.recipes.length > 0 && (
        <details className="wb-recipes">
          <summary>Recipes &amp; Patterns ({boss.recipes.length})</summary>
          <ul className="wb-loot-list">
            {boss.recipes.map((it) => (
              <LootRow key={it[0]} item={it} />
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

export function TrashPanel({ trash }: { trash: TrashDrop[] }) {
  return (
    <div className="wb">
      <h2 className="wb-title">Trash Drops</h2>
      <p className="wb-desc">Items that drop from the dungeon&apos;s regular enemies, with the mobs that carry them.</p>
      <ul className="wb-loot-list">
        {trash.map(({ item, source }) => (
          <LootRow key={item[0]} item={item} note={source} />
        ))}
      </ul>
    </div>
  );
}
