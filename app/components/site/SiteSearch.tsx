"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Lang } from "@/app/lib/i18n";
import type { SearchEntry, SearchKind } from "@/app/lib/search-index";
import type { ShellStrings } from "@/app/lib/shell-strings";
import { QUALITY_COLORS } from "@/app/lib/journal-shared";

/** Lower case, no accents, no punctuation: "Zul'Farrak" finds "zul farrak", "Höhlen" finds "hohlen". */
function fold(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

interface Prepared extends SearchEntry {
  f: string; // folded name
  fx: string; // folded extra words
}

// One index per language for the whole visit: fetched once, folded once.
const indexes = new Map<Lang, Promise<Prepared[]>>();
function loadIndex(lang: Lang): Promise<Prepared[]> {
  let p = indexes.get(lang);
  if (!p) {
    p = fetch(`/search-index/${lang}`)
      .then((r) => (r.ok ? (r.json() as Promise<SearchEntry[]>) : []))
      .then((list) => list.map((e) => ({ ...e, f: fold(e.n), fx: e.x ? fold(e.x) : "" })))
      .catch(() => {
        indexes.delete(lang);
        return [];
      });
    indexes.set(lang, p);
  }
  return p;
}

const ORDER: SearchKind[] = ["d", "b", "q", "i"];
const CAP: Record<SearchKind, number> = { d: 4, b: 4, q: 5, i: 6 };

/** Best first: the name starts with it, then a word in it does, then anywhere; every word typed must match. */
function score(e: Prepared, q: string, words: string[]): number {
  for (const w of words) if (!e.f.includes(w) && !e.fx.includes(w)) return 0;
  if (e.f === q) return 100;
  // the whole word, anywhere: "arugal" puts Archmage Arugal before Arugal's Voidwalker
  if (` ${e.f} `.includes(` ${q} `)) return 90 - e.f.length / 100;
  if (e.f.startsWith(q)) return 80 - e.f.length / 100;
  if (` ${e.fx} `.includes(` ${q}`)) return 70; // an abbreviation or the English name
  if (` ${e.f}`.includes(` ${q}`)) return 60 - e.f.length / 100;
  return 40 - e.f.length / 100;
}

function search(list: Prepared[] | null, raw: string) {
  const q = fold(raw);
  if (!list || !q) return [];
  const words = q.split(" ");
  const groups: Record<SearchKind, { e: Prepared; s: number }[]> = { d: [], b: [], q: [], i: [] };
  for (const e of list) {
    const s = score(e, q, words);
    if (s > 0) groups[e.t].push({ e, s });
  }
  return ORDER.filter((k) => groups[k].length > 0).map((k) => ({
    kind: k,
    total: groups[k].length,
    items: groups[k].sort((a, b) => b.s - a.s).slice(0, CAP[k]).map((r) => r.e),
  }));
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5 21 21" />
    </svg>
  );
}

/**
 * The header search: dungeons (and their abbreviations), bosses, quests and
 * items, in the page's language. The index loads on first focus; results are
 * grouped and capped so the list stays short and quick to draw. Keys: "/" to
 * focus, arrows to move, Enter to open, Escape to close.
 */
export default function SiteSearch({ lang, s }: { lang: Lang; s: ShellStrings }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState<{ lang: Lang; list: Prepared[] } | null>(null);
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const box = useRef<HTMLDivElement>(null);

  // Typing stays instant; the result list catches up a frame later if it must.
  const deferred = useDeferredValue(q);
  const list = loaded?.lang === lang ? loaded.list : null;
  const groups = useMemo(() => search(list, deferred), [list, deferred]);
  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  const ensure = () => {
    if (list) return;
    void loadIndex(lang).then((l) => setLoaded({ lang, list: l }));
  };

  // "/" focuses the search from anywhere but a text field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      e.preventDefault();
      input.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Closes on a click anywhere else.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const go = (e: Prepared) => {
    setOpen(false);
    setQ("");
    input.current?.blur();
    router.push(e.h);
  };

  const label = (k: SearchKind) => (k === "d" ? s.dungeons : k === "b" ? s.bosses : k === "q" ? s.quests : s.items);
  const showPanel = open && q.trim() !== "";
  let n = -1;

  return (
    <div ref={box} className={`sx-search ${showPanel ? "on" : ""}`}>
      <label className="sx-search-field">
        <SearchIcon />
        <input
          ref={input}
          type="search"
          value={q}
          placeholder={s.search}
          aria-label={s.search}
          role="combobox"
          aria-expanded={showPanel}
          aria-controls="sx-search-results"
          aria-autocomplete="list"
          aria-activedescendant={showPanel && flat[active] ? `sx-sr-${active}` : undefined}
          autoComplete="off"
          spellCheck={false}
          onFocus={() => {
            ensure();
            setOpen(true);
          }}
          onPointerEnter={ensure}
          onChange={(e) => {
            setQ(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, flat.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === "Enter" && flat[active]) {
              e.preventDefault();
              go(flat[active]);
            } else if (e.key === "Escape") {
              setOpen(false);
              input.current?.blur();
            }
          }}
        />
      </label>

      {showPanel && (
        <div className="sx-search-panel" id="sx-search-results" role="listbox" aria-label={s.search}>
          {!list ? (
            <p className="sx-search-empty">…</p>
          ) : groups.length === 0 ? (
            <p className="sx-search-empty">{s.noResults}</p>
          ) : (
            groups.map((g) => (
              <div key={g.kind} className="sx-search-group">
                <div className="sx-search-head">
                  {label(g.kind)}
                  {g.total > g.items.length && <span>{g.items.length} / {g.total}</span>}
                </div>
                {g.items.map((e) => {
                  n += 1;
                  const idx = n;
                  return (
                    <a
                      key={`${e.t}${e.h}`}
                      id={`sx-sr-${idx}`}
                      href={e.h}
                      role="option"
                      aria-selected={idx === active}
                      className={`sx-search-row sx-sr-${e.t} ${idx === active ? "on" : ""}`}
                      {...(e.id ? { "data-item": e.id } : {})}
                      onPointerEnter={() => setActive(idx)}
                      onClick={(ev) => {
                        ev.preventDefault();
                        go(e);
                      }}
                    >
                      <span className="sx-sr-pic">
                        {e.i ? (
                          <img src={e.i} alt="" width={32} height={32} loading="lazy" />
                        ) : (
                          <img src={e.t === "b" ? "/journal/ui/skull.png" : "/journal/ui/quest-available.png"} alt="" width={22} height={22} />
                        )}
                      </span>
                      <span className="sx-sr-text">
                        <span className="sx-sr-name" style={e.q !== undefined ? { color: QUALITY_COLORS[e.q] } : undefined}>
                          {e.n}
                        </span>
                        <span className="sx-sr-sub">{e.s}</span>
                      </span>
                    </a>
                  );
                })}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
