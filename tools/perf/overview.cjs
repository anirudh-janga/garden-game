const { chromium } = require('playwright');
const fs = require('fs');
const link = fs.readFileSync(require('path').join(__dirname, 'garden-link.txt'), 'utf8').trim();
const hash = link.slice(link.indexOf('#'));
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 195, height: 422 } });
  await page.addInitScript(() => localStorage.clear());
  await page.goto(`http://localhost:${process.env.PORT || 4173}/?debug&q=7${hash}`, { timeout: 600000 });
  await page.waitForFunction(() => !document.getElementById('loader'), null, { timeout: 600000 });
  await page.evaluate(() => { const e = { clientX: 5, clientY: 5, pointerId: 9, isPrimary: true, pointerType: 'touch', button: 0, buttons: 1, deltaY: 0, timeStamp: performance.now() }; window.world.pointer('pointerdown', e); window.world.pointer('pointerup', e); });
  const w = page.workers()[0];
  await w.evaluate(() => { rebuildInstantly(); flowers.update(30); });
  await page.waitForTimeout(4000);
  const r = await w.evaluate(async () => {
    const frame = () => new Promise((res) => { const o = post.render.bind(post); post.render = (d) => { post.render = o; o(d); res(); }; });
    const one = async (shadow) => { await frame(); await frame(); const info = renderer.info; info.autoReset = false; info.reset(); if (shadow) renderer.shadowMap.needsUpdate = true; await frame(); const out = { calls: info.render.calls, tris: info.render.triangles }; info.autoReset = true; return out; };
    const out = {};
    rig.distance = rig.maxDistance; rig.target.set(0, 0.6, -1.2);
    await new Promise((r) => setTimeout(r, 3000));
    out.maxDist = rig.maxDistance;
    out.overview = await one(false);
    out.overviewWithShadowRedraw = await one(true);
    // What the scene is made of at full zoom-out, by who owns it.
    const names = ['flowers', 'stones', 'vines', 'fences', 'edgePlants', 'pondPlants', 'wildflowers', 'boulders', 'props', 'meadow', 'ponds', 'cottage'];
    const owners = new Map();
    for (const n of names) { const o = globalThis[n]; if (!o) continue; for (const k of Object.keys(o)) { const v = o[k]; if (v && v.isObject3D) v.traverse((c) => { if (!owners.has(c)) owners.set(c, n); }); } }
    const by = {};
    scene.traverse((o) => { if (!o.isMesh || !o.visible) return; const g = o.geometry; const t = (g.index ? g.index.count : g.attributes.position.count) / 3 * (o.isInstancedMesh ? o.count : 1); let ow = owners.get(o); let q = o.parent; while (!ow && q) { ow = owners.get(q); q = q.parent; } ow = ow || 'forest, ground and the rest'; by[ow] = by[ow] || [0, 0]; by[ow][0] += t; by[ow][1]++; });
    out.by = Object.entries(by).sort((a, b) => b[1][0] - a[1][0]).map(([k, v]) => `${k} ${Math.round(v[0] / 1000)}k tris in ${v[1]} draws`);
    out.farShapes = flowers.lodMeshes ? flowers.lodMeshes.filter((m) => m.count && m.geometry === m.userData.lod.far).length + ' of ' + flowers.lodMeshes.filter((m) => m.count).length : 'n/a';
    return out;
  });
  console.log(JSON.stringify(r, null, 1));
  await browser.close();
})();
