// The page's client-side experience: one entry point, one teardown.
// One clock drives everything (GSAP's ticker): the smoothed scroll first, then the hero's type and the core. The page
// scrolls the normal way; the film (film.ts) holds each scene on screen and gives it its ScrollTriggers. On desktop
// each scene's own timeline follows the scroll (stages.ts); on a phone each scene plays its sequence on view
// (scenes.ts).
import { gsap } from 'gsap'
import { createCompanion } from './companion'
import { createFilm, type Film } from './film'
import { createHero } from './hero'
import { createKinetic } from './kinetic'
import { createScenes } from './scenes'
import { createStages } from './stages'
import { canHover, on, prefersReducedMotion, type Ctx, type Mode } from './util'

export function startExperience() {
  const ac = new AbortController()
  const root = document.documentElement
  const mode: Mode = root.classList.contains('film') ? 'film' : root.classList.contains('flow') ? 'flow' : 'static'
  const ctx: Ctx = { signal: ac.signal, rm: prefersReducedMotion(), hover: canHover(), mode }
  let teardown = () => {}

  const gctx = gsap.context((self) => {
    let film: Film | null = null
    const hero = createHero(ctx)
    hero.layout()
    const companion = createCompanion(ctx, {
      onScan: () => (stages ?? scenes)?.scan(),
      // the film's ScrollTriggers are made once the page can scroll, inside this context so they are reverted with it
      onBooted: () => self.add(() => { film?.measure(); film?.start() }),
      hero,
    })
    const stages = mode === 'film' ? createStages(ctx, { core: companion }) : null
    const scenes = stages ? null : createScenes(ctx, { core: companion })
    film = createFilm(ctx, { companion, scenes, stages, kinetic: createKinetic(ctx) })
    companion.layout()

    // geometry cache: debounced on resize, refreshed when fonts change layout
    let t = 0
    on(window, 'resize', () => { window.clearTimeout(t); t = window.setTimeout(() => { hero.layout(); companion.layout(); film?.measure() }, 120) }, ctx)
    document.fonts?.ready.then(() => { hero.fit(); hero.layout(); film?.measure(); film?.refresh() })

    const frame = () => { hero.update(); companion.tick() }
    gsap.ticker.add(frame)
    companion.startup()

    teardown = () => {
      gsap.ticker.remove(frame)
      window.clearTimeout(t)
      companion.destroy()
    }
  })

  return () => {
    ac.abort()
    teardown()
    gctx.revert()
  }
}
