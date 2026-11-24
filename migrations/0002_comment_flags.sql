-- Why a comment is hidden, when the word filter hid it (worker/wordfilter.js):
-- 'slur' (written plainly; the account was banned) or 'review' (disguised;
-- held until an admin restores or deletes it). NULL for everything else,
-- including comments hidden by readers' reports.
ALTER TABLE comments ADD COLUMN flag TEXT;
CREATE INDEX comments_hidden ON comments (hidden, created_at);
