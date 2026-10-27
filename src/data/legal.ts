// The four legal documents, as typed data. LegalPage renders them.
//
// Inline markup inside a string:
//   {label|/path}   a link (plain <a href>, so it is a full page load)
//   [Placeholder]   an open value that counsel or the founder still has to fill in; rendered with a quiet highlight
// These documents are a draft. Nothing here may state a fact the product brief does not give: keep a bracketed
// placeholder for anything unknown.

export type LegalBlock =
  | string
  | { list: string[] }
  | { table: { head: string[]; rows: string[][] } }

export type LegalSection = { h: string; body: LegalBlock[] }

export type LegalSlug = 'privacy' | 'terms' | 'dpa' | 'subprocessors'

export type LegalDoc = {
  slug: LegalSlug
  /** Full document title (h1 and page title). */
  title: string
  /** Short name used in the rail and the footer. */
  nav: string
  /** One or two sentences under the title. */
  summary: string
  /** Value shown after "Last updated". */
  updated: string
  sections: LegalSection[]
  /** Optional closing call to action under the sections. */
  cta?: { label: string; href: string }
}

export const LEGAL_STATUS = 'Draft, to be reviewed by counsel before launch'

export const AMAZON_DISCLAIMER =
  'Amazon, Amazon Ads, Seller Central, Vendor Central and all related logos and marks are trademarks of Amazon.com, Inc. or its affiliates. Docket is an independent product of [Company legal name] and uses the Amazon Ads API and the Amazon Selling Partner API with each customer’s authorization. Mention of Amazon does not imply endorsement by Amazon.'

const privacy: LegalDoc = {
  slug: 'privacy',
  title: 'Privacy Policy',
  nav: 'Privacy Policy',
  updated: '[date]',
  summary:
    'This policy explains what Docket collects, how it is used and how you can control it. In short: your Amazon data is used only to run your workspace, and it is never sold.',
  sections: [
    {
      h: 'Who we are',
      body: [
        'Docket is a multi-agent console for Amazon sellers and agencies. It is run by [Company legal name], [Street address], [City, postal code, country], registration or VAT no. [Company registration or VAT no.].',
        'For your account details and product usage, [Company legal name] is the controller. For personal data inside your workspace, we are your processor under the {Data Processing Agreement|/dpa}.',
      ],
    },
    {
      h: 'What we collect',
      body: [
        {
          list: [
            'Amazon data you authorize, from the Amazon Ads API and the Selling Partner API. The exact data sets are listed below.',
            'Account details you give us, such as your name, work email, company and the roles you set for your team.',
            'Product usage, such as the proposals you approve or decline.',
          ],
        },
        'We do not request buyer personal information. That means no buyer names, addresses or contact details.',
      ],
    },
    {
      h: 'How we use it',
      body: [
        {
          list: [
            'To analyse your accounts and draft proposals with evidence.',
            'To apply a change to Amazon, only after a person who can approve on that brand has approved it.',
            'To check the outcome of changes that were applied.',
          ],
        },
        'We never sell your data and never use it to advertise to you. In Watch only, which is where every workspace starts, nothing is sent to Amazon.',
      ],
    },
    {
      h: 'The Amazon data we access',
      body: [
        'We connect through the Amazon Ads API and the Selling Partner API with your authorization, and request only what your verticals need. The first two rows come from the Amazon Ads API, the rest from the Selling Partner API.',
        {
          table: {
            head: ['Data set', 'Why we use it', 'Access'],
            rows: [
              [
                'Campaigns, ad groups, keywords, targets, bids and budgets',
                'Analyse performance and draft optimisations. After a person approves, apply that bid, budget or targeting change.',
                'Write on approval',
              ],
              [
                'Performance reports: impressions, clicks, spend, sales and placements',
                'Home, proposals and outcome checks.',
                'Read',
              ],
              [
                'Orders and sales totals',
                'Total sales, TACoS and profit, and demand forecasts. No buyer personal data.',
                'Read',
              ],
              [
                'FBA inventory and inbound shipments',
                'Stock runway, reorder proposals and inbound shipment plans.',
                'Read',
              ],
              [
                'Listings and catalog',
                'Listing health checks and content proposals. Edits only after approval.',
                'Write on approval',
              ],
              [
                'Business reports and Search Query Performance',
                'Traffic, conversion and search query analysis.',
                'Read',
              ],
              [
                'Pricing and Buy Box status',
                'Buy Box monitoring and price proposals. Price changes only after approval.',
                'Write on approval',
              ],
              [
                'Notifications',
                'Watchers that react when listings, offers or inventory change.',
                'Read',
              ],
            ],
          },
        },
        'Write access is used only to apply a change a person has approved. You can remove access at any time in Seller Central under Apps & Services, or in Amazon Ads.',
      ],
    },
    {
      h: 'Storage and security',
      body: [
        'Your data is encrypted in transit (TLS 1.2+) and at rest (AES-256). It is stored with [cloud provider] in [region].',
        {
          list: [
            'Role-based, least-privilege access',
            '2FA and audit logs',
            'Regular access reviews',
            'Secrets kept in a managed vault',
          ],
        },
      ],
    },
    {
      h: 'Sharing',
      body: [
        'We share data only with the sub-processors needed to run the service, under data-processing agreements. The current list is on the {Sub-processors|/subprocessors} page.',
        'We do not sell your data, and we do not share it with third parties for their own purposes.',
      ],
    },
    {
      h: 'Retention and deletion',
      body: [
        'Delete a workspace or your account and the related Amazon data is erased within [30] days. Backups expire within [35] days.',
        'Revoking access at Amazon ends Docket’s ability to read or change your account.',
      ],
    },
    {
      h: 'Your rights',
      body: [
        'Depending on where you live, you may have the right to access, correct, delete or move your personal data, and to object to how it is processed. This includes rights under GDPR and CCPA.',
        'To use any of them, write to privacy@[domain], or to [Company legal name], [Street address], [City, postal code, country].',
      ],
    },
    {
      h: 'Changes to this policy',
      body: [
        'We may update this policy. If a change is material, we will tell you by email before it takes effect. The date at the top shows the latest version.',
      ],
    },
  ],
}

