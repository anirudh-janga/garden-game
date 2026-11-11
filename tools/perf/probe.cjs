const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 195, height: 422 } });
  page.on('pageerror', (e) => console.log('pageerror', e.message.slice(0, 300)));
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log(m.type(), m.text().slice(0, 300)); });
  page.on('worker', (w) => { console.log('worker', w.url().slice(-30)); });
  await page.addInitScript(() => localStorage.clear());
  const t0 = Date.now();
  await page.goto(`http://localhost:${process.env.PORT || 4173}/?debug&q=7&season=summer`, { timeout: 60000 });
  await page.waitForFunction(() => !document.getElementById('loader'), null, { timeout: 90000 }).then(() => console.log('loaded in', (Date.now() - t0) / 1000)).catch(() => console.log('STUCK on loader after 90 s'));
  console.log('inWorker', await page.evaluate(() => window.inWorker));
  await browser.close();
})();
