// Signing in with Discord, the account that comes with it, and its characters.
//
// Discord is asked for "identify" only: the user's ID, name and avatar, no
// email. The session is a random token in an HttpOnly cookie; the database
// keeps only its SHA-256, so a copy of the database signs no one in.
//
// Readers only ever see a commenter's character. The Discord name and avatar
// go to the account's owner (on their own compose box) and to admins.

import { cookie, cookies, fail, json, now, proxied, randomToken, safeReturn, sameSite, sha256 } from "./util.js";
import { checkText } from "./wordfilter.js";

const SESSION_COOKIE = "dj_sid";
const STATE_COOKIE = "dj_oauth";
const SESSION_DAYS = 30;
const DISCORD = "https://discord.com";
const DISCORD_EPOCH = 1420070400000n;
/** Characters one account can keep on its list. */
const MAX_CHARACTERS = 10;

function redirectUri(request) {
  return `${new URL(request.url).origin}/api/auth/callback`;
}

/** When the Discord account was made: the top bits of its ID are a timestamp. */
export function discordCreated(id) {
  try {
    return Number((BigInt(id) >> 22n) + DISCORD_EPOCH);
  } catch {
    return 0;
  }
}

function discordAvatar(id, hash) {
  if (hash) return `https://cdn.discordapp.com/avatars/${id}/${hash}.png?size=64`;
  try {
    return `https://cdn.discordapp.com/embed/avatars/${Number((BigInt(id) >> 22n) % 6n)}.png`;
  } catch {
    return "";
  }
}

export function isAdmin(env, user) {
  return Boolean(user) && String(env.ADMIN_IDS || "").split(",").map((s) => s.trim()).includes(user.id);
}

/** The signed-in user for this request, or null. */
export async function currentUser(request, env) {
  const token = cookies(request)[SESSION_COOKIE];
  if (!token) return null;
  const row = await env.DB.prepare(
    `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ?`,
  )
    .bind(await sha256(token), now())
    .first();
  return row || null;
}

/** A characters row as the pages see it. */
export function shapeCharacter(r) {
  return r
    ? {
        id: r.id,
        name: r.name,
        realm: r.realm || "",
        classToken: r.class || "",
        raceToken: r.race || "",
        level: r.level || 0,
        faction: r.faction || "",
        ...(r.sex ? { sex: r.sex } : {}),
      }
    : null;
}

/** The character a user comments as: their chosen one, if still on their list. */
export async function activeCharacter(env, u) {
  if (!u?.active_character) return null;
  return env.DB.prepare(`SELECT * FROM characters WHERE id = ? AND user_id = ? AND removed = 0`).bind(u.active_character, u.id).first();
}

async function myCharacters(env, u) {
  const { results } = await env.DB.prepare(`SELECT * FROM characters WHERE user_id = ? AND removed = 0 ORDER BY updated_at DESC`)
    .bind(u.id)
    .all();
  return results;
}

/** What /api/me tells the account's owner (and no one else). */
async function publicMe(env, u) {
  const list = await myCharacters(env, u);
  const active = list.find((c) => c.id === u.active_character) ?? null;
  return {
    id: u.id,
    name: u.name,
    avatar: proxied(u.avatar || ""),
    admin: isAdmin(env, u),
    banned: Boolean(u.banned),
    characters: list.map(shapeCharacter),
    active: active ? active.id : null,
  };
}

async function startSession(request, env, user, returnTo) {
  const token = randomToken();
  const expires = now() + SESSION_DAYS * 86400 * 1000;
  await env.DB.batch([
    env.DB.prepare(`DELETE FROM sessions WHERE expires_at < ?`).bind(now()),
    env.DB.prepare(`INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)`).bind(await sha256(token), user.id, expires),
  ]);
  const headers = new Headers({ Location: safeReturn(returnTo) });
  headers.append("Set-Cookie", cookie(request, SESSION_COOKIE, token, SESSION_DAYS * 86400));
  headers.append("Set-Cookie", cookie(request, STATE_COOKIE, "", 0));
  return new Response(null, { status: 302, headers });
}

async function upsertUser(env, id, name, avatar) {
  await env.DB.prepare(
    `INSERT INTO users (id, name, avatar, created_at) VALUES (?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET name = excluded.name, avatar = excluded.avatar`,
  )
    .bind(id, name, avatar, now())
    .run();
  return { id };
}

