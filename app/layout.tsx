// Fonts served from this site (no request to Google Fonts): Roboto for text,
// Manrope for the journal window's titles.
import "@fontsource-variable/roboto";
import "@fontsource-variable/roboto/wght-italic.css";
import "@fontsource-variable/manrope";
import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import SiteHeader from "./components/site/SiteHeader";
import SiteFooter from "./components/site/SiteFooter";
import { getDungeonSummaries } from "./lib/journal";
import { menuNames } from "./lib/i18n-server";
import ItemTooltips from "./components/journal/ItemTooltips";
import { NavTracker } from "./components/site/BackLink";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "./lib/site";
import { SHOW_MONETIZATION } from "./lib/release";

// Consent Mode v2: in the EU/EEA, UK and Switzerland nothing is stored until
// the visitor agrees in Google's consent window, which then sends the update
// itself. Elsewhere the defaults stay granted. Off until monetisation starts
// (app/lib/release.ts): without the consent window, it would only switch
// Analytics off for those visitors.
const CONSENT_DEFAULTS = `
            gtag('consent', 'default', {
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied',
              analytics_storage: 'denied',
              region: ['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE','IS','LI','NO','GB','CH'],
              wait_for_update: 500
            });`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - WoW Forever dungeon quests, bosses & loot`,
    template: `%s - ${SITE_NAME}`,
  },
  description: `${SITE_TAGLINE}. The web version of the Dungeon Journal addon for WoW Forever.`,
  openGraph: { siteName: SITE_NAME, type: "website" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics (GA4). The address goes without its fragment: on
            the character page that is the character code, which stays private. */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-WZL8YR2L05"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}${SHOW_MONETIZATION ? CONSENT_DEFAULTS : ""}
            gtag('js', new Date());
            gtag('config', 'G-WZL8YR2L05', { page_location: location.href.split('#')[0] });
          `}
        </Script>

        {/* Google AdSense (site verification + ads) */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7979214898290780"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>

      <body className="sx-body">
        {/* The site's own item tooltip, for every link with data-item. */}
        <ItemTooltips />
        <NavTracker />

        <SiteHeader
          dungeons={getDungeonSummaries().map((d) => ({
            slug: d.slug,
            name: d.name,
            level: d.level,
            forever: d.forever,
            previewOnly: d.previewOnly,
          }))}
          names={menuNames(getDungeonSummaries())}
        />

        <main className="sx-main">{children}</main>

        <SiteFooter />
      </body>
    </html>
  );
}