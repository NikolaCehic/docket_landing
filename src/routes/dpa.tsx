import { createFileRoute } from '@tanstack/react-router'
import legalCss from '../styles/legal.css?url'
import { LegalPage } from '../components/LegalPage'

export const Route = createFileRoute('/dpa')({
  head: () => ({
    meta: [
      { title: 'Data Processing Agreement · Docket' },
      { name: 'description', content: 'How Docket processes personal data on your behalf: roles, scope, security, sub-processors, transfers, and deletion.' },
    ],
    links: [{ rel: 'stylesheet', href: legalCss }],
  }),
  component: () => <LegalPage slug="dpa" />,
})
