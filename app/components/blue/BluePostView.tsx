"use client";

// A blue post's page: /blue/<topic>-<slug>. One static page serves every
// thread (the Worker hands it out for any /blue/ address); it reads the
// thread's number from the address, then asks the Worker for the thread
// (/api/blue/<topic>), its comments and who is signed in.

import { useCallback, useEffect, useMemo, useState } from "react";
import { useHref, useLang, useT } from "@/app/components/i18n/I18n";
import { ago } from "@/app/lib/ago";
import { SHOW_COMMENTS } from "@/app/lib/release";
import { CLASS_COLORS, decodeCharacter, portraitSrc, realmTag, type Character } from "@/app/lib/character";

interface ForumPost {
  id: number;
  number: number;
  author: string;
  authorTitle: string;
  avatar: string;
  date: string;
  updated?: string;
  staff: boolean;
  url: string;
  html: string;
}

interface Topic {
  id: number;
  title: string;
  slug: string;
  url: string;
  context: ForumPost | null;
  posts: ForumPost[];
}

interface ShownCharacter {
  name: string;
  realm: string;
  classToken: string;
  raceToken: string;
  level: number;
  faction: string;
  sex?: number;
}

/** A character on the signed-in user's own list. */
interface OwnCharacter extends ShownCharacter {
  id: number;
}

/** The signed-in user. Their Discord name and avatar reach only them. */
interface Me {
  id: string;
  name: string;
  avatar: string;
  admin: boolean;
  banned: boolean;
  characters: OwnCharacter[];
  active: number | null;
}

interface Comment {
  id: number;
  body: string;
  date: string;
  character: ShownCharacter | null;
  /** The Discord account behind it: only in an admin's copy. */
  user?: { id: string; name: string; avatar: string };
  mine: boolean;
  reported: boolean;
  hidden?: number;
  reports?: number;
  banned?: boolean;
  /** Admins: why the word filter hid it ("slur": the author was banned; "review": held). */
  flag?: "slur" | "review" | null;
  /** Held by the word filter: only in its author's (and admins') copy. */
  held?: boolean;
}

/** The blue posts shown before "Show N more". */
const FIRST_POSTS = 3;
const MAX_LEN = 1500;
/** Characters one account can keep (worker/auth.js). */
const MAX_CHARACTERS = 10;
const NO_PORTRAIT = "/journal/ui/forever-icon.png";
/** The character page's saved code (CharacterPanel's STORAGE_KEY). */
const CHARACTER_KEY = "dj.character.code";

function topicFromPath(): number | null {
  const m = /\/blue\/(\d{1,10})/.exec(window.location.pathname);
  return m ? Number(m[1]) : null;
}

