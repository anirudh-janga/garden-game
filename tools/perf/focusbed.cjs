// Tap a flower bed in Look around: the camera should glide in close on it; pinching in (fingers
// together) should bring it back out. Uses the player's garden. Pictures go to $OUT (default .).
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const link = fs.readFileSync(path.join(__dirname, 'garden-link.txt'), 'utf8').trim();
const hash = link.slice(link.indexOf('#'));
const OUT = process.env.OUT || '.';
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('pageerror', e.message));
  await page.addInitScript(() => localStorage.clear());
  await page.goto(`http://localhost:${process.env.PORT || 4173}/?debug&q=${process.env.Q || 5}${hash}`, { timeout: 600000 });
  await page.waitForFunction(() => !document.getElementById('loader'), null, { timeout: 600000 });
  const w = page.workers()[0];
  const cdp = await ctx.newCDPSession(page);
  const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : pts.map(([x, y], i) => ({ x, y, id: i, radiusX: 10, radiusY: 10 })) });
  await w.evaluate(() => { rebuildInstantly(); flowers.update(30); });
  await page.waitForTimeout(8000); // the opening camera move
  await page.evaluate(() => { const e = { clientX: 5, clientY: 5, pointerId: 9, isPrimary: true, pointerType: 'touch', button: 0, buttons: 1, deltaY: 0, timeStamp: performance.now() }; window.world.pointer('pointerdown', e); window.world.pointer('pointerup', e); }); // (ends the opening)
  // A view over the garden, then the screen position of a flower in it.
  await w.evaluate(() => { rig.distance = 30; rig.azimuth = 0.3; rig.target.set(0, 0.6, -6); rig.update(0); });
  await page.waitForTimeout(3000);
  const spot = await w.evaluate(() => {
    const v = new THREE.Vector3();
    let best = null;
    for (const list of flowers.placed.values()) for (const p of list) {
      v.set(p.pos.x, p.pos.y + 0.3, p.pos.z).project(camera);
      const sx = (v.x + 1) / 2, sy = (1 - v.y) / 2;
      const d = Math.hypot(sx - 0.5, sy - 0.5);
      if (!ponds.contains(p.pos.x, p.pos.z, 1.5) && v.z < 1 && sx > 0.1 && sx < 0.9 && sy > 0.15 && sy < 0.85 && (!best || d < best.d)) best = { d, sx, sy, pos: [p.pos.x, p.pos.z] };
    }
    return best;
  });
  console.log('tapping a plant at', JSON.stringify(spot));
  const x = spot.sx * 390, y = spot.sy * 844;
  const state = () => w.evaluate(() => ({ dist: +rig.distance.toFixed(2), target: [rig.target.x, rig.target.y, rig.target.z].map((n) => +n.toFixed(2)), pitchDeg: +(Math.atan2(camera.position.y - rig.target.y, Math.hypot(camera.position.x - rig.target.x, camera.position.z - rig.target.z)) * 180 / Math.PI).toFixed(1) }));
  console.log('before', JSON.stringify(await state()));
  await touch('touchStart', [[x, y]]); await page.waitForTimeout(80); await touch('touchEnd', []);
  // (Frames are slow in a software-rendered browser: step the camera on as 60 fps frames would.)
  for (let i = 0; i < 4; i++) { await w.evaluate(() => { for (let k = 0; k < 30; k++) rig.update(1 / 60); }); console.log(`after ${(i + 1) * 0.5}s of frames`, JSON.stringify(await state())); }
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(OUT, 'focus_in.png'), timeout: 180000 });
  // Pinch in (fingers together): back toward the garden.
  await touch('touchStart', [[100, 420], [300, 420]]);
  for (let i = 1; i <= 20; i++) { const s = 100 - i * 4; await touch('touchMove', [[195 - s, 420], [195 + s, 420]]); await page.waitForTimeout(60); }
  await touch('touchEnd', []);
  await w.evaluate(() => { for (let k = 0; k < 90; k++) rig.update(1 / 60); });
  await page.waitForTimeout(2500);
  console.log('after pinch', JSON.stringify(await state()));
  await page.screenshot({ path: path.join(OUT, 'focus_back.png'), timeout: 180000 });
  await browser.close();
})();
