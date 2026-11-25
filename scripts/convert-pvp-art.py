"""The PvP page's battleground cards: each battleground's loading screen, cut
as the addon cuts it (Systems/PvP.lua, BGS: art, crop, patch).

    python scripts/convert-pvp-art.py

Reads the battlegrounds from data/journal.json (PVP.battlegrounds), downloads
each loading screen from the game files by its file ID (wago.tools, kept in
scripts/item-dump/.cache), and writes public/journal/art/pvp-<key>.webp.

- crop = { left, right, top, bottom } in the texture's 0-1 coordinates.
- The classic loading screens are 4:3 pictures stored square: the cut is
  stretched back to 4:3 so it isn't squashed.
- patch = { u from, u to, v down to, how much lower, fade } (Arathi Basin):
  the bit of the logo left at the top is covered with the same picture taken
  a little lower, its lower edge fading out.

Requires: pip install pillow
"""
import io
import json
import os
import urllib.request

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, "scripts", "item-dump", ".cache")
OUT = os.path.join(ROOT, "public", "journal", "art")
WIDTH = 960


def loading_screen(file_id):
    os.makedirs(CACHE, exist_ok=True)
    path = os.path.join(CACHE, f"{file_id}.blp")
    if not os.path.exists(path):
        req = urllib.request.Request(f"https://wago.tools/api/casc/{file_id}?download",
                                     headers={"User-Agent": "dungeon-journal-site/1.0"})
        with urllib.request.urlopen(req, timeout=120) as r:
            data = r.read()
        with open(path, "wb") as f:
            f.write(data)
    with open(path, "rb") as f:
        return Image.open(io.BytesIO(f.read())).convert("RGB")


def patched(im, patch, top):
    """Cover u0..u1 x top..v1 with the picture from `lower` further down."""
    u0, u1, v1, lower, fade = patch
    w, h = im.size
    x0, x1 = round(u0 * w), round(u1 * w)
    y0, y1, dy = round(top * h), round(v1 * h), round(lower * h)
    fade_px = max(1, round(fade * h))
    out = im.copy()
    src = im.crop((x0, y0 + dy, x1, y1 + dy + fade_px))
    # Solid down to v1, then fading out over `fade`.
    mask = Image.new("L", src.size, 255)
    for i in range(fade_px):
        row = Image.new("L", (src.size[0], 1), round(255 * (1 - (i + 1) / (fade_px + 1))))
        mask.paste(row, (0, y1 - y0 + i))
    out.paste(src, (x0, y0), mask)
    return out


def main():
    journal = json.load(open(os.path.join(ROOT, "data", "journal.json"), encoding="utf-8"))
    for bg in journal["PVP"]["battlegrounds"]:
        im = loading_screen(bg["art"])
        left, right, top, bottom = bg["crop"]
        if bg.get("patch"):
            im = patched(im, bg["patch"], top)
        w, h = im.size
        # A square texture holds a 4:3 picture.
        aspect = 4 / 3 if w == h else w / h
        cut = im.crop((round(left * w), round(top * h), round(right * w), round(bottom * h)))
        real = (right - left) * aspect / (bottom - top)
        cut = cut.resize((WIDTH, round(WIDTH / real)), Image.LANCZOS)
        dest = os.path.join(OUT, f"pvp-{bg['key'].lower()}.webp")
        cut.save(dest, "WEBP", quality=80, method=6)
        print(f"{bg['key']}: {cut.size[0]}x{cut.size[1]} -> {dest}")


if __name__ == "__main__":
    main()
