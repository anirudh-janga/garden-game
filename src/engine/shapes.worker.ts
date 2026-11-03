/// <reference lib="webworker" />
import { buildShape, setPlantSeason, shapeKey, type ShapeRecipe } from '../world/flowers';
import type { Season } from '../world/season';
import { SPECIES } from '../world/flowerSpecies';
import type * as THREE from 'three';
import { forBouquet } from '../world/bouquet';
import type { LeafKind } from '../world/flowers';

/**
 * Builds plant shapes ahead of time, off the world's thread: a shape built the moment a species
 * is first planted took up to ~70 ms (a hitch). The world sends the recipes it's likely to need;
 * each finished shape comes back as plain arrays (handed over, not copied).
 */
export interface PackedShape {
  attributes: Record<string, { array: Float32Array; itemSize: number }>;
  userData: Record<string, unknown>;
}

const pack = (g: THREE.BufferGeometry, transfer: Transferable[]): PackedShape => {
  const attributes: PackedShape['attributes'] = {};
  for (const [name, a] of Object.entries(g.attributes)) {
    const array = a.array as Float32Array;
    attributes[name] = { array, itemSize: a.itemSize };
    transfer.push(array.buffer);
  }
  return { attributes, userData: g.userData };
};

/** A cut stem to grow again for a bouquet: its species and garden variant. */
export interface StemRequest {
  key: string;
  species: string;
  variant: number;
}

// Bouquet stems, one per task, as they're asked for.
let stemQueue: StemRequest[] = [];
let busy = false;
const nextStem = () => {
  busy = false;
  const r = stemQueue.shift();
  if (!r) return;
  busy = true;
  const recipe: ShapeRecipe = r.species.startsWith('leaf:')
    ? { kind: 'leaf', leaf: r.species.slice(5) as LeafKind, variant: r.variant }
    : { kind: 'flower', species: r.species, variant: r.variant };
  const transfer: Transferable[] = [];
  const [near] = buildShape(recipe, SPECIES);
  self.postMessage({ key: r.key, stem: pack(forBouquet(near), transfer) }, transfer);
  setTimeout(nextStem, 0);
};

self.addEventListener('message', (e: MessageEvent<{ season: Season; recipes?: ShapeRecipe[]; stems?: StemRequest[] }>) => {
  setPlantSeason(e.data.season);
  if (e.data.stems) {
    // A new bouquet: what was asked for the last one is no longer needed.
    stemQueue = [...e.data.stems];
    if (!busy) nextStem();
    return;
  }
  const queue = [...(e.data.recipes ?? [])];
  // One shape per task, so a newer, more urgent list could get in between.
  const next = () => {
    const r = queue.shift();
    if (!r) return;
    const transfer: Transferable[] = [];
    const [near, far] = buildShape(r, SPECIES);
    self.postMessage({ key: shapeKey(r), near: pack(near, transfer), far: pack(far, transfer) }, transfer);
    setTimeout(next, 0);
  };
  next();
});
