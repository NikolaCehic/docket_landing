import { KH, Eyebrow } from './Kinetic'
import { LOOP, chapter } from '../data/system'

// How Docket works. The core holds the middle of the night while the loop it runs lights up step by step: agents
// watch and draft, you approve, Docket applies and measures, Memory keeps what it learned, and plays and workflows
// automate what works. Each step leads to the scene that shows it (the page's table of contents). On desktop the loop
// runs as you scroll: each step lights in turn and its arc of the ring around the core fills (experience/stages.ts).
// the ring around the core on desktop: one arc per step of the loop, clockwise from the top, a small gap between them
// (each arc is ARC long; experience/stages.ts fills them)
function arc(i: number, n: number) {
  const pt = (deg: number) => { const a = (deg * Math.PI) / 180; return `${(50 + 48 * Math.sin(a)).toFixed(3)} ${(50 - 48 * Math.cos(a)).toFixed(3)}` }
  const a0 = (i * 360) / n + 3, a1 = ((i + 1) * 360) / n - 3
  return `M ${pt(a0)} A 48 48 0 0 1 ${pt(a1)}`
}
const Arrow = () => <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><path d="M3 8h9.5M8.5 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>

export function System() {
  return (
    <section className="scene night sc-sys" id="system" data-scene="system" data-label="How it works" data-enter="fade" aria-labelledby="sysTitle">
      <div className="sc-in" data-frame>
        <div className="core-slot sy-slot" data-core-k="1.2">
          <svg className="sy-ring" viewBox="0 0 100 100" aria-hidden="true">
            {LOOP.map((s, i) => <path key={s.k} className="tr" d={arc(i, LOOP.length)} />)}
            {LOOP.map((s, i) => <path key={s.k} className="lit" d={arc(i, LOOP.length)} />)}
          </svg>
        </div>
        <header className="sc-head">
          <Eyebrow num={chapter('system')} label="How Docket works" />
          <KH id="sysTitle" text={'Find it. Fix it.\nLearn from it.'} />
          <p className="sub">One loop across your whole Amazon account. Agents do the work, you approve each change, and Docket gets better at your brand every time.</p>
        </header>
        <ol className="loop" aria-label="The loop Docket runs">
          {LOOP.map((s, i) => (
            <li key={s.k}>
              <a href={s.to}>
                <span className="n mono">{String(i + 1).padStart(2, '0')}</span>
                <b>{s.k}</b>
                <span className="d">{s.d}</span>
                <span className="to">{s.part}<Arrow /></span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
