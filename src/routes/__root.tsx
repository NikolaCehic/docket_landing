import type { ReactNode } from 'react'
import { Outlet, createRootRoute, HeadContent, Scripts } from '@tanstack/react-router'
import appCss from '../styles/global.css?url'
import { PageHero, PageShell } from '../components/page/PageShell'
import { Section } from '../components/page/ContentPage'

// Set before first paint, so the start-up screen covers the page from the first frame. Only the home page is the film:
// every other page (the legal pages) is a plain document and gets `page`.
// The experience mode is chosen here too, because it decides the page's layout:
// - `film` (desktop with a fine pointer): each scene is a stage held on screen while you scroll through it, on a page
//   that scrolls the normal way;
// - `flow` (phones, tablets, touch): a normal scrolling page whose scenes play as they come into view;
// - `static` (reduced motion): a normal page with everything at rest.
// The page always opens at the top: a #hash in the address bar is dropped before the browser can jump to it, and kept
// in data-hash so the page can go there itself once it is ready (a link from another page to /#agents, /#first-scan).
// Links to parts that moved to their own pages (/#contact, /#faq, /#data) go to those pages; /#workflows and
// /#templates land on the plays and workflows scene.
// Such a deep link skips the start-up. If the experience never loads (blocked script, old browser), the page falls back
// to `static` after 8 s.
const BOOT_SCRIPT = `try{var d=document.documentElement;if(location.pathname!=='/'){d.classList.add('page')}else{if('scrollRestoration' in history)history.scrollRestoration='manual';if(location.hash){var h=decodeURIComponent(location.hash.slice(1));h={workflows:'plays',templates:'plays'}[h]||h;var mv={contact:'/contact',faq:'/faq',data:'/amazon-data'}[h];if(mv){location.replace(mv)}else{d.setAttribute('data-hash',h);history.replaceState(null,'',location.pathname+location.search)}}var mm=function(q){return window.matchMedia(q).matches};if(mm('(prefers-reduced-motion: reduce)')){d.classList.add('static')}else{d.classList.add('motion',mm('(pointer: fine) and (min-width: 1024px) and (min-height: 620px)')?'film':'flow');if(!d.hasAttribute('data-hash'))d.classList.add('booting');setTimeout(function(){if(!d.classList.contains('boot-live')){d.classList.remove('booting','motion','film','flow');d.classList.add('static')}},8000)}}}catch(e){}`

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      { name: 'theme-color', content: '#09090B' },
      { title: 'Docket · Agents that run your Amazon business, and ask before they act' },
      { name: 'description', content: 'AI agents watch your Amazon ads, stock, prices and listings around the clock, find what’s costing you money, and fix it the moment you approve. Every fix comes with its evidence and is measured after.' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFound,
})

/** any address the site doesn't have: say so plainly, and offer the way back */
function NotFound() {
  return (
    <PageShell cta={false}>
      <PageHero k="Page not found" title="This page isn’t here." lede="The address may be mistyped, or the page has moved. Everything on the site is one step from here.">
        <div className="ctas"><a className="btn primary" href="/">Back to the home page</a><a className="btn ghost" href="/contact?topic=question">Talk to a person</a></div>
      </PageHero>
      <div className="wrap pg-secs">
        <Section s={{ id: 'pages', k: 'Pages', title: 'Where to next.', blocks: [{ type: 'links', items: [
          { t: 'How it works', d: 'From the first scan to a measured result.', href: '/how-it-works' },
          { t: 'Pricing', d: 'Three plans, every agent on each.', href: '/pricing' },
          { t: 'Questions', d: 'Straight answers about agents, data and plans.', href: '/faq' },
        ] }] }} />
      </div>
    </PageShell>
  )
}

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
