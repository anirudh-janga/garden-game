// A picture sheet of plants in bloom, close up, one tile each (IDS="a,b,c" or REGION=<key>). Plants stand in a row of
// tiles on a pale ground and are looked at from the side at about knee height. Writes plants_<n>.png into $OUT.
const { chromium } = require('playwright');
const path = require('path');
const OUT = process.env.OUT || '.';
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.log('pageerror', e.message));
  await page.addInitScript(() => localStorage.clear());
  await page.goto(`http://localhost:${process.env.PORT || 4173}/?debug&q=5&season=${process.env.SEASON || 'summer'}`, { timeout: 600000 });
  await page.waitForFunction(() => !document.getElementById('loader'), null, { timeout: 600000 });
  await page.evaluate(() => { const e = { clientX: 5, clientY: 5, pointerId: 9, isPrimary: true, pointerType: 'touch', button: 0, buttons: 1, deltaY: 0, timeStamp: performance.now() }; window.world.pointer('pointerdown', e); window.world.pointer('pointerup', e); });
  await page.evaluate(() => document.querySelectorAll('body > *:not(canvas)').forEach((e) => (e.style.display = 'none')));
  const w = page.workers()[0];
  const ids = await w.evaluate(({ ids, region }) => {
    const all = flowers.species;
    return (ids ? ids.split(',') : all.filter((s) => s.region === region && !s.zone && s.form.kind !== 'foliage').map((s) => s.id));
  }, { ids: process.env.IDS || '', region: process.env.REGION || '' });
  const perShot = Number(process.env.PER || 4);
  for (let i = 0; i < ids.length; i += perShot) {
    const group = ids.slice(i, i + perShot);
    await w.evaluate(({ group, ty }) => {
      flowers.reset && flowers.reset();
      const c = cottage.position;
      group.forEach((id, k) => {
        const sp = flowers.species.find((s) => s.id === id);
        for (let n = 0; n < 3; n++) {
          const col = new THREE.Color(sp.colors[n % sp.colors.length].split('|')[0]);
          const edge = new THREE.Color((sp.colors[n % sp.colors.length].split('|')[1]) || sp.colors[n % sp.colors.length].split('|')[0]);
          flowers.plant(sp, n % 3, 3 + (k - group.length / 2) * 0.9 + n * 0.18, 0, 6 + n * 0.12, n, 1, 0, 1, col, edge);
        }
      });
      flowers.update(30);
      rig.freeSpots.push({ x: 3, z: 6, r: 20 });
      rig.minDistance = 3; rig.closeDistance = 1.6;
      rig.target.set(3 - 0.45, ty, 6); rig.azimuth = 0.2; rig.distance = 2.6 + group.length * 0.55; rig.update(0);
      for (let k = 0; k < 40; k++) rig.update(1 / 60);
    }, { group, ty: Number(process.env.TY || 0.4) });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(OUT, `plants_${i / perShot}.png`), timeout: 180000 });
    console.log(`plants_${i / perShot}.png`, group.join(','));
  }
  await browser.close();
})();
