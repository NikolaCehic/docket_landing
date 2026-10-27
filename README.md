# Docket website

The Docket landing page as a real site: TanStack Start (React 19, Vite 8), three.js r186 for the Radiant Core, raw WebGL2 for the engraved backdrop, GSAP 3.15 for every timeline.

## Run it

```bash
cd ~/Desktop/Docket/website
npm install        # first time only
npm run dev        # http://localhost:3000 (also on your local network, so a phone on the same Wi-Fi can open it)
```

Mobile view: open http://localhost:3000 in Chrome, then DevTools (Cmd+Opt+I) > Toggle device toolbar (Cmd+Shift+M), and pick an iPhone, then reload. Or open the Network URL printed by `npm run dev` on your phone.

Production build: `npm run build`, then `npm run start`.

## The film (v9): the system, in eight scenes

The page explains how Docket works, one part of the system per scene. There is no narrator: the page's own lines tell it, the chapter mark (bottom left, number and name) says where you are, and the Radiant Core is the character. It boots the page, holds the middle of the loop, and in Pulse it takes its place inside the product as Docket's voice. The words and screens live in `src/data/system.ts`. The copy describes what each part does; it never names the example brand on the screens or counts agents, templates or memories.

| # | Scene | What plays |
|---|---|---|
| 1 | Hero, "Your agents. Your call." | The start-up, then the hero's entrance: the orbit spins up, "Your agents." rises letter by letter, "Your call." is written in outline, the core hands out three proposals, then the line and the buttons. Hold to approve fills "Your call." |
| 2 | How Docket works, "Find it. Fix it. Learn from it." | The core in the night, and the loop along the foot: watch, draft, approve, apply and measure, remember, automate. Each step lights in turn and leads to the scene that shows it; on desktop each step's arc of the ring around the core fills as the scroll runs the loop (`System.tsx`) |
| 3 | Agents, "An agent for every job." | The parts of the account they cover; four agents report in turn, each lighting its area and a ghost of its screen, each with the fix drafted (`Agents.tsx`) |
| 4 | Pulse, "Just say “Hey Pulse.”" | Pulse and the phone as one feature (`Pulse.tsx`). The desk is the Pulse screen rebuilt in HTML so it can play, with the page's live core in its dark stage: the briefing is ready, Pulse talks it through (the words light as it says them, the numbers dock beside the core), you ask a question and it checks first. Then the phone comes in front: a spoken change, matched across brands, held to approve, live on Amazon |
| 5 | Command, "Every fix, explained. Approve in one hold." | The real Command screen builds itself, a green border walks the proposal while the screen pans inside its window, then it is approved (hold it; on desktop the scroll charges the hold most of the way and scrolling on sends it) and the row leaves the queue |
| 6 | Memory, "It learns how you run your brand." | The real Rules > Memory screen: what it knows, where each memory came from, who reads it, correct or forget |
| 7 | Plays and workflows, "Automate the work you repeat." | One scene, two parts, each named over its steps. Plays: the new-play chat, then what Docket understood; the 90-day replay builds in (results arrive, the chart replays morning by morning); Turn on, held to turn it on. Workflows: the stage graph, then the Workflow Builder agent; the replay on past launches builds in (the odds, the histogram rising, then one launch stage by stage); runs arrive and their stage bars fill |
| 8 | Close, "Approved. Applied. Measured." | The hero's fixes live and measured; hold the core to run a sample scan; then pricing and the footer |

