---
name: Dungeon Journal
description: Every quest, boss and drop in every dungeon on WoW Forever; the addon's own journal, rendered cleanly on the web.
colors:
  ground: "#110f0d"
  bar: "#0b0a08"
  panel: "#1a1714"
  panel-raised: "#221e1a"
  line: "#2c2722"
  line-strong: "#3d362e"
  gold: "#d9b45f"
  gold-bright: "#eecb7e"
  gold-ink: "#1a140b"
  name-gold: "#f3d68e"
  title-cream: "#f7e9c6"
  text: "#eee7d9"
  muted: "#aba191"
typography:
  display:
    fontFamily: "Roboto, Helvetica, Arial, sans-serif"
    fontSize: "clamp(32px, 3.6vw, 52px)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.01em"
  headline:
    fontFamily: "Roboto, Helvetica, Arial, sans-serif"
    fontSize: "clamp(32px, 3.2vw, 44px)"
    fontWeight: 400
    lineHeight: 1.08
  title:
    fontFamily: "Roboto, Helvetica, Arial, sans-serif"
    fontSize: "24px"
    fontWeight: 400
    lineHeight: 1
  card-name:
    fontFamily: "Roboto, Helvetica, Arial, sans-serif"
    fontSize: "19px"
    fontWeight: 400
    lineHeight: 1.12
  body-lg:
    fontFamily: "Roboto, Helvetica, Arial, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "Roboto, Helvetica, Arial, sans-serif"
    fontSize: "16.5px"
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: "Roboto, Helvetica, Arial, sans-serif"
    fontSize: "14.5px"
    fontWeight: 400
    lineHeight: 1.6
  label-caps:
    fontFamily: "Roboto, Helvetica, Arial, sans-serif"
    fontSize: "12.5px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.14em"
  button:
    fontFamily: "Roboto, Helvetica, Arial, sans-serif"
    fontSize: "14.5px"
    fontWeight: 600
    lineHeight: 1
  quest-title:
    fontFamily: "Metamorphous, Marcellus, Georgia, serif"
    fontSize: "25px"
    fontWeight: 400
    lineHeight: 1.12
    letterSpacing: "0.01em"
  quest-reward-head:
    fontFamily: "Metamorphous, Marcellus, Georgia, serif"
    fontSize: "21px"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "0.02em"
  quest-row:
    fontFamily: "Quest Digits, Marcellus, Georgia, serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.2
  quest-heading:
    fontFamily: "Quest Digits, Marcellus, Georgia, serif"
    fontSize: "16.5px"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "0.01em"
  quest-body:
    fontFamily: "Quest Digits, Marcellus, Georgia, serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.45
  quest-meta:
    fontFamily: "Quest Digits, Marcellus, Georgia, serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.3
  quest-pill:
    fontFamily: "Roboto, Helvetica, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1
  quest-pill-badge:
    fontFamily: "Roboto, Helvetica, Arial, sans-serif"
    fontSize: "11px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.04em"
rounded:
  card: "2px"
  control: "6px"
  panel: "12px"
  round: "50%"
spacing:
  card-gap: "14px"
  window-pad: "20px"
  gutter: "24px"
  header: "64px"
  band: "110px"
components:
  button-gold:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.gold-ink}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0 18px"
    height: "40px"
  button-gold-hover:
    backgroundColor: "{colors.gold-bright}"
    textColor: "{colors.gold-ink}"
  button-gold-lg:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.gold-ink}"
    rounded: "{rounded.control}"
    padding: "0 28px"
    height: "50px"
  button-window:
    backgroundColor: "{colors.panel-raised}"
    textColor: "{colors.name-gold}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "38px"
  button-window-hover:
    textColor: "{colors.gold-bright}"
  nav-link:
    textColor: "#c9c0b0"
    typography: "{typography.label-caps}"
    padding: "0 16px"
    height: "64px"
  nav-link-active:
    textColor: "{colors.gold-bright}"
  search-field:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "38px"
  faction-toggle:
    backgroundColor: "{colors.panel-raised}"
    rounded: "{rounded.control}"
    width: "42px"
    height: "40px"
  social-icon:
    backgroundColor: "#1c1915"
    textColor: "#d8cfbf"
    rounded: "{rounded.round}"
    size: "34px"
  journal-window:
    backgroundColor: "{colors.panel}"
    rounded: "{rounded.panel}"
  dungeon-card:
    textColor: "{colors.name-gold}"
    typography: "{typography.card-name}"
    rounded: "{rounded.card}"
