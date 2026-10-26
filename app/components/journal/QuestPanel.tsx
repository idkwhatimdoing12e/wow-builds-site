import Link from "next/link";
import type { ItemRef, Quest, RewardTuple } from "@/app/lib/journal";
import ItemLink from "./ItemLink";
import { FactionCrest } from "./Window";

function titleCase(s: string) {
  return s.charAt(0) + s.slice(1).toLowerCase();
}

function Rewards({ items, header }: { items: RewardTuple[]; header: string }) {
  if (items.length === 0) return null;
  return (
    <div className="wp-rewards">
      <div className="wp-sub">{header}</div>
      <ul className="wp-reward-list">
        {items.map(([id, name, quality, note]) => (
          <li key={id} className="wp-reward">
            <span className="wp-icon" aria-hidden />
            <span>
              <ItemLink id={id} name={name} quality={quality} />
              {note && <span className="wp-note"> {note}</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RefLine({ label, item }: { label: string; item?: ItemRef }) {
  if (!item) return null;
  const [id, name, quality, source] = item;
  return (
    <p className="wp-line">
      <span className="wp-label">{label}</span>{" "}
      <ItemLink id={id} name={name} quality={quality} />
      {source && <span className="wp-note"> — {source}</span>}
    </p>
  );
}

/**
 * The parchment quest page from the addon's Quests tab. `full` adds the
 * prerequisite chain and related quests (used on the quest's own page).
 */
export default function QuestPanel({ q, full = false, showDungeon = false }: { q: Quest; full?: boolean; showDungeon?: boolean }) {
  return (
    <div className="wp">
      <div className="wp-head">
        <h2 className="wp-title">{q.name}</h2>
        {full ? null : (
          <Link href={`/quest/${q.slug}`} className="wf-btn wf-btn-dark wf-btn-sm" title="Open this quest's own page">
            Open
          </Link>
        )}
      </div>
      <p className="wp-avail">
        Available from Level {q.requires}
        <FactionCrest faction={q.faction} size={18} />
        {q.classOnly && <span className="wp-class">{titleCase(q.classOnly)} only</span>}
        {q.startsInDungeon && <span className="wp-flag">Starts inside</span>}
        {q.repeatable && <span className="wp-flag">Repeatable</span>}
        {q.attunement && <span className="wp-flag">{titleCase(q.attunement)} attunement</span>}
        {q.profession && <span className="wp-flag">{titleCase(q.profession)}</span>}
      </p>
      {showDungeon && (
        <p className="wp-line">
          <span className="wp-label">Dungeon</span>{" "}
          <Link href={`/dungeon/${q.dungeonSlug}`} className="wp-link">{q.dungeonName}</Link>
        </p>
      )}

      {q.warning && <p className="wp-warning">{q.warning}</p>}

      <div className="wp-sub">Objective</div>
      <p className="wp-text">{q.objective}</p>

      <div className="wp-sub">Starts at</div>
      <p className="wp-text">{q.pickup}</p>
      {q.startMap?.detail && <p className="wp-note">{q.startMap.detail}</p>}
      <RefLine label="Started by item:" item={q.startItem} />
      {q.startObject && (
        <p className="wp-line">
          <span className="wp-label">Started by object:</span> {q.startObject[0]}
          <span className="wp-note"> — {q.startObject[2]}</span>
        </p>
      )}
      <RefLine label="You will need:" item={q.noteItem} />
      {q.requiredItems.map((it) => (
        <RefLine key={it[0]} label="Required:" item={it} />
      ))}
      <RefLine label="Provided:" item={q.providedItem} />

      <div className="wp-sub">Turn in</div>
      <p className="wp-text">{q.turnin}</p>

      <div className="wp-rewards-head">{q.rewardHeader ?? "Rewards"}</div>
      {q.rewardsText && q.rewardItems.length === 0 ? (
        <p className="wp-text wp-pre">{q.rewardsText}</p>
      ) : (
        <>
          <Rewards items={q.rewardItems} header={q.rewardChoice ? "Choose one" : "You receive"} />
          <Rewards items={q.additionalRewardItems} header="Also" />
          <Rewards items={q.noteRewardItems} header="Later in the chain" />
        </>
      )}
      <p className="wp-money">
        {q.xp !== undefined && <span className="wp-xp">{q.xp.toLocaleString("en-US")} XP</span>}
        {q.rewardSummary && <span>{q.rewardSummary}</span>}
      </p>

      {q.note && (
        <>
          <div className="wp-sub">Notes</div>
          <p className="wp-text wp-pre">{q.note}</p>
        </>
      )}

      {full && q.chain.length > 0 && (
        <div className="wp-chain">
          <div className="wp-rewards-head">Quest chain</div>
          <p className="wp-note">Complete these first; <strong>{q.name}</strong> is the final step.</p>
          <ol className="wp-steps">
            {q.chain.map((s, i) => (
              <li key={`${s.id}-${i}`} className="wp-step">
                <span className="wp-stepno">{i + 1}</span>
                <div>
                  <div className="wp-step-name">
                    {s.slug ? <Link href={`/quest/${s.slug}`} className="wp-link">{s.name}</Link> : s.name}
                    {s.detail?.level && <span className="wp-note"> · level {s.detail.level}</span>}
                  </div>
                  {s.detail?.objective && <div className="wp-text wp-small">{s.detail.objective}</div>}
                  {s.detail?.pickup && (
                    <div className="wp-note">
                      Pick up: {s.detail.pickup}
                      {s.detail.turnin && s.detail.turnin !== s.detail.pickup && <> · Turn in: {s.detail.turnin}</>}
                    </div>
                  )}
                </div>
              </li>
            ))}
            <li className="wp-step wp-step-final">
              <span className="wp-stepno">{q.chain.length + 1}</span>
              <div className="wp-step-name">{q.name}</div>
            </li>
          </ol>
        </div>
      )}

      {full && q.related.length > 0 && (
        <div className="wp-related">
          <div className="wp-sub">Related</div>
          <ul>
            {q.related.map((r) => (
              <li key={`${r.label}-${r.id}`} className="wp-text wp-small">
                <span className="wp-label">{r.label}:</span>{" "}
                {r.slug ? <Link href={`/quest/${r.slug}`} className="wp-link">{r.name}</Link> : r.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
