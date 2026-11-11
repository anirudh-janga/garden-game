// Undo replays cottage restyles: the cottage's walls and climbers must come out as they always did.
// Prints a fingerprint of the cottage after replaying [style A, style B] (compare two builds).
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 195, height: 422 } });
  page.on('pageerror', (e) => console.log('pageerror', e.message));
  await page.addInitScript(() => localStorage.clear());
  await page.goto(`http://localhost:${process.env.PORT || 4173}/?debug&q=7`, { timeout: 600000 });
  await page.waitForFunction(() => !document.getElementById('loader'), null, { timeout: 600000 });
  const w = page.workers()[0];
  const fp = () => w.evaluate(() => { let v = 0, m = 0; cottage.group.traverse((o) => { if (o.isMesh) { m++; v += o.geometry.attributes.position.count; } }); return `${JSON.stringify(cottage.style)} meshes ${m} verts ${v} vines ${vines.group.children.length}`; });
  console.log('start       ', await fp());
  const styles = ['', '']; // filled from the worker's own encoder via the page-level API below
  for (const [name, acts] of [['A', ['0000:']], ['A then B', ['1111:pbr', '2002:vs']], ['B only', ['2002:vs']], ['none', []]]) {
    await page.evaluate((a) => window.world.undo(a.map((s) => ({ kind: 'cottage', style: s, points: [] })), { kind: 'cottage', style: '', points: [] }), acts);
    await page.waitForTimeout(1500);
    console.log(name.padEnd(12), await fp());
  }
  await browser.close();
})();
