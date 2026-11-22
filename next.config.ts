import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The whole site is static: `next build` writes it to out/, which Cloudflare
  // serves (wrangler.jsonc). The old redirects live in public/_redirects.
  output: "export",
};

export default nextConfig;
