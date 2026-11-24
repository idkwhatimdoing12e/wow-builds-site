// Slurs in comments (and character names).
//
// checkText(text) answers:
// - "slur": one of TERMS written plainly, as a whole word. The comment is
//   kept hidden (admins only) and the account is banned at once.
// - "review": one of TERMS disguised: spaced or dotted letters (n.i.g.g.e.r),
//   look-alike digits and symbols (n1gg3r, $pic), Cyrillic or Greek letters
//   that look Latin, stretched letters (niiigger). The comment is held hidden
//   until an admin restores or deletes it; no ban.
//   REVIEW_TERMS (words with an innocent meaning too) are held like this
//   even when written plainly.
// - null: fine.
//
// Only whole words count, so raccoon, spicy, Niger or tyranny pass.

const TERMS = [
  "nigger", "niggers",
  "nigga", "niggas", "niggaz", "niggah", "niggahs",
  "faggot", "faggots", "fagot", "fagots",
  "tranny", "trannies", "trannys",
  "kike", "kikes",
  "gook", "gooks",
  "spic", "spics",
  "wetback", "wetbacks",
  "raghead", "ragheads",
  "towelhead", "towelheads",
  "sand nigger", "sand niggers",
  "coon", "coons",
  "porch monkey", "porch monkeys",
];

/**
 * Words that also have an innocent meaning ("a chink in the armor", "fag" for
 * a cigarette): even written plainly they only hold the comment for an admin
 * to decide; no ban.
 */
const REVIEW_TERMS = ["chink", "chinks", "fag", "fags"];

/** Digits and symbols that stand in for letters. */
const LEET = { 0: "o", 1: "i", "!": "i", "|": "i", "¡": "i", 3: "e", "€": "e", 4: "a", "@": "a", $: "s", 5: "s", 7: "t", "+": "t", 8: "b", 6: "g", 9: "g" };
/** Cyrillic and Greek letters that look Latin. */
const LOOKALIKE = {
  а: "a", в: "b", е: "e", ё: "e", к: "k", м: "m", н: "h", о: "o", р: "p", с: "c", т: "t", у: "y", х: "x",
  і: "i", ї: "i", ј: "j", ѕ: "s", ԁ: "d", ɡ: "g", ı: "i",
  α: "a", β: "b", ε: "e", η: "n", ι: "i", κ: "k", ν: "v", ο: "o", ρ: "p", τ: "t", υ: "u", χ: "x",
};

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Plain whole words: "sand nigger" also as "sand   nigger". */
const plain = (t) => new RegExp(`(?<!\\p{L})${t.split(" ").map(escape).join("\\s+")}(?!\\p{L})`, "iu");
const PLAIN = TERMS.map(plain);

/** Disguised: any non-letters between letters, each letter repeatable. Run on loose() text. */
const LOOSE = [...TERMS, ...REVIEW_TERMS].map((t) => ({
  short: t.replace(/ /g, "").length <= 5,
  re: new RegExp(`(?<![a-z])${[...t.replace(/ /g, "")].map((c) => `${c}+`).join("[^a-z]*")}(?![a-z])`, "g"),
}));

/** Marks that stand in for "i" (n!gger) but usually end a sentence (chink!). */
const PUNCT_LEET = new Set(["!", "|", "¡"]);

/**
 * Lowercase Latin letters only; everything else (spaces, dots, zero-width
 * marks) a separator. With punct false, ! and | stay punctuation.
 */
function loose(text, punct) {
  let out = "";
  for (const ch of String(text).normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase()) {
    const c = (punct || !PUNCT_LEET.has(ch) ? LEET[ch] : undefined) ?? LOOKALIKE[ch] ?? ch;
    out += /[a-z]/.test(c) ? c : c === " " || c === "\n" || c === "\t" ? " " : "_";
  }
  return out;
}

export function checkText(text) {
  const s = String(text ?? "").normalize("NFKC");
  if (PLAIN.some((re) => re.test(s))) return "slur";
  for (const l of [loose(s, true), loose(s, false)]) {
    for (const { short, re } of LOOSE) {
      for (const m of l.matchAll(re)) {
        // Two real words side by side ("go ok", "co on") are not a disguised
        // short slur; spaced single letters ("g o o k") still are.
        const parts = m[0].split(/[^a-z]+/);
        if (short && parts.length > 1 && /^[a-z ]+$/.test(m[0]) && parts.every((p) => p.length >= 2)) continue;
        return "review";
      }
    }
  }
  return null;
}
