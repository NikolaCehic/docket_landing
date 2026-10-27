// full-viewport captures as webp: node tools/shots2.cjs <outdir> <vw> <vh> <dpr> <q> <name...>
const { chromium } = require('playwright-core'); const fs = require('fs');
(async () => {
  const [out, vw, vh, dpr, q, ...names] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  const conv = await b.newPage();
  for (const n of names) {
    const pg = await b.newPage({ viewport: { width: +vw, height: +vh }, deviceScaleFactor: +dpr });
    await pg.goto(`http://localhost:8811/${n}.dc.html`); await pg.waitForTimeout(1800);
    const txt = await pg.evaluate(() => document.body.innerText);
    if (/Uros/.test(txt)) console.log('NAME FOUND in', n);
    const buf = await pg.screenshot();
    const d = await conv.evaluate(async ([src, q]) => { const im = new Image(); im.src = src; await im.decode(); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; c.getContext('2d').drawImage(im, 0, 0); return c.toDataURL('image/webp', q) }, ['data:image/png;base64,' + buf.toString('base64'), +q]);
    const w = Buffer.from(d.split(',')[1], 'base64'); fs.writeFileSync(`${out}/${n}.webp`, w); console.log(n, Math.round(w.length / 1024) + 'KB');
    await pg.close();
  }
  await b.close();
})();
