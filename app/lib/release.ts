// What is built but not switched on yet.

/**
 * Monetisation: the AdSense script (ads and Google's consent window), the
 * Consent Mode defaults and the privacy page's "Change my cookie choices"
 * button. All built, but off on the live site until ads start: then set this
 * to true. The privacy page itself, ads.txt and the AdSense verification tag
 * are always on (needed for Google's review).
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

/**
 * Comments on blue posts (Discord sign-in, characters, the word filter):
 * the comment box and list, comment counts on the home page's blue-post
 * cards, and the privacy page's text about them. Built, but off until
 * launch. The Worker has its own switch, COMMENTS_LIVE in wrangler.jsonc's
 * vars: turn both on together (and apply the D1 migrations first).
 */
export const COMMENTS_LIVE = false;

export const SHOW_COMMENTS =
  COMMENTS_LIVE ||
  env === "preview" ||
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_SHOW_UNRELEASED === "1";
