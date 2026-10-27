# Docket landing page: motion and polish rules (researched 2026-10-14)

Method note. Guides were fetched directly. Award galleries (Awwwards, Godly, Land-book, Lapa Ninja, Mobbin) returned no motion specs or jury notes, so for the ten reference sites I downloaded each live homepage's CSS and JS and read the real values. Those are tagged **[measured]**. Layout/visual descriptions come from page-to-text fetches and are **[inferred]**. Emil Kowalski's exact curves come from a third-party digest of his course (claudeskills.info), flagged **(digest)**. Measured JS covers only initially loaded bundles, not lazy chunks.

## A. Rulebook

### Entrance / reveal
1. Reveals travel 4-20 px plus opacity, not 40-100 px. Vercel 8, Attio/Cursor/ElevenLabs 4-12, Resend 16, Raycast hero 20, Stripe bento 30 (largest), Raycast cards 50 (outlier). Use 8-16 px for text, up to 24 px for big panels. [measured] https://raycast.com https://stripe.com https://vercel.com
2. Play once when about 30% in view and never reverse. Attio and ElevenLabs use `viewport:{once:true, amount:.3}`. In GSAP use `once:true`. [measured] https://attio.com https://gsap.com/docs/v3/Plugins/ScrollTrigger/
3. Reveal duration 0.4-0.75 s (Cursor .42, Clerk .6, Raycast/ElevenLabs .7, Stripe .75). Reveals are rare events, so they can be slower than UI feedback. [measured] https://stripe.com
4. Stagger siblings of one group only, and drive it from a CSS var (`--delay`, `--reveal-delay`). Cap the total at about 400 ms (cap is inferred). [measured] https://raycast.com
5. Blur in reveals is small and on text only: Clerk 2 px, Mercury 4 px, Attio nav 8 px, Raycast 10 px, ElevenLabs words 12 px. Emil: `filter: blur(2px)` bridges states. [measured] https://emilkowal.ski/ui/7-practical-animation-tips
6. Set initial hidden state in CSS, not after hydration, and use transforms so there is no layout shift (CLS target 0.1 or less). If a scrubbed trigger starts at the page top, use `start:"clamp(top bottom)"` or it jumps on load. [web.dev, GSAP] https://web.dev/articles/cls https://gsap.com/resources/st-mistakes/

