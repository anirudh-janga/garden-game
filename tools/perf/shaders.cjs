// From an empty garden, do everything once and report each shader program first built mid-play.
const { chromium } = require('playwright');
const PORT = process.env.PORT || 4190;
const line = (x0, z0, x1, z1, n = 12) => { const p = []; for (let i = 0; i <= n; i++) p.push(Math.round((x0 + (x1 - x0) * i / n) * 100) / 100, Math.round((z0 + (z1 - z0) * i / n) * 100) / 100); return p; };
const loop = (cx, cz, r, n = 32) => { const p = []; for (let i = 0; i <= n; i++) p.push(Math.round((cx + Math.cos(i / n * Math.PI * 2) * r) * 100) / 100, Math.round((cz + Math.sin(i / n * Math.PI * 2) * r * 0.8) * 100) / 100); return p; };
const steps = [
  ['path', [{ kind: 'path', points: line(-6, 4, 6, 4, 30) }]],
  ['flowers (aster)', [{ kind: 'flowers', species: 'aster', points: line(-6, 0, -3, 0) }]],
  ['flowers (rose, mix, foliage)', [{ kind: 'flowers', species: 'rose-tea', points: line(-2, 0, 0, 0) }, { kind: 'flowers', species: 'mix', points: line(1, 0, 5, 0) }, { kind: 'flowers', species: 'hosta', points: line(-6, -2, -4, -2) }]],
  ['one flower / clump', [{ kind: 'flowers', species: 'tulip@1', points: [-8, 2, -8, 2] }, { kind: 'flowers', species: 'daisy@c', points: [-8, 0, -8, 0] }]],
  ['pond', [{ kind: 'pond', points: loop(7, 8, 2.4) }]],
  ['water flowers', [{ kind: 'flowers', species: 'water-mix', points: loop(7, 8, 1.2) }]],
  ['picket fence', [{ kind: 'fence', style: 'picket', points: line(-8, -5, -3, -5) }]],
  ['rustic fence', [{ kind: 'fence', style: 'rustic', points: line(-2, -5, 3, -5) }]],
  ['hedge', [{ kind: 'fence', style: 'hedge', points: line(4, -5, 9, -5) }]],
  ['stone wall', [{ kind: 'fence', style: 'wall', points: line(-8, -8, -3, -8) }]],
  ['rocks', [{ kind: 'rocks', points: line(0, -8, 3, -8, 5) }]],
  ['bridge', [{ kind: 'bridge', points: [4, 8, 10, 8] }]],
  ['bench', [{ kind: 'prop', item: 'bench', points: [-6, 7] }]],
  ['lantern', [{ kind: 'prop', item: 'lantern', points: [-3, 7] }]],
  ['birdhouse', [{ kind: 'prop', item: 'birdhouse', points: [0, 7] }]],
  ['flag', [{ kind: 'prop', item: 'flag', points: [2, 7] }]],
  ['chimes', [{ kind: 'prop', item: 'chimes', points: [-9, 7] }]],
  ['gazebo', [{ kind: 'prop', item: 'gazebo', points: [-10, -2] }]],
  ['erase', [{ kind: 'erase', radius: 0.6, points: line(-6, 0, -5, 0, 4) }]],
  ['cottage: all upgrades', [{ kind: 'cottage', style: '21231:pbfrvsw', points: [] }]],
  ['cottage: other looks', [{ kind: 'cottage', style: '32412:pbfrvsw', points: [] }, { kind: 'cottage', style: '43050:f', points: [] }]],
];
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await browser.newContext({ viewport: { width: 195, height: 422 }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('pageerror', e.message));
  await page.addInitScript(() => localStorage.clear());
  await page.goto(`http://localhost:${PORT}/?debug&q=7&season=${process.env.SEASON || 'summer'}`, { timeout: 600000 });
  await page.waitForFunction(() => !document.getElementById('loader'), null, { timeout: 600000 });
  await page.evaluate(() => { const e = { clientX: 5, clientY: 5, pointerId: 9, isPrimary: true, pointerType: 'touch', button: 0, buttons: 1, deltaY: 0, timeStamp: performance.now() }; window.world.pointer('pointerdown', e); window.world.pointer('pointerup', e); });
  const w = page.workers()[0];
  await page.waitForTimeout(6000);
  await w.evaluate(() => { globalThis.__ppLive = []; });
  const drain = async (label) => { const f = await w.evaluate(() => __ppLive.splice(0)); console.log(`${f.length ? '!!' : 'ok'} ${label}${f.length ? ': ' + f.length + ' new' : ''}`); for (const x of f) console.log('      ' + x); return f.length; };
  console.log('programs at start:', await w.evaluate(() => renderer.info.programs.length));
  let total = 0;
  for (const [label, actions] of steps) {
    await page.evaluate((acts) => { for (const a of acts) window.world.redo(a); }, actions);
    await page.waitForTimeout(label.startsWith('pond') ? 14000 : 7000);
    total += await drain(label);
  }
  for (const wk of ['sunbeams', 'rain', 'mist', 'clear']) { await page.evaluate((k) => window.world.setWeather(k, false), wk); await page.waitForTimeout(6000); total += await drain('weather ' + wk); }
  for (const t of [0.0, 0.3, 0.78, 1.0, 0.55]) { await page.evaluate((k) => window.world.setTime(k), t); await page.waitForTimeout(5000); total += await drain('time of day ' + t); }
  await page.evaluate(() => window.world.admire(true)); await page.waitForTimeout(5000); await page.evaluate(() => window.world.admire(false)); total += await drain('admire');
  // Touch tools (their markers), a pan and a zoom.
  const cdp = await ctx.newCDPSession(page);
  const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : pts.map(([x, y], i) => ({ x, y, id: i })) });
  for (const tool of ['flowers', 'path', 'pond', 'fence', 'decor', 'erase', 'move']) {
    await page.evaluate((t) => document.querySelector(`.tool[data-tool="${t}"]`)?.click(), tool);
    await page.waitForTimeout(500);
    await touch('touchStart', [[40, 300]]); for (let i = 1; i <= 10; i++) { await touch('touchMove', [[40 + i * 3, 300 + i]]); await page.waitForTimeout(50); } await touch('touchEnd', []);
    await page.waitForTimeout(5000);
    total += await drain('touch with tool ' + tool);
  }
  await page.evaluate(() => window.world.setTool('move'));
  for (let k = 0; k < Number(process.env.WAIT || 2); k++) { await page.waitForTimeout(30000); total += await drain(`waiting for creatures (${(k + 1) * 30} s)`); }
  console.log('TOTAL built mid-play:', total, '| programs now:', await w.evaluate(() => renderer.info.programs.length));
  await browser.close();
})();
