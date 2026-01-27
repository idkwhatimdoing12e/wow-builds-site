import "./globals.css";
import Link from "next/link";
import Script from "next/script";
import GlobalNav from "./components/GlobalNav";
import WowheadInit from "./components/WowheadInit";

export const metadata = {
  title: "WoW Builds",
  description: "Curated level 1 twink builds across expansions.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics (GA4) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-WZL8YR2L05"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-WZL8YR2L05');
          `}
        </Script>
      </head>

      <body className="bg-black text-white flex flex-col min-h-screen">
        {/* Must be mounted once globally for tooltips */}
        <WowheadInit />

        {/* Fixed global nav (Discord always, Home everywhere except landing) */}
        <GlobalNav />

        <div className="flex-grow">{children}</div>

        <footer className="border-t border-white/10">
          <div className="mx-auto max-w-4xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/50">
            <div>© {new Date().getFullYear()} WoW Builds</div>

            <div className="flex gap-6">
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