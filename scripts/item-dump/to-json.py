"""Turn the in-game dump into data/item-tooltips.json for the item pages.

After /djdump says done and you /reload (or log out):

    python scripts/item-dump/to-json.py
    python scripts/item-dump/to-json.py "<path to>/SavedVariables/DJItemDump.lua"

Without a path it takes the newest DJItemDump.lua under the WoW Forever
client's WTF folder. Requires: pip install lupa (as scripts/lua-to-json.py).
"""
import glob
import importlib
import json
import os
import re
import sys

from lupa import LuaRuntime

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
OUT = os.path.join(ROOT, "data", "item-tooltips.json")
# Name and quality as the game has them, for the journal (app/lib/journal.ts):
# the addon's data has some wrong (a green item listed as blue, "Unknown Reward").
GAME_OUT = os.path.join(ROOT, "data", "item-game.json")
QUALITY_BY_COLOR = {"#9d9d9d": 0, "#ffffff": 1, "#1eff00": 2, "#0070dd": 3, "#a335ee": 4, "#ff8000": 5, "#e6cc80": 6}
FOREVER = "C:/Program Files (x86)/World of Warcraft/_forever_"


def find_saved():
    files = glob.glob(os.path.join(FOREVER, "WTF", "Account", "*", "SavedVariables", "DJItemDump.lua"))
    if not files:
        sys.exit("No DJItemDump.lua found: run /djdump in game, wait for 'done', then /reload.")
    return max(files, key=os.path.getmtime)


def color(hexstr):
    """'ffRRGGBB' from the game to '#rrggbb'; None stays None."""
    if not hexstr or len(hexstr) < 6:
        return None
    return "#" + hexstr[-6:].lower()


# The game paints a line red when the character who ran /djdump can't use
# the item (a level, class, skill, armour or weapon type). The site has no
# character, so those lines show white, as for anyone who can.
RED = "#ff2020"


def game_text(text):
    """The game's text escapes as plain text: "(5 |4Min:Min; Cooldown)" is
    "(5 Min Cooldown)", colour codes and inline textures go, stray line breaks
    at the end too."""
    text = re.sub(r"(\d+) \|4([^:;]*):([^;]*);", lambda m: f"{m.group(1)} {m.group(2) if m.group(1) == '1' else m.group(3)}", text)
    text = re.sub(r"\|4([^:;]*):([^;]*);", lambda m: m.group(2), text)
    text = re.sub(r"\|c[0-9a-fA-F]{8}|\|r|\|T[^|]*\|t", "", text)
    return text.rstrip()


def clean(lines):
    """Drop what the client had not loaded and what depends on the dumping character."""
    out = []
    for row in lines:
        text = row["l"]
        if text.strip() == "Retrieving item information":
            continue  # a recipe's crafted item, not in the client's cache
        if text.rstrip().endswith("Set:"):
            continue  # a set bonus whose text had not loaded
        if text.startswith(("You haven't collected this appearance", "You've collected this appearance")):
            continue  # about the dumping account's wardrobe, not the item
        if text.strip() == "" and "price" not in row:
            # one blank line between blocks: never right after the name, never
            # two in a row, never at the end
            if len(out) <= 1 or out[-1]["l"] == "":
                continue
            row = {"l": ""}
        if row.get("lc") == RED:
            row = {**row, "lc": "#ffffff"}
        if row.get("rc") == RED:
            row = {**row, "rc": "#ffffff"}
        out.append(row)
    while out and out[-1]["l"] == "" and "price" not in out[-1]:
        out.pop()
    return out


def to_py(v):
    if v is None or isinstance(v, (bool, int, float, str)):
        return v
    keys = list(v.keys())
    if keys and all(isinstance(k, int) for k in keys):
        return [to_py(v[k]) for k in sorted(keys)]
    return {str(k): to_py(v[k]) for k in keys}


