// The scenes on desktop: each one a stage, held on screen while its own timeline follows the scroll (film.ts holds the
// frames and scrubs each timeline over its scene's hold). A timeline moves only what can run backwards exactly:
// transforms, opacity, the camera over a screen, fills, the loop's ring. Everything discrete (which step is on, a
// label, a class, the core's pulses) is read from the timeline's time in its onUpdate, through setters that act only
// on a change, so scrolling back undoes it and a fast scroll never skips or doubles a beat. The few beats that should
// never be scrubbed (a question being typed, the checks ticking, the approval) play in time once the scroll reaches
// them, and are put back when the scroll goes back above them.
import { gsap } from 'gsap'
import M from '../data/command.json'
import { CMD_ROWS, CMD_DETAIL, CMD_AFTER, CMD_WALK } from '../data/film'
import { ARC, FEATURES, FINDINGS, SHOT_H, SHOT_W, VOICE, type Region } from '../data/system'
import type { Companion } from './companion'
import { $, $$, clamp, on, type Ctx } from './util'

export type Stage = {
  /** the scene's timeline, paused: the film moves it with the scroll */
  tl: gsap.core.Timeline
  /** how much of it (s) plays while the scene docks; the rest follows the scroll over its hold */
  lead?: number
  /** a scene in steps: when each step is shown (s); choosing a step scrolls there */
  at?: number[]
}
export type Stages = ReturnType<typeof createStages>
type L = { x: number; y: number; w: number; h: number }
const LY = M.layers as Record<string, L>

/** a setter that acts only when its value changes (the first call always acts, with `was` undefined) */
function changes<T>(fn: (v: T, was: T | undefined) => void) {
  let cur: T | undefined, first = true
  return (v: T) => {
    if (!first && v === cur) return
    const was = cur
    cur = v; first = false
    fn(v, was)
  }
}
/** the last of a list of start times at or before t (-1 before the first) */
const stepAt = (starts: number[], t: number) => { let k = -1; for (let i = 0; i < starts.length; i++) if (t >= starts[i] - 1e-6) k = i; return k }
const cls = (el: Element, name: string, on: boolean) => { if (el.classList.contains(name) !== on) el.classList.toggle(name, on) }
/** a style written only when it changes */
const css = (el: HTMLElement, prop: 'opacity' | 'transform', v: string) => { if (el.style[prop] !== v) el.style[prop] = v }
const n3 = (v: number) => (Math.round(v * 1000) / 1000).toString()

