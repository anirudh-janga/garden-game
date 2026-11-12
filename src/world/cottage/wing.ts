import * as THREE from 'three';
import { lerp } from '../../core/random';
import { Kit, run, tone } from './kit';
import { COLOURS, WING } from './plan';
import { tileField } from './roof';
import { stoneCourses, type WallKits } from './walls';

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

const EAVE_X = WING.x1 + 0.15;
const SIDE = 1.45; // the roof's half-width (z), with its overhang

/** The wing roof's height at x (it falls from the gable wall to the eaves). */
function roofY(x: number): number {
  const t = (x - WING.x0) / (EAVE_X - WING.x0);
  return lerp(WING.roofHigh, WING.roofLow, t);
}

/** Vertical boards of uneven width, each its own tone, the odd one a bit short; their tops follow the roof. */
function boards(kit: Kit, rng: () => number, o: { far: boolean; alongX: boolean; fixed: number; from: number; to: number; normal: THREE.Vector3; top: (t: number) => number }) {
  const widths = run(rng, o.to - o.from, 0.1, 0.17);
  let t = o.from;
  const base = WING.plinth;
  for (const w of widths) {
    const a = t;
    const b = Math.min(o.to, t + w - 0.01);
    const c = tone(COLOURS.boards[Math.floor(rng() * 3)], rng, 0.06);
    const short = rng() < 0.08 ? 0.05 + rng() * 0.08 : 0;
    const p = (s: number, y: number) => (o.alongX ? V(s, y, o.fixed) : V(o.fixed, y, s));
    kit.quad(p(a, base + short), p(b, base + short), p(b, o.top(b) - 0.02), p(a, o.top(a) - 0.02), c, o.normal);
    t += w;
  }
}

/** A log: just its pale cut end (and a darker ring), facing the front. */
function logEnd(kit: Kit, rng: () => number, x: number, y: number, z: number, r: number, far: boolean) {
  const sides = far ? 5 : 8;
  const c = tone('#d9bf8f', rng, 0.08);
  const rim = c.clone().lerp(new THREE.Color('#8a6a45'), 0.5);
  const centre = V(x, y, z);
  const ang = rng() * 6;
  for (let i = 0; i < sides; i++) {
    const a0 = ang + (i / sides) * Math.PI * 2;
    const a1 = ang + ((i + 1) / sides) * Math.PI * 2;
    const p0 = V(x + Math.cos(a0) * r, y + Math.sin(a0) * r, z);
    const p1 = V(x + Math.cos(a1) * r, y + Math.sin(a1) * r, z);
    kit.tri(centre, p0, p1, i % 2 ? c : rim.clone().lerp(c, 0.55), V(0, 0, 1));
  }
}

