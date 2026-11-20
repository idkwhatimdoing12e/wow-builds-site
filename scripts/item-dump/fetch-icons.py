"""Give every journal item its real icon instead of the question mark.

    python scripts/item-dump/fetch-icons.py

For each item in DJItemDump/ItemIDs.lua with no entry in data/item-icons.json:

1. Its icon's file ID: from the in-game dump (data/item-tooltips.json "icons",
   written by to-json.py) when there is one, otherwise from the WoW Forever
   client's own tables as wago.tools publishes them: the Item table, or for
   items that leave it empty (many Forever items), the icon of the item's
   appearance (ItemModifiedAppearance -> ItemAppearance).
2. The icon's name for that file ID, from the community listfile
   (github.com/wowdev/wow-listfile), downloaded once into .cache/.
3. The 56px image from Blizzard's own render server, saved as
   public/journal/icons/<name>.webp, and the item mapped to it.

Re-run after an addon update or a new /djdump; it only fetches what is missing.
Requires: pip install pillow
"""
import csv
import io
import json
import os
import re
import sys
import time
import urllib.request

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
CACHE = os.path.join(HERE, ".cache")
IDS_LUA = os.path.join(HERE, "DJItemDump", "ItemIDs.lua")
ICONS_JSON = os.path.join(ROOT, "data", "item-icons.json")
TOOLTIPS_JSON = os.path.join(ROOT, "data", "item-tooltips.json")
ICON_DIR = os.path.join(ROOT, "public", "journal", "icons")
FOREVER_ENV = 16  # the value item-icons.json already uses for WoW Forever
UA = {"User-Agent": "dungeon-journal-site-icon-fetch/1.0"}
LISTFILE_URL = "https://github.com/wowdev/wow-listfile/releases/latest/download/community-listfile.csv"


def get(url, timeout=120):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def latest_forever_build():
    builds = json.loads(get("https://wago.tools/api/builds"))
    return builds["wowf"][0]["version"]


def table(name, build):
    """One of the client's data tables as rows, from wago.tools (cached)."""
    path = os.path.join(CACHE, f"{name}-{build}.csv")
    if not os.path.exists(path):
        print(f"downloading the {name} table for {build}...")
        with open(path, "wb") as f:
            f.write(get(f"https://wago.tools/db2/{name}/csv?build={build}"))
    with open(path, encoding="utf-8") as f:
        return list(csv.DictReader(f))


def item_table_icons(build):
    """Item ID -> icon file ID: the Item table's own icon, else its appearance's."""
    icons = {r["ID"]: r["IconFileDataID"] for r in table("Item", build) if r["IconFileDataID"] != "0"}
    appearance_icon = {r["ID"]: r["DefaultIconFileDataID"] for r in table("ItemAppearance", build)}
    for r in table("ItemModifiedAppearance", build):
        if r["ItemAppearanceModifierID"] != "0" or r["ItemID"] in icons:
            continue
        fid = appearance_icon.get(r["ItemAppearanceID"], "0")
        if fid != "0":
            icons[r["ItemID"]] = fid
    return icons


def icon_names():
    """File ID -> icon name, from the community listfile (icons only, cached)."""
    path = os.path.join(CACHE, "icon-listfile.csv")
    if not os.path.exists(path):
        print("downloading the community listfile (about 150 MB, once)...")
        req = urllib.request.Request(LISTFILE_URL, headers=UA)
        keep = []
        with urllib.request.urlopen(req, timeout=900) as r:
            for raw in io.TextIOWrapper(r, encoding="utf-8", errors="replace"):
                if ";interface/icons/" in raw.lower():
                    keep.append(raw.rstrip("\n"))
        with open(path, "w", encoding="utf-8") as f:
            f.write("\n".join(keep) + "\n")
    out = {}
    with open(path, encoding="utf-8") as f:
        for line in f:
            fid, _, p = line.strip().partition(";")
            name = os.path.splitext(os.path.basename(p))[0].lower()
            if fid and name:
                out[fid] = name
    return out


def download_icon(name):
    dest = os.path.join(ICON_DIR, f"{name}.webp")
    if os.path.exists(dest):
        return True
    for region in ("classic-us", "us"):
        try:
            data = get(f"https://render.worldofwarcraft.com/{region}/icons/56/{name}.jpg", timeout=30)
        except Exception:
            continue
        im = Image.open(io.BytesIO(data)).convert("RGB").resize((56, 56), Image.LANCZOS)
        im.save(dest, "WEBP", quality=82, method=6)
        return True
    return False


def main():
    os.makedirs(CACHE, exist_ok=True)
    with open(IDS_LUA, encoding="utf-8") as f:
        ids = re.findall(r"\b\d+\b", f.read().split("{", 1)[1])
    with open(ICONS_JSON, encoding="utf-8") as f:
        icons = json.load(f)
    want = [i for i in ids if i not in icons]
    print(f"{len(want)} items have no icon yet")
    if not want:
        return

    dumped = {}
    if os.path.exists(TOOLTIPS_JSON):
        with open(TOOLTIPS_JSON, encoding="utf-8") as f:
            dumped = {k: str(v) for k, v in json.load(f).get("icons", {}).items()}
    build = sys.argv[1] if len(sys.argv) > 1 else latest_forever_build()
    table = item_table_icons(build)
    names = icon_names()

    added, no_file, no_name, no_image = 0, [], [], []
    for item_id in want:
        fid = dumped.get(item_id) or table.get(item_id)
        if not fid:
            no_file.append(item_id)
            continue
        name = names.get(fid)
        if not name:
            no_name.append(item_id)
            continue
        if not download_icon(name):
            no_image.append(item_id)
            continue
        icons[item_id] = [name, FOREVER_ENV]
        added += 1
        time.sleep(0.05)  # gentle on Blizzard's server

    icons = dict(sorted(icons.items(), key=lambda kv: int(kv[0])))
    with open(ICONS_JSON, "w", encoding="utf-8", newline="\n") as f:
        json.dump(icons, f, ensure_ascii=False, separators=(",", ":"))
    print(f"added {added} icons (build {build})")
    if no_file:
        print(f"{len(no_file)} items have no icon in the client data yet: run /djdump in game, then to-json.py, then this again")
    if no_name:
        print(f"{len(no_name)} icon files are not in the community listfile yet")
    if no_image:
        print(f"{len(no_image)} icons were not on Blizzard's render server")


if __name__ == "__main__":
    main()
