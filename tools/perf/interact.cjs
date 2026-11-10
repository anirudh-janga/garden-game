const { chromium } = require('playwright');
const mode = process.env.MODE || '';
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, acceptDownloads: true });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('pageerror', e.message));
  page.on('console', (m) => { if (m.type() === 'error') console.log('console', m.text()); });
  await page.addInitScript(() => { if (!sessionStorage.getItem('x')) { localStorage.clear(); sessionStorage.setItem('x', '1'); } });
  await page.goto(`http://localhost:${process.env.PORT || 4173}/?debug&q=6&season=summer${mode}`, { timeout: 600000 });
  await page.waitForFunction(() => !document.getElementById('loader'), null, { timeout: 600000 });
  const inWorker = await page.evaluate(() => window.inWorker);
  const W = () => (inWorker ? page.workers()[0] : page);
  const ev = (f, a) => W().evaluate(f, a);
  console.log('inWorker', inWorker);
  const cdp = await ctx.newCDPSession(page);
  const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : pts.map(([x, y], i) => ({ x, y, id: i, radiusX: 10, radiusY: 10 })) });
  const drag = async (from, to, steps = 20) => { await touch('touchStart', [from]); for (let i = 1; i <= steps; i++) { await touch('touchMove', [[from[0] + (to[0] - from[0]) * i / steps, from[1] + (to[1] - from[1]) * i / steps]]); await page.waitForTimeout(50); } await touch('touchEnd', []); await page.waitForTimeout(600); };
  const actions = () => page.evaluate(() => window.store.actions.length);
  const tool = async (name) => { await page.evaluate((n) => document.querySelector(`.tool[data-tool="${n}"]`).click(), name); await page.waitForTimeout(400); };
  // 1) camera pan with one finger in Look around
  const d0 = await ev(() => ({ x: rig.target.x, z: rig.target.z }));
  await drag([200, 500], [120, 400]);
  const d1 = await ev(() => ({ x: rig.target.x, z: rig.target.z }));
  console.log('pan moved camera', Math.hypot(d1.x - d0.x, d1.z - d0.z).toFixed(2), 'm; actions', await actions());
  // 2) path stroke
  await tool('path');
  console.log('tool in world', await ev(() => toolbar.tool));
  await drag([80, 560], [300, 600], 30);
  console.log('after path: actions', await actions());
  // 3) flowers drift
  await tool('flowers');
  await page.evaluate(() => document.body.classList.remove('picking'));
  await drag([100, 420], [260, 440], 20);
  console.log('after flowers: actions', await actions());
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `i_built${mode ? '_main' : ''}.png`, timeout: 120000 });
  // 4) undo / redo
  await page.evaluate(() => document.querySelector('.undo-toggle').click());
  await page.waitForTimeout(1500);
  console.log('after undo: actions', await actions(), 'world flowers', await ev(() => flowers.openHeads().length));
  await page.evaluate(() => document.querySelector('.redo-toggle').click());
  await page.waitForTimeout(1500);
  console.log('after redo: actions', await actions());
  // 5) cottage tap (Look around tool)
  await tool('move');
  const c = await ev(() => { const p = cottage.position.clone(); p.y += 2; p.project(camera); return { x: (p.x + 1) / 2 * 390, y: (1 - p.y) / 2 * 844 }; });
  await touch('touchStart', [[c.x, c.y]]); await page.waitForTimeout(80); await touch('touchEnd', []); await page.waitForTimeout(800);
  console.log('cottage panel open', await page.evaluate(() => !!document.querySelector('.cottage-panel.show')));
  // 6) admire
  await page.tap('.admire-toggle'); await page.waitForTimeout(2500);
  const a0 = await ev(() => rig.azimuth); await page.waitForTimeout(3000); const a1 = await ev(() => rig.azimuth);
  console.log('admiring turns camera', (a1 - a0).toFixed(3));
  await touch('touchStart', [[200, 300]]); await touch('touchEnd', []); await page.waitForTimeout(500);
  console.log('admire off', !(await page.evaluate(() => document.body.classList.contains('admiring'))));
  // 7) picture
  const dl = page.waitForEvent('download', { timeout: 60000 }).catch(() => null);
  await page.evaluate(() => document.querySelector('.shot-toggle').click());
  const d = await dl;
  console.log('picture', d ? d.suggestedFilename() : 'none');
  console.log('done');
  await browser.close();
})();
