"use client";

import { useEffect, useRef, useState } from "react";
import type { Character, TalentTree } from "@/app/lib/character";

/** One talent as scripts/item-dump/talents.py writes it (0-based tier and column). */
interface TalentInfo {
  /** The TraitNode ID. */
  id: number;
  /** The talent's spell. */
  s: number;
  r: number;
  c: number;
  n: string;
  i: string;
  m: number;
  /** Each rank's text; empty where the game has none of its own for that rank. */
  d: string[];
  /** The talents this one needs, by tier and column. */
  p?: [number, number][];
}
interface TreeInfo {
  name: string;
  icon: string;
  talents: TalentInfo[];
}

const TIP_WIDTH = 300;

// One file per class, fetched once per visit.
const cache = new Map<string, Promise<TreeInfo[] | null>>();
function loadTrees(classToken: string): Promise<TreeInfo[] | null> {
  let p = cache.get(classToken);
  if (!p) {
    p = fetch(`/journal/talents/${classToken}.json`)
      .then((r) => (r.ok ? (r.json() as Promise<TreeInfo[]>) : null))
      .catch(() => {
        cache.delete(classToken);
        return null;
      });
    cache.set(classToken, p);
  }
  return p;
}

/** The rank the character has: by node, else by spell, else by place (older codes). */
const rankOf = (tree: TalentTree | undefined, t: TalentInfo) =>
  tree?.byNode.get(t.id) ?? tree?.bySpell.get(t.s) ?? (tree && tree.byNode.size === 0 && tree.bySpell.size === 0
    ? tree.byPlace.get(`${t.r + 1},${t.c + 1}`)
    : undefined) ?? 0;

interface Tip {
  t: TalentInfo;
  rank: number;
  x: number;
  y: number;
  /** Near the bottom of the screen: the tooltip ends at y instead of starting there. */
  up: boolean;
}

/** The game's talent tooltip: name, rank, this rank's text in gold, then the next rank's. */
function TalentTip({ tip }: { tip: Tip }) {
  const { t, rank } = tip;
  // A rank without its own text (WoW Forever reworked the talent) shows the
  // first rank's, as the game's data has it, and no "Next rank" guess.
  const now = (rank > 0 ? t.d[rank - 1] : "") || t.d[0];
  const next = rank > 0 && rank < t.m ? t.d[rank] : "";
  return (
    <div
      className="tt-tip it-tip"
      role="tooltip"
      style={{ left: tip.x, top: tip.y, transform: tip.up ? "translateY(-100%)" : undefined }}
    >
      <p className="it-name">{t.n || "Unknown talent"}</p>
      <p className="it-line">
        Rank {rank}/{t.m}
      </p>
      {now && <p className="it-line tt-desc">{now}</p>}
      {next && (
        <>
          <p className="it-gap" />
          <p className="it-line">Next rank:</p>
          <p className="it-line tt-desc">{next}</p>
        </>
      )}
    </div>
  );
}

