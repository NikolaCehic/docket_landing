import { KH, Eyebrow } from './Kinetic'
import { PHONE_STEPS } from '../data/film'
import { VOICE, chapter } from '../data/system'

// Pulse: Docket's voice. The Radiant Core leaves the page's corner and takes its place in the Pulse screen, rebuilt
// here so it can play: the briefing is ready, Pulse talks it through (the words light as it says them, the numbers
// dock beside the core), you ask a question and it checks first. Then the phone comes in front: a spoken change,
// matched across brands, held to approve, live on Amazon. The steps on the left follow; choosing one plays it. On
// desktop the paper slides up over the night as a sheet, and the whole sequence follows the scroll while the scene's
// frame stays on screen (experience/stages.ts); on a phone it plays in turn (experience/scenes.ts). The live core sits in .pv-core; data-core="glow" keeps it lit on the paper scene.

const RAIL = [
  { area: 'Supply chain', id: 'PR-0019', exp: 'Expires 12:00 PM', soon: true, t: 'Ship 1,290 units to AWD, 3 products', d: 'About $9.8k of sales protected' },
  { area: 'Advertising', id: 'PR-0011', exp: 'Expires 10/14', t: 'Cut bids on the pizza cutter rocker', d: 'TACoS 69% to about 45%' },
  { area: 'Advertising', id: 'PR-0014', exp: 'Expires 10/15', t: 'Product-page bid from +16% to 0%', d: 'About $190 less spend in 30 days' },
]
const LINE = 'Ad spend eased 3%, so TACoS came in at 21.8%.'.split(' ')
const ANSWER = 'Checking spend, bids and placements'.split(' ')
const CHECKS = ['Sunday’s spend by campaign', 'Bid changes since Friday, 2 found', 'Top of search share']
const Mic = () => <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true"><path d="M8 2.2a2 2 0 0 1 2 2v3.6a2 2 0 0 1-4 0V4.2a2 2 0 0 1 2-2zM4.4 7.6a3.6 3.6 0 0 0 7.2 0M8 11.2v2.4" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>

