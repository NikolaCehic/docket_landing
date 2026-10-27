// The home page's story is the system: how Docket works (one loop), then each part of it in its own scene. The words
// and the real screens (captured from the product design into /public/film/system, 1224x900 CSS px, the sidebar cut
// off) live here; components/System.tsx, Agents.tsx and Feature.tsx render them, experience/scenes.ts plays them.

/** How Docket works: the loop, each step leading to the scene that shows it */
export const LOOP = [
  { k: 'Watch', d: 'Specialist agents read every part of your account: ads, stock, prices, listings and more.', to: '#agents', part: 'Agents' },
  { k: 'Draft', d: 'When something is costing you money, the right agent drafts the fix, with the evidence.', to: '#agents', part: 'Agents' },
  { k: 'Approve', d: 'Pulse briefs you every morning and takes changes by voice. Every fix waits in Command for one yes.', to: '#pulse', part: 'Pulse and Command' },
  { k: 'Apply and measure', d: 'Docket makes the change on Amazon, keeps a full day of undo, and checks the result after a week and after a month.', to: '#proposal', part: 'Command' },
  { k: 'Remember', d: 'Your edits, your answers and every result go into Memory, which each agent reads first.', to: '#memory', part: 'Memory' },
  { k: 'Automate', d: 'Turn what works into plays and workflows, or start from a ready-made template.', to: '#plays', part: 'Plays and workflows' },
]

/** the length of each arc of the ring around the core (a 54° arc of radius 48 in a 100-unit box; components/System.tsx) */
export const ARC = 48 * (54 * Math.PI) / 180

/** the parts of an Amazon account the agents cover (the site names them; it never counts agents, templates or memories) */
export const AREAS = [
  'Advertising', 'Marketing analytics', 'Real-time monitoring', 'Inventory', 'Inbound', 'Outbound and shipping', 'Orders and sales',
  'Pricing and Buy Box', 'Promotions', 'Listings', 'Brand content (A+)', 'Market intel', 'Reviews and returns', 'Profit and finance',
  'Account health', 'Vendor (1P)',
]

/** Agents: four agents, each finding one problem in its own area and drafting the fix (the screen it came from lights behind) */
export const FINDINGS = [
  { agent: 'PPC Optimizer', area: 'Advertising', d: 'Keywords spending above your target ACoS.', fix: 'Bid cut drafted', img: 'V01_Advertising' },
  { agent: 'Inventory Planner', area: 'Inventory', d: 'A best seller is about to run out of stock.', fix: 'Reorder drafted', img: 'V05_Inventory' },
  { agent: 'Pricing Agent', area: 'Pricing and Buy Box', d: 'A competitor undercut your price.', fix: 'Price change drafted', img: 'V09_Pricing' },
  { agent: 'Listing Doctor', area: 'Listings', d: 'One of your listings was suppressed.', fix: 'Listing fix drafted', img: 'V11_Listings' },
]

/** a part of the screen, in the screen's CSS px (1224 x 900 unless the feature says otherwise) */
export type Region = { x: number; y: number; w: number; h: number }
/** a piece of the screen that arrives when its step plays: a cover in the screen's own colour lifts off it (fades,
 *  or wipes away to the right, or downward from the top so what stands on the baseline rises first) */
export type Build = { r: Region; bg: string; at: number; how?: 'fade' | 'wipe-x' | 'wipe-y'; dur?: number }
export type FeatureStep = {
  k: string
  d: string
  shot: number
  r: Region
  /** a heading over the steps from this one on, when one scene shows two parts */
  group?: string
  /** seconds the step holds when the scene plays by itself (3 by default) */
  dur?: number
  /** the pieces that build in, timed from the step's start */
  build?: Build[]
  /** later camera moves within the step */
  beats?: { at: number; r: Region }[]
  /** a button pressed by a hold, the way the Command screen's is */
  press?: { r: Region; at: number }
}
const R = (x: number, y: number, w: number, h: number): Region => ({ x, y, w, h })
const fade = (bg: string, at: number, x: number, y: number, w: number, h: number): Build => ({ r: R(x, y, w, h), bg, at })
const wipe = (how: 'wipe-x' | 'wipe-y', bg: string, at: number, dur: number, x: number, y: number, w: number, h: number): Build => ({ r: R(x, y, w, h), bg, at, how, dur })
export type Feature = {
  id: string
  /** the scene's name: the eyebrow, the chapter mark and the nav */
  label: string
  title: string
  sub: string
  shots: { src: string; alt: string }[]
  steps: FeatureStep[]
  /** the screens' size in CSS px, when not 1224 x 900 */
  w?: number
  h?: number
}

