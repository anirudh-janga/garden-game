const { chromium } = require('playwright');
const fs = require('fs');
const link = fs.readFileSync(require('path').join(__dirname, 'garden-link.txt'), 'utf8').trim();
const hash = link.slice(link.indexOf('#'));
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await browser.newContext({ viewport: { width: 195, height: 422 }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('pageerror', e.message));
  await page.addInitScript(() => localStorage.clear());
  await page.goto(`http://localhost:${process.env.PORT || 4173}/?debug&q=7${hash}`, { timeout: 600000 });
  await page.waitForFunction(() => !document.getElementById('loader'), null, { timeout: 600000 });
  await page.evaluate(() => { const e = { clientX: 5, clientY: 5, pointerId: 9, isPrimary: true, pointerType: 'touch', button: 0, buttons: 1, deltaY: 0, timeStamp: performance.now() }; window.world.pointer('pointerdown', e); window.world.pointer('pointerup', e); });
  const w = page.workers()[0];
  await w.evaluate(() => { rebuildInstantly(); flowers.update(30); });
  await page.waitForTimeout(5000);
  const b = await browser.newBrowserCDPSession();
  const { targetInfos } = await b.send('Target.getTargets');
  const target = targetInfos.find((t) => t.type === 'worker' && /worker-[^/]*\.js/.test(t.url) && !t.url.includes('shapes'));
  const { sessionId } = await b.send('Target.attachToTarget', { targetId: target.targetId, flatten: false });
  let id = 0; const pending = new Map();
  b.on('Target.receivedMessageFromTarget', (e) => { const m = JSON.parse(e.message); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); } });
  const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); b.send('Target.sendMessageToTarget', { sessionId, message: JSON.stringify({ id: i, method, params }) }); });
  await send('Profiler.enable');
  await send('Profiler.setSamplingInterval', { interval: 200 });
  const countFrames = () => w.evaluate(() => { globalThis.__n = 0; const o = post.render.bind(post); globalThis.__o = o; post.render = (d) => { __n++; o(d); }; });
  const stopFrames = () => w.evaluate(() => { post.render = __o; return __n; });
  const profile = async (label, during) => {
    await countFrames();
    await send('Profiler.start');
    await during();
    const { profile } = await send('Profiler.stop');
    const frames = await stopFrames();
    const nodes = new Map(profile.nodes.map((n) => [n.id, n]));
    const self = new Map(); const dt = profile.timeDeltas; let busy = 0;
    profile.samples.forEach((s, i) => { const n = nodes.get(s); const fn = n.callFrame.functionName || '(anon)'; const t = (dt[i] || 0) / 1000; if (fn === '(idle)') return; busy += t; const k = `${fn} ${n.callFrame.url.split('/').pop().slice(0, 12)}:${n.callFrame.lineNumber}:${n.callFrame.columnNumber}`; self.set(k, (self.get(k) || 0) + t); });
    console.log(`\n== ${label}: ${frames} frames, script ${Math.round(busy)} ms busy => ${(busy / Math.max(1, frames)).toFixed(1)} ms per frame`);
    console.log([...self.entries()].sort((a, b) => b[1] - a[1]).slice(0, 14).map(([k, v]) => `  ${Math.round(v)}ms ${k}`).join('\n'));
  };
  await profile('idle, looking at the garden', () => page.waitForTimeout(8000));
  // Undo then redo the last stroke (a full rebuild).
  const t = await w.evaluate(() => { const t0 = performance.now(); rebuildInstantly(); return performance.now() - t0; });
  console.log('\nrebuildInstantly (what an undo costs):', Math.round(t), 'ms');
  // Paint a drift of flowers across the lawn.
  const cdp = await ctx.newCDPSession(page);
  const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : pts.map(([x, y], i) => ({ x, y, id: i })) });
  await page.evaluate(() => document.querySelector('.tool[data-tool="flowers"]').click());
  await page.waitForTimeout(800);
  await profile('painting a flower drift', async () => {
    await touch('touchStart', [[60, 230]]);
    for (let i = 1; i <= 40; i++) { await touch('touchMove', [[60 + i * 2, 230 + Math.sin(i / 5) * 12]]); await page.waitForTimeout(60); }
    await touch('touchEnd', []);
    await page.waitForTimeout(3000);
  });
  await page.evaluate(() => document.querySelector('.tool[data-tool="move"]').click());
  await profile('panning and zooming', async () => {
    await touch('touchStart', [[100, 250]]);
    for (let i = 1; i <= 40; i++) { await touch('touchMove', [[100 - i * 1.5, 250 - i]]); await page.waitForTimeout(50); }
    await touch('touchEnd', []);
    await page.waitForTimeout(2000);
  });
  await browser.close();
})();
