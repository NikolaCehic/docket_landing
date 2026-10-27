// the system scenes' screens: the board's content area (no sidebar), 1224x900 css px at dpr 2, with copy fixes,
// written as webp: node tools/syscap.cjs public/film/system [names]   (boards served on :8811)
const { chromium } = require('playwright-core'); const fs = require('fs');
const OUT = process.argv[2]; fs.mkdirSync(OUT, { recursive: true });
const SPECS = [
  { n: 'play-describe', b: 'NewPlay1_Describe' },
  { n: 'play-try', b: 'NewPlay3_Try' },
  { n: 'play-hub', b: 'StrategyStudio' },
  { n: 'play-on', b: 'NewPlay4_TurnOn' },
  { n: 'wf-build', b: 'NewWorkflow3_Build' },
  { n: 'wf-try', b: 'NewWorkflow4_Try' },
  { n: 'wf-list', b: 'Workflows', rep: [['waiting on Dana', 'waiting on you'], ['Dana, 14h 19m at Launch bids', '14h 19m at Launch bids']] },
  { n: 'memory', b: 'RulesMemory', rep: [['needs co-sign', 'waiting in Command'], ['reorder 2,400 units, needs co-', 'reorder 2,400 units of Trail Bottle']] },
]
const only = process.argv.slice(3)
;(async () => {
  const br = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
  const conv = await br.newPage()
  for (const s of SPECS) {
    if (only.length && !only.includes(s.n)) continue
    const pg = await br.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
    await pg.goto(`http://localhost:8811/${s.b}.dc.html`); await pg.waitForTimeout(2600)
    const left = await pg.evaluate(({ rep = [], hide = [] }) => {
      const texts = () => { const out = [], w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); while (w.nextNode()) out.push(w.currentNode); return out }
      for (const [a, b] of rep) for (const t of texts()) if (t.textContent.includes(a)) t.textContent = t.textContent.split(a).join(b)
      for (const [start, stop] of hide) {
        const t = texts().find((x) => x.textContent.trim().startsWith(start))
        if (!t) continue
        let el = t.parentElement
        while (el.parentElement && !el.parentElement.textContent.includes(stop)) el = el.parentElement
        el.style.display = 'none'
      }
      const bad = /co-sign|SP-API|Ads API|\/sp\/|\/reporting|POST |example data|Dana,/i, hits = []
      for (const t of texts()) { if (!bad.test(t.textContent)) continue; const r = t.parentElement.getBoundingClientRect(); if (r.width && r.top < 900 && r.bottom > 0 && r.left > 216) hits.push(t.textContent.trim().slice(0, 80)) }
      return hits
    }, s)
    if (left.length) console.log(s.n, 'STILL:', left)
    const buf = await pg.screenshot({ clip: { x: 216, y: 0, width: 1224, height: 900 } })
    const d = await conv.evaluate(async ([src]) => { const im = new Image(); im.src = src; await im.decode(); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; c.getContext('2d').drawImage(im, 0, 0); return c.toDataURL('image/webp', 0.8) }, ['data:image/png;base64,' + buf.toString('base64')])
    const w = Buffer.from(d.split(',')[1], 'base64'); fs.writeFileSync(`${OUT}/${s.n}.webp`, w); 
    console.log(s.n, Math.round(w.length / 1024) + 'KB'); await pg.close()
  }
  await br.close()
})()
