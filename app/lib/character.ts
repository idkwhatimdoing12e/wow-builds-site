// Reading the code the addon's "/dj export" produces.
//
// The code is base64url over plain text, so it survives a paste into a chat
// box or a URL fragment:
//
//   FDJ2|name|realm|race|class|level|faction|quests|dungeons|time|checksum
//
// FDJ1 is the same without the race, and is still accepted: a character
// exported before the addon learned to send it keeps working.
//
// Addon 2.0 replaced both with FDJ3, which is a different animal - a JSON
// snapshot, raw-DEFLATEd, in three dot-separated parts:
//
//   FDJ3.<base64url of the deflated JSON>.<base36 Adler-32 of that JSON>
//
// It carries far more than the old codes did (run logs, per-quest state), of
// which this site reads the parts it can show. Decoding it needs the browser
// to inflate, which is asynchronous, so decodeCharacter returns a promise and
// the two older formats resolve immediately.
//
// "quests" is the completed quest IDs sorted ascending, each stored as the gap
// from the one before it in base 36. An ID this site does not know is kept but
// never shown, so a character exported from a newer addon still reads here.
//
// Nothing is sent anywhere: the code lives in the URL fragment, which browsers
// never put in a request, and in this browser's localStorage.

/** The pipe-delimited formats, newest first. FDJ3 is handled separately. */
const FORMATS = ["FDJ2", "FDJ1"] as const;
export const CHARACTER_FORMAT = "FDJ3";

export interface Character {
  name: string;
  realm: string;
  /** Empty for a character exported before the addon sent its race. */
  raceToken: string;
  /** The game's UnitSex: 2 male, 3 female; absent when the export does not say. */
  sex?: number;
  classToken: string;
  level: number;
  faction: "Alliance" | "Horde" | "Unknown";
  /** Quest IDs the character has completed, including ones this site does not list. */
  completed: Set<number>;
  /** Slugs of dungeons whose final boss the character has killed. */
  cleared: Set<string>;
  /**
   * FDJ3 only: each dungeon's quests exactly as the addon counts them for this
   * character (its faction, its class, its professions; hidden, repeatable and
   * lost quests left out), keyed by dungeon slug. Older codes carry no such
   * list, and the site works it out from faction and class instead.
   */
  dungeonQuests?: Map<string, { id: number; name: string; done: boolean }[]>;
  /** FDJ3 with addon 2.2+: the points in each talent tree, in the game's tab order. */
  talents?: TalentTree[];
  /** The addon's Favourites, in its window's order (dungeon, then name); empty when there are none. */
  favourites: Favourite[];
  exportedAt?: Date;
}

/** One item in the addon's Favourites. Everything but the ID can be missing. */
export interface Favourite {
  id: number;
  /** English, as the addon stored it when the item was favourited. */
  name?: string;
  /** The journal page it came from, English. */
  dungeon?: string;
  slug?: string;
  /** The boss that drops it, English. */
  boss?: string;
  /** The quest it is a reward from. */
  quest?: number;
  added?: Date;
}

/**
 * One talent tree as the addon exports it: WoW Forever's trait tree (C_Traits),
 * each talent with points as [tier, column, rank, spellID, nodeID].
 */
export interface TalentTree {
  /** The tree's name, as the game gave it. */
  name: string;
  points: number;
  /** Rank by TraitNode ID: how the site places a talent. */
  byNode: Map<number, number>;
  /** Rank by spell ID, for codes with no node IDs (4 numbers per talent). */
  bySpell: Map<number, number>;
  /** Rank by "tier,column" (1-based), for the oldest codes (3 numbers per talent). */
  byPlace: Map<string, number>;
}

export type DecodeResult =
  | { ok: true; character: Character }
  | { ok: false; error: string };

const B36 = "0123456789abcdefghijklmnopqrstuvwxyz";
const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

function base36(s: string): number | null {
  if (!s) return null;
  const neg = s.startsWith("-");
  const digits = neg ? s.slice(1) : s;
  if (!digits) return null;
  let n = 0;
  for (const ch of digits) {
    const v = B36.indexOf(ch);
    if (v < 0) return null;
    n = n * 36 + v;
  }
  return neg ? -n : n;
}

