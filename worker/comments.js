// Comments on blue posts.
//
// They show as soon as they are posted. What keeps it civil:
// - a Discord account at least 7 days old, and not banned here;
// - a character added from a /dj export code. Readers see only that
//   character; the Discord account behind it is shown to admins alone;
// - one comment per 30 seconds and 30 a day per account;
// - at most 2 links in a comment, 2 to 1500 characters;
// - readers can report a comment; at 3 reports it is hidden until an admin looks;
// - admins (ADMIN_IDS) can delete any comment, restore a hidden one, and ban an
//   account, which hides everything it wrote.
// - the word filter (wordfilter.js): a slur written plainly bans the account
//   at once and keeps the comment hidden for admins; a disguised one holds
//   the comment hidden (its author still sees it) until an admin decides.
// Comments are plain text: no HTML, and links are not made clickable.

import { activeCharacter, currentUser, discordCreated, isAdmin, shapeCharacter } from "./auth.js";
import { fail, json, now, proxied, sameSite } from "./util.js";
import { checkText } from "./wordfilter.js";

const MIN_ACCOUNT_AGE = 7 * 86400 * 1000;
const GAP = 30 * 1000;
const PER_DAY = 30;
const MAX_LEN = 1500;
const MAX_LINKS = 2;
const HIDE_AT = 3;

/** Comment counts for the home page's cards. */
export async function commentCounts(env, topicIds) {
  if (!topicIds.length) return {};
  const marks = topicIds.map(() => "?").join(",");
  const { results } = await env.DB.prepare(
    `SELECT c.topic_id AS t, COUNT(*) AS n FROM comments c JOIN users u ON u.id = c.user_id
     WHERE c.topic_id IN (${marks}) AND c.hidden = 0 AND u.banned = 0 GROUP BY c.topic_id`,
  )
    .bind(...topicIds)
    .all();
  return Object.fromEntries(results.map((r) => [r.t, r.n]));
}

/**
 * A comment as the page gets it. The Discord account (user) is only in an
 * admin's copy: everyone else sees the character alone.
 */
function shape(row, ch, viewer, admin) {
  return {
    id: row.id,
    body: row.body,
    date: new Date(row.created_at).toISOString(),
    character: shapeCharacter(ch),
    mine: Boolean(viewer && viewer.id === row.user_id),
    reported: Boolean(row.reported_by_me),
    // Held by the word filter: only its author (and admins) get it.
    ...(row.hidden && row.flag === "review" ? { held: true } : {}),
    ...(admin
      ? {
          user: { id: row.user_id, name: row.u_name, avatar: proxied(row.u_avatar || "") },
          hidden: row.hidden,
          reports: row.reports,
          flag: row.flag || null,
          banned: Boolean(row.u_banned),
        }
      : {}),
  };
}

/** The character columns of a listComments row, as a characters row. */
function rowCharacter(r) {
  return r.ch_id
    ? { id: r.ch_id, name: r.ch_name, realm: r.ch_realm, class: r.ch_class, race: r.ch_race, level: r.ch_level, faction: r.ch_faction, sex: r.ch_sex }
    : null;
}

/** GET /api/blue/<topic>/comments: oldest first. Admins also see hidden ones. */
export async function listComments(request, env, topicId) {
  const viewer = await currentUser(request, env);
  const admin = isAdmin(env, viewer);
  const { results } = await env.DB.prepare(
    `SELECT c.*, u.name AS u_name, u.avatar AS u_avatar, u.banned AS u_banned,
            ch.id AS ch_id, ch.name AS ch_name, ch.realm AS ch_realm, ch.class AS ch_class, ch.race AS ch_race,
            ch.level AS ch_level, ch.faction AS ch_faction, ch.sex AS ch_sex,
            EXISTS (SELECT 1 FROM reports r WHERE r.comment_id = c.id AND r.user_id = ?) AS reported_by_me
     FROM comments c JOIN users u ON u.id = c.user_id LEFT JOIN characters ch ON ch.id = c.character_id
     WHERE c.topic_id = ? ${admin ? "" : "AND u.banned = 0 AND (c.hidden = 0 OR (c.flag = 'review' AND c.user_id = ?))"}
     ORDER BY c.created_at ASC LIMIT 500`,
  )
    .bind(...(admin ? [viewer.id, topicId] : [viewer?.id ?? "", topicId, viewer?.id ?? ""]))
    .all();
  return json({ comments: results.map((r) => shape(r, rowCharacter(r), viewer, admin)) });
}

