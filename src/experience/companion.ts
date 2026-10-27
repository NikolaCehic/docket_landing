// The Radiant Core: it boots the page, lights the engraved night behind the night scenes, and carries across the page.
// It never narrates; it is the one object that persists from scene to scene, so the scenes read as one film.
// - film (desktop): each scene names where the core sits ([data-core-k] slot, in the scene's held frame). It follows
//   the scroll, never a clock: while a scene holds the screen the core sits in its place (and settles back with it
//   when the next scene comes in over it), and over the screen of scroll in which the next scene comes in it is handed
//   from one place to the next (seams). Where both places sit in the same spot of the screen it simply stays; where they
//   differ it eases across. So it only ever moves about as fast as the page does. The night turns to paper (dawn) as a
//   paper scene comes in and back as the paper lifts off the night, and the core's depth and ink follow the paper under
//   it. The scroll's speed turns its lattice a little, so it is felt to move with the page.
// - flow (phones): the core lives in the stages (hero, how it works, Pulse, first scan) and follows them as the page scrolls.
//
// Stability rules this file follows:
// - the WebGL canvas is allocated once per window size and never during a transition (the orb is drawn into a viewport);
// - nothing reads layout inside the frame loop: slots come from a cache refreshed on resize;
// - the frame loop only writes transforms and shader uniforms.
import { gsap } from 'gsap'
import { createRadiantCore, type RadiantCore } from './radiantCore'
import { createBackdrop, type Backdrop } from './backdrop'
import { $, $$, clamp, lerp, ease, on, recede, type Ctx } from './util'

type Rect = { x: number; y: number; w: number; h: number }
type Sec = {
  el: HTMLElement; night: boolean; lit: boolean; stage: boolean; final: boolean; slotEl: HTMLElement | null; k: number
  /** film: the slot in its frame (x in page px, y from the frame's top); flow: in page px */
  slot: Rect | null
  /** the scene in page px; film: where its frame's holder starts and how long the frame stays on screen */
  top: number; bottom: number; hTop: number; held: number; frame: HTMLElement
  /** film: how the scene comes in (data-enter), and where in the page it starts to (seams run from there) */
  enter: string; arrive: number
  /** film: how far apart this scene's place and the one before it sit on the screen (0: the same spot, 1: well apart) */
  apart: number
  /** film: the dark stage the core sits in on a paper scene (Pulse), placed like the slot */
  dark: Rect | null
}
type Pose = { x: number; y: number; box: number; alpha?: number }

export type Companion = ReturnType<typeof createCompanion>