/** Decoded by hand so this works the same in the browser and during the build. */
function fromBase64Url(s: string): Uint8Array | null {
  const clean = s.replace(/[\s\r\n]+/g, "").replace(/=+$/, "");
  if (!clean) return null;
  const out: number[] = [];
  let acc = 0;
  let bits = 0;
  for (const ch of clean) {
    const v = B64.indexOf(ch);
    if (v < 0) return null;
    acc = acc * 64 + v;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out.push(Math.floor(acc / 2 ** bits) & 0xff);
      acc %= 2 ** bits;
    }
  }
  return new Uint8Array(out);
}

/** Matches the addon's Adler-32 over the fields ahead of the checksum. */
function adler32(bytes: Uint8Array): number {
  let a = 1;
  let b = 0;
  for (const byte of bytes) {
    a = (a + byte) % 65521;
    b = (b + a) % 65521;
  }
  return b * 65536 + a;
}

/** The slice of the addon's FDJ3 snapshot this site reads. */
interface Snapshot {
  v?: number;
  name?: string;
  realm?: string;
  raceToken?: string;
  sex?: number;
  classToken?: string;
  level?: number;
  faction?: string;
  exportedAt?: number;
  completed?: number[];
  talents?: { n?: string; p?: number; t?: number[][] }[];
  favourites?: { id?: number; name?: string; dungeon?: string; slug?: string; boss?: string; quest?: number; added?: number }[];
  dungeons?: {
    slug?: string;
    cleared?: boolean;
    quests?: { id?: number; name?: string; done?: boolean; lost?: boolean }[];
  }[];
}

/** Raw DEFLATE, as LibDeflate's CompressDeflate produces it. */
async function inflateRaw(bytes: Uint8Array): Promise<Uint8Array | null> {
  if (typeof DecompressionStream !== "function") return null;
  try {
    const stream = new Blob([bytes as BlobPart]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  } catch {
    return null;
  }
}

function readTalents(raw: Snapshot["talents"]): TalentTree[] | undefined {
  if (!Array.isArray(raw) || raw.length === 0) return undefined;
  const trees: TalentTree[] = [];
  for (const tree of raw) {
    if (!tree || typeof tree.n !== "string") return undefined;
    const byNode = new Map<number, number>();
    const bySpell = new Map<number, number>();
    const byPlace = new Map<string, number>();
    let points = 0;
    for (const t of Array.isArray(tree.t) ? tree.t : []) {
      if (!Array.isArray(t) || t.length < 3) continue;
      const [tier, column, rank, spell, node] = t.map(Number);
      if (!(rank > 0)) continue;
      if (node > 0) byNode.set(node, rank);
      if (spell > 0) bySpell.set(spell, rank);
      if (tier > 0 && column > 0) byPlace.set(`${tier},${column}`, rank);
      points += rank;
    }
    trees.push({ name: tree.n, points: Number.isFinite(Number(tree.p)) && Number(tree.p) > points ? Number(tree.p) : points, byNode, bySpell, byPlace });
  }
  return trees;
}

function readFavourites(raw: Snapshot["favourites"]): Favourite[] {
  if (!Array.isArray(raw)) return [];
  const text = (v: unknown) => (typeof v === "string" && v.trim() !== "" ? v : undefined);
  const out: Favourite[] = [];
  for (const f of raw) {
    const id = Number(f?.id);
    if (!f || !(id > 0)) continue;
    const quest = Number(f.quest);
    const added = Number(f.added);
    out.push({
      id,
      name: text(f.name),
      dungeon: text(f.dungeon),
      slug: text(f.slug),
      boss: text(f.boss),
      quest: quest > 0 ? quest : undefined,
      added: added > 0 ? new Date(added * 1000) : undefined,
    });
  }
  return out;
}

async function decodeSnapshot(code: string): Promise<DecodeResult> {
  const parts = code.split(".");
  if (parts.length !== 3) {
    return { ok: false, error: "That code is cut short. Select all of it in the addon before copying." };
  }
  const bytes = fromBase64Url(parts[1]);
  if (!bytes) return { ok: false, error: "That code is damaged. Copy the whole line from the addon." };

  const json = await inflateRaw(bytes);
  if (!json) {
    return {
      ok: false,
      error:
        typeof DecompressionStream !== "function"
          ? "This browser is too old to read the new character code. Update it, or use an older version of the addon."
          : "That code is damaged. Copy the whole line from the addon and try again.",
    };
  }

  const expected = base36(parts[2]);
  if (expected === null || expected !== adler32(json)) {
    return { ok: false, error: "That code did not survive the copy. Paste it again without editing it." };
  }

  let snap: Snapshot;
  try {
    snap = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(json)) as Snapshot;
  } catch {
    return { ok: false, error: "That code is damaged." };
  }

  const faction = snap.faction === "Alliance" || snap.faction === "Horde" ? snap.faction : "Unknown";
  // The addon leaves a "lost" quest (one that can no longer be done) out of its
  // done/total, so the site does too.
  const dungeonQuests = new Map<string, { id: number; name: string; done: boolean }[]>();
  for (const d of snap.dungeons ?? []) {
    if (!d?.slug || !Array.isArray(d.quests)) continue;
    dungeonQuests.set(
      d.slug,
      d.quests
        .filter((q) => q && Number.isFinite(Number(q.id)) && !q.lost)
        .map((q) => ({ id: Number(q.id), name: q.name || "?", done: !!q.done })),
    );
  }
  return {
    ok: true,
    character: {
      name: snap.name || "Unknown",
      realm: snap.realm ?? "",
      raceToken: (snap.raceToken ?? "").toUpperCase(),
      ...(snap.sex === 2 || snap.sex === 3 ? { sex: snap.sex } : {}),
      classToken: (snap.classToken ?? "").toUpperCase(),
      level: Number(snap.level) || 0,
      faction,
      completed: new Set((snap.completed ?? []).map(Number).filter(Number.isFinite)),
      // The snapshot names the dungeons it considers cleared; the site keys on slug.
      cleared: new Set(
        (snap.dungeons ?? []).filter((d) => d?.cleared && d.slug).map((d) => d.slug as string),
      ),
      dungeonQuests: dungeonQuests.size > 0 ? dungeonQuests : undefined,
      talents: readTalents(snap.talents),
      favourites: readFavourites(snap.favourites),
      exportedAt:
        typeof snap.exportedAt === "number" && snap.exportedAt > 0 ? new Date(snap.exportedAt * 1000) : undefined,
    },
  };
}

