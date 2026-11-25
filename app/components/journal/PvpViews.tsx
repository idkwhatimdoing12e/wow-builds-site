"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { QUALITY_COLORS } from "@/app/lib/journal-shared";
import { langInfo } from "@/app/lib/i18n";
import type { Faction } from "@/app/lib/journal";
import type {
  HonorView,
  HonorPieceView,
  PvpBgView,
  PvpCardView,
  PvpEntryView,
  PvpItemView,
} from "@/app/lib/pvp";
import { useHref, useLang, useT } from "@/app/components/i18n/I18n";
import { setFaction, useFaction } from "./useFaction";

// The addon's PvP tab on the web (Systems/PvP.lua, PvPRewards.lua): the
// battlegrounds as cards, each one's rewards by the reputation they need,
// and Honor & Ranks. The addon shows the character's own side and level;
// the site shows the side picked with the crests (shared with the dungeon
// pages) and every level.

const HONOR_ICON = "/journal/icons/inv_sidetab_honor_alliance_c60.webp";

function useNumber() {
  const lang = useLang();
  return (n: number) => n.toLocaleString(langInfo(lang).html);
}

/* ---------- the PvP page: the cards ---------- */

export function PvpCards({ cards }: { cards: PvpCardView[] }) {
  const t = useT();
  const h = useHref();
  return (
    <div className="pv">
      <div className="pv-head">
        <h1 className="wf-dname">{t.or("PVP_BATTLEGROUNDS", "Battlegrounds")}</h1>
      </div>
      <ul className="pv-cards">
        {cards.map((c) => (
          <li key={c.key}>
            <Link href={h(`/pvp/${c.slug}`)} className="jw-card pv-card" style={{ backgroundImage: `url(${c.art})` }}>
              <span className="jw-card-name">{c.name}</span>
              <span className="jw-card-quests">{c.size}</span>
              <span className="jw-card-level">LV {c.level}</span>
            </Link>
          </li>
        ))}
        <li>
          <Link href={h("/pvp/honor-and-ranks")} className="jw-card pv-card pv-card-honor">
            <span className="jw-card-name">{t.or("PVP_HONOR_TITLE", "Honor & Ranks")}</span>
            <img className="pv-card-emblem" src={HONOR_ICON} alt="" width={64} height={64} />
            <span className="jw-card-level pv-card-meta">{t.or("PVP_HONOR_META", "Premier gear and rank rewards")}</span>
          </Link>
        </li>
      </ul>
    </div>
  );
}

/* ---------- shared parts ---------- */

/** Every battleground's page and Honor & Ranks, as the addon's row of round buttons at the top of each page. */
function Jumps({ cards, current }: { cards: PvpCardView[]; current: string }) {
  const t = useT();
  const h = useHref();
  const all = [
    ...cards.map((c) => ({ slug: c.slug, name: c.name, art: c.art })),
    { slug: "honor-and-ranks", name: t.or("PVP_HONOR_TITLE", "Honor & Ranks"), art: "" },
  ];
  return (
    <nav className="pv-jumps" aria-label={t.or("PVP_TITLE", "PvP")}>
      {all.map((j) => (
        <Link
          key={j.slug}
          href={h(`/pvp/${j.slug}`)}
          className={`pv-jump ${j.slug === current ? "on" : ""}`}
          aria-current={j.slug === current ? "page" : undefined}
          title={j.name}
        >
          {j.art ? <span className="pv-jump-art" style={{ backgroundImage: `url(${j.art})` }} /> : <img src={HONOR_ICON} alt="" width={40} height={40} />}
          <span className="pv-jump-name">{j.name}</span>
        </Link>
      ))}
    </nav>
  );
}

function FactionPick() {
  const t = useT();
  const faction = useFaction();
  return (
    <span className="wf-faction-toggle pv-sides" role="group">
      {(["Alliance", "Horde"] as const).map((f) => {
        const name = t(f === "Horde" ? "s_horde" : "s_alliance");
        return (
          <button key={f} type="button" className={faction === f ? "on" : ""} aria-pressed={faction === f} title={name} onClick={() => setFaction(f)}>
            <img src={f === "Horde" ? "/journal/horde.png" : "/journal/alliance.png"} alt={name} width={24} height={24} />
          </button>
        );
      })}
    </span>
  );
}