export const SHOT_W = 1224, SHOT_H = 900
const shot = (n: string, alt: string) => ({ src: `/film/system/${n}.webp`, alt })

export const MEMORY: Feature = {
  id: 'memory',
  label: 'Memory',
  title: 'It learns how you\nrun your brand.',
  sub: 'Facts, lessons from past results and what you’ve told it, each with its source. Every agent reads Memory before it drafts a fix.',
  shots: [shot('memory', 'Docket Rules, Memory: what Docket knows about a brand, each memory with its source, how sure Docket is and which rule uses it')],
  steps: [
    { k: 'What it knows', d: 'Facts about your brand and catalog, patterns in how your team decides, lessons from past results, and what you’ve told it.', shot: 0, r: { x: 12, y: 106, w: 850, h: 154 } },
    { k: 'Where each one came from', d: 'Every memory keeps its source and how sure Docket is, so you can always see why an agent did what it did.', shot: 0, r: { x: 4, y: 566, w: 866, h: 74 } },
    { k: 'Who reads it', d: 'Agents read Memory before every draft. Tell it your supplier’s lead time once, and every reorder plans around it.', shot: 0, r: { x: 874, y: 430, w: 340, h: 318 } },
    { k: 'Yours to correct', d: 'Correct it, confirm it or forget it. Your rules are built on top, and every change is logged.', shot: 0, r: { x: 874, y: 806, w: 340, h: 88 } },
  ],
}

