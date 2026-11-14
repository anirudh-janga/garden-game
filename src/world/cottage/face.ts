import * as THREE from 'three';
import { lerp } from '../../core/random';
import { tone } from './kit';
import { COLOURS, DOOR, DORMER, PORCH, REVEAL, type Opening } from './plan';
import { clayTile, roofPoint, snowSheet, tileField } from './roof';

// (Nothing is cut out of the main roof for the porch or the dormer: their roofs simply stand through it, and
// what lies beneath them is hidden. Cutting tiles out left a stair-stepped edge with the dark deck showing.)
import { at, boxIn, limewash, reveal, window, type Frame, type WallKits } from './walls';

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

/** The porch roof's height at x (it stands at 45 degrees from its ridge over the door). */
export function porchRoofY(x: number): number {
  return PORCH.apexY - Math.abs(x - PORCH.cx);
}

/** The porch: flagstone floor and step, two oak posts with curved braces, and its own little tiled gable. */
export function buildPorch(kits: WallKits, rng: () => number, snowy: boolean) {
  const k = kits.main;
  const far = kits.far;
  const { cx, half, postX, postZ, beamY, floorY } = PORCH;
  const oak = () => tone(COLOURS.oak[Math.floor(rng() * 3)], rng, 0.05);
  // Flagstones: a floor of irregular flags one step up, and a wide worn step in front.
  const flag = () => tone(COLOURS.flag[Math.floor(rng() * 3)], rng, 0.05);
  const z0 = 1.8;
  if (far) {
    k.box(cx, floorY / 2, (z0 + 2.7) / 2, 1.6, floorY, 0.95, flag());
  } else {
    for (let row = 0; row < 2; row++) {
      let x = cx - 0.8;
      while (x < cx + 0.78) {
        const w = lerp(0.35, 0.6, rng());
        const zc = z0 + 0.22 + row * 0.42 + (rng() - 0.5) * 0.04;
        k.box(x + w / 2, floorY / 2, zc, w - 0.02, floorY - 0.01 * rng(), 0.4, flag(), (rng() - 0.5) * 0.05, { bottom: false });
        x += w;
      }
    }
  }
  k.box(cx, 0.035, 2.95, 1.55, 0.07, 0.34, flag(), (rng() - 0.5) * 0.03);
  for (const sx of [-1, 1]) {
    const x = cx + sx * postX;
    // A stone pad, an oak post, and a curved brace up to the beam.
    k.box(x, floorY + 0.04, postZ, 0.26, 0.08, 0.26, tone(COLOURS.stone[2], rng, 0.05), (rng() - 0.5) * 0.1);
    k.timber(rng, V(x, floorY + 0.06, postZ), V(x, beamY + 0.04, postZ), 0.14, 0.14, oak(), { far, bow: 0.006 });
    // A beam back to the wall on each side.
    k.timber(rng, V(x, beamY, postZ), V(x, beamY, 1.82), 0.1, 0.12, oak(), { far, bow: 0.008 });
    if (!far) {
      const pts = [V(x, 1.62, postZ), V(x - sx * 0.14, 1.98, postZ), V(x - sx * 0.34, beamY - 0.02, postZ)];
      for (let i = 0; i + 1 < pts.length; i++) k.timber(rng, pts[i], pts[i + 1], 0.08, 0.09, oak(), { far, bow: 0.004 });
    }
  }
  k.timber(rng, V(cx - postX - 0.14, beamY + 0.01, postZ), V(cx + postX + 0.14, beamY + 0.01, postZ), 0.12, 0.14, oak(), { far, bow: 0.012 });
  // The gable face above the beam (limewash with a king post), and oak boards along the roof's front edge.
  const gz = postZ + 0.1;
  const white = tone(COLOURS.limewash, rng, 0.03);
  const ap = V(cx, PORCH.apexY - 0.03, gz);
  k.tri(V(cx - postX, beamY + 0.07, gz), V(cx + postX, beamY + 0.07, gz), ap, white, V(0, 0, 1));
  k.timber(rng, V(cx, beamY + 0.07, gz + 0.01), V(cx, PORCH.apexY - 0.1, gz + 0.01), 0.1, 0.07, oak(), { far, bow: 0.004 });
  for (const sx of [-1, 1]) k.timber(rng, V(cx + sx * half, PORCH.eaveY - 0.05, PORCH.frontZ - 0.02), V(cx, PORCH.apexY + 0.02, PORCH.frontZ - 0.02), 0.05, 0.12, oak(), { far, bow: 0.006 });
  // The roof: two slopes of tiles, a soffit of dark boards underneath (so it never shows the sky), and a ridge.
  const len = Math.hypot(half, PORCH.apexY - PORCH.eaveY);
  for (const sx of [-1, 1] as const) {
    const P = (u: number, v: number, out: THREE.Vector3) => out.set(cx + sx * half * (1 - u), PORCH.eaveY + (PORCH.apexY - PORCH.eaveY) * u, lerp(PORCH.frontZ, PORCH.backZ, v));
    tileField(k, rng, {
      far,
      length: len,
      width: PORCH.frontZ - PORCH.backZ,
      outward: V(sx * 0.7, 0.7, 0),
      P,
      colour: ({ course }) => clayTile(rng, snowy, course),
    });
    if (snowy) snowSheet(k, rng, { P, outward: V(sx * 0.7, 0.7, 0), rows: far ? 3 : 6, cols: far ? 3 : 6 });
    const soffit = tone(COLOURS.batten, rng, 0.02);
    const dn = (u: number, v: number) => P(u, v, V()).add(V(0, -0.05, 0));
    k.quad(dn(0, 0), dn(0, 1), dn(1, 1), dn(1, 0), soffit, V(0, -1, 0));
    if (!far) {
      const deck = (u: number, v: number) => P(u, v, V()).add(V(-sx * 0.025, -0.025, 0));
      k.quad(deck(0, 0), deck(1, 0), deck(1, 1), deck(0, 1), soffit, V(sx, 1, 0));
    }
  }
  const ridge = tone(COLOURS.ridge, rng, 0.04);
  for (let z = PORCH.backZ; z < PORCH.frontZ - 0.05; z += 0.3) k.box(cx, PORCH.apexY + 0.03, z + 0.15, 0.16, 0.1, 0.29, ridge, 0);
}