---

# Design System: Dungeon Journal

## Overview

**Creative North Star: "The Quiet Window"**

The site is the addon's own Dungeon Journal home, rendered cleanly on the web. One dark bar sits over a near-black ground; below it a short painted banner runs edge to edge and darkens into the page, carrying a centred bold Roboto title, one line and one gold action. Then the journal itself: a single dark rounded window with a centred gold title bar, a search field, the addon's emblems and faction choice, and the dungeons as wide 3:1 painted strips with their facts written on the art, the way the game draws them. A closing painted band and a quiet footer finish the page. The cleanliness bar is a modern game studio site: few surfaces, generous air, nothing ornamental between the player and the paintings.

Paintings carry all the colour. Gold is the colour of names, the active state and the one filled action. Everything else is warm near-black, soft lines and off-white text. Density is that of the addon's window: a compact grid of strips, small labels, no apparatus around them.

The shell wraps a bounded sub-system, the in-game Encounter Journal window used on dungeon, quest, character, about and privacy pages (parchment pane, dark chrome, red buttons, Manrope headings). That window mirrors the addon and keeps its own tokens; nothing in this system restyles it, and none of its tokens belong to the shell palette (see Components, "The Encounter Journal Window").

**Key Characteristics:**
- One dark header bar: logo left, tracked-caps nav centred, round social icons and the gold Download right.
- Paintings edge to edge, capped at their export width and faded into the ground beyond it.
- Roboto everywhere: titles and dungeon names at 600 in gold with a black outline, text at 400.
- One rounded dark window holding the dungeon grid, lifted by a soft shadow.
- Dungeon cards are 3:1 painted strips with name, quest count and level on the art.
- Soft corners on surfaces and controls (6px and 12px); cards stay near-square (2px).

## Colors

A warm, low-chroma near-black and gold palette; the paintings supply all other colour.

### Primary
- **Download Gold** (`gold`): the filled primary button, focus rings, the search field's focus border, the selected faction's border, text links. **Bright Gold** (`gold-bright`) is its hover and the active nav colour.
- **Gold Ink** (`gold-ink`): text and icons on a gold fill; the selection text colour.
- **Name Gold** (`name-gold`): the addon's name colour. Logo wordmark, the window title, dungeon names on cards, the dark window buttons.
- **Title Cream** (`title-cream`): large display titles set over paintings (hero, closing band).

### Neutral
- **Ground** (`ground`): the page.
- **Bar** (`bar`): the header, mobile menu and footer.
- **Panel** (`panel`) and **Panel Raised** (`panel-raised`): the journal window and dropdown; raised for buttons, faction toggles and hovered menu items inside them.
- **Line** (`line`) and **Line Strong** (`line-strong`): 1px borders and dividers; strong for window buttons.
- **Text** (`text`): body and link text. **Muted** (`muted`): small labels, blurbs, level ranges, group heads.

### Named Rules
**The Paintings Carry Colour Rule.** The shell has no hue of its own beyond gold. Colour on the page comes from the dungeon paintings and the addon's crests and emblems.

**The One Gold Fill Rule.** Gold fills only the primary action button. Everywhere else gold is type or a 1px line. No gold panels, gradients or glows on surfaces.

## Typography

**Font:** Roboto (with Helvetica, Arial): titles and dungeon names at 600, the banner title at 700, text at 400.

**Character:** one plain, legible face for everything a player reads mid-run. Names keep the addon's look through colour rather than the face: Name Gold with a crisp 1px black outline over a soft shadow.

