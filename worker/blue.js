// Blizzard's blue posts for WoW Forever, read from the official forum.
//
// The forum's blizzard-tracker list has every staff post; the home page's
// strip keeps the WoW Forever ones. A post's page (/blue/<topic>) shows the
// thread's blue posts in full, with the thread's opening post for context when
// a player started it. The forum limits how often one address may ask, so
// every answer is kept in Cloudflare's cache for 15 minutes (and the last good
// one for a week, for when the forum is down or says no).

import { json, proxied } from "./util.js";

export const FORUM = "https://us.forums.blizzard.com/en/wow";
const FORUM_ORIGIN = "https://us.forums.blizzard.com";
const FEED = `${FORUM}/groups/blizzard-tracker/posts.json`;
/** WoW: Forever, and its General Discussion, Community Connections and Bug Report. */
export const FOREVER_CATEGORIES = new Set([346, 347, 348, 352]);
const FRESH_SECONDS = 15 * 60;
const STALE_SECONDS = 7 * 24 * 60 * 60;
const MAX_POSTS = 6;
const UA = "foreverjournal.pro blue posts";

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", hellip: "…", nbsp: " ", mdash: "—", ndash: "–", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“" };

function decode(s) {
  return s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e) => {
    if (e[0] === "#") {
      const n = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : m;
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

/** A post's opening, one line, cut at a word near 180 characters. */
function excerpt(raw, truncated) {
  let s = decode(raw || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  let cut = Boolean(truncated) || /…$/.test(s);
  s = s.replace(/…$/, "").trim();
  // A post that is only a link (a video) comes as "[its title]".
  s = s.replace(/^\[([^\]]*)\]$/, "$1").trim();
  if (s.length > 180) {
    s = s.slice(0, 180).replace(/\s+\S*$/, "");
    cut = true;
  }
  return s && cut ? `${s}…` : s;
}

function avatarUrl(template, size = 96) {
  if (!template) return "";
  const path = template.replace("{size}", String(size));
  return proxied(path.startsWith("http") ? path : `${FORUM_ORIGIN}${path}`);
}

async function forum(path) {
  const r = await fetch(`${FORUM}${path}`, { headers: { Accept: "application/json", "User-Agent": UA } });
  if (!r.ok) throw Object.assign(new Error(`forum answered ${r.status}`), { status: r.status });
  return r.json();
}

/**
 * The cached answer for `key`, else `make()`'s, cached. When make() fails, the
 * last good answer (up to a week old), else null.
 */
async function cached(request, ctx, key, make) {
  const cache = caches.default;
  const origin = new URL(request.url).origin;
  const freshKey = new Request(`${origin}/__cache/${key}?fresh`);
  const staleKey = new Request(`${origin}/__cache/${key}?stale`);
  const hit = await cache.match(freshKey);
  if (hit) return hit.json();
  try {
    const value = await make();
    const body = JSON.stringify(value);
    const put = (k, age) => cache.put(k, new Response(body, { headers: { "Cache-Control": `public, max-age=${age}` } }));
    ctx.waitUntil(Promise.all([put(freshKey, FRESH_SECONDS), put(staleKey, STALE_SECONDS)]));
    return value;
  } catch {
    const stale = await cache.match(staleKey);
    return stale ? stale.json() : null;
  }
}

/** The tracker's WoW Forever posts, newest first: every post, not one per topic. */
async function trackerPosts(request, ctx) {
  const data = await cached(request, ctx, "tracker", () => forum("/groups/blizzard-tracker/posts.json"));
  return (data?.posts ?? []).filter((p) => FOREVER_CATEGORIES.has(p.category_id));
}

/** /api/blue-posts: the newest WoW Forever topics with a blue post, one card each. */
export async function bluePosts(request, env, ctx, counts) {
  const seen = new Set();
  const posts = [];
  for (const p of await trackerPosts(request, ctx)) {
    if (seen.has(p.topic_id)) continue;
    seen.add(p.topic_id);
    posts.push({
      id: p.id,
      topicId: p.topic_id,
      slug: p.topic_slug || "",
      title: decode(p.topic_title ?? ""),
      url: `${FORUM}${p.url}`,
      author: p.name || p.username || "",
      authorTitle: p.user_title || "",
      avatar: avatarUrl(p.avatar_template),
      date: p.created_at,
      excerpt: excerpt(p.excerpt, p.truncated),
    });
    if (posts.length >= MAX_POSTS) break;
  }
  const n = counts ? await counts(posts.map((p) => p.topicId)) : {};
  for (const p of posts) p.comments = n[p.topicId] ?? 0;
  return json({ posts }, { maxAge: 60 });
}

/* ---------- a thread's blue posts, for its page ---------- */

/** Elements kept as they are; anything else keeps only its text. */
const KEEP = new Set([
  "p", "br", "hr", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s", "del", "ins", "sub", "sup", "small",
  "ul", "ol", "li", "blockquote", "code", "pre", "a", "img", "table", "thead", "tbody", "tr", "th", "td",
  "div", "span", "details", "summary",
]);
/** Elements dropped with everything in them. */
const DROP = new Set([
  "script", "style", "iframe", "object", "embed", "form", "input", "button", "textarea", "select", "option",
  "svg", "math", "noscript", "template", "video", "audio", "source", "track", "link", "meta", "base", "frame",
  "frameset", "canvas", "dialog",
]);
const RENAME = { h1: "h2", h5: "h4", h6: "h4", aside: "div", article: "div", header: "div", section: "div", figure: "div", figcaption: "p" };

function absolute(url) {
  if (!url) return null;
  try {
    const u = new URL(url, `${FORUM}/`);
    return u.protocol === "https:" || u.protocol === "http:" ? u.href : null;
  } catch {
    return null;
  }
}

/**
 * The forum's post HTML, made safe to put in the page: an allowlist of plain
 * elements, no attributes but a link's address and an image's, links made
 * absolute and opened in a new tab, quotes kept as quotes.
 */
async function sanitize(html) {
  const rewriter = new HTMLRewriter().on("*", {
    element(el) {
      const tag = el.tagName.toLowerCase();
      const cls = el.getAttribute("class") || "";
      // An image's caption bar on the forum (file name, size, an expand icon).
      if (DROP.has(tag) || (tag === "div" && /\bmeta\b/.test(cls))) {
        el.remove();
        return;
      }
      const name = RENAME[tag] ?? tag;
      if (!KEEP.has(name)) {
        el.removeAndKeepContent();
        return;
      }
      if (name !== tag) el.tagName = name;
      const href = tag === "a" ? el.getAttribute("href") : null;
      const src = tag === "img" ? el.getAttribute("src") : null;
      const alt = tag === "img" ? el.getAttribute("alt") : null;
      const width = tag === "img" ? el.getAttribute("width") : null;
      const height = tag === "img" ? el.getAttribute("height") : null;
      const isEmoji = tag === "img" && /\bemoji\b/.test(el.getAttribute("class") || "");
      const isQuote = (tag === "aside" && /\bquote\b/.test(el.getAttribute("class") || "")) || tag === "blockquote";
      for (const [attr] of [...el.attributes]) el.removeAttribute(attr);
      if (tag === "a") {
        // The forum's own heading anchors ("#p-123-hotfixes") lead nowhere here.
        const url = href && !href.startsWith("#") ? absolute(href) : null;
        if (!url) {
          el.removeAndKeepContent();
          return;
        }
        el.setAttribute("href", url);
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noreferrer noopener nofollow");
      }
      if (tag === "img") {
        const url = absolute(src);
        const src2 = url ? proxied(url) : "";
        if (!src2) {
          el.remove();
          return;
        }
        el.setAttribute("src", src2);
        el.setAttribute("alt", alt || "");
        el.setAttribute("loading", "lazy");
        if (isEmoji) el.setAttribute("class", "bpp-emoji");
        else {
          if (width && /^\d+$/.test(width)) el.setAttribute("width", width);
          if (height && /^\d+$/.test(height)) el.setAttribute("height", height);
        }
      }
      if (isQuote) el.setAttribute("class", "bpp-quote");
    },
  });
  return rewriter.transform(new Response(html)).text();
}

async function shapePost(p, staff) {
  return {
    id: p.id,
    number: p.post_number,
    author: p.name || p.username || "",
    authorTitle: p.user_title || "",
    avatar: avatarUrl(p.avatar_template),
    date: p.created_at,
    updated: p.updated_at && p.updated_at !== p.created_at ? p.updated_at : undefined,
    staff,
    url: `${FORUM}/t/${p.topic_slug}/${p.topic_id}/${p.post_number}`,
    html: await sanitize(p.cooked || ""),
  };
}

/** A WoW Forever thread and its blue posts; null when it is not one. */
export async function blueTopic(request, env, ctx, topicId) {
  return cached(request, ctx, `topic-${topicId}`, async () => {
    let t;
    try {
      t = await forum(`/t/${topicId}.json`);
    } catch (e) {
      // No such thread, or a private one: remembered too, so asking again costs the forum nothing.
      if (e.status === 404 || e.status === 403) return { notForever: true };
      throw e;
    }
    if (!FOREVER_CATEGORIES.has(t.category_id)) return { notForever: true };
    const loaded = t.post_stream?.posts ?? [];
    const staff = loaded.filter((p) => p.staff);
    // Blue posts past the first page of the thread: the tracker knows their IDs.
    const have = new Set(loaded.map((p) => p.id));
    const more = (await trackerPosts(request, ctx)).filter((p) => p.topic_id === topicId && !have.has(p.id)).map((p) => p.id);
    if (more.length) {
      const q = more.slice(0, 20).map((id) => `post_ids[]=${id}`).join("&");
      try {
        const extra = await forum(`/t/${topicId}/posts.json?${q}`);
        staff.push(...(extra.post_stream?.posts ?? []).filter((p) => p.staff));
      } catch {
        // The first page's blue posts are enough to show.
      }
    }
    staff.sort((a, b) => a.post_number - b.post_number);
    // A thread with no blue post is not one of ours.
    if (!staff.length) return { notForever: true };
    const first = loaded[0];
    return {
      id: t.id,
      title: decode(t.title || ""),
      slug: t.slug || "",
      url: `${FORUM}/t/${t.slug}/${t.id}`,
      date: t.created_at,
      // A thread a player started: their opening post, so the reply makes sense.
      context: first && !first.staff ? await shapePost(first, false) : null,
      posts: await Promise.all(staff.map((p) => shapePost(p, true))),
    };
  });
}