const terms: LegalDoc = {
  slug: 'terms',
  title: 'Terms of Service',
  nav: 'Terms of Service',
  updated: '[date]',
  summary:
    'These terms govern your use of Docket. In short: agents propose, a person approves, and you stay in control of your Amazon accounts.',
  sections: [
    {
      h: 'The service',
      body: [
        'Docket is a multi-agent console for Amazon sellers and agencies. Agents read your ads, stock, prices and listings and draft changes as proposals with evidence.',
        'These terms are an agreement between you and [Company legal name]. Workspaces start in Watch only, where nothing is sent to Amazon.',
      ],
    },
    {
      h: 'Accounts and authority',
      body: [
        'Give us accurate account details and keep your sign-in secure. You confirm that you are allowed to connect every Amazon account you add. If you are an agency, that includes your clients’ accounts.',
        'Each workspace has roles, set brand by brand. A person can approve a change on a brand only if their role lets them approve there, and admins are responsible for choosing who can approve.',
      ],
    },
    {
      h: 'Amazon authorization',
      body: [
        'You authorize Docket on Amazon’s own consent pages, through the Amazon Ads API and the Selling Partner API. We receive a revocable token, never your password.',
        'You can revoke access at any time at Amazon. Docket then can no longer read or change that account. Your use of Amazon’s services stays subject to Amazon’s own terms.',
      ],
    },
    {
      h: 'Proposals and approvals',
      body: [
        {
          list: [
            'Every change is a proposal until a person who can approve on that brand approves it.',
            'Docket never applies a change without that approval, or without a standing approval that such a person has set up.',
            'You are responsible for the changes you approve.',
            'Where Amazon allows it, you can undo an applied change within 24 hours.',
          ],
        },
        'Proposals come with evidence, but we do not promise any particular result.',
      ],
    },
    {
      h: 'Acceptable use',
      body: [
        'You agree not to:',
        {
          list: [
            'break the law or Amazon’s policies through Docket;',
            'connect an account you are not authorized to manage;',
            'try to access another customer’s workspace or data;',
            'probe, disrupt or reverse engineer the service.',
          ],
        },
      ],
    },
    {
      h: 'Fees',
      body: [
        'Docket is billed per plan, at the prices on the {pricing page|/pricing}, monthly or yearly. Prices are in USD, excluding VAT and sales tax. Each plan sets how many brands and seats it includes; on the Agency plan, brands above its limit are [$59] each per month.',
        'Amazon advertising spend is billed by Amazon, not by [Company legal name].',
      ],
    },
    {
      h: 'Your data',
      body: [
        'You own your data, including the Amazon data you authorize. We use it only to provide the service, as described in the {Privacy Policy|/privacy}. Where it includes personal data, the {Data Processing Agreement|/dpa} applies.',
      ],
    },
    {
      h: 'Availability and changes to the service',
      body: [
        'We work to keep Docket available, but we do not promise uninterrupted service.',
        'Docket depends on the Amazon Ads API and the Selling Partner API. If Amazon changes or limits them, parts of the service may change. We will tell you in advance about changes that materially affect your workspace.',
      ],
    },
    {
      h: 'Termination',
      body: [
        'You can delete a workspace or your account at any time. The related Amazon data is then erased within [30] days, and backups expire within [35] days.',
        'We may suspend or end access if you break these terms or put an Amazon account at risk. Where we can, we will tell you why.',
      ],
    },
    {
      h: 'Liability and governing law',
      body: [
        'To the extent the law allows, [Company legal name] is not liable for indirect or consequential losses. Our total liability is limited to [liability cap].',
        'These terms are governed by the laws of [jurisdiction]. Disputes go to the courts of [jurisdiction].',
      ],
    },
    {
      h: 'Changes to these terms',
      body: [
        'We may update these terms. If a change is material, we will tell you by email before it takes effect.',
      ],
    },
  ],
}

