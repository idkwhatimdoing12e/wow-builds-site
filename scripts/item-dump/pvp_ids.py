"""Every item ID on the PvP pages (data/journal.json "PVP"), for make-ids.py,
tier-items.py and the icon and tooltip fetches.

- The battlegrounds' rewards: each entry is { name, quality, itemID, level,
  itemID, level, ... } (a list, or a dict once it carries `choice` / `quest`).
- Alterac Valley's quests: the items they give, offer and take.
- Honor & Ranks: the Premier sets ({ slot, rare, epic } per piece), the
  seals, the rank rewards, the rank 14 weapons, the Marks, the arena's items.
"""


def _entry_ids(entry):
    if isinstance(entry, dict):
        keys = sorted(int(k) for k in entry if k.isdigit())
        entry = [entry[str(k)] for k in keys]
    if not isinstance(entry, list) or len(entry) < 3 or not isinstance(entry[0], str):
        return []
    return [x for x in entry[2::2] if isinstance(x, int)]


def pvp_item_ids(journal):
    pvp = journal.get("PVP") or {}
    ids = set()
    for sides in (pvp.get("rewards") or {}).values():
        for side in sides.values():
            for key, value in side.items():
                if key in ("vendor", "faction", "factionName", "quests") or not isinstance(value, list):
                    continue
                for entry in value:
                    ids.update(_entry_ids(entry))
    for info in (pvp.get("quest_info") or {}).values():
        for key in ("items", "choice"):
            ids.update(int(i) for i in info.get(key) or [])
        if info.get("need"):
            ids.add(int(info["need"]))
    honor = pvp.get("honor") or {}
    for classes in (honor.get("sets") or {}).values():
        for lines in classes.values():
            for line in lines:
                for piece in line[1:]:
                    ids.update(int(i) for i in piece[1:3])
    for seal in (honor.get("seals") or {}).values():
        ids.add(int(seal[0]))
    for ranks in (honor.get("ranks") or {}).values():
        for items in ranks.values():
            ids.update(int(it[0]) for it in items)
    for weapons in (honor.get("weapons") or {}).values():
        ids.update(int(w[0]) for w in weapons)
    ids.update(int(i) for i in honor.get("marks") or [])
    ids.update(int(i) for i in honor.get("arena") or [])
    return {i for i in ids if i > 0}
