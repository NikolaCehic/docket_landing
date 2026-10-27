import { createFileRoute } from '@tanstack/react-router'
import legalCss from '../styles/legal.css?url'
import { LegalPage } from '../components/LegalPage'

export const Route = createFileRoute('/terms')({
  head: () => ({
    meta: [
      { title: 'Terms of Service · Docket' },
      { name: 'description', content: 'The terms that govern your use of Docket. Agents propose, a person approves, and you stay in control of your Amazon accounts.' },
    ],
    links: [{ rel: 'stylesheet', href: legalCss }],
  }),
  component: () => <LegalPage slug="terms" />,
})
