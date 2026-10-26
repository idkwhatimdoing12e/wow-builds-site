#!/usr/bin/env python3
"""
Converts the addon's own Media/*.tga artwork to web images in public/journal/.

Only files that ship inside the addon folder are converted (the addon's own
card art, faction crests and parchment). References to Blizzard's built-in
textures (numeric file IDs, Interface\\Glues\\...) are skipped; those dungeons
fall back to a themed card on the site.

Usage: python3 scripts/convert-media.py <path-to-ForeverDungeonJournal-folder>
Requires: pip install pillow   (run lua-to-json.py first; this reads data/journal.json)
"""
import json
import os
import re
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "journal")


def slugify(name):
    s = re.sub(r"['’]", "", name.lower())
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


def addon_media_path(addon_dir, ref):
    """Map 'Interface\\AddOns\\ForeverDungeonJournal\\Media\\X' to a local .tga, or None."""
    if not isinstance(ref, str):
        return None
    m = re.match(r"Interface\\AddOns\\ForeverDungeonJournal\\(.+)$", ref)
    if not m:
        return None
    rel = m.group(1).replace("\\", "/")
    for ext in (".tga", ".png", ".blp"):
        p = os.path.join(addon_dir, rel + ext)
        if os.path.exists(p):
            return p
    return None


def crop_texcoord(im, tc):
    if not tc or len(tc) < 4:
        return im
    l, r, t, b = tc[:4]
    w, h = im.size
    return im.crop((int(l * w), int(t * h), int(r * w), int(b * h)))


def main():
    addon_dir = sys.argv[1]
    data = json.load(open(os.path.join(ROOT, "data", "journal.json"), encoding="utf-8"))
    os.makedirs(os.path.join(OUT, "art"), exist_ok=True)

    manifest = {"cards": {}, "pages": {}}

    for name, ref in data.get("DUNGEON_HOME_ART", {}).items():
        src = addon_media_path(addon_dir, ref)
        if not src:
            continue
        im = Image.open(src).convert("RGB")
        im = crop_texcoord(im, data.get("DUNGEON_HOME_TEXCOORD", {}).get(name))
        out = f"art/{slugify(name)}-card.webp"
        im.save(os.path.join(OUT, out), "WEBP", quality=82)
        manifest["cards"][name] = "/journal/" + out

    for name, ref in data.get("DUNGEON_PAGE_ART", {}).items():
        src = addon_media_path(addon_dir, ref)
        if not src:
            continue
        im = Image.open(src).convert("RGB")
        im = crop_texcoord(im, data.get("DUNGEON_PAGE_TEXCOORD", {}).get(name))
        out = f"art/{slugify(name)}-page.webp"
        im.save(os.path.join(OUT, out), "WEBP", quality=82)
        manifest["pages"][name] = "/journal/" + out

    # Faction crests, parchment, small icons the UI uses.
    for src, out in [
        ("Media/Alliance.tga", "alliance.png"),
        ("Media/Horde.tga", "horde.png"),
        ("Media/RPG/Parchment.tga", "parchment.jpg"),
        ("Media/LootBags.tga", "lootbags.png"),
        ("Media/QuestChain.png", "questchain.png"),
    ]:
        p = os.path.join(addon_dir, src)
        if not os.path.exists(p):
            continue
        im = Image.open(p)
        if out.endswith(".jpg"):
            # The parchment texture carries a dark band in its lower part; keep the
            # light top and mirror it so it tiles vertically without a seam.
            rgb = im.convert("RGB")
            w, h = rgb.size
            top = rgb.crop((0, 0, w, int(h * 0.60)))
            tile = Image.new("RGB", (w, top.height * 2))
            tile.paste(top, (0, 0))
            tile.paste(top.transpose(Image.FLIP_TOP_BOTTOM), (0, top.height))
            tile.save(os.path.join(OUT, out), "JPEG", quality=86)
        else:
            im.convert("RGBA").save(os.path.join(OUT, out), "PNG", optimize=True)

    json.dump(manifest, open(os.path.join(ROOT, "data", "art.json"), "w"), indent=1)
    print(f"cards: {len(manifest['cards'])}, page art: {len(manifest['pages'])} -> {OUT}")


if __name__ == "__main__":
    main()
