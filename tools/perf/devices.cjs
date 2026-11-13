// The cottage on screens of different shapes: the opening view, the whole-garden view, and the view after tapping the
// cottage, at phone portrait, phone landscape, tablet portrait and desktop sizes. Pictures go to $OUT.
const { chromium } = require('playwright');
const path = require('path');
const OUT = process.env.OUT || '.';
const SIZES = { phone: [390, 844], landscape: [844, 390], tablet: [820, 1180], desktop: [1440, 900] };
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  for (const [name, [w, h]] of Object.entries(SIZES)) {
    if (process.env.ONLY && !process.env.ONLY.split(',').includes(name)) continue;
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    page.on('pageerror', (e) => console.log(name, 'pageerror', e.message));
    await page.addInitScript(() => localStorage.clear());
    await page.goto(`http://localhost:${process.env.PORT || 4173}/?debug&q=${process.env.Q || 5}`, { timeout: 600000 });
    await page.waitForFunction(() => !document.getElementById('loader'), null, { timeout: 600000 });
    const wk = page.workers()[0];
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(OUT, `${name}_intro.png`), timeout: 180000 });
    const tap = (x, y) => page.evaluate(([x, y]) => { const e = { clientX: x, clientY: y, pointerId: 9, isPrimary: true, pointerType: 'touch', button: 0, buttons: 1, deltaY: 0, timeStamp: performance.now() }; window.world.pointer('pointerdown', e); window.world.pointer('pointerup', { ...e, timeStamp: performance.now() + 60 }); }, [x, y]);
    await tap(5, 5); // ends the opening move
    await wk.evaluate(() => { rig.distance = rig.maxDistance; rig.azimuth = 0.14; rig.target.set(0, 0.6, -1.2); for (let k = 0; k < 30; k++) rig.update(1 / 60); });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(OUT, `${name}_whole.png`), timeout: 180000 });
    const c = await wk.evaluate(() => { const p = cottage.position.clone(); p.y += 2; p.project(camera); return { x: (p.x + 1) / 2, y: (1 - p.y) / 2, max: rig.maxDistance }; });
    await tap(c.x * w, c.y * h);
    await page.waitForTimeout(300);
    const st = await wk.evaluate(() => { for (let k = 0; k < 150; k++) rig.update(1 / 60); return { d: +rig.distance.toFixed(1), ty: +rig.target.y.toFixed(2), off: +Math.hypot(rig.target.x - cottage.position.x, rig.target.z - cottage.position.z).toFixed(2) }; });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(OUT, `${name}_tap.png`), timeout: 180000 });
    console.log(name, `${w}x${h}`, 'maxDistance', c.max.toFixed(1), 'after tap', JSON.stringify(st));
    await page.close();
  }
  await browser.close();
})();
