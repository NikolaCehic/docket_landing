import { createFileRoute } from '@tanstack/react-router'
import { PAGES } from '../data/pages'
import { ContentPage, Section } from '../components/page/ContentPage'
import { AmazonDataBody } from '../components/Credits'

const page = PAGES['amazon-data']

export const Route = createFileRoute('/amazon-data')({
  head: () => ({ meta: [{ title: page.metaTitle }, { name: 'description', content: page.metaDescription }] }),
  component: () => (
    <ContentPage page={page} before={
      <Section s={{ id: 'data-sets', k: 'The data', title: 'Every data set, why, and how.', lede: 'Docket connects through the Amazon Ads API and the Selling Partner API. It asks only for what the agents need to watch, propose and check their work.' }}>
        <AmazonDataBody />
      </Section>
    } />
  ),
})
