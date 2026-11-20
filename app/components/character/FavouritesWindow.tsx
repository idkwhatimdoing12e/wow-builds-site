"use client";

import { useRef, useState } from "react";
import type { Character, Favourite } from "@/app/lib/character";
import type { SearchEntry } from "@/app/lib/search-index";
import { QUALITY_COLORS } from "@/app/lib/journal-shared";

/** What a favourite needs from the site: its item, quest and dungeon pages. */
interface Lookup {
  items: Map<number, SearchEntry>;
  quests: Map<number, SearchEntry>;
  dungeons: Map<string, SearchEntry>;
}

// The header search's index already has every item (icon, quality, page),
// quest and dungeon; fetched once, when the window is first wanted.
let lookup: Promise<Lookup | null> | null = null;
function loadLookup(): Promise<Lookup | null> {
  if (!lookup) {
    lookup = fetch("/search-index/en")
      .then((r) => (r.ok ? (r.json() as Promise<SearchEntry[]>) : null))
      .then((list) => {
        if (!list) return null;
        const out: Lookup = { items: new Map(), quests: new Map(), dungeons: new Map() };
        for (const e of list) {
          if (e.t === "i" && e.id) out.items.set(e.id, e);
          else if (e.t === "q" && e.qi) out.quests.set(e.qi, e);
          else if (e.t === "d") out.dungeons.set(e.h.replace(/^.*\/dungeon\//, ""), e);
        }
        return out;
      })
      .catch(() => {
        lookup = null;
        return null;
      });
  }
  return lookup;
}

const UNKNOWN_ICON = "/journal/icons/inv_misc_questionmark.webp";

function Row({ f, data }: { f: Favourite; data: Lookup | null }) {
  const item = data?.items.get(f.id);
  const quest = f.quest ? data?.quests.get(f.quest) : undefined;
  const name = item?.n ?? f.name ?? `Item ${f.id}`;
  const color = item?.q !== undefined ? QUALITY_COLORS[item.q] : "#ffffff";
  const href = item?.h;
  const Name = href ? "a" : "span";
  return (
    <li className="fv-row">
      {href ? (
        <a className="fv-icon" href={href} tabIndex={-1} aria-hidden="true" data-item={f.id}>
          <img src={item?.i ?? UNKNOWN_ICON} alt="" width={34} height={34} loading="lazy" />
        </a>
      ) : (
        <span className="fv-icon" data-item={f.id}>
          <img src={item?.i ?? UNKNOWN_ICON} alt="" width={34} height={34} loading="lazy" />
        </span>
      )}
      <span className="fv-text">
        <Name className="fv-name" style={{ color }} data-item={f.id} {...(href ? { href } : {})}>
          {name}
        </Name>
        <span className="fv-src">
          {f.quest ? (
            <>
              <img src="/journal/ui/quest-available.png" alt="" width={14} height={14} />
              {quest ? <a href={quest.h}>{quest.n}</a> : <span>Quest reward</span>}
            </>
          ) : f.boss ? (
            <>
              <img src="/journal/ui/skull.png" alt="" width={14} height={14} />
              <span>{f.boss}</span>
            </>
          ) : (
            <span>{item?.s ?? ""}</span>
          )}
        </span>
      </span>
    </li>
  );
}

/**
 * The addon's Favourites window on the character page: a button beside the
 * talents, opening the list as the game shows it, by dungeon, each item with
 * its icon and name in its quality colour, and the boss or quest it comes
 * from. Items, quests and dungeons link to their pages.
 */
export default function FavouritesWindow({ character }: { character: Character }) {
  const favs = character.favourites;
  const dialog = useRef<HTMLDialogElement>(null);
  const [data, setData] = useState<Lookup | null | undefined>(undefined);

  const ensure = () => {
    if (data !== undefined) return;
    void loadLookup().then(setData);
  };

  // By dungeon, as the addon sends them (already in its window's order).
  const groups: { key: string; slug?: string; name: string; items: Favourite[] }[] = [];
  for (const f of favs) {
    const key = f.slug ?? f.dungeon ?? "";
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(f);
    else groups.push({ key, slug: f.slug, name: f.dungeon ?? "Other", items: [f] });
  }

  return (
    <>
      <button
        type="button"
        className="ch-talents ch-favs"
        onPointerEnter={ensure}
        onFocus={ensure}
        onClick={() => {
          ensure();
          dialog.current?.showModal();
        }}
        aria-haspopup="dialog"
        aria-label={`Favourites: ${favs.length}`}
      >
        <span className="ch-talents-label">Favourites</span>
        <span className="ch-favs-count">
          <img src="/journal/ui/favourite-star.webp" alt="" width={26} height={26} />
          <span className="ch-talents-pts">{favs.length}</span>
        </span>
      </button>

      <dialog
        ref={dialog}
        className="tt fv"
        aria-label={`${character.name}'s favourites`}
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
      >
        <div className="tt-box fv-box">
          <header className="tt-head">
            <img className="fv-star" src="/journal/ui/favourite-star.webp" alt="" width={24} height={24} />
            <h2 className="tt-title">
              Favourites{favs.length > 0 ? ` (${favs.length})` : ""}
            </h2>
            <button type="button" className="tt-close" aria-label="Close" onClick={() => dialog.current?.close()}>
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M2 2l10 10M12 2L2 12" />
              </svg>
            </button>
          </header>
          {favs.length === 0 ? (
            <p className="tt-note fv-empty">
              No favourites yet. Right-click items in the addon&rsquo;s journal to add them, then export again.
            </p>
          ) : (
            <div className="fv-list">
              {groups.map((g) => {
                const dungeon = g.slug ? data?.dungeons.get(g.slug) : undefined;
                return (
                  <section key={g.key || "other"} className="fv-group">
                    <h3 className="fv-divider">
                      {dungeon ? <a href={dungeon.h}>{dungeon.n}</a> : <span>{g.name}</span>}
                    </h3>
                    <ul>
                      {g.items.map((f) => (
                        <Row key={`${f.id}-${f.quest ?? ""}-${f.boss ?? ""}`} f={f} data={data ?? null} />
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </dialog>
    </>
  );
}
