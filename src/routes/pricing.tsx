import { createFileRoute } from '@tanstack/react-router'
import { PRICING_FAQ } from '../data/pricing'
import { PageHero, PageShell } from '../components/page/PageShell'
import { Section } from '../components/page/ContentPage'
import { PricingCompare, PricingPlans } from '../components/Pricing'

export const Route = createFileRoute('/pricing')({
  head: () => ({
    meta: [
      { title: 'Pricing · Docket' },
      { name: 'description', content: 'Three plans, every agent on each. A flat price per month for the brands you run, never a share of your ad spend.' },
    ],
  }),
  component: Pricing,
})

function Pricing() {
  return (
    <PageShell current="/pricing">
      <PageHero k="Pricing" title="Every plan includes every agent." lede="Pay for the brands you run, never a share of your ad spend. Every plan starts with a first scan in Watch only, so you see what Docket would fix before you choose." />
      <div className="wrap pg-plans"><PricingPlans /></div>
      <div className="wrap pg-secs">
        <Section s={{ id: 'compare', k: 'Compare', title: 'Every feature, plan by plan.' }}><PricingCompare /></Section>
        <Section s={{ id: 'billing', k: 'Billing', title: 'Questions about plans.', lede: 'Something else? {Talk to a person|/contact?topic=question}.', blocks: [{ type: 'faq', items: PRICING_FAQ }] }} />
      </div>
    </PageShell>
  )
}
