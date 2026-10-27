// The shape of the site's content pages (How it works, Teams and agencies, Phone and voice, Security, About) and of the
// questions page. components/ContentPage.tsx renders them; src/data/pages.ts holds the words.
//
// Inline markup, in any string: {label|/path} becomes a link, and [placeholder] is an open value (shown highlighted
// until it is filled in, like the legal pages).

export type Item = { t: string; d: string }

export type Block =
  /** one to three short paragraphs */
  | { type: 'text'; paras: string[] }
  /** a grid of short items: a title and one or two sentences each */
  | { type: 'features'; items: Item[]; cols?: 2 | 3 }
  /** numbered steps, in order */
  | { type: 'steps'; items: Item[] }
  /** a real product screen from /public (desktop screens are 1440x900, phone screens 390x844) */
  | { type: 'shot'; src: string; alt: string; w: number; h: number; caption?: string; device?: 'phone' }
  /** a row of phone screens side by side (each 390x844) */
  | { type: 'phones'; items: { src: string; alt: string; caption: string }[] }
  /** questions and answers, one open at a time */
  | { type: 'faq'; items: [string, string][] }
  /** cards that lead to other pages */
  | { type: 'links'; items: { t: string; d: string; href: string }[] }

export type PageSection = { id: string; k: string; title: string; lede?: string; blocks: Block[] }

export type ContentPage = {
  path: string
  metaTitle: string
  metaDescription: string
  /** the short label above the title */
  k: string
  title: string
  lede: string
  sections: PageSection[]
  /** the closing call to action (defaults to the first scan) */
  cta?: { title: string; sub: string }
}

export type FaqGroup = { id: string; title: string; items: [string, string][] }
