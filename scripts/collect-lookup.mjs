// The companion review page's names (worker/collect.js): the journal's bosses
// and quests, and every item's icon, small enough for the Worker to import.
//
//     node scripts/collect-lookup.mjs      (part of npm run build)
//
// Writes worker/collect-lookup.json (gitignored: made from data/ on every build):
//   bosses: { npcID: [name or null, dungeon] }  journal bosses and rares, not
//           trash; a boss's paired and child creatures get null (their own
//           name comes from players' games)
//   quests: { questID: [name, dungeon] }
//   icons:  { itemID: icon }                    /journal/icons/<icon>.webp
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const journal = JSON.parse(fs.readFileSync(path.join(root, "data", "journal.json"), "utf8"));
const icons = JSON.parse(fs.readFileSync(path.join(root, "data", "item-icons.json"), "utf8"));

// Real dungeons first, so a boss or quest that a quest-chain page (Tier 0.5,
// Onyxia...) also lists is named after its dungeon.
const pages = new Set(Object.values(journal.PAGES || {}));
const names = Object.keys(journal.DB).sort((a, b) => Number(pages.has(a)) - Number(pages.has(b)));

const bosses = {};
const quests = {};
for (const dungeon of names) {
  const d = journal.DB[dungeon];
  for (const b of d.bosses || []) {
    if (b.trash) continue;
    if (Number.isInteger(b.npcID) && !(b.npcID in bosses)) bosses[b.npcID] = [b.name || null, dungeon];
    for (const id of [b.pairNpcID, ...(Array.isArray(b.children) ? b.children : [])]) {
      if (Number.isInteger(id) && !(id in bosses)) bosses[id] = [null, dungeon];
    }
  }
  for (const q of d.quests || []) {
    if (Number.isInteger(q.id) && q.name && !(q.id in quests)) quests[q.id] = [q.name, dungeon];
  }
}
const itemIcons = {};
for (const [id, v] of Object.entries(icons)) if (Array.isArray(v) && typeof v[0] === "string") itemIcons[id] = v[0];

const out = path.join(root, "worker", "collect-lookup.json");
fs.writeFileSync(out, JSON.stringify({ bosses, quests, icons: itemIcons }));
console.log(`collect-lookup: ${Object.keys(bosses).length} bosses, ${Object.keys(quests).length} quests, ${Object.keys(itemIcons).length} item icons`);
