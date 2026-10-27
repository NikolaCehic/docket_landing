// Layer capture: renders a console design screen and saves a base plate plus separately positioned layers,
// so the website can animate real UI (rows arriving, panels building, state changes) from real screenshots.
// usage: node tools/layercap.cjs tools/spec-command.cjs   (spec exports { screen, vw, vh, dpr, out, prep?, base: {hide:[]}, layers:[{name, sel|rect, nth?}], after?: {act, layers:[]} })
const { chromium } = require('playwright-core'); const fs = require('fs'); const path = require('path');
(async () => {
  const spec = require(path.resolve(process.argv[2]));
  const out = spec.out; fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  const pg = await b.newPage({ viewport: { width: spec.vw, height: spec.vh }, deviceScaleFactor: spec.dpr || 2 });
  const conv = await b.newPage();
  async function webp(buf, q = 0.9) {
    const d = await conv.evaluate(async ([src, q]) => { const im = new Image(); im.src = src; await im.decode(); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; c.getContext('2d').drawImage(im, 0, 0); return c.toDataURL('image/webp', q) }, ['data:image/png;base64,' + buf.toString('base64'), q])
    return Buffer.from(d.split(',')[1], 'base64')
  }
  await pg.goto(`http://localhost:8811/${spec.screen}.dc.html`);
  await pg.waitForTimeout(2000);
  if (spec.prep) await pg.evaluate(spec.prep);
  await pg.waitForTimeout(300);
  const manifest = { w: spec.vw, h: spec.vh, layers: {} };
  async function box(l) {
    if (l.rect) return { x: l.rect[0], y: l.rect[1], width: l.rect[2], height: l.rect[3] };
    return pg.evaluate(([s, n]) => { const e = document.querySelectorAll(s)[n || 0]; if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height } }, [l.sel, l.nth]);
  }
  async function shoot(list, suffix = '') {
    for (const l of list) {
      const r = await box(l); if (!r) { console.log('missing', l.name); continue }
      const clip = { x: Math.max(0, r.x), y: Math.max(0, r.y), width: Math.min(r.width, spec.vw - Math.max(0, r.x)), height: Math.min(r.height, spec.vh - Math.max(0, r.y)) };
      if (clip.width < 2 || clip.height < 2) { console.log('offscreen', l.name); continue }
      const buf = await webp(await pg.screenshot({ clip }), l.q || 0.9);
      const f = `${l.name}${suffix}.webp`; fs.writeFileSync(`${out}/${f}`, buf);
      manifest.layers[l.name + suffix] = { x: +(clip.x / spec.vw * 100).toFixed(3), y: +(clip.y / spec.vh * 100).toFixed(3), w: +(clip.width / spec.vw * 100).toFixed(3), h: +(clip.height / spec.vh * 100).toFixed(3), px: [Math.round(clip.x), Math.round(clip.y), Math.round(clip.width), Math.round(clip.height)], kb: Math.round(buf.length / 1024) };
    }
  }
  // layers first (page intact), then the base with those parts hidden
  await shoot(spec.layers);
  if (spec.full) { fs.writeFileSync(`${out}/full.webp`, await webp(await pg.screenshot(), 0.88)) }
  await pg.evaluate((h) => { for (const s of h) document.querySelectorAll(s).forEach((e) => { e.style.visibility = 'hidden' }) }, spec.base.hide);
  await pg.waitForTimeout(150);
  const bb = await webp(await pg.screenshot(), 0.88); fs.writeFileSync(`${out}/base.webp`, bb); manifest.base = Math.round(bb.length / 1024);
  if (spec.after) {
    await pg.evaluate((h) => { for (const s of h) document.querySelectorAll(s).forEach((e) => { e.style.visibility = '' }) }, spec.base.hide);
    await spec.after.act(pg); await pg.waitForTimeout(spec.after.wait || 1500);
    await shoot(spec.after.layers, spec.after.suffix || '');
    if (spec.after.full) fs.writeFileSync(`${out}/full-after.webp`, await webp(await pg.screenshot(), 0.88));
  }
  fs.writeFileSync(`${out}/manifest.json`, JSON.stringify(manifest, null, 1));
  console.log(JSON.stringify(manifest));
  await b.close();
})();
