"""Write data/item-slots.json: each journal item's slot and type ("One-Hand, Mace").

    python scripts/item-dump/item-slots.py [build]

Read from the WoW Forever client's Item table (class, subclass, inventory
type) as wago.tools publishes it, worded like the addon's loot lists. The site
uses it for items the loot lists give no slot (quest rewards, mostly).
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from importlib import import_module  # noqa: E402

fetch = import_module("fetch-icons")

ROOT = fetch.ROOT
OUT = os.path.join(ROOT, "data", "item-slots.json")

SLOT = {
    1: "Head", 2: "Neck", 3: "Shoulder", 4: "Shirt", 5: "Chest", 6: "Waist", 7: "Legs", 8: "Feet",
    9: "Wrist", 10: "Hands", 11: "Finger", 12: "Trinket", 13: "One-Hand", 14: "Off Hand", 15: "Ranged",
    16: "Back", 17: "Two-Hand", 18: "Bag", 19: "Tabard", 20: "Chest", 21: "Main Hand", 22: "Off Hand",
    23: "Held In Off-hand", 24: "Ammo", 25: "Thrown", 26: "Ranged", 28: "Relic",
}
WEAPON = {
    0: "Axe", 1: "Axe", 2: "Bow", 3: "Gun", 4: "Mace", 5: "Mace", 6: "Polearm", 7: "Sword", 8: "Sword",
    10: "Staff", 13: "Fist Weapon", 14: "Miscellaneous", 15: "Dagger", 16: "Thrown", 17: "Spear",
    18: "Crossbow", 19: "Wand", 20: "Fishing Pole",
}
ARMOR = {1: "Cloth", 2: "Leather", 3: "Mail", 4: "Plate", 6: "Shield", 7: "Libram", 8: "Idol", 9: "Totem"}
RECIPE = {
    0: "Book", 1: "Leatherworking", 2: "Tailoring", 3: "Engineering", 4: "Blacksmithing", 5: "Cooking",
    6: "Alchemy", 7: "First Aid", 8: "Enchanting", 9: "Fishing", 10: "Jewelcrafting",
}
WEAPON_CLASS, ARMOR_CLASS, RECIPE_CLASS, QUEST_CLASS = 2, 4, 9, 12


def slot_text(cls, sub, inv):
    if cls == WEAPON_CLASS:
        left, right = SLOT.get(inv), WEAPON.get(sub)
        if left == right:  # thrown weapons: "Thrown", not "Thrown, Thrown"
            right = None
        return ", ".join(x for x in (left, right) if x) or None
    if cls == ARMOR_CLASS:
        left = SLOT.get(inv)
        right = ARMOR.get(sub)
        return ", ".join(x for x in (left, right) if x) or None
    if cls == RECIPE_CLASS:
        return f"Recipe, {RECIPE[sub]}" if sub in RECIPE else "Recipe"
    if cls == QUEST_CLASS:
        return "Quest Item"
    return None


def main():
    build = sys.argv[1] if len(sys.argv) > 1 else fetch.latest_forever_build()
    with open(fetch.IDS_LUA, encoding="utf-8") as f:
        ids = set(re.findall(r"\b\d+\b", f.read().split("{", 1)[1]))
    out = {}
    for r in fetch.table("Item", build):
        if r["ID"] not in ids:
            continue
        text = slot_text(int(r["ClassID"]), int(r["SubclassID"]), int(r["InventoryType"]))
        if text:
            out[r["ID"]] = text
    out = dict(sorted(out.items(), key=lambda kv: int(kv[0])))
    with open(OUT, "w", encoding="utf-8", newline="\n") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
    print(f"wrote {len(out)} item slots to {OUT} (build {build})")


if __name__ == "__main__":
    main()
