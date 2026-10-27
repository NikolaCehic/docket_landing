// What plays inside each scene on the scrolling page (phones, tablets, touch; film.ts plays a scene as it comes into
// view and resets it once it has gone). On desktop the scenes follow the scroll instead (stages.ts). Motion is
// transforms and opacity, plus one small focus border.
// - A scene in steps (Pulse, Command, Memory, plays and workflows): the steps play in turn by themselves, each step's
//   own move or build in time. Choosing a step shows it.
// - The others (how it works, the agents, the close) play a short sequence; stopped early, they show where it ends.
import { gsap } from 'gsap'
import M from '../data/command.json'
import { CMD_ROWS, CMD_DETAIL, CMD_AFTER, CMD_WALK } from '../data/film'
import { FEATURES, FINDINGS, SHOT_H, SHOT_W, VOICE, type Region } from '../data/system'
import type { Companion } from './companion'
import { $, $$, clamp, on, type Ctx } from './util'

type Ctl = { play: () => void; stop: () => void; reset: () => void }
export type Scenes = ReturnType<typeof createScenes>
type L = { x: number; y: number; w: number; h: number }
const LY = M.layers as Record<string, L>

export function createScenes(ctx: Ctx, d: { core: Companion }) {
  const C = d.core
  const ctl: Record<string, Ctl> = {}
  const kill = (...t: (gsap.core.Animation | null | undefined)[]) => t.forEach((x) => x?.kill())

  // ---------------------------------------------------------------- how Docket works: the loop, step by step
  {
    const cells = $$('#system .loop li')
    const done = () => cells.forEach((x) => { x.classList.remove('on'); x.classList.add('past') })
    let tl: gsap.core.Timeline | null = null
    ctl.system = {
      play() {
        tl = gsap.timeline()
        cells.forEach((c, i) => tl!.add(() => {
          cells.forEach((x, k) => { x.classList.toggle('on', k === i); x.classList.toggle('past', k < i) })
          C.ripple(0.5, 1.2)
        }, 1 + i * 1.15))
        tl.add(() => { done(); C.flareAll(0.6) }, 1 + cells.length * 1.15)
      },
      stop() { if (tl) { kill(tl); tl = null; done() } },
      reset() { cells.forEach((c) => c.classList.remove('on', 'past')) },
    }
  }

  // ---------------------------------------------------------------- agents: four of them report in turn
  {
    const lis = $$('#agents .nt-log li'), ghosts = $$('#agents .nt-ghosts img'), areas = $$('#agents .areas li')
    const lightArea = (name: string | null) => areas.forEach((a) => a.classList.toggle('on', a.dataset.area === name))
    const done = () => { lis.forEach((li) => li.classList.add('on')); ghosts.forEach((g) => g.classList.remove('on')); lightArea(null) }
    let tl: gsap.core.Timeline | null = null
    ctl.agents = {
      play() {
        tl = gsap.timeline()
        // the list fills quickly, so it is never seen empty
        const t0 = 0.3, gap = 0.45
        FINDINGS.forEach((l, i) => tl!.add(() => {
          lis[i].classList.add('on')
          ghosts.forEach((g, k) => g.classList.toggle('on', k === i))
          lightArea(l.area)
          C.ripple(0.55, 1.4)
        }, t0 + i * gap))
        tl.add(() => { done(); C.flareAll(0.7) }, t0 + FINDINGS.length * gap)
      },
      stop() { if (tl) { kill(tl); tl = null; done() } },
      reset() { lis.forEach((li) => li.classList.remove('on')); ghosts.forEach((g) => g.classList.remove('on')); lightArea(null) },
    }
  }

  // ---------------------------------------------------------------- Command: the real Command screen, then your yes
  {
    const shot = $('#cmdShot')
    const ly = (n: string) => $(`[data-l="${n}"]`, shot)
    const rows = CMD_ROWS.map(ly), det = CMD_DETAIL.map(ly), after = CMD_AFTER.map(ly)
    const below = CMD_ROWS.slice(CMD_ROWS.indexOf('row2')).map(ly) // what slides up when the approved row leaves
    const focus = $('#cmdFocus'), lbl = $('#cmdFocusLbl'), hold = $('#cmdHold'), fill = $('.cmd-fill', hold)
    let tl: gsap.core.Timeline | null = null, holdTw: gsap.core.Tween | null = null, doneTl: gsap.core.Timeline | null = null
    let armed = false, approved = false
    const focusOn = (n: string, text: string, instant = false) => {
      const l = LY[n]
      lbl.textContent = text
      focus.classList.add('on')
      // moved by transform (no layout shift); sized in px from the screen's current size
      const W = shot.clientWidth, H = shot.clientHeight
      // the label sits on the box's top-right corner, also moved by transform only
      gsap.to(lbl, { x: Math.max(0, (l.w / 100) * W - lbl.offsetWidth), duration: instant ? 0 : 0.6, ease: 'power3.inOut', overwrite: true })
      gsap.to(focus, { x: (l.x / 100) * W, y: (l.y / 100) * H, width: (l.w / 100) * W, height: (l.h / 100) * H, duration: instant ? 0 : 0.6, ease: 'power3.inOut', overwrite: true })
    }
    function approve() {
      if (approved) return
      approved = true; armed = false
      hold.classList.remove('armed', 'holding')
      const shift = (shot.clientHeight * LY.row1.h) / 100
      doneTl = gsap.timeline()
        .add(() => { focusOn('bar-after', 'Sent to Amazon'); focus.classList.add('ok'); C.burst(); C.charge(0, 0.6) }, 0)
        .to([fill, ly('bar')], { opacity: 0, duration: 0.25 }, 0.05)
        .fromTo(ly('bar-after'), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 0.1)
        .to(ly('row1'), { opacity: 0, duration: 0.3 }, 0.35)
        .to(below, { y: -shift, duration: 0.6, ease: 'power3.inOut' }, 0.5)
        .to(['head-after', 'tabs-after', 'gh0-after', 'navcmd-after'].map(ly), { opacity: 1, duration: 0.35 }, 0.6)
        .to(ly('tail-after'), { opacity: 1, duration: 0.4 }, 0.95)
    }
    function startHold(auto: boolean) {
      if (!armed || approved || holdTw) return
      hold.classList.add('holding')
      C.charge(1, 1.1)
      holdTw = gsap.to(fill, { scaleX: 1, duration: auto ? 1.3 : 1.1, ease: auto ? 'power1.inOut' : 'none', onComplete: () => { holdTw = null; approve() } })
    }
    function endHold() {
      if (!holdTw) return
      holdTw.kill(); holdTw = null
      hold.classList.remove('holding')
      gsap.to(fill, { scaleX: 0, duration: 0.3, ease: 'power2.out' })
      C.charge(0, 0.4)
    }
    on(hold, 'pointerdown', (e: PointerEvent) => { e.preventDefault(); startHold(false) }, ctx)
    ;['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => on(hold, ev, endHold, ctx))
    on(hold, 'keydown', (e: KeyboardEvent) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); startHold(false) } }, ctx)
    on(hold, 'keyup', (e: KeyboardEvent) => { if (e.key === ' ' || e.key === 'Enter') endHold() }, ctx)

    // phones: the same proposal as a card at reading size (Proposal.tsx). The green border walks its sections; it can
    // be held at any point, and approves itself a moment after the walk, like the screen.
    const pm = $('#pmCard'), pmSecs = $$('.pm-s', pm), pmHold = $('#pmHold'), pmFill = $('.pm-fill', pmHold)
    let pmTl: gsap.core.Timeline | null = null, pmTw: gsap.core.Tween | null = null, pmDone = false
    const onPhone = () => pm.offsetParent !== null
    const pmFocus = (k: number) => pmSecs.forEach((x, i) => x.classList.toggle('on', i === k))
    function pmApprove() {
      pmDone = true
      kill(pmTl); pmTl = null
      pmFocus(-1)
      pmHold.classList.remove('holding')
      pm.classList.remove('armed'); pm.classList.add('ok')
    }
    function pmStart(auto: boolean) {
      if (pmDone || pmTw) return
      pmHold.classList.add('holding')
      pmTw = gsap.to(pmFill, { scaleX: 1, duration: auto ? 1.3 : 1.1, ease: auto ? 'power1.inOut' : 'none', onComplete: () => { pmTw = null; pmApprove() } })
    }
    function pmEnd() {
      if (!pmTw) return
      pmTw.kill(); pmTw = null
      pmHold.classList.remove('holding')
      gsap.to(pmFill, { scaleX: 0, duration: 0.3, ease: 'power2.out' })
    }
    on(pmHold, 'pointerdown', (e: PointerEvent) => { e.preventDefault(); pmStart(false) }, ctx)
    ;['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => on(pmHold, ev, pmEnd, ctx))
    on(pmHold, 'contextmenu', (e: Event) => e.preventDefault(), ctx) // a long press is a hold, not a menu
    on(pmHold, 'keydown', (e: KeyboardEvent) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); pmStart(false) } }, ctx)
    on(pmHold, 'keyup', (e: KeyboardEvent) => { if (e.key === ' ' || e.key === 'Enter') pmEnd() }, ctx)

    ctl.proposal = {
      play() {
        if (onPhone()) {
          pmTl = gsap.timeline()
          pmSecs.forEach((_, i) => pmTl!.add(() => pmFocus(i), 0.7 + i * 1.1))
          pmTl.add(() => { pmFocus(-1); pm.classList.add('armed') }, 0.7 + pmSecs.length * 1.1)
            .add(() => pmStart(true), 0.7 + pmSecs.length * 1.1 + 3)
          return
        }
        tl = gsap.timeline()
          .to(rows, { opacity: 1, y: 0, duration: 0.5, stagger: 0.04, ease: 'power3.out' }, 0.25)
          .to(det, { opacity: 1, y: 0, duration: 0.55, stagger: 0.07, ease: 'power3.out' }, 0.5)
        CMD_WALK.forEach(([n, text], i) => tl!.add(() => { focusOn(n, text, i === 0); if (n === 'bar') { armed = true; hold.classList.add('armed') } }, 1.5 + i * 1.2))
        tl.add(() => startHold(true), 9.3) // nobody held it: it is approved for you, the same way
      },
      stop() {
        kill(tl); tl = null
        if (holdTw) { kill(holdTw); holdTw = null; hold.classList.remove('holding'); gsap.set(fill, { scaleX: 0 }); C.charge(0, 0.4) }
        doneTl?.progress(1)
        kill(pmTl, pmTw); pmTl = pmTw = null; pmHold.classList.remove('holding')
        armed = false; hold.classList.remove('armed')
      },
      reset() {
        pmDone = false; pmFocus(-1); pm.classList.remove('ok', 'armed'); gsap.set(pmFill, { scaleX: 0 })
        approved = false; armed = false; hold.classList.remove('armed', 'holding')
        gsap.set([...rows, ...det], { opacity: 0, y: 10 })
        gsap.set(after, { opacity: 0, y: 0 })
        gsap.set(below, { y: 0 })
        gsap.set([fill, ly('bar'), ly('row1')], { opacity: 1 })
        gsap.set(fill, { scaleX: 0 })
        focus.classList.remove('on', 'ok')
      },
    }
  }

  // ---------------------------------------------------------------- the features: a camera over the real screens
  // Each step names a region of a screen. The camera scales the screen so the region fills the window (never past the
  // screen's own size, never leaving the window empty) and centres it; the green border marks it, drawn outside the
  // window so its label is never clipped. Each screen has its own camera, so a step on another screen is a dissolve:
  // the next screen comes up over the last one already framed, a touch closer, and settles while the last one eases
  // back underneath; the border glides from the old part to the new one. A step can then build: covers in the
  // screen's own colour lift off its pieces in turn, a beat moves the camera on, a button is held.
  for (const f of FEATURES) {
    const sec = $('#' + f.id), win = $('.ft-win', sec), shots = $$('.ft-shot', sec)
    const SW = f.w ?? SHOT_W, SH = f.h ?? SHOT_H
    const fz = $('.ft-fz', sec), lbl = $('b', fz), btns = $$('.ft-go', sec), lis = btns.map((b) => b.parentElement!)
    const veils = f.steps.map((_, k) => $$<HTMLElement>(`.ft-veil[data-s="${k}"]`, sec))
    const presses = f.steps.map((_, k) => sec.querySelector<HTMLElement>(`.ft-press[data-s="${k}"]`))
    let tl: gsap.core.Timeline | null = null, cutTl: gsap.core.Timeline | null = null, stepTl: gsap.core.Timeline | null = null
    let shown = 0, framed: Region | null = null
    const view = (r: Region) => {
      const W = win.clientWidth, H = win.clientHeight
      const fit = Math.max(W / SW, H / SH)
      const s = clamp(Math.min((W * 0.94) / r.w, (H * 0.92) / r.h), fit, 1)
      const x = clamp(W / 2 - (r.x + r.w / 2) * s, W - SW * s, 0)
      const y = clamp(H / 2 - (r.y + r.h / 2) * s, H - SH * s, 0)
      // the border, clipped to the window
      const bx = Math.max(2, r.x * s + x), by = Math.max(2, r.y * s + y)
      const bw = Math.min(W - 2, (r.x + r.w) * s + x) - bx, bh = Math.min(H - 2, (r.y + r.h) * s + y) - by
      return { s, x, y, bx, by, bw, bh, cx: (r.x + r.w / 2) * s + x, cy: (r.y + r.h / 2) * s + y }
    }
    type V = ReturnType<typeof view>
    /** the same framing, scaled by k about the region's centre (it still covers the window: k >= 1) */
    const closer = (v: V, k: number) => ({ x: v.cx - (v.cx - v.x) * k, y: v.cy - (v.cy - v.y) * k, scale: v.s * k })
    function border(v: V, dur: number) {
      gsap.to(fz, { x: v.bx, y: v.by, width: v.bw, height: v.bh, duration: dur, ease: 'power3.inOut', overwrite: 'auto' })
      fz.classList.toggle('low', v.by < 34)
    }
    /** move the current screen's camera and the border to a region ('auto' replaces only an earlier move) */
    function frame(r: Region, dur: number) {
      const v = view(r)
      framed = r
      gsap.to(shots[shown], { x: v.x, y: v.y, scale: v.s, duration: dur, ease: 'power3.inOut', overwrite: 'auto' })
      border(v, dur)
    }
    /** the label names where the border is going: it dips as the border sets off and comes back with the new name */
    function name(text: string, dur: number) {
      if (text === lbl.textContent) return
      if (!dur) { lbl.textContent = text; gsap.set(lbl, { opacity: 1 }); return }
      gsap.timeline().to(lbl, { opacity: 0, duration: 0.18, ease: 'power1.in' })
        .add(() => { lbl.textContent = text }, dur * 0.5).to(lbl, { opacity: 1, duration: 0.35, ease: 'power2.out' }, dur * 0.5)
    }
    /** only the screen on view is shown (the others are not painted at all) */
    function only(k: number) {
      shots.forEach((el, n) => { el.classList.toggle('on', n === k); gsap.set(el, { autoAlpha: n === k ? 1 : 0, zIndex: 0 }) })
      shown = k
    }
    function show(i: number, instant = false) {
      const st = f.steps[i]
      const cut = st.shot !== shown
      const still = instant || ctx.rm
      kill(stepTl); stepTl = null
      lis.forEach((li, k) => { li.classList.toggle('on', k === i); li.classList.toggle('past', k < i) })
      btns.forEach((b, k) => b.setAttribute('aria-current', k === i ? 'step' : 'false'))
      // every other step's pieces are in place; this step's are covered until it builds them (or in place, when still)
      veils.forEach((vs, k) => gsap.set(vs, { opacity: k === i && !still ? 1 : 0, scaleX: 1, scaleY: 1 }))
      presses.forEach((p) => p && gsap.set(p, { scaleX: 0, opacity: 1 }))
      fz.classList.add('on')
      if (!instant) C.ping()
      if (still) {
        cutTl?.kill(); cutTl = null
        only(st.shot)
        // without motion a step shows where it ends; the first frame of a scene coming in shows where it starts
        const r = st.beats?.length && (ctx.rm || ctx.mode === 'static') ? st.beats[st.beats.length - 1].r : st.r
        frame(r, 0); name(st.k, 0)
        return
      }
      if (cut) {
        // the dissolve: the next screen over the last, framed and a touch closer; it settles as it comes up, the last
        // one eases back underneath, and once it is covered it is put away
        const prev = shots[shown], next = shots[st.shot], v = view(st.r)
        cutTl?.kill()
        gsap.killTweensOf([prev, next])
        shots.forEach((el) => { if (el !== prev && el !== next && +gsap.getProperty(el, 'opacity') > 0) gsap.set(el, { zIndex: 1 }) })
        gsap.set(prev, { zIndex: 2 })
        gsap.set(next, { zIndex: 3, autoAlpha: 0, ...closer(v, 1.045) })
        next.classList.add('on')
        shown = st.shot; framed = st.r
        cutTl = gsap.timeline({ onComplete: () => { only(st.shot); cutTl = null } })
          .to(next, { autoAlpha: 1, duration: 0.75, ease: 'power2.inOut' }, 0)
          .to(next, { x: v.x, y: v.y, scale: v.s, duration: 1.3, ease: 'power3.out' }, 0)
        border(v, 0.95)
        name(st.k, 0.95)
      } else {
        // the same screen: the camera moves on (a dissolve still under way finishes; only its settle is replaced)
        if (!cutTl) only(st.shot)
        frame(st.r, 1.1)
        name(st.k, 1.1)
      }
      // the build, timed from when the screen is in view
      stepTl = gsap.timeline({ delay: cut ? 0.55 : 0.2 })
      st.build?.forEach((b, n) => {
        const el = veils[i][n]
        if (b.how === 'wipe-x') stepTl!.to(el, { scaleX: 0, duration: b.dur ?? 1.2, ease: 'power2.inOut' }, b.at)
        else if (b.how === 'wipe-y') stepTl!.to(el, { scaleY: 0, duration: b.dur ?? 1.2, ease: 'power2.inOut' }, b.at)
        else stepTl!.to(el, { opacity: 0, duration: b.dur ?? 0.45, ease: 'power2.out' }, b.at)
      })
      st.beats?.forEach((bt) => stepTl!.add(() => { frame(bt.r, 1.1); C.ripple(0.4, 1) }, bt.at))
      const p = presses[i]
      if (p && st.press) {
        stepTl.add(() => C.charge(1, 1), st.press.at)
          .to(p, { scaleX: 1, duration: 1, ease: 'none' }, st.press.at)
          .add(() => { C.charge(0, 0.5); C.burst() }, st.press.at + 1)
          .to(p, { opacity: 0, duration: 0.5, ease: 'power2.out' }, st.press.at + 1.5)
      }
    }
    btns.forEach((b, i) => on(b, 'click', () => { kill(tl); tl = null; show(i) }, ctx))
    // a new window size: what is framed now is framed again at once
    on(window, 'resize', () => { if (framed) frame(framed, 0) }, ctx)
    // without motion nothing plays: the first step is framed and stays until another is chosen
    if (ctx.mode === 'static') requestAnimationFrame(() => show(0, true))
    ctl[f.id] = {
      play() {
        // the first step is framed as the screen comes in; it builds (or moves on) once the screen is in
        kill(tl); tl = null
        show(0, true)
        const st = f.steps[0]
        if (st.build?.length || st.beats?.length) { veils[0].forEach((v) => gsap.set(v, { opacity: 1 })); show(0) }
        // the rest follow by themselves, each held for its own time
        tl = gsap.timeline()
        let t = 0.4
        f.steps.forEach((st, i) => { if (i) tl!.add(() => show(i), t); t += st.dur ?? 3 })
      },
      stop() { kill(tl, cutTl, stepTl); tl = cutTl = stepTl = null },
      reset() {
        framed = null
        lis.forEach((li) => li.classList.remove('on', 'past'))
        btns.forEach((b) => b.setAttribute('aria-current', 'false'))
        fz.classList.remove('on', 'low')
        veils.forEach((vs) => gsap.set(vs, { opacity: 0, scaleX: 1, scaleY: 1 }))
        only(0)
        gsap.set(shots[0], { x: 0, y: 0, scale: Math.max(win.clientWidth / SW, win.clientHeight / SH) || 1 })
      },
    }
  }

  // ---------------------------------------------------------------- Pulse: the briefing, a question, then the phone
  // Each step has an end state (set at once, for a step chosen out of turn) and a play (from the step before's end).
  {
    const sec = $('#pulse'), btns = $$('.ft-go', sec), lis = btns.map((b) => b.parentElement!)
    const desk = $('.pv-desk', sec), st = $('#pvSt'), greet = $('.pv-greet', sec), gbits = $$('.pv-greet > span', sec), btn = $('.pv-btn', sec)
    const say = $('.pv-say', sec), pre = $('.pv-pre', sec), words = $$('.pv-say .w', sec)
    const ask = $('.pv-ask', sec), you = $('.pv-you', sec), q = $('#pvQ'), ans = $$('.pv-ans .w', sec)
    const m1 = $('.pv-m1', sec), m2 = $('.pv-m2', sec), chk = $('.pv-chk', sec), checks = $$('.pv-chk li', sec)
    const prog = $('.pv-prog i', sec), phone = $('.pv-phone', sec), imgs = $$('.pv-phone .scr img', sec), holdI = $('.pv-phone .ph-hold i', sec)
    const Q = q.textContent || ''
    const STATUS = ['Morning briefing. 3 things need you.', 'Morning briefing for your brand.', 'Checking ad spend.']
    let tl: gsap.core.Timeline | null = null
    const screen = (k: number) => imgs.forEach((im, n) => im.classList.toggle('on', n === k))
    const lit = (els: HTMLElement[], n: number) => els.forEach((w, k) => w.classList.toggle('on', k < n))
    const dock = (el: HTMLElement, on: boolean) => el.classList.toggle('in', on)
    const typed = (n: number) => { q.textContent = Q.slice(0, n) }
    /** the screen as it stands at the end of step k (-1: before anything) */
    function state(k: number) {
      sec.classList.toggle('rail', k <= 0)
      sec.classList.toggle('playing', k === 1)
      sec.classList.toggle('phone-in', k >= 3)
      gsap.set(gbits, { opacity: k <= 0 ? (k === 0 ? 1 : 0) : 0, y: 0 })
      greet.classList.toggle('off', k >= 1)
      btn.classList.remove('press')
      say.classList.toggle('off', k !== 1)
      gsap.set(pre, { opacity: k === 1 ? 1 : 0 })
      lit(words, k === 1 ? words.length : 0)
      ask.classList.toggle('off', k < 2)
      typed(k >= 2 ? Q.length : 0)
      lit(ans, k >= 2 ? ans.length : 0)
      dock(m1, k === 1); dock(m2, k === 1); dock(chk, k >= 2)
      checks.forEach((c) => c.classList.toggle('ok', k >= 2))
      st.textContent = STATUS[clamp(k, 0, 2)]
      gsap.set(prog, { scaleX: k >= 1 ? 0.08 : 0 })
      screen(k >= 4 ? 4 : k === 3 ? 2 : 0)
      gsap.set(holdI, { scaleX: 0 })
    }
    /** what plays in step k, from the end of step k-1 */
    function play(k: number, t: gsap.core.Timeline) {
      if (k === 0) {
        t.to(gbits, { opacity: 1, y: 0, duration: 0.6, stagger: 0.18, ease: 'power3.out', startAt: { opacity: 0, y: 8 } }, 0.15)
          .add(() => C.ripple(0.5, 1.2), 0.3)
          .add(() => { btn.classList.add('press'); C.ping() }, 2.2)
      } else if (k === 1) {
        t.add(() => { sec.classList.remove('rail'); sec.classList.add('playing'); greet.classList.add('off'); say.classList.remove('off'); st.textContent = STATUS[1] }, 0)
          .to(pre, { opacity: 1, duration: 0.5 }, 0.45)
          .add(() => C.speakPulse(), 0.5)
        words.forEach((w, n) => t.add(() => { w.classList.add('on'); if (n % 2 === 0) C.speakPulse(); if (n === 2) dock(m1, true); if (n === 7) dock(m2, true) }, 1.1 + n * 0.3))
        t.to(prog, { scaleX: 0.08, duration: 3.6, ease: 'none' }, 0.4)
      } else if (k === 2) {
        t.add(() => { sec.classList.remove('playing'); say.classList.add('off'); dock(m1, false); dock(m2, false); ask.classList.remove('off'); st.textContent = 'Listening. The briefing is paused.'; C.ripple(0.45, 1.6) }, 0)
          .fromTo(you, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }, 0.15)
        const tq = { n: 0 }
        t.to(tq, { n: Q.length, duration: 1.3, ease: 'none', onUpdate: () => typed(Math.round(tq.n)) }, 0.35)
          .add(() => { st.textContent = STATUS[2]; dock(chk, true); C.think(1.8) }, 1.9)
        checks.forEach((c, n) => t.add(() => { c.classList.add('ok'); C.ripple(0.3, 0.8) }, 2.4 + n * 0.45))
        ans.forEach((w, n) => t.add(() => w.classList.add('on'), 2.3 + n * 0.22))
      } else if (k === 3) {
        t.add(() => { sec.classList.add('phone-in'); screen(0); C.ping() }, 0)
          .add(() => { screen(1); C.speakPulse() }, 1.7)
          .add(() => { screen(2); C.ping() }, 3.3)
      } else if (k === 4) {
        t.add(() => screen(3), 0)
          .add(() => C.charge(1, 1.1), 0.6)
          .fromTo(holdI, { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: 'none', immediateRender: false }, 0.6)
          .add(() => { C.charge(0, 0.5); C.burst() }, 1.7)
          .add(() => screen(4), 1.9)
      }
    }
    function mark(k: number) {
      lis.forEach((li, n) => { li.classList.toggle('on', n === k); li.classList.toggle('past', n < k) })
      btns.forEach((b, n) => b.setAttribute('aria-current', n === k ? 'step' : 'false'))
    }
    /** from step k on: the steps in turn (or just step k, when it was chosen) */
    function run(k: number, only = false) {
      kill(tl)
      C.charge(0, 0.3) // a hold cut short lets go
      state(k - 1)
      if (only) mark(k)
      tl = gsap.timeline()
      let t = 0
      VOICE.steps.forEach((s, n) => {
        if (n < k || (only && n > k)) return
        const sub = gsap.timeline(); play(n, sub)
        tl!.add(() => mark(n), t).add(sub, t)
        t += s.dur
      })
    }
    btns.forEach((b, n) => on(b, 'click', () => run(n, true), ctx))
    if (ctx.mode === 'static') requestAnimationFrame(() => { state(1); mark(1) })
    ctl.pulse = {
      // the steps in turn
      play() { run(0) },
      stop() { kill(tl); tl = null; C.charge(0, 0.3) },
      reset() { state(-1); lis.forEach((li) => li.classList.remove('on', 'past')); btns.forEach((b) => b.setAttribute('aria-current', 'false')) },
    }
    void desk
  }

  // ---------------------------------------------------------------- the close: the hero's proposals, measured
  {
    const lis = $$('#start .ledger2 li'), scan = $('#scanCard')
    let tl: gsap.core.Timeline | null = null
    ctl.start = {
      play() {
        tl = gsap.timeline()
        lis.forEach((li, i) => tl!.add(() => li.classList.add('on'), 0.7 + i * 0.35))
      },
      stop() { if (tl) { kill(tl); tl = null; lis.forEach((li) => li.classList.add('on')) } },
      reset() { lis.forEach((li) => li.classList.remove('on')); scan.classList.remove('found') },
    }
  }

  const none: Ctl = { play() {}, stop() {}, reset() {} }
  const get = (id: string) => ctl[id] || none
  // a scrolling page without motion shows every scene at rest; film and flow start them hidden, ready to play
  if (ctx.mode !== 'static') Object.values(ctl).forEach((c) => c.reset())
  return {
    play: (id: string) => get(id).play(),
    stop: (id: string) => get(id).stop(),
    reset: (id: string) => get(id).reset(),
    /** holding the core in the last scene runs a sample scan */
    scan() { $('#scanCard').classList.add('found') },
  }
}
