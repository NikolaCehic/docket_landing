import type { CSSProperties } from 'react'
import M from '../data/command.json'
import { KH, Eyebrow } from './Kinetic'
import { CMD_ROWS, CMD_DETAIL, CMD_AFTER } from '../data/film'
import { chapter } from '../data/system'

// Command. The real Command screen builds itself from its own pieces (captured from the product design): the queue
// arrives, the proposal opens section by section, a green border walks through what it says, and then it waits for a
// yes. Hold to approve it, or it is approved for you after a moment; the receipt replaces the button and the row
// leaves the queue. On desktop the screen is shown large and pans inside its window (.win) while the title stays put,
// and the walk follows the scroll: the screen builds, the border walks its parts, and the bar charges as you scroll
// on; your hold (or the end of the walk) sends it. See experience/stages.ts (desktop) and scenes.ts (phones).
type L = { x: number; y: number; w: number; h: number }
const LY = M.layers as Record<string, L>
const pos = (l: L): CSSProperties => ({ left: l.x + '%', top: l.y + '%', width: l.w + '%', height: l.h + '%' })

export function Proposal() {
  return (
    <section className="scene day sc-prop" id="proposal" data-scene="proposal" data-label="Command" aria-labelledby="propTitle">
      <div className="sc-in" data-frame>
        <header className="sc-head one">
          <Eyebrow num={chapter('proposal')} label="Command" />
          <KH id="propTitle" text="Every fix, explained. Approve in one hold." />
          <div className="sc-side below">
            <span className="core-mark" data-core-k="1.8" aria-hidden="true"></span>
            <p className="sub">The exact change, the result to expect, why now and the checks it passed. Approve it and Docket sends it to Amazon, then measures the result.</p>
          </div>
        </header>
        <div className="fit"><div className="win" id="cmdWin"><div className="pan" id="cmdPan"><figure className="shot cmd" id="cmdShot">
          <img className="base" src="/film/command/base.webp" alt="Docket Command: the proposals waiting across your brands, with one to cut bids on keywords that are bleeding spend open" width="1440" height="900" decoding="async" />
          {[...CMD_ROWS, ...CMD_DETAIL].map((n) => <img key={n} className="ly" data-l={n} src={`/film/command/${n}.webp`} alt="" aria-hidden="true" style={pos(LY[n])} decoding="async" />)}
          {CMD_AFTER.map((n) => <img key={n} className="ly af" data-l={n} src={`/film/command/${n}.webp`} alt="" aria-hidden="true" style={pos(LY[n])} decoding="async" />)}
          <div className="fz" id="cmdFocus" aria-hidden="true"><b id="cmdFocusLbl">The change</b></div>
          <button className="cmd-hold" id="cmdHold" type="button" style={{ left: '43.611%', top: '94.444%', width: '13.611%', height: '3.556%' }}>
            <span className="cmd-fill" aria-hidden="true"></span><span className="sr">Hold to approve 6 bid changes</span>
          </button>
        </figure></div></div></div>
        <MobileProposal />
      </div>
    </section>
  )
}

// Phones: a desktop screen at phone width is too small to read, so the same proposal is set as a card at reading
// size. The same green border walks its sections, then it waits for a hold (experience/scenes.ts).
const KW = [
  ['insulated water bottle 32oz', '$2.40', '$1.80', '−25.0%'],
  ['stainless steel water bottle', '$1.95', '$1.50', '−23.1%'],
  ['hiking water bottle', '$1.60', '$1.25', '−21.9%'],
]
function MobileProposal() {
  return (
    <article className="app mprop" id="pmCard" aria-label="Proposal: cut bids on 6 keywords">
      <div className="pm-top"><span className="vsq"></span>Advertising<span className="muted">PPC Optimizer</span><span className="tag pm-exp">Expires in 5h 02m</span></div>
      <h3>Cut bids on 6 keywords that are bleeding spend</h3>
      <section className="pm-s" data-k="change">
        <p className="pm-k">The change <span className="muted">6 keywords, each cut at most 25%</span></p>
        <table className="pm-kw">
          <caption className="sr">Three of the six keywords, with the bid now and the proposed bid</caption>
          <tbody>
            {KW.map(([k, a, b, d]) => <tr key={k}><th scope="row">{k}</th><td className="num muted">{a}</td><td className="num"><b>{b}</b></td><td className="num muted">{d}</td></tr>)}
          </tbody>
        </table>
        <p className="muted pm-more">and 3 more</p>
      </section>
      <section className="pm-s" data-k="expect">
        <p className="pm-k">What we expect</p>
        <p>ACoS falls from <b className="num">38.2%</b> to about <b className="num">29%</b>. Ad spend <b className="num">−$412/wk</b>, ad sales about <span className="num">−$80/wk</span>.</p>
        <p className="muted"><b>78% confident.</b> PPC Optimizer was right 41 of the last 50 times.</p>
      </section>
      <section className="pm-s" data-k="why">
        <p className="pm-k">Why now</p>
        <p>These keywords took 31% of the cluster’s spend but brought 9% of its sales over 14 days, after a competitor started bidding on Sep 27.</p>
      </section>
      <section className="pm-s" data-k="checks">
        <p className="pm-k">Checks</p>
        <p className="pm-ok"><svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>4 checks passed. Follows your rule: cut each keyword by at most 25%.</p>
      </section>
      <div className="pm-bar">
        <button className="pm-hold" id="pmHold" type="button"><span className="pm-fill" aria-hidden="true"></span><span className="pm-lbl">Hold to approve 6 bid changes</span></button>
        <p className="muted pm-lim">Docket checks it again before it sends. Undo for 24 hours.</p>
        <p className="pm-done" role="status"><span className="sdot"></span><span><b>Sent to Amazon, 6 of 6 bids confirmed.</b> Undo for 24 hours. Outcome check Oct 14.</span></p>
      </div>
    </article>
  )
}