async function send(method: string, url: string, body?: unknown): Promise<{ ok: boolean; data: Record<string, unknown> }> {
  try {
    const r = await fetch(url, {
      method,
      headers: { "X-DJ": "1", ...(body !== undefined ? { "Content-Type": "application/json" } : {}) },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    const data = (await r.json().catch(() => ({}))) as Record<string, unknown>;
    return { ok: r.ok, data };
  } catch {
    return { ok: false, data: {} };
  }
}

function PostMeta({ p, label }: { p: ForumPost; label?: string }) {
  const t = useT();
  const lang = useLang();
  return (
    <div className="bpp-meta">
      {p.avatar && <img src={p.avatar} alt="" width={40} height={40} className="bpp-avatar" />}
      <div className="bpp-who">
        {label && <span className="bpp-label">{label}</span>}
        <span className={p.staff ? "bpp-author bpp-blue" : "bpp-author"}>{p.author}</span>
        {p.authorTitle && <span className="bpp-role">{p.authorTitle}</span>}
      </div>
      <a href={p.url} target="_blank" rel="noreferrer noopener" className="bpp-when" title={new Date(p.date).toLocaleString(lang)}>
        {ago(p.date, lang)}
        {p.updated && <span className="bpp-edited"> · {t.or("s_bp_edited", "edited")}</span>}
      </a>
    </div>
  );
}

function ForumPostView({ p, label }: { p: ForumPost; label?: string }) {
  return (
    <section className={p.staff ? "bpp-post" : "bpp-post bpp-context"}>
      <PostMeta p={p} label={label} />
      {/* The Worker cleaned this HTML: plain elements, links and images only. */}
      <div className="bpp-body" dangerouslySetInnerHTML={{ __html: p.html }} />
    </section>
  );
}

/** "Thrall · Lv 60 Shaman · EU PvP", the character a commenter shows. */
function CharacterBadge({ c }: { c: ShownCharacter }) {
  const t = useT();
  const cls = t.or(`CLASS_${c.classToken}`, c.classToken.charAt(0) + c.classToken.slice(1).toLowerCase());
  const realm = realmTag(c.realm) || c.realm;
  return (
    <span className="bpc-char">
      <span className="bpc-char-name" style={{ color: CLASS_COLORS[c.classToken] }}>{c.name}</span>
      <span className="bpc-char-info">
        {t.or("LEVEL_SHORT", "Lv")} {c.level} {cls}
        {realm ? ` · ${realm}` : ""}
      </span>
    </span>
  );
}

function asCharacter(c: ShownCharacter): Character {
  return { ...c, faction: (c.faction as Character["faction"]) || "Unknown" } as unknown as Character;
}

/** Why a comment is hidden, for admins. */
function flagText(t: ReturnType<typeof useT>, c: { flag?: string | null; reports?: number }) {
  if (c.flag === "slur") return t.or("s_bp_flag_slur", "Slur: author banned automatically");
  if (c.flag === "review") return t.or("s_bp_flag_review", "Held by the word filter: restore or delete");
  return `${t.or("s_bp_hidden", "Hidden after reports")} (${c.reports ?? 0})`;
}

interface QueueItem {
  id: number;
  topicId: number;
  body: string;
  flag: "slur" | "review" | null;
  reports: number;
  date: string;
}

/**
 * Admins: hidden comments on any thread that wait for a decision (held by
 * the word filter, or hidden by reports), each linking to its thread.
 */
function ModerationQueue({ refresh }: { refresh: unknown }) {
  const t = useT();
  const h = useHref();
  const lang = useLang();
  const [items, setItems] = useState<QueueItem[]>([]);
  useEffect(() => {
    fetch("/api/admin/queue")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setItems(d?.queue ?? []))
      .catch(() => setItems([]));
  }, [refresh]);
  if (!items.length) return null;
  return (
    <div className="bpc-queue">
      <p className="bpc-queue-title">
        {t.or("s_bp_queue", "Waiting for your decision")} <span className="bpc-count">{items.length}</span>
      </p>
      <ul>
        {items.map((q) => (
          <li key={q.id}>
            <a href={`${h(`/blue/${q.topicId}`)}#c-${q.id}`}>
              <span className="bpc-flag">{flagText(t, q)}</span> · {ago(q.date, lang)}
              <span className="bpc-queue-body">{q.body}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CommentView({
  c,
  me,
  onDelete,
  onReport,
  onBan,
  onRestore,
}: {
  c: Comment;
  me: Me | null;
  onDelete: (c: Comment) => void;
  onReport: (c: Comment) => void;
  onBan: (c: Comment, ban: boolean) => void;
  onRestore: (c: Comment) => void;
}) {
  const t = useT();
  const lang = useLang();
  const portrait = c.character ? portraitSrc(asCharacter(c.character)) : null;
  return (
    <li id={`c-${c.id}`} className={`bpc${c.hidden || c.held ? " bpc-hidden" : ""}${c.banned ? " bpc-banned" : ""}`}>
      <img src={portrait || NO_PORTRAIT} alt="" width={40} height={40} className="bpc-avatar" />
      <div className="bpc-main">
        <div className="bpc-head">
          {c.character ? <CharacterBadge c={c.character} /> : <span className="bpc-char-name">?</span>}
          {c.user && (
            <span className="bpc-discord bpc-admin-only" title={t.or("s_bp_admin_only", "Only admins see this")}>
              {c.user.avatar && <img src={c.user.avatar} alt="" width={16} height={16} />}
              {c.user.name}
            </span>
          )}
          <time className="bpc-when" dateTime={c.date} title={new Date(c.date).toLocaleString(lang)}>
            {ago(c.date, lang)}
          </time>
        </div>
        {(c.hidden || c.banned) && me?.admin ? (
          <p className="bpc-flag">
            {c.hidden ? <>{flagText(t, c)} </> : null}
            {c.banned && c.flag !== "slur" ? t.or("s_bp_banned_tag", "Banned") : ""}
          </p>
        ) : c.held && c.mine ? (
          <p className="bpc-flag">{t.or("s_bp_held_tag", "Waiting for a moderator · only you can see it")}</p>
        ) : null}
        <p className="bpc-body">{c.body}</p>
        <div className="bpc-actions">
          {me && !c.mine && !me.banned && (
            <button type="button" onClick={() => onReport(c)} disabled={c.reported}>
              {c.reported ? t.or("s_bp_reported", "Reported") : t.or("s_bp_report", "Report")}
            </button>
          )}
          {me && (c.mine || me.admin) && (
            <button type="button" onClick={() => onDelete(c)}>{t.or("s_bp_delete", "Delete")}</button>
          )}
          {me?.admin && c.hidden ? (
            <button type="button" onClick={() => onRestore(c)}>{t.or("s_bp_restore", "Restore")}</button>
          ) : null}
          {me?.admin && !c.mine && c.user && (
            <button type="button" className="bpc-danger" onClick={() => onBan(c, !c.banned)}>
              {c.banned ? t.or("s_bp_unban", "Unban") : t.or("s_bp_ban", "Ban")}
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

/**
 * Add a character: the one saved on My Character, or a pasted /dj export
 * code. onSave answers with an error code, or null when it was added.
 */
function CharacterPicker({
  onSave,
  onCancel,
}: {
  onSave: (c: ShownCharacter) => Promise<string | null>;
  /** Absent when there is no character yet: one is needed to comment. */
  onCancel?: () => void;
}) {
  const t = useT();
  const [code, setCode] = useState("");
  const [saved, setSaved] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      setSaved(window.localStorage.getItem(CHARACTER_KEY) ?? "");
    } catch {
      setSaved("");
    }
  }, []);

  const use = async (raw: string) => {
    setBusy(true);
    setError("");
    const r = await decodeCharacter(raw.trim());
    if (!r.ok) {
      setError(t.or("s_bp_char_bad", "That code could not be read."));
      setBusy(false);
      return;
    }
    const c = r.character;
    const failed = await onSave({
      name: c.name,
      realm: c.realm,
      classToken: c.classToken,
      raceToken: c.raceToken,
      level: c.level,
      faction: c.faction,
      ...(c.sex ? { sex: c.sex } : {}),
    });
    if (failed) {
      setError(t.or(`s_bp_err_${failed}`, t.or("s_bp_char_bad", "That code could not be read.")));
      setBusy(false);
    }
  };

  return (
    <div className="bpc-picker">
      {!onCancel && <p className="bpc-required">{t.or("s_bp_char_required", "To comment, add your character.")}</p>}
      <p className="bpc-note">{t.or("s_bp_char_note", "")}</p>
      {saved && (
        <button type="button" className="bpc-btn bpc-btn-gold" disabled={busy} onClick={() => use(saved)}>
          {t.or("s_bp_char_saved", "Use my character from My Character")}
        </button>
      )}
      <label className="bpc-paste">
        <span>{t.or("s_bp_char_paste", "Or paste your /dj export code:")}</span>
        <textarea value={code} onChange={(e) => setCode(e.target.value)} rows={2} spellCheck={false} />
      </label>
      {error && <p className="bpc-error" role="alert">{error}</p>}
      <div className="bpc-row">
        <button type="button" className="bpc-btn" disabled={busy || !code.trim()} onClick={() => use(code)}>
          {t.or("s_bp_char_use", "Use this code")}
        </button>
        {onCancel && (
          <button type="button" className="bpc-link" onClick={onCancel}>{t.or("s_bp_char_cancel", "Cancel")}</button>
        )}
      </div>
    </div>
  );
}

/** The user's saved characters: pick the one to comment as, remove one, or add another. */
function CharacterSwitcher({
  me,
  onSelect,
  onRemove,
  onAdd,
  onClose,
}: {
  me: Me;
  onSelect: (c: OwnCharacter) => void;
  onRemove: (c: OwnCharacter) => void;
  onAdd: (c: ShownCharacter) => Promise<string | null>;
  onClose: () => void;
}) {
  const t = useT();
  const [adding, setAdding] = useState(false);
  return (
    <div className="bpc-picker">
      <p className="bpc-note">{t.or("s_bp_char_pick", "Comment as:")}</p>
      <ul className="bpc-chars">
        {me.characters.map((c) => (
          <li key={c.id} className={c.id === me.active ? "bpc-charrow is-active" : "bpc-charrow"}>
            <button type="button" className="bpc-charpick" aria-pressed={c.id === me.active} onClick={() => onSelect(c)}>
              <img src={portraitSrc(asCharacter(c)) || NO_PORTRAIT} alt="" width={32} height={32} className="bpc-avatar" />
              <CharacterBadge c={c} />
            </button>
            <button type="button" className="bpc-link" onClick={() => onRemove(c)}>{t.or("s_bp_char_remove", "Remove")}</button>
          </li>
        ))}
      </ul>
      {adding ? (
        <CharacterPicker
          onSave={async (c) => {
            const failed = await onAdd(c);
            if (!failed) setAdding(false);
            return failed;
          }}
          onCancel={() => setAdding(false)}
        />
      ) : (
        <div className="bpc-row">
          <button type="button" className="bpc-btn" disabled={me.characters.length >= MAX_CHARACTERS} onClick={() => setAdding(true)}>
            {t.or("s_bp_char_add_another", "Add another character")}
          </button>
          <button type="button" className="bpc-link" onClick={onClose}>{t.or("s_bp_char_done", "Done")}</button>
        </div>
      )}
    </div>
  );
}

function Comments({ topicId }: { topicId: number }) {
  const t = useT();
  const [me, setMe] = useState<Me | null>(null);
  const [loginAvailable, setLoginAvailable] = useState(false);
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [picking, setPicking] = useState(false);

  const errorText = useCallback(
    (code: unknown) => t.or(`s_bp_err_${String(code || "generic")}`, t.or("s_bp_err_generic", "Something went wrong. Try again.")),
    [t],
  );

  const load = useCallback(async () => {
    const [m, c] = await Promise.all([
      fetch("/api/me").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch(`/api/blue/${topicId}/comments`).then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ]);
    setMe(m?.user ?? null);
    setLoginAvailable(Boolean(m?.loginAvailable));
    setComments(c?.comments ?? []);
  }, [topicId]);

  // A link to one comment (#c-12, from the moderation list): scroll to it once the comments are in.
  useEffect(() => {
    if (comments?.length && /^#c-\d+$/.test(window.location.hash)) {
      document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ block: "center" });
    }
  }, [comments]);

  useEffect(() => {
    load();
    // Back from Discord: ?login=failed (or cancelled), said once, then taken out of the address.
    const params = new URLSearchParams(window.location.search);
    if (params.get("login") === "failed" || params.get("login") === "expired") setError(t.or("s_bp_login_failed", ""));
    if (params.has("login")) {
      params.delete("login");
      const q = params.toString();
      window.history.replaceState(null, "", `${window.location.pathname}${q ? `?${q}` : ""}${window.location.hash}`);
    }
  }, [load, t]);

  const post = async () => {
    const body = draft.trim();
    if (body.length < 2) return setError(errorText("empty"));
    setBusy(true);
    setError("");
    const r = await send("POST", `/api/blue/${topicId}/comments`, { body });
    setBusy(false);
    if (!r.ok) {
      setError(errorText(r.data.error));
      // Banned by the word filter just now: also signed out.
      if (r.data.error === "banned") load();
      return;
    }
    setDraft("");
    const added = r.data.comment as Comment;
    setComments((list) => [...(list ?? []), added]);
    if (added.held) setError(t.or("s_bp_held", "Your comment is waiting for a moderator."));
  };

  const remove = async (c: Comment) => {
    if (!window.confirm(t.or("s_bp_delete_confirm", "Delete this comment?"))) return;
    const r = await send("DELETE", `/api/comments/${c.id}`);
    if (r.ok) setComments((list) => (list ?? []).filter((x) => x.id !== c.id));
    else setError(errorText(r.data.error));
  };
  const report = async (c: Comment) => {
    if (!window.confirm(t.or("s_bp_report_confirm", "Report this comment?"))) return;
    const r = await send("POST", `/api/comments/${c.id}/report`);
    if (r.ok) setComments((list) => (list ?? []).map((x) => (x.id === c.id ? { ...x, reported: true } : x)));
    else setError(errorText(r.data.error));
  };
  const ban = async (c: Comment, banned: boolean) => {
    if (!c.user) return;
    if (banned && !window.confirm(t("s_bp_ban_confirm", c.user.name))) return;
    const r = await send("POST", `/api/users/${c.user.id}/${banned ? "ban" : "unban"}`);
    if (r.ok) load();
    else setError(errorText(r.data.error));
  };
  const restore = async (c: Comment) => {
    const r = await send("POST", `/api/comments/${c.id}/restore`);
    if (r.ok) load();
    else setError(errorText(r.data.error));
  };
  const addCharacter = async (c: ShownCharacter): Promise<string | null> => {
    const r = await send("POST", "/api/me/characters", c);
    if (!r.ok) return String(r.data.error || "bad_character");
    setMe((r.data.user as Me) ?? null);
    setPicking(false);
    return null;
  };
  const selectCharacter = async (c: OwnCharacter) => {
    const r = await send("PUT", "/api/me/character", { id: c.id });
    if (!r.ok) return setError(errorText(r.data.error));
    setMe((r.data.user as Me) ?? null);
    setPicking(false);
  };
  const removeCharacter = async (c: OwnCharacter) => {
    if (!window.confirm(t("s_bp_char_remove_confirm", c.name))) return;
    const r = await send("DELETE", `/api/me/characters/${c.id}`);
    if (!r.ok) return setError(errorText(r.data.error));
    const next = (r.data.user as Me) ?? null;
    setMe(next);
    if (!next?.characters.length) setPicking(false);
  };
  const signOut = async () => {
    await send("POST", "/api/auth/logout");
    setMe(null);
    load();
  };
  const deleteAccount = async () => {
    if (!window.confirm(t.or("s_bp_account_delete_confirm", "Delete your account and all your comments?"))) return;
    const r = await send("DELETE", "/api/me");
    if (r.ok) {
      setMe(null);
      load();
    } else setError(errorText(r.data.error));
  };

  const loginHref = `/api/auth/login?return=${encodeURIComponent(typeof window === "undefined" ? "/" : window.location.pathname)}`;
  const count = comments?.filter((c) => !c.hidden && !c.banned).length ?? 0;
  const active = me?.characters.find((c) => c.id === me.active) ?? null;

  return (
    <section className="bpc-wrap" aria-labelledby="bpc-title">
      <h2 id="bpc-title" className="bpc-title">
        {t.or("s_bp_comments", "Comments")}
        {count > 0 && <span className="bpc-count">{count}</span>}
      </h2>

      {me ? (
        <div className="bpc-compose">
          <div className="bpc-me">
            <img
              src={(active && portraitSrc(asCharacter(active))) || NO_PORTRAIT}
              alt=""
              width={40}
              height={40}
              className="bpc-avatar"
            />
            <div className="bpc-me-who">
              {active ? <CharacterBadge c={active} /> : null}
              <span className="bpc-discord" title={t.or("s_bp_only_you", "Only you can see this.")}>
                {me.avatar && <img src={me.avatar} alt="" width={16} height={16} />}
                {t("s_bp_you_are", me.name)}
              </span>
            </div>
            <div className="bpc-me-actions">
              {active && !me.banned && (
                <button type="button" className="bpc-link" onClick={() => setPicking((v) => !v)} aria-expanded={picking}>
                  {t.or("s_bp_char_change", "Change character")}
                </button>
              )}
              <button type="button" className="bpc-link" onClick={signOut}>{t.or("s_bp_signout", "Sign out")}</button>
            </div>
          </div>
          {me.banned ? (
            <p className="bpc-error">{errorText("banned")}</p>
          ) : !active ? (
            <CharacterPicker onSave={addCharacter} />
          ) : (
            <>
              {picking && (
                <CharacterSwitcher
                  me={me}
                  onSelect={selectCharacter}
                  onRemove={removeCharacter}
                  onAdd={addCharacter}
                  onClose={() => setPicking(false)}
                />
              )}
            <>
              <textarea
                className="bpc-input"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={t.or("s_bp_placeholder", "Write a comment…")}
                maxLength={MAX_LEN}
                rows={3}
                aria-label={t.or("s_bp_placeholder", "Write a comment…")}
              />
              <div className="bpc-row">
                <span className="bpc-len">{draft.length > MAX_LEN - 200 ? `${draft.length}/${MAX_LEN}` : ""}</span>
                <button type="button" className="bpc-btn bpc-btn-gold" disabled={busy || draft.trim().length < 2} onClick={post}>
                  {busy ? t.or("s_bp_posting", "Posting…") : t.or("s_bp_post", "Post")}
                </button>
              </div>
            </>
            </>
          )}
          {error && <p className="bpc-error" role="alert">{error}</p>}
        </div>
      ) : (
        <div className="bpc-signin">
          {loginAvailable ? (
            <>
              <a href={loginHref} className="bpc-discord-btn">
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M20.3 4.4A19.6 19.6 0 0 0 15.4 3l-.6 1.3a18 18 0 0 0-5.6 0L8.6 3a19.5 19.5 0 0 0-4.9 1.5C.6 9.1-.3 13.6.1 18a19.8 19.8 0 0 0 6 3l1.3-2.1a12.8 12.8 0 0 1-2-1l.5-.4a14 14 0 0 0 12.2 0l.5.4-2 1 1.3 2.1a19.7 19.7 0 0 0 6-3c.5-5.1-.8-9.6-3.6-13.6ZM8 15.3c-1.2 0-2.2-1.1-2.2-2.4S6.8 10.5 8 10.5s2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Zm8 0c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Z"
                  />
                </svg>
                {t.or("s_bp_signin", "Sign in with Discord to comment")}
              </a>
              <p className="bpc-note">{t.or("s_bp_signin_note", "")}</p>
            </>
          ) : (
            <p className="bpc-note">{t.or("s_bp_signin_soon", "Comments open soon.")}</p>
          )}
          {error && <p className="bpc-error" role="alert">{error}</p>}
        </div>
      )}

      {me?.admin && <ModerationQueue refresh={comments} />}

      {comments === null ? null : comments.length === 0 ? (
        <p className="bpc-empty">{t.or("s_bp_no_comments", "No comments yet. Be the first.")}</p>
      ) : (
        <ol className="bpc-list">
          {comments.map((c) => (
            <CommentView key={c.id} c={c} me={me} onDelete={remove} onReport={report} onBan={ban} onRestore={restore} />
          ))}
        </ol>
      )}

      {me && (
        <p className="bpc-account">
          <button type="button" className="bpc-link" onClick={deleteAccount}>{t.or("s_bp_account_delete", "Delete my account")}</button>
        </p>
      )}
    </section>
  );
}

export default function BluePostView() {
  const t = useT();
  const h = useHref();
  const [topicId, setTopicId] = useState<number | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "missing" | "unavailable">("loading");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const id = topicFromPath();
    setTopicId(id);
    if (!id) {
      setState("missing");
      return;
    }
    fetch(`/api/blue/${id}`)
      .then(async (r) => {
        if (r.status === 404) return setState("missing");
        if (!r.ok) return setState("unavailable");
        const data = (await r.json()) as Topic;
        setTopic(data);
        setState("ok");
        document.title = `${data.title} - ${t.or("s_bp_title", "Blue Post")} - Dungeon Journal`;
      })
      .catch(() => setState("unavailable"));
  }, [t]);

  const posts = useMemo(() => topic?.posts ?? [], [topic]);
  const shown = showAll ? posts : posts.slice(0, FIRST_POSTS);

  return (
    <div className="sx-wrap bpp">
      <nav className="bpp-crumb" aria-label="Breadcrumb">
        <a href={h("/")}>Dungeon Journal</a>
        <span aria-hidden="true">/</span>
        <span>{t.or("s_blue_title", "Blue Posts")}</span>
      </nav>

      {state === "loading" && <p className="bpp-status">{t.or("s_bp_loading", "Loading…")}</p>}
      {state === "missing" && <p className="bpp-status">{t.or("s_bp_missing", "This post could not be found.")}</p>}
      {state === "unavailable" && <p className="bpp-status">{t.or("s_bp_unavailable", "Blizzard's forum could not be reached.")}</p>}

      {topic && state === "ok" && (
        <>
          <article className="bpp-article">
            <header className="bpp-header">
              <p className="bpp-kicker">{t.or("s_bp_title", "Blue Post")}</p>
              <h1 className="bpp-title">{topic.title}</h1>
            </header>
            {topic.context && <ForumPostView p={topic.context} label={t.or("s_bp_original", "Original post")} />}
            {shown.map((p) => (
              <ForumPostView key={p.id} p={p} />
            ))}
            {!showAll && posts.length > FIRST_POSTS && (
              <button type="button" className="bpp-more" onClick={() => setShowAll(true)}>
                {t("s_bp_more", posts.length - FIRST_POSTS)}
              </button>
            )}
            <footer className="bpp-source">
              <p>
                <strong>{t.or("s_bp_source", "Source")}:</strong> {t.or("s_bp_source_text", "")}
              </p>
              <a href={topic.url} target="_blank" rel="noreferrer noopener" className="bpp-source-link">
                {t.or("s_bp_view_thread", "Read the whole thread on the forum")} ↗
              </a>
            </footer>
          </article>
          {SHOW_COMMENTS && topicId && <Comments topicId={topicId} />}
        </>
      )}
    </div>
  );
}