### Hierarchy
- **Display** (400, clamp(46px, 6.4vw, 92px), 1, 0.01em): the hero title, centred over the painting in Title Cream, balanced wrap.
- **Headline** (400, clamp(32px, 3.2vw, 44px), 1.08): the closing band title.
- **Title** (400, 24px): the window's centred title; the logo wordmark at 21px (22px in the footer, 17 to 19px on phones).
- **Card Name** (400, 19px, 1.12; 18px under 600px): dungeon names on the art, Name Gold.
- **Body Large** (18px, 1.5, max 50ch): the hero line. **Body** (16.5px, 1.6): band copy. **Body Small** (14.5px, 1.6, max 50ch): footer blurb, menu and footer links.
- **Label Caps** (700, 12.5px, 0.14em, uppercase): main nav and mobile menu items; menu group heads and footer column heads at 11.5px, 0.14 to 0.16em, in Muted. Card level reads "LV 17-26" at 11.5px, 0.08em.
- **Button** (600, 14.5px; 16px on the large button).

### Named Rules
**The Addon's Voice Rule.** Anything the addon names in gold (the journal title, dungeon names) is Roboto 600 in Name Gold with the black outline. Labels and running text are Roboto 400.

## Layout

A centred 1320px measure with a 24px gutter (12px under 860px). The header is fixed at 64px (58px under 860px) and `scroll-padding-top` follows it. The bar is a three-column grid: the logo, socials and Download on the left, the nav (Dungeons, My Character, Donate) in the middle, the language picker on the right. The side columns share the spare width equally but never shrink below their content, so the nav sits at the page's centre on wide screens and shifts right only when the left group needs the room. The hero is clamp(280px, 36vh, 380px) tall (360px on phones) with its copy centred, so the dungeons sit close under the menu. The journal window follows immediately (8px below the hero) inside the measure; its grid is three columns with 14px gaps and 20px padding, two columns under 1180px, one under 600px. The closing band sits 110px below the window (72px on phones), min 420px tall, copy on the left at max 520px. The footer is a 2fr / 1fr / 1fr grid (about, two link columns), two columns on phones with the about block spanning.

Responsive behaviour: under 1180px the nav and socials collapse into a burger and the Download button stays in the bar at every width; under 860px the window bar stacks (title, then a full-width search) and the toolbar's button goes full width; on wider screens than 1460px the hero painting stops at 1440px and fades into the ground at its sides.

### Named Rules
**The Never Stretched Rule.** A painting never renders wider than its export allows: the hero art caps at 1440px and the band art at 1150px, fading into the ground beyond that with a mask, never scaled up to fill.

## Elevation & Depth

Mostly flat and tonal (ground, then panel, then raised), with soft shadows reserved for the things that sit above the page. Text over paintings is made legible by shade gradients only where the text sits, plus a text shadow.

### Shadow Vocabulary
- **Window lift** (`box-shadow: 0 30px 60px rgba(0,0,0,0.35)`): the journal window, so it reads as the addon's window over the page.
- **Dropped menu** (`box-shadow: 0 24px 60px rgba(0,0,0,0.55)`): the Dungeons dropdown.
- **Card hover** (`box-shadow: inset 0 0 0 1px #eecb7e, 0 8px 22px rgba(0,0,0,0.45)`): a hovered or focused dungeon card.
- **Card inner line** (`box-shadow: inset 0 0 0 1px rgba(217,180,95,0.38)`): the thin gold-brown line inside every card's black border at rest.

### Named Rules
**The Shade Where Text Sits Rule.** A painting gets darkening only where text lies on it: the card's top and bottom shade (60% and 55% black at the edges, clear through the middle), the hero's foot fading into the ground, the band's copy side. Never a full haze over the art.

## Shapes

Soft rectangles. Panels (window, dropdown) take 12px; controls (buttons, search, faction toggles, window buttons, menu items) take 6px; dungeon cards stay near-square at 2px with a 1px black border, like the addon's frames. Social icons are circles. Lines are 1px.

## Components