export function Pulse() {
  return (
    <section className="scene day sc-pulse" id="pulse" data-scene="pulse" data-label={VOICE.label} data-core="glow" data-enter="sheet" aria-labelledby="pulseTitle">
      <div className="sc-in pv-grid" data-frame>
        <div className="pv-l">
          <header className="sc-head">
            <Eyebrow num={chapter('pulse')} label={VOICE.label} />
            <KH id="pulseTitle" text={VOICE.title} />
            <p className="sub">{VOICE.sub}</p>
          </header>
          <ol className="ft-steps pv-steps" aria-label="Pulse, step by step">
            {VOICE.steps.map((s, i) => (
              <li key={s.k}>
                <button type="button" className="ft-go" data-i={i} aria-controls="pvDevices">
                  <span className="n mono">{i + 1}</span><b>{s.k}</b><span className="d">{s.d}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <div className="pv" id="pvDevices">
          {/* the desk: Pulse in the Docket web app */}
          <div className="pv-desk" role="img" aria-label="Pulse in the Docket web app: the Radiant Core briefs you, the numbers it mentions dock beside it, and you can ask it a question">
            <div className="pv-in" aria-hidden="true">
              <div className="pv-bar">
                <b>Pulse</b>
                <span className="pv-st"><i></i><span id="pvSt">Morning briefing. 3 things need you.</span></span>
                <span className="pv-tabs"><span className="on">Briefing</span><span>Transcript</span></span>
                <span className="pv-x">Close <kbd>Esc</kbd></span>
              </div>
              <div className="pv-main">
                <div className="pv-stage">
                  <div className="core-slot pv-core" data-core-k="1.32"></div>
                  <div className="pv-dock">
                    <div className="pv-card pv-m1">
                      <span className="pv-k">Ad spend · Sunday</span>
                      <span className="pv-v">$214<em className="g">−3.0%</em></span>
                      <span className="pv-n">The Sunday before was $221. Bids unchanged since Friday.</span>
                      <svg className="pv-spark" viewBox="0 0 120 18" preserveAspectRatio="none"><path d="M0 9 L15 8 L30 10.5 L45 7.5 L60 9.5 L75 8.6 L90 11 L105 11.6 L120 13" fill="none" stroke="currentColor" strokeWidth="1.4" /><path d="M0 11 H120" stroke="currentColor" strokeOpacity=".35" strokeDasharray="2 2" /></svg>
                    </div>
                    <div className="pv-card pv-m2">
                      <span className="pv-k">TACoS · Sunday</span>
                      <span className="pv-v">21.8%<em className="g">−1.4 pts</em></span>
                      <span className="pv-n">On $1,612 of sales. Target 24%.</span>
                    </div>
                    <div className="pv-card pv-chk">
                      <span className="pv-k">Checking</span>
                      <span className="pv-h">Spend, bids, placements</span>
                      <ul>{CHECKS.map((c) => <li key={c}><i></i>{c}</li>)}</ul>
                    </div>
                  </div>
                </div>
                <div className="pv-cap">
                  <div className="pv-greet">
                    <span className="pv-hi">Good morning, Agent.</span>
                    <span className="pv-ready">Your briefing is ready: 1 min 51 s. 3 things need you.</span>
                    <span className="pv-go"><span className="pv-btn"><svg viewBox="0 0 10 10" width=".7em" height=".7em"><path d="M2 1.2v7.6L8.6 5z" fill="currentColor" /></svg>Start briefing<kbd>1:51</kbd></span><span className="pv-hey"><Mic />or say “Hey Pulse”</span></span>
                  </div>
                  <div className="pv-say">
                    <span className="pv-pre">Yesterday you sold $1,612, up 5% on the Sunday before.</span>
                    <span className="pv-line">{LINE.map((w, i) => <span className="w" key={i}>{w} </span>)}</span>
                  </div>
                  <div className="pv-ask">
                    <span className="pv-you"><Mic />You</span>
                    <span className="pv-q"><span id="pvQ">Why did ad spend ease yesterday?</span><i className="pv-caret"></i></span>
                    <span className="pv-line pv-ans">{ANSWER.map((w, i) => <span className="w" key={i}>{w} </span>)}</span>
                  </div>
                </div>
                <div className="pv-ctl">
                  <span className="pv-play"><svg className="p" viewBox="0 0 10 10"><path d="M2.5 1.2v7.6L8.6 5z" fill="currentColor" /></svg><svg className="z" viewBox="0 0 10 10"><path d="M2.4 1.5h1.8v7H2.4zM5.8 1.5h1.8v7H5.8z" fill="currentColor" /></svg></span>
                  <span className="pv-t">Again</span><span className="pv-t">Skip</span><span className="pv-sep"></span>
                  <b>Headline</b><span className="pv-prog"><i></i></span><span className="pv-time mono">0:08 / 1:51</span>
                  <span className="pv-mic"><Mic /></span><span className="pv-ask-b">✦ Ask</span>
                </div>
              </div>
              <div className="pv-rail">
                <b className="pv-rh">Waiting on you</b>
                {RAIL.map((r) => (
                  <div className="pv-ri" key={r.id}>
                    <span className="pv-rk"><i></i>{r.area}<span className="mono">{r.id}</span><em className={r.soon ? 'soon' : ''}>{r.exp}</em></span>
                    <span className="pv-rt">{r.t}</span>
                    <span className="pv-rd">{r.d}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* the phone: the same Pulse, a spoken change taken to Amazon */}
          <div className="pv-phone">
            <div className="phone">
              <span className="notch" aria-hidden="true"></span>
              <div className="scr">
                {PHONE_STEPS.map((s, i) => (
                  <img key={s.img} src={`/film/phone/${s.img}.webp`} alt={i === 0 ? 'Pulse on the phone: a spoken change, from saying it to Amazon confirming it' : ''} aria-hidden={i === 0 ? undefined : true} width="390" height="844" loading="lazy" decoding="async" />
                ))}
                <span className="ph-hold" aria-hidden="true"><i></i></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
