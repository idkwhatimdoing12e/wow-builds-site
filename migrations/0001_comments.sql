-- Comments on blue posts (worker/comments.js), and the Discord accounts that
-- write them (worker/auth.js).
--
-- Readers see a comment's character only. The Discord account behind it is
-- kept for sign-in and moderation, and shown to admins alone.

CREATE TABLE users (
  id TEXT PRIMARY KEY,               -- Discord user ID
  name TEXT NOT NULL,                -- Discord display name (never shown to other readers)
  avatar TEXT,                       -- Discord avatar URL (likewise)
  created_at INTEGER NOT NULL,       -- first sign-in, ms
  banned INTEGER NOT NULL DEFAULT 0,
  active_character INTEGER           -- characters.id they comment as
);

-- Characters added from /dj export codes. A code proves nothing, so one name
-- and realm (claim) belongs to the first account that adds it, and to no other.
CREATE TABLE characters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  claim TEXT NOT NULL UNIQUE,        -- lower(name) || '|' || lower(realm)
  name TEXT NOT NULL,
  realm TEXT NOT NULL DEFAULT '',
  class TEXT NOT NULL,
  race TEXT,
  level INTEGER NOT NULL,
  faction TEXT,
  sex INTEGER,
  removed INTEGER NOT NULL DEFAULT 0, -- 1: taken off their list; kept for old comments and the claim
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX characters_user ON characters (user_id);

CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,       -- SHA-256 of the cookie's token
  user_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX sessions_user ON sessions (user_id);

CREATE TABLE comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  topic_id INTEGER NOT NULL,         -- the forum thread
  user_id TEXT NOT NULL,
  character_id INTEGER NOT NULL,     -- the character it was written as
  body TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  hidden INTEGER NOT NULL DEFAULT 0, -- 1: hidden by reports until an admin looks
  reports INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX comments_topic ON comments (topic_id, created_at);
CREATE INDEX comments_user ON comments (user_id, created_at);

CREATE TABLE reports (
  comment_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (comment_id, user_id)
);
CREATE INDEX reports_user ON reports (user_id);
