import { createFileRoute } from '@tanstack/react-router'
import { FAQ_GROUPS } from '../data/pages'
import { PageHero, PageShell } from '../components/page/PageShell'
import { Section } from '../components/page/ContentPage'

export const Route = createFileRoute('/faq')({
  head: () => ({
    meta: [
      { title: 'Questions · Docket' },
      { name: 'description', content: 'Straight answers about what Docket’s agents do, the Amazon data they use, plans, and running client brands.' },
    ],
  }),
  component: Faq,
})

function Faq() {
  return (
    <PageShell current="/faq" cta={{ title: 'Still deciding?', sub: 'Run a first scan in Watch only and see what Docket would fix in your account, or talk to a person.' }}>
      <PageHero k="Questions" title="Straight answers." lede="About what the agents do, the Amazon data they use, plans and billing, and running client brands. Can’t find yours? A person replies within one business day.">
        <nav className="pg-jump" aria-label="Topics">{FAQ_GROUPS.map((g) => <a key={g.id} href={'#' + g.id}>{g.title}</a>)}<a href="/contact?topic=question">Ask a person</a></nav>
      </PageHero>
      <div className="wrap pg-secs">
        {FAQ_GROUPS.map((g) => <Section key={g.id} s={{ id: g.id, k: 'Questions', title: g.title + '.', blocks: [{ type: 'faq', items: g.items }] }} />)}
      </div>
    </PageShell>
  )
}
