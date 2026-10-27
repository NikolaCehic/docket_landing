import { createFileRoute } from '@tanstack/react-router'
import { PageShell } from '../components/page/PageShell'
import { Contact, isTopic, type Topic } from '../components/Credits'

// /contact?topic=demo|question|partnership opens the form on that topic.
export const Route = createFileRoute('/contact')({
  validateSearch: (s: Record<string, unknown>): { topic?: Topic } => (isTopic(s.topic) ? { topic: s.topic } : {}),
  head: () => ({
    meta: [
      { title: 'Contact · Docket' },
      { name: 'description', content: 'Book a demo, ask a question or propose a partnership. A person replies within one business day.' },
    ],
  }),
  component: ContactPage,
})

function ContactPage() {
  const { topic } = Route.useSearch()
  return (
    <PageShell current="/contact" cta={false}>
      <div className="wrap pg-secs pg-first">
        <Contact initialTopic={topic ?? 'demo'} level={1} />
      </div>
    </PageShell>
  )
}