const dpa: LegalDoc = {
  slug: 'dpa',
  title: 'Data Processing Agreement',
  nav: 'Data Processing Agreement',
  updated: '[date]',
  summary:
    'This agreement sets out how Docket processes personal data on your behalf. A signed copy is available on request.',
  sections: [
    {
      h: 'Roles',
      body: [
        'You are the controller of the personal data in your workspace. [Company legal name] is the processor and acts only on your documented instructions, which are the {Terms of Service|/terms} and your use of Docket.',
      ],
    },
    {
      h: 'Scope and purpose',
      body: [
        'We process personal data only to provide the service: analysis, proposals, approved changes and outcome checks for your workspace. We do not request buyer personal information.',
        {
          list: [
            'Data subjects: the people you invite to your workspace.',
            'Data types: name, work email, role, the brands they are assigned to, and product usage.',
            'Duration: while your workspace exists, then deleted as described below.',
          ],
        },
      ],
    },
    {
      h: 'Security measures',
      body: [
        {
          list: [
            'Encryption in transit (TLS 1.2+) and at rest (AES-256).',
            'Role-based, least-privilege access, 2FA and audit logs.',
            'Regular access reviews and secrets kept in a managed vault.',
            'Hosting with [cloud provider] in [region].',
          ],
        },
        'We tell you without undue delay if we become aware of a personal data breach affecting your workspace.',
      ],
    },
    {
      h: 'Sub-processors',
      body: [
        'You authorize the sub-processors listed on the {Sub-processors|/subprocessors} page, each under a data-processing agreement. We tell you by email before we add a new one. If you object, write to privacy@[domain].',
      ],
    },
    {
      h: 'International transfers',
      body: [
        'Where personal data crosses a border and the law requires a transfer mechanism, we rely on standard contractual clauses.',
      ],
    },
    {
      h: 'Deletion and return',
      body: [
        'On request, we return your personal data or delete it. If you delete a workspace or your account, the related data is erased within [30] days. Backups expire within [35] days.',
      ],
    },
  ],
  cta: { label: 'Request a signed copy', href: '/contact?topic=question' },
}

const subprocessors: LegalDoc = {
  slug: 'subprocessors',
  title: 'Sub-processors',
  nav: 'Sub-processors',
  updated: '[date]',
  summary:
    'Docket uses a small number of providers to run the service. This page lists each one, what it does and where it processes data.',
  sections: [
    {
      h: 'Current sub-processors',
      body: [
        'These providers process personal data on our behalf, each under a data-processing agreement.',
        {
          table: {
            head: ['Sub-processor', 'Purpose', 'Data processed', 'Location'],
            rows: [
              [
                '[Cloud provider]',
                'Hosting and storage',
                'Workspace data, including the Amazon data you authorize',
                '[Region]',
              ],
              [
                '[Email delivery provider]',
                'Sending account and notification emails',
                'Name and work email',
                '[Region]',
              ],
              [
                '[Error monitoring provider]',
                'Finding and fixing errors',
                'Technical logs and error reports',
                '[Region]',
              ],
              [
                '[Payments provider]',
                'Billing and payments',
                'Billing contact and payment details',
                '[Region]',
              ],
              [
                '[Product analytics provider]',
                'Understanding how the product is used',
                'Product usage data',
                '[Region]',
              ],
            ],
          },
        },
      ],
    },
    {
      h: 'Changes to this list',
      body: [
        'We update this list before we add any new sub-processor, and we tell you by email. The {Data Processing Agreement|/dpa} explains how to object.',
      ],
    },
    {
      h: 'Amazon is not a sub-processor',
      body: [
        'Amazon is the source of the data you authorize, not a sub-processor. You grant access on Amazon’s own consent pages, and you can revoke it at any time at Amazon.',
      ],
    },
  ],
}

export const LEGAL_DOCS: LegalDoc[] = [privacy, terms, dpa, subprocessors]

export function getLegalDoc(slug: LegalSlug): LegalDoc {
  const doc = LEGAL_DOCS.find((d) => d.slug === slug)
  if (!doc) throw new Error(`Unknown legal document: ${slug}`)
  return doc
}
