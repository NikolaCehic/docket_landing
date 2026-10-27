import { Credits } from './Credits'
import { KH, Eyebrow } from './Kinetic'
import { chapter } from '../data/system'

// The close. The fixes from the start are live and being measured, the agents keep watch, and the core waits at the
// centre: hold it to run a sample scan. On desktop the last paper scene lifts off it (the night was underneath) while
// its frame (.fin) is held in .fin-hold. Below the fold: pricing and the footer (Credits.tsx). Amazon data use, the
// questions and the contact form have their own pages.
const LEDGER = [
  { id: 'PR-0019', t: 'Ship 1,290 units to AWD, 3 products', s: 'Live since 09:12', ok: true },
  { id: 'PR-0011', t: 'Cut bids on the pizza cutter rocker', s: 'Live since 09:14', ok: true },
  { id: 'PR-0014', t: 'Product-page bid from +16% to 0%', s: 'Waiting for your yes. Expires 10/15.', ok: false },
]

export function Final() {
  return (
    <section className="scene night final sc-start" id="start" data-scene="start" data-label="Get started" data-enter="lift" aria-labelledby="startTitle">
      <div className="fin-hold">
        <div className="fin" data-frame>
          <header className="fin-head">
            <Eyebrow num={chapter('start')} label="Results, measured" />
            <KH id="startTitle" text="Approved. Applied. Measured." />
            <p className="sub">Two of the fixes from the start are live, and each is checked at 7 and 30 days. The agents keep watching.</p>
          </header>
          <ol className="ledger2" aria-label="This morning’s fixes, by the evening">
            {LEDGER.map((l) => (
              <li key={l.id} className={l.ok ? 'ok' : ''}><span className="mono">{l.id}</span><b>{l.t}</b><span className="st"><i></i>{l.s}</span></li>
            ))}
          </ol>
          <div className="final-stage core-slot" id="finalSlot" data-core-k="1.18"></div>
          <p className="core-cap" id="finalHint">Hold the core to run a sample scan</p>
          <div className="fin-cta">
            <h3>See what Docket would fix in your account.</h3>
            <div className="ctas">
              <a className="btn primary" href="#first-scan" data-sheet="scan">Get your first scan</a>
              <a className="btn ghost" href="/contact?topic=demo">Book a demo</a>
            </div>
            <p className="small">Two Amazon authorizations, findings in about six minutes. Starts in Watch only; nothing changes without your yes.</p>
          </div>
          <div className="card scan" id="scanCard" aria-live="polite">
            <span className="k">Sample scan</span>
            <p><b>$4,330 a month at risk and a stockout in 22 days.</b> 6 fixes drafted for a sample stationery brand, ready to approve.</p>
          </div>
          <a className="more" href="#pricing">Pricing<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6" /></svg></a>
        </div>
      </div>

      <Credits />
    </section>
  )
}
