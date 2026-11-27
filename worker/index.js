// The site's Worker. Everything is static files (./out) except the paths in
// wrangler.jsonc's assets.run_worker_first, which come here first:
//
// - /api/*: blue posts from Blizzard's forum (blue.js), Discord sign-in and
//   accounts (auth.js), comments (comments.js), kept in D1 (env.DB), and the
//   companion app's uploads from players' games (collect.js).
// - /blue/<topic>-<slug> and /<lang>/blue/...: a blue post's page. There is
//   one static page for all of them (/blue-post); it reads the thread's
//   number from the address and asks /api/blue/<topic> for the rest.

import { bluePosts, blueTopic } from "./blue.js";
import { addCharacter, callback, deleteAccount, devLogin, login, logout, me, removeCharacter, selectCharacter } from "./auth.js";
import { addComment, commentCounts, deleteComment, listComments, moderationQueue, reportComment, restoreComment, setBan } from "./comments.js";
import { fail, imageHostAllowed, json } from "./util.js";
import { collect, collectAdminPage, collectBlock, collectSummary } from "./collect.js";

const LANGS = new Set(["de", "fr", "es", "it", "pt", "ru", "ko", "zh-cn", "zh-tw"]);

async function api(request, env, ctx, path) {
  const m = request.method;
  let r;

  if (path === "/api/img" && m === "GET") return image(request, ctx);

  // The Dungeon Journal Companion app's uploads, and their review (collect.js).
  if (path === "/api/collect" && m === "POST") return collect(request, env);
  if (path === "/api/collect/summary" && m === "GET") return collectSummary(request, env);
  if (path === "/api/collect/admin" && m === "GET") return collectAdminPage(env);
  if ((r = path.match(/^\/api\/collect\/installs\/([A-Za-z0-9_-]{16,64})\/(block|unblock)$/)) && m === "POST") {
    return collectBlock(request, env, r[1], r[2] === "block");
  }

  const commentsLive = env.COMMENTS_LIVE === "1";

  if (path === "/api/blue-posts" && m === "GET") {
    return bluePosts(request, env, ctx, commentsLive ? (ids) => commentCounts(env, ids).catch(() => ({})) : async () => ({}));
  }

  if ((r = path.match(/^\/api\/blue\/(\d{1,10})$/)) && m === "GET") {
    const topic = await blueTopic(request, env, ctx, Number(r[1]));
    if (!topic) return fail("unavailable", 503);
    if (topic.notForever) return fail("not_found", 404);
    return json(topic, { maxAge: 60 });
  }

  // Comments, sign-in and accounts: off until COMMENTS_LIVE is "1" (wrangler.jsonc vars).
  if (!commentsLive) return fail("not_found", 404);
  if ((r = path.match(/^\/api\/blue\/(\d{1,10})\/comments$/))) {
    const id = Number(r[1]);
    if (m === "GET") return listComments(request, env, id);
    if (m === "POST") {
      // Only on a WoW Forever thread (the forum is asked at most every 15 minutes).
      const topic = await blueTopic(request, env, ctx, id);
      if (!topic) return fail("unavailable", 503);
      if (topic.notForever) return fail("not_found", 404);
      return addComment(request, env, id);
    }
  }

  if (path === "/api/me") {
    if (m === "GET") return me(request, env);
    if (m === "DELETE") return deleteAccount(request, env);
  }
  if (path === "/api/me/characters" && m === "POST") return addCharacter(request, env);
  if (path === "/api/me/character" && m === "PUT") return selectCharacter(request, env);
  if ((r = path.match(/^\/api\/me\/characters\/(\d{1,12})$/)) && m === "DELETE") return removeCharacter(request, env, Number(r[1]));
  if (path === "/api/auth/login" && m === "GET") return login(request, env);
  if (path === "/api/auth/callback" && m === "GET") return callback(request, env);
  if (path === "/api/auth/dev" && m === "GET") return devLogin(request, env);
  if (path === "/api/auth/logout" && m === "POST") return logout(request, env);

  if ((r = path.match(/^\/api\/comments\/(\d{1,12})$/)) && m === "DELETE") return deleteComment(request, env, Number(r[1]));
  if ((r = path.match(/^\/api\/comments\/(\d{1,12})\/report$/)) && m === "POST") return reportComment(request, env, Number(r[1]));
  if ((r = path.match(/^\/api\/comments\/(\d{1,12})\/restore$/)) && m === "POST") return restoreComment(request, env, Number(r[1]));
  if (path === "/api/admin/queue" && m === "GET") return moderationQueue(request, env);
  if ((r = path.match(/^\/api\/users\/(\d{5,25})\/(ban|unban)$/)) && m === "POST") return setBan(request, env, r[1], r[2] === "ban");

  return fail("not_found", 404);
}

/**
 * /api/img?u=<url>: a picture from Blizzard's forum or Discord, fetched by the
 * Worker and kept in Cloudflare's cache for a day, so visitors' browsers never
 * contact those sites. Only the hosts in util.js, and only images.
 */
async function image(request, ctx) {
  const url = new URL(request.url).searchParams.get("u") || "";
  if (!imageHostAllowed(url)) return fail("not_found", 404);
  const cache = caches.default;
  const key = new Request(new URL(`/__img/${encodeURIComponent(url)}`, request.url));
  const hit = await cache.match(key);
  if (hit) return hit;
  let r;
  try {
    r = await fetch(url, { headers: { "User-Agent": "foreverjournal.pro images", Accept: "image/*" } });
  } catch {
    return fail("unavailable", 502);
  }
  const type = r.headers.get("Content-Type") || "";
  if (!r.ok || !/^image\/(png|jpe?g|gif|webp|avif)/.test(type)) return fail("not_found", 404);
  const out = new Response(r.body, {
    headers: { "Content-Type": type, "Cache-Control": "public, max-age=86400", "X-Content-Type-Options": "nosniff" },
  });
  ctx.waitUntil(cache.put(key, out.clone()));
  return out;
}

/** /blue/<topic>-<slug> (or /de/blue/...): the one blue-post page, in the right language. */
function bluePage(request, env, path) {
  const m = path.match(/^(?:\/([a-z]{2}(?:-[a-z]{2})?))?\/blue\/(\d{1,10})(?:-[\w-]*)?\/?$/);
  if (!m || (m[1] && !LANGS.has(m[1]))) return null;
  const page = new URL(m[1] ? `/${m[1]}/blue-post` : "/blue-post", request.url);
  return env.ASSETS.fetch(new Request(page, { headers: request.headers }));
}

export default {
  async fetch(request, env, ctx) {
    const path = new URL(request.url).pathname;
    try {
      if (path.startsWith("/api/")) return await api(request, env, ctx, path);
      if (/\/blue\//.test(path)) {
        const page = await bluePage(request, env, path);
        if (page) return page;
      }
    } catch (e) {
      console.error(e);
      if (path.startsWith("/api/")) return fail("server", 500);
    }
    return env.ASSETS.fetch(request);
  },
};
