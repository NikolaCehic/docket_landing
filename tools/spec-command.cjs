const rows = Array.from({ length: 11 }, (_, i) => ({ name: 'row' + i, sel: 'main section .qrow', nth: i }))
module.exports = {
  screen: 'Main', vw: 1440, vh: 900, dpr: 2, out: '/Users/nikolacehic/Desktop/Docket/website/public/film/command', full: true,
  base: { hide: ['main section:first-child > div:nth-child(2) > *', 'main section:nth-child(2) > div:first-child > *', 'main section:nth-child(2) > div:last-child'] },
  layers: [
    { name: 'gh0', rect: [216, 98, 387, 28] }, { name: 'gh1', rect: [216, 339, 387, 28] },
    ...rows, { name: 'grp', rect: [216, 812, 387, 76] },
    { name: 'title', rect: [604, 54, 828, 74] },
    { name: 'change', rect: [604, 128, 828, 246] }, { name: 'expect', rect: [604, 374, 828, 94] },
    { name: 'why', rect: [604, 468, 828, 208] }, { name: 'checks', rect: [604, 676, 828, 117] },
    { name: 'details', rect: [604, 793, 828, 46] }, { name: 'bar', rect: [604, 839, 828, 53] },
  ],
  after: {
    act: async (pg) => { await pg.click('button.btn.bprimary'); await pg.waitForTimeout(1600); await pg.evaluate(() => { const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) { if (n.nodeValue.includes('Sent to Amazon Ads')) n.nodeValue = n.nodeValue.replace('Sent to Amazon Ads', 'Sent to Amazon') } }) }, wait: 300, suffix: '-after', full: true,
    layers: [ { name: 'bar', rect: [604, 832, 828, 60] }, { name: 'head', rect: [216, 8, 600, 46] }, { name: 'tabs', rect: [216, 54, 387, 44] }, { name: 'gh0', rect: [216, 98, 387, 28] }, { name: 'navcmd', rect: [10, 173, 199, 28] }, { name: 'tail', rect: [216, 829, 387, 63] } ],
  },
}