/** GET /api/auth/login?return=/blue/123: off to Discord. */
export function login(request, env) {
  if (!env.DISCORD_CLIENT_ID) return fail("login_unavailable", 503);
  const returnTo = safeReturn(new URL(request.url).searchParams.get("return"));
  const state = randomToken();
  const url = new URL(`${DISCORD}/oauth2/authorize`);
  url.search = new URLSearchParams({
    response_type: "code",
    client_id: env.DISCORD_CLIENT_ID,
    scope: "identify",
    state,
    redirect_uri: redirectUri(request),
    prompt: "none",
  }).toString();
  return new Response(null, {
    status: 302,
    headers: {
      Location: url.toString(),
      "Set-Cookie": cookie(request, STATE_COOKIE, `${state}|${returnTo}`, 600),
    },
  });
}

/** GET /api/auth/callback: Discord sends the user back here. */
export async function callback(request, env) {
  const url = new URL(request.url);
  const [state, returnTo] = (cookies(request)[STATE_COOKIE] || "").split("|");
  const back = safeReturn(returnTo);
  const bounce = (reason) =>
    new Response(null, { status: 302, headers: { Location: `${back}${back.includes("?") ? "&" : "?"}login=${reason}` } });
  if (!state || url.searchParams.get("state") !== state) return bounce("expired");
  const code = url.searchParams.get("code");
  if (!code) return bounce("cancelled");

  const tokenRes = await fetch(`${DISCORD}/api/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${env.DISCORD_CLIENT_ID}:${env.DISCORD_CLIENT_SECRET}`)}`,
    },
    body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: redirectUri(request) }),
  });
  if (!tokenRes.ok) return bounce("failed");
  const { access_token: accessToken } = await tokenRes.json();
  const meRes = await fetch(`${DISCORD}/api/users/@me`, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!meRes.ok) return bounce("failed");
  const d = await meRes.json();
  const user = await upsertUser(env, String(d.id), String(d.global_name || d.username || "Player").slice(0, 40), discordAvatar(d.id, d.avatar));
  return startSession(request, env, user, back);
}

/**
 * GET /api/auth/dev?name=Tester&id=123: signs in a made-up user. Only on a
 * local test server: DEV_LOGIN=1 in .dev.vars (which wrangler never uploads),
 * and no Discord secret, which the live site always has.
 */
export async function devLogin(request, env) {
  const url = new URL(request.url);
  if (env.DEV_LOGIN !== "1" || env.DISCORD_CLIENT_SECRET) return fail("not_found", 404);
  const id = url.searchParams.get("id") || "100000000000000000";
  const name = url.searchParams.get("name") || "Tester";
  const user = await upsertUser(env, id, name, discordAvatar(id, null));
  return startSession(request, env, user, url.searchParams.get("return"));
}

/** POST /api/auth/logout */
export async function logout(request, env) {
  if (!sameSite(request)) return fail("forbidden", 403);
  const token = cookies(request)[SESSION_COOKIE];
  if (token) await env.DB.prepare(`DELETE FROM sessions WHERE token_hash = ?`).bind(await sha256(token)).run();
  return json({ ok: true }, { headers: { "Set-Cookie": cookie(request, SESSION_COOKIE, "", 0) } });
}

/** GET /api/me */
export async function me(request, env) {
  const u = await currentUser(request, env);
  return json({
    user: u ? await publicMe(env, u) : null,
    loginAvailable: Boolean(env.DISCORD_CLIENT_ID) || (env.DEV_LOGIN === "1" && !env.DISCORD_CLIENT_SECRET),
  });
}

const CLASSES = new Set(["WARRIOR", "PALADIN", "HUNTER", "ROGUE", "PRIEST", "SHAMAN", "MAGE", "WARLOCK", "DRUID"]);
const FACTIONS = new Set(["Alliance", "Horde", "Unknown"]);

async function signedIn(request, env) {
  if (!sameSite(request)) return { error: fail("forbidden", 403) };
  const u = await currentUser(request, env);
  if (!u) return { error: fail("signin", 401) };
  if (u.banned) return { error: fail("banned", 403) };
  return { u };
}

/**
 * POST /api/me/characters: add a character, as the page read it from a /dj
 * export code, and comment as it from now on. Adding one already on the list
 * updates it (a new level, say). A name and realm another account added first
 * is refused: codes prove nothing, so the first claim keeps it.
 */
export async function addCharacter(request, env) {
  const { u, error } = await signedIn(request, env);
  if (error) return error;
  let c;
  try {
    c = await request.json();
  } catch {
    return fail("bad_character");
  }
  const name = String(c?.name || "").trim();
  const realm = String(c?.realm || "").trim();
  const level = Number(c?.level);
  if (
    !/^[\p{L}]{2,12}$/u.test(name) ||
    realm.length > 40 ||
    !CLASSES.has(c?.classToken) ||
    !Number.isInteger(level) ||
    level < 1 ||
    level > 60 ||
    (c?.faction && !FACTIONS.has(c.faction)) ||
    (c?.raceToken && !/^[A-Za-z]{2,20}$/.test(c.raceToken)) ||
    checkText(name) ||
    checkText(realm)
  ) {
    return fail("bad_character");
  }
  const sex = c?.sex === 2 || c?.sex === 3 ? c.sex : null;
  const claim = `${name.toLocaleLowerCase("en")}|${realm.toLocaleLowerCase("en")}`;
  const t = now();

  const held = await env.DB.prepare(`SELECT id, user_id, removed FROM characters WHERE claim = ?`).bind(claim).first();
  if (held && held.user_id !== u.id) return fail("char_taken", 409);
  if (!held || held.removed) {
    const { n } = await env.DB.prepare(`SELECT COUNT(*) AS n FROM characters WHERE user_id = ? AND removed = 0`).bind(u.id).first();
    if (n >= MAX_CHARACTERS) return fail("too_many_characters");
  }
  const row = held
    ? await env.DB.prepare(
        `UPDATE characters SET name = ?, realm = ?, class = ?, race = ?, level = ?, faction = ?, sex = ?, removed = 0, updated_at = ?
         WHERE id = ? RETURNING id`,
      )
        .bind(name, realm, c.classToken, c.raceToken || null, level, c.faction || null, sex, t, held.id)
        .first()
    : await env.DB.prepare(
        `INSERT INTO characters (user_id, claim, name, realm, class, race, level, faction, sex, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
      )
        .bind(u.id, claim, name, realm, c.classToken, c.raceToken || null, level, c.faction || null, sex, t, t)
        .first();
  await env.DB.prepare(`UPDATE users SET active_character = ? WHERE id = ?`).bind(row.id, u.id).run();
  return json({ user: await publicMe(env, { ...u, active_character: row.id }) });
}

