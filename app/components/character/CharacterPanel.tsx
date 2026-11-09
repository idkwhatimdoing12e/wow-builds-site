"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CLASS_COLORS,
  CLASS_NAMES,
  decodeCharacter,
  dungeonProgress,
  progressTotals,
  raceName,
  type Character,
  type DungeonProgress,
  type IndexDungeon,
} from "@/app/lib/character";

const STORAGE_KEY = "dj.character.code";

/** The code lives in the URL fragment, which the browser never sends to a server. */
function codeFromHash(): string {
  if (typeof window === "undefined") return "";
  try { return decodeURIComponent(window.location.hash.replace(/^#/, "")).trim(); }
  catch { return ""; }
}

/** One dungeon tile: the home page's card, with progress and a quest list inside. */
function DungeonCard({
  d,
  open,
  onToggle,
}: {
  d: DungeonProgress;
  open: boolean;
  onToggle: () => void;
}) {
  const pct = d.questsTotal > 0 ? Math.round((d.questsDone / d.questsTotal) * 100) : 0;
  return (
    <div
      className={`wf-card ch-card ${d.cleared ? "ch-card-done" : ""} ${open ? "ch-card-open" : ""} ${
        d.previewOnly ? "wf-card-preview" : ""
      }`}
      style={d.art ? { backgroundImage: `url(${d.art})` } : undefined}
    >
      <button
        type="button"
        className="ch-card-face"
        onClick={onToggle}
        aria-expanded={open}
        disabled={d.previewOnly || d.questsTotal === 0}
      >
        <span className="wf-card-name">{d.name}</span>
        {d.previewOnly ? (
          <span className="wf-card-soon">Coming Soon</span>
        ) : (
          <>
            {d.cleared && (
              <span className="ch-check" aria-label="Cleared">
                <svg viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M8 25 L19 36 L40 12" />
                </svg>
              </span>
            )}
            <span className="ch-card-foot">
              <span className="ch-card-bar">
                <span className="ch-card-bar-fill" style={{ width: `${pct}%` }} />
              </span>
              <span className="ch-card-count">
                {d.questsDone}/{d.questsTotal}
              </span>
            </span>
          </>
        )}
        <span className="wf-card-level">LV {d.level}</span>
      </button>

      {open && (
        <div className="ch-quests">
          <ul>
            {d.questState.map((q) => (
              <li key={q.id} className={q.done ? "ch-q-done" : ""}>
                <span className="ch-q-tick" aria-hidden="true">{q.done ? "✓" : "○"}</span>
                <Link href={`/quest/${q.slug}`} className="ch-q-name">{q.name}</Link>
              </li>
            ))}
          </ul>
          <Link href={`/dungeon/${d.slug}`} className="ch-q-more">
            Open {d.name} →
          </Link>
        </div>
      )}
    </div>
  );
}

export default function CharacterPanel({ index, initialCode }: { index: IndexDungeon[]; initialCode?: string }) {
  const [character, setCharacter] = useState<Character | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  const load = useCallback((code: string, remember: boolean) => {
    const result = decodeCharacter(code);
    if (!result.ok) {
      setError(result.error);
      return false;
    }
    setError("");
    setCharacter(result.character);
    if (remember) {
      try {
        window.localStorage.setItem(STORAGE_KEY, code.trim());
      } catch {
        // Private windows and blocked storage: the character still shows, it
        // just will not be here next time.
      }
      if (codeFromHash() !== code.trim()) {
        window.history.replaceState(null, "", `#${encodeURIComponent(code.trim())}`);
      }
    }
    return true;
  }, []);

  // The character only ever arrives after hydration: the server cannot see
  // this browser's storage or the URL fragment.
  useEffect(() => {
    if (initialCode) { load(initialCode, true); return; }
    const shared = codeFromHash();
    if (shared) {
      load(shared, true);
      return;
    }
    let saved = "";
    try {
      saved = window.localStorage.getItem(STORAGE_KEY) ?? "";
    } catch {
      saved = "";
    }
    if (saved) load(saved, false);
  }, [load, initialCode]);

  const rows = useMemo(() => (character ? dungeonProgress(index, character) : []), [character, index]);
  const totals = useMemo(() => progressTotals(rows), [rows]);

  function onImport(e: React.FormEvent) {
    e.preventDefault();
    if (load(draft, true)) setDraft("");
  }

  function onClear() {
    setCharacter(null);
    setDraft("");
    setError("");
    setOpen(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* nothing saved to remove */
    }
    window.history.replaceState(null, "", window.location.pathname);
  }

  async function onCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not reach the clipboard. Copy the address bar instead.");
    }
  }

  if (!character) {
    return (
      <div className="wp">
        <h1 className="wp-title">Your character</h1>
        <p className="wp-text">
          Bring your progress in from the addon. In game, type <code className="ch-cmd">/dj export</code>, press
          Ctrl+A then Ctrl+C in the box that opens, and paste it below.
        </p>
        <form onSubmit={onImport}>
          <textarea
            className="ch-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Paste your character code here"
            rows={4}
            spellCheck={false}
            aria-label="Character code from the addon"
          />
          {error && <p className="ch-error" role="alert">{error}</p>}
          <p>
            <button type="submit" className="wf-btn wf-btn-red">Show my progress</button>
          </p>
        </form>
        <p className="wp-note">
          The code never leaves your browser. It is kept in this browser and in the page address, so nothing is
          uploaded and no account is needed.
        </p>
      </div>
    );
  }

  const color = CLASS_COLORS[character.classToken] ?? "#ffffff";
  const className = CLASS_NAMES[character.classToken] ?? character.classToken;
  // "Level 22 Orc Paladin"; older codes carry no race, so it is simply left out.
  const race = raceName(character.raceToken);

  return (
    <div className="ch">
      <div className="ch-head">
        {character.faction !== "Unknown" && (
          <img
            className="ch-crest"
            src={character.faction === "Alliance" ? "/journal/alliance.png" : "/journal/horde.png"}
            alt={character.faction}
            width={44}
            height={44}
          />
        )}
        <div>
          <h1 className="ch-name" style={{ color }}>{character.name}</h1>
          <p className="ch-sub">
            Level {character.level} {race ? `${race} ` : ""}{className}
            {character.realm ? ` · ${character.realm}` : ""}
          </p>
        </div>
        <div className="ch-head-actions">
          <button type="button" className="wf-btn wf-btn-dark wf-btn-sm" onClick={onCopyLink}>
            {copied ? "Link copied" : "Copy share link"}
          </button>{" "}
          <button type="button" className="wf-btn wf-btn-dark wf-btn-sm" onClick={onClear}>
            Forget
          </button>
        </div>
      </div>

      <div className="ch-totals">
        <div className="ch-stat">
          <strong>{totals.questsDone}<span className="ch-of">/{totals.questsTotal}</span></strong>
          <span>quests done</span>
        </div>
        <div className="ch-stat">
          <strong>{totals.dungeonsCleared}<span className="ch-of">/{totals.dungeonsTotal}</span></strong>
          <span>dungeons cleared</span>
        </div>
        <div className="ch-stat">
          <strong>{totals.percent}%</strong>
          <span>of the journal</span>
        </div>
      </div>

      <div className="wf-grid ch-grid">
        {rows.map((d) => (
          <DungeonCard
            key={d.slug}
            d={d}
            open={open === d.slug}
            onToggle={() => setOpen((cur) => (cur === d.slug ? null : d.slug))}
          />
        ))}
      </div>

      {character.exportedAt && (
        <p className="ch-foot">
          Exported {character.exportedAt.toLocaleDateString()} — run <code className="ch-cmd">/dj export</code> again
          after you play to refresh it.
        </p>
      )}
      {error && <p className="ch-error" role="alert">{error}</p>}
    </div>
  );
}
