"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import TalentWindow from "./TalentWindow";
import { track } from "@/app/lib/analytics";
import FavouritesWindow from "./FavouritesWindow";
import CharacterQuests from "./CharacterQuests";
import {
  CLASS_COLORS,
  CLASS_NAMES,
  decodeCharacter,
  dungeonProgress,
  journeyProgress,
  portraitSrc,
  progressTotals,
  realmTag,
  raceName,
  type Character,
  type DungeonProgress,
  type RpgDungeon,
  type IndexDungeon,
} from "@/app/lib/character";

const STORAGE_KEY = "dj.character.code";
/** This tab's open dungeon card, so Back from an item page reopens it. */
const OPEN_KEY = "dj.character.open";

/** The code lives in the URL fragment, which the browser never sends to a server. */
function codeFromHash(): string {
  if (typeof window === "undefined") return "";
  return decodeURIComponent(window.location.hash.replace(/^#/, "")).trim();
}

/** This browser's own character code, if it has one. */
function readSaved(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

/** One dungeon tile, read like the addon's home card: faction crest and
 *  "4/5 quests" top right ("0 quests" when none are for this character). */
function DungeonCard({
  d,
  faction,
  open,
  onToggle,
  rpg,
}: {
  d: DungeonProgress;
  faction: Character["faction"];
  open: boolean;
  onToggle: () => void;
  rpg?: RpgDungeon;
}) {
  // RPG Mode: a page not unlocked yet is a blank parchment page with a pencil
  // sketch of its final boss: no art, name, level or tick. With the player's
  // "Show dungeon quests" it still opens, on its quests, with the count on it.
  const sketch = d.sketch;
  const art = sketch ? null : d.art;
  const questCount = (
    <span className={`wf-card-quests ch-card-quests ${sketch ? "ch-sketch-count" : ""}`}>
      {faction !== "Unknown" && (
        <img src={faction === "Alliance" ? "/journal/alliance.png" : "/journal/horde.png"} alt="" width={22} height={22} />
      )}
      {d.questsTotal > 0 ? `${d.questsDone}/${d.questsTotal} quests` : "0 quests"}
    </span>
  );
  return (
    <div
      className={`wf-card ch-card ${d.complete && !sketch ? "ch-card-done" : ""} ${open ? "ch-card-open" : ""} ${
        d.previewOnly ? "wf-card-preview" : ""
      } ${sketch ? "ch-card-sketch" : ""} ${d.locked ? "ch-card-locked" : ""}`}
      // Open, the card grows to hold the quests: the art stays on its banner.
      style={art && !open ? { backgroundImage: `url(${art})` } : undefined}
    >
      <button
        type="button"
        className="ch-card-face"
        style={art && open ? { backgroundImage: `url(${art})` } : undefined}
        onClick={onToggle}
        aria-expanded={open}
        aria-label={sketch ? (d.locked ? `${d.name}: not unlocked yet` : `${d.name}: not unlocked yet, quests shown`) : undefined}
        disabled={d.previewOnly || d.questsTotal === 0 || d.locked}
      >
        {sketch ? (
          <span className="ch-sketch" aria-hidden="true">
            <img
              src={`/journal/rpg/sketch-${d.sketchArt > 0 ? d.sketchArt : "unknown"}.webp`}
              alt=""
              width={256}
              height={128}
              onError={(e) => {
                if (!e.currentTarget.src.endsWith("sketch-unknown.webp")) e.currentTarget.src = "/journal/rpg/sketch-unknown.webp";
              }}
            />
            {!d.locked && questCount}
          </span>
        ) : (
        <>
        <span className="wf-card-name">{d.name}</span>
        {d.previewOnly ? (
          <span className="wf-card-soon">Coming Soon</span>
        ) : (
          <>
            {d.complete && (
              <span className="ch-check" aria-label="All quests done">
                <svg viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M8 25 L19 36 L40 12" />
                </svg>
              </span>
            )}
            {questCount}
          </>
        )}
        <span className="wf-card-level">LV {d.level}</span>
        </>
        )}
      </button>

      {/* The addon's Quests tab for this character: its list and the parchment. */}
      {open && (
        <div className="ch-quests">
          <CharacterQuests slug={d.slug} quests={d.questState} faction={faction} rpg={rpg} />
        </div>
      )}
    </div>
  );
}

export default function CharacterPanel({ index }: { index: IndexDungeon[] }) {
  const [character, setCharacter] = useState<Character | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  // The code of the character on screen: the share link is built from it.
  const [code, setCode] = useState("");
  // Someone else's character, opened from a shared link (this browser keeps its own).
  const [visiting, setVisiting] = useState(false);

  /**
   * Show a character code. "paste": the visitor's own, remembered here, and the
   * address stays clean. "link": from a shared link: remembered only when this
   * browser has no character yet or it is the same one, so opening a friend's
   * link never replaces your own; a friend's keeps the code in the address so a
   * reload still shows it. "saved": this browser's own, already remembered.
   */
  const load = useCallback(async (raw: string, source: "paste" | "link" | "saved") => {
    const trimmed = raw.trim();
    const result = await decodeCharacter(trimmed);
    if (!result.ok) {
      setError(result.error);
      return false;
    }
    let keep = source !== "saved";
    if (source === "link") {
      const saved = readSaved();
      if (saved && saved !== trimmed) {
        const mine = await decodeCharacter(saved);
        keep = !mine.ok || (mine.character.name === result.character.name && mine.character.realm === result.character.realm);
      }
    }
    setError("");
    setCharacter(result.character);
    setCode(trimmed);
    // Back from an item page: the dungeon card that was open opens again.
    try {
      setOpen(window.sessionStorage.getItem(OPEN_KEY));
    } catch {
      // storage blocked: cards start closed
    }
    setVisiting(source === "link" && !keep);
    if (keep && source !== "saved") {
      try {
        window.localStorage.setItem(STORAGE_KEY, trimmed);
      } catch {
        // Private windows and blocked storage: the character still shows, it
        // just will not be here next time.
      }
    }
    // Counted anonymously: how a character arrived (pasted, opened from a link,
    // or this browser's saved one on a return visit), with its class, faction and level.
    track("character_loaded", {
      source: source === "link" ? (keep ? "link_own" : "link_shared") : source,
      class: result.character.classToken || "unknown",
      faction: result.character.faction,
      level: result.character.level,
    });
    // Your own character: a clean address. A friend's: the code stays in it.
    if (!(source === "link" && !keep) && window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname);
    }
    return true;
  }, []);

  // The character only ever arrives after hydration: the server cannot see
  // this browser's storage or the URL fragment.
  useEffect(() => {
    const shared = codeFromHash();
    if (shared) void load(shared, "link");
    else {
      const saved = readSaved();
      if (saved) void load(saved, "saved");
    }
    // A link pasted into the address bar of this open page changes only the
    // fragment: no reload, so the new character is picked up here.
    const onHash = () => {
      const next = codeFromHash();
      if (next) void load(next, "link");
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [load]);

  const rows = useMemo(() => (character ? dungeonProgress(index, character) : []), [character, index]);
  const totals = useMemo(() => progressTotals(rows), [rows]);
  const journey = useMemo(() => (character ? journeyProgress(rows, character) : null), [rows, character]);

  async function onImport(e: React.FormEvent) {
    e.preventDefault();
    if (await load(draft, "paste")) setDraft("");
  }

  function onClear() {
    setCharacter(null);
    setCode("");
    setVisiting(false);
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

  // The link carries the whole character, however this page was reached.
  const shareLink = () => `${window.location.origin}${window.location.pathname}#${encodeURIComponent(code)}`;

  async function onCopyLink() {
    try {
      await navigator.clipboard.writeText(shareLink());
      track("share_link_copied");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not reach the clipboard.");
    }
  }

  function onShowMine() {
    const saved = readSaved();
    window.history.replaceState(null, "", window.location.pathname);
    if (saved) void load(saved, "saved");
  }

  if (!character) {
    return (
      <div className="wp">
        <h1 className="wp-title">Your character</h1>
        <p className="wp-text">
          Bring your progress in from the addon. In game, type <code className="ch-cmd">/dj export</code>, press
          Ctrl+A then Ctrl+C in the box that opens, and paste it below.
        </p>
        <form onSubmit={(e) => void onImport(e)}>
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
  const realm = realmTag(character.realm);
  const portrait = portraitSrc(character);

  return (
    <div className="ch">
      <div className="ch-head">
        {character.faction !== "Unknown" && (
          <img
            className="ch-crest"
            src={character.faction === "Alliance" ? "/journal/alliance.png" : "/journal/horde.png"}
            alt={character.faction}
            width={60}
            height={60}
          />
        )}
        {portrait && (
          <span className="ch-portrait" style={{ borderColor: color }}>
            <img src={portrait} alt="" width={56} height={56} />
          </span>
        )}
        <div className="ch-who">
          <h1 className="ch-name" style={{ color }}>{character.name}</h1>
          <p className="ch-sub">
            Level {character.level} {race ? `${race} ` : ""}{className}
            {realm ? ` · ${realm}` : ""}
          </p>
          {journey && journey.max > 0 && (
            <div
              className="ch-journey"
              role="progressbar"
              aria-label="Journey"
              aria-valuemin={0}
              aria-valuemax={journey.max}
              aria-valuenow={journey.points}
              title="5 points for each of your quests handed in, 10 for each dungeon's final boss killed"
            >
              <span className="ch-journey-fill" style={{ width: `${(journey.points / journey.max) * 100}%` }} />
              <span className="ch-journey-text">
                Journey {journey.points}/{journey.max} ({journey.percent}%)
              </span>
            </div>
          )}
        </div>
        <div className="ch-head-talents">
          <FavouritesWindow character={character} />
          <TalentWindow character={character} color={color} />
        </div>
        <div className="ch-head-actions">
          <button type="button" className="wf-btn wf-btn-dark wf-btn-sm" onClick={onCopyLink}>
            {copied ? "Link copied" : "Copy share link"}
          </button>{" "}
          {visiting ? (
            <button type="button" className="wf-btn wf-btn-dark wf-btn-sm" onClick={onShowMine}>
              Show mine
            </button>
          ) : (
            <button type="button" className="wf-btn wf-btn-dark wf-btn-sm" onClick={onClear}>
              Forget
            </button>
          )}
        </div>
      </div>
      {visiting && (
        <p className="ch-visiting">A shared character. Your own is still saved in this browser.</p>
      )}

      <div className="ch-totals">
        <div className="ch-stat">
          <strong>{totals.questsDone}<span className="ch-of">/{totals.questsTotal}</span></strong>
          <span>quests done</span>
        </div>
        <div className="ch-stat">
          <strong>{totals.dungeonsComplete}<span className="ch-of">/{totals.dungeonsTotal}</span></strong>
          <span>dungeons complete</span>
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
            faction={character.faction}
            open={open === d.slug}
            onToggle={() =>
              setOpen((cur) => {
                const next = cur === d.slug ? null : d.slug;
                try {
                  if (next) window.sessionStorage.setItem(OPEN_KEY, next);
                  else window.sessionStorage.removeItem(OPEN_KEY);
                } catch {
                  // storage blocked: nothing to remember
                }
                return next;
              })
            }
            rpg={character.rpgDungeons?.get(d.slug)}
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