/** FDJ1 and FDJ2: one base64url blob of pipe-separated fields. */
function decodeLegacy(code: string): DecodeResult {
  const bytes = fromBase64Url(code);
  if (!bytes) {
    return { ok: false, error: "That does not look like a character code. Copy the whole line from the addon." };
  }

  let body: string;
  try {
    body = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return { ok: false, error: "That code is damaged. Copy the whole line from the addon and try again." };
  }

  const fields = body.split("|");
  const format = fields[0] as (typeof FORMATS)[number];
  if (!FORMATS.includes(format)) {
    return {
      ok: false,
      error: fields[0]?.startsWith("FDJ")
        ? "That code comes from a newer addon than this site understands. Let me know and I will update it."
        : "That does not look like a character code.",
    };
  }
  // FDJ2 inserted the race after the realm; everything else kept its place.
  const hasRace = format === "FDJ2";
  const want = hasRace ? 11 : 10;
  if (fields.length !== want) {
    return { ok: false, error: "That code is cut short. Select all of it in the addon before copying." };
  }

  const raceToken = hasRace ? fields[3] : "";
  const [classToken, levelText, factionLetter, questText, dungeonText, timeText, checkText] =
    fields.slice(hasRace ? 4 : 3);
  const [, name, realm] = fields;

  const expected = base36(checkText);
  const actual = adler32(new TextEncoder().encode(fields.slice(0, want - 1).join("|")));
  if (expected === null || expected !== actual) {
    return { ok: false, error: "That code did not survive the copy. Paste it again without editing it." };
  }

  const completed = new Set<number>();
  if (questText) {
    let last = 0;
    for (const part of questText.split(",")) {
      const step = base36(part);
      if (step === null) return { ok: false, error: "That code is damaged." };
      last += step;
      completed.add(last);
    }
  }

  const cleared = new Set(dungeonText ? dungeonText.split(",").filter(Boolean) : []);
  const seconds = Number(timeText);

  return {
    ok: true,
    character: {
      name: name || "Unknown",
      realm,
      raceToken: raceToken || "",
      classToken: (classToken || "").toUpperCase(),
      level: Number(levelText) || 0,
      faction: factionLetter === "A" ? "Alliance" : factionLetter === "H" ? "Horde" : "Unknown",
      completed,
      cleared,
      favourites: [], // the pipe formats carry none
      exportedAt: Number.isFinite(seconds) && seconds > 0 ? new Date(seconds * 1000) : undefined,
    },
  };
}

/**
 * Read a character code of any format the addon has produced. FDJ3 needs the
 * browser to inflate it, which is asynchronous; the older two do not, but
 * resolve through the same promise so callers need only one path.
 */
