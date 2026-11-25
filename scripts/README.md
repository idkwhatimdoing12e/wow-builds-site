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

- **Item icons** — `data/item-icons.json` maps each item ID to its icon name; the
  icons themselves are committed in `public/journal/icons/` (56px webp). When the
  addon adds items, run `python scripts/item-dump/make-ids.py` then
  `python scripts/item-dump/fetch-icons.py`: it reads each new item's icon from the
  WoW Forever client's own data tables (wago.tools), names it with the community
  listfile and downloads it from Blizzard's render server. Unknown items show a
  question mark.
- **Item links** open the site's own item page (see "Item pages" below), and
  `data-item="<id>"` gives them the site's own hover tooltip.
- **Boss portraits** are the addon's own: the pictures it bakes in game with `/dj bake`
  (`Media/Portraits/<displayID>.tga`, 128 px where there is one). After an addon
  update, `python scripts/convert-portraits.py` copies them to
  `public/journal/portraits/baked/` and lists them in `data/baked-portraits.json`.
  A boss with no baked picture falls back to Wowhead's model preview, cropped by
  `data/npc-portraits.json`. Bosses the addon draws with a `customIcon` (Magmatus,
  Lordaeron Captain) use `public/journal/portraits/custom-<boss-slug>.webp`.

## Languages

The home, dungeon and quest pages exist in the addon's ten languages: English
at the plain paths, the others under /de, /fr, /es, /it, /pt, /ru, /ko, /zh-cn
and /zh-tw (`app/[lang]`). The language picker sits at the top right.

- **The addon's translations** (interface strings, dungeon names, locations and
  descriptions, boss names, quest text) come from its Localization folder:

  ```bash
  python scripts/locales-to-json.py
  ```

  writes `data/locales/<locale>.json`. Run it after every addon release, with
  `lua-to-json.py`. Anything the addon has not translated shows in English.
- **The site's own text** (header, footer, home banner, search, the labels the
  addon words differently) is in `app/lib/shell-strings.ts` and
  `app/lib/journal-strings.ts`; class names there are the game's own.
- Item pages, the character page, about and privacy stay English.

## Item pages

Every item the journal shows has a page at `/item/<id>-<name>`, built from the
same loot and quest data (`app/lib/item-index.ts`). Item links across the site
open those pages, and hovering one shows the site's own tooltip
(`ItemTooltips`, fed by a static `/tip/item/<id>` file per item). Nothing is
loaded from Wowhead.

- **Slot and type** ("One-Hand, Mace") for items the loot lists give none come
  from the client's Item table: `python scripts/item-dump/item-slots.py`.

- **Your own text** goes in `data/item-notes.json`, keyed by item ID: a list of
  paragraphs and optional links. Its `_example` entry shows the shape.
- **Full stats** come from the game itself. Until they are dumped, the tooltip
  and the page show the name, slot, the addon's own lines and where the item
  comes from. To dump them:

  ```bash
  python scripts/item-dump/make-ids.py
  # copy scripts/item-dump/DJItemDump into
  # C:/Program Files (x86)/World of Warcraft/_forever_/Interface/AddOns/
  # in game: /djdump, wait for "done", then /reload
  python scripts/item-dump/to-json.py
  python scripts/item-dump/fetch-icons.py   # any icons the tables lacked
  ```

  That writes `data/item-tooltips.json` (the tooltip lines, colours and sell
  price exactly as the client shows them) and `data/item-game.json` (each
  item's name and quality as the game has them; the site uses these over the
  addon's data, which has some wrong). The client leaves some effect lines out
  of the dump ("Chance on hit: ..."); `spell_lines.py` rebuilds those from the
  client's own data tables (wago.tools), and only where the dump lacks them.
  The converter keeps the more complete of the new dump and the current data
  per item; pass `--fresh` after a game patch to take the dump as it is. In
  game, `/djdump refresh` re-reads every saved tooltip (and only ever keeps a
  more complete read). Run it again after an addon data
  update brings new items; `/djdump` only reads the items it has not saved yet.

## Map tab

```bash
python3 scripts/lua-to-json.py "<path>/ForeverDungeonJournal"      # also exports FDJ.DUNGEON_MAPS
python3 scripts/convert-maps.py "<path>/ForeverDungeonJournal" "<path>/wow-ui-textures"
```

`lua-to-json.py` reads the addon's `FDJ.DUNGEON_MAPS` table out of `Core/Journal.lua`
(boss pins, entrances, ladders between levels) together with the English map labels.
`convert-maps.py` then draws one picture per dungeon level into `public/journal/maps/`:
the addon's own map art from `Media/`, or the game's map tiles stitched from an export
of the game's UI textures (https://github.com/Gethe/wow-ui-textures, `classic` branch),
with the addon's `MapPatches` painted over the game's own skulls. Re-run both after
changing map positions in the addon.

## PvP tab

The addon's PvP tab (Systems/PvP.lua, PvPRewards.lua, PvPQuests.lua and
Data/PvPRewards.lua) is at /pvp: the battlegrounds' cards, a rewards page per
battleground (both sides), Honor & Ranks, and Alterac Valley's quests at
/pvp/alterac-valley/quests. `lua-to-json.py` exports it as `PVP` (and runs
PvPQuests.lua for the quest page); `locales-to-json.py` adds those quests'
translations. After an addon update that touches PvP:

```bash
python scripts/item-dump/make-ids.py      # the PvP items join the list
python scripts/item-dump/tier-items.py    # names and quality (scripts/item-dump/pvp_ids.py)
python scripts/item-dump/tier-tooltips.py # their tooltips
python scripts/item-dump/fetch-icons.py   # their icons
python scripts/convert-pvp-art.py         # the cards' loading screens
```
