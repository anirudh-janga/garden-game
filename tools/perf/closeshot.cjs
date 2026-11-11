// Pictures of the player's garden from close to the cottage, at several quality tiers (Q=7,0 by default).
// Writes close_q<Q>.png into $OUT. ?q pins the tier, so the same view can be compared across tiers.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const link = fs.readFileSync(path.join(__dirname, 'garden-link.txt'), 'utf8').trim();
const hash = link.slice(link.indexOf('#'));
const OUT = process.env.OUT || '.';
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  for (const q of (process.env.QS || '7,0').split(',')) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    page.on('pageerror', (e) => console.log('pageerror', e.message));
    await page.addInitScript(() => localStorage.clear());
    await page.goto(`http://localhost:${process.env.PORT || 4173}/?debug&q=${q}${hash}`, { timeout: 600000 });
    await page.waitForFunction(() => !document.getElementById('loader'), null, { timeout: 600000 });
    await page.evaluate(() => { const e = { clientX: 5, clientY: 5, pointerId: 9, isPrimary: true, pointerType: 'touch', button: 0, buttons: 1, deltaY: 0, timeStamp: performance.now() }; window.world.pointer('pointerdown', e); window.world.pointer('pointerup', e); });
    const w = page.workers()[0];
    await w.evaluate(() => { rebuildInstantly(); flowers.update(30); });
    await page.evaluate(() => document.querySelectorAll('body > *:not(canvas)').forEach((e) => (e.style.display = 'none')));
    await page.waitForTimeout(8000);
    const info = await w.evaluate((d) => { const c = cottage.position; rig.distance = d; rig.azimuth = 0; rig.target.set(c.x, 1.2, c.z + 1.5); rig.update(0); return { cottage: [c.x, c.z], dist: rig.distance, pr: renderer.getPixelRatio() }; }, Number(process.env.DIST || 5));
    console.log('q', q, JSON.stringify(info));
    await page.waitForTimeout(Number(process.env.SETTLE || 4000));
    await page.screenshot({ path: path.join(OUT, `close_q${q}.png`), timeout: 180000 });
    await page.close();
  }
  await browser.close();
})();
