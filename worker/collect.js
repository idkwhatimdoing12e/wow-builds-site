// The Dungeon Journal Companion app's uploads (migrations/0003_collect.sql).
//
// POST /api/collect: records from the companion addon (ForeverDungeonJournalCompanion, Collector.lua), read by
//   the app from the game's saved file and sent as they come. A corpse or a
//   kill counts once by its GUID however many group members send it.
// The rest is for the site's owner only, with COLLECT_ADMIN_KEY (a secret:
//   npx wrangler secret put COLLECT_ADMIN_KEY) as a Bearer token:
//   GET  /api/collect/admin                     the review page
//   GET  /api/collect/summary?view=overview|loot|units|quests|installs
//        (&map=<instance map ID> for loot, &quest=<ID> for one quest's records)
//   POST /api/collect/installs/<id>/block|unblock
// A blocked install's uploads are still answered "ok" but kept nowhere, and
// what it sent before is left out of every summary.

import { fail, json } from "./util.js";

const MAX_BODY = 512 * 1024;
const MAX_RECORDS = 500;
const RATE_WINDOW = 60 * 60 * 1000; // uploads per install per hour
const RATE_MAX = 120;
const KINDS = new Set(["loot", "kill", "unit", "qa", "qt", "qo"]);
const RANKS = new Set(["worldboss", "rareelite", "elite", "rare", "normal", "trivial", "minus"]);
const LOCALES = new Set(["enUS", "enGB", "deDE", "frFR", "esES", "esMX", "itIT", "ptBR", "ruRU", "koKR", "zhCN", "zhTW"]);
// Creature-0-<server>-<map>-<zone>-<id>-<spawn>, GameObject-... the same.
const GUID = /^(Creature|Vehicle|GameObject)-0-(\d{1,10})-(\d{1,10})-(\d{1,10})-(\d{1,10})-([0-9A-F]{6,16})$/;

const int = (v, min, max) => Number.isInteger(v) && v >= min && v <= max;
const str = (v, max) => typeof v === "string" && v.length > 0 && v.length <= max;
const maybeStr = (v, max) => (str(v, max) ? v : null);

// [[itemID, count, rarity?, name?], ...]. Rarity (0-7, -1 unknown) and the
// item's name as the loot window shows it are optional: when they don't fit
// they are dropped, not the item.
function items(list) {
  if (list === undefined) return [];
  if (!Array.isArray(list) || list.length > 40) return null;
  const out = [];
  for (const e of list) {
    if (!Array.isArray(e) || !int(e[0], 1, 9999999) || !int(e[1], 0, 10000)) return null;
    const row = [e[0], e[1]];
    const quality = int(e[2], -1, 7) ? e[2] : -1;
    const name = str(e[3], 100) ? e[3] : null;
    if (quality >= 0 || name) row.push(quality);
    if (name) row.push(name);
    out.push(row);
  }
  return out;
}

