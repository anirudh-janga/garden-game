// The world-tour garden: one clump (EACH plants, default 8) of every species, laid out in a grid on
// an empty lawn. Reports how many garden meshes (draw calls) and triangles that is, drawn from the
// full zoom-out distance and from a close one. Optionally REGION=<key> plants just that region.
const { chromium } = require('playwright');
const EACH = Number(process.env.EACH || 8);
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on('pageerror', (e) => console.log('pageerror', e.message));
  await page.addInitScript(() => localStorage.clear());
  await page.goto(`http://localhost:${process.env.PORT || 4173}/?debug&q=7&season=${process.env.SEASON || 'summer'}`, { timeout: 600000 });
  await page.waitForFunction(() => !document.getElementById('loader'), null, { timeout: 600000 });
  const w = page.workers()[0];
  const r = await w.evaluate(async ({ each, region }) => {
    const list = flowers.species.filter((s) => !s.zone && s.form.kind !== 'foliage' && (!region || s.region === region));
    const t0 = performance.now();
    const col = new THREE.Color('#e88aa8');
    const per = Math.ceil(Math.sqrt(list.length));
    let planted = 0;
    list.forEach((sp, i) => {
      const gx = (i % per) - per / 2;
      const gz = Math.floor(i / per) - per / 2;
      for (let k = 0; k < each; k++) {
        const x = gx * 1.4 + (Math.random() - 0.5) * 0.8;
        const z = gz * 1.4 + 4 + (Math.random() - 0.5) * 0.8;
        const c = new THREE.Color(sp.colors[k % sp.colors.length].split('|')[0]);
        flowers.plant(sp, k % 3, x, 0, z, Math.random() * 6, 1, 0, 1, c, c);
        planted++;
      }
    });
    flowers.update(30);
    const buildMs = performance.now() - t0;
    const measure = () => {
      let draws = 0, tris = 0;
      flowers.group.traverse((o) => {
        if (!o.isInstancedMesh || o.count === 0 || !o.visible) return;
        draws++;
        const g = o.geometry;
        tris += ((g.index ? g.index.count : g.attributes.position.count) / 3) * o.count;
      });
      return { draws, tris: Math.round(tris / 1000) + 'k' };
    };
    rig.distance = rig.maxDistance; rig.update(0); flowers.updateDetail(camera.position);
    const far = measure();
    rig.distance = 12; rig.target.set(0, 0.5, 4); rig.update(0); flowers.updateDetail(camera.position);
    const near = measure();
    return { species: list.length, planted, buildMs: Math.round(buildMs), zoomedOut: far, close: near };
  }, { each: EACH, region: process.env.REGION || '' });
  console.log(JSON.stringify(r));
  await browser.close();
})();
