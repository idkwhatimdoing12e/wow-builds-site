// The written overview at the top of each dungeon page: where it is, the
// bosses, the quests worth taking, notable drops and a tip. One file per
// language in data/overviews/<lang>.json (slug -> text, paragraphs split by a
// blank line). Read at build time only; a language without a file shows none.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Lang } from "./i18n";

const cache = new Map<Lang, Record<string, string>>();

function load(lang: Lang): Record<string, string> {
  let m = cache.get(lang);
  if (!m) {
    const p = join(process.cwd(), "data", "overviews", `${lang}.json`);
    m = existsSync(p) ? (JSON.parse(readFileSync(p, "utf8")) as Record<string, string>) : {};
    cache.set(lang, m);
  }
  return m;
}

/** The overview's paragraphs for this dungeon and language, or null. */
export function getOverview(slug: string, lang: Lang): string[] | null {
  const text = load(lang)[slug];
  return text ? text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean) : null;
}
