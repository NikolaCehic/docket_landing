// The words for the content pages (How it works, Teams and agencies, Phone and voice, Security, About, Amazon data) and
// for the questions page. components/ContentPage.tsx renders them; the shapes are in ./pageTypes.
//
// Inline markup, in any string: {label|/path} is a link, and [placeholder] is a fact we do not know yet (shown highlighted
// until it is filled in). Plans and prices follow ./pricing.ts; retention follows ./legal.ts.
import type { ContentPage, FaqGroup } from './pageTypes'

export const PAGES: Record<'how-it-works' | 'agencies' | 'mobile' | 'security' | 'about' | 'amazon-data', ContentPage> = {
  // ---------------------------------------------------------------------------------------------------------------
  'how-it-works': {
    path: '/how-it-works',
    metaTitle: 'How it works · Docket',
    metaDescription:
      'Docket’s agents draft fixes for your Amazon ads, stock, prices and listings, Pulse briefs you every morning, and one yes applies a fix. Memory, plays, workflows and templates make it work your way.',
    k: 'How it works',
    title: 'Find the problem. Draft the fix. Check the result.',
    lede:
      'Specialist agents watch your Amazon ads, stock, prices and listings around the clock and draft a specific fix for whatever is costing you money. One person who can approve says yes, Docket makes the change, and then it measures what the change did.',
    sections: [
      {
        id: 'agents',
        k: 'Agents',
        title: 'An agent for every job.',
        lede: 'They cover every part of an Amazon account. When something is costing you money, the right agent drafts the fix, with the evidence.',
        blocks: [
          {
            type: 'features',
            cols: 2,
            items: [
              {
                t: 'Advertising',
                d: 'The PPC Optimizer finds keywords spending above your target ACoS and drafts the bid cut.',
              },
              {
                t: 'Inventory',
                d: 'The Inventory Planner sees a best seller about to run out and drafts the reorder.',
              },
              {
                t: 'Pricing and Buy Box',
                d: 'The Pricing Agent sees a competitor undercut your price and drafts the price change.',
              },
              {
                t: 'Listings',
                d: 'The Listing Doctor finds a suppressed listing and drafts the fix.',
              },
            ],
          },
          {
            type: 'text',
            paras: [
              'Those are four of them. The others cover marketing analytics, real-time monitoring, inbound, outbound and shipping, orders and sales, promotions, brand content (A+), market intel, reviews and returns, profit and finance, account health and Vendor (1P).',
              'Every workspace starts with a first scan in Watch only: the agents read and draft, and nothing changes on Amazon. They work from the data you authorize and nothing more. {See every data set and why we ask for it|/amazon-data}.',
            ],
          },
        ],
      },
      {
        id: 'pulse',
        k: 'Pulse',
        title: 'Just say “Hey Pulse.”',
        lede: 'Pulse is Docket’s voice, the Radiant Core, at your desk and on your phone: a briefing every morning, answers from your own numbers, and changes you say out loud.',
        blocks: [
          {
            type: 'steps',
            items: [
              { t: 'Your briefing is ready', d: 'Each morning Pulse has the briefing waiting: what moved, what the agents drafted, and the fixes waiting on you. Start it, or just say “Hey Pulse”.' },
              { t: 'It talks you through it', d: 'In plain words, with the numbers it mentions laid out beside the core as it speaks.' },
              { t: 'Ask it anything', d: 'Interrupt with a question, like “Why did ad spend ease yesterday?” Pulse reads your latest numbers before it answers.' },
              { t: 'Change it by voice', d: 'On your phone, say what to change, like “Increase top of search on every campaign with CBO in the name.” Pulse finds every match, across every brand, and shows the plan.' },
              { t: 'Hold to approve', d: 'One proposal per brand, one hold for all of them. Docket checks each again before it sends, and you have 24 hours to undo.' },
            ],
          },
          {
            type: 'text',
            paras: ['Pulse never approves anything by itself. What you ask for becomes a proposal, and it takes your hold, the same as any fix in Command. {See the whole phone flow|/mobile}.'],
          },
        ],
      },
      {
        id: 'command',
        k: 'Command',
        title: 'Every fix waits in Command for one yes.',
        lede: 'Open a proposal and the case for it is already there: six things, always in the same order.',
        blocks: [
          {
            type: 'features',
            cols: 3,
            items: [
              { t: 'The change', d: 'Every keyword, bid or price, from what it is now to what it would become.' },
              { t: 'What we expect', d: 'A range and a confidence, and how often this agent was right on its recent proposals.' },
              { t: 'Why now', d: 'The evidence that triggered it, with its source and how fresh it is.' },
              { t: 'The checks', d: 'Caps and floors from your rules, protected keywords, and the brand’s own data only. Docket checks the change again right before it is sent.' },
              { t: 'One yes', d: 'Anyone who can approve on that brand says yes, at your desk or on your phone. Every approval is on the record: who, and when.' },
              { t: 'Applied and measured', d: 'Docket makes the change on Amazon. You have 24 hours of undo, and the result is checked at 7 and 30 days.' },
            ],
          },
        ],
      },
      {
        id: 'memory',
        k: 'Memory',
        title: 'It learns how you run your brand.',
        lede: 'Facts, lessons from past results and what you have told it, each with its source and how sure Docket is.',
        blocks: [
          {
            type: 'text',
            paras: [
              'Memory holds what Docket knows about each brand: facts about the brand and its catalog, patterns in how your team decides, lessons from 7- and 30-day checks, events, and instructions you gave it. Each memory keeps where it came from and how sure Docket is.',
            ],
          },
          {
            type: 'features',
            cols: 3,
            items: [
              { t: 'Read before every draft', d: 'Tell it your supplier’s lead time once, and every reorder the Inventory Planner drafts plans around it.' },
              { t: 'Yours to correct', d: 'Correct a memory, confirm it or forget it. A forgotten memory stops shaping proposals at once.' },
              { t: 'From edits to rules', d: 'Your edits, answers and results go in. When they show a pattern, Docket suggests making it a rule.' },
            ],
          },
        ],
      },
      {
        id: 'plays',
        k: 'Plays',
        title: 'Standing rules, in your own words.',
        lede: 'Write what you want done the way you would brief a teammate. Plays come with every plan.',
        blocks: [
          {
            type: 'text',
            paras: [
              '“Every morning, cut bids on keywords that spend without selling, but never below my floor.” That is a complete play. Docket splits it into lines, shows which of your words each line came from, and asks wherever something could mean two things.',
              'It tries the play on your last 90 days first. Then it starts as Watch only, Ask me, or Run on its own, a standing approval for small changes that you set up. Every change it drafts is still checked again before it is sent.',
            ],
          },
          {
            type: 'steps',
            items: [
              { t: 'Say it your way', d: 'Write the rule the way you would brief a teammate.' },
              { t: 'Docket reads it back', d: 'Your words, split into lines, with a question wherever something could mean two things.' },
              { t: 'Try it on real history', d: 'Docket replays it on your recent history and shows every change it would have made, and what they would have earned. Nothing is changed on Amazon.' },
              { t: 'Turn it on', d: 'It runs on its schedule next to your other plays, and every run shows what it changed and how often that landed.' },
            ],
          },
        ],
      },
      {
        id: 'workflows',
        k: 'Workflows',
        title: 'Big jobs, run stage by stage.',
        lede: 'Launch a product, plan Q4 reorders, repair a listing. Agents do the stages, and the run waits for you at the gates.',
        blocks: [
          {
            type: 'text',
            paras: [
              'Take launching a new product. Docket builds the stages, from keyword research and the listing to the daily bid ramp, with your approval at the gates that matter. The Workflow Builder agent checks every change and suggests fixes, like a stock check before the ramp. It only edits the workflow, and nothing changes on Amazon.',
              'Before it ever runs, Docket replays it on your past launches, stage by stage. Every run is on the record.',
            ],
          },
          {
            type: 'steps',
            items: [
              { t: 'Describe the job', d: 'In your own words, from a template, or copied from another brand.' },
              { t: 'Docket builds the stages', d: 'Agent stages, automatic stages, waits, and your approval at the gates. Drag a stage to move it, or ask the Workflow Builder.' },
              { t: 'Replay past launches', d: 'See how your past launches would have gone with it, stage by stage, before it ever runs.' },
              { t: 'Runs wait for you', d: 'Each run moves on by itself and stops at a gate until you decide.' },
            ],
          },
        ],
      },
      {
        id: 'templates',
        k: 'Templates',
        title: 'Ready-made plays and workflows.',
        lede: 'Plays, workflows, watchers and reports for every area, ready to try on your own data. Templates come with every plan.',
        blocks: [
          {
            type: 'text',
            paras: [
              'Search term harvest is one: every Monday, it moves search terms that sell into exact match and negates the ones that only spend. Before you use it, Docket shows how often it would have run on your recent history and what it would have saved.',
            ],
          },
          {
            type: 'features',
            cols: 3,
            items: [
              { t: 'Tried on your data', d: 'See what a template would have done on your last 90 days before you turn it on.' },
              { t: 'Rewritten in your words', d: 'A template is only starting text. Rewrite it and it becomes your play or workflow.' },
              { t: 'Copied between brands', d: 'Copy a play or workflow that works on one brand to another. Copying comes with Growth and Agency.' },
            ],
          },
        ],
      },
      {
        id: 'next',
        k: 'Next',
        title: 'Where to go from here.',
        blocks: [
          {
            type: 'links',
            items: [
              {
                t: 'Teams and agencies',
                d: 'One login for every client, authorization by link, roles brand by brand and one queue.',
                href: '/agencies',
              },
              { t: 'Plans and prices', d: 'Brand, Growth and Agency. Every plan starts with a first scan in Watch only.', href: '/pricing' },
            ],
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------------------------------------------------
  agencies: {
    path: '/agencies',
    metaTitle: 'Teams and agencies · Docket',
    metaDescription:
      'One login and one queue for every client brand, client authorization by link, each client kept separate, and roles brand by brand. Docket for teams and agencies.',
    k: 'Teams and agencies',
    title: 'One queue for every client brand.',
    lede:
      'One login covers every client brand. Each client authorizes Amazon once, from a link, and stays separate from the others. Anyone who can approve on a brand says yes, and every approval is on the record.',
    sections: [
      {
        id: 'one-queue',
        k: 'One queue',
        title: 'Work every client from one place.',
        lede: 'Clear the day’s decisions across all your brands without switching accounts.',
        blocks: [
          {
            type: 'features',
            cols: 2,
            items: [
              {
                t: 'One login',
                d: 'A single sign-in for every client brand you are assigned to.',
              },
              {
                t: 'One queue in Command',
                d: 'The day’s proposals across every client in a single queue, each with its evidence. Filter to one brand when you want to.',
              },
              {
                t: 'Home for all brands',
                d: 'Every area of every brand at a glance, so you see which brands need you first.',
              },
              {
                t: 'Copy what works',
                d: 'A play or workflow that works on one brand can be copied to another. Copying comes with Growth and Agency.',
              },
            ],
          },
        ],
      },
      {
        id: 'client-onboarding',
        k: 'Client onboarding',
        title: 'Each client authorizes once, from a link.',
        lede: 'No passwords are shared, and clients never need a Docket login.',
        blocks: [
          {
            type: 'steps',
            items: [
              {
                t: 'Send the link',
                d: 'From your workspace, send the client a scoped authorization link for their brand.',
              },
              {
                t: 'The client reviews',
                d: 'They see exactly what access is requested for their brand.',
              },
              {
                t: 'Amazon’s consent',
                d: 'They authorize Amazon Ads and Seller Central on Amazon’s own pages. Docket receives a revocable token, never a password.',
              },
              {
                t: 'Findings start',
                d: 'The first findings arrive within minutes. The client does not need to come back, and revokes at Amazon if they ever want to.',
              },
            ],
          },
        ],
      },
      {
        id: 'kept-separate',
        k: 'Kept separate',
        title: 'Each client stays in its own lane.',
        lede: 'What Docket learns and does for one client never touches another.',
        blocks: [
          {
            type: 'features',
            cols: 2,
            items: [
              {
                t: 'Its own data',
                d: 'Each brand has its own data, its own Memory and its own plays. Nothing from one client reaches another.',
              },
              {
                t: 'Its own Amazon access',
                d: 'Each brand has its own authorization, so access to one client never opens another.',
              },
              {
                t: 'Checked on its own data',
                d: 'Before a change is sent, Docket checks it again against that brand’s rules and that brand’s own data only.',
              },
              {
                t: 'When a client leaves',
                d: 'If a client revokes access at Amazon, Docket marks the brand as disconnected, stops its writes and cancels its pending proposals. Your admins are alerted.',
              },
            ],
          },
        ],
      },
      {
        id: 'roles-and-seats',
        k: 'Roles and seats',
        title: 'Roles, brand by brand.',
        lede: 'Anyone who can approve on a brand approves, and one yes is enough.',
        blocks: [
          {
            type: 'features',
            cols: 2,
            items: [
              {
                t: 'Who can approve',
                d: 'The Owner, Admins and Approvers can approve in the brands they are assigned to. Specialist approver roles, such as a PPC approver, can approve in one area only.',
              },
              {
                t: 'Who cannot',
                d: 'Strategist, Operator and Analyst roles cannot approve. They can open a proposal and nudge a person who can.',
              },
              {
                t: 'Brand access',
                d: 'You assign people to brands. The brands a person is not assigned to do not appear for them.',
              },
              {
                t: 'The approval record',
                d: 'Every approval is on the record: who said yes, and when.',
              },
              {
                t: 'Seats',
                d: 'Agency includes unlimited seats. Growth includes up to 10 and Brand up to 3.',
              },
              {
                t: 'Admins',
                d: 'Admins manage roles, seats and client authorization, and choose who can approve on each brand.',
              },
            ],
          },
        ],
      },
      {
        id: 'on-the-phone',
        k: 'On the phone',
        title: 'Approve from anywhere.',
        blocks: [
          {
            type: 'text',
            paras: [
              'The yes does not have to wait for a desk. Anyone who can approve on a brand can say yes from a phone, with the same evidence as on the desktop, and hold once to approve a change across several brands. {See Phone and voice|/mobile}.',
            ],
          },
        ],
      },
      {
        id: 'agency-plan',
        k: 'Agency plan',
        title: 'Priced for agencies.',
        blocks: [
          {
            type: 'text',
            paras: [
              'The Agency plan is $1,490 per month for up to 20 client brands, with $59 for each extra brand. It includes client authorization by link, each client kept separate with its own access, unlimited seats and agency roles, one queue across every client and priority support.',
            ],
          },
          {
            type: 'links',
            items: [
              { t: 'Plans and prices', d: 'Compare Agency with Growth and Brand.', href: '/pricing' },
              { t: 'What we ask Amazon for', d: 'Every data set, why we need it, and how a client revokes access.', href: '/amazon-data' },
              { t: 'Book a demo', d: 'See Docket with your own client brands.', href: '/contact' },
            ],
          },
        ],
      },
    ],
    cta: {
      title: 'Run every client from one queue.',
      sub: 'Book a demo, or start with a first scan on one brand. Every workspace starts in Watch only.',
    },
  },

  // ---------------------------------------------------------------------------------------------------------------
  mobile: {
    path: '/mobile',
    metaTitle: 'Phone and voice · Docket',
    metaDescription:
      'Approve Docket’s proposals from your phone, or say a change in plain words and approve it with one hold. Every value is checked on Amazon.',
    k: 'Phone and voice',
    title: 'Change it by voice, across every brand.',
    lede:
      'Say what you want changed in plain words, or ask how something is doing. Docket finds every match, shows you the plan, and applies it the moment you approve.',
    sections: [
      {
        id: 'approve-anywhere',
        k: 'On the go',
        title: 'The same proposals, on your phone.',
        blocks: [
          {
            type: 'text',
            paras: [
              'Every proposal reaches your phone with the same case it has on the desktop: the change, what we expect, why now and the checks. Anyone who can approve on that brand can say yes, and one yes is enough.',
              'Hold to approve, and Docket applies it. The phone app, with voice, comes with every plan.',
            ],
          },
        ],
      },
      {
        id: 'one-sentence',
        k: 'Say it',
        title: 'From one sentence to a live change.',
        lede: '“Increase TOS on all campaigns containing CBO.” That is the whole instruction.',
        blocks: [
          {
            type: 'phones',
            items: [
              {
                src: '/film/phone/MobileChange1_Say.webp',
                alt: 'Docket on the phone: the spoken change “Increase TOS on all campaigns containing CBO”, kept word for word',
                caption: 'Say it',
              },
              {
                src: '/film/phone/MobileChange2_Read.webp',
                alt: 'Docket on the phone: how Docket understood the sentence, with its questions for you',
                caption: 'Understood',
              },
              {
                src: '/film/phone/MobileChange3_Match.webp',
                alt: 'Docket on the phone: every matching campaign found across the brands, and which of them will change',
                caption: 'Campaigns',
              },
              {
                src: '/film/phone/MobileChange4_Approve.webp',
                alt: 'Docket on the phone: one proposal for each brand, with one hold button that approves them all',
                caption: 'Approve',
              },
              {
                src: '/film/phone/MobileChange5_Done.webp',
                alt: 'Docket on the phone: the change live on Amazon, with each value checked and undo open for 24 hours',
                caption: 'Done',
              },
            ],
          },
          {
            type: 'steps',
            items: [
              { t: 'Say it', d: 'Say the change in plain words. Docket keeps exactly what you said.' },
              { t: 'Understood', d: 'Docket reads back how it understood you, with the questions it has.' },
              { t: 'Campaigns', d: 'It finds every matching campaign across your brands, and shows which will change.' },
              { t: 'Approve', d: 'One proposal per brand. Hold once to approve them all. Docket checks each again before it sends.' },
              { t: 'Done', d: 'Live on Amazon, checked value by value. Undo for 24 hours.' },
            ],
          },
        ],
      },
      {
        id: 'ask-or-change',
        k: 'Ask or change',
        title: 'Ask how it is doing, or say what to change.',
        blocks: [
          {
            type: 'features',
            cols: 3,
            items: [
              {
                t: 'Ask',
                d: 'Ask how a brand, a campaign or a product is doing. Docket answers from your data, and asking never changes anything.',
              },
              {
                t: 'Change',
                d: 'Say what to change. Docket reads it back and asks about anything vague before it looks for matches.',
              },
              {
                t: 'Your words stay yours',
                d: 'Docket keeps what you said word for word, shows how it understood you, and never rewrites your words.',
              },
            ],
          },
        ],
      },
      {
        id: 'before-you-approve',
        k: 'Before you approve',
        title: 'The plan, brand by brand, on screen.',
        blocks: [
          {
            type: 'features',
            cols: 2,
            items: [
              {
                t: 'Every match listed',
                d: 'Docket finds every matching campaign across your brands and shows which will change and which will not.',
              },
              {
                t: 'One proposal per brand',
                d: 'Each brand gets its own proposal, so you see what changes where.',
              },
              {
                t: 'Checked again',
                d: 'Before it sends, Docket checks each proposal again: caps and floors from your rules, protected keywords, and that brand’s own data only.',
              },
              {
                t: 'A deliberate hold',
                d: 'You hold to approve rather than tap, so a stray touch cannot send a change.',
              },
            ],
          },
        ],
      },
      {
        id: 'after-you-approve',
        k: 'After you approve',
        title: 'Live on Amazon, with undo for 24 hours.',
        blocks: [
          {
            type: 'features',
            cols: 2,
            items: [
              {
                t: 'Applied on Amazon',
                d: 'Docket makes the change on Amazon the moment you approve.',
              },
              {
                t: 'Checked value by value',
                d: 'Each value is checked on Amazon, so you see what is live, not just what was sent.',
              },
              {
                t: 'Undo for 24 hours',
                d: 'If you change your mind within a day, Docket reverses the change.',
              },
              {
                t: 'Measured later',
                d: 'The result is checked at 7 and 30 days, and the agent’s track record is updated.',
              },
            ],
          },
          {
            type: 'links',
            items: [
              { t: 'How it works', d: 'Agents, Command, Memory, plays, workflows and templates, in one loop.', href: '/how-it-works' },
              { t: 'Teams and agencies', d: 'One login for every client, roles brand by brand and one queue.', href: '/agencies' },
            ],
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------------------------------------------------
  security: {
    path: '/security',
    metaTitle: 'Security · Docket',
    metaDescription:
      'You grant Docket access on Amazon’s own pages and can revoke it at any time. Docket requests the least data, and keeps a record of every approval.',
    k: 'Security and trust',
    title: 'You grant access, and you can take it back.',
    lede:
      'Docket reads only the Amazon data its agents need, applies a change only after a person approves it, and keeps a record of every decision. You can end access at Amazon at any time.',
    sections: [
      {
        id: 'how-access-works',
        k: 'Access',
        title: 'How access works.',
        blocks: [
          {
            type: 'features',
            cols: 2,
            items: [
              {
                t: 'Amazon’s own consent pages',
                d: 'You authorize Amazon Ads and Seller Central on Amazon’s pages, not on ours.',
              },
              {
                t: 'A revocable token',
                d: 'Docket receives a token that you can revoke at Amazon at any time.',
              },
              {
                t: 'Never your password',
                d: 'Docket never sees or stores your Amazon password.',
              },
              {
                t: 'Separate per brand',
                d: 'Each brand has its own authorization, so access to one brand never opens another.',
              },
            ],
          },
          {
            type: 'text',
            paras: ['Every data set Docket requests, and why, is listed on {Amazon data|/amazon-data}, together with the steps to revoke access.'],
          },
        ],
      },
      {
        id: 'data-and-changes',
        k: 'Data and changes',
        title: 'What Docket reads, and what it writes.',
        blocks: [
          {
            type: 'features',
            cols: 3,
            items: [
              {
                t: 'Only what the agents need',
                d: 'Docket requests the data sets listed on {Amazon data|/amazon-data} and nothing beyond them.',
              },
              {
                t: 'No buyer personal data',
                d: 'Docket never requests buyer names, addresses, emails or phone numbers. Order data is used as totals.',
              },
              {
                t: 'Writes only on approval',
                d: 'Write access is used only to apply a change that a person who can approve on that brand has approved.',
              },
              {
                t: 'Watch only to start',
                d: 'Every workspace starts in Watch only, where Docket reads and drafts and sends no change to Amazon.',
              },
              {
                t: 'The approval record',
                d: 'Every approval is kept on the record: who approved what, and when.',
              },
              {
                t: 'Undo and checks',
                d: 'Applied changes can be undone for 24 hours, and results are checked at 7 and 30 days.',
              },
            ],
          },
        ],
      },
      {
        id: 'data-protection',
        k: 'Data protection',
        title: 'How your data is protected.',
        blocks: [
          {
            type: 'features',
            cols: 3,
            items: [
              {
                t: 'Encryption in transit',
                d: '[Encryption in transit] protects data moving between your browser, Docket and Amazon.',
              },
              {
                t: 'Encryption at rest',
                d: 'Stored workspace data is protected with [encryption at rest].',
              },
              {
                t: 'Hosting',
                d: 'Docket is hosted with [cloud provider] in [hosting region].',
              },
              {
                t: 'Backups',
                d: 'Backups follow [backup policy] and expire within [35] days.',
              },
              {
                t: 'Access inside Docket',
                d: 'Access to workspace data is role-based and least-privilege, with audit logs and [two-factor sign-in status].',
              },
            ],
          },
        ],
      },
      {
        id: 'retention-and-deletion',
        k: 'Retention',
        title: 'Retention and deletion.',
        blocks: [
          {
            type: 'text',
            paras: [
              'Delete a workspace or your account and the related Amazon data is erased within [30] days. Backups expire within [35] days.',
              'Revoking access at Amazon ends Docket’s ability to read or change your account. The {Privacy Policy|/privacy} has the detail.',
            ],
          },
        ],
      },
      {
        id: 'agreements',
        k: 'Agreements',
        title: 'Sub-processors, agreements and certifications.',
        blocks: [
          {
            type: 'features',
            cols: 3,
            items: [
              {
                t: 'Sub-processors',
                d: 'The providers that help run Docket, what each does and where, are listed on {Sub-processors|/subprocessors}. We tell you by email before we add one.',
              },
              {
                t: 'Data Processing Agreement',
                d: 'The {DPA|/dpa} sets out how Docket processes personal data for you. A signed copy is available on request.',
              },
              {
                t: 'Certifications',
                d: 'Status: [SOC 2 Type II status]. A certification is listed here only once it is held.',
              },
            ],
          },
        ],
      },
      {
        id: 'report-a-vulnerability',
        k: 'Reporting',
        title: 'Report a vulnerability.',
        blocks: [
          {
            type: 'text',
            paras: [
              'If you think you have found a security issue, write to security@[domain]. Include what you found and the steps to reproduce it.',
              'We will acknowledge your report within [acknowledgement time].',
            ],
          },
        ],
      },
    ],
    cta: {
      title: 'Questions for your security review?',
      sub: 'Talk to a person, or start with a first scan, which runs in Watch only.',
    },
  },

  // ---------------------------------------------------------------------------------------------------------------
  about: {
    path: '/about',
    metaTitle: 'About · Docket',
    metaDescription:
      'Docket is a team of AI agents that watches Amazon accounts and drafts the fixes, made for agency PPC operators and brand owners.',
    k: 'About Docket',
    title: 'Made for the people who run Amazon accounts.',
    lede:
      'Docket is a team of AI agents that watches Amazon accounts around the clock and drafts the fixes. It is made for agency PPC operators and brand owners who want evidence behind every change.',
    sections: [
      {
        id: 'what-docket-is',
        k: 'What Docket is',
        title: 'Agents that find the problem and draft the fix.',
        blocks: [
          {
            type: 'text',
            paras: [
              'Docket’s agents watch your Amazon Ads and Seller Central data for advertising, inventory, pricing and listings. They find what is costing money and draft specific changes for a person to approve.',
              'Approved changes go to Amazon, and Docket checks the result afterwards. {See how it works|/how-it-works}.',
            ],
          },
        ],
      },
      {
        id: 'who-its-for',
        k: 'Who it is for',
        title: 'Operators first, then owners.',
        blocks: [
          {
            type: 'features',
            cols: 3,
            items: [
              {
                t: 'Agency PPC operators',
                d: 'People who run several brands on Amazon and want to clear the day’s decisions quickly, with the evidence in front of them.',
              },
              {
                t: 'Brand owners',
                d: 'Sellers who run their own brand, alone or with a small team, and want fixes they can trust.',
              },
              {
                t: 'Agency admins',
                d: 'The people who set roles and seats, and bring each client on with a link.',
              },
            ],
          },
        ],
      },
      {
        id: 'why-it-exists',
        k: 'Why it exists',
        title: 'Too many dashboards, too little evidence.',
        blocks: [
          {
            type: 'text',
            paras: [
              'People who run many brands on Amazon spend their days in dashboards and alerts. Changes get made on a hunch, and few get checked afterwards.',
              'Docket puts the work in one queue: each fix with its evidence, a person who approves it, and a result measured after the change.',
            ],
          },
        ],
      },
      {
        id: 'principles',
        k: 'Principles',
        title: 'What we hold ourselves to.',
        blocks: [
          {
            type: 'features',
            cols: 3,
            items: [
              {
                t: 'Start by watching',
                d: 'Every workspace begins in Watch only. Docket earns your trust before it acts.',
              },
              {
                t: 'Every number has a source',
                d: 'Each figure shows where it came from and how fresh it is. Each change has an owner and a measured outcome.',
              },
              {
                t: 'Your words stay yours',
                d: 'When you write a play, Docket shows how it read your words and never rewrites them silently.',
              },
              {
                t: 'Dense, and calm',
                d: 'You should be able to read the state of eight brands at a glance, without clutter.',
              },
              {
                t: 'A yes before anything changes',
                d: 'Nothing reaches Amazon without approval from someone allowed to give it.',
              },
            ],
          },
        ],
      },
      {
        id: 'company',
        k: 'Company',
        title: 'Company details.',
        blocks: [
          {
            type: 'text',
            paras: [
              'Docket is a product of [Company legal name], registered at [registered address] and founded in [founded year].',
              'Docket is a working name. Amazon, Amazon Ads, Seller Central and Vendor Central are trademarks of Amazon.com, Inc. or its affiliates, and Docket is independent of Amazon.',
            ],
          },
          {
            type: 'links',
            items: [
              {
                t: 'Talk to a person',
                d: 'Questions about the product, pricing or your data. A person replies within one business day.',
                href: '/contact',
              },
              { t: 'Plans and prices', d: 'Brand, Growth and Agency, from $199 per month.', href: '/pricing' },
            ],
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------------------------------------------------
  // Only what comes after the data table: the table itself (each data set, why, and its access) is a component.
  'amazon-data': {
    path: '/amazon-data',
    metaTitle: 'Amazon data · Docket',
    metaDescription:
      'Every Amazon data set Docket requests, why the agents need it, how authorization works, and how to revoke access at Amazon at any time.',
    k: 'Amazon data',
    title: 'Exactly what Docket asks Amazon for.',
    lede:
      'Docket connects through the Amazon Ads API and the Selling Partner API, with your authorization on Amazon’s own pages. Each data set is listed below with why the agents need it and whether access is read or write on approval.',
    sections: [
      {
        id: 'how-authorization-works',
        k: 'Authorization',
        title: 'How authorization works.',
        blocks: [
          {
            type: 'steps',
            items: [
              { t: 'Start the first scan', d: 'Enter your work email. Your workspace opens in Watch only.' },
              {
                t: 'Open Amazon’s consent page',
                d: 'Docket sends you to Amazon. You sign in there, with Amazon, and Docket never sees your password.',
              },
              {
                t: 'Review and confirm',
                d: 'Amazon shows what Docket is asking for. There is one authorization for Amazon Ads and one for Seller Central.',
              },
              {
                t: 'Docket receives a token',
                d: 'Amazon returns a revocable token. It lets Docket read your account, and write only after a person approves a change.',
              },
              {
                t: 'The first scan runs',
                d: 'Listings and stock are read first, so findings arrive within minutes. Ad findings follow as Amazon’s reports land.',
              },
            ],
          },
          {
            type: 'text',
            paras: ['Amazon asks for Selling Partner API authorizations to be renewed every 365 days. Docket warns your admins 60 days before it is due.'],
          },
        ],
      },
      {
        id: 'never-requested',
        k: 'Never requested',
        title: 'What we never ask for.',
        blocks: [
          {
            type: 'features',
            cols: 2,
            items: [
              {
                t: 'Buyer personal data',
                d: 'No buyer names, addresses, emails or phone numbers. The agents do not need them.',
              },
              {
                t: 'Your Amazon password',
                d: 'Not at sign-in, and not afterwards. You sign in on Amazon’s pages.',
              },
              {
                t: 'Anything outside the table',
                d: 'If a data set is not listed above, Docket does not request it.',
              },
              {
                t: 'Changes nobody approved',
                d: 'Write access is used only to apply a change that a person who can approve on that brand approved.',
              },
            ],
          },
        ],
      },
      {
        id: 'revoke-seller-central',
        k: 'Revoking access',
        title: 'Revoke in Seller Central.',
        lede: 'You can end access at Amazon at any time, without signing in to Docket.',
        blocks: [
          {
            type: 'steps',
            items: [
              { t: 'Sign in to Seller Central', d: 'Use the account that authorized Docket.' },
              { t: 'Open Apps & Services', d: 'In the menu, choose Apps & Services, then Manage Your Apps.' },
              { t: 'Find Docket', d: 'Docket is listed with the other apps you have authorized.' },
              { t: 'Disable authorization', d: 'Choose Disable authorization. Docket can no longer read or change the account.' },
            ],
          },
        ],
      },
      {
        id: 'revoke-amazon-ads',
        k: 'Revoking access',
        title: 'Revoke in Amazon Ads.',
        blocks: [
          {
            type: 'steps',
            items: [
              { t: 'Sign in to Amazon', d: 'Use the Amazon account that authorized Docket for advertising.' },
              {
                t: 'Open your authorized apps',
                d: 'Find Manage apps & services with data access under your account [confirm the current menu path].',
              },
              { t: 'Remove Docket', d: 'Choose Docket and remove its access. Docket can no longer read or change your advertising.' },
            ],
          },
        ],
      },
      {
        id: 'retention-and-deletion',
        k: 'Retention',
        title: 'When access ends, and when you delete.',
        blocks: [
          {
            type: 'text',
            paras: [
              'When Amazon ends access, Docket marks the brand as disconnected, stops all writes and cancels its pending proposals. Agency clients never need to come back to Docket to revoke.',
              'Delete a workspace or your account and the related Amazon data is erased within [30] days. Backups expire within [35] days.',
            ],
          },
        ],
      },
      {
        id: 'more-detail',
        k: 'More',
        title: 'More detail.',
        blocks: [
          {
            type: 'links',
            items: [
              { t: 'Privacy Policy', d: 'What Docket collects, how it is used and your rights.', href: '/privacy' },
              { t: 'Sub-processors', d: 'The providers that help run Docket, and where they process data.', href: '/subprocessors' },
              { t: 'Security', d: 'How access, data protection and approvals work.', href: '/security' },
            ],
          },
        ],
      },
    ],
  },
}

// ---------------------------------------------------------------------------------------------------------------
// The questions page. The plans group follows ./pricing.ts exactly.
export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: 'product',
    title: 'Product',
    items: [
      [
        'What do the agents actually do?',
        'Specialist agents watch your ads, stock, prices, listings and every other part of the account, and draft fixes: bid and budget changes, reorders and shipments, price changes and listing repairs, each with its evidence. Approve one and Docket applies it on Amazon, then checks the result at 7 and 30 days.',
      ],
      [
        'Will agents change anything without my approval?',
        'No. Every change is a proposal until a person who can approve on that brand approves it. The one exception is a play you set to Run on its own, which is a standing approval you gave for small changes. In Watch only, nothing is ever sent to Amazon.',
      ],
      [
        'How soon do I see findings?',
        'Listings and stock are read as soon as Seller Central connects, so the first scan shows findings within minutes. Ad findings follow when the search-term report lands, and the 95-day history finishes overnight.',
      ],
      [
        'What is Watch only?',
        'It is where every workspace starts: the agents read your account, find problems and draft fixes, and Docket sends no change to Amazon. When you are ready, you move to Ask me, where each fix waits for a yes.',
      ],
      [
        'What is in a proposal?',
        'The change, what we expect with a range and a confidence, why now, and the checks it passed. You can edit it before you approve, and Docket checks it again right before it is sent.',
      ],
      [
        'Can I undo a change?',
        'Yes, for 24 hours after it is applied. Docket also checks the result at 7 and 30 days, so you can see whether it worked.',
      ],
      [
        'What is Memory?',
        'It is what Docket knows about your brand: facts, lessons from past results and what you have told it, each with its source and how sure Docket is. Every agent reads it before it drafts a fix, and you can correct, confirm or forget any memory. Memory comes with every plan.',
      ],
      [
        'What are plays?',
        'Plays are standing rules you write in your own words. Docket shows how it read them, asks where they are vague, and tries them on your last 90 days before they turn on. A play can start as Watch only, Ask me, or Run on its own. Plays come with every plan.',
      ],
      [
        'What are workflows?',
        'A workflow is a job with several stages, like launching a new ASIN. Agents do the stages, the run waits for you at the gates, and Docket replays it on past launches before it runs. Workflows come with Growth and Agency.',
      ],
      [
        'What are templates?',
        'Templates are ready-made plays, workflows, watchers and reports for every part of the account. Docket tries one on your data, you rewrite it in your own words, and it becomes yours. Templates come with every plan.',
      ],
    ],
  },
  {
    id: 'data',
    title: 'Data and access',
    items: [
      [
        'Do you need my Amazon password?',
        'No. You authorize Docket on Amazon’s own consent pages. We receive a revocable token, never your password.',
      ],
      [
        'Which accounts can I connect?',
        'Seller Central and Amazon Ads accounts, across North America, Europe and Far East marketplaces. Brand covers one region, and Growth and Agency add Vendor Central and every region.',
      ],
      [
        'Can I revoke access?',
        'Yes, any time, at Amazon: in Seller Central under Apps & Services, or in Amazon Ads. Agency clients never need to come back to Docket to revoke, and the steps are on {Amazon data|/amazon-data}.',
      ],
      [
        'Do you sell or share my data?',
        'No. Your data is used only to run your workspace. The {Privacy Policy|/privacy} explains how long data is kept, and the {sub-processors|/subprocessors} page lists the providers that help run Docket.',
      ],
      [
        'Do you see my customers’ personal information?',
        'No. Docket never requests buyer names, addresses, emails or phone numbers, and order data is used as totals only.',
      ],
      [
        'How long do you keep my data?',
        'Delete a workspace or your account and the related Amazon data is erased within [30] days. Backups expire within [35] days.',
      ],
      [
        'Where is my data stored?',
        'With [cloud provider] in [hosting region]. How it is protected is on {Security|/security}.',
      ],
    ],
  },
  {
    id: 'plans',
    title: 'Plans and pricing',
    items: [
      [
        'What do the plans cost?',
        'Brand is $199 per month for one brand, Growth is $499 for up to 5 brands, and Agency is $1,490 for up to 20 client brands. {Plans and prices|/pricing} compares them.',
      ],
      [
        'Is there a trial?',
        'No. Every plan starts with a first scan in Watch only: Docket reads your account and drafts fixes, and billing starts when you choose a plan.',
      ],
      [
        'Do you charge a share of ad spend?',
        'No. Plans are a flat price per month, whatever you spend on ads.',
      ],
      [
        'How does yearly billing work?',
        'Pay for twelve months up front and save 20% on the monthly price.',
      ],
      [
        'What counts as a brand?',
        'A brand is one seller or vendor account’s products under one brand name. An agency’s clients each count as one brand.',
      ],
      [
        'How many people can use Docket?',
        'Brand includes up to 3 seats and Growth up to 10. Agency has unlimited seats.',
      ],
      [
        'What do Growth and Agency add?',
        'Every plan has every agent, Pulse, Memory, plays and every template. Growth adds workflows, Strategy (goals and seasonal phases), copying plays and workflows between brands, roles for your team brand by brand, Vendor Central and every region. Agency adds client authorization by link, each client kept separate with its own access, unlimited seats and agency roles, one queue across every client and priority support.',
      ],
      [
        'Can I change plans later?',
        'Yes. Move up or down at any time, and the new price applies from the next billing period.',
      ],
    ],
  },
  {
    id: 'agencies',
    title: 'Teams and agencies',
    items: [
      [
        'How does a client authorize their brand?',
        'You send the client a scoped link. They review the access, authorize Amazon Ads and Seller Central on Amazon’s own pages, and they are done. No passwords are shared.',
      ],
      [
        'Do my clients need a Docket login?',
        'No. A client authorizes once from the link and never needs to come back, including to revoke access, which they do at Amazon.',
      ],
      [
        'Who can approve a change?',
        'Anyone who can approve on that brand, and one yes is enough. The Owner, Admins and Approvers can approve in the brands they are assigned to, and specialist approver roles can approve in their own area. Strategist, Operator and Analyst roles cannot approve. Every approval is on the record, with who said yes and when. Roles, brand by brand, come with Growth and Agency.',
      ],
      [
        'Can team members see only some clients?',
        'Yes. You assign each person the brands they work on, and the other brands do not appear for them.',
      ],
      [
        'What happens if a client revokes access?',
        'Docket marks that brand as disconnected, stops its writes and cancels its pending proposals. Your admins are alerted.',
      ],
      [
        'Can I copy a play to another client?',
        'Yes. A play or workflow that works on one brand can be copied to another. Copying between brands comes with Growth and Agency.',
      ],
      [
        'What does the Agency plan include?',
        'It is $1,490 per month for up to 20 client brands, then $59 for each extra brand. It includes client authorization by link, each client kept separate with its own access, unlimited seats and agency roles, one queue across every client and priority support.',
      ],
      [
        'Can I approve from my phone?',
        'Yes. Anyone who can approve on a brand can approve from the phone, with the same evidence as on the desktop. You can also say a change in plain words and hold once to approve it across several brands.',
      ],
      [
        'Can I see Docket with my own brands first?',
        'Yes. {Book a demo|/contact} to see it with your own client brands, or start with a first scan on one brand.',
      ],
    ],
  },
]
