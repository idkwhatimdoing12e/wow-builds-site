// What is built but not switched on yet. No imports: next.config.ts reads it too.

/**
 * Monetisation (ads, Google's consent window, the privacy page and its footer
 * link). It is all built and ready, but stays off on the live site until ads
 * start: then set this to true. Until then, the live site behaves as before.
 */
export const MONETIZATION_LIVE = false;

/**
 * Vercel preview builds and `next dev` show the unreleased parts anyway, so
 * they can be checked before going live. A production build (the live site,
 * or a local `next build`) hides them. Set NEXT_PUBLIC_SHOW_UNRELEASED=1 to see them in a
 * local production build.
 */
const env = process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.VERCEL_ENV;
export const SHOW_MONETIZATION =
  MONETIZATION_LIVE ||
  env === "preview" ||
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_SHOW_UNRELEASED === "1";
