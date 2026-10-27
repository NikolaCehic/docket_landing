// the Pulse scene's screens: the four states of Pulse with the Radiant Core (PulseOrbI_Desktop), each .dframe
// (1280x800 css px) without its sidebar, at dpr 2, with the site's copy rules applied: node tools/pulsecap.cjs public/film/system <pngdir>   (boards on :8811)
const { chromium } = require('playwright-core'); const fs = require('fs')
const [OUT, PNG] = process.argv.slice(2); fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(PNG, { recursive: true })
const NAMES = ['pulse-idle', 'pulse-listen', 'pulse-think', 'pulse-speak']
const REP = [['Good morning, Uros.', 'Good morning, Agent.'], ['Uros', 'Agent'], ['Ads API synced', 'Ads synced'], ['SP-API synced', 'Seller Central synced'], ['Ads API, ', ''], [', SP-API ', ', Seller Central, '], ['SP-API', 'Seller Central'], ['Ads API', 'Amazon Ads'], ['Search Query Performance late', 'Search terms report late']]
;(async () => {
  const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
  const pg = await b.newPage({ viewport: { width: 2700, height: 1600 }, deviceScaleFactor: 2 })
  await pg.goto('http://localhost:8811/PulseOrbI_Desktop.dc.html'); await pg.waitForTimeout(4000)
  const left = await pg.evaluate((REP) => {
    const texts = () => { const o = [], w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); while (w.nextNode()) o.push(w.currentNode); return o }
    for (const [a, c] of REP) for (const t of texts()) if (t.textContent.includes(a)) t.textContent = t.textContent.split(a).join(c)
    return texts().filter((t) => /API|Uros|limit|co-sign|mandate/i.test(t.textContent) && t.parentElement.closest('.dframe')).map((t) => t.textContent.trim().slice(0, 80))
  }, REP)
  if (left.length) console.log('STILL', left)
  const side = await pg.evaluate(() => { const f = document.querySelector('.dframe'), n = f.querySelector('nav, aside, [class*="side"]'); const r = f.getBoundingClientRect(), q = n ? n.getBoundingClientRect() : null; return q ? Math.round(q.right - r.left) : 0 })
  console.log('sidebar ends at', side)
  const conv = await b.newPage()
  const frames = await pg.$$('.dframe')
  for (let i = 0; i < 4; i++) {
    await frames[i].scrollIntoViewIfNeeded(); await pg.waitForTimeout(1500)
    const r = await frames[i].boundingBox()
    const clip = { x: r.x + side, y: r.y, width: r.width - side, height: r.height }
    const buf = await pg.screenshot({ clip })
    fs.writeFileSync(`${PNG}/${NAMES[i]}.png`, buf)
    const d = await conv.evaluate(async ([src]) => { const im = new Image(); im.src = src; await im.decode(); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; c.getContext('2d').drawImage(im, 0, 0); return c.toDataURL('image/webp', 0.82) }, ['data:image/png;base64,' + buf.toString('base64')])
    const w = Buffer.from(d.split(',')[1], 'base64'); fs.writeFileSync(`${OUT}/${NAMES[i]}.webp`, w)
    console.log(NAMES[i], Math.round(clip.width), 'x', Math.round(clip.height), Math.round(w.length / 1024) + 'KB')
  }
  await b.close()
})()
