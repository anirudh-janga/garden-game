// Shape budget: near and far triangles for every species and variant, against docs/flower-atlas.md's
// budgets (near ≤ 900, bush ≤ 2,000; far ≤ 250, bush ≤ 400). Plants that were already in the game before
// the atlas (they are in flowerOrigins.ts) over budget are listed as notes; a NEW plant over budget fails.
// Also builds every shape, timing it. ALL=1 lists every plant, not only those over budget. Run:
//   npx esbuild tools/perf/shapebudget.ts --bundle --platform=node --outfile=/tmp/shapebudget.cjs --log-level=error && node /tmp/shapebudget.cjs
import { buildShape, setPlantSeason } from '../../src/world/flowers';
import { SPECIES } from '../../src/world/flowerSpecies';
import { ORIGINS } from '../../src/world/flowerOrigins';

setPlantSeason('summer');
const tri = (g: any) => (g.index ? g.index.count : g.attributes.position.count) / 3;
let fail = 0;
let nearAll = 0;
let farAll = 0;
const t0 = Date.now();
const rows: string[] = [];
for (const sp of SPECIES) {
  const bush = sp.form.kind === 'rose' || sp.form.kind === 'bush';
  const nearMax = bush ? 2000 : 900;
  const farMax = bush ? 400 : 250;
  let n = 0;
  let f = 0;
  for (let v = 0; v < 3; v++) {
    const [a, b] = buildShape({ kind: 'flower', species: sp.id, variant: v }, SPECIES);
    n = Math.max(n, tri(a));
    f = Math.max(f, tri(b));
    nearAll += tri(a);
    farAll += tri(b);
  }
  const isNew = !ORIGINS[sp.id] && sp.form.kind !== 'foliage' && sp.form.kind !== 'aquatic';
  // (Foliage plants and water plants reuse the old leaf and pad shapes, whose far forms are over budget: noted only.)
  const over = n > nearMax || f > farMax;
  if (!over && process.env.ALL) rows.push(`ok   ${sp.id.padEnd(20)} near ${String(Math.round(n)).padStart(5)}  far ${String(Math.round(f)).padStart(4)}`);
  if (over) {
    rows.push(`${isNew ? 'FAIL' : 'note'} ${sp.id.padEnd(20)} near ${String(Math.round(n)).padStart(5)} (max ${nearMax})  far ${String(Math.round(f)).padStart(4)} (max ${farMax})`);
    if (isNew) fail++;
  }
}
console.log(rows.join('\n'));
console.log(`${SPECIES.length} species, ${SPECIES.length * 3} shapes built in ${Date.now() - t0} ms; mean near ${Math.round(nearAll / SPECIES.length / 3)}, mean far ${Math.round(farAll / SPECIES.length / 3)}`);
console.log(fail ? `${fail} NEW PLANTS OVER BUDGET` : 'OK (no new plant over budget)');
process.exit(fail ? 1 : 0);
