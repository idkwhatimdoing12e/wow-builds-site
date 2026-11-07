// The slice of the journal the character page sends to the browser.
//
// Kept apart from character.ts on purpose: that module is imported by a client
// component, and anything it imports is bundled for the browser. Reaching for
// the journal there shipped the whole 793KB of bosses, loot and descriptions
// just to tick off quest names. The server calls this instead and passes the
// result down as props, which is a few tens of KB of names and IDs.

import { getDungeonSummaries, getDungeon } from "./journal";
import { cardArt } from "./art";
import type { IndexDungeon } from "./character";

export function buildCharacterIndex(): IndexDungeon[] {
  return getDungeonSummaries().map((s) => {
    const d = getDungeon(s.slug);
    return {
      slug: s.slug,
      name: s.name,
      level: s.level,
      art: cardArt(s.name),
      previewOnly: s.previewOnly,
      quests: (d?.quests ?? []).map((q) => ({ id: q.id, name: q.name, slug: q.slug })),
    };
  });
}