/** A record checked and trimmed to what it may hold, or null. */
function check(r, nowSec) {
  if (!r || typeof r !== "object" || !KINDS.has(r.k)) return null;
  if (!int(r.t, 1735689600, nowSec + 86400)) return null; // from 2025 to tomorrow
  const locale = LOCALES.has(r.loc) ? r.loc : null;
  const base = { k: r.k, t: r.t, loc: locale, pl: int(r.pl, 1, 80) ? r.pl : null, b: int(r.b, 1, 999999) ? r.b : null };
  if (r.k === "loot" || r.k === "kill") {
    const g = typeof r.g === "string" && r.g.match(GUID);
    if (!g || !int(r.n, 1, 9999999) || Number(g[5]) !== r.n || Number(g[3]) !== r.m) return null;
    if ((g[1] === "GameObject") !== (r.o === 1) && r.k === "loot") return null;
    const out = { ...base, g: r.g, n: r.n, m: r.m, d: int(r.d, 0, 255) ? r.d : null };
    if (r.k === "kill") return { ...out, boss: r.boss === 1 ? 1 : 0 };
    const list = items(r.i);
    if (!list) return null;
    const nm = r.o === 1 ? null : maybeStr(r.nm, 80); // the mob's name, in the player's language
    return { ...out, o: r.o === 1 ? 1 : 0, i: list, money: r.money === 1 ? 1 : 0, nm };
  }
  if (r.k === "unit") {
    if (!int(r.n, 1, 9999999) || !int(r.lv, -1, 100) || !int(r.m, 1, 9999999)) return null;
    return { ...base, n: r.n, lv: r.lv, m: r.m, r: RANKS.has(r.r) ? r.r : null, h: r.h === 1 ? 1 : 0, nm: maybeStr(r.nm, 80) };
  }
  // quests: kept as sent, with only the fields below
  if (!int(r.q, 1, 9999999)) return null;
  const q = { ...base, q: r.q };
  for (const key of ["gn", "tn", "si", "lv", "grp", "xp", "mo", "gx", "gm", "m", "d"]) {
    if (int(r[key], -1, 99999999)) q[key] = r[key];
  }
  for (const key of ["go", "to"]) if (r[key] === 1) q[key] = 1;
  if (str(r.ti, 200)) q.ti = r.ti;
  if (str(r.ob, 2000)) q.ob = r.ob;
  if (Array.isArray(r.ob) && r.ob.length <= 20 && r.ob.every((o) => typeof o === "string" && o.length <= 300)) q.ob = r.ob;
  for (const key of ["r", "ch"]) {
    const list = items(r[key]);
    if (list && list.length) q[key] = list;
  }
  if (Array.isArray(r.p) && r.p.length <= 3 && r.p.every((v) => typeof v === "number" && v >= 0 && v <= 100000)) q.p = r.p;
  return q;
}

