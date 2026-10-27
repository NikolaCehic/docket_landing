// The page. On desktop ('film') the eight scenes are stages on one page that scrolls the normal way: the wheel (smoothed,
// never captured), a trackpad, the keys, the scrollbar or a link move it as far and as fast as you like. Nothing snaps
// and nothing scrolls by itself. Each scene's frame is held on screen while you scroll through it, and the scroll is
// its clock:
//   coming in  it comes in over the scene before as its material says (data-enter; see the CSS): a night scene rises
//              over the held night, whose content settles back and fades; paper slides up over the night as a sheet;
//              paper scrolls on after paper; the last paper lifts off the night held underneath. Its title plays once
//              it is halfway in (kinetic.ts, in time);
//   held       its own timeline follows the scroll (stages.ts): its first beat as it docks, the rest over its hold.
//              It eases after the scroll, so scrolling back rewinds it and a fast scroll lets it finish, never skip;
//   gone       once it has gone back down off the screen, its title is put away to play again.
// What joins the scenes follows the scroll too: the Radiant Core is carried from one scene's place to the next and the
// night turns to paper and back (companion.ts), the hero's lines part (hero.ts), the chapter mark and the progress line.
//
// On phones and touch screens ('flow') the same scenes are a normal scrolling page: each plays when it comes into view.
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import type { Companion } from './companion'
import type { Kinetic } from './kinetic'
import type { Scenes } from './scenes'
import type { Stage, Stages } from './stages'
import { $, $$, clamp, on, recede, type Ctx } from './util'

gsap.registerPlugin(ScrollTrigger)

type Enter = 'fade' | 'sheet' | 'flow' | 'lift'
type Sc = {
  el: HTMLElement; id: string; night: boolean; label: string; enter: Enter
  /** the part held on screen, and what holds it (the section, or a wrapper) */
  frame: HTMLElement; holder: HTMLElement
  /** layers held beside the frame that settle back with it (the agents' ghosts) */
  back: HTMLElement | null
  /** page px: the section; where it starts to come in; where its frame is first held; how long its own timeline runs */
  top: number; bottom: number; arrive: number; holdAt: number; hold: number
}
const num = (i: number) => String(i + 1).padStart(2, '0')
const smooth = (a: number, b: number, t: number) => { const x = clamp((t - a) / (b - a), 0, 1); return x * x * (3 - 2 * x) }
/** how far before a scene is fully in its timeline starts (in screens): its first beat plays as it docks */
const PREROLL = 0.3
/** how long a scene's timeline takes to catch up with the scroll (s): a fast scroll lets it finish rather than skip */
const CATCH = 0.7

export type Film = ReturnType<typeof createFilm>

