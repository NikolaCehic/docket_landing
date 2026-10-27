// The headlines as each scene comes in (halfway in on desktop, into view on a phone; film.ts says when): the eyebrow
// arrives, each letter rises out of its word and fades up as it clears the edge, then the line under the title follows.
// One GSAP timeline per scene, on the same clock as the core, so the type moves in step with it. In time, never
// scrubbed by the scroll, and short, so it is read as the scene settles. The letters' hidden pose is in the CSS (so
// nothing flashes before the script runs); this plays them in and hands them back to it.
import { gsap } from 'gsap'
import { $$, type Ctx } from './util'

/** a soft start and a long settle: the letters move from the first frame without jumping */
export const RISE = 'power3.out'

export function createKinetic(ctx: Ctx) {
  const live = new Map<HTMLElement, gsap.core.Timeline>()
  const parts = (scene: HTMLElement) => ({ eb: $$('.eyebrow', scene), chars: $$('.kt .kc', scene), subs: $$('.sub', scene) })

  function play(scene: HTMLElement) {
    if (ctx.rm) return
    reset(scene)
    const { eb, chars, subs } = parts(scene)
    if (!chars.length) return
    // long titles keep the same overall pace: the wave across them never takes much more than 0.4 s
    const each = Math.min(0.022, 0.4 / chars.length)
    const tl = gsap.timeline({ defaults: { ease: RISE }, onComplete: () => { live.delete(scene) } })
    tl.fromTo(eb, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.7, clearProps: 'opacity,transform' }, 0)
      .fromTo(chars, { yPercent: 118, rotation: 6, opacity: 0, transformOrigin: '0% 100%' },
        { yPercent: 0, rotation: 0, opacity: 1, duration: 1.05, stagger: { each }, clearProps: 'transform,opacity' }, 0.04)
      .fromTo(subs, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1, clearProps: 'opacity,transform' }, 0.3)
    live.set(scene, tl)
  }
  /** the scene has left (gone back down off the screen on desktop, out of view on a phone): stop, and let the CSS hold
   *  the letters hidden again until the next visit */
  function reset(scene: HTMLElement) {
    live.get(scene)?.kill(); live.delete(scene)
    const { eb, chars, subs } = parts(scene)
    gsap.set([...eb, ...chars, ...subs], { clearProps: 'opacity,transform' })
  }
  return { play, reset }
}
export type Kinetic = ReturnType<typeof createKinetic>