### Buttons
- **Gold (primary):** Download Gold fill, Gold Ink label at 600, 40px tall, 6px radius, optional download icon. Large variant 50px with 28px padding for the hero and the band. One per region: the header Download, the hero's download, the band's CurseForge link.
- **Hover / Focus:** fill brightens to Bright Gold in 0.15s; focus everywhere in the shell is a 2px gold outline offset 3px.
- **Window button:** the addon's dark button: Panel Raised fill, Line Strong border, Roboto 600 15px label in Name Gold, 38px tall. Border turns gold and label brightens on hover. Used inside the journal window's toolbar.
- **Text link:** gold, underlined with a 40% gold line offset 4px; underline goes solid on hover. The second voice beside a gold button ("or get it on Wago").

### Chips (faction toggle)
- **Style:** two 42 by 40px square buttons, each holding a 26px faction crest on Panel Raised with a Line border, 6px radius.
- **State:** idle crests sit at 45% opacity (80% on hover); the selected one gets a gold border, a warmer fill (#2a2419) and a full-opacity crest. Hover springs the button up 3px to 110% and tilts the crest, on the same `--bounce` curve; pressing squashes it to 90%.

### Cards / Containers
- **Journal window:** Panel fill, Line border, 12px radius, window lift shadow. A title bar (search left, Roboto 600 title centred, an empty right column for balance) over a Line divider, then a toolbar (the addon's emblems, faction toggle, window button pushed right), then the grid.
- **Dungeon card:** a 3:1 painted strip, painting covering, 1px black border, 2px radius, thin gold-brown inner line. Name top-left in Card Name; crest and quest count top-right at 13px; "LV" range bottom-left. Hover springs the card up 6px and to 102.5% on an overshooting curve (`--bounce`, cubic-bezier(0.34, 1.56, 0.64, 1), 0.5s), brightens the inner line to Bright Gold and deepens the drop shadow while the shade eases to 75%. Pressing settles it to 98.5%. Nothing moves under reduced motion. "Coming soon" cards are greyed (grayscale 0.7, brightness 0.75).

### Inputs / Fields
- **Search:** 38px field on Ground with a Line border and 6px radius, a 15px search icon; placeholder and icon in a warm grey (#8e8575). Caret is gold.
- **Focus:** border and icon turn gold.

### Navigation
- **Bar:** Bar background with a 5% white bottom line; nav items in Label Caps, idle in a soft off-white, hover and active in Bright Gold (0.15s). No underline.
- **Dungeons dropdown:** a 12px-radius Panel below the bar, up to 1040px wide: a "New in WoW Forever" column and a three-column classic list, each item a name with its level range (tabular, Muted) in a 6px-radius row that lifts to Panel Raised on hover; a centred gold "Show all dungeons" link. Opens on hover, click or keyboard; closes on Escape and outside click.
- **Mobile:** a burger opens a list on Bar with Label Caps items divided by Line; the dungeon list expands in place; a full-width gold Download closes the menu.
- **Socials:** 34px circles (36px in the footer) on a dark warm fill; hover lifts the fill and turns the icon Bright Gold.
- **Donate:** a nav item like the others, opening Buy Me a Coffee in a new tab (also in the footer and the mobile menu). About lives in the footer only.
- **Search:** right of Download, a 200px field (Ink fill, Line border, gold when focused) over everything: dungeons with their abbreviations, bosses, quests and items, in the page's language. Results drop into a 440px Panel grouped Dungeons / Bosses / Quests / Items, each row a 32px picture (card art, round portrait, item icon), the name (dungeons in Name Gold, items in their quality colour) and a muted line. Below 1500px the field is a magnifier that opens to 300px; on phones it opens as a full-width bar under the header. "/" focuses it; arrows and Enter pick. The journal window's own search is gone.
- **Language picker:** top right, a 34px pill with a globe, the language code and a chevron; its menu (a Panel) lists the ten languages in their own names, the current one in gold.

### Hero (signature)
One painting edge to edge with a foot-weighted shade, the Display title, one Body Large line and a large gold download button, centred. (It was a three-slide carousel; the map and browse slides only pointed further down the same page and were removed.)

### Closing Band (signature)
A painting on the right side of the page (max 1150px), masked in from the copy side and shaded toward it, with a Headline, Body copy, a large gold button and a text link on the left. On phones the shade turns vertical and the copy sits over a darkened painting.

### The Encounter Journal Window (bounded sub-system)
Dungeon, quest, character, about and privacy pages render the in-game Encounter Journal window: its own `--wf-*` / `--ej-*` / `--parchment` tokens, Manrope headings, parchment pane, cream rows, red buttons, rounded window chrome and glows. It mirrors the addon and is out of this system's scope. The shell surrounds it (header, footer, ground) and never restyles it; its colours, radii and glows must not leak into shell surfaces, and shell tokens must not be applied inside it. The home window's toolbar embeds one of its components unchanged, the addon's emblems.

**Quest panes (the addon's 2.1.1 quest view).** The Quests tab and `/quest` pages follow the addon's own quest view, scoped by `.wq` (the quest panel) and `.wq-list` (the quest list):

- **Type.** The game sets quest titles and the Rewards header in Morpheus and everything else in Friz Quadrata. Both belong to Blizzard and are not served; the free, self-hosted stand-ins are Metamorphous in small caps (titles, quest-title and quest-reward-head) and Marcellus (quest-heading, quest-body, quest-row, quest-meta). Marcellus's old-style 1 and 0 read as I and O, so digits come from Cinzel through a digits-only face, "Quest Digits" (unicode-range 0-9). Pill numbers are Roboto 600.
- **Title.** Gold #e2a63a with a 1px dark brown edge (#3d2306), as the addon prints it. The Rewards header is the addon's orange #d1851a with a black shadow, "Reward" for one item and "Rewards" for more.
- **List rows.** No faction crests (the list is one faction's; the toggle above picks it). A quest not yet taken wears the addon's round gold ! (`public/journal/ui/pickup-mark.webp`, from the addon's Media/PickUpMark.tga) at the right.
- **Reward items.** The addon's dark boxes: rgba(28,20,12,0.94) with a 2px tooltip-grey edge (#8d877c), 36px icon, the item name in the game's bright quality colour (the quality the game reports, from the item dump, not the addon's data); hover warms to #4d3819. "Also" and "Later in the chain" label their groups.
- **XP and money.** The addon's pills: XP on #422b6b with a #73529e edge and a #7333cc "XP" badge in #ffed80; money on #1a1206 with a #734d1c edge, text #ffebb8 and the game's coins. Reputation is the addon's green pill on its own row: #1f3d14 with a #3f7d2a edge and a #2f6b1c "+100" badge (red for a loss). After reward items, "You will also receive:" introduces the pills; a pick-one reward is headed "Choose one reward".
- **Order.** Objective, Starts at, Turn in, Notes, then the rewards, as in game. Those four headings are white with a 1px black edge, as the addon sets them; "You will also receive:" and reward group labels stay dark ink.

These colours are the game's and stay inside the journal window; none of them belong to the shell palette.

## Do's and Don'ts

### Do:
- **Do** show dungeons as the addon does: 3:1 painted strips with name, quest count and level on the art, in the journal window's grid.
- **Do** set the journal title, logo and dungeon names in Roboto 600 in Name Gold with the black outline; everything else in Roboto 400.
- **Do** keep one gold-filled button per region; pair it with a text link or a dark window button for a second action.
- **Do** keep the Download reachable in the header at every width.
- **Do** run paintings edge to edge but cap them at their export width and fade them into the ground beyond it.
- **Do** shade a painting only where text sits on it.

### Don't:
- **Don't** bring back the guide-book apparatus the user rejected: contents pages with dotted leaders, fact bands under cards, red callout discs.
- **Don't** crop a dungeon painting taller than the game does or stretch one past its export width.
- **Don't** fill surfaces with gold or add gold gradients and glows to panels and buttons.
- **Don't** put a full-cover haze over a painting.
- **Don't** bring the Encounter Journal window's parchment, red buttons, Manrope or `--wf-*` / `--ej-*` tokens into the shell, or shell tokens into that window.
