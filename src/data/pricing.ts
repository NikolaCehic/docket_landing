// Plans and prices. PLACEHOLDERS: every number here is a placeholder until pricing is decided; change them here and
// the pricing section on the home page, the /pricing page and the questions page all follow.

export type PlanId = 'brand' | 'growth' | 'agency'
export type Plan = {
  id: PlanId
  name: string
  for: string
  /** price per month, billed monthly / billed yearly */
  monthly: number
  yearly: number
  unit: string
  note: string
  cta: { label: string; sheet?: 'scan'; href?: string }
  lead?: string
  includes: string[]
  featured?: boolean
}

/** yearly billing saves this share (shown on the toggle) */
export const YEARLY_SAVING = '20%'

export const PLANS: Plan[] = [
  {
    id: 'brand',
    name: 'Brand',
    for: 'One brand, run by you or a small team.',
    monthly: 199,
    yearly: 159,
    unit: 'per month',
    note: '1 brand · up to 3 seats',
    cta: { label: 'Get your first scan', sheet: 'scan' },
    includes: [
      'Every agent, for every part of your account',
      'Pulse: briefings and changes by voice, at your desk and on your phone',
      'Every fix with its evidence, results checked at 7 and 30 days',
      'Memory that learns your brand',
      'Plays in your own words, and every template',
      'Seller Central and Amazon Ads, one region',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    for: 'Several brands, or a team that shares the decisions.',
    monthly: 499,
    yearly: 399,
    unit: 'per month',
    note: 'Up to 5 brands · up to 10 seats',
    cta: { label: 'Get your first scan', sheet: 'scan' },
    lead: 'Everything in Brand, plus:',
    includes: [
      'Workflows: big jobs, run stage by stage',
      'Strategy: goals and seasonal phases',
      'Copy plays and workflows between brands',
      'Roles for your team, brand by brand',
      'Vendor Central, and every region',
    ],
    featured: true,
  },
  {
    id: 'agency',
    name: 'Agency',
    for: 'Agencies running client brands.',
    monthly: 1490,
    yearly: 1190,
    unit: 'per month',
    note: 'Up to 20 client brands · $59 per extra brand',
    cta: { label: 'Book a demo', href: '/contact?topic=demo' },
    lead: 'Everything in Growth, plus:',
    includes: [
      'Client authorization by link, no passwords shared',
      'Each client kept separate, with its own access',
      'Unlimited seats and agency roles',
      'One queue across every client',
      'Priority support',
    ],
  },
]

/** what every plan has, shown under the plans */
export const ALL_PLANS = [
  'Starts with a first scan in Watch only',
  'Nothing changes on Amazon without a yes',
  'Undo any change for 24 hours',
  'Revoke access any time at Amazon',
]

/** the full comparison on /pricing: true, false or a short value per plan */
export type Cell = boolean | string
export const COMPARE: { group: string; rows: { t: string; v: [Cell, Cell, Cell] }[] }[] = [
  {
    group: 'Brands and people',
    rows: [
      { t: 'Brands', v: ['1', 'Up to 5', 'Up to 20, then $59 each'] },
      { t: 'Seats', v: ['3', '10', 'Unlimited'] },
      { t: 'Marketplace regions', v: ['1', 'All', 'All'] },
      { t: 'Seller Central and Amazon Ads', v: [true, true, true] },
      { t: 'Vendor Central', v: [false, true, true] },
    ],
  },
  {
    group: 'Agents and fixes',
    rows: [
      { t: 'Every agent, for every part of your account', v: [true, true, true] },
      { t: 'Pulse: briefings and changes by voice, at your desk and on your phone', v: [true, true, true] },
      { t: 'Fixes with evidence, one yes to approve', v: [true, true, true] },
      { t: 'Results checked at 7 and 30 days', v: [true, true, true] },
      { t: 'Undo for 24 hours', v: [true, true, true] },
      { t: 'Memory that learns your brand', v: [true, true, true] },
    ],
  },
  {
    group: 'Automation',
    rows: [
      { t: 'Plays in your own words', v: [true, true, true] },
      { t: 'Every template', v: [true, true, true] },
      { t: 'Workflows with stages and gates', v: [false, true, true] },
      { t: 'Strategy: goals and seasonal phases', v: [false, true, true] },
      { t: 'Copy plays and workflows between brands', v: [false, true, true] },
    ],
  },
  {
    group: 'Teams and clients',
    rows: [
      { t: 'Roles, brand by brand', v: [false, true, true] },
      { t: 'Client authorization by link', v: [false, false, true] },
      { t: 'One queue across every client', v: [false, false, true] },
      { t: 'Agency roles', v: [false, false, true] },
    ],
  },
  {
    group: 'Everywhere',
    rows: [
      { t: 'Approval record: who said yes, and when', v: [true, true, true] },
      { t: 'Support', v: ['Email', 'Email', 'Priority'] },
    ],
  },
]

export const PRICING_FAQ: [string, string][] = [
  ['What counts as a brand?', 'A brand is one seller or vendor account’s products under one brand name. An agency’s clients each count as one brand.'],
  ['Is there a trial?', 'Every plan starts with a first scan in Watch only: Docket reads your account and drafts fixes, and nothing changes on Amazon until you approve. Billing starts when you choose a plan.'],
  ['Do you charge a share of ad spend?', 'No. Plans are a flat price per month, whatever you spend on ads.'],
  ['Can I change plans later?', 'Yes. Move up or down at any time; the new price applies from the next billing period.'],
  ['How does yearly billing work?', `Pay for twelve months up front and save ${YEARLY_SAVING} on the monthly price.`],
]

export const money = (n: number) => '$' + n.toLocaleString('en-US')