export async function decodeCharacter(raw: string): Promise<DecodeResult> {
  const code = (raw ?? "").trim();
  if (!code) return { ok: false, error: "Paste the code from the addon first." };
  if (code.startsWith("FDJ3.")) return decodeSnapshot(code);
  return decodeLegacy(code);
}

/* ---------- progress against the journal ---------- */

/**
 * The slice of the journal the character page needs. The server builds it and
 * passes it down, so the browser never loads the full journal just to tick
 * off quest names.
 */
export interface IndexQuest {
  id: number;
  name: string;
  slug: string;
  faction: "Alliance" | "Horde" | "Both" | "Neutral";
  /** Class tokens the quest is for; absent when any class can take it. */
  classOnly?: string[];
  /** Needs a profession the character may not have. */
  profession: boolean;
  repeatable: boolean;
}
export interface IndexDungeon {
  slug: string;
  name: string;
  level: string;
  art: string | null;
  previewOnly: boolean;
  /** Worth Journey points once its final boss is down (see hasJourneyPage). */
  journeyPage: boolean;
  quests: IndexQuest[];
}

export interface QuestState {
  id: number;
  name: string;
  /** Absent for a quest this site does not list yet (a newer addon). */
  slug?: string;
  done: boolean;
}

export interface DungeonProgress extends IndexDungeon {
  questsDone: number;
  questsTotal: number;
  /** Every quest this character can do here is done: the addon's tick. */
  complete: boolean;
  /** The quests this character can do here, in journal order. */
  questState: QuestState[];
}

/**
 * The addon's rule, for codes that do not carry its own list (FDJ1, FDJ2, or a
 * dungeon newer than the export): a quest counts when it is for the
 * character's faction and class and is not repeatable. Professions are not in
 * the code, so a profession quest counts only once it is done.
 */
function questCountsFor(q: IndexQuest, c: Character, done: boolean): boolean {
  if (q.repeatable) return false;
  if (c.faction !== "Unknown" && q.faction !== "Both" && q.faction !== "Neutral" && q.faction !== c.faction) {
    return false;
  }
  if (q.classOnly && c.classToken && !q.classOnly.includes(c.classToken)) return false;
  if (q.profession && !done) return false;
  return true;
}

/** One row per dungeon, for the character page. */
export function dungeonProgress(index: IndexDungeon[], c: Character): DungeonProgress[] {
  return index.map((d) => {
    const known = new Map(d.quests.map((q) => [q.id, q]));
    const fromAddon = c.dungeonQuests?.get(d.slug);
    const questState: QuestState[] = fromAddon
      ? fromAddon.map((q) => ({
          id: q.id,
          name: known.get(q.id)?.name ?? q.name,
          slug: known.get(q.id)?.slug,
          done: q.done || c.completed.has(q.id),
        }))
      : d.quests
          .filter((q) => questCountsFor(q, c, c.completed.has(q.id)))
          .map((q) => ({ id: q.id, name: q.name, slug: q.slug, done: c.completed.has(q.id) }));
    const questsDone = questState.filter((q) => q.done).length;
    return {
      ...d,
      questsDone,
      questsTotal: questState.length,
      complete: questState.length > 0 && questsDone === questState.length,
      questState,
    };
  });
}

export interface ProgressTotals {
  questsDone: number;
  questsTotal: number;
  /** Dungeons with at least one quest for this character, all of them done. */
  dungeonsComplete: number;
  /** Dungeons with at least one quest for this character. */
  dungeonsTotal: number;
  percent: number;
}

export function progressTotals(rows: DungeonProgress[]): ProgressTotals {
  const live = rows.filter((r) => !r.previewOnly);
  const questsDone = live.reduce((n, r) => n + r.questsDone, 0);
  const questsTotal = live.reduce((n, r) => n + r.questsTotal, 0);
  return {
    questsDone,
    questsTotal,
    dungeonsComplete: live.filter((r) => r.complete).length,
    dungeonsTotal: live.filter((r) => r.questsTotal > 0).length,
    percent: questsTotal > 0 ? Math.round((questsDone / questsTotal) * 100) : 0,
  };
}

export interface Journey {
  points: number;
  max: number;
  percent: number;
}

/**
 * RPG Mode's Journey bar (Systems/RPGMode.lua, Progress): 5 points for each
 * of the character's quests handed in, 10 for each dungeon page unlocked by
 * killing its final boss. A quest listed under two dungeons counts once.
 */
