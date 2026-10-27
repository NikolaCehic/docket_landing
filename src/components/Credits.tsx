import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { SITE, isReal } from '../data/site'
import { Check, Field, Honeypot, emailError, errProps, useSend } from './forms'
import { PricingSection } from './Pricing'
import { SiteFooter } from './SiteFooter'

// Below the last scene: the plans (full width, Pricing.tsx) and the footer (SiteFooter.tsx). The Amazon data Docket
// uses (/amazon-data), the questions (/faq) and the contact form (/contact) are pages of their own; their parts that
// those pages share live here.

type Row = { name: string; why: string; access: 'read' | 'write' | 'never' }
const DATA: { api: string; rows: Row[] }[] = [
  {
    api: 'Amazon Ads API',
    rows: [
      { name: 'Campaigns, ad groups, keywords and targets, with their bids and budgets', why: 'To see what is running and draft bid, budget and targeting changes. A change is written back only after a person approves it.', access: 'write' },
      { name: 'Performance reports: impressions, clicks, spend, sales and placements', why: 'To find spend that isn’t paying back, and to check every approved change again at 7 and 30 days.', access: 'read' },
    ],
  },
  {
    api: 'Selling Partner API',
    rows: [
      { name: 'Orders and sales totals', why: 'For total sales, TACoS, profit and demand forecasts. Totals only, never who bought.', access: 'read' },
      { name: 'FBA inventory and inbound shipments', why: 'To see how many days of stock are left, and to draft reorders and shipment plans.', access: 'read' },
      { name: 'Listings and catalog', why: 'To catch suppressed or incomplete listings and draft the fix. Edits only after approval.', access: 'write' },
      { name: 'Pricing and Buy Box status', why: 'To notice when the Buy Box is lost and draft a price change. Prices change only after approval.', access: 'write' },
      { name: 'Business reports and Search Query Performance', why: 'Traffic, conversion and the searches that find your products: the evidence behind each proposal.', access: 'read' },
      { name: 'Notifications', why: 'So agents react when a listing, an offer or stock changes, instead of waiting for the next sync.', access: 'read' },
    ],
  },
]
const NEVER: Row = { name: 'Buyer names, addresses, emails and phone numbers', why: 'The agents don’t need them, so Docket never asks Amazon for them.', access: 'never' }
const ACCESS = { read: 'Read', write: 'Write on approval', never: 'Never requested' }

const PROMISES = [
  ['Write only on approval', 'Write access is used only to apply a change a person approved.'],
  ['No buyer personal data', 'We don’t request names, addresses or contact details.'],
  ['Revocable at Amazon', 'Remove access any time in Seller Central or Amazon Ads.'],
  ['Deletable', 'Delete a workspace and its Amazon data is erased within [30] days.'],
]

export function Head({ id, k, title, children, level = 2 }: { id: string; k: string; title: string; children?: ReactNode; level?: 1 | 2 }) {
  const H = level === 1 ? 'h1' : 'h2'
  return (
    <header className="cr-head">
      <p className="cr-k">{k}</p>
      <H id={id}>{title}</H>
      {children}
    </header>
  )
}