/** POST /api/collect: { install, app, records: [ record or its JSON text ] } */
export async function collect(request, env) {
  if (request.headers.get("X-DJ-Companion") !== "1") return fail("not_found", 404);
  const length = Number(request.headers.get("Content-Length") || 0);
  if (length > MAX_BODY) return fail("too_large", 413);
  let body;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY) return fail("too_large", 413);
    body = JSON.parse(text);
  } catch {
    return fail("bad_json");
  }
  const install = body && body.install;
  if (typeof install !== "string" || !/^[A-Za-z0-9_-]{16,64}$/.test(install)) return fail("bad_install");
  if (!Array.isArray(body.records) || body.records.length > MAX_RECORDS) return fail("bad_records");
  const app = maybeStr(body.app, 20);

  const now = Date.now();
  const nowSec = Math.floor(now / 1000);
  const known = await env.DB.prepare("SELECT blocked, window_start, window_count FROM collect_installs WHERE id = ?").bind(install).first();
  if (known && known.blocked) return json({ ok: true, accepted: body.records.length, skipped: 0 });
  const fresh = !known || now - known.window_start > RATE_WINDOW;
  if (!fresh && known.window_count >= RATE_MAX) return fail("slow_down", 429);

  const records = [];
  let skipped = 0;
  for (const raw of body.records) {
    let r = raw;
    if (typeof raw === "string") {
      try {
        r = JSON.parse(raw);
      } catch {
        r = null;
      }
    }
    const ok = check(r, nowSec);
    if (ok) records.push(ok);
    else skipped++;
  }

  const db = env.DB;
  // The install's upload and rate-limit counters. Its records count goes up
  // after the batch, by the rows that were new (a resend adds nothing).
  await db
    .prepare(
      `INSERT INTO collect_installs (id, app, first_seen, last_seen, uploads, records, window_start, window_count)
       VALUES (?1, ?2, ?3, ?3, 1, 0, ?3, 1)
       ON CONFLICT(id) DO UPDATE SET app = COALESCE(?2, app), last_seen = ?3, uploads = uploads + 1,
         window_start = CASE WHEN ?3 - window_start > ?4 THEN ?3 ELSE window_start END,
         window_count = CASE WHEN ?3 - window_start > ?4 THEN 1 ELSE window_count + 1 END`,
    )
    .bind(install, app, now, RATE_WINDOW)
    .run();

  // Every row is inserted only if it is new ("counted": its changes are the
  // install's new records); what a later copy can add (coins, the boss flag,
  // a bigger stack) is merged by a separate UPDATE that is not counted.
  const statements = [];
  const counted = [];
  const seenItems = new Set(); // item names: one statement per item and language
  const add = (stmt, count = false) => {
    statements.push(stmt);
    counted.push(count);
  };
  for (const r of records) {
    if (r.k === "loot") {
      add(
        db
          .prepare("INSERT INTO collect_corpses (guid, npc, object, map, difficulty, money, install, t) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(guid) DO NOTHING")
          .bind(r.g, r.n, r.o, r.m, r.d, r.money, install, r.t),
        true,
      );
      if (r.money) add(db.prepare("UPDATE collect_corpses SET money = 1 WHERE guid = ? AND money = 0").bind(r.g));
      if (r.nm && r.loc) {
        add(db.prepare("INSERT INTO collect_names (npc, locale, name) VALUES (?1, ?2, ?3) ON CONFLICT(npc, locale) DO UPDATE SET name = ?3 WHERE name <> ?3").bind(r.n, r.loc, r.nm));
      }
      for (const [item, , quality, name] of r.i) {
        const key = `${item}:${r.loc}`;
        if (!r.loc || seenItems.has(key) || (quality === undefined && !name)) continue;
        seenItems.add(key);
        add(db.prepare(
          `INSERT INTO collect_items (item, locale, name, quality, install) VALUES (?1, ?2, ?3, ?4, ?5)
           ON CONFLICT(item, locale) DO UPDATE SET name = COALESCE(?3, name),
             quality = CASE WHEN ?4 >= 0 THEN ?4 ELSE quality END, install = ?5
           WHERE COALESCE(?3, name) IS NOT name OR (CASE WHEN ?4 >= 0 THEN ?4 ELSE quality END) IS NOT quality`,
        ).bind(item, r.loc, name || null, quality === undefined ? -1 : quality, install));
      }
      for (const [item, qty] of r.i) {
        add(db.prepare("INSERT INTO collect_drops (guid, item, qty) VALUES (?, ?, ?) ON CONFLICT(guid, item) DO NOTHING").bind(r.g, item, qty), true);
        add(db.prepare("UPDATE collect_drops SET qty = ?3 WHERE guid = ?1 AND item = ?2 AND qty < ?3").bind(r.g, item, qty));
      }
    } else if (r.k === "kill") {
      add(
        db
          .prepare("INSERT INTO collect_kills (guid, npc, map, difficulty, boss, install, t) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(guid) DO NOTHING")
          .bind(r.g, r.n, r.m, r.d, r.boss, install, r.t),
        true,
      );
      if (r.boss) add(db.prepare("UPDATE collect_kills SET boss = 1 WHERE guid = ? AND boss = 0").bind(r.g));
    } else if (r.k === "unit") {
      // A sighting counts once per install, creature, level and time: the unit
      // row is written only while the sighting is not stored yet, then it is stored.
      add(
        db
          .prepare(
            `INSERT INTO collect_units (npc, level, rank, map, hostile, seen, install)
             SELECT ?1, ?2, ?3, ?4, ?5, 1, ?6
             WHERE NOT EXISTS (SELECT 1 FROM collect_sightings WHERE install = ?6 AND npc = ?1 AND level = ?2 AND t = ?7)
             ON CONFLICT(npc, level) DO UPDATE SET seen = seen + 1, rank = COALESCE(excluded.rank, rank), map = COALESCE(map, excluded.map)`,
          )
          .bind(r.n, r.lv, r.r, r.m, r.h, install, r.t),
      );
      add(db.prepare("INSERT INTO collect_sightings (install, npc, level, t) VALUES (?, ?, ?, ?) ON CONFLICT DO NOTHING").bind(install, r.n, r.lv, r.t), true);
      if (r.nm && r.loc) {
        add(
          db
            .prepare("INSERT INTO collect_names (npc, locale, name) VALUES (?1, ?2, ?3) ON CONFLICT(npc, locale) DO UPDATE SET name = ?3 WHERE name <> ?3")
            .bind(r.n, r.loc, r.nm),
        );
      }
    } else {
      add(
        db
          .prepare("INSERT INTO collect_quests (quest, kind, locale, install, t, data) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING")
          .bind(r.q, r.k, r.loc, install, r.t, JSON.stringify(r)),
        true,
      );
    }
  }
  // D1 runs a batch as one transaction; a few hundred statements at a time.
  let stored = 0;
  for (let i = 0; i < statements.length; i += 200) {
    const results = await db.batch(statements.slice(i, i + 200));
    results.forEach((res, j) => {
      if (counted[i + j]) stored += (res.meta && res.meta.changes) || 0;
    });
  }
  if (stored) await db.prepare("UPDATE collect_installs SET records = records + ? WHERE id = ?").bind(stored, install).run();
  return json({ ok: true, accepted: records.length, skipped });
}

