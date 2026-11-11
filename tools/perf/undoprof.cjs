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
  await page.waitForTimeout(3000);
  const b = await browser.newBrowserCDPSession();
  const { targetInfos } = await b.send('Target.getTargets');
  const target = targetInfos.find((t) => t.type === 'worker' && /worker-[^/]*\.js/.test(t.url) && !t.url.includes('shapes'));
  const { sessionId } = await b.send('Target.attachToTarget', { targetId: target.targetId, flatten: false });
  let id = 0; const pending = new Map();
  b.on('Target.receivedMessageFromTarget', (e) => { const m = JSON.parse(e.message); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); } });
  const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); b.send('Target.sendMessageToTarget', { sessionId, message: JSON.stringify({ id: i, method, params }) }); });
  await send('Profiler.enable');
  await send('Profiler.setSamplingInterval', { interval: 500 });
  await send('Profiler.start');
  const ms = await w.evaluate(() => { const t = performance.now(); rebuildInstantly(); return performance.now() - t; });
  const { profile } = await send('Profiler.stop');
  console.log('rebuildInstantly ms', Math.round(ms));
  const nodes = new Map(profile.nodes.map((n) => [n.id, n]));
  const self = new Map(); const dt = profile.timeDeltas;
  profile.samples.forEach((s, i) => { const n = nodes.get(s); const fn = n.callFrame.functionName || '(anon)'; if (fn === '(idle)') return; const k = `${fn} ${n.callFrame.url.split('/').pop().slice(0, 18)}:${n.callFrame.lineNumber}`; self.set(k, (self.get(k) || 0) + (dt[i] || 0) / 1000); });
  console.log([...self.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30).map(([k, v]) => `  ${Math.round(v)}ms ${k}`).join('\n'));
  // Inclusive time per function (time in it and what it called).
  const parent = new Map(); profile.nodes.forEach((n) => (n.children || []).forEach((c) => parent.set(c, n.id)));
  const incl = new Map();
  profile.samples.forEach((sid, i) => {
    const seen = new Set(); let id = sid;
    while (id) { const n = nodes.get(id); const fn = n.callFrame.functionName || '(anon)'; const k = `${fn} ${n.callFrame.url.split('/').pop().slice(0, 18)}:${n.callFrame.lineNumber}`; if (!seen.has(k)) { seen.add(k); incl.set(k, (incl.get(k) || 0) + (dt[i] || 0) / 1000); } id = parent.get(id); }
  });
  console.log('-- inclusive');
  console.log([...incl.entries()].sort((a, b) => b[1] - a[1]).slice(0, 45).map(([k, v]) => `  ${Math.round(v)}ms ${k}`).join('\n'));
  await browser.close();
})();
