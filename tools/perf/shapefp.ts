import { buildShape, setPlantSeason, shapeKey, LEAF_KINDS, type ShapeRecipe } from '../../src/world/flowers';
import { SPECIES } from '../../src/world/flowerSpecies';
import * as crypto from 'crypto';
setPlantSeason('summer');
const h = (g: any) => {
  const hash = crypto.createHash('sha1');
  for (const k of Object.keys(g.attributes).sort()) hash.update(k + ':' + Array.from(g.attributes[k].array as Float32Array).map((v) => v.toFixed(5)).join(','));
  return hash.digest('hex').slice(0, 12) + '/' + (g.index ? g.index.count : g.attributes.position.count);
};
const out: string[] = [];
for (const sp of SPECIES) for (let v = 0; v < 5; v++) {
  const r: ShapeRecipe = { kind: 'flower', species: sp.id, variant: v };
  const [near, far] = buildShape(r, SPECIES);
  out.push(`${shapeKey(r)} ${h(near)} ${h(far)}`);
}
for (const leaf of LEAF_KINDS) for (let v = 0; v < 3; v++) {
  const r: ShapeRecipe = { kind: 'leaf', leaf, variant: v };
  const [near, far] = buildShape(r, SPECIES);
  out.push(`${shapeKey(r)} ${h(near)} ${h(far)}`);
}
console.log(out.join('\n'));
