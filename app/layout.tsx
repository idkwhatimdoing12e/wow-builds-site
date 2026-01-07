import "./globals.css";
import Link from "next/link";
import GlobalHomeLink from "./components/GlobalHomeLink";

export const metadata = {
  title: "WoW Builds",
  description: "Curated level 1 twink builds across expansions.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white min-h-screen">
        {/* Sticky top-center Home link (hidden on /) */}
        <GlobalHomeLink />

        {/* Page content */}
        <div className="min-h-screen flex flex-col">
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
        </div>
      </body>
    </html>
  );
}