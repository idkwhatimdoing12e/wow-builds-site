---
name: Dungeon Journal
description: Every quest, boss and drop in every dungeon on WoW Forever, set like a printed strategy guide.
colors:
  guide-ink: "#121110"
  guide-page: "#191714"
  guide-page-raised: "#211e1a"
  hairline: "#3b342a"
  hairline-soft: "#29251f"
  leaf-gold: "#d6b062"
  leaf-gold-bright: "#ecca80"
  gold-plate-ink: "#17130d"
  page-text: "#ece5d6"
  margin-note: "#aaa08d"
  leader-dot: "#6f675a"
  forever-blue: "#7fb3c0"
  callout-red: "#9b2b22"
  callout-red-edge: "#c4493c"
  callout-white: "#fff6ea"
typography:
  display:
    fontFamily: "Marcellus, Trajan Pro, Georgia, serif"
    fontSize: "clamp(34px, 3.6vw, 52px)"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "0em"
  headline:
    fontFamily: "Marcellus, Trajan Pro, Georgia, serif"
    fontSize: "clamp(34px, 3.4vw, 46px)"
    fontWeight: 400
    lineHeight: 1
  title:
    fontFamily: "Marcellus, Trajan Pro, Georgia, serif"
    fontSize: "22px"
    fontWeight: 400
    lineHeight: 1.15
  section-caps:
    fontFamily: "Marcellus SC, Marcellus, Georgia, serif"
    fontSize: "15px"
    fontWeight: 400
    letterSpacing: "0.03em"
  body:
    fontFamily: "Noto Sans, Helvetica, Arial, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.55
  body-sm:
    fontFamily: "Noto Sans, Helvetica, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
  contents-line:
    fontFamily: "Noto Sans, Helvetica, Arial, sans-serif"
    fontSize: "14.5px"
    fontWeight: 400
    lineHeight: 1.4
    fontFeature: "tnum"
  label:
    fontFamily: "Noto Sans, Helvetica, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1
rounded:
  none: "0px"
  plate: "2px"
  disc: "11px"
spacing:
  leader-gap: "6px"
  inline: "14px"
  gutter: "28px"
  page-y: "32px"
  page-x: "44px"
  chapter: "88px"
components:
  button-gold:
    backgroundColor: "{colors.leaf-gold}"
    textColor: "{colors.gold-plate-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.plate}"
    padding: "0 18px"
    height: "42px"
  button-gold-hover:
    backgroundColor: "{colors.leaf-gold-bright}"
    textColor: "{colors.gold-plate-ink}"
  button-gold-lg:
    backgroundColor: "{colors.leaf-gold}"
    textColor: "{colors.gold-plate-ink}"
    rounded: "{rounded.plate}"
    padding: "0 26px"
    height: "50px"
  button-line:
    backgroundColor: "transparent"
    textColor: "{colors.page-text}"
    typography: "{typography.label}"
    rounded: "{rounded.plate}"
    padding: "0 18px"
    height: "42px"
  button-line-hover:
    textColor: "{colors.leaf-gold-bright}"
  callout-disc:
    backgroundColor: "{colors.callout-red}"
    textColor: "{colors.callout-white}"
    rounded: "{rounded.disc}"
    padding: "0 6px"
    height: "22px"
  nav-link:
    textColor: "{colors.page-text}"
    padding: "0 14px"
    height: "70px"
  nav-link-active:
    textColor: "{colors.leaf-gold}"
  faction-toggle-on:
    backgroundColor: "{colors.guide-page-raised}"
    textColor: "{colors.leaf-gold}"
    rounded: "{rounded.none}"
    height: "38px"
---

# Design System: Dungeon Journal

## Overview

**Creative North Star: "The Official Strategy Guide"**

The site shell is set like a well-made printed strategy guide for the game: glossy near-black pages, gold chapter heads in a flared Roman capital, warm off-white body text, hairline rules, and contents lines with dotted leaders running out to a level range. The home page opens as a two-page spread on a single gutter (a chapter opener on the left, the Contents on the right), and every dungeon gets its page. Depth comes from paper, not light: a page panel sits a single step above the ground, framed by a hairline.

Paintings are the only colour-rich surface and run at full colour with no haze or scrim; text never sits on a painting, it sits on its own page beneath or beside it. Gold is the ink of headings, the active state and the one primary action. Density is that of a reference book: compact lists, tabular numbers, generous chapter breaks.

The shell wraps a bounded sub-system, the in-game Encounter Journal window (parchment pane, dark chrome, red buttons, Manrope headings). That window mirrors the addon and keeps its own tokens; nothing in this system restyles it, and none of its tokens belong to the shell palette (see Components, "The Journal Window").

