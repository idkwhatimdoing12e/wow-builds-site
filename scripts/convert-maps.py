#!/usr/bin/env python3
"""
Builds the Map tab images: one picture per dungeon level, exactly as the
addon draws it (see FDJ.RenderCustomDungeonMap in Core/Journal.lua).

- Levels with `texture` use the addon's own map art from Media/ (the art sits
  in the top `texBottom` part of the TGA).
- Levels with `tiles` use the game's map tiles (Interface/WorldMap/<Name>/
  <Name><level>_1..12: a 4x3 grid of 256px tiles whose visible part is
  1002x668). Those come from an export of the game's UI textures, e.g.
  https://github.com/Gethe/wow-ui-textures (classic branch).
- `patches` (Media/MapPatches) are drawn on top to hide the game's own boss
  skulls, so only the journal's portraits mark the boss rooms.

Every level is stored at 1002x668 (the addon shows all maps at 3:2).

Usage:
    python3 scripts/convert-maps.py <ForeverDungeonJournal folder> <wow-ui-textures folder>
Requires: pip install pillow   (run lua-to-json.py first; this reads data/journal.json)
"""
import json
import os
import re
import sys

from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "journal", "maps")
W, H = 1002, 668


def slugify(name):
    s = re.sub(r"['’]", "", name.lower())
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


class CaseInsensitiveTree:
    """The texture export mixes folder casing (WorldMap / Worldmap); find files regardless."""

    def __init__(self, root):
        self.root = root
        self.index = {}
        for dirpath, _, files in os.walk(root):
            for f in files:
                full = os.path.join(dirpath, f)
                self.index[os.path.relpath(full, root).replace(os.sep, "/").lower()] = full

    def find(self, rel):
        return self.index.get(rel.replace("\\", "/").lower())


def addon_file(addon_dir, ref):
    m = re.match(r"Interface\\AddOns\\ForeverDungeonJournal\\(.+)$", ref)
    if not m:
        return None
    rel = re.sub(r"\.(tga|png|blp)$", "", m.group(1).replace("\\", "/"), flags=re.I)
    for ext in (".tga", ".png"):
        p = os.path.join(addon_dir, rel + ext)
        if os.path.exists(p):
            return p
    return None


def render_floor(floor, addon_dir, tree):
    if floor.get("texture"):
        src = addon_file(addon_dir, floor["texture"])
        if not src:
            raise FileNotFoundError(floor["texture"])
        im = Image.open(src).convert("RGBA")
        w, h = im.size
        im = im.crop((0, 0, round(w * floor.get("texRight", 1)), round(h * floor.get("texBottom", 1))))
        return im.resize((W, H), Image.LANCZOS)

    prefix = floor["tiles"].replace("Interface\\", "", 1)
    canvas = Image.new("RGBA", (1024, 768), (107, 84, 51, 255))
    for i in range(1, 13):
        path = tree.find(f"{prefix}{i}.png")
        if not path:
            raise FileNotFoundError(f"{prefix}{i}")
        tile = Image.open(path).convert("RGBA").resize((256, 256), Image.LANCZOS)
        canvas.alpha_composite(tile, (((i - 1) % 4) * 256, ((i - 1) // 4) * 256))
    im = canvas.crop((0, 0, W, H))

    for patch in floor.get("patches") or []:
        src = addon_file(addon_dir, patch["tex"])
        if not src:
            print(f"  patch missing: {patch['tex']}")
            continue
        x0, y0 = round(patch["x0"] * W), round(patch["y0"] * H)
        x1, y1 = round(patch["x1"] * W), round(patch["y1"] * H)
        p = Image.open(src).convert("RGBA").resize((max(1, x1 - x0), max(1, y1 - y0)), Image.LANCZOS)
        if patch.get("alpha") is not None:
            p.putalpha(p.getchannel("A").point(lambda a: round(a * patch["alpha"])))
        im.alpha_composite(p, (x0, y0))
    return im


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    addon_dir, textures_dir = sys.argv[1], sys.argv[2]
    maps = json.load(open(os.path.join(ROOT, "data", "journal.json"), encoding="utf-8")).get("DUNGEON_MAPS", {})
    tree = CaseInsensitiveTree(textures_dir)
    os.makedirs(OUT, exist_ok=True)

    count = 0
    for name, data in sorted(maps.items()):
        for n, floor in enumerate(data.get("floors") or [], 1):
            im = render_floor(floor, addon_dir, tree)
            im.convert("RGB").save(os.path.join(OUT, f"{slugify(name)}-{n}.webp"), "WEBP", quality=82, method=6)
            count += 1
        print(f"{name}: {len(data.get('floors') or [])} level(s)")

    # Map markers the addon uses: the dungeon-entrance swirl, the gold pin ring,
    # and the green level ladder.
    ui = os.path.join(ROOT, "public", "journal", "ui")
    os.makedirs(ui, exist_ok=True)
    swirl = tree.find("MINIMAP/Dungeon_Icon.png")
    if swirl:
        Image.open(swirl).convert("RGBA").save(os.path.join(ui, "map-entrance.png"), optimize=True)
    ring = tree.find("MINIMAP/MiniMap-TrackingBorder.png")
    if ring:
        r = Image.open(ring).convert("RGBA")
        # The gold ring occupies pixels 4..31 of the 64px texture; crop it so it centres on the pin.
        k = r.width / 64
        ring_img = r.crop((round(4 * k), round(4 * k), round(32 * k), round(32 * k)))
        # Keep only the round ring: clear the texture's square backdrop outside it.
        mask = Image.new("L", ring_img.size, 0)
        ImageDraw.Draw(mask).ellipse((0, 0, ring_img.width - 1, ring_img.height - 1), fill=255)
        ring_img.putalpha(Image.composite(ring_img.getchannel("A"), Image.new("L", ring_img.size, 0), mask))
        ring_img.save(os.path.join(ui, "map-ring.png"), optimize=True)
    # Map tab icon: the addon uses Interface\\Icons\\Ability_Spy (the Bloody Map item), edges trimmed.
    spy = tree.find("ICONS/Ability_Spy.png")
    if spy:
        im = Image.open(spy).convert("RGBA")
        w, h = im.size
        im.crop((round(w * 0.07), round(h * 0.07), round(w * 0.93), round(h * 0.93))).resize((48, 48), Image.LANCZOS).save(
            os.path.join(ui, "map-tab.png"), optimize=True)
    ladder = os.path.join(addon_dir, "Media", "LevelLadder.tga")
    if os.path.exists(ladder):
        Image.open(ladder).convert("RGBA").save(os.path.join(ui, "map-ladder.png"), optimize=True)
    print(f"{count} map images -> {OUT}")


if __name__ == "__main__":
    main()