function Access({ a }: { a: Row['access'] }) {
  return (
    <span className={'acc ' + a}>
      {a === 'write' ? <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
        : a === 'read' ? <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M1.5 8s2.4-4.5 6.5-4.5S14.5 8 14.5 8 12.1 12.5 8 12.5 1.5 8 1.5 8z" fill="none" stroke="currentColor" strokeWidth="1.4" /><circle cx="8" cy="8" r="1.8" fill="currentColor" /></svg>
          : <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.4" /><path d="M4.2 11.8l7.6-7.6" stroke="currentColor" strokeWidth="1.4" /></svg>}
      {ACCESS[a]}
    </span>
  )
}

/** the four promises, every data set with why and how it is accessed, and the note (/amazon-data) */
export function AmazonDataBody({ home = false }: { home?: boolean }) {
  return (
      <div className="cr-body">
        <ul className="promises">
          {PROMISES.map(([b, d]) => <li key={b}><span className="pi"><Check /></span><b>{b}</b><span>{d}</span></li>)}
        </ul>
        <table className="dtab">
          <caption className="sr">Each kind of Amazon data Docket requests, why, and how it is accessed</caption>
          <thead><tr><th scope="col">Data</th><th scope="col">Why the agents need it</th><th scope="col">Access</th></tr></thead>
          {DATA.map((g) => (
            <tbody key={g.api}>
              <tr className="grp"><th scope="colgroup" colSpan={3}>{g.api}<span>{g.rows.length} data sets</span></th></tr>
              {g.rows.map((r) => <tr key={r.name}><th scope="row">{r.name}</th><td>{r.why}</td><td><Access a={r.access} /></td></tr>)}
            </tbody>
          ))}
          <tbody>
            <tr className="grp"><th scope="colgroup" colSpan={3}>Never requested</th></tr>
            <tr className="never"><th scope="row">{NEVER.name}</th><td>{NEVER.why}</td><td><Access a="never" /></td></tr>
          </tbody>
        </table>
        {home
          ? <p className="cr-note">Revoke access any time at Amazon: in Seller Central under Apps &amp; Services, or in Amazon Ads. How authorization, revoking and deletion work is on the <a href="/amazon-data">Amazon data page</a>; the <a href="/privacy">Privacy Policy</a> has the full detail.</p>
          : <p className="cr-note">The <a href="/privacy">Privacy Policy</a> has the full detail, and the <a href="/subprocessors">sub-processors</a> who help run the service.</p>}
      </div>
  )
}

const TOPICS = [
  { v: 'demo', l: 'Book a demo', ph: 'Your brands, marketplaces, and what you want the agents to handle' },
  { v: 'question', l: 'Ask a question', ph: 'Your question' },
  { v: 'partnership', l: 'Partnership', ph: 'Your company, and what you have in mind' },
] as const
export type Topic = (typeof TOPICS)[number]['v']
export const isTopic = (v: unknown): v is Topic => TOPICS.some((t) => t.v === v)
const ROLES = ['Brand or seller', 'Agency', 'Vendor', 'Other']

export function Contact({ initialTopic = 'demo', level = 2 }: { initialTopic?: Topic; level?: 1 | 2 }) {
  const [topic, setTopic] = useState<Topic>(initialTopic)
  const [f, setF] = useState({ name: '', email: '', company: '', role: '', message: '', consent: false })
  const [hp, setHp] = useState('')
  const [errs, setErrs] = useState<Record<string, string>>({})
  const [tried, setTried] = useState(false)
  const s = useSend()

  // every "Book a demo" and "Talk to a person" on the page lands here with its topic chosen (and a fresh form, if a
  // message was already sent)
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest?.('[data-topic]') as HTMLElement | null
      if (!a) return
      setTopic(a.dataset.topic as Topic)
      s.reset()
      setF((v) => ({ ...v, message: '' }))
      setTried(false)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  const check = (v = f) => {
    const e: Record<string, string> = {}
    if (!v.name.trim()) e.name = 'Enter your name.'
    const em = emailError(v.email); if (em) e.email = em
    if (!v.company.trim()) e.company = 'Enter your brand or agency.'
    if (!v.role) e.role = 'Choose one.'
    if (!v.message.trim()) e.message = 'Tell us a little about what you need.'
    if (!v.consent) e.consent = 'Tick the box so we can reply.'
    return e
  }
  const set = (k: keyof typeof f, v: string | boolean) => {
    const n = { ...f, [k]: v }
    setF(n)
    if (tried) setErrs(check(n))
  }
  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setTried(true)
    const ce = check()
    setErrs(ce)
    const first = Object.keys(ce)[0]
    if (first) { document.getElementById('ct' + first[0].toUpperCase() + first.slice(1))?.focus(); return }
    await s.send({ kind: 'contact', topic, email: f.email.trim(), name: f.name, company: f.company, role: f.role, message: f.message, consent: f.consent, website: hp })
  }
  const ph = TOPICS.find((t) => t.v === topic)!.ph

  return (
    <section className="cr" id="contact" aria-labelledby="contactTitle">
      <Head id="contactTitle" k="Contact" title="Talk to a person." level={level}>
        <p>Questions about the product, pricing, data access or a partnership. We reply within one business day.</p>
        <dl className="reach">
          <div><dt>Email</dt><dd>{isReal(SITE.email) ? <a href={'mailto:' + SITE.email}>{SITE.email}</a> : SITE.email}</dd></div>
          <div><dt>Phone</dt><dd>{isReal(SITE.phone) ? <a href={'tel:' + SITE.phone.replace(/[^+\d]/g, '')}>{SITE.phone}</a> : SITE.phone}<span>{SITE.hours}</span></dd></div>
        </dl>
      </Head>
      <div className="cr-body">
        {s.status === 'sent' ? (
          <div className="ct-card ct-done" role="status">
            <span className="sh-ok"><Check /></span>
            <h3>Message sent.</h3>
            <p>Thanks, {f.name.trim().split(/\s+/)[0]}. A person replies within one business day, at <b>{f.email.trim()}</b>.</p>
            <button className="btn ghost" type="button" onClick={() => { s.reset(); setF({ ...f, message: '' }); setTried(false) }}>Send another</button>
          </div>
        ) : (
          <form className="ct-card" noValidate onSubmit={onSubmit} aria-labelledby="contactTitle">
            <fieldset className="seg ct-topic">
              <legend className="sr">What can we help with</legend>
              {TOPICS.map((t) => (
                <label key={t.v}><input type="radio" name="topic" value={t.v} checked={topic === t.v} onChange={() => setTopic(t.v)} />{t.l}</label>
              ))}
            </fieldset>
            <div className="ct-grid">
              <Field id="ctName" label="Full name" error={errs.name}>
                <input {...errProps('ctName', errs.name)} autoComplete="name" placeholder="First and last name" value={f.name} onChange={(e) => set('name', e.target.value)} />
              </Field>
              <Field id="ctEmail" label="Work email" error={errs.email}>
                <input {...errProps('ctEmail', errs.email)} type="email" inputMode="email" autoComplete="email" placeholder="you@yourbrand.com" value={f.email} onChange={(e) => set('email', e.target.value)} />
              </Field>
              <Field id="ctCompany" label="Company" error={errs.company}>
                <input {...errProps('ctCompany', errs.company)} autoComplete="organization" placeholder="Brand or agency name" value={f.company} onChange={(e) => set('company', e.target.value)} />
              </Field>
              <Field id="ctRole" label="I am a" error={errs.role}>
                <select {...errProps('ctRole', errs.role)} value={f.role} onChange={(e) => set('role', e.target.value)}>
                  <option value="" disabled>Choose one</option>
                  {ROLES.map((r) => <option key={r}>{r}</option>)}
                </select>
              </Field>
              <Field id="ctMessage" label="How can we help?" error={errs.message} wide>
                <textarea {...errProps('ctMessage', errs.message)} rows={4} placeholder={ph} value={f.message} onChange={(e) => set('message', e.target.value)} />
              </Field>
            </div>
            <div className="ct-consent">
              <label className="cb">
                <input type="checkbox" checked={f.consent} onChange={(e) => set('consent', e.target.checked)} {...errProps('ctConsent', errs.consent)} />
                <span>I agree that {SITE.company} may use these details to respond, as described in the <a href="/privacy">Privacy Policy</a>.</span>
              </label>
              <p className="err" id="ctConsentErr" aria-live="polite">{errs.consent || ''}</p>
            </div>
            <Honeypot value={hp} onChange={setHp} />
            {s.status === 'error' ? <p className="sh-fail" role="alert">{s.error}</p> : null}
            <div className="ct-foot">
              <span className="small">All fields are required.</span>
              <button className="btn primary" type="submit" disabled={s.status === 'sending'}>{s.status === 'sending' ? 'Sending…' : topic === 'demo' ? 'Request a demo' : 'Send message'}</button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}

export function Credits() {
  return (
    <div className="credits">
      <div className="wrap">
        <PricingSection />
        <SiteFooter home />
      </div>
    </div>
  )
}