### Easing and duration
7. Ease-out for anything entering. Ease-in only for exits (ease-in feels sluggish on entrances). `ease` is fine for things that move while staying on screen. https://www.joshwcomeau.com/animation/css-transitions/ https://emilkowal.ski/ui/7-practical-animation-tips
8. Replace built-in keywords with strong custom curves; the built-ins are "usually not strong enough". Real values in use: `cubic-bezier(.25,1,.5,1)` (Stripe, 44 uses; Cursor's "ease-out-spring"), `(.23,1,.32,1)` (Raycast, Emil digest), `(.22,1,.36,1)` (Cursor, Clerk, Attio, Resend), `(.16,1,.3,1)` (Raycast, Stripe). Pick one for the page. [measured] https://emilkowal.ski/ui/7-practical-animation-tips
9. Drawers and sheets: `(.32,.72,0,1)` at 500 ms. Linear and Vercel both ship exactly this. On-screen movement: `(.77,0,.175,1)` (Emil digest). [measured] https://linear.app
10. UI feedback stays under 300 ms: press 100-160, tooltip 125-200, dropdown 150-250, modal 200-500. 180 ms feels more responsive than 400 ms. https://emilkowal.ski/ui/you-dont-need-animations https://claudeskills.info/zh/skills/pproenca/dot-skills/emilkowal-animations/
11. Hover is asymmetric: fast in, slower out (Comeau). Linear: popovers appear instantly, fade out in about 150 ms. https://www.joshwcomeau.com/animation/css-transitions/
12. Springs are for gestures with momentum, not page furniture. Resend's UI springs use `duration:.2, bounce:0`. CSS `linear()` springs are about 88% supported, so keep a bezier fallback. https://www.joshwcomeau.com/animation/linear-timing-function/

### What to animate vs not
13. Animate only to clarify cause and effect or for deliberate delight. https://vercel.com/design/guidelines
14. Never animate from `scale(0)`. Start at 0.9-0.97 (Emil .93-.95; Linear menus .9, dialogs .96-.98; Resend .97). https://emilkowal.ski/ui/7-practical-animation-tips
15. Never `transition: all`. List properties. Set `transform-origin` where the motion physically starts. https://vercel.com/design/guidelines
16. Do not animate high-frequency or keyboard-initiated actions. "I removed motion from core interactions and suddenly felt like I was moving much faster." https://rauno.me/craft/interaction-design https://emilkowal.ski/ui/you-dont-need-animations
17. Press feedback is `scale(.97)`. Hover is a color or border change, or at most `scale(1.01-1.02)` or a 2-4 px nudge (Raycast 2-3 px, Vercel/Attio 1.01, Cursor 1.02). [measured] https://emilkowal.ski/ui/7-practical-animation-tips
18. Do not animate `background-color` or `box-shadow` across big areas on scroll. Both repaint, and GSAP says filter and box-shadow are expensive. https://gsap.com/resources/get-started/

### Interaction: when UI should NOT be interactive or movable
19. "No dead zones: if interactive-looking, make it interactive". The converse holds: if it does nothing, give it no hover lift, no pointer cursor, no drag. https://vercel.com/design/guidelines
20. Any drag, swipe or tilt gesture needs tap/click and keyboard alternatives, and text selection must be disabled during drag. Skip the gesture on marketing visuals. https://vercel.com/design/guidelines
21. No hover-tilt or 3D parallax: none of the ten reference sites has a tilt rule (no `rotate3d`; hover transforms top out at 1.02). [measured, CSS only] https://linear.app https://stripe.com
22. Carousels use native `scroll-snap` (Raycast `scroll-snap-align:start`) with buttons, not custom drag physics. [measured] https://raycast.com
23. Animations must be interruptible. Use CSS transitions (they retarget) for state changes, and keyframes only for one-shot entrances. "Imagine if it were an animation that you had to wait for!" https://rauno.me/craft/interaction-design
24. Delay the first tooltip, make the following ones instant. https://emilkowal.ski/ui/7-practical-animation-tips

### Scroll-linked and pinning
25. Default to triggered-once. Scrub only for a single storytelling moment. Do not combine `scrub` and `toggleActions`. Scrub `duration` is ignored; lengthen `end` instead. `scrub:1` smooths jitter. https://gsap.com/resources/st-mistakes/ https://gsap.com/docs/v3/Plugins/ScrollTrigger/
26. Never animate the pinned element, only its children. Pin breaks under transformed or `will-change: transform` ancestors, and under `content-visibility`. https://gsap.com/docs/v3/Plugins/ScrollTrigger/
27. Create triggers top-to-bottom, or set `refreshPriority`. Pin spacing shifts everything below it. https://gsap.com/resources/st-mistakes/
28. Never put a ScrollTrigger on a tween nested in a timeline; put it on the timeline. Never use two `to()` tweens on one property with different triggers (cached start values cause jumps). Use `fromTo` or `immediateRender:false`. https://gsap.com/resources/st-mistakes/
29. Call `ScrollTrigger.refresh()` after fonts, images or content change layout. Use function-based `end` with `invalidateOnRefresh:true`. Kill/revert triggers on route change (SPA). https://gsap.com/resources/st-mistakes/ https://github.com/greensock/gsap-skills
30. Remove CSS `scroll-behavior:smooth`. It breaks refresh and causes pin jumps. On mobile the address bar fires resize events that jump pinned sections. https://gsap.com/community/forums/topic/31038-scrolltrigger-automatically-jumps-when-pinned-section-not-in-view-on-mobile/
31. `fastScrollEnd:true` finishes animations when the user flings past, preventing overlap. `anticipatePin:1` cures pin repaint glitches. `normalizeScroll` is a last resort. https://gsap.com/docs/v3/Plugins/ScrollTrigger/

### Performance and stability
32. Only `transform` and `opacity` stay on the compositor. Never animate top/left/width/height/margin. https://web.dev/articles/stick-to-compositor-only-properties-and-manage-layer-count
33. `will-change` only on elements actively animating, removed after. Each layer costs GPU memory. Never blanket-apply it. https://developer.mozilla.org/en-US/docs/Web/CSS/will-change https://web.dev/articles/stick-to-compositor-only-properties-and-manage-layer-count
34. Do not animate `filter: blur` on large layers; it is a per-frame convolution that blows the 16 ms budget. Crossfade pre-blurred copies, and promote the parent wrapper. Fixed `backdrop-filter` bars over scrolling content cause scroll lag. https://developer.chrome.com/blog/animated-blur/
35. Batch DOM reads then writes, with no layout reads (`getBoundingClientRect`) in render or tick. Use `gsap.quickTo` for pointer-follow. https://vercel.com/design/guidelines https://github.com/greensock/gsap-skills
36. Prefer CSS over WAAPI over JS libraries when the main thread is busy. Test with CPU throttling, iOS Low Power Mode and Safari. https://vercel.com/design/guidelines
37. WebGL: one canvas, render on demand or pause off-screen, debounce resize (ElevenLabs orb: 100 ms), recover from context loss, reuse geometries and materials, scale pixel ratio down on weak devices. https://github.com/elevenlabs/ui https://r3f.docs.pmnd.rs/advanced/scaling-performance

### Reduced motion and accessibility
38. Remove movement and keep opacity fades (fades are safe). Write motion inside `prefers-reduced-motion: no-preference` so unsupported browsers get none. Reference sites do this heavily: Stripe 85 reduced-motion rules, Linear 37 [measured]. https://www.joshwcomeau.com/react/prefers-reduced-motion/
39. In GSAP wrap everything in `gsap.matchMedia()` with `(prefers-reduced-motion: no-preference)`. Contexts auto-revert when the query stops matching. https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/
40. Auto-playing motion longer than 5 s needs a pause control. Muted decorative loops stop under reduced motion. Parallax counts as motion animation under WCAG 2.3.3. https://vercel.com/design/guidelines https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html

## B. Patterns that read as AI-generated / template

1. **Everything fades up the same way** (24-60 px, 0.6-0.8 s, every card, every section). References mix: static sections, 4-8 px nudges, a few set-pieces. Uniform easing and rhythm is itself the tell. https://www.925studios.co/blog/ai-slop-web-design-guide
2. **Tilt-on-hover and 3D parallax cards.** Zero of ten reference sites use them (measured). Motion that responds to nothing meaningful reads as decoration.
3. **Draggable carousels and fanned phones.** No reference does this (inferred). Movable furniture implies function that is not there (rule 19).
4. **Blur + glow + gradient blobs**, indigo/purple gradients, ambient float/pulse loops. "The blue-to-purple gradient is the single loudest AI tell." https://www.925studios.co/blog/ai-slop-design-tells https://dev.to/alanwest/why-every-ai-built-website-looks-the-same-blame-tailwinds-indigo-500
5. **Hover states that do nothing, or buttons that snap** instead of easing, and "motion for decoration rather than function". https://www.925studios.co/blog/ai-slop-web-design-guide
6. **Three identical rounded cards, 16 px radius everywhere, soft 0.1-opacity shadows**, centered hero, thin line icons, "Build faster. Ship smarter." copy. "The cure for AI slop is constraint, because the slop comes from absence." https://axe-web.com/insights/ai-website-design-sameness/
7. **Pinned or scrubbed storyboard for content that is not a story** (feature lists sliding in). It adds jank risk for no meaning (rules 25-31).
8. **Fake product UI that floats and rotates** instead of real, legible, static UI with one purposeful state change (see Linear, Attio below).

## C. Reference breakdowns

**linear.app** [measured + inferred]. Hero is typographic, then live HTML/CSS product mockups (issue view, board, roadmap, diffs). No GSAP or Framer detected in initial JS and no section-reveal keyframes found, so most sections are effectively static. Motion budget goes to UI states: dialogs `scale(.96-.98)`, context menus `.9`, drawers 500 ms `(.32,.72,0,1)`, hovers 120-200 ms. Signature: an isometric layer stack that lifts about 32 px over .7 s on `(.32,.72,0,1)` with per-layer delay, plus small dot-grid loops stepped with `steps(1,end)` over 2.8-3.2 s at 0.3-1 opacity. 37 reduced-motion rules.

**resend.com** [measured]. Hero text rises 16 px over 1 s (`ease-in-out`); hero visual scales .97 to 1 over 1 s with a .1 s delay; header drops -16 px; an embedded Spline/WebGL object scales .7 to 1. Popovers slide 4-5 px. UI springs `bounce:0`. Ambient dot loops are slow and low contrast. Static: most content below the hero (copy and code blocks).

**raycast.com** [measured]. Hero lines `fade-in-up` 20 px, 1 s, the second line delayed 1 s. Extension cards `slideIn` 50 px + 10 px + `scale(.98)`, .7 s, `(.215,.61,.355,1)`, each with a `--delay`. A blur(10px) to 0 text fade at .5 s ease-out. Hover nudges 2-3 px, popovers 2 px. Carousel is CSS `scroll-snap`. Backdrop blur 10 px on overlays and cards only. Signature: animated keyboard visual [inferred]. No hover tilt.

**vercel.com** [measured]. Smallest travel in the set: slide-up-fade 8 px, nav -8 px, modal 20 px. Hover `scale(1.01)`. Drawers `(.32,.72,0,1)`. 17 reduced-motion rules. Typographic hero with restrained graphics [inferred; the fetched page was an inner page]. Leaves most sections static.

**stripe.com** [measured]. Bento items `translate3d(0,30px,0)` to 0, .75 s, `(.2,0,0,1)`, per-item `--reveal-delay`. `(.25,1,.5,1)` is the house easing (44 uses). Hover is a 3 px arrow nudge. CSS `animation-timeline: scroll()` appears only in nav/dialog logic, not scroll scenes. Hero is an animated gradient [inferred]. 85 reduced-motion rules, the most of the set.

**attio.com** [measured + inferred]. Framer Motion with `once:true, amount:.3`, `y:4`, ease `[.33,1,.68,1]`, .3 s. Panel enters on the nav only: 200 px + blur(8px). Product shown as static mockups (records, pipeline, dashboards) with small looped details (radar dot, `translate 8px, scale .96`). Hover `scale(1.01)`.

**clerk.com** [measured]. Heading letter-reveal with blur(2px), ease `[.22,1,.36,1]` at .6 s, x 10 / y 6-8 px elsewhere, a gentle float (-0.75 rem). Product shown mostly as text and code components [inferred]. Few animations, short.

**mercury.com** [measured]. Light, tab content shifts 5 px with opacity, small blur(4px) on exits, easings `(.16,0,.13,1)` and `(.2,1,.4,1)` over .15-.5 s. Hero is a start/end-frame image sequence of the dashboard [inferred]. Everything else static.

**cursor.com** [measured]. Motion lib with reveals at y 4-12 px, mobile chat enter 12 px, .42 s `(.22,1,.36,1)`, durations .12-.25 s, `--ease-out-spring: cubic-bezier(.25,1,.5,1)`. Hero shows a live-looking IDE/CLI composite instead of floating cards [inferred]. 14-20 px backdrop blur only on chrome.

**elevenlabs.io (orb)** [measured + primary source]. Fade-translate .7 s `(0,0,.2,1)`; word reveal with blur(12px) + `scale(.92-.95)` on key headings. The Orb is open source (React Three Fiber + fragment shader: Perlin-noise texture, 7 ovals in polar coords, 2 volume-reactive rings, 4-colour ramp). `uTime += delta*.5`; input/output volume eased at 0.2 per frame; colour lerp 0.08; speed 0.1-1.0 from volume; states idle / listening / talking with sine modulation; resize debounce 100 ms; WebGL context-restore. The homepage fetch did not show an orb in the hero, so treat it as a component reference. https://github.com/elevenlabs/ui

**OpenAI voice orb.** No technical documentation found. Help centre lists four status labels (Connecting / Listening / Recording / Speaking) under a single audio-reactive blue circle. https://help.openai.com/articles/8400625

## D. Top 10 recommendations for Docket

1. **One reveal helper, not per-element tweens.** `opacity 0 to 1, y 12 to 0` (16 for headings), 0.6 s, `(.22,1,.36,1)`, `once:true`, start about "top 85%", applied to section groups, with sibling stagger 60-80 ms capped at 400 ms. Rules 1-4, 8.
2. **Delete tilt, draggable carousels, phone fans.** Replace them with static compositions; hover is border/colour change or 1.01 at most. Use `scroll-snap` if a rail is needed. Rules 17, 19-22, B2-3.
3. **At most one scrubbed or pinned moment, ideally zero.** If kept: pin the wrapper, animate children, create triggers top-to-bottom, drop `scroll-behavior:smooth`. Rules 25-31.
4. **Fix the flakiness root causes first:** duplicate tweens on one property, ScrollTriggers nested in timelines, wrong creation order, no `refresh()` after fonts/images, no cleanup on TanStack route change (use `useGSAP`/`gsap.context`), initial hidden state set after hydration. Rules 6, 27-29, 35.
5. **One motion token set.** `--ease-out:(.22,1,.36,1)`, `--ease-drawer:(.32,.72,0,1)`, durations 150 / 250 / 600 ms; one curve per page. Rules 7-10.
6. **Product UI = real, legible, static panels with one purposeful state change** (an agent chip flips, a row appears), triggered once, no float or parallax. Pattern follows Linear/Attio. Rules 13, 16.
7. **Hero orb as one WebGL canvas with a state machine** (idle / listening / working / done), exponential smoothing (about 0.2 and 0.08), `delta`-based time, pause off-screen, pixel ratio clamped, resize debounced 100 ms, a static poster under reduced motion, no pointer-tilt. Rules 37, 39; ElevenLabs orb.
8. **Strip ambient loops, glow blobs and large blur.** Blur at most 8-10 px on text or small elements; `backdrop-filter` only on the sticky header. Rules 5, 18, 34, B4.
9. **Dark/light alternation as hard section cuts**, not a scroll-scrubbed background colour morph (it repaints; inferred). Break the uniform rhythm: some sections get no reveal at all. Rules 18, B1.
10. **Gate and test.** `gsap.matchMedia()` for `no-preference`; opacity-only fallback; CPU 4x throttle; Safari plus iOS Low Power; mobile address-bar resize; CLS at most 0.1. Rules 36, 38-40.
