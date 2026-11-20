"use client";

import type { Boss, LootTuple, TrashDrop } from "@/app/lib/journal";
import { useT } from "@/app/components/i18n/I18n";
import ItemLink, { ItemIcon } from "./ItemLink";
import { BossPortrait } from "./BossPortrait";

function LootRow({ item, note }: { item: LootTuple; note?: string }) {
  const [id, name, slot, quality, , , tip] = item;
  return (
    <li className="wb-loot">
      <ItemIcon id={id} name={name} quality={quality} />
      <span className="wb-loot-text">
        <ItemLink id={id} name={name} quality={quality} tip={tip} />
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
  const t = useT();
  const faction = (f: string) => t(f === "Horde" ? "s_horde" : "s_alliance");
  return (
    <div className="wb">
      {/* Like the addon: round portrait with the level badge, name beside it. */}
      <div className="wb-head">
        <BossPortrait
          key={boss.name}
          name={boss.name}
          displayId={boss.displayId}
          crop={boss.portraitCrop}
          custom={boss.customPortrait}
          level={boss.level}
          large
        />
        <div className="wb-head-text">
          <h2 className="wb-title">{boss.name}</h2>
          {(boss.rare || boss.factionOnly) && (
            <div className="wb-meta">
              {boss.rare && <span className="wb-tag">{t("s_rare")}</span>}
              {boss.factionOnly && <span className="wb-tag">{t("s_only", faction(boss.factionOnly))}</span>}
            </div>
          )}
        </div>
      </div>
      {boss.description && <p className="wb-desc">{boss.description}</p>}

      {boss.loot.length === 0 && boss.shared.length === 0 && boss.recipes.length === 0 && (
        <p className="wb-desc">{t("s_no_loot")}</p>
      )}
      <ul className="wb-loot-list">
        {boss.loot.map((it) => (
          <LootRow key={`${it[0]}-${it[1]}`} item={it} />
        ))}
        {boss.shared.map((it) => (
          <LootRow key={`s${it[0]}-${it[1]}`} item={it} note={t("s_shared_drop")} />
        ))}
      </ul>
      {boss.recipes.length > 0 && (
        <details className="wb-recipes">
          <summary>{t("RECIPES_SECTION", boss.recipes.length)}</summary>
          <ul className="wb-loot-list">
            {boss.recipes.map((it) => (
              <LootRow key={`${it[0]}-${it[1]}`} item={it} />
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

export function TrashPanel({ trash }: { trash: TrashDrop[] }) {
  const t = useT();
  return (
    <div className="wb">
      <h2 className="wb-title">{t("s_trash")}</h2>
      <p className="wb-desc">{t("s_trash_desc")}</p>
      <ul className="wb-loot-list">
        {trash.map(({ item, source }) => (
          <LootRow key={`${item[0]}-${item[1]}`} item={item} note={source} />
        ))}
      </ul>
    </div>
  );
}
