// Pictures of the cottage from all four sides, from above, close at eye level and from far off.
// Writes cottage_<view>.png into $OUT. Q (default 5) pins the quality tier; SEASON, TIME optional.
const { chromium } = require('playwright');
const path = require('path');
const OUT = process.env.OUT || '.';
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.log('pageerror', e.message));
  page.on('console', (m) => { if (m.type() === 'error') console.log('console error', m.text().slice(0, 200)); });
  await page.addInitScript(() => localStorage.clear());
  await page.goto(`http://localhost:${process.env.PORT || 4173}/?debug&q=${process.env.Q || 5}${process.env.SEASON ? '&season=' + process.env.SEASON : ''}`, { timeout: 600000 });
  await page.waitForFunction(() => !document.getElementById('loader'), null, { timeout: 600000 });
  const w = page.workers()[0];
  await page.evaluate(() => { const e = { clientX: 5, clientY: 5, pointerId: 9, isPrimary: true, pointerType: 'touch', button: 0, buttons: 1, deltaY: 0, timeStamp: performance.now() }; window.world.pointer('pointerdown', e); window.world.pointer('pointerup', e); });
  await page.evaluate(() => document.querySelectorAll('body > *:not(canvas)').forEach((e) => (e.style.display = 'none')));
  await page.waitForTimeout(4000);
  if (process.env.TIME) await page.evaluate((t) => window.world.setTime(Number(t)), process.env.TIME);
  if (process.env.GROWN) await w.evaluate(() => { rebuildInstantly(); });
  console.log('triangles', JSON.stringify(await w.evaluate(() => ({ triangles: cottage.triangles, buildMs: Math.round(cottage.buildMs) }))));
  const views = (process.env.VIEWS === '' ? [] : (process.env.VIEWS || 'front,left,right,back,above,close,far').split(','));
  const spec = {
    front: { d: 26, az: 0.35, y: 1.9, dy: 0 },
    left: { d: 26, az: -1.5, y: 1.9 },
    right: { d: 26, az: 1.9, y: 1.9 },
    back: { d: 26, az: 3.4, y: 1.9 },
    above: { d: 34, az: 0.3, y: 1.0, top: true },
    close: { d: 12, az: 0.25, y: 1.5 },
    door: { d: 10, az: 0.1, y: 1.1 },
    porch: { d: 14, az: 0.0, y: 1.7 },
    bench: { d: 11, az: 0.5, y: 0.8 },
    wing: { d: 12, az: 0.9, y: 0.9 },
    backclose: { d: 12, az: 3.4, y: 1.0 },
    roofline: { d: 14, az: 1.2, y: 4.0 },
    far: { d: 60, az: 0.2, y: 0.6 },
  };
  // AT="name:x,y,z,distance,azimuth;…": custom views looking at a point in the cottage's own coordinates.
  for (const a of (process.env.AT || '').split(';').filter(Boolean)) {
    const [name, rest] = a.split(':');
    const [x, y, z, d, az] = rest.split(',').map(Number);
    spec[name] = { at: [x, y, z], d, az, y: 0 };
    views.push(name);
  }
  for (const v of views) {
    const s = spec[v];
    await w.evaluate((s) => {
      const c = cottage.position;
      rig.freeSpots.push({ x: c.x, z: c.z, r: 10 });
      rig.minDistance = 4;
      if (s.at) { const p = cottage.group.localToWorld(new THREE.Vector3(...s.at)); rig.target.copy(p); } else rig.target.set(c.x, s.y, c.z + 1);
      rig.azimuth = cottage.frontAzimuth + s.az;
      rig.distance = s.d;
      rig.update(0);
      if (s.top) { rig.minDistance = 40; }
      for (let k = 0; k < 40; k++) rig.update(1 / 60);
    }, s);
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(OUT, `cottage_${v}.png`), timeout: 180000 });
  }
  await browser.close();
})();