Scenes 6 and 7 share one component (`Feature.tsx`): the steps on the left, a real screen on the right. A camera moves over the screen to the part each step names (zooming in where that part is small, never past the screen's own size) and a green border marks it; a step on another screen cuts to it. A step can build its screen in, the way the Command screen does: covers in the screen's own colour (sampled from the screen) lift off its pieces in turn, a beat moves the camera on, and a button can be held. A step can start a part (`group`), which puts the part's name over its steps. On desktop the camera, the builds and the steps follow the scroll; on a phone they play in turn when the scene is entered. Choosing one shows it. On desktop the core stays lit inside Pulse (`data-core="glow"`); on the scrolling page Pulse is one of the core's stages, so it rides there too. The Amazon data use, the questions and the contact form are pages of their own (`/amazon-data`, `/faq`, `/contact`); old links to `/#data`, `/#faq` and `/#contact` go there, and `/#workflows` and `/#templates` land on plays and workflows. Templates are still on the How it works page, in pricing and in the questions, but have no scene of their own.

Motion: every scene's headline is played by GSAP (`src/experience/kinetic.ts`) when the scene comes in, on the same clock as the core. The eyebrow arrives, each letter rises out of its word and fades up as it clears the edge (`power3.out`, a soft start and a long settle), then the line under it. The CSS only holds their hidden pose, and nothing else may put a CSS transition on them, since it would chase every frame GSAP writes. In the feature scenes each screen has its own camera, so a step on another screen is a dissolve: the next screen, already framed, comes up over the last while the green border glides to its new part. The hero is on screen from the first frame of its entrance (`hero.ts`), not only once the start-up has ended.

**Desktop (`.film`).** One page that scrolls the normal way: the wheel (smoothed by [Lenis](https://github.com/darkroomengineering/lenis), never captured), a trackpad, the keys, the scrollbar or a link move it as far and as fast as you like. Nothing snaps and nothing scrolls by itself; script moves the page only to go where a link or a chosen step points (v9.6; v9.5 scrolled natively with steps that changed on their own timers, and before that every gesture cut to the next scene). Each scene is a **stage**: its frame (`[data-frame]`, `.sc-in` on most) is held on screen (`position: sticky`) while you scroll through it, and the scroll is its clock (`src/experience/film.ts`, `stages.ts`):

- **Coming in.** How a scene comes in over the one before follows its material (`data-enter`): a night scene rises over the held night, whose content settles back (scale 0.97) and fades (`fade`: How it works, Agents); paper slides up over the held night as a sheet with rounded top corners (`sheet`: Pulse); paper scrolls on after paper with a hairline between (Command, Memory, plays and workflows); the last paper lifts off the night, which was held underneath and comes forward as it is uncovered (`lift`: the close). Halfway in, its title plays (in time, about a second); under the lift its content is there as it is uncovered and the title rises last.
- **Held.** Its own timeline follows the scroll (`stages.ts`): the first beat as it docks, the rest over its hold (`--hold` in the CSS, about a screen per scene, two in Pulse). The timeline eases after the scroll (0.7 s), so a fast scroll lets it finish rather than skip, and scrolling back rewinds it exactly. What a timeline moves can run backwards: transforms, opacity, the camera over a screen, fills, the loop's ring. What is discrete (which step is on, a label, a class, the core's pulses) is read from the timeline's time, so a jump never skips or doubles a beat. The few beats that should never be scrubbed play in time once the scroll reaches them and are put back when it goes back above them: the question being typed in Pulse, the checks ticking, a dissolve to another screen, and the approval in Command (the scroll charges the hold to 90%; your own hold, or scrolling on, sends it).
- **Per scene.** How it works: each step of the loop lights while its arc of the ring around the core fills. Agents: each finding rises in, lights its area and the ghost of its screen. Pulse: the greeting, the talk-through (words light as you scroll, the numbers dock), the question, then the phone and its hold. Command: the screen builds as it arrives, the border walks its parts with the camera, then the bar charges. Memory, plays and workflows: the camera, the covers lifting and the held button follow the step data. The close: the morning's fixes tick in.
- **Gone.** Once a scene has gone back down off the screen, its title waits to play again. Choosing a step scrolls to where it is shown.

What joins the scenes follows the scroll. The Radiant Core is handed from one scene's place to the next over the screen of scroll in which the next scene comes in (`companion.ts`), and settles back with a held scene: where both places sit in the same spot it stays; where they differ it eases across (paper after paper, in a straight line at an even pace); as the last paper lifts, it leaves its place on the paper and floats to the close. It answers each scene's beats (a ripple per step, a flare when the loop closes or the agents have reported, words spoken in Pulse, a wind-up and a burst at a hold), and the scroll's speed turns its lattice a little. It comes in front of the paper wherever paper is under it and takes its ink there (not in Pulse's dark stage); the night itself never turns, since the paper comes in over it as a sheet. The hero's lines part as the next scene rises over them, and the progress line along the foot fills with the page. The chapter mark steps aside while a scene comes in.

**Phones and touch (`.flow`).** The same scenes as a normal scrolling page; each plays once it reaches the middle of the screen. What changes on a phone:

- **Menu.** Below 1180px the section links, Talk to a person, Sign in and Get your first scan move into a menu under the bar (`Nav.tsx`, state on `html.menu-open`; the page behind it holds still while it is open).
- **Hero.** One first screen: "Your agents.", the core with the lead proposal, "Your call.", then the line and both buttons as one block at the foot (`.hb-foot`; its height is measured into `--hb-foot` by `experience/hero.ts`). Short phones move the lead proposal into the list below; phones held sideways list all three.
- **Command.** A 1440px screen is unreadable at phone width, so below 760px the proposal is a card at reading size (`MobileProposal` in `Proposal.tsx`): the green border walks its sections, then hold to approve (touch works; it approves itself after a moment, like the screen).
- **The parts of the system.** The screen comes first, framed at the step being described, then the steps; tapping a step moves the camera.
- **Rhythm.** Sections are sized by their content, paper sections are divided by a hairline, the agents' list fills in quickly, and the sample scan only takes space once it has run.
- **Touch.** Controls are at least 44px on touch screens, text is at least 12px, and the sheets rise from the bottom of the screen.
- **Layering.** The night backdrop is a fixed layer shown while the hero, How Docket works or the last scene is on screen; paper scenes stack above it so it never paints over them.

**Reduced motion (`.static`).** A normal page with everything at rest; the parts of the system frame their first step, and the steps still work. The mode is chosen before first paint in `src/routes/__root.tsx`.

## Calls to action and forms

Every button and link in the header, the hero, the last scene and the footer does what it says:

| Control | What it does |
|---|---|
| Get your first scan (nav, hero, last scene, footer) | Opens the first-scan sheet: work email, brand or agency, then "Workspace started in Watch only" |
| Sign in (nav, footer) | Opens the sign-in sheet: work email, then "Check your inbox" |
| Book a demo, Talk to a person | `/contact?topic=demo` (or `question`, `partnership`): the contact form with that topic chosen |
| The home page's bar (How it works, Agents, Pulse, Memory, Plays and workflows, Pricing) | Scroll to that scene, or to the pricing below the last one |
| Every other page's bar | The same scenes on the home page (`/#agents` and so on), and `/pricing` |
| The footer | Every page on the site (below) |

## Pages

Every page but the home page shares one shell (`src/components/page/PageShell.tsx`): the bar with the menu, the page, a closing call to action, the footer (`SiteFooter.tsx`, also on the home page) and the two sheets, so the first scan and sign in open in place anywhere. Pages are plain documents: no film, no start-up.

| Page | What it is | Words live in |
|---|---|---|
| `/how-it-works`, `/agencies`, `/mobile`, `/security`, `/about` | Content pages, rendered by `page/ContentPage.tsx` (How it works explains each part of the system in words, without screens) | `src/data/pages.ts` (format: `src/data/pageTypes.ts`) |
| `/amazon-data` | Every data set, why and how, then authorization, revoking and deletion | `Credits.tsx` (the table), `src/data/pages.ts` |
| `/pricing` | The three plans, every feature plan by plan, billing questions | `src/data/pricing.ts` |
| `/faq` | Every question, in four groups | `src/data/pages.ts` (`FAQ_GROUPS`) |
| `/contact` | The contact form; `?topic=` picks its topic | `Credits.tsx` (`Contact`) |
| `/privacy`, `/terms`, `/dpa`, `/subprocessors` | Legal drafts with [placeholders], to be reviewed by counsel | `src/data/legal.ts` |
| Any other address | A page-not-found page with the way back | `src/routes/__root.tsx` |

In any written page, `{label|/path}` is a link and `[placeholder]` an open value, shown highlighted until it is filled in (`components/Rich.tsx`).

**Prices are placeholders.** Brand $199, Growth $499 and Agency $1,490 a month (yearly saves 20%), the seat and brand limits and what each plan includes are all set in `src/data/pricing.ts`; the home page's pricing section, `/pricing` and the questions follow it.

The sheets are native modal dialogs (`src/components/Sheets.tsx`); any element with `data-sheet="scan"` or `data-sheet="signin"` opens one, and the page behind holds still while one is open. Links from other pages work too: `/#first-scan` and `/#sign-in` open the sheet, `/#agents` (or any scene) goes to that scene once the page is ready (a deep link skips the start-up).

All three forms check their fields as you type after a first attempt, and post to one server function (`src/server/submit.ts`) that checks them again and appends each submission to `.data/submissions.jsonl` (set `DOCKET_SUBMISSIONS_DIR` to change the folder). **No email is sent yet**: the sign-in link and the first-scan email need an email provider, added in that handler. A hidden field catches bots.

The company's contact details live in `src/data/site.ts`. Values still in [brackets] are shown as text; once filled in, the email and phone become `mailto:` and `tel:` links.

## Where things are

| Path | What it is |
|---|---|
| `src/routes/index.tsx` | The page: start-up screen, nav, overlays, the eight scenes, then the experience mount |
| `src/routes/__root.tsx` | Document head and the pre-paint flags (start-up, film, flow or static) |
| `src/components/*.tsx` | One component per scene, pure markup; `Kinetic.tsx` splits titles into letters on the server; `System.tsx`, `Agents.tsx`, `Pulse.tsx` and `Feature.tsx` are the system's scenes; `Credits.tsx` is the pricing and footer below the last scene, plus the Amazon data table and contact form that `/amazon-data` and `/contact` use; `Pricing.tsx` the plans; `SiteFooter.tsx` the footer on every page; `Nav.tsx` the bar and its menu; `Sheets.tsx` the first-scan and sign-in sheets; `forms.tsx` what the forms share; `LegalPage.tsx` the legal pages; `page/` the shell and renderer for the other pages |
| `src/data/nav.ts`, `pricing.ts`, `pages.ts`, `pageTypes.ts` | Where every link goes; the plans; the content pages' words and their format |
| `src/routes/privacy.tsx`, `terms.tsx`, `dpa.tsx`, `subprocessors.tsx`, `src/data/legal.ts`, `src/styles/legal.css` | The legal pages and their content |
| `src/server/submit.ts`, `src/data/site.ts` | The forms' server function; the company's contact details |
| `src/data/system.ts`, `src/data/film.ts`, `src/data/command.json` | The system scenes' words, screens and camera regions (and the chapter order); the phone steps and Command pieces; the positions of the Command screen's captured pieces |
| `src/experience/film.ts` | The page: the smoothed wheel, each scene held and coming in over the one before, its title, its timeline following the scroll; the chapter mark, the bar's colours, the progress line, links; the phone's play-on-view |
| `src/experience/stages.ts` | Desktop: each scene's own timeline, scrubbed by the scroll (the loop and its ring, the agents' reports, Pulse, the console build and approval, the camera over each part's screens, the ledger) |
| `src/experience/scenes.ts` | Phones and reduced motion: what plays inside each scene when it comes into view |
| `src/experience/companion.ts` | The core: start-up, where it sits in each scene, drag, click, hold (sample scan), the hero cards' hold to approve |
| `src/experience/hero.ts` | The hero's type: fitting "Your call.", the orbit, the lines parting as you scroll away |
| `src/experience/radiantCore.ts`, `backdrop.ts` | The core (three.js) and the engraved night (one WebGL2 fragment shader with day/night, halo, ripples, orbit) |
| `src/styles/global.css` | All styles and tokens (emerald on zinc, Geist) |
| `public/film/` | Screens captured from the product design (`~/Desktop/Docket/design/artifact`) for the scenes; the Command screen is split into layers |

`public/screens/` and `public/plates/` (with `art/plates.html`) belong to the earlier long-scroll version and are no longer used by the page.

### Recapturing the screens

Every product screen on the site is captured from the design's boards. Serve them first: `cd ~/Desktop/Docket/design/artifact/project && python3 -m http.server 8811`. The tools need `playwright-core` and Google Chrome.

- **Command** (split into pieces so it can build itself): `node tools/layercap.cjs tools/spec-command.cjs` writes `public/film/command/`; copy its `manifest.json` to `src/data/command.json`, then delete the manifest from `public/`.
- **Pulse** is rebuilt in HTML (`Pulse.tsx`) from the Radiant Core board (`PulseOrbI_Desktop`); `tools/pulsecap.cjs` captures that board's four states if a still is ever needed.
- **The parts of the system** (Memory, Plays and workflows): `node tools/syscap.cjs public/film/system` captures each board's content area (no sidebar) at 1224x900, fixes copy the site must not show (a name in a status, API endpoints), and flags anything left. The camera regions and the build-in pieces in `src/data/system.ts` are in those screens' CSS pixels (measured from the boards' DOM, colours sampled from the screens); check them if a board's layout changes.
- **The phone**: `node tools/phonecap.cjs public/film/phone` (390x844 at 3x) and prints where the hold button sits, which `.ph-hold` in the CSS must match.
- `tools/shots2.cjs` captures whole screens (the agents' ghost screens).

## Motion rules this site follows

- The scroll is never captured or moved by script, except to go where a link or a chosen step points. Each scene's own timeline follows the scroll and eases after it; titles, typing, ticks, dissolves and the approval play in time when the scroll reaches them, never scrubbed. One curve family: `cubic-bezier(.16,1,.3,1)` for arrivals, `power3/power4.inOut` for camera moves.
- Product UI is the real console (captured screens) doing one real thing per scene. Cards are never 3D, tilted or draggable. No connector lines: what is being explained gets a green border.
- Only `transform`, `opacity` and `clip-path` animate (the focus border is moved by transform too). No layout reads in the frame loop; the WebGL canvases are never resized during a transition.
- Measured on v9.6 (real GPU, desktop): layout shift 0.006 at load and 0.023 over the whole page (the step lists open the current step's sentence as the scroll reaches it; Google's "good" is under 0.1); no long tasks. v9.6 on the real GPU (Apple M1 Pro, 1440x900): a mouse wheel down the whole page and back up, and trackpad-like flicks through it, no frame over 20 ms; between scenes the core moves at a median 0.08 of the page's speed (it moves at the page's speed only while it rides with a scene's frame).
