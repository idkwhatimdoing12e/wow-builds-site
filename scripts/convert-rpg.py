"""RPG Mode art for the character page, from the addon's Media/RPG.

    python scripts/convert-rpg.py ["<path>/ForeverDungeonJournal"]

A dungeon whose page the character has not unlocked shows, like the addon's
journal, a blank parchment page with a pencil sketch of its final boss:

- Parchment.tga -> public/journal/rpg/parchment.webp, only its top 176 of 256
  rows, as the game draws it (SetTexCoord(0, 1, 0, 176/256));
- Sketch_<displayID>.tga -> public/journal/rpg/sketch-<displayID>.webp, and
  Sketch_Unknown.tga -> sketch-unknown.webp (transparent, drawn on the paper).
"""
import glob
import os
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "journal", "rpg")
DEFAULT_ADDON = "C:/Program Files (x86)/World of Warcraft/_forever_/Interface/AddOns/ForeverDungeonJournal"


def main():
    addon = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_ADDON
    src = os.path.join(addon, "Media", "RPG")
    os.makedirs(OUT, exist_ok=True)

    paper = Image.open(os.path.join(src, "Parchment.tga")).convert("RGB")
    w, h = paper.size
    paper.crop((0, 0, w, round(h * 176 / 256))).save(os.path.join(OUT, "parchment.webp"), "WEBP", quality=88)

    count = 0
    for path in sorted(glob.glob(os.path.join(src, "Sketch_*.tga"))):
        key = os.path.basename(path)[len("Sketch_"):-len(".tga")].lower()
        Image.open(path).convert("RGBA").save(os.path.join(OUT, f"sketch-{key}.webp"), "WEBP", quality=90)
        count += 1
    print(f"wrote parchment and {count} sketches to {OUT}")


if __name__ == "__main__":
    main()
