import { SITE } from '../data/site'
import { FOOTER_COLS } from '../data/nav'

// The footer on every page: the brand and its two actions, every page of the site, the address, Amazon's trademark
// notice (required wherever Amazon is named) and the legal line. "Book a demo" goes to the contact page.
export function SiteFooter({ home = false }: { home?: boolean }) {
  return (
    <footer className="foot">
      <div className="foot-top">
        <div className="foot-brand">
          <a className="brand" href={home ? '#top' : '/'} aria-label={home ? 'Docket, back to the start' : 'Docket, home'}><span className="mark" aria-hidden="true">D</span>Docket</a>
          <p>Agents that run your Amazon business, and ask before they act.</p>
          <div className="ctas">
            <a className="btn sm primary" href="#first-scan" data-sheet="scan">Get your first scan</a>
            <a className="btn sm ghost" href="/contact?topic=demo">Book a demo</a>
          </div>
        </div>
        <nav className="foot-cols" aria-label="Footer">
          {FOOTER_COLS.map((c) => (
            <div key={c.title}><h3>{c.title}</h3><ul>
              {c.links.map((l) => <li key={l.label}><a href={l.href} data-sheet={l.sheet}>{l.label}</a></li>)}
            </ul></div>
          ))}
        </nav>
      </div>
      <p className="addr">{[SITE.company, ...SITE.address].join(' · ')}</p>
      <p className="tm">Amazon, Amazon Ads, Seller Central, Vendor Central and all related logos and marks are trademarks of Amazon.com, Inc. or its affiliates. Docket is an independent product of {SITE.company} and uses the Amazon Ads API and the Amazon Selling Partner API with each customer’s authorization. Mention of Amazon does not imply endorsement by Amazon.</p>
      <div className="legal">
        <span>© 2026 {SITE.company}. All rights reserved.</span>
        <a href="/terms">Terms of Service</a>
        <a href="/privacy">Privacy Policy</a>
        <span className="legal-r">Docket is a working name.</span>
      </div>
    </footer>
  )
}
