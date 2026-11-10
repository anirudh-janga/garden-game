// A fingerprint of everything built in the garden, whatever meshes it's kept in: for each shape,
// how many instances, and a hash of where they all are and what colour.
const { chromium } = require('playwright');
const fs = require('fs');
const crypto = require('crypto');
const which = process.env.GARDEN || 'user';
const link = fs.readFileSync(require('path').join(__dirname, 'garden-link.txt'), 'utf8').trim();
const hash = which === 'user' ? link.slice(link.indexOf('#')) : '';
const save = which === 'user' ? null : require('./garden.cjs');
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 195, height: 422 } });
  page.on('pageerror', (e) => console.log('pageerror', e.message));
  await page.addInitScript((s) => { localStorage.clear(); if (s) localStorage.setItem('garden-save', s); localStorage.setItem('garden-keep-mown', '1'); }, save);
  await page.goto(`http://localhost:${process.env.PORT || 4173}/?debug&q=7&season=summer${hash}`, { timeout: 600000 });
  await page.waitForFunction(() => !document.getElementById('loader'), null, { timeout: 600000 });
  const w = page.workers()[0];
  await page.waitForTimeout(3000);
  const rows = await w.evaluate(() => {
    rebuildInstantly(); flowers.update(30);
    const names = ['flowers', 'stones', 'vines', 'fences', 'edgePlants', 'pondPlants', 'boulders', 'props'];
    const out = {};
    const m = new THREE.Matrix4();
    const r = (v) => Math.round(v * 2000) / 2000;
    for (const n of names) {
      const sys = globalThis[n];
      sys.group.traverse((o) => {
        if (!o.isInstancedMesh || o.count === 0 || !o.visible) return;
        const g = o.geometry; const p = g.attributes.position;
        const shape = `${n}/${o.userData.species ?? ''}${o.userData.variant ?? ''}/${p.count}/${r(p.getX(0))},${r(p.getY(1))},${r(p.getZ(2))}/${o.castShadow ? 's' : ''}${o.receiveShadow ? 'r' : ''}`;
        const list = (out[shape] = out[shape] || []);
        const extra = Object.entries(g.attributes).filter(([, a]) => a.isInstancedBufferAttribute).sort();
        for (let i = 0; i < o.count; i++) {
          o.getMatrixAt(i, m);
          const e = m.elements;
          // (Something still growing, or erased, is tiny: only where it is counts.)
          const tiny = Math.abs(e[0]) + Math.abs(e[1]) + Math.abs(e[2]) < 0.02;
          let row = tiny ? `tiny@${r(e[12])},${r(e[14])}` : Array.from(e).map(r).join(',');
          if (o.instanceColor) row += '|c' + [0, 1, 2].map((k) => r(o.instanceColor.array[i * 3 + k])).join(',');
          for (const [name, a] of extra) { if (name === 'aLife' || name === 'aMossStart') { if (name === 'aLife' && a.itemSize === 2 && n === 'flowers') row += '|bloom' + r(a.array[i * 2 + 1]); continue; } row += '|' + name + Array.from(a.array.slice(i * a.itemSize, (i + 1) * a.itemSize)).map(r).join(','); }
          list.push(row);
        }
      });
    }
    return Object.entries(out).map(([k, v]) => [k, v.length, v.sort().join(';')]);
  });
  const lines = rows.filter((r) => r[1]).sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([k, n, body]) => `${k} n=${n} ${crypto.createHash('sha1').update(body).digest('hex').slice(0, 12)}`);
  fs.writeFileSync(process.env.OUT, lines.join('\n') + '\n');
  console.log(which, 'shapes', lines.length, 'instances', rows.reduce((a, r) => a + r[1], 0));
  await browser.close();
})();
