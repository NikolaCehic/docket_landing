import { KH, Eyebrow } from './Kinetic'
import { AREAS, FINDINGS, chapter } from '../data/system'

// Agents. Every part of the account has its own agents; four of them report in turn: each finding lights its area and
// a ghost of the screen it came from, and becomes a drafted fix. The fixes then wait in Command (the next scene).
// On desktop the reports follow the scroll, and the ghosts sit on their own layer (.nt-back), held behind the core.
export function Agents() {
  return (
    <section className="scene night sc-night" id="agents" data-scene="agents" data-label="Agents" data-enter="fade" aria-labelledby="agentsTitle">
      <div className="nt-back" aria-hidden="true">
        <div className="nt-ghosts">
          {FINDINGS.map((l) => <img key={l.img} src={`/film/night/${l.img}.webp`} alt="" width="1440" height="900" loading="lazy" decoding="async" />)}
        </div>
      </div>
      <div className="sc-in" data-frame>
        <div className="core-slot nt-slot" data-core-k="1.25"></div>
        <header className="sc-head">
          <Eyebrow num={chapter('agents')} label="Agents" />
          <KH id="agentsTitle" text={'An agent for\nevery job.'} />
          <p className="sub">Specialist agents cover every part of your account. When something is costing you money, the right one drafts the fix, with the evidence.</p>
        </header>
        <ul className="areas" aria-label="The areas the agents cover">
          {AREAS.map((a) => <li key={a} data-area={a}>{a}</li>)}
        </ul>
        <ol className="nt-log" aria-label="Agents reporting, each with a fix drafted">
          {FINDINGS.map((l) => (
            <li key={l.agent} data-area={l.area}><b>{l.agent}</b><span className="d">{l.d}</span><em>{l.fix}</em></li>
          ))}
          <li className="end"><a href="#proposal">Every fix waits in Command, with its evidence.<svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><path d="M3 8h9.5M8.5 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></a></li>
        </ol>
      </div>
    </section>
  )
}
