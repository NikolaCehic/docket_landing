import type { ReactNode } from 'react'
import type { Block, ContentPage as Page, PageSection } from '../../data/pageTypes'
import { Rich } from '../Rich'
import { PageHero, PageShell } from './PageShell'

// Renders a content page from src/data/pages.ts: the hero, then each section on the credits grid (title left, content
// right). A section that shows product screens takes the full width, title above.

const Arrow = () => <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><path d="M3 8h9.5M8.5 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>

function BlockView({ b, sid }: { b: Block; sid: string }) {
  switch (b.type) {
    case 'text':
      return <div className="pg-text">{b.paras.map((p, i) => <p key={i}><Rich text={p} /></p>)}</div>
    case 'features':
      return <ul className={'pg-feat c' + (b.cols ?? 2)}>{b.items.map((it) => <li key={it.t}><b>{it.t}</b><span><Rich text={it.d} /></span></li>)}</ul>
    case 'steps':
      return <ol className="pg-steps">{b.items.map((it, i) => <li key={it.t}><span className="n mono">{i + 1}</span><b>{it.t}</b><span><Rich text={it.d} /></span></li>)}</ol>
    case 'shot':
      return (
        <figure className={'pg-shot' + (b.device === 'phone' ? ' phone-shot' : '')}>
          <img src={b.src} alt={b.alt} width={b.w} height={b.h} loading="lazy" decoding="async" />
          {b.caption ? <figcaption><Rich text={b.caption} /></figcaption> : null}
        </figure>
      )
    case 'phones':
      return (
        <ol className="pg-phones">
          {b.items.map((p, i) => (
            <li key={p.src}>
              <div className="pg-phone"><img src={p.src} alt={p.alt} width="390" height="844" loading="lazy" decoding="async" /></div>
              <p><span className="mono">{i + 1}</span>{p.caption}</p>
            </li>
          ))}
        </ol>
      )
    case 'faq':
      return (
        <div className="faq3">
          {b.items.map(([q, a], i) => (
            <details key={q} name={'faq-' + sid} open={i === 0}>
              <summary>{q}<span className="pm" aria-hidden="true"></span></summary>
              <p><Rich text={a} /></p>
            </details>
          ))}
        </div>
      )
    case 'links':
      return (
        <ul className="pg-links">
          {b.items.map((l) => <li key={l.href}><a href={l.href}><b>{l.t}</b><span>{l.d}</span><Arrow /></a></li>)}
        </ul>
      )
  }
}

export function Section({ s, children }: { s: Pick<PageSection, 'id' | 'k' | 'title' | 'lede'> & { blocks?: Block[] }; children?: ReactNode }) {
  const wide = s.blocks?.some((b) => b.type === 'shot' || b.type === 'phones')
  return (
    <section className={'cr' + (wide ? ' wide' : '')} id={s.id} aria-labelledby={s.id + 'Title'}>
      <header className="cr-head">
        <p className="cr-k">{s.k}</p>
        <h2 id={s.id + 'Title'}>{s.title}</h2>
        {s.lede ? <p><Rich text={s.lede} /></p> : null}
      </header>
      <div className="cr-body">
        {s.blocks?.map((b, i) => <BlockView key={i} b={b} sid={s.id} />)}
        {children}
      </div>
    </section>
  )
}

/** a whole content page, or (with `before`) its hero and sections around other content */
export function ContentPage({ page, before }: { page: Page; before?: ReactNode }) {
  return (
    <PageShell current={page.path} cta={page.cta}>
      <PageHero k={page.k} title={page.title} lede={page.lede} />
      <div className="wrap pg-secs">
        {before}
        {page.sections.map((s) => <Section key={s.id} s={s} />)}
      </div>
    </PageShell>
  )
}
