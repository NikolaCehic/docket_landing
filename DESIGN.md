---
name: Docket
description: Agents work through the night; nothing reaches Amazon until you make the call.
colors:
  night: "#09090B"
  night-2: "#111113"
  paper: "#FFFFFF"
  paper-2: "#FAFAFA"
  paper-3: "#F4F4F5"
  zinc-200: "#E4E4E7"
  zinc-300: "#D4D4D8"
  zinc-400: "#A1A1AA"
  zinc-500: "#71717A"
  zinc-600: "#52525B"
  zinc-700: "#3F3F46"
  zinc-900: "#18181B"
  emerald-50: "#ECFDF5"
  emerald-100: "#D1FAE5"
  emerald-300: "#6EE7B7"
  emerald-400: "#34D399"
  emerald-500: "#10B981"
  emerald-600: "#059669"
  emerald-700: "#047857"
  emerald-800: "#065F46"
typography:
  display:
    fontFamily: "Geist Variable, Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(54px, min(10.4vw, 18.6vh), 150px)"
    fontWeight: 600
    lineHeight: 0.92
    letterSpacing: "-0.04em"
  numeral:
    fontFamily: "Geist Variable, Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(96px, 12vw, 168px)"
    fontWeight: 600
    lineHeight: 0.82
    letterSpacing: "-0.06em"
    fontFeature: "tnum"
  headline:
    fontFamily: "Geist Variable, Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(32px, 3.9vw, 56px)"
    fontWeight: 550
    lineHeight: 1.03
    letterSpacing: "-0.036em"
  stage-line:
    fontFamily: "Geist Variable, Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(22px, 2.3vw, 32px)"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Geist Variable, Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.012em"
  lede:
    fontFamily: "Geist Variable, Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(16px, 1.25vw, 18px)"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "Geist Variable, Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
  data:
    fontFamily: "Geist Mono Variable, Geist Mono, ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.2
rounded:
  xs: "4px"
  sm: "8px"
  btn: "10px"
  md: "12px"
  card: "14px"
  tile: "18px"
  plate: "22px"
  pill: "999px"
spacing:
  gutter: "24px"
  gutter-phone: "16px"
  measure: "1080px"
  measure-wide: "1240px"
  section: "clamp(96px, 12vw, 168px)"
  section-day: "clamp(88px, 10vw, 148px)"
  header-gap: "clamp(48px, 6vw, 80px)"
  grid-gap: "14px"
components:
  button-primary-night:
    backgroundColor: "{colors.paper-2}"
    textColor: "{colors.zinc-900}"
    typography: "{typography.body}"
    rounded: "{rounded.btn}"
    padding: "0 20px"
    height: "46px"
  button-primary-night-hover:
    backgroundColor: "{colors.paper}"
  button-primary-day:
    backgroundColor: "{colors.zinc-900}"
    textColor: "{colors.paper-2}"
    rounded: "{rounded.btn}"
    padding: "0 20px"
    height: "46px"
  button-primary-day-hover:
    backgroundColor: "#000000"
  button-ghost:
    backgroundColor: "transparent"
    rounded: "{rounded.btn}"
    padding: "0 20px"
    height: "46px"
  button-small:
    rounded: "{rounded.sm}"
    padding: "0 14px"
    height: "36px"
  proposal-card:
    backgroundColor: "#121214"
    textColor: "{colors.paper-2}"
    rounded: "{rounded.md}"
    padding: "14px 16px 15px"
    width: "272px"
  hold-to-approve:
    backgroundColor: "rgba(255,255,255,.06)"
    textColor: "{colors.paper-2}"
    rounded: "9px"
    height: "36px"
    width: "100%"
  card-day:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.card}"
  data-plate:
    backgroundColor: "{colors.paper-3}"
    rounded: "{rounded.plate}"
    padding: "10.5% 8% 7%"
  narrator:
    backgroundColor: "rgba(17,17,19,.94)"
    textColor: "{colors.paper-2}"
    rounded: "{rounded.card}"
    padding: "12px 18px 12px 14px"
  tabs:
    backgroundColor: "{colors.paper-3}"
    textColor: "{colors.zinc-600}"
    rounded: "{rounded.md}"
    padding: "5px"
  tab-selected:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.zinc-900}"
    rounded: "{rounded.sm}"
    height: "34px"
