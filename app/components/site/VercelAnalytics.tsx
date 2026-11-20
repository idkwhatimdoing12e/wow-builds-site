"use client";

import { Analytics } from "@vercel/analytics/next";

/**
 * Vercel Web Analytics (visitors, pages, referrers, countries in the Vercel
 * dashboard), alongside Google Analytics. The address goes without its
 * fragment: on the character page that is the character code.
 */
export default function VercelAnalytics() {
  return <Analytics beforeSend={(event) => ({ ...event, url: event.url.split("#")[0] })} />;
}
