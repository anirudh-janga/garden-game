// The opening: pictures of the first moments after the loader fades (the view starts close on the cottage).
const { chromium } = require('playwright');
const path = require('path');
const OUT = process.env.OUT || '.';
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.log('pageerror', e.message));
  await page.addInitScript(() => localStorage.clear());
  await page.goto(`http://localhost:${process.env.PORT || 4173}/?debug&q=${process.env.Q || 5}${process.env.SEASON ? '&season=' + process.env.SEASON : ''}`, { timeout: 600000 });
  await page.waitForFunction(() => !document.getElementById('loader'), null, { timeout: 600000 });
  const w = page.workers()[0];
  await page.evaluate(() => document.querySelectorAll('body > *:not(canvas)').forEach((e) => (e.style.display = 'none')));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, 'intro_0.png'), timeout: 180000 });
  await w.evaluate(() => { for (let k = 0; k < 120; k++) rig.update(1 / 60); });
  console.log('state', await w.evaluate(() => ({ d: rig.distance, az: rig.azimuth })));
  await browser.close();
})();