/** The dormer in the front slope above the parlour: face with its window, cheeks, and a little tiled roof. */
export function buildDormer(kits: WallKits, rng: () => number, snowy: boolean) {
  const k = kits.main;
  const far = kits.far;
  const { cx, half, faceZ, sillY, faceH, eaveHalf, eaveY, apexY, backZ } = DORMER;
  const oak = () => tone(COLOURS.oak[Math.floor(rng() * 3)], rng, 0.05);
  const f: Frame = { origin: V(0, 0, faceZ), u: V(1, 0, 0), normal: V(0, 0, 1) };
  const op: Opening = { id: 'dormer', wall: 'front', c: cx, w: 0.7, h: 0.5, sill: sillY + 0.14, lights: 2, rows: 2 };
  const hole: [number, number, number, number] = [cx - op.w / 2, cx + op.w / 2, op.sill, op.sill + op.h];
  // The face: limewash between oak cheeks, with the window, and a gable above.
  limewash(k, rng, f, cx - half, cx + half, sillY, sillY + faceH, [], [hole], { far });
  const lim = (v: number) => Math.max(0, ((apexY - 0.05 - v) / (apexY - 0.05 - (sillY + faceH))) * half);
  limewash(k, rng, f, cx - half, cx + half, sillY + faceH, apexY - 0.05, [], [], { far, limit: lim });
  window(kits, rng, f, op, cx, { shutters: false });
  for (const sx of [-1, 1]) k.timber(rng, V(cx + sx * half, sillY - 0.02, faceZ + 0.03), V(cx + sx * half, sillY + faceH + 0.02, faceZ + 0.03), 0.09, 0.09, oak(), { far, bow: 0.004 });
  k.timber(rng, V(cx - half - 0.02, sillY - 0.01, faceZ + 0.03), V(cx + half + 0.02, sillY - 0.01, faceZ + 0.03), 0.08, 0.08, oak(), { far, bow: 0.006 });
  k.timber(rng, V(cx - half - 0.03, sillY + faceH, faceZ + 0.03), V(cx + half + 0.03, sillY + faceH, faceZ + 0.03), 0.09, 0.09, oak(), { far, bow: 0.006 });
  // The cheeks: limewash side walls running back along the main slope.
  const wash = tone(COLOURS.limewash, rng, 0.03).multiplyScalar(0.92);
  for (const sx of [-1, 1]) {
    const x = cx + sx * half;
    const n = far ? 2 : 6;
    let prev: { b: THREE.Vector3; t: THREE.Vector3 } | null = null;
    for (let i = 0; i <= n; i++) {
      const z = lerp(faceZ, 0.8, i / n);
      const u = 1 - z / 2.15;
      const b = roofPoint(x, u, 1);
      const t = V(x, Math.max(b.y + 0.05, eaveY - 0.05), z);
      t.y = Math.min(t.y, eaveY - 0.02);
      if (prev && t.y > b.y + 0.02 && prev.t.y > prev.b.y + 0.02) k.quad(prev.b, b, t, prev.t, wash, V(sx, 0, 0));
      prev = { b, t };
    }
  }
  // The roof: two slopes at 45 degrees from a horizontal ridge back into the main roof.
  const len = Math.hypot(eaveHalf, apexY - eaveY);
  for (const sx of [-1, 1] as const) {
    const P = (u: number, v: number, out: THREE.Vector3) => out.set(cx + sx * eaveHalf * (1 - u), eaveY + (apexY - eaveY) * u, lerp(faceZ + 0.08, backZ, v));
    tileField(k, rng, {
      far,
      length: len,
      width: faceZ + 0.08 - backZ,
      outward: V(sx * 0.7, 0.7, 0),
      P,
      colour: ({ course }) => clayTile(rng, snowy, course),
    });
    if (snowy) snowSheet(k, rng, { P, outward: V(sx * 0.7, 0.7, 0), rows: far ? 3 : 5, cols: far ? 3 : 5 });
    if (!far) {
      const batten = tone(COLOURS.batten, rng, 0.02);
      const deck = (u: number, v: number) => P(u, v, V()).add(V(-sx * 0.025, -0.025, 0));
      k.quad(deck(0, 0), deck(1, 0), deck(1, 1), deck(0, 1), batten, V(sx, 1, 0));
    }
  }
  const ridge = tone(COLOURS.ridge, rng, 0.04);
  // (The ridge runs back until the main slope swallows it.)
  for (let z = 0.42; z < faceZ; z += 0.28) k.box(cx, apexY + 0.03, z + 0.14, 0.14, 0.09, 0.27, ridge, 0);
  for (const sx of [-1, 1]) k.timber(rng, V(cx + sx * eaveHalf, eaveY - 0.04, faceZ + 0.07), V(cx, apexY + 0.02, faceZ + 0.07), 0.045, 0.11, oak(), { far, bow: 0.005 });
  void REVEAL;
  void DOOR;
  void at;
  void boxIn;
  void reveal;
}
