// The flower book: contents page, a region page, and picking a flower (label above the toolbar). Pictures go to $OUT.
const { chromium } = require('playwright');
const path = require('path');
const OUT = process.env.OUT || '.';
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('pageerror', e.message));
  await page.addInitScript(() => localStorage.clear());
  await page.goto(`http://localhost:${process.env.PORT || 4173}/?debug&q=7${process.env.SEASON ? '&season=' + process.env.SEASON : ''}`, { timeout: 600000 });
  await page.waitForFunction(() => !document.getElementById('loader'), null, { timeout: 600000 });
  await page.evaluate(() => document.querySelector('.tool[data-tool="flowers"]').click());
  await page.waitForTimeout(600);
  await page.evaluate(() => document.querySelector('.book-chip:not(.leaf-chip)').click());
  await page.waitForTimeout(800);
  const t0 = Date.now();
  await page.screenshot({ path: path.join(OUT, 'book_contents.png'), timeout: 180000 });
  const region = process.env.REGION || 'East Asia';
  await page.evaluate((r) => { [...document.querySelectorAll('.flower-book.show .book-card')].find((c) => c.textContent.startsWith(r)).click(); }, region);
  await page.waitForTimeout(800);
  console.log('open region ms', Date.now() - t0, 'cards', await page.evaluate(() => document.querySelectorAll('.flower-book.show .book-card').length));
  await page.screenshot({ path: path.join(OUT, 'book_region.png'), timeout: 180000 });
  await page.evaluate(() => document.querySelector('.flower-book.show .book-card').click());
  await page.waitForTimeout(800);
  console.log('label', await page.evaluate(() => document.querySelector('.tool-label, .toolbar-label, [class*=label]')?.textContent));
  await browser.close();
})();
