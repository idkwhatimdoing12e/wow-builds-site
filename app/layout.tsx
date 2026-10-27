import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import SiteHeader from "./components/site/SiteHeader";
import SiteFooter from "./components/site/SiteFooter";
import { getDungeonSummaries } from "./lib/journal";
import WowheadInit from "./components/WowheadInit";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "./lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — WoW Forever dungeon quests, bosses & loot`,
    template: `%s — ${SITE_NAME}`,
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
        {/* Blizzard's forum fonts: Noto Sans for text; Manrope stands in for Object Sans
            (Blizzard's licensed heading font) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Noto+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />

        {/* Google Analytics (GA4) */}
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
            gtag('config', 'G-WZL8YR2L05');
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
        {/* Must be mounted once globally for tooltips */}
        <WowheadInit />

        <SiteHeader
          dungeons={getDungeonSummaries().map((d) => ({
            slug: d.slug,
            name: d.name,
            level: d.level,
            forever: d.forever,
            previewOnly: d.previewOnly,
          }))}
        />

        <main className="sx-main">{children}</main>

        <SiteFooter />
      </body>
    </html>
  );
}