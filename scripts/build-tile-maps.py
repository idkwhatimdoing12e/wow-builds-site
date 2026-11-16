#!/usr/bin/env python3
"""
Builds the dungeon map images whose floors use the game's own tiles, pulling
those tiles from https://github.com/Gethe/wow-ui-textures (classic branch).

convert-maps.py does the same job but needs a local export of the game's UI
textures. This one fetches what it needs, so a newly mapped dungeon can be
built without downloading the whole texture repository first. It only touches
floors whose image is missing, and reuses convert-maps.py's renderer so the
output matches the maps already on disk.

The client and the texture repo do not always agree on a folder's name: WoW
Forever asks for ScholomanceOLD, which the classic repo simply calls
Scholomance. Where the name misses, the trailing OLD is dropped and the
listing is tried again.

Usage: python3 scripts/build-tile-maps.py <ForeverDungeonJournal folder>
Requires: pip install pillow   (run lua-to-json.py first)
"""
import importlib.util
import json
import os
import re
import sys
import urllib.error
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "journal", "maps")
RAW = "https://raw.githubusercontent.com/Gethe/wow-ui-textures/classic"
API = "https://api.github.com/repos/Gethe/wow-ui-textures/contents"
HEADERS = {"User-Agent": "dungeon-journal"}


def load_converter():
    path = os.path.join(ROOT, "scripts", "convert-maps.py")
    spec = importlib.util.spec_from_file_location("convert_maps", path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


class GithubTiles:
    """Stands in for convert-maps.py's local tile tree, fetching on demand."""

    def __init__(self, cache):
        self.cache = cache
        self.listings = {}
        os.makedirs(cache, exist_ok=True)

    def listing(self, folder):
        """The file names in one WorldMap folder, or None when there is none."""
        if folder in self.listings:
            return self.listings[folder]
        req = urllib.request.Request(f"{API}/WorldMap/{folder}?ref=classic", headers=HEADERS)
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                names = {e["name"] for e in json.load(r) if isinstance(e, dict)}
        except (urllib.error.HTTPError, urllib.error.URLError):
            names = None
        self.listings[folder] = names
        return names

    def resolve(self, folder):
        """The repo's name for a folder the client calls `folder`."""
        if self.listing(folder):
            return folder
        if folder.upper().endswith("OLD") and self.listing(folder[:-3]):
            return folder[:-3]
        return None

    def find(self, rel):
        """rel is what render_floor asks for: WorldMap\\Folder\\Prefix_N.png"""
        parts = rel.replace("\\", "/").split("/")
        folder, name = parts[-2], parts[-1]
        repo_folder = self.resolve(folder)
        if not repo_folder:
            return None
        # The repo stores .PNG, and names the file after its own folder.
        wanted = name[:-4] if name.lower().endswith(".png") else name
        wanted = wanted.replace(folder, repo_folder, 1) + ".PNG"
        if wanted not in (self.listing(repo_folder) or ()):
            return None
        dest = os.path.join(self.cache, repo_folder, wanted)
        if not os.path.exists(dest):
            os.makedirs(os.path.dirname(dest), exist_ok=True)
            req = urllib.request.Request(f"{RAW}/WorldMap/{repo_folder}/{wanted}", headers=HEADERS)
            try:
                with urllib.request.urlopen(req, timeout=120) as r:
                    data = r.read()
            except (urllib.error.HTTPError, urllib.error.URLError):
                return None
            with open(dest, "wb") as fh:
                fh.write(data)
        return dest


def slugify(name):
    s = name.lower().replace("'", "").replace("’", "")
    return re.sub(r"-+$", "", re.sub(r"^-+", "", re.sub(r"[^a-z0-9]+", "-", s)))


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return 2
    addon_dir = sys.argv[1]
    cm = load_converter()
    tiles = GithubTiles(os.path.join(ROOT, ".tile-cache"))
    maps = json.load(open(os.path.join(ROOT, "data", "journal.json"), encoding="utf-8")).get("DUNGEON_MAPS", {})

    built, failed = 0, []
    for name, data in sorted(maps.items()):
        floors = data.get("floors") or []
        for n, floor in enumerate(floors, 1):
            dest = os.path.join(OUT, f"{slugify(name)}-{n}.webp")
            if os.path.exists(dest) or not isinstance(floor, dict) or not floor.get("tiles"):
                continue
            try:
                im = cm.render_floor(floor, addon_dir, tiles)
            except FileNotFoundError as e:
                failed.append(f"{name} level {n}: {e}")
                continue
            im.convert("RGB").save(dest, "WEBP", quality=82, method=6)
            print(f"  built {os.path.basename(dest)}")
            built += 1

    print(f"\nbuilt {built} map image(s)")
    for f in failed:
        print(f"  MISSING TILES: {f}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