def main():
    args = [x for x in sys.argv[1:] if not x.startswith("--")]
    path = args[0] if args else find_saved()
    lua = LuaRuntime(unpack_returned_tuples=True, encoding="utf-8")
    with open(path, encoding="utf-8") as f:
        lua.execute(f.read())
    db = lua.globals().DJItemDumpDB
    if db is None or db["items"] is None:
        sys.exit(f"{path} has no items yet.")

    items = {}
    table = db["items"]
    for item_id in list(table.keys()):  # keyed by item ID: keep the keys
        lines = to_py(table[item_id])
        if not isinstance(lines, list):
            continue
        out = []
        for line in lines:
            row = {"l": game_text(line.get("l") or "")}
            if color(line.get("lc")):
                row["lc"] = color(line.get("lc"))
            if line.get("r"):
                row["r"] = game_text(line["r"])
                if color(line.get("rc")):
                    row["rc"] = color(line.get("rc"))
            if isinstance(line.get("price"), (int, float)) and line["price"] > 0:
                row = {"l": row["l"] or "Sell Price:", "lc": "#ffffff", "price": int(line["price"])}
            out.append(row)
        out = clean(out)
        if out:
            items[str(item_id)] = out

    # Never lose text: the client reads some tooltips less fully on a later
    # dump, so the more complete of this dump and the site's current data is
    # kept per item. --fresh takes the dump as it is (after a game patch).
    if "--fresh" not in sys.argv and os.path.exists(OUT):
        with open(OUT, encoding="utf-8") as f:
            previous = json.load(f).get("items", {})
        score = lambda ls: sum(len(l.get("l", "")) + len(l.get("r", "") or "") for l in ls)
        kept = 0
        for item_id, old in previous.items():
            old = clean([{**l, "l": game_text(l.get("l", ""))} for l in old])
            if item_id not in items or score(old) > score(items[item_id]):
                items[item_id] = old
                kept += 1
        if kept:
            print(f"kept the site's more complete tooltip for {kept} items (--fresh to replace them)")

    # Effect lines the client left out of the dump, from its own data tables
    # (scripts/item-dump/spell_lines.py): Ironforge Greathammer's "Chance on hit".
    try:
        sys.path.insert(0, HERE)
        fetch = importlib.import_module("fetch-icons")
        spell_lines = importlib.import_module("spell_lines")
        build = os.environ.get("FOREVER_BUILD") or fetch.latest_forever_build()
        added = spell_lines.fill(items, spell_lines.SpellText(fetch.table, build))
        print(f"added {added} effect lines from the client's data tables (build {build})")
    except Exception as err:  # offline: the dump alone still converts
        print(f"effect lines from the data tables skipped: {err}")

    icons = {}
    if db["icons"] is not None:
        for item_id in list(db["icons"].keys()):
            fid = db["icons"][item_id]
            if isinstance(fid, (int, float)) and fid > 0:
                icons[str(int(item_id))] = int(fid)

    doc = {
        "_comment": "Item tooltips from the game client, written by scripts/item-dump/to-json.py. Do not edit by hand: run /djdump in game again.",
        "items": dict(sorted(items.items(), key=lambda kv: int(kv[0]))),
        "icons": dict(sorted(icons.items(), key=lambda kv: int(kv[0]))),
    }
    with open(OUT, "w", encoding="utf-8", newline="\n") as f:
        json.dump(doc, f, ensure_ascii=False, separators=(",", ":"))
        f.write("\n")
    game = {}
    for item_id, lines in items.items():
        first = lines[0]
        quality = QUALITY_BY_COLOR.get(first.get("lc", ""))
        if first.get("l") and quality is not None:
            game[item_id] = [first["l"], quality]
    with open(GAME_OUT, "w", encoding="utf-8", newline="\n") as f:
        json.dump(game, f, ensure_ascii=False, separators=(",", ":"))
        f.write("\n")

    print(f"wrote {len(items)} item tooltips and {len(icons)} icon IDs to {OUT} (from {path})")
    print(f"wrote {len(game)} item names and qualities to {GAME_OUT}")
    print("next: python scripts/item-dump/fetch-icons.py (fills in icons still missing)")


if __name__ == "__main__":
    main()
