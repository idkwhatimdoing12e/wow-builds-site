"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CLASS_COLORS,
  CLASS_NAMES,
  decodeCharacter,
  dungeonProgress,
  progressTotals,
  type Character,
} from "@/app/lib/character";

const STORAGE_KEY = "dj.character.code";

/** The code lives in the URL fragment, which the browser never sends to a server. */
function codeFromHash(): string {
  if (typeof window === "undefined") return "";
  return decodeURIComponent(window.location.hash.replace(/^#/, "")).trim();
}

function Bar({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <span className="ch-bar" role="img" aria-label={`${done} of ${total} done`}>
      <span className="ch-bar-fill" style={{ width: `${pct}%` }} />
    </span>
  );
}

export default function CharacterPanel() {
  const [character, setCharacter] = useState<Character | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

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
  }, [load]);

  const rows = useMemo(() => (character ? dungeonProgress(character) : []), [character]);
  const totals = useMemo(() => progressTotals(rows), [rows]);

  function onImport(e: React.FormEvent) {
    e.preventDefault();
    if (load(draft, true)) setDraft("");
  }

  function onClear() {
    setCharacter(null);
    setDraft("");
    setError("");
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

  return (
    <div className="wp">
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
          <h1 className="wp-title ch-name" style={{ color }}>{character.name}</h1>
          <p className="ch-sub">
            Level {character.level} {className}
            {character.realm ? ` · ${character.realm}` : ""}
          </p>
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

      <ul className="ch-list">
        {rows.filter((r) => !r.previewOnly).map((r) => (
          <li key={r.slug} className={`ch-row ${r.cleared ? "ch-row-cleared" : ""}`}>
            <Link href={`/dungeon/${r.slug}`} className="ch-row-name">{r.name}</Link>
            <Bar done={r.questsDone} total={r.questsTotal} />
            <span className="ch-count">
              {r.questsDone}/{r.questsTotal}
              {r.cleared && <span className="ch-cleared" title="Final boss killed"> ✓</span>}
            </span>
          </li>
        ))}
      </ul>

      {character.exportedAt && (
        <p className="wp-note">
          Exported {character.exportedAt.toLocaleDateString()} — run <code className="ch-cmd">/dj export</code> again
          after you play to refresh it.
        </p>
      )}

      <p className="ch-actions">
        <button type="button" className="wf-btn wf-btn-dark wf-btn-sm" onClick={onCopyLink}>
          {copied ? "Link copied" : "Copy share link"}
        </button>{" "}
        <button type="button" className="wf-btn wf-btn-dark wf-btn-sm" onClick={onClear}>
          Forget this character
        </button>
      </p>
      {error && <p className="ch-error" role="alert">{error}</p>}
    </div>
  );
}