**Key Characteristics:**
- Warm near-black ground with pages lifted one tonal step and framed by hairlines.
- Gold Marcellus chapter heads at weight 400; Noto Sans for everything read.
- Dotted-leader contents lines with tabular level ranges.
- Paintings at full colour inside a double-framed plate, never under text.
- Square corners (0 to 2px); the only round shape is the red numbered callout disc.
- Double rules close the header and open the footer, like a page's running head and back page.

## Colors

A warm, low-chroma black-and-gold palette with one red and one blue used as printed callouts.

### Primary
- **Leaf Gold** (`leaf-gold`): chapter heads, logo wordmark, the active nav link and its underline, the gold plate button, focus rings, text links. **Leaf Gold Bright** (`leaf-gold-bright`) is its hover state only.
- **Gold Plate Ink** (`gold-plate-ink`): text and icons on the gold plate.

### Secondary
- **Callout Red** (`callout-red`, edge `callout-red-edge`, numerals `callout-white`): the numbered disc that carries a count (quests per faction on each dungeon card). Never a button, never a background.

### Tertiary
- **Forever Blue** (`forever-blue`): the "New in Forever" small-caps note, matching the blue of the WF badge. Text only.

### Neutral
- **Guide Ink** (`guide-ink`): the page ground, header and footer bands.
- **Guide Page** (`guide-page`): a lifted page (the opening spread, dropdown index, closing sidebar box).
- **Guide Page Raised** (`guide-page-raised`): the selected segment of a toggle.
- **Hairline** (`hairline`) and **Hairline Soft** (`hairline-soft`): rules, page frames, double rules; the soft one for secondary dividers and card baselines.
- **Page Text** (`page-text`): body and list text.
- **Margin Note** (`margin-note`): ledes, level ranges, group labels, footer blurb, idle icons.
- **Leader Dot** (`leader-dot`): dotted leaders and the idle search underline only; too faint for text.

### Named Rules
**The Gold Is Ink Rule.** Gold is used as type and line (heads, active marks, focus, links) and as exactly one filled shape: the gold plate button. No gold panels, gold gradients or gold glows.

**The Printed Callout Rule.** Red and blue appear only as the guide's printed callouts (the numbered disc, the "New in Forever" note). They never carry actions or fill surfaces.

## Typography

**Display Font:** Marcellus (with Trajan Pro, Georgia)
**Caps Font:** Marcellus SC (with Marcellus, Georgia)
**Body Font:** Noto Sans (with Helvetica, Arial)

**Character:** A flared, inscriptional Roman capital for chapter heads against a plain, highly legible humanist sans for everything a player reads mid-run. Headings are always weight 400; Marcellus has no bold.

### Hierarchy
- **Display** (400, clamp(34px, 3.6vw, 52px), 1.05): the chapter opener title on the spread. Balanced wrap.
- **Headline** (400, clamp(34px, 3.4vw, 46px), 1): chapter titles ("The dungeons"); the Contents title at 34px and the sidebar box at clamp(28px, 2.6vw, 38px) sit in the same register.
- **Title** (400, 22px, 1.15; 19px at 860px, 18px at 560px): dungeon names on cards; dropdown and footer column heads at 17 to 18px in gold.
- **Section Caps** (Marcellus SC, 13 to 15px, 0.02 to 0.03em): contents group labels, the running head, the "New in Forever" note. Small caps from the font, never `text-transform: uppercase`.
- **Body** (400, 17px, 1.55, max 46 to 54ch): opener and sidebar text. **Body Small** (15px, 1.6) for ledes and the footer blurb.
- **Contents Line** (14.5px, 1.4, tabular numerals): every list with a dotted leader.
- **Label** (600, 15px, 1): buttons; nav links at 500, 15.5px.

### Named Rules
**The Numbers Line Up Rule.** Level ranges, counts and folio numbers use tabular figures so the right edge of every contents column aligns.

## Layout

A centred 1320px measure with a 28px gutter (16px under 860px). The header is fixed: a 30px running head over a 70px main bar (104px total, 65px on phones where the running head drops), and `scroll-padding-top` follows it. The home page opens with a two-page spread split 5fr / 6fr on one gutter; the gutter is a 1px hairline with a faint shade either side. Chapters are separated by large breaks (88px, 56px on phones; the sidebar box takes 96px above and 88px below). The dungeon index is a three-column grid (28px row, 24px column), two columns under 1180px, and on phones under 560px becomes rows: a 112px plate beside the facts.

Responsive behaviour: under 1180px the nav collapses to a burger; under 1000px the spread stacks (opener above contents) and the gutter disappears; under 860px the Contents fold into a closed disclosure row and the sidebar box stacks.

## Elevation & Depth

Flat and tonal. Depth is a page lifted one step (`guide-ink` to `guide-page`) with a hairline frame. Painted plates get a print frame: a 1px black border plus a hairline outline offset 3 to 5px. Shadows are rare and functional.