function clean(text) {
  return String(text ?? "")
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000b-\u001f\u007f​-‏‪-‮⁦-⁩]/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** POST /api/blue/<topic>/comments { body } */
export async function addComment(request, env, topicId) {
  if (!sameSite(request)) return fail("forbidden", 403);
  const u = await currentUser(request, env);
  if (!u) return fail("signin", 401);
  if (u.banned) return fail("banned", 403);
  const ch = await activeCharacter(env, u);
  if (!ch) return fail("need_character", 403);
  if (now() - discordCreated(u.id) < MIN_ACCOUNT_AGE) return fail("too_new", 403);
  let body;
  try {
    body = clean((await request.json())?.body);
  } catch {
    return fail("empty");
  }
  if (body.length < 2) return fail("empty");
  if (body.length > MAX_LEN) return fail("too_long");
  if ((body.match(/https?:\/\/|www\./gi) || []).length > MAX_LINKS) return fail("too_many_links");

  const verdict = checkText(body);
  const admin = isAdmin(env, u);

  const t = now();
  const recent = await env.DB.prepare(
    `SELECT MAX(created_at) AS last, SUM(CASE WHEN created_at > ? THEN 1 ELSE 0 END) AS today FROM comments WHERE user_id = ?`,
  )
    .bind(t - 86400 * 1000, u.id)
    .first();
  if (recent?.last && t - recent.last < GAP) return fail("slow_down", 429);
  if ((recent?.today ?? 0) >= PER_DAY) return fail("daily_limit", 429);

  const row = await env.DB.prepare(`INSERT INTO comments (topic_id, user_id, character_id, body, created_at, hidden, flag) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *`)
    .bind(topicId, u.id, ch.id, body, t, verdict ? 1 : 0, verdict)
    .first();
  if (verdict === "slur" && !admin) {
    // Kept (hidden) so an admin can see what was written, and undo a mistake with Unban + Restore.
    await env.DB.batch([
      env.DB.prepare(`UPDATE users SET banned = 1 WHERE id = ?`).bind(u.id),
      env.DB.prepare(`DELETE FROM sessions WHERE user_id = ?`).bind(u.id),
    ]);
    return fail("banned", 403);
  }
  return json({ comment: shape({ ...row, u_name: u.name, u_avatar: u.avatar, u_banned: u.banned, reported_by_me: 0 }, ch, u, admin) }, { status: 201 });
}

async function commentAndViewer(request, env, id) {
  if (!sameSite(request)) return { error: fail("forbidden", 403) };
  const u = await currentUser(request, env);
  if (!u) return { error: fail("signin", 401) };
  const c = await env.DB.prepare(`SELECT * FROM comments WHERE id = ?`).bind(id).first();
  if (!c) return { error: fail("not_found", 404) };
  return { u, c };
}

/** DELETE /api/comments/<id>: the author's own, or any for an admin. Gone for good. */
export async function deleteComment(request, env, id) {
  const { u, c, error } = await commentAndViewer(request, env, id);
  if (error) return error;
  if (c.user_id !== u.id && !isAdmin(env, u)) return fail("forbidden", 403);
  await env.DB.batch([
    env.DB.prepare(`DELETE FROM reports WHERE comment_id = ?`).bind(id),
    env.DB.prepare(`DELETE FROM comments WHERE id = ?`).bind(id),
  ]);
  return json({ ok: true });
}

/** POST /api/comments/<id>/report: once per reader; hidden at HIDE_AT reports. */
export async function reportComment(request, env, id) {
  const { u, c, error } = await commentAndViewer(request, env, id);
  if (error) return error;
  if (c.user_id === u.id) return fail("forbidden", 403);
  if (u.banned) return fail("banned", 403);
  const added = await env.DB.prepare(`INSERT OR IGNORE INTO reports (comment_id, user_id, created_at) VALUES (?, ?, ?)`)
    .bind(id, u.id, now())
    .run();
  if (added.meta.changes) {
    await env.DB.prepare(
      `UPDATE comments SET reports = reports + 1, hidden = CASE WHEN hidden = 0 AND reports + 1 >= ? THEN 1 ELSE hidden END WHERE id = ?`,
    )
      .bind(HIDE_AT, id)
      .run();
  }
  return json({ ok: true });
}

/** POST /api/comments/<id>/restore (admin): shown again, its reports cleared. */
export async function restoreComment(request, env, id) {
  const { u, error } = await commentAndViewer(request, env, id);
  if (error) return error;
  if (!isAdmin(env, u)) return fail("forbidden", 403);
  await env.DB.batch([
    env.DB.prepare(`DELETE FROM reports WHERE comment_id = ?`).bind(id),
    env.DB.prepare(`UPDATE comments SET hidden = 0, reports = 0, flag = NULL WHERE id = ?`).bind(id),
  ]);
  return json({ ok: true });
}

/** POST /api/users/<id>/ban and /unban (admin). A ban also signs the account out. */
export async function setBan(request, env, userId, banned) {
  if (!sameSite(request)) return fail("forbidden", 403);
  const u = await currentUser(request, env);
  if (!isAdmin(env, u)) return fail("forbidden", 403);
  if (userId === u.id) return fail("forbidden", 403);
  const steps = [env.DB.prepare(`UPDATE users SET banned = ? WHERE id = ?`).bind(banned ? 1 : 0, userId)];
  if (banned) steps.push(env.DB.prepare(`DELETE FROM sessions WHERE user_id = ?`).bind(userId));
  await env.DB.batch(steps);
  return json({ ok: true });
}

/**
 * GET /api/admin/queue (admin): hidden comments waiting for a decision,
 * newest first: held by the word filter, or hidden by readers' reports.
 * Comments of banned accounts are left out (the ban already decided).
 */
export async function moderationQueue(request, env) {
  const u = await currentUser(request, env);
  if (!isAdmin(env, u)) return fail("forbidden", 403);
  const { results } = await env.DB.prepare(
    `SELECT c.id, c.topic_id, c.body, c.flag, c.reports, c.created_at FROM comments c JOIN users u ON u.id = c.user_id
     WHERE c.hidden = 1 AND u.banned = 0 ORDER BY c.created_at DESC LIMIT 50`,
  ).all();
  return json({
    queue: results.map((r) => ({
      id: r.id,
      topicId: r.topic_id,
      body: r.body.slice(0, 200),
      flag: r.flag || null,
      reports: r.reports,
      date: new Date(r.created_at).toISOString(),
    })),
  });
}
