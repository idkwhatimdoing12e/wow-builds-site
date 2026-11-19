---
version: 1
slug: "app-page-tsx"
primary_target: "app/page.tsx"
related_targets: ["app/components/site/SiteHeader.tsx","app/components/site/SiteFooter.tsx","app/components/site/HomeHero.tsx","app/components/journal/JournalHome.tsx"]
---

# Home page and site shell

Scope: home page (`app/page.tsx`) plus the shared shell (header, footer) and the home dungeon grid. Mode: Persuade. The in-game journal window on dungeon, quest, character, about, supporters and privacy pages is out of scope and stays as it is.

Audience and job: WoW Forever players, either looking for one dungeon's quests and loot or coming to download the addon. Both actions carry equal weight. Proof is the real data itself: every dungeon, level ranges, quest counts per faction, the painted art. No invented download counts or testimonials.

Constraints: keep the existing structure (utility bar, header with Dungeons dropdown, three-slide hero, dungeon grid with Forever filter, Raids medallion, faction toggle and search, download banner, footer). Keep the WF badge logo and the painted card art. Keep the Blizzard non-affiliation line.

## Direction contract

THESIS: The site reads like a well-made printed strategy guide: an opening contents spread and a page per dungeon. It refuses the centred headline over an art carousel above a grid of identical cards.

OWN-WORLD: Glossy black guide pages (warm near-black ground, slightly lifted page panels), gold Marcellus chapter heads, Noto Sans body in warm off-white, hairline rules, contents lines with dotted leaders to the level range, red numbered callout discs, paintings at full colour with no dark haze, so text always sits on its own page. The gold button reads as a gold plate.

STORY: A player sees in one look that this is the addon's journal and that it covers every WoW Forever dungeon. They open their dungeon from the contents in one click, or download the addon.

FIRST VIEWPORT: A slim running head, then the header, then an open two-page spread on one gutter. The left page is a chapter opener: the painting fills its top two thirds, with the slide title, one line, the primary action (gold Download, or the slide's own action) and page-number slide controls under it. The right page is the Contents: every dungeon listed with dotted leaders to its level range, grouped New in WoW Forever and Classic. Signature interaction: hovering or focusing a contents line swaps the left page's painting to that dungeon (a short crossfade).

FORM: grounded direction "The Official Strategy Guide", first of three in the user-requested safer lineup (re-roll 1), chosen by the user; seed:57440d49acd0ad80

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