### Shadow Vocabulary
- **Dropped index** (`box-shadow: 0 24px 48px rgba(0,0,0,0.55)`): the Dungeons dropdown only, so it reads above the page.
- **Plate press** (`box-shadow: inset 0 -2px 0 rgba(0,0,0,0.18)`, active `inset 0 1px 2px rgba(0,0,0,0.3)`): the gold plate button's struck edge.

### Named Rules
**The Paper Not Light Rule.** Pages separate by tone and hairline. No glows, no ambient shadows on cards or panels.

## Shapes

Rectangles. Buttons take a 2px corner; pages, plates, toggles and cards are square. The only round form is the numbered callout disc (22px tall, 11px radius). Rules are 1px solid hairlines, 1px dotted leaders, and the 3px double rule that closes the header and opens the footer. Painted plates wear a double frame (black border, hairline outline offset).

## Components

### Buttons
- **Shape:** near-square plate (2px).
- **Gold plate:** `leaf-gold` fill, slightly lighter edge, `gold-plate-ink` label at 600, 42px tall (50px large). One per view region: the download or the slide's action.
- **Hover / Focus:** fill brightens to `leaf-gold-bright` in 0.15s; focus is a 2px gold outline offset 3px; active presses the inset edge.
- **Ruled outline:** transparent with a hairline border and page-text label; border and label turn gold on hover.
- **Text link:** gold, underlined with a 40% gold line offset 4px; underline goes solid on hover. The second voice beside a gold plate ("or get it on Wago").

### Chips (faction toggle)
- **Style:** a segmented strip in a hairline frame, segments divided by hairlines, 38px tall, faction crest plus label.
- **State:** idle segments are muted with a greyed crest; the selected one takes `guide-page-raised`, gold text and a full-colour crest.

### Cards / Containers
- **Dungeon card:** a painted plate (16:7, 4:3 on phones) in the print double frame, then the name in Title, muted facts, and a foot with the red disc count and an optional Forever note, closed by a soft hairline. Hover brightens the painting slightly and turns the outline and name gold. "Coming soon" cards grey the painting.
- **Page panel (spread, sidebar box):** `guide-page` with a hairline frame; the sidebar box adds a soft outer outline offset 5px.

### Inputs / Fields
- **Search:** no box. A bottom hairline (`leader-dot`) under a 44px field with a search icon; caret is gold.
- **Focus:** the underline and icon turn gold.

### Navigation
- **Bar:** Noto Sans 500 at 15.5px in page text. Hover and active turn gold and draw a 1px gold underline from the left (0.25s, cubic-bezier(0.2, 0.8, 0.2, 1)); no underline motion under reduced motion.
- **Dungeons dropdown:** a dropped index page on `guide-page`, gold Marcellus group heads, dotted-leader lines to the level range.
- **Mobile:** burger opens a full-width list on `guide-ink`, items in Marcellus 20px with soft hairline dividers; the dungeon list expands in place.
- **Running head:** small caps title left with social icons, quick links right, over a soft hairline.

### Contents Line (signature)
Name, a flexible 1px dotted leader in `leader-dot`, then the tabular level range in Margin Note. Hover or focus turns the name gold-bright and the leader and range gold. On the home spread, hovering or focusing a line turns the left page's painting to that dungeon with a 0.32s fade-and-unblur.

### Numbered Callout Disc (signature)
A red disc carrying a count in bold Noto Sans 12.5px, tabular. Used for counts only.

### The Journal Window (bounded sub-system)
Dungeon, quest, character, about, supporters and privacy pages render the in-game Encounter Journal window: its own `--wf-*` / `--ej-*` tokens, Manrope headings, parchment pane, cream rows, red buttons, rounded window chrome and glows. It mirrors the addon and is out of this system's scope. The shell surrounds it (header, footer, ground) and never restyles it; its colours, radii and glows must not leak into shell surfaces, and shell tokens must not be applied inside it.

## Do's and Don'ts

### Do:
- **Do** set every chapter head in Marcellus 400 in Leaf Gold; use Marcellus SC for group labels and running heads.
- **Do** list dungeons as contents lines: name, dotted leader, tabular level range.
- **Do** show paintings at full colour inside the print double frame, with text on the page below or beside them.
- **Do** lift panels by one tone step and a hairline, never by shadow.
- **Do** keep one gold plate per region; pair it with a text link or ruled outline for the second action.
- **Do** close the header and open the footer with the 3px double hairline.

### Don't:
- **Don't** lay text over a painting or put a dark haze or gradient scrim on shell paintings.
- **Don't** round shell corners past 2px; the callout disc is the only round shape.
- **Don't** use red or blue for actions or surfaces; they are printed callouts only.
- **Don't** add glows, gold gradients or ambient card shadows to the shell.
- **Don't** fake small caps with `text-transform: uppercase` and tracking; use Marcellus SC.
- **Don't** bring the journal window's parchment, red buttons, Manrope or `--wf-*` / `--ej-*` tokens into the shell, or shell tokens into the window.