function Portrait({ src, name }: { src: string | null; name: string }) {
  return (
    <span className="pv-portrait">
      {src ? <img src={src} alt={name} width={64} height={64} loading="lazy" /> : <img src={HONOR_ICON} alt="" width={64} height={64} />}
    </span>
  );
}

function Icon({ item, size = 40 }: { item: PvpItemView; size?: number }) {
  const color = QUALITY_COLORS[item.quality] ?? QUALITY_COLORS[1];
  return (
    <Link href={item.href} prefetch={false} className={`pv-icon pv-q${item.quality}`} style={{ borderColor: color }} data-item={item.id} tabIndex={-1} aria-hidden>
      <img src={item.icon} alt="" width={size} height={size} loading="lazy" />
    </Link>
  );
}

/** The name in its quality's ink colour (the parchment washes the game's bright ones out). */
function Name({ item }: { item: PvpItemView }) {
  return (
    <Link href={item.href} prefetch={false} className="pv-name" data-q={item.quality} data-item={item.id}>
      {item.name}
    </Link>
  );
}

/** A Mark of Honor (or a seal) as a small icon in a cost line. */
function Inline({ item }: { item: PvpItemView }) {
  return (
    <Link href={item.href} prefetch={false} className="pv-inline" data-item={item.id} aria-label={item.name}>
      <img src={item.icon} alt="" width={16} height={16} loading="lazy" />
    </Link>
  );
}

/** "Level 18 · 28 · 38 · 48 · 58": each level its version, with its own tooltip. */
function Levels({ e }: { e: PvpEntryView }) {
  const t = useT();
  const [pre, post = ""] = t.or("PVP_LEVEL", "Level %s").split("%s");
  if (!e.levels.length) return null;
  return (
    <span className="pv-levels">
      {pre}
      {e.levels.map((l, i) => (
        <span key={l.item.id}>
          {i > 0 && <span className="pv-dot"> · </span>}
          {e.levels.length > 1 ? (
            <Link href={l.item.href} prefetch={false} className={`pv-level ${l.item.id === e.item.id ? "on" : ""}`} data-item={l.item.id}>
              {l.level}
            </Link>
          ) : (
            l.level
          )}
        </span>
      ))}
      {post}
    </span>
  );
}

function Row({ e }: { e: PvpEntryView }) {
  const t = useT();
  return (
    <li className="pv-row">
      <Icon item={e.item} />
      <div className="pv-row-text">
        <Name item={e.item} />
        <div className="pv-sub">
          {e.choice ? t.or("PVP_CHOOSE_ONE", "") : e.fromQuest ? t.or("PVP_FROM_QUEST", "") : <Levels e={e} />}
          {e.questHref && (
            <Link href={e.questHref} className="pv-quest">
              <img src="/journal/ui/quest-available.png" alt="" width={12} height={12} />
              {t.or("PVP_CLICK_QUEST", "Click to see the quest")}
            </Link>
          )}
        </div>
      </div>
    </li>
  );
}

/* ---------- a battleground's page ---------- */

