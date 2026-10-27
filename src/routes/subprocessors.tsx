import { createFileRoute } from '@tanstack/react-router'
import legalCss from '../styles/legal.css?url'
import { LegalPage } from '../components/LegalPage'

export const Route = createFileRoute('/subprocessors')({
  head: () => ({
    meta: [
      { title: 'Sub-processors · Docket' },
      { name: 'description', content: 'The providers Docket uses to run the service, what each one does, and where it processes data.' },
    ],
    links: [{ rel: 'stylesheet', href: legalCss }],
  }),
  component: () => <LegalPage slug="subprocessors" />,
})
