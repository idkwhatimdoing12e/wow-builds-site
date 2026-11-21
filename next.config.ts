import type { NextConfig } from "next";
import { SHOW_MONETIZATION } from "./app/lib/release";

const nextConfig: NextConfig = {
  // The low-level (twink) build pages were removed; send old links to the journal.
  async redirects() {
    return [
      { source: "/low-level-builds", destination: "/", permanent: true },
      // The Supporters page was removed (Nov 2026); donations go to Buy Me a Coffee.
      { source: "/supporters", destination: "/", permanent: true },
      // The privacy page is built but stays off on the live site until
      // monetisation starts (app/lib/release.ts); previews show it.
      ...(SHOW_MONETIZATION ? [] : [{ source: "/privacy", destination: "/", permanent: false }]),
      { source: "/low-level-builds/:path*", destination: "/", permanent: true },
      { source: "/:expansion(vanilla|tbc|wotlk)/:build", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