export const AUTOMATE: Feature = {
  id: 'plays',
  label: 'Plays and workflows',
  title: 'Automate the work\nyou repeat.',
  sub: 'A play is a standing rule in your own words. A workflow runs a bigger job stage by stage. Docket tries both on your history first, and they wait for your yes wherever you want them to.',
  shots: [
    shot('play-describe', 'Docket, new play: the brief written in plain words on the left, and what Docket understood, line by line, on the right'),
    shot('play-try', 'Docket, new play: the play replayed on recent history, with the changes it would have made and the profit they would have added'),
    shot('play-on', 'Docket, new play, Turn it on: the summary of the play, and how it starts: watch only, ask me, or run on its own'),
    shot('wf-build', 'Docket, new workflow: “Launch a new ASIN” as a graph of stages, with the Workflow Builder agent suggesting changes'),
    shot('wf-try', 'Docket, new workflow: the launch workflow replayed on past launches, stage by stage'),
    shot('wf-list', 'Docket Workflows: a brand’s workflows, each run shown at its stage'),
  ],
  steps: [
    {
      group: 'Plays', k: 'Say it your way', d: 'Brief it like a teammate: “Every morning, cut bids on keywords that spend without selling.” Docket reads it back line by line.',
      shot: 0, r: R(14, 102, 548, 738), dur: 4.2,
      beats: [{ at: 1.9, r: R(562, 104, 654, 562) }],
    },
    {
      k: 'Try it on real history', d: 'Docket replays it on your recent history, morning by morning: every change it would have made, and what they would have earned.',
      shot: 1, r: R(26, 236, 736, 540), dur: 4.4,
      build: [
        fade('#ffffff', 0.3, 42, 296, 166, 85), fade('#ffffff', 0.45, 220, 296, 166, 85), fade('#ffffff', 0.6, 397, 296, 166, 85), fade('#ffffff', 0.75, 575, 296, 166, 85),
        wipe('wipe-x', '#ffffff', 0.8, 2, 74, 418, 668, 254),
        fade('#edfcf5', 2.9, 44, 772, 695, 44),
      ],
    },
    {
      k: 'Turn it on', d: 'Choose how it starts: watch only, ask you each time, or run on its own for small changes.',
      shot: 2, r: R(806, 187, 384, 311), dur: 5,
      build: [fade('#ffffff', 0.35, 820, 243, 356, 74), fade('#ffffff', 0.6, 820, 326, 356, 56), fade('#fbfbfb', 0.85, 820, 392, 356, 92)],
      beats: [{ at: 2, r: R(830, 760, 380, 136) }],
      press: { r: R(1126, 850, 74, 32), at: 3.1 },
    },
    {
      group: 'Workflows', k: 'Big jobs, in stages', d: 'Launch a product: research, the listing, campaigns and the bid ramp. A builder agent checks each stage and suggests fixes.',
      shot: 3, r: R(16, 104, 612, 736), dur: 4.2,
      beats: [{ at: 1.9, r: R(830, 150, 380, 434) }],
    },
    {
      k: 'Replay past launches', d: 'Before it runs, Docket replays it on your past launches: how often it reaches the goal, then one launch, stage by stage.',
      shot: 4, r: R(26, 252, 734, 584), dur: 6.6,
      build: [
        fade('#f0fdf4', 0.3, 42, 311, 166, 115), fade('#ffffff', 0.45, 220, 311, 166, 115), fade('#fefefe', 0.6, 397, 311, 166, 115), fade('#ffffff', 0.75, 575, 311, 166, 115),
        wipe('wipe-y', '#ffffff', 0.8, 1.5, 72, 462, 670, 250),
        fade('#fdfdfd', 3, 775, 297, 411, 62),
        ...[369, 418, 467, 515, 564, 612, 661, 727, 775].map((y, n) => fade('#ffffff', 3.25 + n * 0.3, 775, y, 411, y === 661 ? 63 : 47)),
      ],
      beats: [{ at: 2.6, r: R(772, 252, 420, 584) }],
    },
    {
      k: 'Runs wait for you', d: 'Each run moves on by itself and stops at a gate until you decide. Every run is on the record.',
      shot: 5, r: R(2, 194, 1214, 456), dur: 4.6,
      build: [
        ...[[265, 94, '#ffffff'], [361, 97, '#fffbea'], [459, 82, '#ffffff'], [543, 97, '#ffffff'], [642, 97, '#ffffff'], [741, 97, '#ffffff']].map(([y, h, bg], n) => fade(bg as string, 0.25 + n * 0.16, 2, y as number, 1212, h as number)),
        ...[[281, '#ffffff'], [379, '#fffbea'], [477, '#ffffff'], [561, '#ffffff'], [659, '#ffffff'], [758, '#ffffff']].map(([y, bg], n) => wipe('wipe-x', bg as string, 1.4 + n * 0.14, 0.8, 554, y as number, 158, 19)),
      ],
    },
  ],
}

/** the feature scenes, in the order they play: Memory, then plays and workflows */
export const FEATURES = [MEMORY, AUTOMATE]

/** Pulse: Docket's voice, the Radiant Core, at the desk and on the phone (components/Pulse.tsx). The desk is the Pulse
 *  screen rebuilt so it can play: the briefing, a question, the check; then the phone takes a spoken change to Amazon. */
export const VOICE = {
  label: 'Pulse',
  title: 'Just say\n“Hey Pulse.”',
  sub: 'Pulse is Docket’s voice, at your desk and on your phone. It briefs you each morning, answers with your own numbers, and turns what you say into changes you approve with one hold.',
  steps: [
    { k: 'Your briefing is ready', d: 'Every morning: what changed overnight and what needs you. Start it, or just say “Hey Pulse”.', dur: 3.2 },
    { k: 'It talks you through it', d: 'In plain words, with the numbers it mentions laid out beside it as it speaks.', dur: 4.6 },
    { k: 'Ask it anything', d: 'Interrupt with a question. Pulse checks your latest numbers before it answers.', dur: 4.6 },
    { k: 'Change it by voice', d: 'On your phone, say what to change. Pulse finds every matching campaign, across every brand.', dur: 4.8 },
    { k: 'Hold to approve', d: 'One proposal per brand, one hold for all of them. Live on Amazon, with a day to undo.', dur: 3.6 },
  ],
}

/** the scenes in order: their chapter numbers (the film's chapter mark counts the same way) */
export const ORDER = ['hero', 'system', 'agents', 'pulse', 'proposal', 'memory', 'plays', 'start']
export const chapter = (id: string) => String(ORDER.indexOf(id) + 1).padStart(2, '0')
