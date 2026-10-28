#!/usr/bin/env python3
"""
Builds the "Starts at" zone maps: one picture per zone a quest starts in, so the
quest page can drop a pin on the NPC the way the addon pins the world map.

The game stores each zone map as a 4x3 grid of 256px tiles under
Interface/WorldMap/<Name>/<Name>1..12, whose visible part is 1002x668 - the same
layout convert-maps.py stitches for dungeon floors. Tiles come from an export of
the game's UI textures (https://github.com/Gethe/wow-ui-textures, classic
branch); they are fetched over HTTP so no multi-GB checkout is needed.

Only the zones referenced by data/journal.json (QUEST_START_MAPS and any quest's
startMap) are built. Output: public/journal/zones/<uiMapID>.webp

Usage:
    python scripts/convert-zone-maps.py            # fetch from GitHub
    python scripts/convert-zone-maps.py <textures> # use a local wow-ui-textures folder
Requires: pip install pillow   (run lua-to-json.py first; this reads data/journal.json)
"""
import io
import json
import os
import re
import sys
import urllib.error
import urllib.request

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "journal", "zones")
RAW = "https://raw.githubusercontent.com/Gethe/wow-ui-textures/classic/WorldMap"

# Full tile sheet is 4x3 256px tiles; the map's visible part is 1002x668.
TILE = 256
COLS, ROWS = 4, 3
W, H = 1002, 668

# Classic uiMapID -> the game's WorldMap folder/texture base name.
ZONES = {
    1411: "Durotar",
    1412: "Mulgore",
    1413: "Barrens",
    1416: "Alterac",
    1417: "Arathi",
    1418: "Badlands",
    1419: "BLASTEDLANDS",
    1420: "Tirisfal",
    1421: "Silverpine",
    1422: "WesternPlaguelands",
    1423: "EasternPlaguelands",
    1424: "HillsbradFoothills",
    1425: "Hinterlands",
    1426: "DunMorogh",
    1427: "SearingGorge",
    1428: "BurningSteppes",
    1429: "ElwynnForest",
    1430: "DeadwindPass",
    1431: "Duskwood",
    1432: "LochModan",
    1433: "Redridge",
    1434: "StranglethornVale",
    1435: "SwampOfSorrows",
    1436: "Westfall",
    1437: "Wetlands",
    1438: "Teldrassil",
    1439: "Darkshore",
    1440: "Ashenvale",
    1441: "Thousandneedles",
    1442: "StonetalonMountains",
    1443: "Desolace",
    1444: "Feralas",
    1445: "Dustwallow",
    1446: "Tanaris",
    1447: "Aszhara",  # the game misspells the folder
    1448: "Felwood",
    1449: "UngoroCrater",
    1450: "Moonglade",
    1451: "Silithus",
    1452: "Winterspring",
    1453: "StormwindCity",
    1454: "Orgrimmar",
    1455: "Ironforge",
    1456: "ThunderBluff",
    1457: "Darnassus",
    1458: "Undercity",
}

API = "https://api.github.com/repos/Gethe/wow-ui-textures/contents/WorldMap"
TILE_RE = re.compile(r"^(.*?)(\d{1,2})\.png$", re.I)


def wanted_map_ids():
    """Every uiMapID a quest start points at."""
    data = json.load(open(os.path.join(ROOT, "data", "journal.json"), encoding="utf-8"))
    ids = set()
    for m in (data.get("QUEST_START_MAPS") or {}).values():
        if isinstance(m, dict) and m.get("mapID"):
            ids.add(int(m["mapID"]))
    for dungeon in (data.get("DB") or {}).values():
        if not isinstance(dungeon, dict):
            continue
        for q in dungeon.get("quests") or []:
            if not isinstance(q, dict):
                continue
            for key in ("startMap", "noteItemMap"):
                m = q.get(key)
                if isinstance(m, dict) and m.get("mapID"):
                    ids.add(int(m["mapID"]))
    return sorted(ids)