export function BattlegroundView({ bg, cards }: { bg: PvpBgView; cards: PvpCardView[] }) {
  const t = useT();
  const h = useHref();
  const faction = useFaction();
  const side = bg.sides[faction];
  const label = (key: string) =>
    /^\d$/.test(key)
      ? t.or(`s_standing_${key}`, key)
      : t.or(key === "questRewards" ? "PVP_QUEST_REWARDS" : key === "mounts" ? "PVP_MOUNTS" : "PVP_SUPPLIES", key);
  return (
    <div className="pv">
      <Jumps cards={cards} current={bg.slug} />
      <div className="pv-head">
        <div className="pv-title">
          <Link href={h("/pvp")} className="pv-back" aria-label={t.or("PVP_BACK", "Back to Battlegrounds")} title={t.or("PVP_BACK", "Back to Battlegrounds")} />
          <h1 className="wf-dname">{bg.name}</h1>
          <span className="pv-meta">LV {bg.level} · {bg.size}</span>
        </div>
        <FactionPick />
      </div>
      <div className="pv-qm">
        <Portrait src={side.vendor.portrait} name={side.vendor.name} />
        <div className="pv-qm-text">
          <div className="pv-faction">{side.factionName}</div>
          <div className="pv-qm-who">{t.or("PVP_QUARTERMASTER", "Quartermaster: %s").replace("%s", side.vendor.name)}</div>
          <div className="pv-qm-where">{side.vendor.where}</div>
        </div>
        {bg.questsHref && (
          <Link href={bg.questsHref} className="wf-btn wf-btn-red wf-btn-sm pv-quests-btn">
            {t.or("PVP_QUESTS", "Quests")}
          </Link>
        )}
      </div>
      {side.sections.map((sec) => (
        <section key={sec.key} className="pv-sec">
          <h2 className="pv-sec-head">{label(sec.key)}</h2>
          <ul className="pv-rows">
            {sec.entries.map((e) => (
              <Row key={e.item.id} e={e} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/* ---------- Honor & Ranks ---------- */

// The class picked on Honor & Ranks, remembered between visits.
const CLASS_STORE = "dj.pvpClass";
const CLASS_EVENT = "dj-pvp-class";
let classMemory = "";

function readClass(): string {
  try {
    return window.localStorage.getItem(CLASS_STORE) ?? classMemory;
  } catch {
    return classMemory;
  }
}

function useStoredClass(): [string, (token: string) => void] {
  const value = useSyncExternalStore(
    (cb) => {
      window.addEventListener(CLASS_EVENT, cb);
      return () => window.removeEventListener(CLASS_EVENT, cb);
    },
    readClass,
    () => "",
  );
  const set = (token: string) => {
    classMemory = token;
    try {
      window.localStorage.setItem(CLASS_STORE, token);
    } catch {
      // the choice lasts this visit
    }
    window.dispatchEvent(new Event(CLASS_EVENT));
  };
  return [value, set];
}

function Cost({ honor, mark, marks }: { honor: number; mark?: PvpItemView; marks?: number }) {
  const t = useT();
  const num = useNumber();
  return (
    <span className="pv-cost">
      {t.or("PVP_COST_HONOR", "%s Honor").replace("%s", num(honor))}
      {mark && marks ? (
        <>
          {" + "}
          {marks} <Inline item={mark} />
        </>
      ) : null}
    </span>
  );
}

function Piece({ p }: { p: HonorPieceView }) {
  const t = useT();
  const num = useNumber();
  return (
    <li className="pv-pair">
      <div className="pv-pair-side">
        <Icon item={p.rare} />
        <div className="pv-row-text">
          <Name item={p.rare} />
          {p.cost && (
            <div className="pv-sub">
              <Cost honor={p.cost.honor} mark={p.cost.mark} marks={p.cost.marks} />
            </div>
          )}
        </div>
      </div>
      <div className="pv-pair-seal" title={p.seal ? t.or("PVP_UPGRADE_WITH", "Made with %s and the rare piece.").replace("%s", p.seal.item.name) : undefined}>
        {p.seal && (
          <>
            <Inline item={p.seal.item} />
            <span className="pv-pair-rank">{t.or("PVP_RANK", "Rank %d").replace("%d", String(p.seal.rank))}</span>
            <span className="pv-pair-honor">{num(p.seal.honor)}</span>
          </>
        )}
        <span className="pv-arrow" aria-hidden />
      </div>
      <div className="pv-pair-side">
        <Icon item={p.epic} />
        <div className="pv-row-text">
          <Name item={p.epic} />
        </div>
      </div>
    </li>
  );
}

export function HonorRanksView({ honor, cards }: { honor: HonorView; cards: PvpCardView[] }) {
  const t = useT();
  const h = useHref();
  const faction: Faction = useFaction();
  const side = honor.sides[faction];
  const [cls, pick] = useStoredClass();
  const current = side.classes.find((c) => c.token === cls) ?? side.classes[0];
  const className = (token: string) => t.or(`CLASS_${token}`, token);
  const field = t.or("s_pvp_field", "Field of Honor");

  return (
    <div className="pv">
      <Jumps cards={cards} current="honor-and-ranks" />
      <div className="pv-head">
        <div className="pv-title">
          <Link href={h("/pvp")} className="pv-back" aria-label={t.or("PVP_BACK", "Back to Battlegrounds")} title={t.or("PVP_BACK", "Back to Battlegrounds")} />
          <h1 className="wf-dname">{t.or("PVP_HONOR_TITLE", "Honor & Ranks")}</h1>
        </div>
        <FactionPick />
      </div>
      <div className="pv-qm">
        <Portrait src={side.hall.portrait} name={side.hall.vendor} />
        <div className="pv-qm-text">
          <div className="pv-faction">{t.or(side.hall.key, "")}{side.hall.zone ? `, ${side.hall.zone}` : ""}</div>
          <div className="pv-qm-who">{side.hall.vendor}</div>
        </div>
      </div>

      <section className="pv-sec">
        <div className="pv-sec-bar">
          <h2 className="pv-sec-head">{t.or("PVP_PREMIER", "Premier gear")}</h2>
          <div className="ts-filter pv-classes" role="group">
            {side.classes.map((c) => (
              <button
                key={c.token}
                type="button"
                className={`ts-class-btn ${c.token === current?.token ? "on" : ""}`}
                aria-pressed={c.token === current?.token}
                aria-label={className(c.token)}
                title={className(c.token)}
                onClick={() => pick(c.token)}
              >
                <img src={`/journal/icons/classicon_${c.token.toLowerCase()}.webp`} alt="" width={28} height={28} />
              </button>
            ))}
          </div>
        </div>
        <p className="pv-text">{t.or("PVP_PREMIER_TEXT", "")}</p>
        {current?.sets.map((set) => (
          <div key={set.name} className="pv-set">
            <h3 className="pv-set-head">
              {set.spec && <img src={set.spec.icon} alt="" width={24} height={24} />}
              <span>{className(current.token)}</span>
              {set.spec && <span className="pv-set-spec">{t.or(set.spec.key, "")}</span>}
              <span className="pv-set-name">{set.name}</span>
            </h3>
            <ul className="pv-pairs">
              {set.pieces.map((p) => (
                <Piece key={p.slot} p={p} />
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="pv-sec">
        <h2 className="pv-sec-head">{t.or("PVP_RANK_REWARDS", "Rank rewards")}</h2>
        <ul className="pv-rows">
          {side.ranks.map((r) => (
            <li key={`${r.rank}-${r.item.id}`} className="pv-row">
              <Icon item={r.item} />
              <div className="pv-row-text">
                <Name item={r.item} />
                <div className="pv-sub">
                  <span className="pv-rank">{t.or("PVP_RANK", "Rank %d").replace("%d", String(r.rank))}</span>
                  {r.honor ? (
                    <>
                      <span className="pv-dot"> · </span>
                      <Cost honor={r.honor} mark={r.mark} marks={r.marks} />
                    </>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="pv-sec">
        <h2 className="pv-sec-head">{t.or("PVP_MARKS", "Marks of Honor")}</h2>
        <p className="pv-text">{t.or("PVP_MARKS_TEXT", "")}</p>
        <ul className="pv-rows">
          {honor.marks.map((m) => (
            <li key={m.item.id} className="pv-row">
              <Icon item={m.item} />
              <div className="pv-row-text">
                <Name item={m.item} />
                <div className="pv-sub">{m.bg}</div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="pv-sec">
        <h2 className="pv-sec-head">{field}</h2>
        <div className="pv-qm pv-qm-inline">
          <Portrait src={honor.field.portrait} name={honor.field.vendor} />
          <div className="pv-qm-text">
            <div className="pv-qm-who">{honor.field.vendor}</div>
            <div className="pv-qm-where">{honor.field.where}</div>
          </div>
        </div>
        <p className="pv-text">{t.or("PVP_FIELD_TEXT", "")}</p>
      </section>

      <section className="pv-sec">
        <h2 className="pv-sec-head">{t.or("PVP_LEGACY", "Legacy Points")}</h2>
        <p className="pv-text">{t.or("PVP_LEGACY_TEXT", "").replace("%s", field)}</p>
      </section>
    </div>
  );
}
