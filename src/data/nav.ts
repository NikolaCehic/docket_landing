// Where every link on the site goes. The home page's bar cuts to its own scenes; every other page's bar goes to the
// same scenes on the home page (and the pricing page); the footer lists every page.

export type NavLink = { href: string; label: string }

/** the home page's bar: the film's scenes (the parts of the system), then the pricing below the last one */
export const HOME_LINKS: NavLink[] = [
  { href: '#system', label: 'How it works' },
  { href: '#agents', label: 'Agents' },
  { href: '#pulse', label: 'Pulse' },
  { href: '#memory', label: 'Memory' },
  { href: '#plays', label: 'Plays and workflows' },
  { href: '#pricing', label: 'Pricing' },
]

/** every other page's bar: the same places on the home page (a link from another page lands on its scene), and the
 *  pricing page */
export const PAGE_LINKS: NavLink[] = HOME_LINKS.map((l) => (l.href === '#pricing' ? { href: '/pricing', label: l.label } : { href: '/' + l.href, label: l.label }))

/** the footer: every page on the site (Sign in opens its sheet) */
export const FOOTER_COLS: { title: string; links: (NavLink & { sheet?: 'signin' | 'scan' })[] }[] = [
  {
    title: 'Product',
    links: [
      { href: '/how-it-works', label: 'How it works' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/agencies', label: 'Teams and agencies' },
      { href: '/mobile', label: 'Phone and voice' },
    ],
  },
  {
    title: 'Trust',
    links: [
      { href: '/amazon-data', label: 'Amazon data use' },
      { href: '/security', label: 'Security' },
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/subprocessors', label: 'Sub-processors' },
      { href: '/dpa', label: 'Data Processing Agreement' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About' },
      { href: '/contact', label: 'Contact' },
      { href: '/faq', label: 'Questions' },
      { href: '#sign-in', label: 'Sign in', sheet: 'signin' },
    ],
  },
]
