const { chromium } = require('playwright');
const fs = require('fs');
const link = fs.readFileSync(require('path').join(__dirname, 'garden-link.txt'), 'utf8').trim();
const hash = link.slice(link.indexOf('#'));
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on('pageerror', (e) => console.log('pageerror', e.message));
  await page.addInitScript(() => localStorage.clear());
  const t0 = Date.now();
  await page.goto(`http://localhost:${process.env.PORT || 4173}/?debug&q=5${hash}`, { timeout: 600000 });
  await page.waitForFunction(() => !document.getElementById('loader'), null, { timeout: 600000 });
  console.log('load s', (Date.now() - t0) / 1000);
  await page.evaluate(() => { const e = { clientX: 5, clientY: 5, pointerId: 9, isPrimary: true, pointerType: 'touch', button: 0, buttons: 1, deltaY: 0, timeStamp: performance.now() }; window.world.pointer('pointerdown', e); window.world.pointer('pointerup', e); });
  const w = page.workers()[0];
  await w.evaluate(() => { rebuildInstantly(); flowers.update(30); });
  await page.waitForTimeout(3000);
  const measure = (label, dist, tx, tz) => w.evaluate(async ([label, dist, tx, tz]) => {
    if (dist) { rig.distance = dist; rig.target.set(tx, 0.4, tz); }
    // Wait for two frames at this view, then take exactly one frame's counts (scene + shadow passes).
    const frame = () => new Promise((res) => { const o = post.render.bind(post); post.render = (d) => { post.render = o; o(d); res(); }; });
    await frame(); await frame();
    const info = renderer.info; info.autoReset = false; info.reset();
    await frame();
    const frames = 1;
    const calls = info.render.calls, tris = info.render.triangles;
    info.autoReset = true;
    // What would be in view, per instance: flowers and other built things.
    const proj = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    const fr = new THREE.Frustum().setFromProjectionMatrix(proj);
    const m = new THREE.Matrix4(), p = new THREE.Vector3(), s = new THREE.Sphere();
    const owners = new Map();
    for (const n of ['flowers', 'stones', 'vines', 'fences', 'edgePlants', 'pondPlants', 'wildflowers', 'boulders', 'props']) { const o = globalThis[n]; if (!o) continue; for (const k of Object.keys(o)) { const v = o[k]; if (v && v.isObject3D) v.traverse((c) => { if (!owners.has(c)) owners.set(c, n); }); } }
    let all = 0, seen = 0, allT = 0, seenT = 0, verts = 0, drawnT = 0, farT = 0;
    scene.traverse((o) => {
      if (!o.isInstancedMesh || !o.visible || o.count === 0) return;
      let ow = owners.get(o); let q = o.parent; while (!ow && q) { ow = owners.get(q); q = q.parent; }
      if (!ow) return;
      const g = o.geometry; const t = (g.index ? g.index.count : g.attributes.position.count) / 3;
      const far = o.userData.lod ? o.userData.lod.far : null;
      const ft = far ? (far.index ? far.index.count : far.attributes.position.count) / 3 : t;
      if (!g.boundingSphere) g.computeBoundingSphere();
      const whole = !o.frustumCulled || !o.boundingSphere || fr.intersectsSphere(s.copy(o.boundingSphere).applyMatrix4(o.matrixWorld));
      for (let i = 0; i < o.count; i++) {
        o.getMatrixAt(i, m); s.copy(g.boundingSphere).applyMatrix4(m).applyMatrix4(o.matrixWorld);
        all++; allT += t; verts += g.attributes.position.count; farT += ft;
        if (whole) drawnT += t;
        if (fr.intersectsSphere(s)) { seen++; seenT += t; }
      }
    });
    return `${label}: dist ${rig.distance.toFixed(1)} | per frame ~${Math.round(calls / frames)} calls, ${(tris / frames / 1e6).toFixed(2)}M tris | built things ${all} (${(allT / 1e6).toFixed(2)}M tris; if all used far shapes ${(farT / 1e6).toFixed(2)}M); drawn now ${(drawnT / 1e6).toFixed(2)}M; truly in view ${seen} (${(seenT / 1e6).toFixed(2)}M tris)`;
  }, [label, dist, tx, tz]);
  console.log(await measure('overview', 0, 0, 0));
  console.log(await measure('mid zoom', 20, 0, 2));
  console.log(await measure('close zoom', 9, -4, 2));
  console.log(await measure('close zoom 2', 9, 6, -3));
  console.log(await w.evaluate(() => `rig min/max ${rig.minDistance}/${rig.maxDistance.toFixed(1)}; programs ${renderer.info.programs.length}; geometries ${renderer.info.memory.geometries}; textures ${renderer.info.memory.textures}`));
  await browser.close();
})();
