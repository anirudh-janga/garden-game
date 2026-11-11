// Deterministic draw-call proxy: how many non-empty meshes the garden's systems have (all of them
// are drawn when zoomed right out), per system, plus the triangles of the meshes in view at two
// close camera positions. Unlike a one-frame renderer.info count, this doesn't depend on whether
// a shadow redraw happened to land in the frame.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const link = fs.readFileSync(path.join(__dirname, 'garden-link.txt'), 'utf8').trim();
const hash = link.slice(link.indexOf('#'));
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on('pageerror', (e) => console.log('pageerror', e.message));
  await page.addInitScript(() => localStorage.clear());
  await page.goto(`http://localhost:${process.env.PORT || 4173}/?debug&q=7${hash}`, { timeout: 600000 });
  await page.waitForFunction(() => !document.getElementById('loader'), null, { timeout: 600000 });
  await page.evaluate(() => { const e = { clientX: 5, clientY: 5, pointerId: 9, isPrimary: true, pointerType: 'touch', button: 0, buttons: 1, deltaY: 0, timeStamp: performance.now() }; window.world.pointer('pointerdown', e); window.world.pointer('pointerup', e); });
  const w = page.workers()[0];
  await w.evaluate(() => { rebuildInstantly(); flowers.update(30); });
  await page.waitForTimeout(3000);
  const r = await w.evaluate(async () => {
    const names = ['flowers', 'stones', 'vines', 'fences', 'edgePlants', 'pondPlants', 'boulders', 'props'];
    const tri = (g, n) => (g.index ? g.index.count : g.attributes.position.count) / 3 * n;
    const out = { meshes: {}, total: 0, close: [] };
    for (const n of names) {
      let k = 0;
      globalThis[n].group.traverse((o) => { if (o.isInstancedMesh && o.visible && o.count > 0) k++; });
      out.meshes[n] = k; out.total += k;
    }
    for (const [x, z] of [[-4, 2], [6, -3]]) {
      rig.distance = 9; rig.target.set(x, 0.4, z); rig.update(0); camera.updateMatrixWorld();
      await new Promise((r) => setTimeout(r, 1500));
      const fr = new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
      let drawn = 0, calls = 0; const s = new THREE.Sphere();
      for (const n of names) globalThis[n].group.traverse((o) => {
        if (!o.isInstancedMesh || !o.visible || o.count === 0) return;
        if (o.frustumCulled && o.boundingSphere && !fr.intersectsSphere(s.copy(o.boundingSphere).applyMatrix4(o.matrixWorld))) return;
        drawn += tri(o.geometry, o.count); calls++;
      });
      out.close.push(`${Math.round(drawn / 1000)}k tris in ${calls} draws`);
    }
    return out;
  });
  console.log(`non-empty garden meshes (draw calls when zoomed out): ${r.total}  ${JSON.stringify(r.meshes)}`);
  console.log(`zoomed in close: ${r.close.join(' | ')}`);
  await browser.close();
})();