/** The lean-to on the right gable: a board-walled pantry behind and an open log store in front. */
export function buildWing(kits: WallKits, rng: () => number, snowy: boolean) {
  const kit = kits.main;
  const far = kits.far;
  const { x0, x1, z0, z1, bayZ } = WING;
  const top = (x: number) => roofY(x) - 0.04;
  // The low stone footing.
  const foot = { far, v0: 0, v1: WING.plinth, depth: 0.16, rowHeight: [0.15, 0.2] as [number, number] };
  stoneCourses(kit, rng, { ...foot, origin: V(0, 0, z0 - 0.04), u: V(-1, 0, 0), normal: V(0, 0, -1), u0: -x1 - 0.04, u1: -x0 });
  stoneCourses(kit, rng, { ...foot, origin: V(x1 + 0.04, 0, 0), u: V(0, 0, -1), normal: V(1, 0, 0), u0: -z1 - 0.04, u1: -z0 + 0.04 });
  stoneCourses(kit, rng, { ...foot, origin: V(0, 0, z1 + 0.04), u: V(1, 0, 0), normal: V(0, 0, 1), u0: x0, u1: x1 + 0.04 });
  // Board walls: the back, the right end, and the partition behind the log store.
  boards(kit, rng, { far, alongX: true, fixed: z0, from: x0, to: x1, normal: V(0, 0, -1), top });
  boards(kit, rng, { far, alongX: false, fixed: x1, from: z0, to: z1, normal: V(1, 0, 0), top: () => top(x1) });
  boards(kit, rng, { far, alongX: true, fixed: bayZ, from: x0, to: x1, normal: V(0, 0, 1), top });
  // The pantry's own wall facing the front of the bay is the partition; its left end meets the main wall.
  // Open front: two oak posts hold the roof's front edge.
  const oak = () => tone(COLOURS.oak[Math.floor(rng() * 3)], rng, 0.05);
  for (const x of [x0 + 0.12, x1 - 0.08]) kit.timber(rng, V(x, WING.plinth, z1 - 0.05), V(x, top(x) + 0.02, z1 - 0.05), 0.12, 0.12, oak(), { far, bow: 0.006 });
  // A beam along the front under the roof's edge.
  kit.timber(rng, V(x0, top(x0) + 0.02, z1 - 0.05), V(x1, top(x1) + 0.02, z1 - 0.05), 0.12, 0.1, oak(), { far, bow: 0.012 });
  // Logs stacked to chest height against the partition: their pale ends face the front.
  const dark = tone('#3d332b', rng, 0.02);
  kit.quad(V(x0 + 0.15, WING.plinth, bayZ + 0.04), V(x1 - 0.15, WING.plinth, bayZ + 0.04), V(x1 - 0.15, 1.2, bayZ + 0.04), V(x0 + 0.15, 1.2, bayZ + 0.04), dark, V(0, 0, 1));
  const rows = far ? 3 : 6;
  for (let r = 0; r < rows; r++) {
    const y = WING.plinth + 0.09 + r * 0.14;
    const n = Math.floor((x1 - x0 - 0.4) / 0.16) - (r > 3 ? 4 + r : 0);
    const off = r % 2 ? 0.08 : 0;
    for (let i = 0; i < n; i++) {
      const x = x0 + 0.25 + off + i * 0.16 + (rng() - 0.5) * 0.015;
      if (x > x1 - 0.2) continue;
      logEnd(kit, rng, x, y + (rng() - 0.5) * 0.01, bayZ + 0.3 + (rng() - 0.5) * 0.04, lerp(0.06, 0.085, rng()), far);
    }
  }
  // The pantry's little window in the right wall.
  const w = V(x1 + 0.012, 0.95, -0.45);
  if (!far) kit.box(w.x, w.y, w.z, 0.04, 0.5, 0.42, tone(COLOURS.windowPaint, rng, 0.02));
  const g = [V(w.x + 0.025, w.y - 0.19, w.z + 0.15), V(w.x + 0.025, w.y - 0.19, w.z - 0.15), V(w.x + 0.025, w.y + 0.19, w.z - 0.15), V(w.x + 0.025, w.y + 0.19, w.z + 0.15)];
  kits.glass.quad(g[0], g[1], g[2], g[3], new THREE.Color('#ffffff'), V(1, 0, 0));
  kits.glow.push({ at: V(w.x + 0.03, w.y, w.z), out: V(1, 0, 0), size: 0.6 });
  if (!far) {
    const white = tone(COLOURS.windowPaint, rng, 0.02);
    kit.box(w.x + 0.03, w.y, w.z, 0.02, 0.4, 0.02, white);
    kit.box(w.x + 0.03, w.y, w.z, 0.02, 0.02, 0.32, white);
  }
  // The roof: one slope, tiled like the main roof.
  const snow = new THREE.Color(COLOURS.snow);
  const length = Math.hypot(EAVE_X - x0, WING.roofHigh - WING.roofLow);
  const slope = Math.atan2(WING.roofHigh - WING.roofLow, EAVE_X - x0);
  tileField(kit, rng, {
    far,
    length,
    width: SIDE * 2,
    outward: V(Math.sin(slope), Math.cos(slope), 0),
    P: (u, v, out) => out.set(lerp(EAVE_X, x0, u), lerp(WING.roofLow, WING.roofHigh, u), lerp(-SIDE, SIDE, v)),
    colour: ({ u, course }) => {
      const c = tone(COLOURS.tiles[Math.floor(rng() * COLOURS.tiles.length)], rng, 0.05).lerp(new THREE.Color('#b0603e'), 0.3);
      if (rng() < 0.03) c.set(COLOURS.tileDark);
      if (u < 0.2 && rng() < 0.2) c.set(COLOURS.tileMoss);
      if (snowy) c.lerp(snow, course === 0 ? 0.3 : 0.82 - rng() * 0.12);
      return c;
    },
  });
  if (!far) {
    const batten = tone(COLOURS.batten, rng, 0.02);
    const n = V(Math.sin(slope), Math.cos(slope), 0).multiplyScalar(-0.035);
    kit.quad(V(EAVE_X, WING.roofLow, -SIDE).add(n), V(EAVE_X, WING.roofLow, SIDE).add(n), V(x0, WING.roofHigh, SIDE).add(n), V(x0, WING.roofHigh, -SIDE).add(n), batten, V(Math.sin(slope), Math.cos(slope), 0));
  }
  // Oak boards along the roof's two side edges and its eaves.
  for (const z of [-SIDE, SIDE]) kit.timber(rng, V(EAVE_X, WING.roofLow - 0.05, z), V(x0, WING.roofHigh - 0.05, z), 0.05, 0.12, oak(), { far, bow: 0.008 });
  kit.timber(rng, V(EAVE_X, WING.roofLow - 0.07, -SIDE), V(EAVE_X, WING.roofLow - 0.07, SIDE), 0.06, 0.1, oak(), { far, bow: 0.015 });
}