// ------------------------------------------------------------ admin

/** The site owner's key, compared in constant time. */
async function admin(request, env) {
  const key = env.COLLECT_ADMIN_KEY;
  if (!key) return false;
  const got = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  const enc = new TextEncoder();
  const [a, b] = await Promise.all([crypto.subtle.digest("SHA-256", enc.encode(got)), crypto.subtle.digest("SHA-256", enc.encode(key))]);
  const x = new Uint8Array(a);
  const y = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

const NOT_BLOCKED = "install NOT IN (SELECT id FROM collect_installs WHERE blocked = 1)";

async function all(db, sql, ...args) {
  const r = await db.prepare(sql).bind(...args).all();
  return r.results || [];
}

/** An ID in the query: null when it isn't there, false when it isn't a whole number above 0. */
function idParam(url, name) {
  if (!url.searchParams.has(name)) return null;
  const v = url.searchParams.get(name);
  const n = /^[0-9]{1,10}$/.test(v) ? Number(v) : NaN;
  return Number.isInteger(n) && n > 0 && n <= 9999999999 ? n : false;
}

export async function collectSummary(request, env) {
  if (!(await admin(request, env))) return fail("not_found", 404);
  const url = new URL(request.url);
  const view = url.searchParams.get("view") || "overview";
  const db = env.DB;
  const map = idParam(url, "map");
  if (map === false) return fail("bad_map");
  const questId = idParam(url, "quest");
  if (questId === false) return fail("bad_quest");

  if (view === "overview") {
    const count = async (table) => (await db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).first()).n;
    const maps = await all(
      db,
      `SELECT map, COUNT(*) AS corpses FROM collect_corpses WHERE ${NOT_BLOCKED} GROUP BY map ORDER BY corpses DESC`,
    );
    return json({
      installs: await count("collect_installs"),
      blocked: (await db.prepare("SELECT COUNT(*) AS n FROM collect_installs WHERE blocked = 1").first()).n,
      corpses: await count("collect_corpses"),
      drops: await count("collect_drops"),
      kills: await count("collect_kills"),
      units: await count("collect_units"),
      quests: await count("collect_quests"),
      maps,
    });
  }

  if (view === "loot") {
    const where = map ? `AND c.map = ${map}` : "";
    const opened = await all(
      db,
      `SELECT c.npc, c.object, c.map, COUNT(*) AS opened, SUM(c.money) AS money FROM collect_corpses c
       WHERE c.${NOT_BLOCKED} ${where} GROUP BY c.npc, c.object, c.map ORDER BY c.map, opened DESC LIMIT 2000`,
    );
    const drops = await all(
      db,
      `SELECT c.npc, c.object, c.map, d.item, COUNT(*) AS corpses, SUM(d.qty) AS qty FROM collect_drops d
       JOIN collect_corpses c ON c.guid = d.guid WHERE c.${NOT_BLOCKED} ${where}
       GROUP BY c.npc, c.object, c.map, d.item LIMIT 20000`,
    );
    const kills = await all(
      db,
      `SELECT npc, map, COUNT(*) AS kills, MAX(boss) AS boss FROM collect_kills WHERE ${NOT_BLOCKED} ${map ? `AND map = ${map}` : ""} GROUP BY npc, map`,
    );
    // English names first, else any language the creature was seen in
    const names = await all(db, "SELECT npc, name FROM collect_names ORDER BY CASE WHEN locale IN ('enUS', 'enGB') THEN 1 ELSE 0 END");
    const nameOf = new Map(names.map((n) => [n.npc, n.name]));
    // Item names and rarity from players' loot windows: English rows win, else
    // any language (rarity is the same in all); the page falls back to the journal.
    const itemRows = await all(
      db,
      `SELECT item, name, quality FROM collect_items WHERE item IN (SELECT DISTINCT item FROM collect_drops)
       ORDER BY CASE WHEN locale IN ('enUS', 'enGB') THEN 1 ELSE 0 END`,
    );
    const itemOf = new Map();
    for (const row of itemRows) {
      const it = itemOf.get(row.item) || { name: null, quality: null };
      if (row.name) it.name = row.name;
      if (row.quality != null && row.quality >= 0) it.quality = row.quality;
      itemOf.set(row.item, it);
    }
    const killsOf = new Map(kills.map((k) => [`${k.npc}:${k.map}`, k]));
    const sources = opened.map((s) => {
      const k = s.object ? null : killsOf.get(`${s.npc}:${s.map}`);
      const list = drops
        .filter((d) => d.npc === s.npc && d.object === s.object && d.map === s.map)
        .map((d) => ({
          item: d.item,
          name: itemOf.get(d.item)?.name ?? null,
          quality: itemOf.get(d.item)?.quality ?? null,
          corpses: d.corpses,
          qty: d.qty,
          perOpened: Math.round((d.corpses / s.opened) * 1000) / 10,
          perKill: k && k.kills ? Math.round((d.corpses / k.kills) * 1000) / 10 : null,
        }))
        .sort((a, b) => b.corpses - a.corpses);
      return { npc: s.npc, object: s.object, map: s.map, name: s.object ? null : nameOf.get(s.npc) || null, opened: s.opened, money: s.money, kills: k ? k.kills : null, boss: k ? k.boss : 0, items: list };
    });
    return json({ map, sources });
  }

  if (view === "units") {
    const rows = await all(
      db,
      `SELECT u.npc, MIN(u.level) AS minLevel, MAX(u.level) AS maxLevel, GROUP_CONCAT(DISTINCT u.rank) AS ranks,
         MAX(u.map) AS map, SUM(u.seen) AS seen, MAX(u.hostile) AS hostile
       FROM collect_units u WHERE u.${NOT_BLOCKED} ${map ? `AND u.map = ${map}` : ""} GROUP BY u.npc ORDER BY map, u.npc LIMIT 5000`,
    );
    const names = await all(db, "SELECT npc, locale, name FROM collect_names");
    const byNpc = new Map();
    for (const n of names) {
      if (!byNpc.has(n.npc)) byNpc.set(n.npc, {});
      byNpc.get(n.npc)[n.locale] = n.name;
    }
    return json({ units: rows.map((r) => ({ ...r, names: byNpc.get(r.npc) || {} })) });
  }

  if (view === "quests") {
    const quest = questId;
    if (quest) {
      const rows = await all(
        db,
        `SELECT kind, locale, install, t, data FROM collect_quests WHERE quest = ? AND ${NOT_BLOCKED} ORDER BY t DESC LIMIT 100`,
        quest,
      );
      return json({ quest, records: rows.map((r) => ({ ...r, data: JSON.parse(r.data) })) });
    }
    const rows = await all(
      db,
      `SELECT quest, kind, COUNT(DISTINCT install) AS installs, COUNT(*) AS records, MAX(t) AS last,
         (SELECT json_extract(data, '$.ti') FROM collect_quests q2 WHERE q2.quest = q.quest AND q2.locale IN ('enUS', 'enGB') AND json_extract(data, '$.ti') IS NOT NULL LIMIT 1) AS title
       FROM collect_quests q WHERE ${NOT_BLOCKED} GROUP BY quest, kind ORDER BY last DESC LIMIT 5000`,
    );
    return json({ quests: rows });
  }

  if (view === "installs") {
    const rows = await all(db, "SELECT id, app, first_seen, last_seen, uploads, records, blocked FROM collect_installs ORDER BY last_seen DESC LIMIT 1000");
    return json({ installs: rows });
  }

  return fail("not_found", 404);
}