function Tree({ info, mine, onTip }: { info: TreeInfo; mine?: TalentTree; onTip: (tip: Tip | null) => void }) {
  const at = new Map(info.talents.map((t) => [`${t.r},${t.c}`, t]));
  const points = mine?.points ?? 0;
  const name = mine?.name ?? info.name;
  const tiers = Math.max(7, ...info.talents.map((t) => t.r + 1));

  const show = (t: TalentInfo, el: HTMLElement) => {
    // Beside the icon, as the game shows it: on its right, or its left where
    // the screen ends; on a phone, under it.
    const r = el.getBoundingClientRect();
    const w = Math.min(TIP_WIDTH, window.innerWidth - 24);
    let x = r.right + 10;
    let y = r.top;
    if (x + w > window.innerWidth - 12) x = r.left - 10 - w;
    if (x < 12) {
      x = Math.max(12, Math.min(r.left + r.width / 2 - w / 2, window.innerWidth - 12 - w));
      y = r.bottom + 10;
    }
    const up = y > window.innerHeight - 180;
    onTip({ t, rank: rankOf(mine, t), x, y: up ? (x === r.right + 10 || x === r.left - 10 - w ? r.bottom : r.top - 10) : y, up });
  };

  return (
    <section className="tt-tree" aria-label={`${name}: ${points} points`}>
      <header className="tt-tree-head">
        <img src={info.icon} alt="" width={28} height={28} />
        <span className="tt-tree-name">{name}</span>
        <span className="tt-tree-points">{points}</span>
      </header>
      <div className="tt-grid" style={{ gridTemplateRows: `repeat(${tiers}, var(--tt-cell))` }}>
        {/* the arrow from a talent to the one that needs it, drawn under the icons */}
        {info.talents
          .flatMap((t) => (t.p ?? []).map((p) => ({ t, p })))
          .map(({ t, p }) => {
            const [pr, pc] = p;
            const pre = at.get(`${pr},${pc}`);
            const lit = rankOf(mine, t) > 0 || (!!pre && rankOf(mine, pre) >= pre.m);
            const across = pr === t.r;
            return (
              <span
                key={`a${pr}-${pc}-${t.r}-${t.c}`}
                className={`tt-arrow ${across ? (pc < t.c ? "tt-arrow-r" : "tt-arrow-l") : "tt-arrow-d"} ${lit ? "on" : ""}`}
                style={
                  across
                    ? { gridRow: t.r + 1, gridColumn: `${Math.min(pc, t.c) + 1} / ${Math.max(pc, t.c) + 2}` }
                    : { gridColumn: t.c + 1, gridRow: `${pr + 1} / ${t.r + 2}` }
                }
              />
            );
          })}
        {info.talents.map((t) => {
          const rank = rankOf(mine, t);
          const state = rank === 0 ? "off" : rank >= t.m ? "max" : "part";
          return (
            <button
              key={`${t.r},${t.c}`}
              type="button"
              className={`tt-talent tt-${state}`}
              style={{ gridRow: t.r + 1, gridColumn: t.c + 1 }}
              aria-label={`${t.n || "Unknown talent"}, rank ${rank} of ${t.m}`}
              onPointerEnter={(e) => show(t, e.currentTarget)}
              onPointerLeave={() => onTip(null)}
              onFocus={(e) => show(t, e.currentTarget)}
              onBlur={() => onTip(null)}
              onClick={(e) => show(t, e.currentTarget)}
            >
              <img src={t.i} alt="" width={36} height={36} loading="lazy" />
              <span className="tt-rank">
                {rank}/{t.m}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/**
 * The character's talents: "21 / 0 / 30" under the name, and the three trees
 * in a window on a click, each talent with the game's text on hover. Codes
 * from before the addon exported talents carry none, and nothing shows.
 */
export default function TalentWindow({ character, color }: { character: Character; color: string }) {
  const mine = character.talents;
  const dialog = useRef<HTMLDialogElement>(null);
  const [info, setInfo] = useState<{ cls: string; trees: TreeInfo[] | null } | null>(null);
  const [tip, setTip] = useState<Tip | null>(null);
  const cls = character.classToken;
  const loaded = info?.cls === cls ? info.trees : undefined;

  const ensure = () => {
    if (loaded !== undefined) return;
    void loadTrees(cls).then((t) => setInfo({ cls, trees: t }));
  };

  // The trees' icons show on the button, so the class's file loads with the page.
  useEffect(() => {
    if (!mine || mine.length === 0) return;
    let live = true;
    void loadTrees(cls).then((t) => {
      if (live) setInfo({ cls, trees: t });
    });
    return () => {
      live = false;
    };
  }, [cls, mine]);

  // The tooltip goes when the window scrolls or closes.
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    const hide = () => setTip(null);
    d.addEventListener("close", hide);
    d.addEventListener("scroll", hide, true);
    return () => {
      d.removeEventListener("close", hide);
      d.removeEventListener("scroll", hide, true);
    };
  }, [mine]);

  if (!mine || mine.length === 0) return null;
  const total = mine.reduce((n, t) => n + t.points, 0);
  const main = mine.reduce((a, b) => (b.points > a.points ? b : a));

  return (
    <>
      <button
        type="button"
        className="ch-talents"
        onPointerEnter={ensure}
        onFocus={ensure}
        onClick={() => {
          ensure();
          dialog.current?.showModal();
        }}
        aria-haspopup="dialog"
        aria-label={`Talents: ${mine.map((t) => `${t.name} ${t.points}`).join(", ")}`}
      >
        <span className="ch-talents-label">Talents</span>
        <span className="ch-talents-trees">
          {mine.map((t, i) => {
            const icon = loaded?.[i]?.icon;
            return (
              <span key={i} className={`ch-talents-tree ${t === main && t.points > 0 ? "on" : ""}`} title={`${t.name}: ${t.points}`}>
                {icon ? <img src={icon} alt="" width={30} height={30} /> : <span className="ch-talents-noicon" />}
                <span className="ch-talents-pts">{t.points}</span>
              </span>
            );
          })}
        </span>
      </button>

      <dialog
        ref={dialog}
        className="tt"
        aria-label={`${character.name}'s talents`}
        onClick={(e) => {
          // a click on the backdrop (the dialog itself, outside its box) closes it
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
      >
        <div className="tt-box">
          <header className="tt-head">
            <h2 className="tt-title">
              <span style={{ color }}>{character.name}</span>
              <span className="tt-title-rest">Talents</span>
            </h2>
            <span className="tt-total">{total} points spent</span>
            <button type="button" className="tt-close" aria-label="Close" onClick={() => dialog.current?.close()}>
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M2 2l10 10M12 2L2 12" />
              </svg>
            </button>
          </header>
          {loaded === undefined ? (
            <p className="tt-note">Loading…</p>
          ) : loaded === null ? (
            <p className="tt-note">The talent trees could not be loaded.</p>
          ) : (
            <div className="tt-trees">
              {loaded.map((t, i) => (
                <Tree key={i} info={t} mine={mine[i]} onTip={setTip} />
              ))}
            </div>
          )}
        </div>
        {tip && <TalentTip tip={tip} />}
      </dialog>
    </>
  );
}
