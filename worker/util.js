// Small helpers shared by the Worker's routes.

export function json(body, { status = 200, maxAge = 0, headers = {} } = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": maxAge > 0 ? `public, max-age=${maxAge}` : "private, no-store",
      ...headers,
    },
  });
}

/** An error the site's pages know how to word: { error: "<code>" }. */
export function fail(code, status = 400) {
  return json({ error: code }, { status });
}

/**
 * Requests that change something must come from the site's own pages: they
 * carry the X-DJ header (which a form or image on another site cannot send
 * without a CORS preflight this Worker never answers), and the browser's
 * Origin, when it sends one, must be this site.
 */
export function sameSite(request) {
  if (request.headers.get("X-DJ") !== "1") return false;
  const origin = request.headers.get("Origin");
  return !origin || origin === new URL(request.url).origin;
}

export function now() {
  return Date.now();
}

/** 32 random bytes, base64url: session tokens and OAuth states. */
export function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function sha256(text) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function cookies(request) {
  const out = {};
  for (const part of (request.headers.get("Cookie") || "").split(/;\s*/)) {
    const i = part.indexOf("=");
    if (i > 0) out[part.slice(0, i)] = decodeURIComponent(part.slice(i + 1));
  }
  return out;
}

/** Secure cookies everywhere but a local test server (http://127.0.0.1). */
export function cookie(request, name, value, maxAge) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

/** Hosts whose pictures the site shows: Blizzard's forum and CDNs, Discord avatars, video thumbnails. */
const IMAGE_HOSTS = [/^us\.forums\.blizzard\.com$/, /\.blizzard\.com$/, /\.akamaihd\.net$/, /\.akamaized\.net$/, /^cdn\.discordapp\.com$/, /^(i|img)\.ytimg\.com$/, /^img\.youtube\.com$/];

export function imageHostAllowed(url) {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && IMAGE_HOSTS.some((re) => re.test(u.hostname));
  } catch {
    return false;
  }
}

/**
 * A picture from Blizzard or Discord, through this site (/api/img): visitors'
 * browsers then only ever talk to this site, as the privacy page says. Empty
 * for a host the proxy does not serve.
 */
export function proxied(url) {
  return url && imageHostAllowed(url) ? `/api/img?u=${encodeURIComponent(url)}` : "";
}

/** Only a path on this site: never send someone on to another site after signing in. */
export function safeReturn(path) {
  return typeof path === "string" && /^\/(?!\/)[\w\-./#%?=&]*$/.test(path) ? path : "/";
}
