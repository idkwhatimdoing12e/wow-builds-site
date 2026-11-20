"""Draw public/journal/ui/map-ring.png: the gold ring round boss portraits on
the Map tab, in the look of the game's MiniMap-TrackingBorder.

The game's texture is only 28 px where the ring sits, and the map shows the
ring at 80-90 px, so the copy cut from it looked blocky. This draws the same
ring (a gold band lit from the top left, a dark inner edge, a soft shadow
falling inward) at 128 px, supersampled, so it stays sharp.

    python scripts/make-map-ring.py
"""
import math
import os

from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "journal", "ui", "map-ring.png")
SIZE, SS = 128, 4          # final size, supersampling
N = SIZE * SS
C = N / 2

# radii as fractions of the half-size, from the 28 px original
R_OUT = 1.00               # outer edge of the gold band
R_GOLD_IN = 0.80           # gold band inner edge
R_DARK_IN = 0.72           # thin dark line inside the gold
SHADOW = 0.20              # inward shadow width

GOLD_LIT = (238, 214, 96)
GOLD_MID = (189, 162, 33)
GOLD_DEEP = (112, 88, 18)


def lerp(a, b, t):
    return tuple(round(x + (y - x) * t) for x, y in zip(a, b))


img = Image.new("RGBA", (N, N), (0, 0, 0, 0))
px = img.load()
for y in range(N):
    for x in range(N):
        dx, dy = (x + 0.5 - C) / C, (y + 0.5 - C) / C
        r = math.hypot(dx, dy)
        if r > R_OUT:
            continue
        if r >= R_GOLD_IN:
            # light from the top left: brighter there, deeper bottom right
            light = (-(dx + dy) / max(r, 1e-6)) * 0.5 + 0.5
            # a bevel: brighter in the middle of the band
            mid = 1 - abs((r - (R_GOLD_IN + R_OUT) / 2) / ((R_OUT - R_GOLD_IN) / 2))
            col = lerp(GOLD_DEEP, GOLD_MID, min(1, light * 1.3))
            col = lerp(col, GOLD_LIT, max(0, light - 0.45) * mid * 1.4)
            px[x, y] = (*col, 255)
        elif r >= R_DARK_IN:
            px[x, y] = (12, 9, 4, 255)
        else:
            # shadow falling inward from the ring onto the portrait
            t = (R_DARK_IN - r) / SHADOW
            if t < 1:
                px[x, y] = (0, 0, 0, round(190 * (1 - t) ** 1.6))

img = img.filter(ImageFilter.GaussianBlur(SS * 0.35))
img = img.resize((SIZE, SIZE), Image.LANCZOS)
img.save(OUT, optimize=True)
print(f"wrote {OUT} ({SIZE}x{SIZE})")
