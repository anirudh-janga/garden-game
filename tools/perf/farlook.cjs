// Pictures of the player's garden at several camera distances, with every flower on its near
// shape and again on its far shape, for comparing the two by eye. Writes farlook_<dist>_<near|far>.png
// into $OUT (default: the current folder).
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const link = fs.readFileSync(path.join(__dirname, 'garden-link.txt'), 'utf8').trim();
const hash = link.slice(link.indexOf('#'));
const OUT = process.env.OUT || '.';
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on('pageerror', (e) => console.log('pageerror', e.message));
  await page.addInitScript(() => localStorage.clear());
  await page.goto(`http://localhost:${process.env.PORT || 4173}/?debug&q=5${hash}`, { timeout: 600000 });
  await page.waitForFunction(() => !document.getElementById('loader'), null, { timeout: 600000 });
  await page.evaluate(() => { const e = { clientX: 5, clientY: 5, pointerId: 9, isPrimary: true, pointerType: 'touch', button: 0, buttons: 1, deltaY: 0, timeStamp: performance.now() }; window.world.pointer('pointerdown', e); window.world.pointer('pointerup', e); });
  const w = page.workers()[0];
  await w.evaluate(() => { rebuildInstantly(); flowers.update(30); });
  await page.evaluate(() => document.querySelectorAll('body > *:not(canvas)').forEach((e) => (e.style.display = 'none')));
  await page.waitForTimeout(8000); // (the opening camera move)
  const setLod = (mode) => w.evaluate((mode) => {
    // Hold every mesh that has two shapes on the one asked for (the world's own switching is paused).
    globalThis.__lodHold = mode;
    flowers.updateDetail = () => {};
    scene.traverse((o) => { if (o.userData && o.userData.lod) o.geometry = o.userData.lod[mode]; });
    return 'ok';
  }, mode);
  for (const dist of (process.env.DISTS || '30,60,100').split(',').map(Number)) {
    for (const mode of ['near', 'far']) {
      await setLod(mode);
      await w.evaluate((dist) => { rig.distance = Math.min(dist, rig.maxDistance); rig.azimuth = 0.4; rig.target.set(0, 0.4, 2); rig.update(0); }, dist);
      await page.waitForTimeout(3500);
      await page.screenshot({ path: path.join(OUT, `farlook_${dist}_${mode}.png`), timeout: 180000 });
    }
  }
  await browser.close();
})();
