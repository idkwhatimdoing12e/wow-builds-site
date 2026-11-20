"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import { format, href as hrefFor, langInfo, type Lang } from "@/app/lib/i18n";

interface Ctx {
  lang: Lang;
  dict: Record<string, string>;
}

const I18nContext = createContext<Ctx>({ lang: "en", dict: {} });

/**
 * The page's language and every string it shows (dictFor on the server).
 * Wraps each translated page; components read it with useT / useHref.
 */
export function I18nProvider({ lang, dict, children }: Ctx & { children: React.ReactNode }) {
  const value = useMemo(() => ({ lang, dict }), [lang, dict]);
  // The root layout writes lang="en"; a translated page corrects it.
  useEffect(() => {
    document.documentElement.lang = langInfo(lang).html;
  }, [lang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export interface T {
  (key: string, ...args: (string | number)[]): string;
  /** The string when the page has it, else the fallback (optional keys: PROF_..., CLASS_...). */
  or: (key: string, fallback: string) => string;
}

/** t("OBJECTIVE") or t("AVAILABLE_FROM_LEVEL", 10): the string, with %s / %d filled in. */
export function useT(): T {
  const { dict } = useContext(I18nContext);
  return useMemo(
    () =>
      Object.assign((key: string, ...args: (string | number)[]) => format(dict[key] ?? key, ...args), {
        or: (key: string, fallback: string) => dict[key] ?? fallback,
      }),
    [dict],
  );
}

export function useLang(): Lang {
  return useContext(I18nContext).lang;
}

/** A site path in the page's language: "/dungeon/x" becomes "/de/dungeon/x" on a German page. */
export function useHref() {
  const { lang } = useContext(I18nContext);
  return (path: string) => hrefFor(lang, path);
}
