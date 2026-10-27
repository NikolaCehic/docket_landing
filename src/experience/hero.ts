// The hero: two giant lines split around the core, the proposals on its orbit.
// - layout(): places the orbit rings and, on wide screens, the cards on the orbit (once per resize, never per frame);
// - intro(): the entrance, played when the start-up hands over; settle() is the same end state without motion;
// - update(): per frame, writes only transforms: the lines part as you scroll away (following the scroll), the type
//   sits behind the core and shifts a few pixels against the pointer (the cards never move); on desktop the hero is
//   held on screen while the next scene rises over it, so the lines part in place;
// - call(): holding to approve fills the outlined "Your call."; made() turns it solid or empties it on undo.
import { gsap } from 'gsap'
import { RISE } from './kinetic'
import { $, $$, clamp, on, type Ctx } from './util'

const TILT = -14 * Math.PI / 180
// where each proposal sits on the orbit (radians from the orbit's major axis, before the tilt)
const ANGLE = [-1.2, 0.7, Math.PI + 0.6]

export type HeroOrbit = { rx: number; ry: number; angle: number; k: number }

export function createHero(ctx: Ctx) {
  const sec = $('#top'), type = $('#hbType'), l1 = $('#hbL1'), l1in = $('.hb-in', l1)
  const svg = $<SVGSVGElement>('#hbL2 svg'), tO = $<SVGTextElement>('text.o', svg), tF = $<SVGTextElement>('text.f', svg)
  const clipRect = $<SVGRectElement>('#hbFillClip rect'), l2 = $('#hbL2'), edgeR = $<SVGRectElement>('rect.edge', svg)
  let bx0 = 0
  const rw = $('#hbRw'), rings = $<SVGSVGElement>('#hbRings'), r1 = $<SVGEllipseElement>('.r1', rings), r2 = $<SVGEllipseElement>('.r2', rings)
  const cards = $$('.pcard', sec)
  const fades = [$('.hb-cta', sec), $('.hb-copy', sec), $('.hb-chip', sec)]
  let vw = innerWidth, vh = innerHeight, H = vh, textW = 0, wide = true
  const orbit: HeroOrbit = { rx: 0, ry: 0, angle: TILT, k: 1 }

  // ---------------------------------------------------------------- "Your call." is SVG text sized to its own bounds
  function fit() {
    tO.setAttribute('x', '0'); tF.setAttribute('x', '0')
    let bb: DOMRect
    try { bb = tO.getBBox() } catch { return }
    if (!bb.width) return
    const pad = 4
    svg.setAttribute('viewBox', `${(bb.x - pad).toFixed(1)} ${(bb.y - pad).toFixed(1)} ${(bb.width + pad * 2).toFixed(1)} ${(bb.height + pad * 2).toFixed(1)}`)
    textW = bb.width + pad * 2
    svg.style.height = `calc(var(--hb-fs) * ${((bb.height + pad * 2) / 200).toFixed(3)})`
    bx0 = bb.x - pad
    edgeR.setAttribute('y', (bb.y - pad).toFixed(1)); edgeR.setAttribute('height', (bb.height + pad * 2).toFixed(1))
    clipRect.setAttribute('x', (bb.x - pad).toFixed(1)); clipRect.setAttribute('y', (bb.y - pad).toFixed(1))
    clipRect.setAttribute('height', (bb.height + pad * 2).toFixed(1))
    clipRect.setAttribute('width', String(callP * textW))
  }

  // ---------------------------------------------------------------- the orbit: rings and (wide screens) cards on it
  function layout() {
    vw = innerWidth; vh = innerHeight
    H = sec.querySelector<HTMLElement>('.hb-stage')!.offsetHeight || vh
    wide = vw > 980
    const tablet = !wide && vw > 640 && vh > 500 // (a phone held sideways lists its proposals, like a phone)
    orbit.rx = vw * (wide ? 0.33 : 0.44); orbit.ry = H * (wide ? 0.21 : 0.16)
    const cy = H * (wide ? 0.5 : tablet ? 0.52 : 0.43), cx = vw / 2
    // phones: "Your call." sits just above the line and the buttons, however many lines the line takes
    sec.style.setProperty('--hb-foot', ($('#hbFoot', sec).offsetHeight || 0) + 'px')
    rings.setAttribute('viewBox', `0 0 ${vw} ${H}`)
    rings.style.height = H + 'px'
    for (const [el, k] of [[r1, 1], [r2, 1.3]] as const) {
      el.setAttribute('cx', String(cx)); el.setAttribute('cy', String(cy))
      el.setAttribute('rx', String(orbit.rx * k)); el.setAttribute('ry', String(orbit.ry * k * 1.02))
      el.setAttribute('transform', `rotate(${(TILT * 180 / Math.PI).toFixed(2)} ${cx} ${cy})`)
    }
    cards.forEach((c) => { c.style.left = ''; c.style.top = '' })
    if (!wide && !tablet) return
    const gut = Math.max(24, (vw - 1240) / 2 + 24)
    const coreR = ($('.core-slot', sec).offsetWidth || 400) * 0.48 // the core's visible radius
    cards.forEach((c, i) => {
      if (tablet && i === 2) return // on tablets the third proposal waits just below the hero
      const a = tablet ? [-0.9, Math.PI + 0.9][i] : ANGLE[i], x0 = Math.cos(a) * orbit.rx, y0 = Math.sin(a) * orbit.ry
      const px = cx + x0 * Math.cos(TILT) - y0 * Math.sin(TILT), py = cy + x0 * Math.sin(TILT) + y0 * Math.cos(TILT)
      const w = c.offsetWidth || 290, h = c.offsetHeight || 92
      const right = px > cx
      // the card's near edge sits on the orbit, kept inside the gutters
      let left = right ? px - 28 : px - w + 28
      let top = py - h / 2
      if (i === 0) {
        // the lead card sits beside "Your agents.", never on it; on narrower screens it drops below the line
        const l1r = l1.offsetLeft + l1.offsetWidth, l1b = l1.offsetTop + l1.offsetHeight
        if (l1r + 28 + w <= vw - gut + 8) { left = Math.max(left, l1r + 28); top = l1.offsetTop + l1.offsetHeight * 0.18 }
        else { top = Math.max(top, l1b + 12); left = Math.max(left, cx + coreR * 1.1) }
      }
      // on wide screens cards never sit on the core itself (tablets are too narrow: there they may cross its halo)
      if (!tablet) {
        if (right) left = Math.max(left, cx + coreR * 1.05)
        else left = Math.min(left, cx - coreR * 1.05 - w)
      }
      if (!right && i === 2) left = gut // the left card shares the page's left margin
      left = clamp(left, gut - 8, vw - gut - w + 8)
      c.style.left = left.toFixed(0) + 'px'
      c.style.top = clamp(top, 76, H - h - 24).toFixed(0) + 'px'
    })
  }

  // ---------------------------------------------------------------- entrance and its end state
  // The start-up hands over to the hero as a sequence, not a reveal: the orbit spins up out of the core, "Your agents."
  // rises letter by letter out of its mask, "Your call." is written in outline, the core hands out the three proposals
  // one by one (each comes out of the core's side), then the line, the sync status and the buttons arrive.
  const DASH = 1800
  const letters = $$('.hb-c', l1in)
  const lede = $('.hb-copy .lede', sec), sync = $('.hb-sync', sec), btns = $$('.hb-cta .btn', sec)
  const chip = $('.hb-chip', sec)
  /** when each proposal arrives, from the start of the entrance (the core flares as it hands each one out) */
  const CARD_AT = [0.95, 1.2, 1.45]
  /** sets the entrance's first frame now (the page is still under the start-up screen) and plays it at `at` */
  function intro(tl: gsap.core.Timeline, at: number) {
    gsap.set(letters, { yPercent: 118, rotate: 6, opacity: 0, transformOrigin: '0% 100%' })
    gsap.set(rings, { opacity: 0, scale: 0.55, transformOrigin: '50% 50%' })
    gsap.set(tO, { strokeDasharray: DASH, strokeDashoffset: DASH })
    gsap.set(cards, { opacity: 0 })
    gsap.set(lede, { clipPath: 'inset(0% 0% 100% 0%)', y: 18 })
    gsap.set([sync, chip], { opacity: 0 })
    gsap.set(btns, { opacity: 0, y: 16 })
    tl.add(play, at)
  }
  function play() {
    sec.classList.add('in')
    const t = gsap.timeline()
    t.to(rings, { opacity: 1, scale: 1, duration: 1.7, ease: 'expo.out', clearProps: 'opacity,scale,transform' }, 0)
      .fromTo(r1, { strokeDashoffset: 0 }, { strokeDashoffset: -280, duration: 2.6, ease: 'power3.out' }, 0)
      // each letter rises from the first frame and fades up as it clears its word, then settles for a long moment
      .to(letters, { yPercent: 0, rotate: 0, opacity: 1, duration: 1.5, ease: RISE, stagger: 0.045, clearProps: 'transform,opacity' }, 0.15)
      .to(tO, { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut', clearProps: 'strokeDasharray,strokeDashoffset' }, 0.55)
    // each proposal comes out of the core: it starts nearer the core and opens from the side that faces it
    const cx = vw / 2, cy = H * 0.5
    cards.forEach((c, i) => {
      const r = c.getBoundingClientRect(), placed = wide && getComputedStyle(c).position === 'absolute'
      const dx = r.left + r.width / 2 - cx, dy = r.top + r.height / 2 - cy, d = Math.hypot(dx, dy) || 1
      const from = placed
        ? { opacity: 0, x: (-dx / d) * 44, y: (-dy / d) * 44, clipPath: dx > 0 ? 'inset(0% 100% 0% 0% round 12px)' : 'inset(0% 0% 0% 100% round 12px)' }
        : { opacity: 0, y: 18 }
      t.fromTo(c, from, { opacity: 1, x: 0, y: 0, clipPath: 'inset(0% 0% 0% 0% round 12px)', duration: 1.0, ease: 'expo.out', clearProps: 'opacity,transform,clipPath' }, CARD_AT[i] ?? 1.5)
    })
    t.to(lede, { clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 1.1, ease: 'expo.out', clearProps: 'clipPath,transform' }, 1.05)
      .to(sync, { opacity: 1, duration: 0.7, ease: 'power2.out', clearProps: 'opacity' }, 1.35)
      .to(btns, { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08, clearProps: 'opacity,transform' }, 1.4)
      .fromTo(chip, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.8, ease: 'expo.out', clearProps: 'opacity,transform' }, 1.9)
  }
  function settle() {
    gsap.set(l1in, { yPercent: 0 }); gsap.set(rings, { opacity: 1, scale: 1 })
    gsap.set(fades, { clearProps: 'all' })
  }

  // ---------------------------------------------------------------- "Your call." fills while you hold to approve
  let callP = 0
  const callState = { p: 0 }
  function draw() {
    callP = callState.p
    clipRect.setAttribute('width', (callP * textW).toFixed(1))
    edgeR.setAttribute('x', (bx0 + callP * textW - 46).toFixed(1)) // the lit leading edge of the sweep, inside the glyphs
    l2.classList.toggle('holding', callP > 0.002 && callP < 0.998 && !l2.classList.contains('made'))
  }
  function call(p: number) { callState.p = p; draw() }
  function made(on: boolean) {
    l2.classList.toggle('made', on)
    gsap.to(callState, { p: on ? 1 : 0, duration: on ? 0.25 : 0.6, ease: 'power2.out', onUpdate: draw, overwrite: true })
  }
  function release() { if (!l2.classList.contains('made')) gsap.to(callState, { p: 0, duration: 0.35, ease: 'power2.out', onUpdate: draw, overwrite: true }) }

  // ---------------------------------------------------------------- per frame: depth against the pointer, parting on scroll
  const ptr = { x: 0, y: 0, tx: 0, ty: 0 }
  on(window, 'pointermove', (e: PointerEvent) => { ptr.tx = (e.clientX / vw) * 2 - 1; ptr.ty = (e.clientY / vh) * 2 - 1 }, ctx, { passive: true })
  // how far the two lines have parted follows the scroll
  let last = ''
  function update() {
    const sy = scrollY
    if (sy > H * 1.2) return
    ptr.x += (ptr.tx - ptr.x) * 0.06; ptr.y += (ptr.ty - ptr.y) * 0.06
    const hp = clamp(sy / (H * 0.85), 0, 1), e = hp * hp * (3 - 2 * hp)
    const dx = ctx.rm ? 0 : -ptr.x * 7, dy = ctx.rm ? 0 : -ptr.y * 4
    const key = `${dx.toFixed(1)},${dy.toFixed(1)},${e.toFixed(3)}`
    if (key === last) return
    last = key
    type.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`
    if (!ctx.rm) {
      // the lines part as you leave: "Your agents." up and away, "Your call." down and away, both fade (on a scrolling
      // page "Your call." also holds back against the scroll)
      const drop = ctx.mode === 'film' ? H * 0.06 * e : wide ? Math.min(sy, H) * 0.6 * e : 0
      l1.style.transform = `translate3d(${(-e * vw * 0.06).toFixed(1)}px, ${(-e * H * 0.05).toFixed(1)}px, 0)`
      l1.style.opacity = clamp(1 - e * 1.4, 0, 1).toFixed(3)
      l2.style.transform = `translate3d(${(e * vw * 0.07).toFixed(1)}px, ${drop.toFixed(1)}px, 0)`
      l2.style.opacity = clamp(1 - e * 1.8, 0, 1).toFixed(3)
      rw.style.opacity = (1 - e * 0.9).toFixed(3)
    }
    orbit.k = 1 - e
  }

  document.fonts?.ready.then(fit)
  fit()
  // the line and the cards are placed by script; until then they wait unseen (no start-up screen covers them without motion)
  requestAnimationFrame(() => document.documentElement.classList.add('hero-ready'))
  return { layout, intro, CARD_AT, settle, call, made, release, update, fit, orbit }
}
export type Hero = ReturnType<typeof createHero>
