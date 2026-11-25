"""Write DJItemDump/ItemIDs.lua: every item ID in data/journal.json.

Run after regenerating the journal data, before /djdump in game:

    python scripts/item-dump/make-ids.py

It collects IDs from boss and trash loot, shared loot, quest rewards and the
items quests start with, need or hand out. A few extra IDs do no harm: the
site only shows tooltips for items that have a page.
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from pvp_ids import pvp_item_ids  # noqa: E402
ROOT = os.path.dirname(os.path.dirname(HERE))
JOURNAL = os.path.join(ROOT, "data", "journal.json")
OUT = os.path.join(HERE, "DJItemDump", "ItemIDs.lua")

ITEM_KEYS = {
    "loot", "rewardItems", "additionalRewardItems", "noteRewardItems",
    "startItem", "noteItem", "requiredItems", "requiredItem", "providedItem", "items",
}


def first_id(entry):
    """An item tuple is a list [id, name, ...] or a Lua-style dict {"1": id, ...}."""
    if isinstance(entry, list) and entry and isinstance(entry[0], (int, float)):
        return int(entry[0])
    if isinstance(entry, dict) and isinstance(entry.get("1"), (int, float)):
        return int(entry["1"])
    return None


def collect(node, ids, under_item_key=False):
    if isinstance(node, dict):
        if under_item_key:
            i = first_id(node)
            if i:
                ids.add(i)
                return
        for k, v in node.items():
            collect(v, ids, under_item_key or k in ITEM_KEYS)
    elif isinstance(node, list):
        if under_item_key:
            i = first_id(node)
            if i and len(node) > 1 and isinstance(node[1], str):
                ids.add(i)
                return
        for v in node:
            collect(v, ids, under_item_key)


def main():
    with open(JOURNAL, encoding="utf-8") as f:
        journal = json.load(f)
    ids = set()
    collect(journal.get("DB", {}), ids)
    collect(journal.get("SHARED_BY_BOSS", {}), ids, True)
    collect(journal.get("QUEST_PREREQ_DETAILS", {}), ids)
    collect(journal.get("PREREQ_REWARD_ITEMS_FALLBACK", {}), ids)
    # Tier Sets: the pieces are bare IDs (Tier 0.5's are Forever's own items, in no loot list).
    tier = journal.get("TIER_SETS") or {}
    for s in (tier.get("tier0") or {}).values():
        ids.update(int(i) for i in s.get("items", []))
    for s in (tier.get("tier05") or {}).values():
        for v in s.get("versions", []):
            ids.update(int(i) for i in v.get("items", []))
    # PvP: the battlegrounds' rewards, Alterac Valley's quests, Honor & Ranks.
    ids.update(pvp_item_ids(journal))
    ids = sorted(i for i in ids if i > 0)
    lines = ["-- Written by scripts/item-dump/make-ids.py: do not edit.", "DJItemDump_IDS = {"]
    for n in range(0, len(ids), 12):
        lines.append("    " + ", ".join(str(i) for i in ids[n:n + 12]) + ",")
    lines.append("}")
    with open(OUT, "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(lines) + "\n")
    print(f"wrote {len(ids)} item IDs to {OUT}")


if __name__ == "__main__":
    main()
