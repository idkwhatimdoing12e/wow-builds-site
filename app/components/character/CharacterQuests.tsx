"use client";

import { useEffect, useState } from "react";
import type { Dungeon } from "@/app/lib/journal";
import type { Character, QuestState, RpgDungeon } from "@/app/lib/character";
import DungeonView from "@/app/components/journal/DungeonView";

/** The dungeon and the dungeon page's skin (theme colours, header art). */
type Loaded = Dungeon & { skin?: Record<string, string> };
// One dungeon per visit, fetched when its card is first opened.
const cache = new Map<string, Promise<Loaded | null>>();
function loadDungeon(slug: string): Promise<Loaded | null> {
  let p = cache.get(slug);
  if (!p) {
    p = fetch(`/dungeon-data/${slug}`)
      .then((r) => (r.ok ? (r.json() as Promise<Loaded>) : null))
      .catch(() => {
        cache.delete(slug);
        return null;
      });
    cache.set(slug, p);
  }
  return p;
}

/**
 * An opened dungeon card on the character page: the dungeon's own window, as
 * in the addon (Map, Bosses with their loot, Quests), with this character's
 * quests, the ones it handed in framed in green and ticked. It is the dungeon
 * page's DungeonView in its character mode.
 */
export default function CharacterDungeon({
  slug,
  quests,
  faction,
  rpg,
}: {
  slug: string;
  quests: QuestState[];
  faction: Character["faction"];
  /** RPG Mode: what the character has found here. */
  rpg?: RpgDungeon;
}) {
  const [loaded, setLoaded] = useState<{ slug: string; d: Loaded | null } | null>(null);

  useEffect(() => {
    let live = true;
    void loadDungeon(slug).then((data) => {
      if (live) setLoaded({ slug, d: data });
    });
    return () => {
      live = false;
    };
  }, [slug]);

  const d = loaded?.slug === slug ? loaded.d : undefined;
  if (d === undefined) return <p className="wf-note ch-q-loading">…</p>;
  if (d === null) return <p className="wf-note">This dungeon could not be loaded.</p>;
  // the dungeon page's in-game skin (.ej), in its own colours
  return (
    <div className="ej ch-ej" style={d.skin as React.CSSProperties}>
      <DungeonView
        d={d}
        character={{ quests, faction, lockedBosses: rpg?.lockedBosses, lockedQuests: rpg?.lockedQuests }}
      />
    </div>
  );
}
