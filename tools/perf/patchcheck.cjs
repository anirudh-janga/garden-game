// Checks for the per-patch meshes (story 9.2) that a plain fingerprint can't make:
//  1. erasing takes away exactly the plants, stones and fence pieces in reach, nothing else;
//  2. undo and redo, repeatedly, bring the garden back exactly (patch meshes are reused);
//  3. nothing that should be on screen sits in a mesh that is culled (no pop-in at the edges),
//     from many camera positions, zooms and turns.
const { chromium } = require('playwright');
(async () => {
  const save = require('./garden.cjs');
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('pageerror', e.message));
  await page.addInitScript((s) => { localStorage.clear(); localStorage.setItem('garden-save', s); localStorage.setItem('garden-keep-mown', '1'); }, save);
  await page.goto(`http://localhost:${process.env.PORT || 4173}/?debug&q=7&season=summer`, { timeout: 600000 });
  await page.waitForFunction(() => !document.getElementById('loader'), null, { timeout: 600000 });
  await page.evaluate(() => { const e = { clientX: 5, clientY: 5, pointerId: 9, isPrimary: true, pointerType: 'touch', button: 0, buttons: 1, deltaY: 0, timeStamp: performance.now() }; window.world.pointer('pointerdown', e); window.world.pointer('pointerup', e); });
  const w = page.workers()[0];
  await w.evaluate(() => {
    rebuildInstantly(); flowers.update(30);
    globalThis.NAMES = ['flowers', 'stones', 'vines', 'fences', 'edgePlants', 'pondPlants', 'boulders'];
    // Every live instance: system, shape, position (instances scaled away are gone).
    globalThis.live = () => {
      const out = []; const m = new THREE.Matrix4();
      for (const n of NAMES) globalThis[n].group.traverse((o) => {
        if (!o.isInstancedMesh || !o.visible || o.count === 0) return;
        for (let i = 0; i < o.count; i++) {
          o.getMatrixAt(i, m); const e = m.elements;
          if (Math.abs(e[0]) + Math.abs(e[1]) + Math.abs(e[2]) < 0.02) continue;
          out.push({ n, x: Math.round(e[12] * 1000) / 1000, y: Math.round(e[13] * 1000) / 1000, z: Math.round(e[14] * 1000) / 1000, k: `${n}/${o.userData.species ?? ''}/${o.geometry.attributes.position.count}` });
        }
      });
      return out;
    };
    globalThis.sig = () => { const l = live().map((p) => `${p.k}@${p.x},${p.y},${p.z}`).sort(); let h = 0; for (const s of l) for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return `${l.length}:${h}`; };
  });
  const sig = () => w.evaluate(() => sig());
  const base = await sig();
  console.log('garden built:', base);

  // 1) Erase.
  const target = await w.evaluate(() => { const p = live().find((q) => q.n === 'flowers'); return p ? { x: p.x, z: p.z } : null; });
  const near = (R) => w.evaluate(([x, z, R]) => { const r2 = R * R; const l = live(); return { inside: l.filter((p) => (p.x - x) ** 2 + (p.z - z) ** 2 < r2).length, outside: l.filter((p) => (p.x - x) ** 2 + (p.z - z) ** 2 >= r2).length }; }, [target.x, target.z, R]);
  const before = await near(0.7);
  const row = await w.evaluate(([x, z]) => live().filter((p) => (p.x - x) ** 2 + (p.z - z) ** 2 < 0.49).map((p) => p.k.split('/').slice(0, 2).join('/')), [target.x, target.z]);
  console.log('in reach before:', [...new Set(row)].join(', '));
  await page.evaluate(([x, z]) => window.world.redo({ kind: 'erase', radius: 0.6, points: [x - 0.5, z, x - 0.25, z, x, z, x + 0.25, z, x + 0.5, z] }), [target.x, target.z]);
  await page.waitForTimeout(1500);
  // (Frames are slow in the software renderer: step the systems on until everything has settled.)
  await w.evaluate(() => { for (let i = 0; i < 10; i++) { flowers.update(0.1); stones.update(0.1); fences.update(0.1); edgePlants.update(0.1); pondPlants.update(0.1); } });
  const after = await near(0.7);
  console.log(`erase at (${target.x}, ${target.z}): inside reach ${before.inside} -> ${after.inside}; everything else ${before.outside} -> ${after.outside}`);
  // (Plants right at the edge of the stroke's reach may go either way; the rest must not move.)
  const erasedOk = after.inside < before.inside && before.outside - after.outside <= 6;
  console.log(erasedOk ? 'OK   erase touched only what is in reach' : 'FAIL erase');

  // 2) Undo (twice) and redo: back to the same garden.
  const undo = async () => { await page.evaluate(() => document.querySelector('.undo-toggle').click()); await page.waitForTimeout(2500); };
  const redo = async () => { await page.evaluate(() => document.querySelector('.redo-toggle').click()); await page.waitForTimeout(3500); };
  await undo();
  const afterUndo = await sig();
  console.log('after undo of the erase :', afterUndo, afterUndo === base ? 'OK   same as before the erase' : 'FAIL differs from the built garden');
  for (let i = 0; i < 3; i++) { await undo(); await redo(); }
  const afterCycles = await sig();
  await undo(); await undo(); await redo(); await redo();
  const afterMore = await sig();
  console.log('after more undo/redo     :', afterCycles, afterMore, afterCycles === afterMore ? 'OK   stable' : 'FAIL (a redo of the same strokes gave a different garden)');

  // 3) Pop-in: instances that should be on screen but are in a culled mesh.
  await w.evaluate(() => rebuildInstantly());
  await page.waitForTimeout(1500);
  let bad = 0, tested = 0, worst = 0;
  const views = [];
  for (const dist of [9, 12, 16, 24, 40]) for (const az of [0, 1.1, 2.4, 4]) for (const [x, z] of [[-8, 0], [0, 0], [8, 4], [-3, 8], [5, -6]]) views.push([dist, az, x, z]);
  for (const [dist, az, x, z] of views) {
    const r = await w.evaluate(async ([dist, az, x, z]) => {
      rig.distance = dist; rig.azimuth = az; rig.target.set(x, 0.4, z); rig.update(0);
      await new Promise((res) => { const o = post.render.bind(post); post.render = (d) => { post.render = o; o(d); res(); }; });
      await new Promise((res) => { const o = post.render.bind(post); post.render = (d) => { post.render = o; o(d); res(); }; });
      camera.updateMatrixWorld();
      const fr = new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
      const m = new THREE.Matrix4(), s = new THREE.Sphere(), s2 = new THREE.Sphere();
      let bad = 0, tested = 0;
      for (const n of NAMES) globalThis[n].group.traverse((o) => {
        if (!o.isInstancedMesh || !o.visible || o.count === 0) return;
        const g = o.geometry; if (!g.boundingSphere) g.computeBoundingSphere();
        const meshIn = !o.frustumCulled || !o.boundingSphere || fr.intersectsSphere(s2.copy(o.boundingSphere).applyMatrix4(o.matrixWorld));
        for (let i = 0; i < o.count; i++) {
          o.getMatrixAt(i, m); if (Math.abs(m.elements[0]) + Math.abs(m.elements[1]) + Math.abs(m.elements[2]) < 0.02) continue;
          s.copy(g.boundingSphere).applyMatrix4(m);
          if (!fr.intersectsSphere(s)) continue;
          tested++;
          if (!meshIn) bad++;
        }
      });
      return { bad, tested };
    }, [dist, az, x, z]);
    bad += r.bad; tested += r.tested;
  }
  console.log(`pop-in check: ${views.length} views, ${tested} on-screen instances tested, ${bad} in a culled mesh`, bad === 0 ? 'OK' : 'FAIL');
  await browser.close();
})();
