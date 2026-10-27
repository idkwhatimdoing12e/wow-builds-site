import Link from "next/link";
import type { ChainStepFull, ItemRef, Quest, RewardTuple } from "@/app/lib/journal";
import ItemLink, { ItemIcon } from "./ItemLink";
import { FactionCrest } from "./Window";

const COINS = { g: "gold", s: "silver", c: "copper" } as const;
const isMoney = (t: string) => /^(\d+\s*[gsc]\s*)+$/.test(t.trim());

/** "2g 65s" as the game's coin row: 2 [gold] 65 [silver]. */
function Money({ text }: { text: string }) {
  return (
    <span className="wp-coins">
      {[...text.matchAll(/(\d+)\s*([gsc])/g)].map(([, n, u]) => {
        const coin = COINS[u as keyof typeof COINS];
        return (
          <span key={u} className="wp-coin">
            {n}
            <img src={`/journal/ui/coin-${coin}.png`} alt={coin} width={13} height={13} />
          </span>
        );
      })}
    </span>
  );
}

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
            <ItemIcon id={id} quality={quality} />
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
      {label && <><span className="wp-label">{label}</span>{" "}</>}
      <ItemLink id={id} name={name} quality={quality} icon />
      {source && <span className="wp-note"> — {source}</span>}
    </p>
  );
}

/** XP and money as the game's reward bar. */
function RewardBar({ xp, money }: { xp?: number; money?: string }) {
  if (xp === undefined && !money) return null;
  return (
    <p className="wp-money">
      {xp !== undefined && <span className="wp-xp">{xp.toLocaleString("en-US")} XP</span>}
      {money && <Money text={money} />}
    </p>
  );
}

/**
 * The parchment quest page from the addon's Quests tab.
 * In the dungeon view (`onSelectQuest` given) linked quests and the quest chain
 * open in place, like the addon. `full` (the quest's own page) lists the chain
 * and related quests instead.
 */
export default function QuestPanel({
  q,
  full = false,
  showDungeon = false,
  onSelectQuest,
  canSelect,
  onShowChain,
}: {
  q: Quest;
  full?: boolean;
  showDungeon?: boolean;
  onSelectQuest?: (id: number) => void;
  canSelect?: (id: number) => boolean;
  onShowChain?: () => void;
}) {
  const startsWith = q.related.find((r) => r.label === "Starts with");
  const leadsTo = q.related.find((r) => r.label === "Leads to");
  const selectable = (id: number) => !!onSelectQuest && (canSelect ? canSelect(id) : true);
  return (
    <div className="wp">
      <div className="wp-head">
        <h2 className="wp-title">{q.name}</h2>
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

      {!full && startsWith && selectable(startsWith.id) && (
        <p className="wp-actions">
          <button type="button" className="wf-btn wf-btn-red wf-btn-sm" onClick={() => onSelectQuest?.(startsWith.id)}>
            {startsWith.name}
          </button>
        </p>
      )}
      {!full && q.chain.length > 0 && (
        <>
          <p className="wp-chain-notice">Requires a quest chain first.</p>
          {onShowChain && (
            <p className="wp-actions">
              <button
                type="button"
                className="wf-btn wf-btn-red wf-btn-sm wp-chain-btn"
                title="Required Quests: open the required quest chain."
                onClick={onShowChain}
              >
                Show Quest Chain
                <img src="/journal/questchain.png" alt="" width={17} height={17} />
              </button>
            </p>
          )}
        </>
      )}

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
        {q.rewardSummary &&
          q.rewardSummary.split("•").map((part) => part.trim()).filter(Boolean).map((part) =>
            isMoney(part) ? <Money key={part} text={part} /> : <span key={part}>{part}</span>,
          )}
      </p>

      {!full && leadsTo && selectable(leadsTo.id) && (
        <p className="wp-actions">
          <button type="button" className="wf-btn wf-btn-red wf-btn-sm" onClick={() => onSelectQuest?.(leadsTo.id)}>
            Leads to: {leadsTo.name}
          </button>
        </p>
      )}

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

/**
 * A step of a quest's prerequisite chain, as the addon shows it when you pick it
 * under the quest (RefreshPrerequisiteQuestDetail): "Required prerequisite",
 * the page arrows to walk the chain, objective, where it starts and ends, rewards.
 */
export function PrereqPanel({
  s,
  index,
  total,
  onStep,
}: {
  s: ChainStepFull;
  index: number;
  total: number;
  onStep: (index: number) => void;
}) {
  const d = s.detail ?? {};
  const description = d.suppressDescription ? undefined : d.description;
  const body =
    d.objective && description && description !== d.objective
      ? `${d.objective}\n\n${description}`
      : d.objective || description || "Quest text is not available for this step.";
  return (
    <div className="wp">
      <div className="wp-head">
        <h2 className="wp-title wp-title-step">{s.name}</h2>
        <span className="wp-steps-nav">
          {index > 0 && (
            <button type="button" className="wp-page wp-page-prev" aria-label="Previous step" onClick={() => onStep(index - 1)} />
          )}
          {index < total - 1 && (
            <button type="button" className="wp-page wp-page-next" aria-label="Next step" onClick={() => onStep(index + 1)} />
          )}
        </span>
      </div>
      <p className="wp-avail">
        Required prerequisite{d.requires ? <>&nbsp; | &nbsp;Available from Level {d.requires}</> : null}
        <span className="wp-note">Step {index + 1} of {total}</span>
      </p>

      <div className="wp-sub">Objective</div>
      <p className="wp-text wp-pre">{body}</p>

      {(d.requiredItems ?? []).length > 0 && (
        <>
          <div className="wp-sub">Required Items</div>
          {(d.requiredItems ?? []).map((it) => (
            <RefLine key={it[0]} label="" item={it} />
          ))}
        </>
      )}
      {d.providedItem && (
        <>
          <div className="wp-sub">Provided Item</div>
          <RefLine label="" item={d.providedItem} />
        </>
      )}

      {(d.pickup || d.startItem || d.startObject) && (
        <>
          <div className="wp-sub">Starts at</div>
          {d.startObject ? (
            <p className="wp-text">
              {d.startObject[0]}
              <span className="wp-note"> — {d.startObject[2]}</span>
            </p>
          ) : d.startItem ? (
            <RefLine label="" item={d.startItem} />
          ) : (
            <p className="wp-text">{d.pickup}</p>
          )}
        </>
      )}
      {d.turnin && (
        <>
          <div className="wp-sub">Turn in</div>
          <p className="wp-text">{d.turnin}</p>
        </>
      )}

      {d.warning && <p className="wp-warning">{d.warning}</p>}
      {d.note && (
        <>
          <div className="wp-sub">Notes</div>
          <p className="wp-text wp-pre">{d.note}</p>
        </>
      )}

      {(s.rewardItems.length > 0 || s.xp !== undefined || s.money) && (
        <>
          <div className="wp-rewards-head">Rewards</div>
          <Rewards items={s.rewardItems} header={s.rewardChoice ? "Choose one" : "You receive"} />
          <RewardBar xp={s.xp} money={s.money} />
        </>
      )}
    </div>
  );
}
