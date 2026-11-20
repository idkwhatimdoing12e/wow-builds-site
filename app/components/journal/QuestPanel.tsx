"use client";

import Link from "next/link";
import { useHref, useT, type T } from "@/app/components/i18n/I18n";
import { zonePin } from "@/app/lib/journal-shared";
import type { ChainStepFull, ItemRef, Quest, RewardTuple } from "@/app/lib/journal";
import ItemLink, { ItemIcon } from "./ItemLink";
import { FactionCrest } from "./Window";
import ZoneMap from "./ZoneMap";

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

/** The green tick the addon puts on a quest the character has handed in. */
export function QuestTick({ className, label }: { className?: string; label?: string }) {
  return (
    <span className={`wq-tick ${className ?? ""}`} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 12.5 L9.5 18 L20 6" />
      </svg>
    </span>
  );
}

function titleCase(s: string) {
  return s.charAt(0) + s.slice(1).toLowerCase();
}

function Rewards({ items, header }: { items: RewardTuple[]; header?: string }) {
  if (items.length === 0) return null;
  return (
    <div className="wp-rewards">
      {header && <div className="wp-sub">{header}</div>}
      <ul className="wp-reward-list">
        {items.map(([id, name, quality, note]) => (
          <li key={id} className="wp-reward">
            <ItemIcon id={id} name={name} quality={quality} />
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

/** The addon's purple XP pill: an "XP" badge, then the amount. */
function XpPill({ xp }: { xp: number }) {
  return (
    <span className="wp-xp">
      <span className="wp-xp-badge" aria-hidden>XP</span>
      {xp.toLocaleString("en-US")} XP
    </span>
  );
}

/** The addon's dark money pill beside the XP. */
function MoneyPill({ text }: { text: string }) {
  return (
    <span className="wp-money-pill">
      <Money text={text} />
    </span>
  );
}

/** XP and money as the addon's reward pills. */
function RewardBar({ xp, money }: { xp?: number; money?: string }) {
  if (xp === undefined && !money) return null;
  return (
    <p className="wp-money">
      {xp !== undefined && <XpPill xp={xp} />}
      {money && <MoneyPill text={money} />}
    </p>
  );
}

/** The addon's green reputation pill: a "+100" badge, then the faction. */
function RepPill({ faction, amount }: { faction: string; amount: string }) {
  const down = amount.startsWith("-");
  return (
    <span className={`wp-rep ${down ? "wp-rep-down" : ""}`}>
      <span className="wp-rep-badge">{amount}</span>
      {faction}
    </span>
  );
}

/** "Ironforge +100" as faction and amount; anything else stays plain text. */
function repParts(text: string): { faction: string; amount: string } | null {
  const m = text.match(/^(.*\S)\s+([+-]\d[\d,]*)$/);
  return m ? { faction: m[1], amount: m[2] } : null;
}

/** The header the addon gives the rewards: "Choose one reward", "Reward", "Rewards". */
function rewardTitle(t: T, count: number, choice = false) {
  if (choice && count > 1) return t("CHOOSE_ONE_REWARD");
  return count === 1 ? t("REWARD") : t("REWARDS");
}

/** "Warrior / Paladin only", in the page's language. */
function classLine(t: T, classes: string[]) {
  return t("s_only", classes.map((c) => t.or(`CLASS_${c}`, titleCase(c))).join(" / "));
}

const RELATED_KEYS: Record<string, string> = { "Starts with": "s_starts_with", "Leads to": "s_leads_to", "See also": "s_see_also" };

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
  done = false,
}: {
  q: Quest;
  /** The character on the character page has handed it in: the addon's green tick by the title. */
  done?: boolean;
  full?: boolean;
  showDungeon?: boolean;
  onSelectQuest?: (id: number) => void;
  canSelect?: (id: number) => boolean;
  onShowChain?: () => void;
}) {
  const t = useT();
  const h = useHref();
  const startsWith = q.related.find((r) => r.label === "Starts with");
  const leadsTo = q.related.find((r) => r.label === "Leads to");
  const selectable = (id: number) => !!onSelectQuest && (canSelect ? canSelect(id) : true);
  return (
    <div className="wp wq">
      <div className="wp-head">
        <h2 className="wp-title">{q.name}</h2>
        {done && <QuestTick className="wp-done" label={t.or("s_done", "Done")} />}
      </div>
      <p className="wp-avail">
        {t("AVAILABLE_FROM_LEVEL", q.requires)}
        <FactionCrest faction={q.faction} size={18} />
        {q.classOnly && <span className="wp-class">{classLine(t, q.classOnly)}</span>}
        {q.startsInDungeon && <span className="wp-flag">{t("s_starts_inside")}</span>}
        {q.repeatable && <span className="wp-flag">{t("s_repeatable")}</span>}
        {q.attunement && <span className="wp-flag">{t("s_attunement", titleCase(q.attunement))}</span>}
        {q.profession && <span className="wp-flag">{t.or(`PROF_${q.profession.toUpperCase()}`, titleCase(q.profession))}</span>}
      </p>
      {showDungeon && (
        <p className="wp-line">
          <span className="wp-label">{t("s_dungeon")}</span>{" "}
          <Link href={h(`/dungeon/${q.dungeonSlug}`)} className="wp-link">{q.dungeonName}</Link>
        </p>
      )}

      {q.warning && <p className="wp-warning">{q.warning}</p>}

      <div className="wp-sub">{t("OBJECTIVE")}</div>
      <p className="wp-text">{q.objective}</p>

      <div className="wp-sub">{t("STARTS_AT")}</div>
      <p className="wp-text">{q.pickup}</p>
      {q.startMap?.detail && <p className="wp-note">{q.startMap.detail}</p>}
      {q.startZone && <ZoneMap pin={q.startZone} />}
      <RefLine label={t("s_started_item")} item={q.startItem} />
      {q.startObject && (
        <p className="wp-line">
          <span className="wp-label">{t("s_started_object")}</span> {q.startObject[0]}
          <span className="wp-note"> — {q.startObject[2]}</span>
        </p>
      )}
      <RefLine label={t("s_need")} item={q.noteItem} />
      {q.requiredItems.map((it) => (
        <RefLine key={it[0]} label={t("s_required")} item={it} />
      ))}
      <RefLine label={t("s_provided")} item={q.providedItem} />

      {!full && startsWith && selectable(startsWith.id) && (
        <p className="wp-actions">
          <button type="button" className="wf-btn wf-btn-red wf-btn-sm" onClick={() => onSelectQuest?.(startsWith.id)}>
            {startsWith.name}
          </button>
        </p>
      )}
      {!full && q.chain.length > 0 && (
        <>
          <p className="wp-chain-notice">{t("CHAIN_REQUIRED")}</p>
          {onShowChain && (
            <p className="wp-actions">
              <button
                type="button"
                className="wf-btn wf-btn-red wf-btn-sm wp-chain-btn"
                title={`${t("REQUIRED_QUESTS")}: ${t("OPEN_REQUIRED_CHAIN")}`}
                onClick={onShowChain}
              >
                {t("SHOW_QUEST_CHAIN")}
                <img src="/journal/questchain.png" alt="" width={17} height={17} />
              </button>
            </p>
          )}
        </>
      )}

      <div className="wp-sub">{t("TURN_IN")}</div>
      <p className="wp-text">{q.turnin}</p>

      {/* The addon puts the notes before the rewards. */}
      {q.note && (
        <>
          <div className="wp-sub">{t("NOTES")}</div>
          <p className="wp-text wp-pre">{q.note}</p>
        </>
      )}

      <div className="wp-rewards-head">
        {q.rewardHeader ??
          rewardTitle(
            t,
            q.rewardItems.length + q.additionalRewardItems.length + q.noteRewardItems.length,
            q.rewardChoice && q.rewardItems.length > 1,
          )}
      </div>
      {q.rewardsText && q.rewardItems.length === 0 ? (
        <p className="wp-text wp-pre">{q.rewardsText}</p>
      ) : (
        <>
          <Rewards items={q.rewardItems} />
          <Rewards items={q.additionalRewardItems} header={t("s_also")} />
          <Rewards items={q.noteRewardItems} header={t("s_later")} />
        </>
      )}
      {(() => {
        const parts = (q.rewardSummary ?? "").split("•").map((part) => part.trim()).filter(Boolean);
        const money = parts.filter(isMoney);
        const reps = parts.filter((part) => !isMoney(part));
        const items = q.rewardItems.length + q.additionalRewardItems.length + q.noteRewardItems.length;
        const extras = q.xp !== undefined || parts.length > 0;
        return (
          <>
            {items > 0 && extras && <div className="wp-sub wp-also">{t("ALSO_RECEIVE")}</div>}
            {(q.xp !== undefined || money.length > 0) && (
              <p className="wp-money">
                {q.xp !== undefined && <XpPill xp={q.xp} />}
                {money.map((part) => <MoneyPill key={part} text={part} />)}
              </p>
            )}
            {reps.length > 0 && (
              <p className="wp-money wp-reps">
                {reps.map((part) => {
                  const rep = repParts(part);
                  return rep ? <RepPill key={part} {...rep} /> : <span key={part} className="wp-rep-text">{part}</span>;
                })}
              </p>
            )}
          </>
        );
      })()}

      {!full && leadsTo && selectable(leadsTo.id) && (
        <p className="wp-actions">
          <button type="button" className="wf-btn wf-btn-red wf-btn-sm" onClick={() => onSelectQuest?.(leadsTo.id)}>
            {t("LEADS_TO", leadsTo.name)}
          </button>
        </p>
      )}

      {full && q.chain.length > 0 && (
        <div className="wp-chain">
          <div className="wp-rewards-head">{t("s_quest_chain")}</div>
          <p className="wp-note">{t("s_chain_final", q.name)}</p>
          <ol className="wp-steps">
            {q.chain.map((s, i) => (
              <li key={`${s.id}-${i}`} className="wp-step">
                <span className="wp-stepno">{i + 1}</span>
                <div>
                  <div className="wp-step-name">
                    {s.slug ? <Link href={h(`/quest/${s.slug}`)} className="wp-link">{s.name}</Link> : s.name}
                    {s.detail?.level && <span className="wp-note"> · {t("s_level", s.detail.level)}</span>}
                  </div>
                  {s.detail?.objective && <div className="wp-text wp-small">{s.detail.objective}</div>}
                  {s.detail?.pickup && (
                    <div className="wp-note">
                      {t("s_pick_up")}: {s.detail.pickup}
                      {s.detail.turnin && s.detail.turnin !== s.detail.pickup && <> · {t("TURN_IN")}: {s.detail.turnin}</>}
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
          <div className="wp-sub">{t("s_related")}</div>
          <ul>
            {q.related.map((r) => (
              <li key={`${r.label}-${r.id}`} className="wp-text wp-small">
                <span className="wp-label">{RELATED_KEYS[r.label] ? t(RELATED_KEYS[r.label]) : r.label}:</span>{" "}
                {r.slug ? <Link href={h(`/quest/${r.slug}`)} className="wp-link">{r.name}</Link> : r.name}
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
  const t = useT();
  const d = s.detail ?? {};
  const stepPin = zonePin(d.map);
  const description = d.suppressDescription ? undefined : d.description;
  const body =
    d.objective && description && description !== d.objective
      ? `${d.objective}\n\n${description}`
      : d.objective || description || t("s_no_step_text");
  return (
    <div className="wp wq">
      <div className="wp-head">
        <h2 className="wp-title wp-title-step">{s.name}</h2>
        <span className="wp-steps-nav">
          {index > 0 && (
            <button type="button" className="wp-page wp-page-prev" aria-label={t("s_prev_step")} onClick={() => onStep(index - 1)} />
          )}
          {index < total - 1 && (
            <button type="button" className="wp-page wp-page-next" aria-label={t("s_next_step")} onClick={() => onStep(index + 1)} />
          )}
        </span>
      </div>
      <p className="wp-avail">
        {t("REQUIRED_PREREQUISITE")}{d.requires ? <>&nbsp; | &nbsp;{t("AVAILABLE_FROM_LEVEL", d.requires)}</> : null}
        <span className="wp-note">{t("s_step_of", index + 1, total)}</span>
      </p>

      <div className="wp-sub">{t("OBJECTIVE")}</div>
      <p className="wp-text wp-pre">{body}</p>

      {(d.requiredItems ?? []).length > 0 && (
        <>
          <div className="wp-sub">{t("REQUIRED_ITEMS")}</div>
          {(d.requiredItems ?? []).map((it) => (
            <RefLine key={it[0]} label="" item={it} />
          ))}
        </>
      )}
      {d.providedItem && (
        <>
          <div className="wp-sub">{t("PROVIDED_ITEM")}</div>
          <RefLine label="" item={d.providedItem} />
        </>
      )}

      {(d.pickup || d.startItem || d.startObject) && (
        <>
          <div className="wp-sub">{t("STARTS_AT")}</div>
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
          {stepPin && <ZoneMap pin={stepPin} />}
        </>
      )}
      {d.turnin && (
        <>
          <div className="wp-sub">{t("TURN_IN")}</div>
          <p className="wp-text">{d.turnin}</p>
        </>
      )}

      {d.warning && <p className="wp-warning">{d.warning}</p>}
      {d.note && (
        <>
          <div className="wp-sub">{t("NOTES")}</div>
          <p className="wp-text wp-pre">{d.note}</p>
        </>
      )}

      {(s.rewardItems.length > 0 || s.xp !== undefined || s.money) && (
        <>
          <div className="wp-rewards-head">{rewardTitle(t, s.rewardItems.length, s.rewardChoice)}</div>
          <Rewards items={s.rewardItems} />
          {s.rewardItems.length > 0 && (s.xp !== undefined || s.money) && (
            <div className="wp-sub wp-also">{t("ALSO_RECEIVE")}</div>
          )}
          <RewardBar xp={s.xp} money={s.money} />
        </>
      )}
    </div>
  );
}
