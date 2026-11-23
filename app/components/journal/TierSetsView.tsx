"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { QUALITY_COLORS } from "@/app/lib/journal-shared";
import { useT } from "@/app/components/i18n/I18n";

/** One piece as the page shows it (names, links and icon worked out on the server). */
export interface TierPieceView {
  id: number;
  name: string;
  quality: number;
  icon: string;
  /** The item's page, when the site has one (every piece a boss drops). */
  href?: string;
  sources: { boss: string; dungeon: string; href: string }[];
  /** Tier 0.5: the quest that gives it. */
  quest?: string;
}

export interface TierClassView {
  token: string;
  className: string;
  classIcon: string;
  tier0: { name: string; pieces: TierPieceView[] };
  tier05: { name: string; versions: { specIcon?: string; specName?: string; pieces: TierPieceView[] }[] } | null;
}

const STORE = "dj.tierClasses";

/**
 * The addon's Tier Sets page (Systems/TierSets.lua): each class's Tier 0 set,
 * Head to Feet in a row with where every piece drops, and its Tier 0.5 sets
 * under it, one row per version with its spec icon. Show Classes picks the
 * classes shown (all of them at first), remembered between visits.
 */
export default function TierSetsView({ title, classes }: { title: string; classes: TierClassView[] }) {
  const t = useT();
  // null: every class
  const [picked, setPicked] = useState<string[] | null>(null);
  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORE) ?? "null");
      if (Array.isArray(saved) && saved.length > 0) setPicked(saved.filter((x) => classes.some((c) => c.token === x)));
    } catch {
      // nothing saved, or storage blocked
    }
  }, [classes]);
  const save = (next: string[] | null) => {
    setPicked(next && next.length > 0 && next.length < classes.length ? next : null);
    try {
      if (next && next.length > 0 && next.length < classes.length) window.localStorage.setItem(STORE, JSON.stringify(next));
      else window.localStorage.removeItem(STORE);
    } catch {
      // storage blocked: the choice lasts this visit
    }
  };
  const toggle = (token: string) => {
    const current = picked ?? [];
    save(current.includes(token) ? current.filter((x) => x !== token) : [...current, token]);
  };
  const shown = picked ? classes.filter((c) => picked.includes(c.token)) : classes;

  return (
    <div className="ts">
      <div className="ts-head">
        <h1 className="wf-dname">{title}</h1>
        <div className="ts-filter" role="group" aria-label={t.or("TIER_SHOW_CLASSES", "Show Classes")}>
          <button type="button" className={`ts-all ${picked ? "" : "on"}`} aria-pressed={!picked} onClick={() => save(null)}>
            {t.or("TIER_ALL", "All")}
          </button>
          {classes.map((c) => {
            const on = !!picked?.includes(c.token);
            return (
              <button
                key={c.token}
                type="button"
                className={`ts-class-btn ${on ? "on" : ""}`}
                aria-pressed={on}
                aria-label={c.className}
                title={c.className}
                onClick={() => toggle(c.token)}
              >
                <img src={c.classIcon} alt="" width={28} height={28} />
              </button>
            );
          })}
        </div>
      </div>

      {shown.map((c) => (
        <section key={c.token} className="ts-set" aria-labelledby={`ts-${c.token}`}>
          <h2 className="ts-set-head" id={`ts-${c.token}`}>
            <img src={c.classIcon} alt="" width={26} height={26} />
            <span className="ts-set-class">{c.className}</span>
          </h2>
          <TierRow label={t.or("TIER_0", "Tier 0")} setName={c.tier0.name} pieces={c.tier0.pieces} />
          {c.tier05?.versions.map((v, i) => (
            <TierRow
              key={i}
              label={t.or("TIER_05", "Tier 0.5")}
              setName={c.tier05!.name}
              specIcon={v.specIcon}
              specName={v.specName}
              pieces={v.pieces}
            />
          ))}
        </section>
      ))}
    </div>
  );
}

function TierRow({
  label,
  setName,
  specIcon,
  specName,
  pieces,
}: {
  label: string;
  setName: string;
  specIcon?: string;
  specName?: string;
  pieces: TierPieceView[];
}) {
  return (
    <div className="ts-row">
      <div className="ts-label">
        <span className="ts-tier">{label}</span>
        {specIcon && <img className="ts-spec" src={specIcon} alt={specName ?? ""} title={specName} width={28} height={28} />}
        {specName && <span className="ts-spec-name">{specName}</span>}
        <span className="ts-setname">{setName}</span>
      </div>
      <ul className="ts-cells">
        {pieces.map((p) => (
          <li key={p.id} className="ts-cell">
            <Piece p={p} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function Piece({ p }: { p: TierPieceView }) {
  const color = QUALITY_COLORS[p.quality] ?? QUALITY_COLORS[1];
  const icon = (
    <span className="ts-icon" style={{ borderColor: color }}>
      <img src={p.icon} alt="" width={40} height={40} loading="lazy" />
    </span>
  );
  const first = p.sources[0];
  return (
    <>
      {p.href ? (
        <Link href={p.href} prefetch={false} className="ts-item" data-item={p.id}>
          {icon}
          <span className="ts-name" style={{ color }}>{p.name}</span>
        </Link>
      ) : (
        <span className="ts-item">
          {icon}
          <span className="ts-name" style={{ color }}>{p.name}</span>
        </span>
      )}
      {p.quest ? (
        <span className="ts-src ts-src-quest">
          <img src="/journal/ui/quest-available.png" alt="" width={13} height={13} />
          {p.quest}
        </span>
      ) : first ? (
        <Link href={first.href} prefetch={false} className="ts-src">
          <span className="ts-boss">
            {first.boss}
            {p.sources.length > 1 && <span className="ts-more"> (+{p.sources.length - 1})</span>}
          </span>
          <span className="ts-dungeon">{first.dungeon}</span>
        </Link>
      ) : (
        <span className="ts-src">???</span>
      )}
    </>
  );
}