export type CompanionHooks = {
  onScan: () => void; onBooted: () => void
  /** the hero: its entrance joins the start-up timeline; holding to approve fills "Your call." */
  hero?: {
    intro: (tl: gsap.core.Timeline, at: number) => void; settle: () => void; CARD_AT: number[]
    call: (p: number) => void; made: (on: boolean) => void; release: () => void
    orbit: { rx: number; ry: number; angle: number; k: number }
  }
}
export function createCompanion(ctx: Ctx, hooks: CompanionHooks) {
  const RM = ctx.rm, FILM = ctx.mode === 'film'
  const root = document.documentElement
  const canvas = $<HTMLCanvasElement>('#core')
  let core: RadiantCore | null = null
  try { core = createRadiantCore(canvas) } catch { core = null }
  if (!core) { canvas.style.display = 'none'; root.classList.add('no-gl') }
  const bdCanvas = $<HTMLCanvasElement>('#backdrop')
  let backdrop: Backdrop | null = null
  if (core) { try { backdrop = createBackdrop(bdCanvas); root.classList.add('bd') } catch { backdrop = null } }
  let bdShown = false

  // ------------------------------------------------------------ scenes and where the core sits in each
  const secs: Sec[] = $$('[data-scene]').map((el) => {
    const slotEl = $('[data-core-k]', el)
    const id = el.dataset.scene
    const frame = (FILM && $('[data-frame]', el)) || el
    return { el, night: el.classList.contains('night'), lit: el.dataset.core === 'glow', stage: id === 'hero' || id === 'system' || id === 'pulse' || id === 'start', final: id === 'start', slotEl, k: slotEl ? +slotEl.dataset.coreK! : 1, slot: null, top: 0, bottom: 0, hTop: 0, held: 0, frame, enter: el.dataset.enter || 'flow', arrive: 0, apart: 1, dark: null }
  })
  const HERO = 0
  const cards = $$('.pcard')

  /** flow: which two stages the page is between, and how far (0..1) */
  const route = { from: 0, to: 0, t: 0 }
  /** film: how far each seam has come (seam[j]: from scene j's top at the foot of the screen, 0, to at its top, 1) */
  const seam = new Float32Array(secs.length)
  /** film: the backdrop and the core's look, from the scroll */
  const look = { backdrop: true, dawn: 0, ink: 0, front: false }

  let vw = innerWidth, vh = innerHeight
  let SIZE = 0, dpr = 1
  let bdW = 0, bdH = 0

  function measure() {
    vh = innerHeight
    for (const s of secs) {
      const r = s.el.getBoundingClientRect()
      s.top = r.top + scrollY; s.bottom = s.top + r.height
      const h = (s.frame !== s.el ? s.frame.parentElement! : s.el).getBoundingClientRect()
      s.hTop = h.top + scrollY
      s.held = s.frame !== s.el ? Math.max(0, h.height - vh) : 0
      s.arrive = s.enter === 'lift' ? s.top : s.top - vh
      if (!s.slotEl) { s.slot = null; continue }
      const q = s.slotEl.getBoundingClientRect(), fy = s.frame.getBoundingClientRect().top
      s.slot = { x: q.left + scrollX, y: FILM ? q.top - fy : q.top + scrollY, w: q.width, h: q.height }
      const st = FILM && s.lit ? s.slotEl.closest<HTMLElement>('.pv-stage') : null
      const z = st?.getBoundingClientRect()
      s.dark = z ? { x: z.left + scrollX, y: z.top - fy, w: z.width, h: z.height } : null
    }
    if (!FILM) return
    // a seam between two places in the same spot of the screen is a straight hand-over (the core stays put); between
    // places well apart it is eased, so the core leaves one place and settles into the next. Paper scrolling on after
    // paper is always straight: the core crosses at an even pace, never faster than the page
    for (let j = 1; j < secs.length; j++) {
      const a = secs[j - 1].slot, b = secs[j].slot
      if (secs[j].enter === 'flow') { secs[j].apart = 0; continue }
      if (!a || !b) { secs[j].apart = 1; continue }
      const d = Math.max(Math.hypot(a.x + a.w / 2 - b.x - b.w / 2, a.y + a.h / 2 - b.y - b.h / 2), Math.abs(a.w * secs[j - 1].k - b.w * secs[j].k) * 0.5)
      secs[j].apart = clamp(d / (vh * 0.2), 0, 1)
    }
  }

  function bootPose(): Pose { return { x: vw / 2, y: vh * 0.45, box: Math.min(vw * 0.9, vh * 0.74), alpha: 1 } }

  function layout() {
    vw = innerWidth; vh = innerHeight
    measure()
    if (!core) return
    // one canvas, big enough for the largest pose the core takes (the start-up)
    const biggest = Math.max(bootPose().box, ...secs.filter((s) => s.slot).map((s) => s.slot!.w * s.k * 1.05))
    const size = Math.ceil(biggest / 8) * 8
    const ratio = Math.min(window.devicePixelRatio || 1, size > 600 ? 1.5 : 2)
    if (size !== SIZE || ratio !== dpr) {
      SIZE = size; dpr = ratio
      core.resize(SIZE, dpr)
      canvas.style.width = SIZE + 'px'; canvas.style.height = SIZE + 'px'
    }
    if (backdrop && (vw !== bdW || vh !== bdH)) { bdW = vw; bdH = vh; backdrop.resize(vw, vh, Math.min(window.devicePixelRatio || 1, 1.5)) }
  }

  /** film: where a scene's frame is on the screen: it scrolls in with its scene, is held while the scene is scrolled
   *  through (and while the next one comes in over it), and scrolls out */
  const frameTop = (s: Sec) => s.hTop - scrollY + clamp(scrollY - s.hTop, 0, s.held)
  /** film: how far a held scene has settled back under the next one coming in over it */
  const settle = (i: number) => {
    const nx = secs[i + 1]
    return nx && (nx.enter === 'fade' || nx.enter === 'sheet') ? recede(seam[i + 1]) : secs[i].enter === 'lift' ? recede(1 - seam[i]) : 1
  }
  /** where scene i's place is on the screen now (`held`: as it stood while its frame held the screen) */
  function pose(i: number, held = false): Pose | null {
    const s = secs[i]
    if (!s?.slot) return null
    if (FILM) {
      const ft = held ? 0 : frameTop(s)
      const x = s.slot.x - scrollX + s.slot.w / 2, y = ft + s.slot.y + s.slot.h / 2, k = held ? 1 : settle(i)
      if (k === 1) return { x, y, box: s.slot.w * s.k }
      // the frame is scaled about the middle of the screen: the core keeps its place in it
      return { x: vw / 2 + (x - vw / 2) * k, y: ft + vh / 2 + (y - ft - vh / 2) * k, box: s.slot.w * s.k * k }
    }
    if (!s.stage) return null
    return { x: s.slot.x - scrollX + s.slot.w / 2, y: s.slot.y - scrollY + s.slot.h / 2, box: s.slot.w * s.k }
  }

  // film: how far each seam has come, from the scroll position
  function seams() {
    for (let j = 1; j < secs.length; j++) seam[j] = clamp((scrollY - secs[j].arrive) / vh, 0, 1)
  }
  /** how much of seam j's hand-over is done: straight where the places share a spot, eased where they are apart */
  function handed(j: number) {
    const t = seam[j]
    return t + (t * t * (3 - 2 * t) - t) * secs[j].apart
  }
  /** film: where the core belongs now: each scene's place, handed over seam by seam */
  function filmTarget(): Pose | null {
    const first = pose(0)
    if (!first) return null
    const p = { ...first, alpha: 1 }
    let prev: Pose = first
    for (let j = 1; j < secs.length; j++) {
      const q: Pose = pose(j) || prev
      const w = seam[j] > 0 ? handed(j) : 0
      if (w > 0 && secs[j].enter === 'lift') {
        // the paper lifts away with the core's place on it: the core leaves that place as it stood, for the night's
        const a = pose(j - 1, true) || prev
        p.x = a.x + (q.x - a.x) * w; p.y = a.y + (q.y - a.y) * w; p.box = a.box + (q.box - a.box) * w
      } else if (w > 0) { p.x += (q.x - prev.x) * w; p.y += (q.y - prev.y) * w; p.box += (q.box - prev.box) * w }
      prev = q
    }
    return p
  }
  /** film: where the night shows (the backdrop is drawn only then); the core comes in front of the paper wherever
   *  paper is under it, and takes its ink there (not in Pulse's dark stage) */
  function filmLook(cx: number, cy: number, box: number, dt: number) {
    const sy = scrollY
    // the night stays night: the paper comes in over it as a sheet and lifts off it again, so nothing between them
    // needs to turn (look.dawn stays 0 on desktop)
    look.dawn = 0
    // the night shows where a night scene is on the screen and no paper covers it all
    look.backdrop = secs.some((s, j) => s.night && s.top < sy + vh && s.bottom > sy
      && !(s.enter === 'lift' && seam[j] <= 0) && !(secs[j + 1] && !secs[j + 1].night && seam[j + 1] >= 1))
    const r = box * 0.3 || 1, top = cy - r, bot = cy + r
    let day = 0, dark = 0
    for (const s of secs) {
      if (s.night) continue
      day += Math.max(0, Math.min(bot, s.bottom - sy) - Math.max(top, s.top - sy)) / (2 * r)
      if (!s.dark) continue
      const dx = s.dark.x - scrollX, dy = frameTop(s) + s.dark.y
      dark += (Math.max(0, Math.min(cx + r, dx + s.dark.w) - Math.max(cx - r, dx)) * Math.max(0, Math.min(bot, dy + s.dark.h) - Math.max(top, dy))) / (4 * r * r)
    }
    look.front = day > 0.02
    look.ink = lerp(look.ink, clamp(day - dark, 0, 1), 1 - Math.exp(-dt * 12))
  }

  // flow: which two stages the page is between, from the scroll position
  function flowRoute() {
    const sy = scrollY
    route.from = 0; route.to = 0; route.t = 0
    for (let j = 1; j < secs.length; j++) {
      const pj = (sy + vh * 0.85 - secs[j].top) / (vh * 0.7)
      if (pj >= 1) { route.from = route.to = j; route.t = 0; continue }
      if (pj > 0) { route.from = j - 1; route.to = j; route.t = pj }
      break
    }
  }
  /** the scene the core is with: on desktop the one across the middle of the screen */
  function sceneNow() {
    if (!FILM) return route.from === route.to ? route.to : route.t < 0.5 ? route.from : route.to
    for (let j = secs.length - 1; j > 0; j--) if (seam[j] >= 0.5) return j
    return 0
  }

  // ------------------------------------------------------------ live state
  const S = {
    ignite: RM ? 1 : 0, speak: 0, think: 0, flare: [0, 0, 0], dock: [0, 0, 0],
    roll: 0, hot: 0, charge: 0, ripple: [1, 0], spin: 0, spinV: 0,
    yaw: 0, pitch: 0, yawV: 0, pitchV: 0, lookYaw: 0, lookPitch: 0,
  }
  const cur = { x: 0, y: 0, box: 0, alpha: 0, ready: false }
  const ptr = { x: -1e4, y: -1e4 }
  on(window, 'pointermove', (e: PointerEvent) => { ptr.x = e.clientX; ptr.y = e.clientY }, ctx, { passive: true })
  on(document, 'pointerleave', () => { ptr.x = -1e4; ptr.y = -1e4 }, ctx)

  const BOOT = { on: false, t: 0 }
  function routeTarget(): Pose | null {
    if (FILM) return filmTarget()
    const { from, to, t } = route
    const a = pose(from), b = pose(to)
    if (from === to) return a ? { ...a, alpha: 1 } : null
    if (a && b) {
      const e = ease(t)
      return { x: lerp(a.x, b.x, e), y: lerp(a.y, b.y, e), box: lerp(a.box, b.box, e), alpha: 1 }
    }
    // one side has no place for the core (flow mode, between the stages): it fades where it is
    const p = a || b
    if (!p) return null
    return { ...p, alpha: a ? clamp(1 - t * 1.6, 0, 1) : clamp(t * 1.6 - 0.6, 0, 1) }
  }
  function target(): Pose | null {
    if (!BOOT.on) return routeTarget()
    const c = bootPose()
    const end = routeTarget()
    if (!end || BOOT.t <= 0) return c
    const e = ease(BOOT.t)
    return { x: lerp(c.x, end.x, e), y: lerp(c.y, end.y, e), box: lerp(c.box, end.box, e), alpha: lerp(1, end.alpha ?? 1, e) }
  }

  // ============================================================ the core, by hand
  const hit = $('#coreHit')
  function speakPulse() {
    gsap.fromTo(S, { speak: 0 }, { keyframes: [{ speak: 0.9, duration: 0.14 }, { speak: 0.35, duration: 0.22 }, { speak: 0.75, duration: 0.18 }, { speak: 0.3, duration: 0.24 }, { speak: 0.6, duration: 0.18 }, { speak: 0, duration: 0.6 }], overwrite: 'auto' })
  }
  function ripple(strength = 1, dur = 1.2) {
    gsap.fromTo(S.ripple, { 0: 0, 1: strength }, { 0: 1, duration: dur, ease: 'power2.out', overwrite: true })
  }
  function flareAll(peak = 1) {
    gsap.to(S.flare, { 0: peak, 1: peak, 2: peak, duration: 0.15, overwrite: true, onComplete: () => { gsap.to(S.flare, { 0: 0, 1: 0, 2: 0, duration: 1.2, ease: 'power2.in' }) } })
  }
  function think(dur = 1) { gsap.fromTo(S, { think: 1 }, { think: 0, duration: dur, ease: 'power2.out', overwrite: 'auto' }) }
  function ping() { ripple(1); think(1); speakPulse() }
  function burst() { ripple(1.7, 1.5); flareAll(1); think(1.4); speakPulse() }
  /** wind the core up (holding something) or let it go */
  function charge(v: number, dur: number) { return gsap.to(S, { charge: v, duration: dur, ease: v > 0 ? 'power1.in' : 'power2.out', overwrite: 'auto' }) }

  // hold the core and it winds up
  let chargeTl: gsap.core.Tween | null = null
  function beginCharge(onFull: () => void) {
    chargeTl?.kill()
    hit.classList.add('charging')
    chargeTl = gsap.to(S, { charge: 1, duration: 1.15, ease: 'power1.in', onComplete: () => { chargeTl = null; hit.classList.remove('charging'); onFull(); gsap.to(S, { charge: 0, duration: 0.7, delay: 0.1 }) } })
  }
  function cancelCharge() {
    if (!chargeTl) return
    chargeTl.kill(); chargeTl = null
    hit.classList.remove('charging')
    gsap.to(S, { charge: 0, duration: 0.45, ease: 'power2.out' })
  }
  function onCoreFull() {
    burst()
    if (secs[sceneNow()].final) hooks.onScan()
  }

  // drag turns the core only; nothing else on the page moves with it
  let press: { x0: number; y0: number; x: number; y: number; moved: boolean; hold: number } | null = null
  let dragging = false
  on(hit, 'pointerdown', (e: PointerEvent) => {
    if (e.button !== 0) return
    try { hit.setPointerCapture(e.pointerId) } catch { /* fine */ }
    press = { x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, moved: false, hold: 0 }
    if (secs[sceneNow()].final) press.hold = window.setTimeout(() => { if (press && !press.moved) beginCharge(onCoreFull) }, 280)
  }, ctx)
  on(hit, 'pointermove', (e: PointerEvent) => {
    if (!press) return
    const dx = e.clientX - press.x, dy = e.clientY - press.y
    press.x = e.clientX; press.y = e.clientY
    if (!press.moved && Math.hypot(e.clientX - press.x0, e.clientY - press.y0) > 6) {
      press.moved = true; dragging = true
      window.clearTimeout(press.hold); cancelCharge()
      root.classList.add('grabbing')
    }
    if (press.moved) {
      S.yaw += dx * 0.0068
      S.pitch = clamp(S.pitch + dy * 0.0045, -0.7, 0.7)
      S.yawV = dx * 0.0068 * 60; S.pitchV = dy * 0.0045 * 60
    }
  }, ctx)
  const endPress = () => {
    if (!press) return
    const p = press; press = null
    window.clearTimeout(p.hold)
    root.classList.remove('grabbing')
    dragging = false
    if (!p.moved) { if (chargeTl) cancelCharge(); else if (S.charge < 0.05) ping() }
  }
  on(hit, 'pointerup', endPress, ctx)
  on(hit, 'pointercancel', endPress, ctx)
  on(hit, 'keydown', (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ping() } }, ctx)

  // ------------------------------------------------------------ hero cards: dock, open, hold to approve
  const CALL = { p: 0 }
  function dock(i: number, delay = 0) {
    const card = cards[i]
    return gsap.timeline({ delay })
      .to(S.flare, { [i]: 1, duration: 0.18, ease: 'power2.out' }, 0)
      .to(S.flare, { [i]: 0, duration: 1.1, ease: 'power2.in' }, 0.25)
      .to(S.dock, { [i]: 1, duration: 0.7, ease: 'power3.out' }, 0.05)
      .add(() => { card.classList.remove('dim'); card.classList.add('docked') }, 0.12)
      .add(() => card.classList.remove('docked'), 1.6)
  }
  function openCard(card: HTMLElement, open: boolean) {
    cards.forEach((c) => {
      const o = c === card ? open : false
      c.classList.toggle('open', o)
      $('.pc-hit', c).setAttribute('aria-expanded', String(o))
    })
    if (open) { const i = +card.dataset.i!; gsap.fromTo(S.flare, { [i]: 0.9 }, { [i]: 0, duration: 1, ease: 'power2.in' }) }
  }
  function approve(card: HTMLElement) {
    card.classList.add('approved')
    hooks.hero?.made(true)
    burst()
    gsap.to(S, { charge: 0, duration: 0.6, delay: 0.1 })
  }
  cards.forEach((card) => {
    on($('.pc-hit', card), 'click', () => openCard(card, !card.classList.contains('open')), ctx)
    const hold = $('.hold', card), fill = $('.hold-fill', hold), lbl = $('.hold-lbl', hold)
    let tl: gsap.core.Timeline | null = null
    const start = (e?: Event) => {
      e?.preventDefault()
      if (card.classList.contains('approved') || tl) return
      hold.classList.add('holding'); lbl.textContent = 'Keep holding'
      tl = gsap.timeline({ onComplete: () => { tl = null; approve(card) } })
        .to(fill, { scaleX: 1, duration: 1.1, ease: 'none' }, 0)
        .to(S, { charge: 1, duration: 1.1, ease: 'power1.in' }, 0)
        .to(CALL, { p: 1, duration: 1.1, ease: 'none', onUpdate: () => hooks.hero?.call(CALL.p) }, 0)
    }
    const stop = () => {
      if (!tl) return
      tl.kill(); tl = null
      hold.classList.remove('holding'); lbl.textContent = 'Hold to approve'
      gsap.to(fill, { scaleX: 0, duration: 0.3, ease: 'power2.out' })
      CALL.p = 0; hooks.hero?.release()
      gsap.to(S, { charge: 0, duration: 0.4 })
    }
    on(hold, 'pointerdown', start, ctx)
    ;['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => on(hold, ev, stop, ctx))
    on(hold, 'keydown', (e: KeyboardEvent) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) start(e) }, ctx)
    on(hold, 'keyup', (e: KeyboardEvent) => { if (e.key === ' ' || e.key === 'Enter') stop() }, ctx)
    const done = $('.pc-done', card)
    let undo = $('.undo', done)
    if (!undo) {
      undo = document.createElement('button')
      undo.setAttribute('type', 'button'); undo.className = 'undo'; undo.textContent = 'Undo'
      done.appendChild(undo)
    }
    on(undo, 'click', () => {
      card.classList.remove('approved')
      hooks.hero?.made(cards.some((c) => c.classList.contains('approved')))
      hold.classList.remove('holding'); lbl.textContent = 'Hold to approve'
      gsap.set(fill, { scaleX: 0 })
    }, ctx)
  })

  // ------------------------------------------------------------ the engraved night behind the night scenes
  const visible = (i: number) => i >= 0 && secs[i].top < scrollY + vh && secs[i].bottom > scrollY
  function drawBackdrop(now: number, R: number) {
    if (!backdrop) return
    const shown = BOOT.on || (FILM ? look.backdrop : secs.some((s, i) => s.stage && s.night && visible(i)))
    if (shown !== bdShown) { bdShown = shown; bdCanvas.style.visibility = shown ? 'visible' : 'hidden' }
    if (!shown) return
    // the core's glow lights the night only (it fades as the night turns to paper)
    const stageK = FILM ? 1 - look.dawn : route.from === route.to ? +secs[route.to].stage : lerp(+secs[route.from].stage, +secs[route.to].stage, route.t)
    const ok = hooks.hero && !BOOT.on && visible(HERO)
    backdrop.render({
      core: { x: cur.x, y: cur.y, r: R },
      dawn: FILM ? look.dawn : 0,
      glow: S.ignite * stageK * cur.alpha,
      charge: S.charge, speak: S.speak, ripple: S.ripple, time: now,
      orbit: ok ? { ...hooks.hero!.orbit, k: hooks.hero!.orbit.k * (FILM ? 1 - handed(1) : route.from === HERO ? 1 - route.t : 0) * cur.alpha } : null,
      pointer: { x: ptr.x, y: ptr.y }, rm: RM,
    })
  }

  // ------------------------------------------------------------ frame loop
  const NO_BOUNDS = [-1e6, -1e6, -1e6, -1e6]
  let lastT = performance.now() / 1000, lastY = scrollY
  let frameN = 0
  let front = false
  function tick() {
    if (document.hidden) return
    const now = performance.now() / 1000
    const dt = Math.min(0.05, now - lastT); lastT = now
    if (FILM) seams(); else flowRoute()
    // the scroll's speed turns the lattice a little (it settles when the page stops); never with reduced motion
    const sv = (scrollY - lastY) / Math.max(dt, 1e-3); lastY = scrollY
    if (!RM) {
      S.spinV = lerp(S.spinV, clamp(sv / 2600, -1, 1) * 0.55, 1 - Math.exp(-dt * 3))
      S.spin += S.spinV * dt
    }

    if (!dragging) {
      S.yawV += (-S.yaw * 9 - S.yawV * 4.2) * dt; S.yaw += S.yawV * dt
      S.pitchV += (-S.pitch * 9 - S.pitchV * 4.6) * dt; S.pitch += S.pitchV * dt
    }
    // the core looks toward the pointer only while it rests in the hero
    const atHero = FILM ? seam[1] < 0.04 : route.from === route.to && route.to === HERO
    const lookOn = ptr.x > -1e3 && !BOOT.on && atHero
    S.lookYaw = lerp(S.lookYaw, lookOn ? clamp((ptr.x - cur.x) / (vw * 0.5), -1, 1) * 0.2 : 0, 1 - Math.exp(-dt * 2.5))
    S.lookPitch = lerp(S.lookPitch, lookOn ? clamp((ptr.y - cur.y) / (vh * 0.5), -1, 1) * 0.14 : 0, 1 - Math.exp(-dt * 2.5))

    if (!core) return
    const tg = target()
    let settled = route.from === route.to
    if (!tg) {
      cur.alpha = lerp(cur.alpha, 0, 1 - Math.exp(-dt * 10))
    } else {
      if (!cur.ready) { Object.assign(cur, tg); cur.ready = true }
      // a jump of the page (a link, the scrollbar, the End key): the core is simply there, it never streaks across
      if (FILM && !BOOT.on && Math.abs(tg.y - cur.y) > vh * 0.75) { cur.x = tg.x; cur.y = tg.y; cur.box = tg.box }
      // a soft follow: the scroll's own steps are smoothed, never added to
      const k = 1 - Math.exp(-dt * (FILM ? 11 : 14))
      const vx = (tg.x - cur.x) / Math.max(dt, 1e-3)
      cur.x = lerp(cur.x, tg.x, k); cur.y = lerp(cur.y, tg.y, k); cur.box = lerp(cur.box, tg.box, k)
      cur.alpha = lerp(cur.alpha, tg.alpha ?? 1, 1 - Math.exp(-dt * 12))
      S.roll = lerp(S.roll, clamp(-vx * 0.0002, -0.28, 0.28), 1 - Math.exp(-dt * 4))
      if (FILM) settled = Math.abs(tg.x - cur.x) + Math.abs(tg.y - cur.y) < 3
    }
    const box = Math.min(cur.box, SIZE), R = box * 0.259
    if (FILM) filmLook(cur.x, cur.y, box, dt)
    drawBackdrop(now, R)
    const vis = cur.alpha > 0.01 && box > 8 && cur.y + box / 2 > 0 && cur.y - box / 2 < vh && cur.x + box / 2 > 0 && cur.x - box / 2 < vw
    canvas.style.visibility = vis ? 'visible' : 'hidden'
    // on paper the core sits in front of the scene (the day scenes are opaque); at night it sits behind the content.
    // On the scrolling page the one paper stage (Pulse) brings it in front the same way.
    const f = !BOOT.on && (FILM ? look.front : !secs[sceneNow()].night && secs[sceneNow()].stage)
    if (f !== front) { front = f; canvas.classList.toggle('front', f) }

    const docked = vis && !BOOT.on && settled && cur.alpha > 0.6
    if (docked) {
      const rh = R * (vw <= 640 ? 0.85 : 1.1)
      hit.style.display = 'block'
      hit.style.transform = `translate3d(${(cur.x - rh).toFixed(1)}px, ${(cur.y - rh).toFixed(1)}px, 0)`
      hit.style.width = hit.style.height = (rh * 2).toFixed(1) + 'px'
    } else {
      hit.style.display = 'none'
    }
    if (!vis) return

    S.hot = lerp(S.hot, docked && Math.hypot(ptr.x - cur.x, ptr.y - cur.y) < R * 1.5 ? 1 : 0, 1 - Math.exp(-dt * 8))

    // the canvas never changes size here: it is moved (every frame, so it keeps pace with the page), and the orb is
    // drawn at `box` inside it
    const cl = cur.x - SIZE / 2, ct = cur.y - SIZE / 2
    canvas.style.transform = `translate3d(${cl.toFixed(2)}px, ${ct.toFixed(2)}px, 0)`
    // small and still (the day mark) with nobody touching it, the orb draws at 30 fps
    frameN++
    const resting = docked && box < 220 && S.hot < 0.05 && S.charge < 0.01 && Math.abs(S.yawV) < 0.01 && Math.abs(S.spinV) < 0.02 && S.speak < 0.01
    if (resting && frameN % 2) return
    core.view(box)
    // between two places it is thinking
    let travel = 0
    if (FILM) { for (let j = 1; j < secs.length; j++) if (seam[j] > 0 && seam[j] < 1) travel = Math.sin(Math.PI * seam[j]) * secs[j].apart * 0.6 }
    else if (!settled) travel = Math.sin(Math.PI * route.t)
    core.render(now, {
      ignite: S.ignite, speak: S.speak, think: Math.max(S.think, travel * 0.8), listen: S.hot * 0.8,
      lod: clamp((380 - box) / 180, 0, 1), alpha: cur.alpha, inkTop: BOOT.on ? 0 : FILM ? look.ink : 0, bounds: NO_BOUNDS, flare: S.flare, spinOffset: S.spin,
      tiltX: S.pitch + S.lookPitch, tiltY: S.yaw + S.lookYaw, roll: S.roll,
      hot: S.hot, mouse: { x: ptr.x - cl, y: ptr.y - ct }, charge: S.charge, ripple: S.ripple,
    })
  }

  // ------------------------------------------------------------ start-up (JARVIS boot)
  function startup() {
    // no start-up (reduced motion, a deep link, or no WebGL): the hero is simply there
    if (RM || !root.classList.contains('booting') || !core) { root.classList.add('boot-live'); root.classList.remove('booting'); settleHero(); hooks.hero?.settle(); hooks.onBooted(); return }
    root.classList.add('boot-live')
    window.scrollTo(0, 0)
    BOOT.on = true; BOOT.t = 0
    canvas.style.zIndex = '90'
    const lines = $$('#bootLog li'), pctEl = $('#bootPct'), barEl = $('#bootBar')
    const pct = { v: 0 }
    const tl = gsap.timeline({ onComplete: endBoot, defaults: { ease: 'power3.out' }, paused: true })
    tl.to('.b-seed', { scale: 0.3, opacity: 0, duration: 0.5, ease: 'power2.in' }, 0.2)
      .to(S, { ignite: 1, duration: 2.5, ease: 'power2.inOut' }, 0.15)
      .to(S, { think: 1, duration: 0.45, ease: 'sine.inOut' }, 0.7)
      .to(S, { think: 0, duration: 0.6, ease: 'sine.inOut' }, 2.2)
      .to(pct, { v: 100, duration: 2.6, ease: 'power1.inOut', onUpdate: () => { pctEl.textContent = String(Math.round(pct.v)).padStart(3, '0'); barEl.style.transform = `scaleX(${(pct.v / 100).toFixed(3)})` } }, 0.15)
    lines.forEach((li, i) => {
      const at = 0.2 + i * 0.4
      tl.to(li, { opacity: 1, y: 0, duration: 0.7 }, at).add(() => li.classList.add('ok'), at + 0.3)
    })
    // the last line becomes "Ready": it dips and comes back with the new word, rather than changing in place
    const last = lines[lines.length - 1]
    tl.to(last, { opacity: 0, duration: 0.16, ease: 'power1.in' }, 2.62)
      .add(() => { last.textContent = 'Ready' }, 2.78)
      .to(last, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 2.78)
      .add(() => flareAll(1), 2.75)
      .fromTo('#bootGreet', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 1.0 }, 2.8)
      .add(() => { ripple(1.2, 1.3); speakPulse() }, 2.8)
      // the hand-over: the start-up's words drift up and fade while the core glides to its place in the hero
      .to(['.b-top', '.b-log', '.b-pct', '.b-bar'], { opacity: 0, duration: 0.6, ease: 'power2.inOut' }, 3.75)
      .to('#bootGreet', { opacity: 0, y: -10, duration: 0.6, ease: 'power2.inOut' }, 3.75)
      .add(() => root.classList.add('boot-out'), 4.05)
      .to('.b-bg', { opacity: 0, duration: 1.0, ease: 'sine.inOut' }, 3.85)
      .to(BOOT, { t: 1, duration: 1.35, ease: 'none' }, 3.8)
      .fromTo('#nav', { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out', clearProps: 'opacity,transform' }, 4.1)
    // the hero's entrance starts once the start-up screen has cleared, and the core hands out each proposal as it arrives
    hooks.hero?.intro(tl, 4.1)
    tl.add(() => cards.forEach((_, i) => dock(i, hooks.hero?.CARD_AT[i] ?? 0.25 + i * 0.45)), 4.1)
    // the core draws once (its shaders compile) while the seed still pulses, and the start-up begins on the next frames
    requestAnimationFrame(() => requestAnimationFrame(() => tl.play()))
    // skipping cuts the start-up short, never the hero's entrance
    const HANDOVER = 3.8
    const skip = () => { if (BOOT.on && tl.time() < HANDOVER) tl.seek(HANDOVER) }
    on($('#boot'), 'click', skip, ctx)
    on(window, 'keydown', (e: KeyboardEvent) => { if (e.key === 'Escape') skip() }, ctx)
    on(window, 'wheel', skip, ctx, { passive: true })
    on(window, 'touchmove', skip, ctx, { passive: true })
  }
  function endBoot() {
    BOOT.on = false
    canvas.style.zIndex = ''
    root.classList.remove('booting', 'boot-out')
    hooks.onBooted()
  }
  function settleHero() {
    S.ignite = 1
    cards.forEach((c, i) => { c.classList.remove('dim'); S.dock[i] = 1 })
  }

  function destroy() {
    chargeTl?.kill()
    core?.dispose()
    backdrop?.dispose()
    canvas.style.cssText = ''
    bdCanvas.style.cssText = ''
    root.classList.remove('bd')
    hit.style.display = 'none'
  }

  return {
    layout, measure, tick, startup, destroy,
    ripple, flareAll, speakPulse, think, burst, charge, ping, S,
    isBooting: () => BOOT.on,
  }
}
