import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import GlobalNav from "./components/GlobalNav";
import WowheadInit from "./components/WowheadInit";
import { LINKS, SITE_NAME, SITE_TAGLINE, SITE_URL } from "./lib/site";

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
        {/* Journal fonts: Cinzel for titles, Alegreya for body text */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Alegreya:ital,wght@0,400;0,500;0,700;1,400&display=swap"
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

      <body className="bg-black text-white flex flex-col min-h-screen">
        {/* Must be mounted once globally for tooltips */}
        <WowheadInit />

        {/* Fixed global nav (Discord always, Home everywhere except landing) */}
        <GlobalNav />

        <main className="flex-grow">{children}</main>

        <footer className="border-t border-white/10">
          <div className="mx-auto max-w-5xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/50">
            <div>
              © {new Date().getFullYear()} {SITE_NAME} by Exehn · not affiliated with Blizzard Entertainment
            </div>

            <div className="flex flex-wrap justify-center gap-5">
              <a href={LINKS.curseforge} target="_blank" rel="noreferrer noopener" className="hover:text-white">
                CurseForge
              </a>
              <a href={LINKS.patreon} target="_blank" rel="noreferrer noopener" className="hover:text-white">
                Patreon
              </a>
              <Link href="/supporters" className="hover:text-white">
                Supporters
              </Link>
              <Link href="/low-level-builds" className="hover:text-white">
                Twink builds
              </Link>
              <Link href="/about" className="hover:text-white">
                About
              </Link>
              <Link href="/privacy" className="hover:text-white">
                Privacy
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}