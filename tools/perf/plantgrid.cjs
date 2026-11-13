// One close-up tile per plant (three plants of it, its three shape variants, in bloom), montaged later by plantgrid.py.
// IDS="a,b" or REGION=<key> or NEW=1 (every plant added by the atlas). Writes <id>.png into $OUT.
// FARFORM=1 shows the far-off shapes instead. SEASON picks the season (default summer).
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.env.OUT || '.';
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 300, height: 340 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.log('pageerror', e.message));
  await page.addInitScript(() => localStorage.clear());
  await page.goto(`http://localhost:${process.env.PORT || 4173}/?debug&q=5&season=${process.env.SEASON || 'summer'}`, { timeout: 600000 });
  await page.waitForFunction(() => !document.getElementById('loader'), null, { timeout: 600000 });
  await page.evaluate(() => { const e = { clientX: 5, clientY: 5, pointerId: 9, isPrimary: true, pointerType: 'touch', button: 0, buttons: 1, deltaY: 0, timeStamp: performance.now() }; window.world.pointer('pointerdown', e); window.world.pointer('pointerup', e); });
  await page.evaluate(() => document.querySelectorAll('body > *:not(canvas)').forEach((e) => (e.style.display = 'none')));
  const w = page.workers()[0];
  const list = await w.evaluate(({ ids, region, onlyNew }) => {
    const all = flowers.species;
    const legacy = 85;
    let l = all.map((s, i) => ({ id: s.id, h: s.height[1], i, region: s.region, name: s.name }));
    if (ids) l = ids.split(',').map((id) => l.find((x) => x.id === id)).filter(Boolean);
    else if (region) l = l.filter((x) => x.region === region && (!onlyNew || x.i >= legacy));
    else if (onlyNew) l = l.filter((x) => x.i >= legacy);
    return l;
  }, { ids: process.env.IDS || '', region: process.env.REGION || '', onlyNew: !!process.env.NEW });
  await w.evaluate(() => {
    rig.update = () => {}; flowers.updateDetail = () => {}; camera.near = 0.03; camera.updateProjectionMatrix();
    // Only the plants, against a plain backdrop (quicker to draw, and silhouettes read cleanly).
    const keep = new Set(); flowers.group.traverse((o) => keep.add(o));
    scene.traverse((o) => { if ((o.isMesh || o.isPoints || o.isLine || o.isSprite) && !keep.has(o)) o.visible = false; });
    scene.background = new THREE.Color('#7f8f78'); scene.fog = null;
    renderer.shadowMap.enabled = false;
  });
  fs.writeFileSync(path.join(OUT, 'list.json'), JSON.stringify(list));
  for (const p of list) {
    await w.evaluate(({ id, far }) => {
      flowers.reset();
      const sp = flowers.species.find((s) => s.id === id);
      const X = 3, Z = 7;
      const y0 = flowerBrush.ground.heightAt(X, Z);
      const H = sp.height[1] * 1.0;
      const wide = sp.form.kind === 'bush' || sp.form.kind === 'rose' || sp.zone === 'deep' ? 0.55 : Math.max(0.16, H * 0.42);
      for (let n = 0; n < 3; n++) {
        const c = sp.colors[n % sp.colors.length].split('|');
        const col = new THREE.Color(c[0]);
        const edge = new THREE.Color(c[1] || c[0]);
        const x = X + (n - 1) * wide;
        const z = Z + (n === 1 ? 0.12 : 0) * wide * 2;
        flowers.plant(sp, n, x, flowerBrush.ground.heightAt(x, z), z, n * 2.1, 1, 0, 1, col, edge);
      }
      flowers.update(30);
      if (far) scene.traverse((o) => { if (o.userData && o.userData.lod) o.geometry = o.userData.lod.far; });
      const span = Math.max(H * 1.75, wide * 3.2);
      const d = span / (2 * Math.tan((15 * Math.PI) / 180)) * 1.05;
      const pitch = 0.42;
      const ty = y0 + Math.max(H * 0.56, 0.03);
      camera.position.set(X + Math.sin(0.25) * Math.cos(pitch) * d, ty + Math.sin(pitch) * d, Z + 0.06 + Math.cos(0.25) * Math.cos(pitch) * d);
      camera.lookAt(X, ty, Z + 0.06);
    }, { id: p.id, far: !!process.env.FARFORM });
    await page.waitForTimeout(Number(process.env.WAIT || 1500));
    await page.screenshot({ path: path.join(OUT, `${p.id}.png`), timeout: 180000 });
  }
  console.log('done', list.length);
  await browser.close();
})();
