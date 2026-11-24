import type { Metadata } from "next";
import { I18nProvider } from "@/app/components/i18n/I18n";
import { dictFor } from "@/app/lib/i18n-server";
import { BLUE_STRINGS } from "@/app/lib/blue-strings";
import type { Lang } from "@/app/lib/i18n";
import BluePostView from "./BluePostView";

// The one page every /blue/<topic> address is served (the Worker maps them to
// /blue-post). The post itself loads in the browser.

export function bluePostMetadata(lang: Lang): Metadata {
  return {
    title: BLUE_STRINGS[lang].s_bp_title ?? BLUE_STRINGS.en.s_bp_title,
    // Blizzard's own words belong to the forum in search results, not here.
    robots: { index: false, follow: true },
  };
}

export function BluePostBody({ lang }: { lang: Lang }) {
  const dict = { ...dictFor(lang), ...BLUE_STRINGS.en, ...BLUE_STRINGS[lang] };
  return (
    <I18nProvider lang={lang} dict={dict}>
      <BluePostView />
    </I18nProvider>
  );
}