/** PUT /api/me/character { id }: comment as another character from the list. */
export async function selectCharacter(request, env) {
  const { u, error } = await signedIn(request, env);
  if (error) return error;
  const id = Number((await request.json().catch(() => ({})))?.id);
  const c = await env.DB.prepare(`SELECT id FROM characters WHERE id = ? AND user_id = ? AND removed = 0`).bind(id, u.id).first();
  if (!c) return fail("not_found", 404);
  await env.DB.batch([
    env.DB.prepare(`UPDATE users SET active_character = ? WHERE id = ?`).bind(c.id, u.id),
    env.DB.prepare(`UPDATE characters SET updated_at = ? WHERE id = ?`).bind(now(), c.id),
  ]);
  return json({ user: await publicMe(env, { ...u, active_character: c.id }) });
}

/**
 * DELETE /api/me/characters/<id>: off the list. Its old comments keep showing
 * it, and its name stays this account's (adding it again brings it back).
 */
export async function removeCharacter(request, env, id) {
  const { u, error } = await signedIn(request, env);
  if (error) return error;
  const done = await env.DB.prepare(`UPDATE characters SET removed = 1 WHERE id = ? AND user_id = ? AND removed = 0`).bind(id, u.id).run();
  if (!done.meta.changes) return fail("not_found", 404);
  let active = u.active_character;
  if (active === id) {
    const next = await env.DB.prepare(`SELECT id FROM characters WHERE user_id = ? AND removed = 0 ORDER BY updated_at DESC LIMIT 1`)
      .bind(u.id)
      .first();
    active = next ? next.id : null;
    await env.DB.prepare(`UPDATE users SET active_character = ? WHERE id = ?`).bind(active, u.id).run();
  }
  return json({ user: await publicMe(env, { ...u, active_character: active }) });
}

/**
 * DELETE /api/me: the account, its characters, sessions, comments and
 * reports, gone. A banned account stays (as a ban), without its name or avatar.
 */
export async function deleteAccount(request, env) {
  if (!sameSite(request)) return fail("forbidden", 403);
  const u = await currentUser(request, env);
  if (!u) return fail("signin", 401);
  await env.DB.batch([
    env.DB.prepare(`DELETE FROM reports WHERE user_id = ? OR comment_id IN (SELECT id FROM comments WHERE user_id = ?)`).bind(u.id, u.id),
    env.DB.prepare(`DELETE FROM comments WHERE user_id = ?`).bind(u.id),
    env.DB.prepare(`DELETE FROM characters WHERE user_id = ?`).bind(u.id),
    env.DB.prepare(`DELETE FROM sessions WHERE user_id = ?`).bind(u.id),
    u.banned
      ? env.DB.prepare(`UPDATE users SET name = '', avatar = NULL, active_character = NULL WHERE id = ?`).bind(u.id)
      : env.DB.prepare(`DELETE FROM users WHERE id = ?`).bind(u.id),
  ]);
  return json({ ok: true }, { headers: { "Set-Cookie": cookie(request, SESSION_COOKIE, "", 0) } });
}
