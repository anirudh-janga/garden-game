import { buildShape, setPlantSeason, LEAF_KINDS } from '../../src/world/flowers';
import { SPECIES } from '../../src/world/flowerSpecies';
import * as fs from 'fs';
setPlantSeason('summer');
const counts: Record<string, number> = JSON.parse(fs.readFileSync(process.env.COUNTS!, 'utf8'));
const tri = (g: any) => (g.index ? g.index.count : g.attributes.position.count) / 3;
const rows: any[] = [];
let near = 0, far = 0;
for (const [id, n] of Object.entries(counts)) {
  const sp = id.startsWith('leaf:') ? null : SPECIES.find((s) => s.id === id);
  let nr = 0, fr = 0;
  for (let v = 0; v < 5; v++) {
    const r: any = id.startsWith('leaf:') ? { kind: 'leaf', leaf: id.slice(5), variant: v % 3 } : { kind: 'flower', species: id, variant: v };
    const [a, b] = buildShape(r, SPECIES); nr += tri(a); fr += tri(b);
  }
  nr /= 5; fr /= 5; near += nr * n; far += fr * n;
  rows.push([id, n, Math.round(nr), Math.round(fr), fr * n]);
}
rows.sort((a, b) => b[4] - a[4]);
console.log(rows.slice(0, 16).map((r) => `${String(r[0]).padEnd(16)} ${String(r[1]).padStart(4)} plants  near ${String(r[2]).padStart(5)}  far ${String(r[3]).padStart(5)} (${Math.round(100 * r[3] / r[2])}%)  = ${Math.round(r[4] / 1000)}k far tris`).join('\n'));
console.log(`TOTAL near ${(near / 1e6).toFixed(2)}M, far ${(far / 1e6).toFixed(2)}M (${Math.round(100 * far / near)}%)`);
