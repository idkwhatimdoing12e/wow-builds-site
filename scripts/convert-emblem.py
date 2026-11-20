"""The home emblem's selected look, from the addon's own textures.

    python scripts/convert-emblem.py ["<path>/ForeverDungeonJournal"]

Systems/ForeverFilter.lua draws the lit dungeon tab with Media/TabRing (a round
ring, added on top, tinted 1, 0.82, 0.3 at 0.95) and Media/TickGlow (the soft
halo, tinted 1, 0.82, 0.35). The textures are white; this bakes the tint in
and writes public/journal/ui/forever-ring.png and forever-halo.png. The site
blends them with mix-blend-mode: screen, close to the game's ADD.
Requires: pip install pillow
"""
import os
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_ADDON = "C:/Program Files (x86)/World of Warcraft/_forever_/Interface/AddOns/ForeverDungeonJournal"
UI = os.path.join(ROOT, "public", "journal", "ui")


def tinted(path, rgb, alpha=1.0, size=128):
    im = Image.open(path).convert("RGBA").resize((size, size), Image.LANCZOS)
    r, g, b, a = im.split()
    # the texture's brightness, coloured by the tint; alpha scaled like SetVertexColor's
    lum = Image.merge("RGB", (r, g, b)).convert("L")
    out = Image.new("RGBA", im.size)
    px, lp, ap = out.load(), lum.load(), a.load()
    for y in range(im.height):
        for x in range(im.width):
            v = lp[x, y] / 255
            px[x, y] = (round(255 * rgb[0] * v), round(255 * rgb[1] * v), round(255 * rgb[2] * v), round(ap[x, y] * alpha))
    return out


def main():
    addon = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_ADDON
    media = os.path.join(addon, "Media")
    tinted(os.path.join(media, "TabRing.tga"), (1, 0.82, 0.3), 0.95).save(os.path.join(UI, "forever-ring.png"), optimize=True)
    tinted(os.path.join(media, "TickGlow.tga"), (1, 0.82, 0.35)).save(os.path.join(UI, "forever-halo.png"), optimize=True)
    print(f"wrote forever-ring.png and forever-halo.png to {UI}")


if __name__ == "__main__":
    main()
