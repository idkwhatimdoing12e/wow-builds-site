import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import SiteHeader from "./components/site/SiteHeader";
import SiteFooter from "./components/site/SiteFooter";
import { getDungeonSummaries } from "./lib/journal";
import { menuNames } from "./lib/i18n-server";
import ItemTooltips from "./components/journal/ItemTooltips";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "./lib/site";

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
        {/* Roboto for the site: text, titles and dungeon names. Manrope stays for
            the in-game journal window, standing in for Blizzard's Object Sans. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Roboto:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap"
          rel="stylesheet"
        />

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
            function gtag(){window.dataLayer.push(arguments);}
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