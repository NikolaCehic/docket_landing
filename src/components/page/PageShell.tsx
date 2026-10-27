import type { ReactNode } from 'react'
import { Nav } from '../Nav'
import { Sheets } from '../Sheets'
import { SiteFooter } from '../SiteFooter'

// Every page but the home page: the bar (with the menu), the page, a closing call to action, the footer, and the two
// sheets, so "Get your first scan" and "Sign in" open in place on any page. Plain documents: no film, no start-up.

export function PageShell({ current, children, cta }: { current?: string; children: ReactNode; cta?: { title: string; sub: string } | false }) {
  return (
    <div className="pg">
      <Nav home={false} current={current} />
      <main id="main" className="pg-main">
        {children}
        {cta === false ? null : <CtaBand title={cta?.title} sub={cta?.sub} />}
      </main>
      <div className="pg-foot"><div className="wrap"><SiteFooter /></div></div>
      <Sheets />
    </div>
  )
}

export function PageHero({ k, title, lede, children }: { k: string; title: string; lede: string; children?: ReactNode }) {
  return (
    <header className="pg-hero wrap">
      <p className="cr-k">{k}</p>
      <h1>{title}</h1>
      <p className="pg-lede">{lede}</p>
      {children}
    </header>
  )
}

export function CtaBand({ title = 'See what Docket would fix in your account.', sub = 'Two Amazon authorizations, findings in about six minutes. Starts in Watch only; nothing changes without your yes.' }: { title?: string; sub?: string }) {
  return (
    <section className="pg-cta wrap" aria-labelledby="pgCtaTitle">
      <h2 id="pgCtaTitle">{title}</h2>
      <p>{sub}</p>
      <div className="ctas">
        <a className="btn primary" href="#first-scan" data-sheet="scan">Get your first scan</a>
        <a className="btn ghost" href="/contact?topic=demo">Book a demo</a>
      </div>
    </section>
  )
}
