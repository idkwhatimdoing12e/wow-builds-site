// The site's languages: the addon's ten. English lives at the plain paths
// (/dungeon/...), every other language under its code (/de/dungeon/...).
// Only the home page, dungeon pages and quest pages are translated; the rest
// (items, character, about, privacy) stay English.

export const LANGS = [
  { code: "en", locale: "enUS", html: "en", short: "EN", label: "English" },
  { code: "de", locale: "deDE", html: "de", short: "DE", label: "Deutsch" },
  { code: "fr", locale: "frFR", html: "fr", short: "FR", label: "Français" },
  { code: "es", locale: "esES", html: "es", short: "ES", label: "Español" },
  { code: "it", locale: "itIT", html: "it", short: "IT", label: "Italiano" },
  { code: "pt", locale: "ptBR", html: "pt-BR", short: "PT", label: "Português (Brasil)" },
  { code: "ru", locale: "ruRU", html: "ru", short: "RU", label: "Русский" },
  { code: "ko", locale: "koKR", html: "ko", short: "KO", label: "한국어" },
  { code: "zh-cn", locale: "zhCN", html: "zh-CN", short: "简中", label: "简体中文" },
  { code: "zh-tw", locale: "zhTW", html: "zh-TW", short: "繁中", label: "繁體中文" },
] as const;

export type Lang = (typeof LANGS)[number]["code"];
export type Locale = (typeof LANGS)[number]["locale"];

/** Every language but English: the ones with a path prefix. */
export const PREFIXED: Lang[] = LANGS.filter((l) => l.code !== "en").map((l) => l.code);

export function isLang(code: string | undefined): code is Lang {
  return !!code && LANGS.some((l) => l.code === code);
}

export function langInfo(lang: Lang) {
  return LANGS.find((l) => l.code === lang) ?? LANGS[0];
}

/** The language a path is in: its first segment, or English. */
export function langOf(pathname: string): Lang {
  const first = pathname.split("/")[1];
  return isLang(first) && first !== "en" ? first : "en";
}

/** The path without its language prefix: "/de/dungeon/x" is "/dungeon/x". */
export function stripLang(pathname: string): string {
  const lang = langOf(pathname);
  if (lang === "en") return pathname || "/";
  const rest = pathname.slice(lang.length + 1);
  return rest === "" ? "/" : rest;
}

/** A site path in a language: "/dungeon/x" in German is "/de/dungeon/x". */
export function href(lang: Lang, path: string): string {
  if (lang === "en") return path;
  if (path === "/" || path === "") return `/${lang}`;
  if (path.startsWith("/#")) return `/${lang}${path.slice(1)}`;
  return `/${lang}${path}`;
}

/** Pages that exist in every language. */
export function isTranslated(path: string): boolean {
  return path === "/" || path.startsWith("/dungeon/") || path.startsWith("/quest/");
}

/** "Available from Level %s" with its values: %s and %d in order. */
export function format(text: string, ...args: (string | number)[]): string {
  let i = 0;
  return text.replace(/%[sd]/g, () => String(args[i++] ?? ""));
}
