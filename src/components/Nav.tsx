import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { HOME_LINKS, PAGE_LINKS } from '../data/nav'

// The bar. On the home page its links scroll to the scenes; on every other page they go to the site's pages, and
// the current page is marked. Below 1180px the links, sign in and the first scan move into the menu, so every part of
// the site stays one tap away on a phone.
export function Nav({ home = true, current }: { home?: boolean; current?: string }) {
  const LINKS = home ? HOME_LINKS : PAGE_LINKS
  const here = (href: string) => (!home && href === current ? 'page' : undefined)
  const [open, setOpen] = useState(false)
  const btn = useRef<HTMLButtonElement>(null), panel = useRef<HTMLDivElement>(null)

  // the menu's state lives on <html> (the film sets the bar's own classes), so the film and the page can see it
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('menu-open', open)
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); btn.current?.focus() } }
    const onDown = (e: PointerEvent) => { const t = e.target as Node; if (!panel.current?.contains(t) && !btn.current?.contains(t)) setOpen(false) }
    const onWide = () => { if (innerWidth > 1180) setOpen(false) }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    window.addEventListener('resize', onWide)
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onDown); window.removeEventListener('resize', onWide) }
  }, [open])

  // any choice in the menu closes it (the link itself is handled by the page: a scroll or a sheet)
  const choose = (e: MouseEvent) => { if ((e.target as Element).closest('a')) setOpen(false) }

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className="nav on-dark" id="nav">
        <div className="nav-in">
          <a className="brand" href={home ? '#top' : '/'} aria-label={home ? 'Docket, back to top' : 'Docket, home'}><span className="mark" aria-hidden="true">D</span><span className="wm">Docket</span>
            <svg className="navmark" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10.5" fill="none" stroke="currentColor" strokeOpacity=".35" strokeWidth="1"></circle><circle cx="12" cy="12" r="7" fill="none" stroke="#10B981" strokeWidth="1.2" strokeDasharray="3 2"></circle><circle cx="12" cy="12" r="3.2" fill="#10B981"></circle><circle cx="12" cy="12" r="1.3" fill="#ECFDF5"></circle></svg>
          </a>
          <nav aria-label="Sections">
            {LINKS.map((l) => <a key={l.href} href={l.href} aria-current={here(l.href)} className={here(l.href) ? 'cur' : undefined}>{l.label}</a>)}
          </nav>
          <div className="nav-r">
            <a className="link" href="#sign-in" data-sheet="signin">Sign in</a>
            <a className="btn sm primary" href="#first-scan" data-sheet="scan">Get your first scan</a>
            <button className="nav-tog" type="button" ref={btn} aria-expanded={open} aria-controls="navMenu" aria-label={open ? 'Close menu' : 'Menu'} onClick={() => setOpen((v) => !v)}>
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path className="t1" d="M4 8.5h16" /><path className="t2" d="M4 15.5h16" /></svg>
            </button>
          </div>
        </div>
        <div className="nav-menu" id="navMenu" ref={panel} inert={!open} onClick={choose}>
          <nav aria-label="Menu">
            {LINKS.map((l) => <a key={l.href} href={l.href} aria-current={here(l.href)}>{l.label}<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M6 3.5L10.5 8 6 12.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></a>)}
            <a href="/contact?topic=question">Talk to a person<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M6 3.5L10.5 8 6 12.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></a>
          </nav>
          <div className="nav-menu-cta">
            <a className="btn primary" href="#first-scan" data-sheet="scan">Get your first scan</a>
            <a className="btn ghost" href="#sign-in" data-sheet="signin">Sign in</a>
          </div>
        </div>
      </header>
    </>
  )
}
