import type { CSSProperties } from 'react'
// The hero: the promise in two giant lines split around the live core, the morning's proposals on its orbit.
// Layers, back to front: engraved backdrop canvas → giant type and orbit rings (.hb-type) → core canvas → content.
// On desktop the type and the content (.hb-frame) are each held on screen while the next scene rises over them; on the
// scrolling page the frame is only a wrapper (display: contents). Holding to approve a proposal fills the outlined
// "Your call." (see experience/hero.ts).
const CARDS = [
  { i: 0, area: 'Supply chain', id: 'PR-0019', exp: 'Expires 12:00 PM', title: 'Ship 1,290 units to AWD, 3 products', sub: 'About $9.8k of sales protected', agent: 'Inventory Planner', conf: '82% confident', hit: '88% hit rate', done: 'Approved. Sent to Seller Central. Undo for 24 hours.', strong: true },
  { i: 1, area: 'Advertising', id: 'PR-0011', exp: 'Expires 10/14', title: 'Cut bids on the pizza cutter rocker', sub: 'TACoS 69% to about 45%', agent: 'PPC Optimizer', conf: '64% confident', hit: '81% hit rate', done: 'Approved. Sent to Amazon Ads. Undo for 24 hours.' },
  { i: 2, area: 'Advertising', id: 'PR-0014', exp: 'Expires 10/15', title: 'Product-page bid from +16% to 0%', sub: 'About $190 less spend in 30 days', agent: 'PPC Optimizer', conf: '66% confident', hit: '81% hit rate', done: 'Approved. Sent to Amazon Ads. Undo for 24 hours.' },
]

// the first line rises letter by letter out of its own mask when the start-up hands over (experience/hero.ts)
function splitLetters(t: string) {
  let c = 0
  return t.split(' ').flatMap((w, i) => [
    i ? ' ' : null,
    <span className="hb-w" key={i}>{[...w].map((ch) => <span className="hb-c" key={c} style={{ '--c': c++ } as CSSProperties}>{ch}</span>)}</span>,
  ])
}

export function Hero() {
  return (
    <section className="scene night hero" id="top" data-scene="hero" data-label="Docket" aria-labelledby="heroTitle">
      <div className="hb-type" id="hbType">
        <div className="hb-rw" id="hbRw"><svg className="hb-rings" id="hbRings" aria-hidden="true" preserveAspectRatio="none">
          <g className="rg"><ellipse className="r1" /><ellipse className="r2" /></g>
        </svg></div>
        <h1 id="heroTitle" className="hb-h1">
          <span className="hb-l1" id="hbL1"><span className="sr">Your agents.</span><span className="hb-in" aria-hidden="true">{splitLetters('Your agents.')}</span></span>
          <span className="hb-l2" id="hbL2">
            <span className="sr">Your call.</span>
            <svg aria-hidden="true" focusable="false">
              <defs>
                <clipPath id="hbFillClip"><rect x="0" y="0" width="0" height="400" /></clipPath>
                <clipPath id="hbGlyphs"><text x="0" y="0">Your call.</text></clipPath>
                <linearGradient id="hbEdge" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#34D399" stopOpacity="0" /><stop offset=".72" stopColor="#6EE7B7" stopOpacity=".9" /><stop offset="1" stopColor="#ECFDF5" stopOpacity="1" /></linearGradient>
                <filter id="hbGlow" x="-20%" y="-40%" width="140%" height="180%"><feGaussianBlur in="SourceGraphic" stdDeviation="7" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              </defs>
              <text className="o" x="0" y="0">Your call.</text>
              <text className="f" x="0" y="0" clipPath="url(#hbFillClip)">Your call.</text>
              <rect className="edge" x="0" y="0" width="46" height="0" fill="url(#hbEdge)" clipPath="url(#hbGlyphs)" />
            </svg>
          </span>
        </h1>
      </div>

      <div className="hb-frame" data-frame>
        <div className="hb-stage" aria-hidden="true"></div>
        <div className="core-slot" id="heroSlot" data-core-k="1.3"></div>

        {/* the line and the buttons: placed apart on wide screens (display: contents), one block at the foot of a phone's first screen */}
        <div className="hb-foot" id="hbFoot">
          <div className="hb-copy">
            <p className="lede">AI agents watch your Amazon ads, stock, prices and listings around the clock, find what’s costing you money, and fix it the moment you approve.</p>
            <p className="hb-sync"><i></i>Seller Central synced 38m ago<span>·</span>Amazon Ads synced 41m ago</p>
          </div>
          <div className="hb-cta">
            <a className="btn primary" href="#first-scan" data-sheet="scan">Get your first scan</a>
            <a className="btn ghost" href="/contact?topic=demo">Book a demo</a>
          </div>
        </div>

        <div className="pcards" id="pcards" aria-label="Fixes drafted overnight, ready to approve">
          <h2 className="hb-wait">Ready to approve</h2>
          {CARDS.map((c) => (
            <article className={'pcard dim' + (c.strong ? ' lead' : '')} data-i={c.i} key={c.id}>
              <button className="pc-hit" type="button" aria-expanded="false" aria-label={'Open ' + c.id}></button>
              <div className="pc-top"><span className={'vsq' + (c.strong ? ' s' : '')}></span>{c.area} <span className="mono">{c.id}</span><span className="tag">{c.exp}</span></div>
              <h3>{c.title}</h3>
              <p>{c.sub}</p>
              <div className="pc-more"><div className="pc-inner">
                <div className="pc-meta"><span>{c.agent}</span><span>{c.conf}</span><span>{c.hit}</span></div>
                <button className="hold" type="button"><span className="hold-fill"></span><span className="hold-lbl">Hold to approve</span></button>
              </div></div>
              <p className="pc-done"><span className="sdot"></span>{c.done}</p>
            </article>
          ))}
          <p className="hb-chip"><i></i>Drafted overnight by your agents</p>
        </div>
      </div>
    </section>
  )
}
