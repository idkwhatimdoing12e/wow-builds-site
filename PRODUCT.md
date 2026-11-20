# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

World of Warcraft: Forever players. Two arrivals, weighted equally:

- Players who reach a dungeon page from search, mid-levelling, wanting that dungeon's quests (for their faction), bosses, drops or map before they zone in.
- Players who hear about the Dungeon Journal addon and come to download it.

## Product Purpose

Dungeon Journal is a free WoW Forever addon that shows every dungeon's quests, bosses, drops and maps in one in-game window. This site (foreverjournal.pro) is the same journal on the web, generated from the addon's own data, so both always match. Success is a visitor either finding their dungeon fast or leaving with the addon installed; the home page gives both equal weight.

## Positioning

It is the addon's own data, rendered on the web the way the addon renders it in game: same dungeons, same quest lists per faction, same Map tab, same loot tables. A generic database site cannot claim that the page and the in-game window are the same journal.

## Operating Context

- Players read it between pulls or before a run, often on a second monitor or a phone next to the game.
- Faction (Alliance/Horde) changes which quests count; the choice persists in the browser.
- The WoW Forever emblem (it opens the dungeon list, as the addon's dungeon tab does since 2.0.10) and a greyed-out Raids medallion mirror the addon's home emblems.
- "My Character" imports a character code exported from the addon (`/dj export`) to show quest progress.
- Item links open the site's own item pages and tooltips.
- Distribution: CurseForge (primary download) and Wago. Community on Discord and YouTube; funding via Patreon and Buy Me a Coffee (the Donate link); there is no supporters list.
- Monetised with Google AdSense slots on dungeon and quest pages; GA4 analytics.

## Capabilities and Constraints

- Next.js 16 app router, Tailwind 4 plus a large hand-written `app/globals.css`. Static data in `data/*.json` built from the addon.
- 30+ dungeons, each with painted card art, quests, bosses, loot, and multi-level maps.
- A page for every item the journal shows (`/item/<id>-<name>`): its tooltip, the bosses that drop it, the quests that reward or use it, and the owner's own notes (`data/item-notes.json`). Item links open these pages and show the site's own tooltip on hover; nothing is loaded from Wowhead. Full stats come from an in-game dump (`scripts/item-dump`), icons and slots from the client's own data tables.
- The journal window on dungeon, quest, character, about and privacy pages deliberately copies the in-game Encounter Journal skin (parchment pane, red buttons, Map/Bosses/Quests tabs). It stays matched to the addon; site-shell redesigns leave it alone.
- Raids are not in the journal yet ("Coming Soon").

## Brand Commitments

- Name: Dungeon Journal. Domain: foreverjournal.pro. Tagline: "Every quest, boss and drop in every dungeon on WoW Forever".
- The round blue/gold WF badge (`public/journal/ui/forever-icon.png`) is the logo and stays.
- The painted dungeon card art (`public/journal/art/*-card.webp`, `*-page.webp`) stays as the site's imagery.
- Fan project; must state it is not affiliated with or endorsed by Blizzard Entertainment.
- Voice: plain, specific, first-hand ("One person builds it, in the evenings").

## Evidence on Hand

- Real dungeon data, quest counts per faction, level ranges, card art, maps, boss portraits, item icons (`data/`, `public/journal/`).
- No download counts, ratings, testimonials or press are on hand; do not invent them.

## Product Principles

1. The web journal and the in-game journal are one thing; nothing on the site contradicts what the addon shows.
2. Get a player to their dungeon in one move from any page.
3. The download is always one click away, never shouted.
4. Free and made by one person: say so plainly, never dress it as a company.