export function createFilm(ctx: Ctx, d: { companion: Companion; scenes: Scenes | null; stages: Stages | null; kinetic: Kinetic }) {
  const root = document.documentElement
  const FILM = ctx.mode === 'film'
  const S: Sc[] = $$('[data-scene]').map((el, i) => {
    const frame = (FILM && $('[data-frame]', el)) || el
    return {
      el, id: el.dataset.scene!, night: el.classList.contains('night'), label: el.dataset.label || '',
      enter: (el.dataset.enter as Enter) || (i ? 'flow' : 'fade'), frame, holder: frame === el ? el : frame.parentElement!,
      back: el.querySelector<HTMLElement>('.nt-back'), top: 0, bottom: 0, arrive: 0, holdAt: 0, hold: 0,
    }
  })
  const n = S.length
  const nav = $('#nav'), navLinks = $$('nav a', nav)
  const clockEl = $('#clock'), clockT = $('#clockT'), clockL = $('#clockL'), progI = $('#progI')
  let cur = -1, started = false, vh = innerHeight
  let lenis: Lenis | null = null
  const triggers: ScrollTrigger[] = []
  let chTl: gsap.core.Timeline | null = null
  /** the scenes whose sequence has started (a phone: since they were last reset) */
  const playing = new Set<number>()
  ctx.signal.addEventListener('abort', () => { triggers.forEach((t) => t.kill()); chTl?.kill(); lenis?.destroy() })

  // ---------------------------------------------------------------- where each scene is (page px)
  function measure() {
    vh = innerHeight
    const y = scrollY
    S.forEach((s, i) => {
      const r = s.el.getBoundingClientRect(), h = s.holder.getBoundingClientRect()
      s.top = r.top + y; s.bottom = r.bottom + y
      // a scene comes in from the foot of the screen; the one the paper lifts off is there already, underneath
      s.arrive = s.enter === 'lift' ? s.top : s.top - vh
      const lift = s.enter === 'lift' ? vh : 0
      const next = S[i + 1], out = next && (next.enter === 'fade' || next.enter === 'sheet') ? vh : 0
      s.holdAt = h.top + y + lift
      s.hold = Math.max(0, h.height - vh - lift - out)
    })
  }
  /** how far scene i has come in (0: not yet, 1: it holds the screen) */
  const come = (i: number, y = scrollY) => (i <= 0 ? 1 : clamp((y - S[i].arrive) / vh, 0, 1))

  // ---------------------------------------------------------------- the chapter mark: the scene's number and name
  /** the mark's number and name swap: the old ones fall away and the new ones rise into place */
  function chapter(i: number, dir: number) {
    const el = [clockT, clockL]
    chTl?.kill()
    chTl = gsap.timeline()
      .to(el, { opacity: 0, y: -8 * dir, duration: 0.22, ease: 'power2.in', stagger: 0.04 })
      .add(() => { clockT.textContent = num(i); clockL.textContent = S[i].label })
      .fromTo(el, { y: 8 * dir }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out', stagger: 0.05 })
  }
  clockT.textContent = num(1); clockL.textContent = S[1]?.label ?? ''

  // ---------------------------------------------------------------- the nav and the chapter mark take the colours under them
  /** the scene seen at a line of the screen (px from its top): the latest one there, unless the paper still covers it */
  function under(line: number) {
    const at = scrollY + line
    if (!FILM) { for (let i = n - 1; i > 0; i--) if (S[i].el.offsetTop <= at) return i; return 0 }
    for (let i = n - 1; i > 0; i--) {
      const s = S[i]
      if (at < s.top || at >= s.bottom) continue
      if (s.enter === 'lift' && at < S[i - 1].bottom) continue
      return i
    }
    return 0
  }
  /** the nav link of the scene on view is marked */
  function mark(i: number) {
    navLinks.forEach((a) => {
      const t = document.getElementById(a.getAttribute('href')!.slice(1))
      a.classList.toggle('cur', !!t && t.closest('[data-scene]') === S[i].el && i !== 0)
    })
  }
  let navAt = -1, clockAt = -1
  function chrome() {
    // the bar is clear only at the very top of the page
    nav.classList.toggle('clear', scrollY < 8)
    const k = under(40)
    if (k !== navAt) {
      navAt = k
      nav.classList.toggle('on-dark', S[k].night)
      nav.classList.toggle('on-light', !S[k].night)
      if (!FILM) mark(k)
    }
    if (!FILM) return
    // the current scene: the last one at least halfway in
    let c = 0
    for (let i = 1; i < n; i++) if (come(i) >= 0.5) c = i
    current(c)
    const f = under(vh - 30)
    if (f !== clockAt) { clockAt = f; clockEl.classList.toggle('day', !S[f].night) }
    // the chapter mark shows while a scene holds the screen, and steps aside while the next one comes in under it
    let seam = false
    for (let i = 1; i < n && !seam; i++) { const p = come(i); seam = p > 0.06 && p < 0.94 }
    clockEl.classList.toggle('on', cur > 0 && !seam)
  }
  function current(i: number) {
    if (i === cur) return
    const dir = i > cur ? 1 : -1
    cur = i
    chapter(i, dir)
    mark(i)
  }

  // ---------------------------------------------------------------- the held scene settles back as the next one comes in
  // Written every frame the page moves (after the scroll, before the core is drawn): only transforms and opacity.
  let fxY = -1
  const put = (el: HTMLElement, scale: number, op: number) => {
    const t = scale === 1 ? '' : `scale(${scale.toFixed(4)})`, o = op >= 0.999 ? '' : op.toFixed(3)
    if (el.style.transform !== t) el.style.transform = t
    if (el.style.opacity !== o) el.style.opacity = o
  }
  function fx() {
    const y = scrollY
    if (y === fxY) return
    fxY = y
    for (let i = 0; i < n; i++) {
      const s = S[i], nx = S[i + 1]
      let scale = 1, op = 1, back = 1
      if (nx && (nx.enter === 'fade' || nx.enter === 'sheet')) {
        // held while the next one comes in over it: it settles back, and fades (under night) or dims (under paper)
        const p = come(i + 1, y)
        scale = recede(p)
        op = nx.enter === 'fade' ? 1 - smooth(0, 0.42, p) : 1 - 0.55 * smooth(0, 1, p)
        back = 1 - smooth(0, 0.6, p)
      } else if (nx && nx.enter === 'flow') {
        // paper after paper: it scrolls away, quieter as the next one takes the screen
        op = 1 - 0.4 * come(i + 1, y)
      }
      if (s.enter === 'lift') {
        // held underneath while the paper lifts off it: it comes forward as it is uncovered
        const p = come(i, y)
        scale = recede(1 - p)
        op = 0.55 + 0.45 * smooth(0, 0.9, p)
      }
      put(s.frame, scale, op)
      if (s.back) s.back.style.opacity = back >= 0.999 ? '' : back.toFixed(3)
    }
  }

  // ---------------------------------------------------------------- a scene comes in and is put away
  const titled = new Set<number>()
  /** its content shows (the screens open, the lists arrive: CSS on .in) */
  function open(i: number) { S[i].el.classList.add('in') }
  /** its title plays, once per visit */
  function title(i: number) {
    open(i)
    if (titled.has(i)) return
    titled.add(i)
    d.kinetic.play(S[i].el)
  }
  function reveal(i: number) { title(i) }
  /** desktop: the scene has gone back down off the screen: its title waits to play again */
  function hide(i: number) {
    const el = S[i].el
    titled.delete(i)
    if (!el.classList.contains('in')) return
    el.classList.remove('in')
    d.kinetic.reset(el)
  }
  /** a phone: a scene's own sequence, once per visit */
  function run(i: number) {
    if (i === 0 || playing.has(i)) return
    reveal(i)
    playing.add(i)
    d.scenes?.play(S[i].id)
  }
  /** a phone: a scene that has left the screen is reset, so it plays again on the next visit */
  function gone(i: number) {
    const el = S[i].el
    if (!el.classList.contains('in') && !playing.has(i)) return
    d.scenes?.stop(S[i].id)
    playing.delete(i)
    el.classList.remove('in')
    d.kinetic.reset(el)
    d.scenes?.reset(S[i].id)
  }

  // ---------------------------------------------------------------- each scene's own timeline follows the scroll
  // Its first `lead` seconds play as it docks (from PREROLL screens before), the rest over its hold. The timeline eases
  // after the scroll (CATCH), the way a scrubbed ScrollTrigger does, so scrolling back rewinds it.
  type Drive = { i: number; st: Stage; t: number }
  const drives: Drive[] = []
  function timeAt(dv: Drive, y: number) {
    const s = S[dv.i], total = dv.st.tl.duration(), lead = Math.min(dv.st.lead ?? 0, total)
    const a = s.holdAt - PREROLL * vh, b = s.holdAt
    if (y <= a) return 0
    if (y < b) return (lead * (y - a)) / (b - a)
    return s.hold > 0 ? lead + (total - lead) * clamp((y - b) / s.hold, 0, 1) : total
  }
  function yAt(dv: Drive, t: number) {
    const s = S[dv.i], total = dv.st.tl.duration(), lead = Math.min(dv.st.lead ?? 0, total)
    if (t <= lead) return s.holdAt - PREROLL * vh * (1 - (lead ? t / lead : 1))
    return s.holdAt + (s.hold * (t - lead)) / Math.max(1e-6, total - lead)
  }
  function drive(instant = false) {
    const y = scrollY
    for (const dv of drives) {
      const t = timeAt(dv, y)
      if (!instant && Math.abs(t - dv.t) < 1e-4) continue
      dv.t = t
      if (instant) { gsap.killTweensOf(dv.st.tl); dv.st.tl.time(t) }
      else gsap.to(dv.st.tl, { time: t, duration: CATCH, ease: 'power3.out', overwrite: true })
    }
  }
  /** a new layout: every timeline reads its values again (the camera's framing) and is shown where the scroll is */
  function redrive() {
    for (const dv of drives) { const tl = dv.st.tl, t = tl.time(); gsap.killTweensOf(tl); tl.invalidate(); tl.time(0, true); tl.time(t) }
    drive(true)
  }

  // ---------------------------------------------------------------- a step chosen: the page scrolls to where it is shown
  function pick(id: string, k: number) {
    const dv = drives.find((x) => S[x.i].id === id), at = dv?.st.at
    if (!dv || !at) return
    scrollTo(yAt(dv, at[k]))
  }
  d.stages?.setPick(pick)

  // ---------------------------------------------------------------- scrolling by script: only for a link or a chosen step
  function scrollTo(y: number, instant = false) {
    const top = Math.max(0, Math.round(y))
    if (lenis) {
      const far = Math.abs(top - scrollY) / vh
      lenis.scrollTo(top, { immediate: instant || ctx.rm, duration: clamp(0.7 + far * 0.12, 0.7, 1.8), easing: (t) => 1 - Math.pow(1 - t, 4) })
    } else window.scrollTo({ top, behavior: instant || ctx.rm ? 'auto' : 'smooth' })
  }

  // ================================================================ film: held stages, each with its own timelines
  function startFilm() {
    // the wheel is smoothed (the page still goes where you send it, as fast as you send it); keys, the scrollbar and
    // touch stay native. It runs first on the shared clock, so the core and the stages read this frame's scroll
    lenis = new Lenis({ lerp: 0.13, smoothWheel: true, autoRaf: false, allowNestedScroll: true, stopInertiaOnNavigate: true })
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (t: number) => lenis?.raf(t * 1000)
    gsap.ticker.add(raf, false, true)
    ctx.signal.addEventListener('abort', () => gsap.ticker.remove(raf))
    // a sheet (an overlay) is open: the page behind it holds still
    const sheets = new MutationObserver(() => { if (root.classList.contains('sheet-open')) lenis?.stop(); else lenis?.start() })
    sheets.observe(root, { attributes: true, attributeFilter: ['class'] })
    ctx.signal.addEventListener('abort', () => sheets.disconnect())

    measure()
    const add = (v: ScrollTrigger.Vars) => { triggers.push(ScrollTrigger.create(v)) }
    // created top to bottom, in page order (no pins: the CSS holds the frames, so nothing here changes the layout)
    S.forEach((s, i) => {
      if (i > 0) {
        // halfway in, its title plays; gone back down off the screen, it waits to play again. Under a lifting paper
        // its content is there from the start, and the title rises as the paper uncovers it
        const lift = s.enter === 'lift'
        if (lift) add({ start: () => S[i].arrive + vh * 0.06, end: 'max', onEnter: () => open(i) })
        add({ start: () => S[i].arrive + vh * (lift ? 0.7 : 0.45), end: 'max', onEnter: () => title(i) })
        add({ start: () => S[i].arrive + 2, end: 'max', onLeaveBack: () => hide(i) })
      }
      // its own timeline, following the scroll over its hold
      const st = d.stages?.get(s.id)
      if (st) drives.push({ i, st, t: -1 })
    })
    // the progress line fills as the page goes by, up to the close
    const prog = gsap.fromTo(progI, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: () => S[n - 1].arrive + vh, scrub: 0.4 } })
    if (prog.scrollTrigger) triggers.push(prog.scrollTrigger)
    // the chapter mark steps aside while the credits are read
    const credits = S[n - 1].el.querySelector<HTMLElement>('.credits')
    if (credits) add({ trigger: credits, start: 'top 55%', toggleClass: { targets: root, className: 'in-credits' } })
    // what moves with the scroll, every frame it moves: the held scenes settle back, the timelines follow, the chrome
    let ty = -1
    const tick = () => { if (scrollY === ty) return; ty = scrollY; fx(); drive(); chrome() }
    gsap.ticker.add(tick)
    ctx.signal.addEventListener('abort', () => { gsap.ticker.remove(tick); drives.forEach((dv) => gsap.killTweensOf(dv.st.tl)) })
    for (let i = 1; i < n; i++) if (come(i) >= (S[i].enter === 'lift' ? 0.7 : 0.45)) reveal(i); else if (S[i].enter === 'lift' && come(i) > 0.06) open(i)
    fx(); drive(true); chrome()
  }

  // ================================================================ flow: a scrolling page that plays on view
  function startFlow() {
    if (ctx.mode === 'static') return
    // a scene plays once any part of it reaches the middle band of the screen (tall scenes included), and is reset
    // once it has left the screen entirely, so it plays again on the next visit
    const play = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const i = S.findIndex((s) => s.el === e.target)
        if (e.isIntersecting) run(i)
      }
    }, { rootMargin: '-30% 0px -30% 0px' })
    const away = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const i = S.findIndex((s) => s.el === e.target)
        if (i > 0 && !e.isIntersecting) gone(i)
      }
    })
    S.forEach((s) => { play.observe(s.el); away.observe(s.el) })
    ctx.signal.addEventListener('abort', () => { play.disconnect(); away.disconnect() })
  }

  // ---------------------------------------------------------------- links: scroll to what the link names
  /** Focus moves to the target as well (from a pointer too), so the next Tab and the keys that scroll the page carry on
   *  from there: a link chosen in the menu is hidden once the menu closes, and the keys would otherwise scroll nothing. */
  function onLink(e: MouseEvent) {
    const a = (e.target as Element).closest?.('a[href^="#"]') as HTMLAnchorElement | null
    if (!a || a.classList.contains('skip') || a.hasAttribute('data-sheet') || e.metaKey || e.ctrlKey) return
    const el = document.getElementById(a.getAttribute('href')!.slice(1))
    if (!el) return
    e.preventDefault()
    goTo(el, true)
  }
  function focusOn(el: HTMLElement) {
    if (!el.hasAttribute('tabindex') && !el.matches('a, button, input, select, textarea, summary')) el.setAttribute('tabindex', '-1')
    el.focus({ preventScroll: true })
  }
  function goTo(el: HTMLElement, focus = false, instant = false) {
    // on desktop a scene is shown where it has fully come in; anything else sits under the nav
    const i = FILM ? S.findIndex((s) => s.el === el) : -1
    if (FILM) measure()
    const y = el.id === 'top' ? 0 : i > 0 ? S[i].arrive + vh : el.getBoundingClientRect().top + scrollY - (FILM ? 72 : 64)
    scrollTo(y, instant)
    if (focus) focusOn(el)
  }
  /** a link from another page (/#agents, /#first-scan): go there once the page is ready */
  function deepLink() {
    const h = root.dataset.hash
    if (!h) return
    delete root.dataset.hash
    if (h === 'first-scan' || h === 'sign-in') { window.dispatchEvent(new CustomEvent('docket:sheet', { detail: h === 'first-scan' ? 'scan' : 'signin' })); return }
    const el = document.getElementById(h)
    if (el) requestAnimationFrame(() => goTo(el, false, true))
  }

  // ---------------------------------------------------------------- start (after the start-up)
  function start() {
    if (started) return
    started = true
    S[0].el.classList.add('in')
    gsap.set(progI, { scaleX: 0 })
    if (FILM) startFilm()
    else { startFlow(); on(window, 'scroll', chrome, ctx, { passive: true }) }
    chrome()
    on(document, 'click', onLink, ctx)
    deepLink()
  }

  // every refresh of the triggers (a resize, fonts) reads the scenes and the core's places again; the core's places
  // are read with the held scenes at rest
  if (FILM) {
    const re = () => {
      measure()
      root.classList.add('measuring'); d.companion.measure(); root.classList.remove('measuring')
      fxY = -1
      redrive()
    }
    ScrollTrigger.addEventListener('refresh', re)
    ctx.signal.addEventListener('abort', () => ScrollTrigger.removeEventListener('refresh', re))
  }
  /** layout changed (resize): the core's places are read again */
  function layout() {
    if (FILM) { measure(); root.classList.add('measuring'); d.companion.measure(); root.classList.remove('measuring') } else d.companion.measure()
  }
  /** fonts or content moved the layout: every trigger is measured again */
  function refresh() { if (started && FILM) ScrollTrigger.refresh() }

  return { start, measure: layout, refresh, get index() { return cur } }
}
