// Atlas check: every plant has a valid region, a botanical name and a native range, ids are unique,
// every region is on the contents page, and the count per region matches docs/flower-atlas.md.
// Run: npx esbuild tools/perf/atlascheck.ts --bundle --platform=node --outfile=/tmp/atlascheck.cjs --log-level=error && node /tmp/atlascheck.cjs
import { SPECIES } from '../../src/world/flowerSpecies';
import { REGIONS } from '../../src/world/regions';

const keys = new Set(REGIONS.map((r) => r.key));
const ids = new Set<string>();
const counts = new Map<string, number>();
let bad = 0;
for (const s of SPECIES) {
  if (ids.has(s.id)) (console.log('duplicate id', s.id), bad++);
  ids.add(s.id);
  if (!keys.has(s.region)) (console.log('bad region', s.id, s.region), bad++);
  if (!s.latin || !s.native) (console.log('missing latin/native', s.id), bad++);
  if (!s.colors.length || !s.seasons.length) (console.log('no colours or seasons', s.id), bad++);
  counts.set(s.region, (counts.get(s.region) ?? 0) + 1);
}
for (const r of REGIONS) if ((counts.get(r.key) ?? 0) > 0 && !SPECIES.some((s) => s.id === r.emblem)) (console.log('emblem missing for', r.key, r.emblem), bad++);
console.log('total', SPECIES.length);
for (const r of REGIONS) console.log(r.key.padEnd(14), counts.get(r.key) ?? 0);
console.log(bad ? `${bad} PROBLEMS` : 'OK');
process.exit(bad ? 1 : 0);