export async function collectBlock(request, env, id, blocked) {
  if (!(await admin(request, env))) return fail("not_found", 404);
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(id)) return fail("bad_install");
  await env.DB.prepare("UPDATE collect_installs SET blocked = ? WHERE id = ?").bind(blocked ? 1 : 0, id).run();
  return json({ ok: true });
}

/** GET /api/collect/admin: the review page. It asks for the key and keeps it in this tab only. */
export function collectAdminPage(env) {
  if (!env.COLLECT_ADMIN_KEY) return fail("not_found", 404);
  return new Response(ADMIN_HTML, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
      "Content-Security-Policy": "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; img-src 'self'",
    },
  });
}

const ADMIN_HTML = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>Companion data</title>
<style>
body{margin:0;font:14px/1.45 system-ui,sans-serif;background:#15120e;color:#e9e2d0}
header{padding:14px 20px;background:#221c14;border-bottom:1px solid #3a3022;display:flex;gap:10px;align-items:center;flex-wrap:wrap}
h1{font-size:17px;margin:0 16px 0 0;color:#f0c35a}
button,input{font:inherit;background:#2c2419;color:#e9e2d0;border:1px solid #4a3d2a;border-radius:6px;padding:6px 10px}
button.on{background:#f0c35a;color:#15120e;border-color:#f0c35a}
main{padding:16px 20px}
table{border-collapse:collapse;width:100%;margin:8px 0 22px}
th,td{text-align:left;padding:5px 8px;border-bottom:1px solid #2e261b;vertical-align:top}
th{color:#bfae8a;font-weight:600}
.src{margin:18px 0 4px;font-weight:600;color:#f0c35a}
.muted{color:#9a8f78}
pre{white-space:pre-wrap;background:#1d1812;padding:10px;border-radius:6px}
a{color:#7fb3ff}
</style></head><body>
<header><h1>Companion data</h1>
<button data-v="overview">Overview</button><button data-v="loot">Loot</button><button data-v="units">Levels</button>
<button data-v="quests">Quests</button><button data-v="installs">Installs</button>
<input id="map" placeholder="instance map ID" size="14"><button id="key">Key</button></header>
<main id="out"><p class="muted">Loading…</p></main>
<script>
const out = document.getElementById("out");
let view = "overview";
function key() {
  let k = sessionStorage.getItem("djkey");
  if (!k) { k = prompt("Admin key"); if (k) sessionStorage.setItem("djkey", k); }
  return k || "";
}
document.getElementById("key").onclick = () => { sessionStorage.removeItem("djkey"); load(); };
async function get(params) {
  const r = await fetch("/api/collect/summary?" + new URLSearchParams(params), { headers: { Authorization: "Bearer " + key() } });
  if (r.status === 404) { sessionStorage.removeItem("djkey"); throw new Error("Wrong key"); }
  const d = await r.json();
  if (!r.ok) throw new Error(d.error === "bad_map" ? "The map ID must be a whole number above 0." : d.error || "Error " + r.status);
  return d;
}
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const wh = (kind, id) => '<a href="https://www.wowhead.com/forever/' + kind + "=" + id + '" target="_blank" rel="noopener">' + id + "</a>";
// Item names and rarity: from players' loot windows (the summary), else the
// journal's own item list (this site's search index), loaded once.
let journal = null;
async function journalItems() {
  if (journal) return journal;
  journal = new Map();
  try {
    const list = await (await fetch("/search-index/en")).json();
    for (const e of list) if (e.t === "i" && e.id) journal.set(e.id, { name: e.n, quality: e.q });
  } catch (e) {}
  return journal;
}
const QC = ["#9d9d9d", "#ffffff", "#1eff00", "#0070dd", "#a335ee", "#ff8000", "#e6cc80", "#00ccff"];
function itemCell(i, j) {
  const f = j.get(i.item) || {};
  const name = i.name || f.name;
  const q = i.quality != null ? i.quality : f.quality;
  const from = !i.name && f.name ? ' <span class=muted>(journal)</span>' : "";
  return (name ? '<span style="color:' + (QC[q] || "#e9e2d0") + '">' + esc(name) + "</span> " : "") + '<span class=muted>' + wh("item", i.item) + "</span>" + from;
}
function table(head, rows) {
  return "<table><tr>" + head.map((h) => "<th>" + h + "</th>").join("") + "</tr>" + rows.map((r) => "<tr>" + r.map((c) => "<td>" + c + "</td>").join("") + "</tr>").join("") + "</table>";
}
async function load() {
  document.querySelectorAll("header button[data-v]").forEach((b) => b.classList.toggle("on", b.dataset.v === view));
  const map = document.getElementById("map").value.trim();
  out.innerHTML = '<p class="muted">Loading…</p>';
  try {
    if (view === "overview") {
      const d = await get({ view });
      out.innerHTML = table(["Installs", "Blocked", "Corpses", "Drops", "Kills", "Creatures", "Quest records"],
        [[d.installs, d.blocked, d.corpses, d.drops, d.kills, d.units, d.quests]]) +
        "<div class=src>Corpses per instance map</div>" + table(["Map", "Corpses"], d.maps.map((m) => [m.map, m.corpses]));
    } else if (view === "loot") {
      const [d, j] = await Promise.all([get(map ? { view, map } : { view }), journalItems()]);
      out.innerHTML = d.sources.map((s) => '<div class=src>' + (s.object ? "Object " + s.npc : esc(s.name || "NPC") + " (" + wh("npc", s.npc) + ")") +
        ' <span class=muted>map ' + s.map + " · opened " + s.opened + (s.kills != null ? " · kills " + s.kills : "") + (s.boss ? " · boss" : "") + "</span></div>" +
        table(["Item", "Corpses", "Total qty", "% of opened", "% of kills"], s.items.map((i) => [itemCell(i, j), i.corpses, i.qty, i.perOpened + "%", i.perKill == null ? "" : i.perKill + "%"]))).join("") || "<p class=muted>Nothing yet.</p>";
    } else if (view === "units") {
      const d = await get(map ? { view, map } : { view });
      out.innerHTML = table(["NPC", "Name", "Level", "Rank", "Map", "Seen"], d.units.map((u) => [wh("npc", u.npc), esc(u.names.enUS || Object.values(u.names)[0] || ""),
        u.minLevel === u.maxLevel ? (u.minLevel === -1 ? "??" : u.minLevel) : u.minLevel + "–" + u.maxLevel, esc(u.ranks || ""), u.map ?? "", u.seen]));
    } else if (view === "quests") {
      const d = await get({ view });
      out.innerHTML = table(["Quest", "Title", "Kind", "Installs", "Records", ""], d.quests.map((q) => [wh("quest", q.quest), esc(q.title || ""),
        { qa: "accepted", qt: "handed in", qo: "progress inside" }[q.kind] || q.kind, q.installs, q.records, '<button data-q="' + q.quest + '">Records</button>']));
      out.querySelectorAll("button[data-q]").forEach((b) => b.onclick = async () => {
        const r = await get({ view, quest: b.dataset.q });
        out.innerHTML = '<button id="back">Back</button><pre>' + esc(JSON.stringify(r.records, null, 1)) + "</pre>";
        document.getElementById("back").onclick = load;
      });
    } else if (view === "installs") {
      const d = await get({ view });
      out.innerHTML = table(["Install", "App", "Last seen", "Uploads", "Records", ""], d.installs.map((i) => [esc(i.id), esc(i.app || ""),
        new Date(i.last_seen).toLocaleString(), i.uploads, i.records, '<button data-i="' + esc(i.id) + '" data-b="' + (i.blocked ? 0 : 1) + '">' + (i.blocked ? "Unblock" : "Block") + "</button>"]));
      out.querySelectorAll("button[data-i]").forEach((b) => b.onclick = async () => {
        await fetch("/api/collect/installs/" + b.dataset.i + "/" + (b.dataset.b === "1" ? "block" : "unblock"), { method: "POST", headers: { Authorization: "Bearer " + key() } });
        load();
      });
    }
  } catch (e) { out.innerHTML = "<p>" + esc(e.message) + "</p>"; }
}
document.querySelectorAll("header button[data-v]").forEach((b) => b.onclick = () => { view = b.dataset.v; load(); });
document.getElementById("map").onchange = load;
load();
</script></body></html>`;
