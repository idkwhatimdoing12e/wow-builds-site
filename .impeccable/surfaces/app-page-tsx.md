---
version: 1
slug: "app-page-tsx"
primary_target: "app/page.tsx"
related_targets: ["app/components/site/SiteHeader.tsx","app/components/site/SiteFooter.tsx","app/components/site/HomeHero.tsx","app/components/journal/JournalHome.tsx"]
---

# Home page and site shell

Scope: home page (`app/page.tsx`) plus the shared shell (header, footer) and the home dungeon grid. Mode: Persuade. The in-game journal window on dungeon, quest, character, about, supporters and privacy pages is out of scope and stays as it is.

Audience and job: WoW Forever players, either looking for one dungeon's quests and loot or coming to download the addon. Both actions carry equal weight. Proof is the real data itself: every dungeon, level ranges, quest counts per faction, the painted art. No invented download counts or testimonials.

Constraints: keep the existing structure (header with Dungeons dropdown, three-slide hero, dungeon grid with Forever filter, Raids medallion, faction toggle and search, download banner, footer). Keep the WF badge logo and the painted card art. Keep the Blizzard non-affiliation line.

History: the first build (printed-guide spread with a contents page, cards with facts under the art, red discs) shipped and was rejected by the user on the live site: "the images are squished compared to the actual add-on... in game it looks cleaner... way too overcomplicated. I want to keep it simple with my dungeons, and not this table of content." The footer from that build stays. Mid-build the user named the cleanliness bar: "https://www.dreamhaven.com/ the cleanliness that I'm looking for... if you could get this vibe". That is why the header became one bar (the utility bar was folded into the footer and the mobile menu) and the hero runs full bleed with centred copy.

## Direction contract

THESIS: The home page is the addon's own Dungeon Journal home, rendered cleanly on the web: wide painted strips with their facts on the art, inside one quiet window. It refuses the guide-book apparatus (contents page, fact bands under cards, callout discs) and any card that crops the painting taller than the game does.

OWN-WORLD: Warm near-black ground and header from the shell; gold Marcellus (the Friz-like face) for titles and card names; Noto Sans for small text. Cards are 3:1 painted strips in a 1px black border with a thin gold-brown inner line, name top-left, crest and quest count top-right, LV range bottom-left, a soft top and bottom shade only where text sits. The window is a dark panel with a centred gold title bar, search at the left, the addon's emblems and dark gold-text buttons in the toolbar.

STORY: A player recognises the addon at a glance, finds their dungeon in the grid (or by search), and the download is one click away in the header (at every width), the hero, the toolbar and the closing band.

FIRST VIEWPORT: One dark header bar (logo left, tracked-caps nav centred, round social icons and the gold Download right). Below it the hero, after Dreamhaven: a painting edge to edge (capped at 1440px wide and faded into the ground beyond that, since the art is 1200px), darkening into the page at its foot, with the title large and centred, one line, and the slide's gold action; thin bar indicators bottom-centre. The top edge of the journal window shows below it.

FORM: user-pinned direction; seed: none (pinned) "the images subs are squished, compared to the actual add-on... in game, it looks cleaner... I want to keep it simple with my dungeons, and not this table of content"

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
