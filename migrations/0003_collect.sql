-- What the Dungeon Journal Companion app sends in from players' games
-- (worker/collect.js). Only dungeon and raid data, no character names or
-- realms. Each install of the app has a random ID; blocking one hides its data.

CREATE TABLE collect_installs (
  id TEXT PRIMARY KEY,               -- the app's random install ID
  app TEXT,                          -- app version
  first_seen INTEGER NOT NULL,       -- ms
  last_seen INTEGER NOT NULL,
  uploads INTEGER NOT NULL DEFAULT 0,
  records INTEGER NOT NULL DEFAULT 0,
  window_start INTEGER NOT NULL DEFAULT 0, -- rate limit: uploads since this time
  window_count INTEGER NOT NULL DEFAULT 0,
  blocked INTEGER NOT NULL DEFAULT 0
);

-- A corpse (or a chest/object) opened inside an instance, once per GUID
-- however many group members send it; its items are in collect_drops.
CREATE TABLE collect_corpses (
  guid TEXT PRIMARY KEY,
  npc INTEGER NOT NULL,              -- creature ID, or object ID when object = 1
  object INTEGER NOT NULL DEFAULT 0,
  map INTEGER NOT NULL,              -- instance map ID
  difficulty INTEGER,
  money INTEGER NOT NULL DEFAULT 0,  -- it had coins
  install TEXT NOT NULL,             -- first install that sent it
  t INTEGER NOT NULL                 -- seconds (game time)
);
CREATE INDEX collect_corpses_npc ON collect_corpses (npc, object);

CREATE TABLE collect_drops (
  guid TEXT NOT NULL,
  item INTEGER NOT NULL,
  qty INTEGER NOT NULL,
  PRIMARY KEY (guid, item)
);
CREATE INDEX collect_drops_item ON collect_drops (item);

-- A death the addon's run log counted (the drop chance's number of kills).
CREATE TABLE collect_kills (
  guid TEXT PRIMARY KEY,
  npc INTEGER NOT NULL,
  map INTEGER NOT NULL,
  difficulty INTEGER,
  boss INTEGER NOT NULL DEFAULT 0,
  install TEXT NOT NULL,
  t INTEGER NOT NULL
);
CREATE INDEX collect_kills_npc ON collect_kills (npc);

-- Creature levels and ranks as the client shows them (-1: "??", a boss).
CREATE TABLE collect_units (
  npc INTEGER NOT NULL,
  level INTEGER NOT NULL,
  rank TEXT,
  map INTEGER,
  hostile INTEGER,
  seen INTEGER NOT NULL DEFAULT 1,
  install TEXT NOT NULL,
  PRIMARY KEY (npc, level)
);

-- Each sighting behind collect_units.seen, once: an upload sent again (the
-- app retries until the server answers) changes nothing. Level is in the key:
-- a pack at levels 28 and 29 is often seen in the same second.
CREATE TABLE collect_sightings (
  install TEXT NOT NULL,
  npc INTEGER NOT NULL,
  level INTEGER NOT NULL,
  t INTEGER NOT NULL,
  PRIMARY KEY (install, npc, level, t)
);

-- Creature names in each client language.
CREATE TABLE collect_names (
  npc INTEGER NOT NULL,
  locale TEXT NOT NULL,
  name TEXT NOT NULL,
  PRIMARY KEY (npc, locale)
);

-- Quest records as sent: qa (accepted: giver, level, objectives, rewards),
-- qt (handed in: turn-in NPC, rewards, XP and money given), qo (moved on
-- inside an instance). data is the record's JSON.
CREATE TABLE collect_quests (
  quest INTEGER NOT NULL,
  kind TEXT NOT NULL,
  locale TEXT,
  install TEXT NOT NULL,
  t INTEGER NOT NULL,
  data TEXT NOT NULL,
  UNIQUE (install, quest, kind, t)
);
CREATE INDEX collect_quests_quest ON collect_quests (quest, kind);