export function journeyProgress(rows: DungeonProgress[], c: Character): Journey {
  const QUEST_POINTS = 5;
  const PAGE_POINTS = 10;
  const quests = new Map<number, boolean>();
  let pages = 0;
  let pagesDone = 0;
  for (const r of rows) {
    if (r.previewOnly) continue;
    for (const q of r.questState) quests.set(q.id, (quests.get(q.id) ?? false) || q.done);
    if (r.journeyPage) {
      pages += 1;
      if (c.cleared.has(r.slug)) pagesDone += 1;
    }
  }
  const done = [...quests.values()].filter(Boolean).length;
  const points = done * QUEST_POINTS + pagesDone * PAGE_POINTS;
  const max = quests.size * QUEST_POINTS + pages * PAGE_POINTS;
  return { points, max, percent: max > 0 ? Math.floor((points / max) * 100) : 0 };
}

/** The game's class colours, for the character's name. */
export const CLASS_COLORS: Record<string, string> = {
  WARRIOR: "#c69b6d",
  PALADIN: "#f48cba",
  HUNTER: "#aad372",
  ROGUE: "#fff468",
  PRIEST: "#ffffff",
  SHAMAN: "#0070dd",
  MAGE: "#3fc7eb",
  WARLOCK: "#8788ee",
  DRUID: "#ff7c0a",
  DEATHKNIGHT: "#c41e3a",
};

/** The game's race tokens, which are not all the displayed name. */
export const RACE_NAMES: Record<string, string> = {
  HUMAN: "Human",
  DWARF: "Dwarf",
  NIGHTELF: "Night Elf",
  GNOME: "Gnome",
  DRAENEI: "Draenei",
  WORGEN: "Worgen",
  ORC: "Orc",
  SCOURGE: "Undead",
  UNDEAD: "Undead",
  TAUREN: "Tauren",
  TROLL: "Troll",
  BLOODELF: "Blood Elf",
  GOBLIN: "Goblin",
  PANDAREN: "Pandaren",
};

/**
 * "EU PvP" from a realm name like "CAMWOW EU4 Realm 8 PvP": the region and the
 * realm type, the part a player cares about. Empty when neither is in the name.
 */
export function realmTag(realm: string): string {
  const r = ` ${realm.toUpperCase()} `;
  const region = /[^A-Z](EU)\d*[^A-Z]/.test(r) ? "EU" : /[^A-Z](NA|US)\d*[^A-Z]/.test(r) ? "NA" : "";
  const type = /RP\s*-?\s*PVP/.test(r)
    ? "RP-PvP"
    : /[^A-Z]PVP[^A-Z]/.test(r)
      ? "PvP"
      : /[^A-Z]PVE[^A-Z]/.test(r)
        ? "PvE"
        : /[^A-Z]RP[^A-Z]/.test(r)
          ? "RP"
          : "";
  return [region, type].filter(Boolean).join(" ");
}

// Race portraits on the site (scripts/fetch-character-portraits.py): the
// game's races in WoW Forever, each in both sexes.
const RACE_ART: Record<string, string> = {
  HUMAN: "human", DWARF: "dwarf", NIGHTELF: "nightelf", GNOME: "gnome", DRAENEI: "draenei",
  ORC: "orc", SCOURGE: "undead", UNDEAD: "undead", TAUREN: "tauren", TROLL: "troll", BLOODELF: "bloodelf",
};

/** The character's portrait: its race's (by sex) when the export says the sex, else its class icon. */
export function portraitSrc(c: Character): string | null {
  const race = RACE_ART[c.raceToken];
  if (race && c.sex) return `/journal/portraits/race/${race}_${c.sex === 3 ? "female" : "male"}.webp`;
  const cls = c.classToken.toLowerCase();
  return cls ? `/journal/portraits/class/${cls}.webp` : null;
}

/** "Orc", "Night Elf", or whatever the addon sent if this site does not know it. */
export function raceName(token: string): string {
  if (!token) return "";
  return RACE_NAMES[token.toUpperCase()] ?? token;
}

export const CLASS_NAMES: Record<string, string> = {
  WARRIOR: "Warrior",
  PALADIN: "Paladin",
  HUNTER: "Hunter",
  ROGUE: "Rogue",
  PRIEST: "Priest",
  SHAMAN: "Shaman",
  MAGE: "Mage",
  WARLOCK: "Warlock",
  DRUID: "Druid",
  DEATHKNIGHT: "Death Knight",
};
