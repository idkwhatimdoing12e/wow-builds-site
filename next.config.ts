import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The low-level (twink) build pages were removed; send old links to the journal.
  async redirects() {
    return [
      { source: "/low-level-builds", destination: "/", permanent: true },
      // The Supporters page was removed (Nov 2026); donations go to Buy Me a Coffee.
      { source: "/supporters", destination: "/", permanent: true },
      // The privacy page is off for now (Nov 2026); not permanent, it may come back.
      { source: "/privacy", destination: "/", permanent: false },
      { source: "/low-level-builds/:path*", destination: "/", permanent: true },
      { source: "/:expansion(vanilla|tbc|wotlk)/:build", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
