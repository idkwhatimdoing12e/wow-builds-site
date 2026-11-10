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
  classToken: string;
  level: number;
  faction: "Alliance" | "Horde" | "Unknown";
  /** Quest IDs the character has completed, including ones this site does not list. */
  completed: Set<number>;
  /** Slugs of dungeons whose final boss the character has killed. */
  cleared: Set<string>;
  exportedAt?: Date;
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
  classToken?: string;
  level?: number;
  faction?: string;
  exportedAt?: number;
  completed?: number[];
  dungeons?: { slug?: string; cleared?: boolean }[];
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
  return {
    ok: true,
    character: {
      name: snap.name || "Unknown",
      realm: snap.realm ?? "",
      raceToken: (snap.raceToken ?? "").toUpperCase(),
      classToken: (snap.classToken ?? "").toUpperCase(),
      level: Number(snap.level) || 0,
      faction,
      completed: new Set((snap.completed ?? []).map(Number).filter(Number.isFinite)),
      // The snapshot names the dungeons it considers cleared; the site keys on slug.
      cleared: new Set(
        (snap.dungeons ?? []).filter((d) => d?.cleared && d.slug).map((d) => d.slug as string),
      ),
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
}
export interface IndexDungeon {
  slug: string;
  name: string;
  level: string;
  art: string | null;
  previewOnly: boolean;
  quests: IndexQuest[];
}

export interface DungeonProgress extends IndexDungeon {
  questsDone: number;
  questsTotal: number;
  cleared: boolean;
  /** Each quest with whether this character has finished it, in journal order. */
  questState: (IndexQuest & { done: boolean })[];
}

/** One row per dungeon, for the character page. */
export function dungeonProgress(index: IndexDungeon[], c: Character): DungeonProgress[] {
  return index.map((d) => {
    const questState = d.quests.map((q) => ({ ...q, done: c.completed.has(q.id) }));
    return {
      ...d,
      questsDone: questState.filter((q) => q.done).length,
      questsTotal: questState.length,
      cleared: c.cleared.has(d.slug),
      questState,
    };
  });
}

export interface ProgressTotals {
  questsDone: number;
  questsTotal: number;
  dungeonsCleared: number;
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
    dungeonsCleared: live.filter((r) => r.cleared).length,
    dungeonsTotal: live.length,
    percent: questsTotal > 0 ? Math.round((questsDone / questsTotal) * 100) : 0,
  };
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
