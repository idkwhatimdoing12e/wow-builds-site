-- Item names and rarity as players' loot windows show them, per client
-- language (worker/collect.js). install: the last install that changed it.
CREATE TABLE collect_items (
  item INTEGER NOT NULL,
  locale TEXT NOT NULL,
  name TEXT,
  quality INTEGER,                   -- 0 poor, 1 common, 2 uncommon, 3 rare, 4 epic, 5 legendary, -1 unknown
  install TEXT,
  PRIMARY KEY (item, locale)
);