export function createStages(ctx: Ctx, d: { core: Companion }) {
  const C = d.core
  const map: Record<string, Stage> = {}
  /** choosing a step: the film scrolls to where it is shown */
  let pick: ((id: string, k: number) => void) | null = null
  /** a paused timeline that tells `render` its time whenever the scroll moves it */
  function timeline(render: (t: number) => void) {
    const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } })
    tl.eventCallback('onUpdate', () => render(tl.time()))
    return tl
  }
  /** the core's charge, set from the scroll (a fill); let go smoothly when the scroll leaves it */
  let charging = false
  function chargeTo(v: number) {
    if (v > 0.001) { charging = true; C.S.charge = v; return }
    if (charging) { charging = false; C.charge(0, 0.4) }
  }

  // ---------------------------------------------------------------- how Docket works: the scroll runs the loop
  // Each step of the loop lights in turn while its arc of the ring around the core fills; the core answers each step,
  // and flares when the loop closes.
  {
    const cells = $$('#system .loop li'), arcs = $$<SVGPathElement>('#system .sy-ring .lit')
    const N = cells.length
    const tl = timeline((t) => lit(Math.min(N, Math.floor(t + 1e-6))))
    arcs.forEach((a, i) => tl.fromTo(a, { strokeDasharray: `0 ${ARC + 10}` }, { strokeDasharray: `${ARC} ${ARC + 10}`, duration: 1 }, i))
    tl.to({}, { duration: 0.5 }, N) // the loop held, closed, before the next scene comes in
    const lit = changes<number>((k, was) => {
      cells.forEach((c, i) => { cls(c, 'on', i === k); cls(c, 'past', i < k) })
      if (was === undefined) return
      if (k === N) C.flareAll(0.6); else C.ripple(0.5, 1.2)
    })
    lit(0)
    map.system = { tl, lead: 0.3 }
  }

  // ---------------------------------------------------------------- agents: four report in turn as you scroll
  // Each finding rises in, lights its area and the ghost of the screen it came from, and settles back as the next one
  // arrives; then the line that sends you on to Command.
  {
    const sec = $('#agents'), lis = $$('.nt-log li:not(.end)', sec), end = $('.nt-log li.end', sec)
    const ghosts = $$('.nt-ghosts img', sec), areas = $$('.areas li', sec)
    const N = lis.length
    const tl = timeline((t) => report(Math.min(N, Math.floor(t + 1e-6))))
    lis.forEach((li, i) => {
      tl.fromTo(li, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, i + 0.02)
      tl.fromTo(ghosts[i], { opacity: 0 }, { opacity: 0.2, duration: 0.45, ease: 'power1.inOut' }, i)
        .to(ghosts[i], { opacity: 0, duration: 0.45, ease: 'power1.inOut' }, i + 1)
      if (i < N - 1) tl.to(li, { opacity: 0.55, duration: 0.3 }, i + 1)
    })
    tl.fromTo(end, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, N + 0.05)
      .to({}, { duration: 0.6 }, N + 0.5)
    const report = changes<number>((k, was) => {
      const area = k < N ? FINDINGS[k].area : null
      areas.forEach((a) => cls(a, 'on', a.dataset.area === area))
      if (was === undefined) return
      if (k === N) C.flareAll(0.7); else C.ripple(0.55, 1.4)
    })
    report(0)
    map.agents = { tl, lead: 0.5 }
  }

  // ---------------------------------------------------------------- Pulse: the briefing, a question, then the phone
  // The same sequence as on a phone, read off the scroll: the greeting, the talk-through (its words light as you
  // scroll, the numbers dock beside the core), a question (typed in time once you reach it) and its checks, then the
  // phone with a spoken change and one hold for all brands.
  {
    const sec = $('#pulse'), btns = $$('.ft-go', sec), lis = btns.map((b) => b.parentElement!)
    const st = $('#pvSt'), greet = $('.pv-greet', sec), gbits = $$('.pv-greet > span', sec), btn = $('.pv-btn', sec)
    const say = $('.pv-say', sec), pre = $('.pv-pre', sec), words = $$('.pv-say .w', sec)
    const ask = $('.pv-ask', sec), you = $('.pv-you', sec), q = $('#pvQ'), ans = $$('.pv-ans .w', sec)
    const m1 = $('.pv-m1', sec), m2 = $('.pv-m2', sec), chk = $('.pv-chk', sec), checks = $$('.pv-chk li', sec)
    const prog = $('.pv-prog i', sec), imgs = $$('.pv-phone .scr img', sec), holdI = $('.pv-phone .ph-hold i', sec)
    const Q = q.textContent || ''
    const STATUS = ['Morning briefing. 3 things need you.', 'Morning briefing for your brand.', 'Listening. The briefing is paused.', 'Checking ad spend.']
    const T: number[] = []
    let total = 0
    VOICE.steps.forEach((s) => { T.push(total); total += s.dur })
    const tl = timeline(render)
    tl.to({}, { duration: total + 0.6 })
    const typed = (n: number) => { const v = Q.slice(0, n); if (q.textContent !== v) q.textContent = v }
    // the question: none, typing (in time), or all of it
    let typeTw: gsap.core.Tween | null = null
    const typing = changes<number>((v) => {
      typeTw?.kill(); typeTw = null
      if (v === 0) typed(0)
      else if (v === 2) typed(Q.length)
      else { const o = { n: 0 }; typeTw = gsap.to(o, { n: Q.length, duration: 1.2, ease: 'none', onUpdate: () => typed(Math.round(o.n)) }) }
    })
    const mark = changes<number>((k, was) => {
      lis.forEach((li, n) => { cls(li, 'on', n === k); cls(li, 'past', n < k) })
      btns.forEach((b, n) => b.setAttribute('aria-current', n === k ? 'step' : 'false'))
      if (was !== undefined) C.ping()
    })
    let lastSpeak = 0
    const spoken = changes<number>((n, was) => { if (was !== undefined && n > was && performance.now() - lastSpeak > 120) { lastSpeak = performance.now(); C.speakPulse() } })
    const screen = changes<number>((k, was) => { imgs.forEach((im, n) => cls(im, 'on', n === k)); if (was !== undefined && k > was) C.ping() })
    const checking = changes<boolean>((v, was) => { if (v && was === false) C.think(1.8) })
    const ticked = changes<number>((n, was) => { if (was !== undefined && n > was) C.ripple(0.3, 0.8) })
    const done = changes<boolean>((v, was) => { if (v && was === false) { C.ripple(1.2, 1.4); C.flareAll(0.6) } })
    const pressed = changes<boolean>((v, was) => { if (v && was === false) C.ping() })
    function render(t: number) {
      const k = Math.max(0, stepAt(T, t)), u = t - T[k]
      mark(k)
      cls(sec, 'rail', k === 0); cls(sec, 'playing', k === 1); cls(sec, 'phone-in', k >= 3)
      // 1 the briefing is ready: the greeting comes up line by line, then the button is pressed
      cls(greet, 'off', k >= 1)
      gbits.forEach((b, j) => {
        const v = k === 0 ? clamp((u - 0.05 - 0.22 * j) / 0.45, 0, 1) : 0
        css(b, 'opacity', n3(v)); css(b, 'transform', `translate3d(0, ${(8 * (1 - v)).toFixed(1)}px, 0)`)
      })
      const press = k === 0 && u >= 2.2
      cls(btn, 'press', press); pressed(press)
      // 2 it talks you through it: the words light as the scroll reads them, the numbers dock
      cls(say, 'off', k !== 1)
      css(pre, 'opacity', n3(k === 1 ? clamp((u - 0.4) / 0.5, 0, 1) : 0))
      const lit = k === 1 ? clamp(Math.floor((u - 1.0) / 0.3) + 1, 0, words.length) : 0
      words.forEach((w, n) => cls(w, 'on', n < lit)); spoken(lit)
      cls(m1, 'in', k === 1 && lit > 2); cls(m2, 'in', k === 1 && lit > 7)
      css(prog, 'transform', `scaleX(${n3(k === 1 ? 0.08 * clamp((u - 0.4) / 3.6, 0, 1) : k >= 2 ? 0.08 : 0)})`)
      // 3 ask it anything: you ask (typed in time), it checks before it answers
      cls(ask, 'off', k < 2)
      css(you, 'opacity', n3(k === 2 ? clamp((u - 0.15) / 0.4, 0, 1) : k > 2 ? 1 : 0))
      typing(k < 2 || (k === 2 && u < 0.35) ? 0 : k === 2 && u < 1.9 ? 1 : 2)
      const check = k > 2 || (k === 2 && u >= 1.9)
      cls(chk, 'in', check); checking(check)
      const ok = k > 2 ? checks.length : k === 2 ? checks.filter((_, n) => u >= 2.4 + n * 0.45).length : 0
      checks.forEach((c, n) => cls(c, 'ok', n < ok)); ticked(ok)
      const said = k > 2 ? ans.length : k === 2 ? ans.filter((_, n) => u >= 2.3 + n * 0.22).length : 0
      ans.forEach((w, n) => cls(w, 'on', n < said))
      const status = k === 0 ? 0 : k === 1 ? 1 : k === 2 && u < 1.9 ? 2 : 3
      if (st.textContent !== STATUS[status]) st.textContent = STATUS[status]
      // 4 change it by voice: the phone comes in front, the change is said, read and matched
      // 5 hold to approve: the hold fills with the scroll (the core winds up with it), then it is done
      screen(k < 3 ? 0 : k === 3 ? (u < 1.7 ? 0 : u < 3.3 ? 1 : 2) : u < 1.9 ? 3 : 4)
      const fill = k === 4 ? clamp((u - 0.5) / 1.1, 0, 1) : k > 4 ? 1 : 0
      css(holdI, 'transform', `scaleX(${n3(fill)})`)
      chargeTo(k === 4 && fill < 1 ? fill * 0.7 : 0)
      done(k === 4 && fill >= 1)
    }
    btns.forEach((b, n) => on(b, 'click', () => pick?.('pulse', n), ctx))
    render(0)
    map.pulse = { tl, lead: 1.4, at: VOICE.steps.map((s, k) => T[k] + s.dur * 0.82) }
  }

  // ---------------------------------------------------------------- Command: the screen builds, the border walks it, your call
  // The queue and the proposal build in as you scroll, the green border walks its parts with the camera, and at the
  // bar the scroll charges the hold (the core winds up with it). Your hold sends it; or, once the scroll has charged
  // it nearly full, the last of the hold and the receipt play in time. Scrolling back above takes the yes back.
  {
    const shot = $('#cmdShot')
    const ly = (n: string) => $(`[data-l="${n}"]`, shot)
    const rows = CMD_ROWS.map(ly), det = CMD_DETAIL.map(ly), after = CMD_AFTER.map(ly)
    const below = CMD_ROWS.slice(CMD_ROWS.indexOf('row2')).map(ly) // what slides up when the approved row leaves
    const focus = $('#cmdFocus'), lbl = $('#cmdFocusLbl'), hold = $('#cmdHold'), fill = $('.cmd-fill', hold)
    const win = $('#cmdWin'), panEl = $('#cmdPan')
    // the screen is shown large and pans inside its window with the border; the window's top padding and bottom fade
    // are set in CSS (.film .sc-prop .win)
    const WIN_TOP = 24, WIN_FADE = 64
    const panY = (n: string) => () => {
      const l = LY[n], H = shot.offsetHeight, view = win.clientHeight - WIN_TOP - WIN_FADE
      return -clamp(((l.y + l.h / 2) / 100) * H - view * 0.5, 0, Math.max(0, H - view))
    }
    const boxOf = (n: string) => ({
      x: () => (LY[n].x / 100) * shot.clientWidth, y: () => (LY[n].y / 100) * shot.clientHeight,
      width: () => (LY[n].w / 100) * shot.clientWidth, height: () => (LY[n].h / 100) * shot.clientHeight,
    })
    const WALK = CMD_WALK, W0 = 1.7, GAP = 1.2
    const B = W0 + (WALK.length - 1) * GAP // the bar
    const F0 = B + 0.6, F1 = F0 + 1.5 // the scroll charges the hold from F0 to F1 (to 90%)
    const END = F1 + 1.1
    const scrollFill = { f: 0 }, man = { f: 0 }
    const tl = timeline(render)
    gsap.set(focus, { '--dip': 1 })
    gsap.set([...rows, ...det], { opacity: 0, y: 10 })
    tl.to(rows, { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out' }, 0.05)
      .to(det, { opacity: 1, y: 0, duration: 0.55, stagger: 0.12, ease: 'power2.out' }, 0.4)
    WALK.forEach(([n], j) => {
      const at = W0 + j * GAP
      if (j === 0) tl.fromTo(focus, boxOf(n), { ...boxOf(n), duration: 0.01 }, at)
      else {
        tl.to(focus, { ...boxOf(n), duration: 0.7, ease: 'power2.inOut' }, at)
          .to(focus, { '--dip': 0.3, duration: 0.28, ease: 'power1.in' }, at)
          .to(focus, { '--dip': 1, duration: 0.32, ease: 'power1.out' }, at + 0.38)
      }
      tl.to(panEl, { y: panY(n), duration: 0.9, ease: 'power2.inOut' }, at - 0.1)
    })
    tl.to(scrollFill, { f: 0.9, duration: F1 - F0 }, F0).to({}, { duration: END - F1 }, F1)

    // the approval itself, in time: the hold completes, the receipt replaces the bar and the row leaves the queue
    let doneTl: gsap.core.Timeline | null = null, approved = false, manualDone = false, armed = false
    let manTw: gsap.core.Tween | null = null, part = WALK[0][0]
    /** the label names the part, on its box's top right corner (moved by transform only) */
    const label = changes<string>((text) => {
      lbl.textContent = text
      const n = text === 'Sent to Amazon' ? 'bar-after' : part
      gsap.to(lbl, { x: Math.max(0, (LY[n].w / 100) * shot.clientWidth - lbl.offsetWidth), duration: 0.45, ease: 'power3.out', overwrite: true })
    })
    function paintFill() {
      if (approved) return
      const f = Math.max(scrollFill.f, man.f)
      gsap.set(fill, { scaleX: f })
      chargeTo(f > 0 ? Math.min(1, f) : 0)
    }
    function approve() {
      manTw?.kill(); manTw = null
      cls(hold, 'holding', false); cls(hold, 'armed', false)
      const shift = (shot.clientHeight * LY.row1.h) / 100
      doneTl?.kill()
      doneTl = gsap.timeline()
        .to(fill, { scaleX: 1, duration: 0.22, ease: 'power1.out' }, 0)
        .add(() => { label('Sent to Amazon'); cls(focus, 'ok', true); C.burst(); C.charge(0, 0.6); charging = false }, 0.2)
        .to(focus, { ...boxOf('bar-after'), duration: 0.6, ease: 'power3.inOut' }, 0.2)
        .to([fill, ly('bar')], { opacity: 0, duration: 0.25 }, 0.25)
        .fromTo(ly('bar-after'), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 0.3)
        .to(ly('row1'), { opacity: 0, duration: 0.3 }, 0.55)
        .to(below, { y: -shift, duration: 0.6, ease: 'power3.inOut' }, 0.7)
        .to(['head-after', 'tabs-after', 'gh0-after', 'navcmd-after'].map(ly), { opacity: 1, duration: 0.35 }, 0.8)
        .to(ly('tail-after'), { opacity: 1, duration: 0.4 }, 1.15)
    }
    function unapprove() {
      doneTl?.kill(); doneTl = null
      gsap.set(after, { opacity: 0, y: 0 })
      gsap.set(below, { y: 0 })
      gsap.set([ly('row1'), fill, ly('bar')], { opacity: 1 })
      gsap.set(focus, boxOf('bar'))
      cls(focus, 'ok', false)
    }
    const yes = changes<boolean>((v, was) => {
      approved = v
      if (v) approve()
      else if (was) { unapprove(); label(WALK.find(([n]) => n === part)![1]); paintFill() }
    })
    const walk = changes<number>((w) => {
      cls(focus, 'on', w >= 0)
      armed = w === WALK.length - 1
      if (w < 0) return
      part = WALK[w][0]
      if (!armed && manualDone) manualDone = false // scrolled back above the bar: the yes is taken back
      if (!approved) label(WALK[w][1])
    })
    function render(t: number) {
      walk(t < W0 ? -1 : Math.min(WALK.length - 1, Math.floor((t - W0) / GAP + 1e-6)))
      yes(t >= F1 - 1e-6 || manualDone)
      cls(hold, 'armed', armed && !approved)
      paintFill()
    }
    // your hold: it fills in time from where the scroll left it; let go and it falls back
    function startHold() {
      if (!armed || approved || manTw) return
      cls(hold, 'holding', true)
      man.f = Math.max(man.f, scrollFill.f)
      manTw = gsap.to(man, { f: 1, duration: 1.1 * (1 - man.f), ease: 'none', onUpdate: paintFill, onComplete: () => { manTw = null; manualDone = true; man.f = 0; render(tl.time()) } })
    }
    function endHold() {
      if (!manTw) return
      manTw.kill(); manTw = null
      cls(hold, 'holding', false)
      gsap.to(man, { f: 0, duration: 0.3, ease: 'power2.out', onUpdate: paintFill })
    }
    on(hold, 'pointerdown', (e: PointerEvent) => { e.preventDefault(); startHold() }, ctx)
    ;['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => on(hold, ev, endHold, ctx))
    on(hold, 'keydown', (e: KeyboardEvent) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); startHold() } }, ctx)
    on(hold, 'keyup', (e: KeyboardEvent) => { if (e.key === ' ' || e.key === 'Enter') endHold() }, ctx)
    gsap.set(after, { opacity: 0 })
    render(0)
    map.proposal = { tl, lead: W0 - 0.05 }
  }

  // ---------------------------------------------------------------- the features: a camera over the real screens
  // Each step names a region of a screen. The camera scales the screen so the region fills the window (never past the
  // screen's own size, never leaving the window empty) and centres it; the green border marks it. A step on another
  // screen is a dissolve: the next screen comes up over the last one already framed, a touch closer, and settles. A
  // step can then build: covers in the screen's own colour lift off its pieces in turn, a beat moves the camera on, a
  // button is held. All of it follows the scroll; the step list and the border's label follow the step.
  for (const f of FEATURES) {
    const sec = $('#' + f.id), win = $('.ft-win', sec), shots = $$('.ft-shot', sec)
    const SW = f.w ?? SHOT_W, SH = f.h ?? SHOT_H
    const fz = $('.ft-fz', sec), lbl = $('b', fz), btns = $$('.ft-go', sec), lis = btns.map((b) => b.parentElement!)
    const veils = f.steps.map((_, k) => $$<HTMLElement>(`.ft-veil[data-s="${k}"]`, sec))
    const presses = f.steps.map((_, k) => sec.querySelector<HTMLElement>(`.ft-press[data-s="${k}"]`))
    const view = (r: Region) => {
      const W = win.clientWidth, H = win.clientHeight
      const fit = Math.max(W / SW, H / SH)
      const s = clamp(Math.min((W * 0.94) / r.w, (H * 0.92) / r.h), fit, 1)
      const x = clamp(W / 2 - (r.x + r.w / 2) * s, W - SW * s, 0)
      const y = clamp(H / 2 - (r.y + r.h / 2) * s, H - SH * s, 0)
      const bx = Math.max(2, r.x * s + x), by = Math.max(2, r.y * s + y)
      const bw = Math.min(W - 2, (r.x + r.w) * s + x) - bx, bh = Math.min(H - 2, (r.y + r.h) * s + y) - by
      return { s, x, y, bx, by, bw, bh, cx: (r.x + r.w / 2) * s + x, cy: (r.y + r.h / 2) * s + y }
    }
    /** the camera on a region, as tween values read again on every refresh (a new window size); k > 1 is closer */
    const cam = (r: Region, k = 1) => ({
      x: () => { const v = view(r); return v.cx - (v.cx - v.x) * k },
      y: () => { const v = view(r); return v.cy - (v.cy - v.y) * k },
      scale: () => view(r).s * k,
    })
    const border = (r: Region) => ({ x: () => view(r).bx, y: () => view(r).by, width: () => view(r).bw, height: () => view(r).bh })
    /** the border glides to a new part, dimming on the way, so a scroll stopped mid-move reads as on its way */
    const glide = (r: Region, at: number, dur: number) => tl
      .to(fz, { ...border(r), duration: dur, ease: 'power3.inOut' }, at)
      .to(fz, { '--dip': 0.25, duration: dur * 0.4, ease: 'power1.in' }, at)
      .to(fz, { '--dip': 1, duration: dur * 0.45, ease: 'power1.out' }, at + dur * 0.55)
    const T: number[] = []
    /** where the camera goes, in time order: each step's region, then its beats */
    const marks: { t: number; r: Region }[] = [], beatT: number[] = []
    const tl = timeline(render)
    gsap.set(fz, { '--dip': 1 })
    gsap.set(shots, { autoAlpha: 0, transformOrigin: '0 0' })
    gsap.set(shots[0], { autoAlpha: 1 })
    /** the screen on show: a dissolve, in time (stopped halfway by the scroll, two screens would read as a mess). The
     *  one coming in goes over the one going, and the one going is put away once it is covered */
    let fade: gsap.core.Tween | null = null
    const screen = changes<number>((k, was) => {
      fade?.progress(1)
      shots.forEach((el, n) => cls(el, 'on', n === k || n === was))
      if (was === undefined || ctx.rm) { shots.forEach((el, n) => gsap.set(el, { autoAlpha: n === k ? 1 : 0, zIndex: 0 })); return }
      const a = shots[was], b = shots[k]
      gsap.set(a, { zIndex: 1 }); gsap.set(b, { zIndex: 2 })
      fade = gsap.fromTo(b, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: 'power2.inOut', onComplete: () => { gsap.set(a, { autoAlpha: 0, zIndex: 0 }); cls(a, 'on', false); fade = null } })
    })
    if (veils.flat().length) gsap.set(veils.flat(), { opacity: 1, scaleX: 1, scaleY: 1 })
    let t = 0
    f.steps.forEach((st, i) => {
      T.push(t)
      const prev = i ? f.steps[i - 1].shot : 0, cut = st.shot !== prev
      const el = shots[st.shot]
      if (i === 0) {
        tl.fromTo(el, cam(st.r), { ...cam(st.r), duration: 0.01 }, 0)
          .fromTo(fz, border(st.r), { ...border(st.r), duration: 0.01 }, 0)
      } else if (cut) {
        // another screen: it is framed before it shows (the dissolve itself plays in time, see `screen`)
        tl.set(el, cam(st.r), t - 0.01)
        glide(st.r, t, 0.9)
      } else {
        tl.to(el, { ...cam(st.r), duration: 0.95, ease: 'power3.inOut' }, t)
        glide(st.r, t, 0.95)
      }
      marks.push({ t, r: st.r })
      const t0 = t + (cut ? 0.55 : 0.2)
      st.build?.forEach((b, n) => {
        const v = veils[i][n]
        if (b.how === 'wipe-x') tl.to(v, { scaleX: 0, duration: b.dur ?? 1.2, ease: 'power2.inOut' }, t0 + b.at)
        else if (b.how === 'wipe-y') tl.to(v, { scaleY: 0, duration: b.dur ?? 1.2, ease: 'power2.inOut' }, t0 + b.at)
        else tl.to(v, { opacity: 0, duration: b.dur ?? 0.45, ease: 'power2.out' }, t0 + b.at)
      })
      st.beats?.forEach((bt) => {
        tl.to(el, { ...cam(bt.r), duration: 0.95, ease: 'power3.inOut' }, t0 + bt.at)
        glide(bt.r, t0 + bt.at, 0.95)
        marks.push({ t: t0 + bt.at, r: bt.r }); beatT.push(t0 + bt.at)
      })
      const p = presses[i]
      if (p && st.press) tl.fromTo(p, { scaleX: 0, opacity: 1 }, { scaleX: 1, duration: 1 }, t0 + st.press.at).to(p, { opacity: 0, duration: 0.5, ease: 'power2.out' }, t0 + st.press.at + 1.5)
      t += st.dur ?? 3
    })
    const total = t + 0.4
    tl.to({}, { duration: 0.4 }, t)
    /** the label names where the border is going: it dips as the border sets off and comes back with the new name */
    const name = changes<string>((text, was) => {
      if (was === undefined) { lbl.textContent = text; return }
      gsap.timeline().to(lbl, { opacity: 0, duration: 0.16, ease: 'power1.in', overwrite: true })
        .add(() => { lbl.textContent = text }).to(lbl, { opacity: 1, duration: 0.3, ease: 'power2.out' })
    })
    const step = changes<number>((k, was) => {
      lis.forEach((li, n) => { cls(li, 'on', n === k); cls(li, 'past', n < k) })
      btns.forEach((b, n) => b.setAttribute('aria-current', n === k ? 'step' : 'false'))
      name(f.steps[k].k)
      screen(f.steps[k].shot)
      if (was !== undefined) C.ping()
    })
    const markT = marks.map((m) => m.t)
    const where = changes<number>((m) => cls(fz, 'low', view(marks[m].r).by < 34))
    const beat = changes<number>((n, was) => { if (was !== undefined && n > was) C.ripple(0.4, 1) })
    const burst = changes<boolean>((v, was) => { if (v && was === false) { C.burst(); charging = false; C.charge(0, 0.5) } })
    function render(time: number) {
      const k = Math.max(0, stepAt(T, time))
      step(k)
      where(Math.max(0, stepAt(markT, time)))
      beat(stepAt(beatT, time))
      // a held button winds the core up with it, and it bursts when the hold is done
      const p = presses[k], st = f.steps[k]
      const sx = p && st.press ? +gsap.getProperty(p, 'scaleX') : 0
      const at = st.press ? T[k] + (st.shot !== (k ? f.steps[k - 1].shot : 0) ? 0.55 : 0.2) + st.press.at : 0
      chargeTo(sx > 0 && sx < 1 && time < at + 1 ? sx : 0)
      burst(!!st.press && time >= at + 1)
    }
    cls(fz, 'on', true)
    btns.forEach((b, i) => on(b, 'click', () => pick?.(f.id, i), ctx))
    render(0)
    map[f.id] = { tl, lead: 0.6, at: f.steps.map((s, k) => T[k] + (s.dur ?? 3) * 0.82) }
  }

  // ---------------------------------------------------------------- the close: this morning's fixes, measured
  {
    const lis = $$('#start .ledger2 li')
    const tl = timeline(() => {})
    lis.forEach((li, i) => tl.fromTo(li, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.1 + i * 0.3))
    tl.to({}, { duration: 0.3 })
    map.start = { tl, lead: 0.4 }
  }

  return {
    get: (id: string): Stage | undefined => map[id],
    /** the film scrolls to a chosen step */
    setPick(fn: (id: string, k: number) => void) { pick = fn },
    /** holding the core in the last scene runs a sample scan */
    scan() { $('#scanCard').classList.add('found') },
  }
}