class TileSource:
    """Reads tiles from a local textures export, or from GitHub when none is given."""

    def __init__(self, local=None):
        self.local = local
        self.index = {}
        if local:
            for dirpath, _, files in os.walk(local):
                for f in files:
                    full = os.path.join(dirpath, f)
                    rel = os.path.relpath(full, local).replace(os.sep, "/").lower()
                    self.index[rel] = full

    def listing(self, folder):
        """File names in a zone folder, so the tile base name can be detected."""
        if self.local:
            prefix = f"worldmap/{folder}/".lower()
            return [k.rsplit("/", 1)[-1] for k in self.index if k.startswith(prefix)]
        req = urllib.request.Request(
            f"{API}/{folder}?ref=classic", headers={"User-Agent": "dungeon-journal"}
        )
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return [e["name"] for e in json.load(r)]
        except (urllib.error.HTTPError, urllib.error.URLError):
            return []

    def base_name(self, folder):
        """
        A zone folder also holds its sub-area maps, and the base name does not
        always match the folder (BLASTEDLANDS holds BlastedLands1..12). Pick the
        prefix with a full set of numbered tiles.
        """
        counts = {}
        for name in self.listing(folder):
            m = TILE_RE.match(name)
            if m and 1 <= int(m.group(2)) <= COLS * ROWS:
                counts[m.group(1)] = counts.get(m.group(1), 0) + 1
        if not counts:
            return folder
        # prefer a prefix matching the folder, else the one with the most tiles
        for prefix in counts:
            if prefix.lower() == folder.lower() and counts[prefix] >= COLS * ROWS:
                return prefix
        return max(counts, key=lambda p: (counts[p], p.lower() == folder.lower()))

    def get(self, folder, name):
        if self.local:
            # the export mixes WorldMap / Worldmap casing
            for root in ("worldmap", "interface/worldmap"):
                hit = self.index.get(f"{root}/{folder}/{name}.png".lower())
                if hit:
                    return Image.open(hit).convert("RGBA")
            return None
        url = f"{RAW}/{folder}/{name}.PNG"
        try:
            with urllib.request.urlopen(url, timeout=60) as r:
                return Image.open(io.BytesIO(r.read())).convert("RGBA")
        except (urllib.error.HTTPError, urllib.error.URLError):
            return None


def build_zone(map_id, folder, src):
    base = src.base_name(folder)
    sheet = Image.new("RGBA", (COLS * TILE, ROWS * TILE), (0, 0, 0, 255))
    found = 0
    for i in range(1, COLS * ROWS + 1):
        tile = src.get(folder, f"{base}{i}")
        if tile is None:
            continue
        found += 1
        if tile.size != (TILE, TILE):
            tile = tile.resize((TILE, TILE), Image.LANCZOS)
        col, row = (i - 1) % COLS, (i - 1) // COLS
        sheet.paste(tile, (col * TILE, row * TILE))
    if found == 0:
        return False, 0, base
    out = sheet.crop((0, 0, W, H)).convert("RGB")
    os.makedirs(OUT, exist_ok=True)
    out.save(os.path.join(OUT, f"{map_id}.webp"), "WEBP", quality=82, method=6)
    return True, found, base


def main():
    local = sys.argv[1] if len(sys.argv) > 1 else None
    src = TileSource(local)
    ids = wanted_map_ids()
    print(f"{len(ids)} zones referenced by quest starts")
    built, missing, partial = 0, [], []
    for map_id in ids:
        folder = ZONES.get(map_id)
        if not folder:
            missing.append((map_id, "no folder mapping"))
            continue
        ok, found, base = build_zone(map_id, folder, src)
        if not ok:
            missing.append((map_id, f"{folder}: no tiles"))
            continue
        if found < COLS * ROWS:
            partial.append((map_id, folder, found))
        built += 1
        print(f"  {map_id:>5} {folder:<22} base={base:<22} {found}/12 tiles")
    print(f"\nbuilt {built} zone maps -> {os.path.relpath(OUT, ROOT)}")
    if partial:
        print("partial (fewer than 12 tiles):")
        for map_id, folder, found in partial:
            print(f"  {map_id} {folder} {found}/12")
    if missing:
        print("MISSING:")
        for map_id, why in missing:
            print(f"  {map_id} {why}")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
