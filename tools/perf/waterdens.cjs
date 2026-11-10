const { chromium } = require('playwright');
function enc(pts) { const out = []; let px = 0, pz = 0; for (const [x, z] of pts) { const X = Math.round(x * 100), Z = Math.round(z * 100); out.push(X - px, Z - pz); px = X; pz = Z; } return out.join(','); }
const curve = (fn, n) => Array.from({ length: n + 1 }, (_, i) => fn(i / n));
const circle = (r) => curve((t) => [r * Math.cos(t * Math.PI * 2), r * Math.sin(t * Math.PI * 2)], 48);
const a = [['o', enc(curve((t) => [Math.cos(t * Math.PI * 2) * 2.4, Math.sin(t * Math.PI * 2) * 2.4], 48))]];
for (const r of [0.0, 0.5, 1.0, 1.5, 2.0]) a.push(['f', 'water-mix', enc(r === 0 ? [[0, 0], [0.01, 0]] : circle(r))]);
const save = JSON.stringify({ v: 1, a });
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on('pageerror', (e) => console.log('pageerror', e.message));
  await page.addInitScript((s) => { localStorage.clear(); localStorage.setItem('garden-save', s); }, save);
  await page.goto(`http://localhost:${process.env.PORT || 4173}/?debug&q=2&season=summer`, { timeout: 600000 });
  await page.waitForFunction(() => !document.getElementById('loader'), null, { timeout: 600000 });
  await page.waitForTimeout(6000);
  const w = page.workers()[0];
  const r = await w.evaluate(async () => {
    rebuildInstantly(); flowers.update(30);
    await new Promise((res) => setTimeout(res, 2500));
    let inside = 0, total = 0, leaves = 0;
    const byKind = {};
    scene.traverse((o) => {
      if (!o.isInstancedMesh || !o.userData.species) return;
      const sp = o.userData.species;
      if (sp.startsWith('leaf:')) return;
      for (let i = 0; i < o.count; i++) {
        const m = new THREE.Matrix4(); o.getMatrixAt(i, m);
        const p = new THREE.Vector3().setFromMatrixPosition(m);
        if (Math.hypot(p.x, p.z) < 2.2) { inside++; byKind[sp] = (byKind[sp] || 0) + 1; }
        total++;
      }
    });
    return { inside, density: inside / (Math.PI * 2.2 * 2.2), byKind };
  });
  console.log(JSON.stringify(r));
  await browser.close();
})();
