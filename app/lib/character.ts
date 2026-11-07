// Reading the code the addon's "/dj export" produces.
//
// The code is base64url over plain text, so it survives a paste into a chat
// box or a URL fragment:
//
//   FDJ1|name|realm|class|level|faction|quests|dungeons|time|checksum
//
// "quests" is the completed quest IDs sorted ascending, each stored as the gap
// from the one before it in base 36. An ID this site does not know is kept but
// never shown, so a character exported from a newer addon still reads here.
//
// Nothing is sent anywhere: the code lives in the URL fragment, which browsers
// never put in a request, and in this browser's localStorage.

export const CHARACTER_FORMAT = "FDJ1";

export interface Character {
  name: string;
  realm: string;
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

export function decodeCharacter(raw: string): DecodeResult {
  const code = (raw ?? "").trim();
  if (!code) return { ok: false, error: "Paste the code from the addon first." };

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
  if (fields[0] !== CHARACTER_FORMAT) {
    return {
      ok: false,
      error: fields[0]?.startsWith("FDJ")
        ? "That code comes from a newer addon than this site understands. Let me know and I will update it."
        : "That does not look like a character code.",
    };
  }
  if (fields.length !== 10) {
    return { ok: false, error: "That code is cut short. Select all of it in the addon before copying." };
  }

  const [, name, realm, classToken, levelText, factionLetter, questText, dungeonText, timeText, checkText] = fields;

  const expected = base36(checkText);
  const actual = adler32(new TextEncoder().encode(fields.slice(0, 9).join("|")));
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
      classToken: (classToken || "").toUpperCase(),
      level: Number(levelText) || 0,
      faction: factionLetter === "A" ? "Alliance" : factionLetter === "H" ? "Horde" : "Unknown",
      completed,
      cleared,
      exportedAt: Number.isFinite(seconds) && seconds > 0 ? new Date(seconds * 1000) : undefined,
    },
  };
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
