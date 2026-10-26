import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The low-level (twink) build pages were removed; send old links to the journal.
  async redirects() {
    return [
      { source: "/low-level-builds", destination: "/", permanent: true },
      { source: "/low-level-builds/:path*", destination: "/", permanent: true },
      { source: "/:expansion(vanilla|tbc|wotlk)/:build", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
