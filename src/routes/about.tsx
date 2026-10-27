import { createFileRoute } from '@tanstack/react-router'
import { PAGES } from '../data/pages'
import { ContentPage } from '../components/page/ContentPage'

const page = PAGES['about']

export const Route = createFileRoute('/about')({
  head: () => ({ meta: [{ title: page.metaTitle }, { name: 'description', content: page.metaDescription }] }),
  component: () => <ContentPage page={page} />,
})
