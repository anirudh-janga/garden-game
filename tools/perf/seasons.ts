// Builds every plant's shapes (near and far, three variants) in each of the four seasons and checks
// that none is empty, has a broken number in it, or throws. Run:
//   npx esbuild tools/perf/seasons.ts --bundle --platform=node --outfile=/tmp/seasons.cjs --log-level=error && node /tmp/seasons.cjs
import { buildShape, setPlantSeason } from '../../src/world/flowers';
import { SPECIES } from '../../src/world/flowerSpecies';

let bad = 0;
let built = 0;
for (const season of ['spring', 'summer', 'autumn', 'winter'] as const) {
  setPlantSeason(season);
  for (const sp of SPECIES) {
    for (let v = 0; v < 3; v++) {
      try {
        const shapes = buildShape({ kind: 'flower', species: sp.id, variant: v }, SPECIES);
        shapes.forEach((g, i) => {
          built++;
          const p = g.attributes.position.array as Float32Array;
          const n = g.attributes.normal.array as Float32Array;
          let ok = p.length > 0;
          for (let k = 0; k < p.length; k++) if (!Number.isFinite(p[k]) || !Number.isFinite(n[k])) ok = false;
          if (!ok) {
            bad++;
            console.log('BAD', season, sp.id, v, i ? 'far' : 'near');
          }
        });
      } catch (e) {
        bad++;
        console.log('THROWS', season, sp.id, v, (e as Error).message);
      }
    }
  }
}
console.log(`${built} shapes built over four seasons; ${bad} bad`);
process.exit(bad ? 1 : 0);
