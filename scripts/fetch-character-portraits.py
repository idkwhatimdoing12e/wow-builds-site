"""Download the character page's portraits from Blizzard's render server.

    python scripts/fetch-character-portraits.py

Race portraits (one per race and sex) and class icons, 56 px, saved as
public/journal/portraits/race/<race>_<male|female>.webp and
public/journal/portraits/class/<class>.webp. The character page shows the
race portrait when the export says the character's sex, else the class icon.
Requires: pip install pillow
"""
import io
import os
import urllib.request

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "journal", "portraits")
UA = {"User-Agent": "dungeon-journal-site-portraits/1.0"}
RACES = ["human", "dwarf", "nightelf", "gnome", "draenei", "worgen", "orc", "undead", "tauren", "troll", "bloodelf", "goblin", "pandaren"]
CLASSES = ["warrior", "paladin", "hunter", "rogue", "priest", "shaman", "mage", "warlock", "druid", "deathknight"]


def fetch(icon, dest):
    for region in ("classic-us", "us"):
        url = f"https://render.worldofwarcraft.com/{region}/icons/56/{icon}.jpg"
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
                im = Image.open(io.BytesIO(r.read())).convert("RGB")
        except Exception:
            continue
        im.save(dest, "WEBP", quality=90, method=6)
        return True
    print(f"not on the render server: {icon}")
    return False


def main():
    os.makedirs(os.path.join(OUT, "race"), exist_ok=True)
    os.makedirs(os.path.join(OUT, "class"), exist_ok=True)
    n = 0
    for race in RACES:
        for sex in ("male", "female"):
            n += fetch(f"achievement_character_{race}_{sex}", os.path.join(OUT, "race", f"{race}_{sex}.webp"))
    for cls in CLASSES:
        n += fetch(f"classicon_{cls}", os.path.join(OUT, "class", f"{cls}.webp"))
    print(f"saved {n} portraits to {OUT}")


if __name__ == "__main__":
    main()
