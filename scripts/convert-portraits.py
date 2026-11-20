"""Copy the addon's baked boss portraits onto the site.

    python scripts/convert-portraits.py ["<path>/ForeverDungeonJournal"]

The addon ships every creature portrait it shows, photographed in game with
/dj bake (Media/Portraits/<displayID>.tga, 64 px, and a 128 px copy in
Media/Portraits/128 for many). This writes each one as
public/journal/portraits/baked/<displayID>.webp, the 128 px copy where there is
one, and lists them in data/baked-portraits.json. The site shows these in place
of a render, so its portraits are the addon's own.

Requires: pip install pillow
"""
import json
import os
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_ADDON = "C:/Program Files (x86)/World of Warcraft/_forever_/Interface/AddOns/ForeverDungeonJournal"
OUT_DIR = os.path.join(ROOT, "public", "journal", "portraits", "baked")
MANIFEST = os.path.join(ROOT, "data", "baked-portraits.json")


def main():
    addon = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_ADDON
    src = os.path.join(addon, "Media", "Portraits")
    big = os.path.join(src, "128")
    if not os.path.isdir(src):
        sys.exit(f"No Media/Portraits in {addon}")
    os.makedirs(OUT_DIR, exist_ok=True)

    ids = []
    for name in sorted(os.listdir(src)):
        stem, ext = os.path.splitext(name)
        if ext.lower() != ".tga" or not stem.isdigit():
            continue
        path = os.path.join(big, name) if os.path.exists(os.path.join(big, name)) else os.path.join(src, name)
        im = Image.open(path).convert("RGBA")
        im.save(os.path.join(OUT_DIR, f"{stem}.webp"), "WEBP", quality=90, method=6)
        ids.append(int(stem))

    ids.sort()
    with open(MANIFEST, "w", encoding="utf-8", newline="\n") as f:
        json.dump(ids, f, separators=(",", ":"))
        f.write("\n")
    print(f"wrote {len(ids)} portraits to {OUT_DIR}")


if __name__ == "__main__":
    main()
