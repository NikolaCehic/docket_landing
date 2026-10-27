import type { CSSProperties } from 'react'
import { KH, Eyebrow } from './Kinetic'
import { SHOT_W, SHOT_H, chapter, type Feature as F, type Region } from '../data/system'

// One part of the system, shown on its real screens: the steps on the left, the screen on the right. A camera moves
// over the screen to the part each step describes (zooming in where the part is small) and a green border marks it.
// A step can build its screen in, the way the Command screen does: covers in the screen's own colour lift off its
// pieces in turn, a later beat moves the camera on, and a button can be pressed by a hold.
// On desktop the camera, the builds and the steps follow the scroll (the scene's frame stays on screen while you
// scroll through it; experience/stages.ts); on a phone they play in turn (experience/scenes.ts). Choosing a step
// shows it. One scene can show two parts (plays, then workflows): a step that starts a part carries its name as a
// heading over the steps.
const box = (r: Region): CSSProperties => ({ left: r.x, top: r.y, width: r.w, height: r.h })

export function Feature({ f }: { f: F }) {
  const W = f.w ?? SHOT_W, H = f.h ?? SHOT_H
  return (
    <section className={'scene day sc-feat sc-' + f.id + (f.steps.length > 4 ? ' many' : '')} id={f.id} data-scene={f.id} data-label={f.label} data-feature aria-labelledby={f.id + 'Title'}>
      <div className="sc-in" data-frame>
        <header className="sc-head split">
          <div>
            <Eyebrow num={chapter(f.id)} label={f.label} />
            <KH id={f.id + 'Title'} text={f.title} />
          </div>
          <div className="sc-side">
            <span className="core-mark" data-core-k="1.8" aria-hidden="true"></span>
            <p className="sub">{f.sub}</p>
          </div>
        </header>
        <div className="ft">
          <ol className="ft-steps" aria-label={f.label + ', step by step'}>
            {f.steps.map((s, i) => (
              <li key={s.k} className={s.group ? 'grp' : undefined}>
                {s.group ? <span className="ft-grp">{s.group}</span> : null}
                <button type="button" className="ft-go" data-i={i} aria-controls={f.id + 'Win'}>
                  <span className="n mono">{i + 1}</span><b>{s.k}</b><span className="d">{s.d}</span>
                </button>
              </li>
            ))}
          </ol>
          <div className="ft-frame">
            <div className="ft-win" id={f.id + 'Win'}>
              <div className="ft-cam" style={{ width: W, height: H }}>
                {f.shots.map((s, i) => (
                  <div className={'ft-shot' + (i === 0 ? ' on' : '')} key={s.src}>
                    <img src={s.src} alt={s.alt} width={W} height={H} loading="lazy" decoding="async" />
                    {f.steps.map((st, k) => st.shot !== i ? null : (
                      <span key={k} aria-hidden="true">
                        {st.build?.map((b, n) => <i key={n} className="ft-veil" data-s={k} data-how={b.how ?? 'fade'} style={{ ...box(b.r), background: b.bg }}></i>)}
                        {st.press ? <i className="ft-press" data-s={k} style={box(st.press.r)}></i> : null}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="fz ft-fz" aria-hidden="true"><b></b></div>
          </div>
        </div>
      </div>
    </section>
  )
}
