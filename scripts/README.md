# Site data pipeline

`data/journal.json` is generated from the Dungeon Journal addon's own data files.
Never edit it by hand — fix the addon's Lua and regenerate.

```bash
pip install lupa
python3 scripts/lua-to-json.py "C:/Program Files (x86)/World of Warcraft/_classic_beta_/Interface/AddOns/ForeverDungeonJournal"
git add data/journal.json && git commit -m "data: journal from addon 1.x.y"
```

Pushing to `main` redeploys the site on Vercel. Run this after every addon release
so the website and the addon ship the same data on the same day.

Site-wide constants (domain, links, item-link rules) live in `app/lib/site.ts`.
Supporter names for `/supporters` live in `data/supporters.json`.
Ad units: create a responsive display unit in AdSense and set
`NEXT_PUBLIC_ADSENSE_SLOT_CONTENT=<slot id>` in Vercel's environment variables;
until it is set the ad slots render nothing.

## Artwork and icons

```bash
pip install pillow
python3 scripts/convert-media.py "<path>/ForeverDungeonJournal"
```

converts the addon's own `Media/` art (dungeon cards, crests, parchment) into
`public/journal/` and rewrites `data/art.json`. Dungeons whose card is a Blizzard
loading screen can't be read from the addon folder; their cards were extracted once
from the game files and are committed in `public/journal/art/`, and the script keeps
them in the manifest as long as the file is there.

- **Item icons** — `data/item-icons.json` maps each item ID to its icon name and the
  Wowhead database it was found in (16 = WoW Forever, 4 = Classic); the icons
  themselves are committed in `public/journal/icons/` (56px webp). When the addon adds
  items, look the new IDs up at
  `https://nether.wowhead.com/tooltip/item/<id>?dataEnv=16` (fall back to `dataEnv=4`),
  add `[icon, env]` entries and the missing icon files. Unknown items show a question mark.
- **Item links** go to `wowhead.com/forever/item=<id>` (Classic for env-4 items);
  Wowhead's `power.js` shows the tooltip on hover.
- **Boss portraits** are Wowhead's model renders, hotlinked by the creature display ID
  from the addon's `STATIC_DISPLAY_IDS`. `data/npc-portraits.json` holds a head crop per
  display ID ([side, left, top] in px of the 300×300 render), measured from each
  render's opaque pixels. A boss without a crop shows the whole render; one whose
  render fails to load shows its initials.
