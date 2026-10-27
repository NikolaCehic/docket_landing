import { createFileRoute } from '@tanstack/react-router'
import legalCss from '../styles/legal.css?url'
import { LegalPage } from '../components/LegalPage'

export const Route = createFileRoute('/privacy')({
  head: () => ({
    meta: [
      { title: 'Privacy Policy · Docket' },
      { name: 'description', content: 'What Docket collects, how it is used, and how you can control it. Your Amazon data is used only to run your workspace and is never sold.' },
    ],
    links: [{ rel: 'stylesheet', href: legalCss }],
  }),
  component: () => <LegalPage slug="privacy" />,
})
