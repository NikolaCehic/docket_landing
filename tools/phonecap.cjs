// the phone scene's screens: 390x844 at dpr 3, webp: node tools/phonecap.cjs public/film/phone [names]   (boards on :8811)
const { chromium } = require('playwright-core'); const fs = require('fs');
const OUT = process.argv[2]; fs.mkdirSync(OUT, { recursive: true });
const N = process.argv.slice(3).length ? process.argv.slice(3) : ['MobileChange1_Say', 'MobileChange2_Read', 'MobileChange3_Match', 'MobileChange4_Approve', 'MobileChange5_Done']
;(async () => {
  const br = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
  const conv = await br.newPage()
  for (const n of N) {
    const pg = await br.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 })
    await pg.goto(`http://localhost:8811/${n}.dc.html`); await pg.waitForTimeout(2500)
    const bad = await pg.evaluate(() => { const re = /limit|mandate|Marco|co-sign|goes to|routed|SP-API|Ads API/i, out = []; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); while (w.nextNode()) { const t = w.currentNode; const r = t.parentElement.getBoundingClientRect(); if (re.test(t.textContent) && r.width && r.top < 844 && r.bottom > 0) out.push(t.textContent.trim().slice(0, 90)) } return out })
    if (bad.length) console.log(n, 'FLAGS', bad)
    const hold = await pg.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /Hold to approve/i.test(x.textContent)); if (!b) return null; const r = b.getBoundingClientRect(); return { l: (r.left / 390 * 100).toFixed(2), t: (r.top / 844 * 100).toFixed(2), w: (r.width / 390 * 100).toFixed(2), h: (r.height / 844 * 100).toFixed(2), txt: b.textContent.trim() } })
    if (hold) console.log(n, 'hold', JSON.stringify(hold))
    const buf = await pg.screenshot()
    const d = await conv.evaluate(async ([src]) => { const im = new Image(); im.src = src; await im.decode(); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; c.getContext('2d').drawImage(im, 0, 0); return c.toDataURL('image/webp', 0.8) }, ['data:image/png;base64,' + buf.toString('base64')])
    fs.writeFileSync(`${OUT}/${n}.webp`, Buffer.from(d.split(',')[1], 'base64')); console.log('ok', n); await pg.close()
  }
  await br.close()
})()
