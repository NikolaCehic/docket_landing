export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
export const DEG = 180 / Math.PI
/** desktop: how far a held scene settles back (its scale) while the next one comes in over it, p from 0 to 1. The
 *  film scales the frame by it and the core, sitting in that frame, follows (companion.ts) */
export const recede = (p: number) => 1 - 0.03 * p * p * (3 - 2 * p)

export function $<T extends Element = HTMLElement>(s: string, r: ParentNode = document): T {
  return r.querySelector(s) as T
}
export function $$<T extends Element = HTMLElement>(s: string, r: ParentNode = document): T[] {
  return [...r.querySelectorAll(s)] as T[]
}

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
export const canHover = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches

/** Everything the experience creates hangs off one AbortSignal, so a single abort() tears it down. */
/** mode: 'film' (desktop: full-screen scenes held on screen in turn, on a page that scrolls the normal way; the scroll
 *  drives each scene's own timeline), 'flow'
 *  (phones and touch: a plain scrolling page whose scenes play as they come into view) or 'static' (reduced motion:
 *  everything at rest). Chosen before first paint (routes/__root.tsx). */
export type Mode = 'film' | 'flow' | 'static'
export type Ctx = { signal: AbortSignal; rm: boolean; hover: boolean; mode: Mode }

export function on<K extends keyof HTMLElementEventMap>(
  el: EventTarget, type: K | string, fn: (e: any) => void, ctx: Ctx, opts: AddEventListenerOptions = {},
) {
  el.addEventListener(type, fn as EventListener, { ...opts, signal: ctx.signal })
}
