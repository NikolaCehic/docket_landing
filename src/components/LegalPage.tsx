import { Rich } from './Rich'
import { LEGAL_DOCS, LEGAL_STATUS, getLegalDoc } from '../data/legal'
import { Nav } from './Nav'
import { Sheets } from './Sheets'
import { SiteFooter } from './SiteFooter'
import type { LegalBlock, LegalSlug } from '../data/legal'

// Shared layout for the four legal pages, inside the site's bar and footer (the first scan and sign in open in place).
// Every navigation here is a plain <a href>, on purpose: each one is a full page load, so the home page boots cleanly
// and these pages never share router state with it.

function Block({ block }: { block: LegalBlock }) {
  if (typeof block === 'string') {
    return (
      <p>
        <Rich text={block} />
      </p>
    )
  }
  if ('list' in block) {
    return (
      <ul>
        {block.list.map((item) => (
          <li key={item}>
            <Rich text={item} />
          </li>
        ))}
      </ul>
    )
  }
  const { head, rows } = block.table
  return (
    <div className="lg-tablewrap">
      <table>
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join('|')}>
              {row.map((cell, i) => (
                <td key={head[i]} data-label={head[i]}>
                  <Rich text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function LegalPage({ slug }: { slug: LegalSlug }) {
  const doc = getLegalDoc(slug)

  return (
    <div className="lg-page pg">
      <Nav home={false} current={'/' + slug} />

      <div className="lg-body">
        <aside className="lg-rail">
          <nav aria-label="Legal documents">
            <ul>
              {LEGAL_DOCS.map((d) => (
                <li key={d.slug}>
                  <a href={`/${d.slug}`} aria-current={d.slug === slug ? 'page' : undefined}>
                    {d.nav}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <p className="lg-rail-help">
            Questions about these terms? <a href="/contact?topic=question">Talk to a person</a>
          </p>
        </aside>

        <main id="main" className="lg-article">
          <p className="lg-eyebrow">Legal</p>
          <h1>{doc.title}</h1>
          <p className="lg-meta">
            Last updated <Rich text={doc.updated} /> · {LEGAL_STATUS}
          </p>
          <p className="lg-lede">{doc.summary}</p>

          {doc.sections.map((s) => (
            <section key={s.h} className="lg-sec">
              <h2>{s.h}</h2>
              {s.body.map((b, i) => (
                <Block key={i} block={b} />
              ))}
            </section>
          ))}

          {doc.cta ? (
            <p className="lg-cta">
              <a className="lg-btn lg-btn-lg" href={doc.cta.href}>
                {doc.cta.label}
              </a>
            </p>
          ) : null}
        </main>
      </div>

      <div className="pg-foot"><div className="wrap"><SiteFooter /></div></div>
      <Sheets />
    </div>
  )
}