---

# Design System: Docket

## Overview

**Creative North Star: "A Day with Docket"**

The site is one day, told in chapters rather than stripes. Night opens it: a near-black ground drawn as engraved light, ruled lines that close up into darkness and thin out where the Radiant Core shines. Daybreak is a pinned stage where the core's light thins every rule to nothing until the page is white paper. Day is the product run, one long sheet of paper where sections are separated by a hairline on the measure, never by a colour change. Nightfall drains the paper back into the core, and night closes the page with the evening ledger, the Amazon data, questions and the first scan.

The palette is emerald on zinc plus white, and nothing else. Emerald behaves as light: it is the core's glow, the halo in the rules, the one lit line on each data plate, the fill that floods "Your call." when a proposal is approved. Zinc carries type, rules and structure. Geist does all the talking, with Geist Mono for identifiers, timestamps and data. The craft reference is restrained professional software (Linear, Stripe, Mercury); the drama comes from the core, the scale of the display type and the night-to-paper transition, never from ornament.

Motion is a short entrance into a finished resting layout. Pinned scenes play as beat states that rewind exactly when scrolled back, and Pulse narrates them in a subtitle line. Interactivity exists only where it means something: tabs, annotations, the reel, hold to approve, and the core itself.

**Key Characteristics:**
- Chapters: night (#09090B) → Daybreak → paper (#FFFFFF) → Nightfall → night.
- Engraved light: ruled lines are the night's material; the Radiant Core is its only light source.
- Emerald on zinc plus white only; emerald is light, never decoration.
- Geist 600 display at viewport scale; Geist Mono for every identifier and timestamp.
- One emerald line per engraved data plate.
- One reveal, compositor-only motion, scenes as beat states, narrator subtitles.

## Colors

Two grounds (night and paper), a zinc ramp for everything structural, and an emerald ramp that only ever reads as light or approval.

### Primary
- **Core Emerald** (emerald-500): the core's light. Focus rings, the lit section dot, the hero sync dot, lock-on brackets, approval rails, the leader lines the core draws to what it narrates, and the end stop of the hold-to-approve fill.
- **Night Glow** (emerald-400): emerald on the night ground. The filled "Your call.", narrator voice meter and speaker name, proposal-card lit borders (as rgba of this value), boot log success dots, the hero chip dot.
- **Pale Glow** (emerald-300): the brightest emerald on night; the strong proposal's marker, approved confirmations, the leading edge of the call fill.
- **Deep Emerald** (emerald-700): emerald on paper. The brand mark tile, accent text on the day ground, the start of the hold fill gradient, the approved state of in-page approve buttons.
- **Plate Emerald** (emerald-600): the single emerald stroke on paper plates; active stage-card rings on paper.
- **Emerald Wash** (emerald-50 / emerald-100): highlighted rows, selected sentences, the "On" badge and progress tick wells on paper.
- **Emerald Ink** (emerald-800): text on emerald-100 badges.

### Neutral
- **Night** (night): the night chapters, the nav on dark, the bento's night tile. Shaders use exactly this value so canvas and CSS meet without a seam.
- **Night Raised** (night-2): the start-up vignette centre and the narrator capsule on night. Proposal cards sit one step above at #121214.
- **Paper** (paper): the day chapter ground, cards and app recreations on paper.
- **Paper Mist** (paper-2): primary type on night, primary button on night, bento tiles and inset wells on paper.
- **Paper Grey** (paper-3): plates, tab rails, neutral badges.
- **Zinc 900** (zinc-900): primary type on paper, primary button on paper, the phone bezel.
- **Zinc 600 / 500** (zinc-600, zinc-500): secondary and tertiary type on paper; zinc-500 is also the mono metadata colour.
- **Zinc 400 / 300** (zinc-400, zinc-300): secondary type on night, approved titles, chip text.
- **Zinc 200** (zinc-200): hairlines and borders on paper, including the rule between day sections.
- **Night hairlines**: white at 8% (rules) and 14% (stronger borders, ghost button outlines) on the night ground.

### Named Rules
**The Emerald Is Light Rule.** Emerald appears only where the core's light lands or where a yes has been given: glows, lit borders, the call fill, approval rails, one plate line. It never fills a large surface or decorates a heading.

**The Three Colours Rule.** Emerald, zinc and white are the entire brand palette. Amber or red appear only as status inside recreations of the product's own UI (open questions, needs-transfer), never as a page colour, a highlight, or a showpiece visual.

**The Chapter Rule.** A section is night or paper, set by its chapter. Inside the day run sections are divided by a zinc-200 hairline on the measure, not by alternating backgrounds. Night and paper only change at a pinned stage (Daybreak, Nightfall), never with a hard stripe mid-chapter.

## Typography

**Display Font:** Geist Variable (with Geist, ui-sans-serif, system-ui)
**Body Font:** Geist Variable (same stack)
**Label/Mono Font:** Geist Mono Variable (with Geist Mono, ui-monospace, SF Mono, Menlo)

**Character:** One grotesque at every size, tightened hard as it grows; the mono is the voice of the machine (proposal IDs, timestamps, counts, sync status).

### Hierarchy
- **Display** (600, clamp(54px, min(10.4vw, 18.6vh), 150px), 0.92): the hero promise only. "Your agents." solid in paper-2; "Your call." as a 1.3px outline at 60% white that fills with emerald when you hold to approve, then turns solid white when the call is made.
- **Numeral** (600, clamp(96px, 12vw, 168px), 0.82, -0.06em, tabular): a single big count on a tile (17 verticals). Stat numerals step down to clamp(40px, 4.2vw, 60px) at -0.045em.
- **Headline** (550, clamp(32px, 3.9vw, 56px), 1.03, -0.036em): section and stage headlines, balanced, max about 14em. Stage headlines on Daybreak and Nightfall use the same weight at clamp(30px, 4.2vw, 60px).
- **Stage line** (500, clamp(22px, 2.3vw, 32px), 1.2): the narrative line on a pinned stage, with a 0.58em, 400-weight second sentence in zinc-400.
- **Title** (600, 17px, 1.3): card and feature titles; 15px at 550 inside proposal cards, 16px in brief and ledger rows.
- **Lede** (400, clamp(16px, 1.25vw, 18px), 1.55): the paragraph under a headline, max 34em, pretty-wrapped, in secondary colour.
- **Body** (400, 16px, 1.55): running text; 13 to 14.5px inside cards and app recreations.
- **Data** (Geist Mono 400 to 500, 11 to 12.5px): proposal IDs (PR-0019), clock stamps, counts, tags such as "Example data", the narrator's speaker name. Sentence case, no uppercase tracking.

### Named Rules
**The Tighten With Size Rule.** Letter-spacing runs from -0.005em at body size to -0.04em at display and -0.06em on the giant numeral. Large Geist is never set at default tracking.

**The Machine Speaks Mono Rule.** Anything the system generated (IDs, times, sync ages, counts) is set in Geist Mono; anything a person reads as prose is Geist.

## Layout

Content sits on a 1080px measure with a 24px gutter (16px under 640px); the nav, the hero and the reel stretch to a 1240px wide measure. Sections breathe with clamp(96px, 12vw, 168px) of block padding on night and clamp(88px, 10vw, 148px) inside the day run. Section headers are a 7fr / 5fr grid (headline left, lede right) collapsing to one column under 980px, with clamp(48px, 6vw, 80px) below them. Card grids use 12 to 14px gaps; the verticals bento is a 4-column grid with named areas (one double-height night tile, one stats strip, six group tiles) that steps to 2 columns at 980px and 1 at 640px.

The hero is a full-viewport stage (max(100svh, 620px)) composed around its centre: the core dead centre, display type split on the diagonal (top-left, bottom-right), proposals on a tilted orbit (-14deg), actions bottom-left. Under 980px it becomes one full screen (type, core, the lit proposal, the call, the buttons) followed by the remaining proposals stacked.

Pinned scenes are CSS sticky tracks under the 64px nav: 100vh plus 40vh (always pinned) or 46vh (desktop-only pins, at least 980 by 680) per beat. Daybreak runs 280vh, Nightfall 200vh. Breakpoints: 640px (phone), 980px (tablet, layout collapse), 1180px (nav links hide).

## Elevation & Depth

Depth on night is light, not shadow: the engraved backdrop canvas sits furthest back, the display type and orbit rings in front of it, the core canvas in front of the type, and content on top. Lit elements gain an emerald halo (a 1px emerald ring plus a soft emerald bloom) on top of a deep black drop. On paper, depth is a quiet two-layer shadow: a 1 to 2px contact shadow and a long, negatively spread ambient shadow in zinc-900 at low alpha. Screenshots sit on engraved plates, which sit on paper.

### Shadow Vocabulary
- **Paper card** (`box-shadow: 0 1px 2px rgba(24,24,27,.04), 0 12px 32px -18px rgba(24,24,27,.14)`): cards on the day ground.
- **Framed screen on plate** (`box-shadow: 0 0 0 1px rgba(24,24,27,.07), 0 2px 6px rgba(24,24,27,.04), 0 36px 72px -36px rgba(24,24,27,.42)`): a product screenshot resting on its plate.
- **Night card** (`box-shadow: 0 1px 0 rgba(255,255,255,.04) inset, 0 20px 40px -24px rgba(0,0,0,.8)`): proposal cards at rest on the night.
- **Lit on night** (`box-shadow: 0 0 0 1px rgba(52,211,153,.1), 0 0 40px -10px rgba(16,185,129,.45), 0 24px 48px -24px rgba(0,0,0,.8)`): the lead proposal, an opened proposal, a found scan.
- **Focus ring** (`outline: 2px solid #10B981; outline-offset: 3px`): every focusable element.

### Named Rules
**The Light Lifts Rule.** On night, an element rises by being lit (emerald border and bloom), not by a bigger black shadow.

## Shapes

Soft, consistent corners that grow with the object: 4 to 8px for keys, small buttons and tabs, 10px for buttons, 12px for proposal cards and tab rails, 14px for cards, app recreations, frames and the narrator, 18px for bento tiles, 22px for engraved plates (16px on phones), full pills for chips, badges and the story token. Borders are always 1px hairlines. Dots are the recurring small form: 6px status and section dots, 8px square vertical markers (2px radius). The core's own vocabulary of dashed rings (dash 90 10 30 10 in emerald at 40%, dot 2 7 in zinc at 20%) is reused for the hero orbit and the nav mark.

## Components

### Buttons
Calm, solid, keyboard-honest.
- **Shape:** gently rounded (10px), 46px tall, 0 20px padding, Geist 500 15px.
- **Primary:** inverts against its ground. On night: paper-2 fill, zinc-900 text; hover goes to pure white with a 4px emerald halo at 18%. On paper: zinc-900 fill, paper-2 text; hover goes to black.
- **Ghost:** transparent with the ground's stronger hairline; hover raises the border to tertiary text colour.
- **Small:** 36px tall, 8px radius, 14px type (nav).
- **Press:** scale(.97) over 150ms on the page curve. A keyboard hint can ride inside a button as a mono key cap at 55% opacity.

### Proposal Card (signature)
The unit of the product, shown on the night.
- **Style:** #121214 ground, 1px white-at-9% border, 12px radius, 272px wide on the hero orbit. Top row: emerald square marker, area, mono ID, mono expiry tag. Title 15px 550 paper-2; subline 13px zinc-400.
- **States:** dim (45% opacity) until it is the lead or opened; lead and open gain the Lit on night shadow and an emerald border; opening expands agent, confidence and hit rate plus the hold control; approved shows an emerald-300 confirmation with a 24-hour Undo.

### Hold to Approve (signature)
The site's single act of agency.
- **Style:** full-width 36px control, 9px radius, white-at-6% fill, white-at-16% border, 13.5px label.
- **Behaviour:** holding scales an emerald-700 → emerald-500 fill from the left; the border goes emerald at 60%. In the hero, the same hold fills the outlined "Your call." with emerald behind a glowing leading edge; release drains it, completion turns the line solid white, and Undo empties it.

### Cards / Containers
- **Corner Style:** 14px.
- **Background:** paper on day; zinc-900 at 72% on night.
- **Shadow Strategy:** Paper card on day; none on night unless lit.
- **Border:** 1px zinc-200 on paper, white at 8% on night.
- **Internal Padding:** 16 to 22px.

### Engraved Data Plate (signature)
Every product screen rests on a plate drawn from the data that screen is about (spend landscape, a year of hourly sales, 90 mornings of replay, outcomes around the median, verticals as orbits, the spoken change as a ribbon). Paper-grey ground, 22px radius, single-weight zinc rules, exactly one emerald-600 line (2.6 to 3px) marking the thing that matters. The night variant (the verticals tile) draws zinc and emerald-400 light on the night ground.

### Navigation
Fixed, 64px, on the 1240px measure. Follows the chapter beneath it: on night it is #09090B with a white-at-7% bottom hairline; on paper it is white with a zinc-900-at-8% hairline; over the hero it is clear. Brand is a 26px emerald-700 tile with "D" plus the Geist 600 17px wordmark. Links are 14px in secondary colour and step to primary on hover or when current. Links hide under 1180px; the sign-in link and wordmark hide under 640px.

### Tabs
A paper-3 rail (12px radius, 5px inset) holding 34px tabs at 8px radius, Geist 500 14px zinc-600; the selected tab becomes a white chip with a hairline ring and a 1px shadow.

### Narrator (signature)
Pulse's subtitle line. A fixed capsule bottom centre (14px radius, night-2 at 94% with an emerald-at-22% border; white at 96% with emerald-600-at-30% on paper), a five-bar emerald voice meter, the mono speaker name "Pulse" in emerald-400, and 15.5px Geist 500 text whose words rise in at 30ms intervals. Anchored by its top edge so a second line never shifts anything. On phones it docks bottom-left beside the docked core.

### The Radiant Core
The one living object: a WebGL orb that glows emerald on night and renders as ink on paper, split at the section edge. It travels the side gutters between sections, can be dragged, clicked and (in the final section) held to run a sample scan. It is the light source for the engraved backdrop and the only thing on the page allowed to be ambient.

## Do's and Don'ts

### Do:
- **Do** keep the palette to emerald, zinc and white; reach for emerald-400 on night and emerald-700 on paper.
- **Do** draw night as engraved light (ruled lines) lit by the Radiant Core, and match canvas colours exactly to #09090B and #FFFFFF.
- **Do** give every engraved data plate exactly one emerald line.
- **Do** change between night and paper only through a pinned stage (Daybreak, Nightfall).
- **Do** set IDs, timestamps, counts and sync ages in Geist Mono, and label demonstration figures "Example data".
- **Do** use the one reveal: opacity plus 12px, 600ms, cubic-bezier(.22, 1, .36, 1), played once, with the start state set before first paint.
- **Do** animate only transform and opacity; fade rings and glows on their own layer instead of transitioning box-shadow.
- **Do** build pinned scenes as beat states (each beat sets a whole state) so scrolling back rewinds exactly, and narrate one subtitle line per beat that settles 140ms before it speaks.
- **Do** show a finished, static page under prefers-reduced-motion: no start-up, no travel, stages laid out as plain sections.

### Don't:
- **Don't** introduce amber, violet, cyan or any other hue as a brand or showpiece colour.
- **Don't** separate day sections with alternating background colours; use the hairline on the measure.
- **Don't** add hover tilt, draggable panels or HUD chrome; interactivity belongs to tabs, annotations, the reel, hold to approve and the core.
- **Don't** resize the WebGL canvases while scrolling or read layout in the frame loop.
- **Don't** set large Geist at default tracking or swap in a second display face.
