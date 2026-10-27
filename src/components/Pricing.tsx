import { useState } from 'react'
import { ALL_PLANS, COMPARE, PLANS, YEARLY_SAVING, money, type Cell } from '../data/pricing'
import { Check } from './forms'

// The plans (data/pricing.ts): on the home page as a section of its own below the last scene, and on /pricing with the
// full comparison. Monthly or yearly billing switches every price at once.

export function PricingPlans() {
  const [yearly, setYearly] = useState(false)
  return (
    <div className="plans-wrap">
      <fieldset className="seg pr-bill">
        <legend className="sr">Billing</legend>
        <label><input type="radio" name="billing" value="monthly" checked={!yearly} onChange={() => setYearly(false)} />Monthly</label>
        <label><input type="radio" name="billing" value="yearly" checked={yearly} onChange={() => setYearly(true)} />Yearly<span className="pr-save">Save {YEARLY_SAVING}</span></label>
      </fieldset>
      <div className="plans">
        {PLANS.map((p) => {
          const sheet = p.cta.sheet
          return (
            <article className={'plan' + (p.featured ? ' featured' : '')} key={p.id} aria-labelledby={'plan-' + p.id}>
              <div className="plan-top">
                <h3 id={'plan-' + p.id}>{p.name}</h3>
                {p.featured ? <span className="plan-chip">Recommended for teams</span> : null}
              </div>
              <p className="plan-for">{p.for}</p>
              <p className="plan-price" aria-live="polite">
                <b className="num" key={yearly ? 'y' : 'm'}>{money(yearly ? p.yearly : p.monthly)}</b>
                <span>{p.unit}<br />{yearly ? 'billed yearly' : 'billed monthly'}</span>
              </p>
              <p className="plan-note">{p.note}</p>
              <a className={'btn ' + (p.featured ? 'primary' : 'ghost')} href={sheet ? '#first-scan' : p.cta.href}
                data-sheet={sheet}>{p.cta.label}</a>
              {p.lead ? <p className="plan-lead">{p.lead}</p> : null}
              <ul className="plan-inc">
                {p.includes.map((i) => <li key={i}><Check />{i}</li>)}
              </ul>
            </article>
          )
        })}
      </div>
      <ul className="plan-all" aria-label="On every plan">
        {ALL_PLANS.map((a) => <li key={a}><Check />{a}</li>)}
      </ul>
    </div>
  )
}

/** the home page's pricing section (the credits grid's first section, full width) */
export function PricingSection() {
  return (
    <section className="cr pr" id="pricing" aria-labelledby="pricingTitle">
      <header className="pr-head">
        <div>
          <p className="cr-k">Pricing</p>
          <h2 id="pricingTitle">Every plan includes every agent.</h2>
        </div>
        <p>Pay for the brands you run, never a share of your ad spend. Every plan starts with a first scan in Watch only.</p>
      </header>
      <PricingPlans />
      <p className="pr-more">Every feature, plan by plan, is on the <a href="/pricing">pricing page</a>. Running more than 20 brands? <a href="/contact?topic=demo">Talk to us</a>.</p>
    </section>
  )
}

function Mark({ v }: { v: Cell }) {
  if (v === true) return <span className="cmp-y"><Check /><span className="sr">Included</span></span>
  if (v === false) return <span className="cmp-n"><span className="sr">Not included</span></span>
  return <>{v}</>
}

/** /pricing: every feature, plan by plan */
export function PricingCompare() {
  return (
    <div className="cmp-wrap">
      <table className="cmp">
        <caption className="sr">Every feature by plan</caption>
        <thead>
          <tr><th scope="col"><span className="sr">Feature</span></th>{PLANS.map((p) => <th scope="col" key={p.id}>{p.name}</th>)}</tr>
        </thead>
        {COMPARE.map((g) => (
          <tbody key={g.group}>
            <tr className="cmp-g"><th scope="colgroup" colSpan={4}>{g.group}</th></tr>
            {g.rows.map((r) => (
              <tr key={r.t}><th scope="row">{r.t}</th>{r.v.map((v, i) => <td key={i}><Mark v={v} /></td>)}</tr>
            ))}
          </tbody>
        ))}
      </table>
    </div>
  )
}
