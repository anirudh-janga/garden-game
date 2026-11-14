import * as THREE from 'three';
import { lerp } from '../../core/random';
import type { Season } from '../season';
import { Kit, run, tone } from './kit';
import {
  ATTIC,
  COLOURS,
  DOOR,
  PLATE_Y,
  PLINTH_H,
  REVEAL,
  RIDGE_Y,
  WALL_X0,
  WALL_X1,
  WALL_Z0,
  WALL_Z1,
  WINDOWS,
  type Opening,
  type Wall,
} from './plan';

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

/** A light the windows throw (see Cottage.nightLights). */
export interface Glow {
  at: THREE.Vector3;
  out: THREE.Vector3;
  size: number;
}

export interface WallKits {
  main: Kit;
  /** The glass: its own mesh and material, so it can glow at night. */
  glass: Kit;
  far: boolean;
  glow: Glow[];
  season: Season;
}

export interface Frame {
  /** The point on the wall's face at u = 0, v = 0 (v is height). */
  origin: THREE.Vector3;
  /** Along the wall (unit), and the way the wall faces. */
  u: THREE.Vector3;
  normal: THREE.Vector3;
}

const UP = V(0, 1, 0);
/** A wall's frame. u runs to the viewer's right looking at it from outside. */
export function frame(wall: Wall): Frame {
  if (wall === 'front') return { origin: V(0, 0, WALL_Z1), u: V(1, 0, 0), normal: V(0, 0, 1) };
  if (wall === 'back') return { origin: V(0, 0, WALL_Z0), u: V(-1, 0, 0), normal: V(0, 0, -1) };
  return { origin: V(WALL_X1, 0, 0), u: V(0, 0, -1), normal: V(1, 0, 0) }; // right gable end, u toward the back
}
export const at = (f: Frame, u: number, v: number, push = 0) => V().copy(f.origin).addScaledVector(f.u, u).addScaledVector(UP, v).addScaledVector(f.normal, push);

/** Where the openings are on a wall, as rectangles [u0, u1, v0, v1] in the wall's own u (see `frame`). */
function openingsOn(wall: Wall): { o: Opening; r: [number, number, number, number] }[] {
  const all = wall === 'front' ? [DOOR, ...WINDOWS.filter((w) => w.wall === 'front')] : WINDOWS.filter((w) => w.wall === wall);
  return all.map((o) => {
    const c = wall === 'back' ? -o.c : o.c;
    return { o, r: [c - o.w / 2, c + o.w / 2, o.sill, o.sill + o.h] };
  });
}

/** Sorted, with the extra breakpoints a grid needs to have a hole's edges fall on grid lines. */
function breaks(lo: number, hi: number, step: number, extra: number[]): number[] {
  const out = new Set<number>([lo, hi]);
  for (let v = lo + step; v < hi - step * 0.4; v += step) out.add(Math.round(v * 1000) / 1000);
  for (const e of extra) if (e > lo && e < hi) out.add(Math.round(e * 1000) / 1000);
  return [...out].sort((a, b) => a - b);
}

/**
 * A limewashed wall: a grid of slightly pillowed quads (each bay between the oak studs bulges a
 * centimetre or so), each its own tone and mottled, damp at the foot. `hole` cells are left out
 * (windows, the door, the attic's round window); `limit` trims the top (a gable's triangle).
 */
export function limewash(
  kit: Kit,
  rng: () => number,
  f: Frame,
  u0: number,
  u1: number,
  v0: number,
  v1: number,
  studs: number[],
  holes: [number, number, number, number][],
  opts: { far: boolean; limit?: (v: number) => number; round?: { u: number; v: number; r: number } },
) {
  const step = opts.far ? 0.6 : 0.26;
  const us = breaks(u0, u1, step, [...studs, ...holes.flatMap((h) => [h[0], h[1]])]);
  const vs = breaks(v0, v1, step * 0.85, [1.55, ...holes.flatMap((h) => [h[2], h[3]])]);
  const bays = [u0, ...studs.filter((s) => s > u0 && s < u1), u1];
  const bayAmp = bays.map(() => lerp(0.008, 0.02, rng()));
  const lowTone = tone(COLOURS.limewashDamp, rng, 0.02);
  const baseTones = bays.map(() => tone(COLOURS.limewash, rng, 0.05));
  const damp = new THREE.Color(COLOURS.limewashDamp);
  const green = new THREE.Color(COLOURS.limewashGreen);
  void lowTone;
  const bulge = (u: number, v: number): number => {
    let b = 0;
    while (b < bays.length - 2 && u > bays[b + 1] + 1e-6) b++;
    const fu = (u - bays[b]) / (bays[b + 1] - bays[b]);
    const tier = v < 1.55 ? (v - v0) / (1.55 - v0) : (v - 1.55) / (PLATE_Y - 1.55);
    return bayAmp[b] * Math.sin(Math.PI * Math.min(1, Math.max(0, fu))) * Math.sin(Math.PI * Math.min(1, Math.max(0, tier)));
  };
  const vtx = (u: number, v: number) => {
    const lim = opts.limit ? opts.limit(v) : Infinity;
    const cu = Math.max(-lim, Math.min(lim, u));
    return at(f, cu, v, bulge(u, v));
  };
  const colourAt = (u: number, v: number): THREE.Color => {
    let b = 0;
    while (b < bays.length - 2 && u > bays[b + 1] + 1e-6) b++;
    const c = baseTones[b].clone();
    c.offsetHSL(0, 0, (rng() - 0.5) * 0.025);
    if (v < v0 + 0.3) c.lerp(damp, 0.55 * (1 - (v - v0) / 0.3));
    if (f.normal.z < 0 && v < v0 + 0.5) c.lerp(green, 0.25 * (1 - (v - v0) / 0.5));
    return c;
  };
  for (let j = 0; j + 1 < vs.length; j++) {
    for (let i = 0; i + 1 < us.length; i++) {
      const cu = (us[i] + us[i + 1]) / 2;
      const cv = (vs[j] + vs[j + 1]) / 2;
      if (holes.some((h) => cu > h[0] && cu < h[1] && cv > h[2] && cv < h[3])) continue;
      if (opts.round && Math.hypot(cu - opts.round.u, cv - opts.round.v) < opts.round.r) continue;
      if (opts.limit && Math.abs(cu) > opts.limit(cv) + 1e-6) continue;
      kit.quad(vtx(us[i], vs[j]), vtx(us[i + 1], vs[j]), vtx(us[i + 1], vs[j + 1]), vtx(us[i], vs[j + 1]), colourAt(cu, cv), f.normal);
    }
  }
}

/** The glass, set back in its reveal, plus the reveal's four faces. Returns the glass's middle. */
export function reveal(kits: WallKits, rng: () => number, f: Frame, r: [number, number, number, number], withGlass = true): THREE.Vector3 {
  const [u0, u1, v0, v1] = r;
  const wash = tone(COLOURS.limewash, rng, 0.03).multiplyScalar(0.9);
  const k = kits.main;
  const a = at(f, u0, v0, 0);
  const b = at(f, u1, v0, 0);
  const c = at(f, u1, v1, 0);
  const d = at(f, u0, v1, 0);
  const a2 = at(f, u0, v0, -REVEAL);
  const b2 = at(f, u1, v0, -REVEAL);
  const c2 = at(f, u1, v1, -REVEAL);
  const d2 = at(f, u0, v1, -REVEAL);
  k.quad(a, a2, d2, d, wash, V().copy(f.u));
  k.quad(b, c, c2, b2, wash, V().copy(f.u).negate());
  k.quad(a, b, b2, a2, wash.clone().multiplyScalar(1.05), UP);
  k.quad(d, d2, c2, c, wash.clone().multiplyScalar(0.8), V().copy(UP).negate());
  if (withGlass) kits.glass.quad(a2, b2, c2, d2, new THREE.Color('#ffffff'), f.normal);
  return at(f, (u0 + u1) / 2, (v0 + v1) / 2, -REVEAL);
}

/** A casement window: stone sill, bowed oak lintel, painted frame, small panes, glowing glass. */
export function window(kits: WallKits, rng: () => number, f: Frame, o: Opening, uC: number, opts: { shutters?: boolean } = {}) {
  const k = kits.main;
  const u0 = uC - o.w / 2;
  const u1 = uC + o.w / 2;
  const v0 = o.sill;
  const v1 = o.sill + o.h;
  const mid = reveal(kits, rng, f, [u0, u1, v0, v1]);
  kits.glow.push({ at: at(f, uC, (v0 + v1) / 2, 0.02), out: f.normal.clone(), size: o.w > 1 ? 1.2 : 0.9 });
  void mid;
  // Sill: a stone slab sticking out a little, wider than the opening.
  const sill = tone(COLOURS.stone[1], rng, 0.05);
  const sc = at(f, uC, v0 - 0.035, 0.03);
  k.box(sc.x, sc.y, sc.z, f.normal.z !== 0 ? o.w + 0.2 : 0.2 + 0.06, 0.07, f.normal.z !== 0 ? 0.2 : o.w + 0.2, sill, 0);
  // Lintel: oak, bowed a little, standing a touch proud.
  const lin = tone(COLOURS.oak[Math.floor(rng() * 3)], rng, 0.04);
  k.timber(rng, at(f, u0 - 0.12, v1 + 0.07, 0.04), at(f, u1 + 0.12, v1 + 0.07, 0.04), 0.13, 0.15, lin, { bow: 0.015, far: kits.far });
  if (opts.shutters !== false) {
    const sw = 0.27;
    const droop = () => (0.5 + rng() * 3.5) * (Math.PI / 180);
    // (One shutter on the back wall has lost a plank.)
    shutter(kits, rng, f, u0 - 0.03, -1, sw, v0 - 0.02, o.h + 0.04, droop(), o.id === 'back-right');
    shutter(kits, rng, f, u1 + 0.03, 1, sw, v0 - 0.02, o.h + 0.04, droop(), false);
  }
  if (kits.far) return;
  // The frame and glazing bars, soft-white, set partway into the reveal.
  const paint = tone(COLOURS.windowPaint, rng, 0.03);
  const d = -REVEAL * 0.55;
  const bar = (ua: number, va: number, ub: number, vb: number, t: number) => {
    const a = at(f, (ua + ub) / 2, (va + vb) / 2, d);
    const horizontal = Math.abs(ub - ua) > Math.abs(vb - va);
    const w = horizontal ? ub - ua : t;
    const h = horizontal ? t : vb - va;
    // A box in the wall's own frame: thickness along the normal.
    boxIn(k, f, a, w, h, 0.045, paint);
  };
  const t = 0.04;
  bar(u0, v0, u1, v0 + t, t);
  bar(u0, v1 - t, u1, v1, t);
  bar(u0, v0, u0 + t, v1, t);
  bar(u1 - t, v0, u1, v1, t);
  for (let i = 1; i < o.lights; i++) bar(lerp(u0, u1, i / o.lights) - t / 2, v0, lerp(u0, u1, i / o.lights) + t / 2, v1, t);
  for (let l = 0; l < o.lights; l++) {
    const a = lerp(u0, u1, l / o.lights);
    const b = lerp(u0, u1, (l + 1) / o.lights);
    for (let r = 1; r < o.rows; r++) bar(a, lerp(v0, v1, r / o.rows) - 0.012, b, lerp(v0, v1, r / o.rows) + 0.012, 0.024);
    if (o.w / o.lights > 0.3) bar((a + b) / 2 - 0.012, v0, (a + b) / 2 + 0.012, v1, 0.024);
  }
  curtains(kits, rng, f, u0, u1, v0, v1);
  // On a summer day the parlour's left light stands open.
  if (o.id === 'parlour' && kits.season === 'summer') openSash(kits, rng, f, u0, v0, v1, (u1 - u0) / o.lights);
}

/** A box laid out in a wall's own directions (w along the wall, h up, depth along the normal), centred on `c`. */
export function boxIn(k: Kit, f: Frame, c: THREE.Vector3, w: number, h: number, depth: number, color: THREE.Color) {
  const alongX = Math.abs(f.u.x) > 0.5;
  if (alongX) k.box(c.x, c.y, c.z, w, h, depth, color);
  else k.box(c.x, c.y, c.z, depth, h, w, color);
}

/** The front door: planks of uneven width, an arched head, strap hinges, a ring and a little light. */
function door(kits: WallKits, rng: () => number, f: Frame) {
  const k = kits.main;
  const u0 = DOOR.c - DOOR.w / 2;
  const u1 = DOOR.c + DOOR.w / 2;
  const v0 = DOOR.sill;
  const v1 = DOOR.sill + DOOR.h;
  reveal(kits, rng, f, [u0, u1, v0, v1], false);
  const paint = new THREE.Color(COLOURS.paint);
  const worn = new THREE.Color(COLOURS.paintWorn);
  const widths = run(rng, DOOR.w - 0.04, 0.16, 0.27);
  // From spring to autumn the door stands a few degrees ajar, hinged on the left; in winter it is shut.
  const ajar = kits.season === 'winter' ? 0 : (4 * Math.PI) / 180;
  const doorPush = -REVEAL * 0.35;
  const hinge = u0 + 0.02;
  const P = (u: number, v: number, extra = 0) => at(f, hinge + (u - hinge) * Math.cos(ajar), v, doorPush + extra + (u - hinge) * Math.sin(ajar));
  // The dark room behind the door (seen through the gap when it's ajar).
  kits.main.quad(at(f, u0, v0, -REVEAL + 0.004), at(f, u1, v0, -REVEAL + 0.004), at(f, u1, v1, -REVEAL + 0.004), at(f, u0, v1, -REVEAL + 0.004), new THREE.Color('#251a12'), f.normal);
  let u = u0 + 0.02;
  for (const w of widths) {
    const top = v1 - 0.02 - (Math.abs((u + w / 2) - DOOR.c) / (DOOR.w / 2)) ** 2 * 0.1; // the arched head
    const c = tone(COLOURS.paint, rng, 0.05).lerp(worn, 0.15 + rng() * 0.15);
    const lowC = c.clone().lerp(worn, 0.5);
    kits.main.quadShaded(P(u, v0 + 0.01), P(u + w - 0.008, v0 + 0.01), P(u + w - 0.008, top), P(u, top), lowC, lowC, c, c, f.normal);
    // A little thickness: each plank's edge.
    kits.main.quad(P(u, v0 + 0.01, -0.04), P(u, v0 + 0.01), P(u, top), P(u, top, -0.04), paint.clone().multiplyScalar(0.7), V().copy(f.u).negate());
    u += w;
  }
  // Two long iron strap hinges, a ring handle and a small leaded light at eye height.
  const iron = new THREE.Color(COLOURS.iron);
  for (const v of [v0 + 0.3, v1 - 0.35]) {
    const a = P(u0 + 0.05, v - 0.025, 0.02);
    const b = P(u0 + 0.05 + DOOR.w * 0.55, v - 0.025, 0.02);
    kits.main.quad(a, b, P(u0 + 0.05 + DOOR.w * 0.55, v + 0.025, 0.02), P(u0 + 0.05, v + 0.025, 0.02), iron, f.normal);
  }
  const ring = P(u1 - 0.14, v0 + 0.95, 0.02);
  kits.main.box(ring.x, ring.y, ring.z, 0.05, 0.05, 0.03, iron);
  const lg = (du: number, dv: number, out = 0.014) => P(DOOR.c + du, v0 + 1.4 + dv, out);
  const frameC = tone(COLOURS.windowPaint, rng, 0.02);
  kits.main.quad(lg(-0.1, -0.1), lg(0.1, -0.1), lg(0.1, 0.1), lg(-0.1, 0.1), frameC, f.normal);
  // (The glass stands proud of its frame: the two were in one plane, and flickered.)
  kits.glass.quad(lg(-0.07, -0.07, 0.03), lg(0.07, -0.07, 0.03), lg(0.07, 0.07, 0.03), lg(-0.07, 0.07, 0.03), new THREE.Color('#ffffff'), f.normal);
  // The lintel over it: oak, bowed.
  k.timber(rng, at(f, u0 - 0.16, v1 + 0.1, 0.05), at(f, u1 + 0.16, v1 + 0.1, 0.05), 0.16, 0.18, tone(COLOURS.oak[0], rng, 0.04), { bow: 0.018, far: kits.far });
  // A worn stone step, one riser high.
  const step = tone(COLOURS.flag[0], rng, 0.05);
  const sc = at(f, DOOR.c, 0.07, 0.35);
  k.box(sc.x, sc.y, sc.z, 1.3, 0.14, 0.7, step, (rng() - 0.5) * 0.06);
}

/** The oak frame of a limewashed wall: posts, sole and wall plates, a mid rail, studs, curved braces. */
function frameWork(kits: WallKits, rng: () => number, f: Frame, u0: number, u1: number, studs: number[], holes: [number, number, number, number][], braces: boolean) {
  const k = kits.main;
  const oak = () => tone(COLOURS.oak[Math.floor(rng() * COLOURS.oak.length)], rng, 0.05);
  const far = kits.far;
  const push = 0.035;
  const t = 0.16;
  // Posts at the ends, studs between.
  for (const u of [u0, u1, ...studs]) {
    const post = u === u0 || u === u1;
    const w = post ? 0.2 : t * (0.85 + rng() * 0.3);
    const a = at(f, u + (post ? (u === u0 ? 0.06 : -0.06) : 0), PLINTH_H + 0.04, push);
    const b = at(f, u + (post ? (u === u0 ? 0.06 : -0.06) : 0), PLATE_Y - 0.04, push);
    kits.main.timber(rng, a, b, w, 0.12, oak(), { far, bow: post ? 0.006 : 0.012 });
  }
  // Sole plate and wall plate (the plate is a heavier beam), with the sill under any window.
  k.timber(rng, at(f, u0, PLINTH_H + 0.05, push), at(f, u1, PLINTH_H + 0.05, push), 0.14, 0.12, oak(), { far, bow: 0.01 });
  k.timber(rng, at(f, u0 - 0.04, PLATE_Y - 0.06, push), at(f, u1 + 0.04, PLATE_Y - 0.06, push), 0.2, 0.14, oak(), { far, bow: 0.02 });
  // A mid rail wherever it isn't crossing an opening.
  const cuts = holes.filter((h) => h[2] < 1.6 && h[3] > 1.5).map((h) => [h[0] - 0.1, h[1] + 0.1]).sort((a, b) => a[0] - b[0]);
  let from = u0;
  for (const [a, b] of [...cuts, [u1, u1 + 1]]) {
    if (a - from > 0.25) k.timber(rng, at(f, from, 1.55, push), at(f, Math.min(a, u1), 1.55, push), 0.13, 0.1, oak(), { far, bow: 0.008 });
    from = b;
  }
  if (braces && !far) {
    // A curved brace in each top corner, from the post up to the plate.
    for (const [uA, dir] of [[u0, 1], [u1, -1]] as const) {
      const pts = [at(f, uA + dir * 0.05, 1.8, push + 0.01), at(f, uA + dir * 0.28, 2.18, push + 0.01), at(f, uA + dir * 0.62, 2.42, push + 0.01)];
      for (let i = 0; i + 1 < pts.length; i++) k.timber(rng, pts[i], pts[i + 1], 0.1, 0.1, oak(), { far, bow: 0.004 });
    }
  }
}

/** The studs for a front or back wall: between the openings, never evenly spaced. */
function studsFor(rng: () => number, u0: number, u1: number, holes: [number, number, number, number][]): number[] {
  const out: number[] = [];
  let u = u0 + 0.9;
  while (u < u1 - 0.5) {
    u += lerp(0.8, 1.35, rng());
    const hit = holes.find((h) => u > h[0] - 0.12 && u < h[1] + 0.12);
    if (hit) u = hit[1] + 0.2;
    if (u < u1 - 0.4) out.push(u);
  }
  return out;
}

/** The front, back and right-gable walls (the left gable is stone: see `buildStoneWall`). */
export function buildTimberWalls(kits: WallKits, rng: () => number) {
  const far = kits.far;
  for (const wall of ['front', 'back'] as const) {
    const f = frame(wall);
    const span = WALL_X1 - WALL_X0;
    const u0 = wall === 'back' ? -WALL_X1 : WALL_X0;
    const ops = openingsOn(wall);
    const holes = ops.map((x) => x.r);
    const studs = studsFor(rng, u0, u0 + span, holes);
    limewash(kits.main, rng, f, u0, u0 + span, PLINTH_H, PLATE_Y, studs, holes, { far });
    frameWork(kits, rng, f, u0, u0 + span, studs, holes, true);
    for (const { o, r } of ops) {
      if (o.id === 'door') door(kits, rng, f);
      else window(kits, rng, f, o, (r[0] + r[1]) / 2);
    }
  }
  // The right gable end: limewash to the plate, then a triangle to the ridge with a king post and struts, and the round attic window.
  const f = frame('right');
  const zHalf = WALL_Z1;
  const holes: [number, number, number, number][] = [];
  const studs = [-1.0, 0.7];
  limewash(kits.main, rng, f, -zHalf, zHalf, PLINTH_H, PLATE_Y, studs, holes, { far });
  frameWork(kits, rng, f, -zHalf, zHalf, studs, holes, true);
  const lim = (v: number) => Math.max(0, ((RIDGE_Y - 0.12 - v) / (RIDGE_Y - 0.12 - PLATE_Y)) * zHalf);
  limewash(kits.main, rng, f, -zHalf, zHalf, PLATE_Y, RIDGE_Y - 0.1, [0], [], { far, limit: lim, round: { u: ATTIC.z, v: ATTIC.y, r: ATTIC.r + 0.06 } });
  const oak = () => tone(COLOURS.oak[Math.floor(rng() * 3)], rng, 0.05);
  const gp = 0.04;
  kits.main.timber(rng, at(f, 0, PLATE_Y, gp), at(f, 0, RIDGE_Y - 0.15, gp), 0.16, 0.12, oak(), { far, bow: 0.006 }); // king post
  kits.main.timber(rng, at(f, -0.1, 3.05, gp), at(f, -1.05, PLATE_Y + 0.05, gp), 0.1, 0.1, oak(), { far, bow: 0.008 });
  kits.main.timber(rng, at(f, 0.1, 3.05, gp), at(f, 1.05, PLATE_Y + 0.05, gp), 0.1, 0.1, oak(), { far, bow: 0.008 });
  kits.main.timber(rng, at(f, -0.75, 3.2, gp), at(f, 0.75, 3.2, gp), 0.1, 0.1, oak(), { far, bow: 0.01 }); // collar
  // The attic's round window: an oak ring and a cross of glazing bars over the glass.
  const g = at(f, ATTIC.z, ATTIC.y, -REVEAL);
  const n = far ? 8 : 14;
  const ring = tone(COLOURS.oak[0], rng, 0.04);
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2;
    const a1 = ((i + 1) / n) * Math.PI * 2;
    const rr = ATTIC.r;
    const p = (a: number, r: number, push: number) => at(f, ATTIC.z + Math.cos(a) * r, ATTIC.y + Math.sin(a) * r, push);
    kits.glass.tri(p(a0, rr, -REVEAL), p(a1, rr, -REVEAL), g, new THREE.Color('#ffffff'), f.normal);
    // The ring: a short oak band round the hole, and the hole's inside wall.
    kits.main.quad(p(a0, rr + 0.1, 0.045), p(a1, rr + 0.1, 0.045), p(a1, rr, 0.045), p(a0, rr, 0.045), ring, f.normal);
    kits.main.quad(p(a0, rr, 0), p(a1, rr, 0), p(a1, rr, -REVEAL), p(a0, rr, -REVEAL), tone(COLOURS.limewash, rng, 0.03).multiplyScalar(0.85), V(-Math.cos((a0 + a1) / 2), -Math.sin((a0 + a1) / 2), 0).applyAxisAngle(UP, 0));
  }
  if (!far) {
    const white = tone(COLOURS.windowPaint, rng, 0.02);
    boxIn(kits.main, f, at(f, ATTIC.z, ATTIC.y, -REVEAL * 0.55), 0.03, ATTIC.r * 2, 0.04, white);
    boxIn(kits.main, f, at(f, ATTIC.z, ATTIC.y, -REVEAL * 0.55), ATTIC.r * 2, 0.03, 0.04, white);
  }
  kits.glow.push({ at: at(f, ATTIC.z, ATTIC.y, 0.02), out: f.normal.clone(), size: 0.6 });
}

/**
 * Rubble stone: courses of blocks, each its own length, height and tone (bigger stones low
 * down and at the corners), laid over a darker backing so the joints read as shadow. `face`
 * says which way the wall looks, `poly` is its outline.
 */
export function stoneCourses(
  kit: Kit,
  rng: () => number,
  o: {
    far: boolean;
    /** Wall frame: origin of (u, v) = (0, 0), u axis, normal. */
    origin: THREE.Vector3;
    u: THREE.Vector3;
    normal: THREE.Vector3;
    u0: number;
    u1: number;
    v0: number;
    v1: number;
    /** Narrow the top: given a height, the half-width left of the wall's middle, [lo, hi] of u. */
    span?: (v: number) => [number, number];
    depth?: number;
    rowHeight?: [number, number];
    backing?: boolean;
  },
) {
  const depth = o.depth ?? 0.12;
  const rows = o.rowHeight ?? [0.17, 0.25];
  const span = o.span ?? (() => [o.u0, o.u1] as [number, number]);
  const f: Frame = { origin: o.origin, u: o.u, normal: o.normal };
  const gap = new THREE.Color(COLOURS.stoneGap);
  let v = o.v0;
  let rowIndex = 0;
  const lichen = new THREE.Color(COLOURS.stoneLichen);
  while (v < o.v1 - 0.05) {
    // Bigger stones nearer the ground.
    const low = 1 - Math.min(1, (v - o.v0) / 1.6);
    const h = Math.min(o.v1 - v, lerp(rows[0], rows[1], rng()) * (1 + low * 0.25));
    const [lo, hi] = span(v + h / 2);
    if (hi - lo > 0.05) {
      if (o.backing !== false && !o.far) {
        const b0 = at(f, lo, v, -0.01);
        const b1 = at(f, hi, v, -0.01);
        const b2 = at(f, hi, v + h, -0.01);
        const b3 = at(f, lo, v + h, -0.01);
        kit.quad(b0, b1, b2, b3, gap, o.normal);
      }
      const lengths = run(rng, hi - lo, 0.16 + low * 0.08, 0.38 + low * 0.1);
      // A different start each course, so the joints don't line up.
      let u = lo - (rowIndex % 2 ? 0.1 : 0) * rng();
      for (let i = 0; i < lengths.length; i++) {
        const len = lengths[i] * (i === 0 || i === lengths.length - 1 ? 1.15 : 1);
        const a = Math.max(lo, u);
        const b = Math.min(hi, u + len);
        if (b - a > 0.04) {
          const sh = h * lerp(0.82, 1, rng());
          const c = tone(COLOURS.stone[Math.floor(rng() * COLOURS.stone.length)], rng, 0.07);
          if (rng() < 0.03) c.copy(lichen);
          const centre = at(f, (a + b) / 2, v + h / 2 + (h - sh) * (rng() - 0.5), depth * 0.35 * rng());
          const faces = o.far ? 'front' : 'all';
          if (alongX(f)) kit.stone(rng, centre.x, centre.y, centre.z, b - a - 0.012, sh - 0.012, depth, c, { faces, out: o.normal });
          else kit.stone(rng, centre.x, centre.y, centre.z, depth, sh - 0.012, b - a - 0.012, c, { faces, out: o.normal });
        }
        u += len;
      }
    }
    v += h;
    rowIndex++;
  }
}

const alongX = (f: Frame) => Math.abs(f.u.x) > 0.5;

/** The left gable: all stone, from the plinth to the ridge, with the chimney growing out of it. */
export function buildStoneGable(kit: Kit, rng: () => number, far: boolean) {
  const origin = V(WALL_X0, 0, 0);
  const u = V(0, 0, 1); // along +z; facing -x
  const normal = V(-1, 0, 0);
  const apex = RIDGE_Y - 0.1;
  stoneCourses(kit, rng, {
    far,
    origin,
    u,
    normal,
    u0: WALL_Z0,
    u1: WALL_Z1,
    v0: PLINTH_H - 0.1,
    v1: apex,
    span: (v) => {
      if (v <= PLATE_Y) return [WALL_Z0, WALL_Z1];
      const half = ((apex - v) / (apex - PLATE_Y)) * WALL_Z1;
      return [-half, half];
    },
    depth: 0.14,
  });
}

/** A rough stone footing round the main range, a hand's width proud of the walls. */
export function buildPlinth(kit: Kit, rng: () => number, far: boolean) {
  const proud = 0.12;
  const sides: { origin: THREE.Vector3; u: THREE.Vector3; normal: THREE.Vector3; u0: number; u1: number }[] = [
    { origin: V(0, 0, WALL_Z1 + proud), u: V(1, 0, 0), normal: V(0, 0, 1), u0: WALL_X0 - proud, u1: WALL_X1 + proud },
    { origin: V(0, 0, WALL_Z0 - proud), u: V(-1, 0, 0), normal: V(0, 0, -1), u0: -WALL_X1 - proud, u1: -WALL_X0 + proud },
    { origin: V(WALL_X1 + proud, 0, 0), u: V(0, 0, -1), normal: V(1, 0, 0), u0: -WALL_Z1 - proud, u1: -WALL_Z0 + proud },
  ];
  for (const s of sides) {
    stoneCourses(kit, rng, { far, ...s, v0: 0, v1: PLINTH_H, depth: 0.2, rowHeight: [0.18, 0.22], backing: true });
    // The cap: a flat oak-and-stone ledge under the wall.
    const c = at({ origin: s.origin, u: s.u, normal: s.normal }, (s.u0 + s.u1) / 2, PLINTH_H - 0.01, -0.07);
    if (!far) kit.box(c.x, c.y, c.z, alongX({ origin: s.origin, u: s.u, normal: s.normal }) ? s.u1 - s.u0 : 0.1, 0.03, alongX({ origin: s.origin, u: s.u, normal: s.normal }) ? 0.1 : s.u1 - s.u0, tone(COLOURS.stone[2], rng, 0.03));
  }
  // The left side's footing, in front of the stone gable.
  stoneCourses(kit, rng, { far, origin: V(WALL_X0 - proud, 0, 0), u: V(0, 0, 1), normal: V(-1, 0, 0), u0: WALL_Z0 - proud, u1: WALL_Z1 + proud, v0: 0, v1: PLINTH_H - 0.1, depth: 0.2, rowHeight: [0.18, 0.22] });
}

/** Cream curtains just inside the glass, tied back at each side. */
function curtains(kits: WallKits, rng: () => number, f: Frame, u0: number, u1: number, v0: number, v1: number) {
  const w = u1 - u0;
  const push = -REVEAL + 0.022; // (clear of the glass by more than depth precision at full zoom-out)
  const cream = () => tone('#f3ead6', rng, 0.04);
  for (const side of [-1, 1]) {
    const edge = side < 0 ? u0 + 0.03 : u1 - 0.03;
    // From the top it hangs full, gathers in to a tie at about half height, and flares again to the sill.
    const top = w * 0.26;
    const tie = w * 0.08;
    const bot = w * 0.18;
    const vt = v1 - 0.04;
    const vm = v0 + (v1 - v0) * 0.45;
    const vb = v0 + 0.05;
    const q = (d: number, v: number) => at(f, edge + (side < 0 ? d : -d), v, push);
    kits.main.quad(q(0, vt), q(top, vt), q(tie, vm), q(0, vm), cream(), f.normal);
    kits.main.quad(q(0, vm), q(tie, vm), q(bot, vb), q(0, vb), cream(), f.normal);
  }
}

/** A plank shutter hung open beside a window, on pintles, each at its own slight droop; a little heart cut out of it. */
function shutter(kits: WallKits, rng: () => number, f: Frame, hinge: number, dir: 1 | -1, w: number, v0: number, h: number, droop: number, missingPlank: boolean) {
  const paint = new THREE.Color(COLOURS.paint);
  const worn = new THREE.Color(COLOURS.paintWorn);
  const push0 = 0.05;
  // t runs from the hinge (0) to the free edge (1).
  const pt = (t: number, v: number, lift = 0) => at(f, hinge + dir * t * w * Math.cos(droop), v, push0 + t * w * Math.sin(droop) + lift);
  const planks = kits.far ? 1 : 3;
  for (let i = 0; i < planks; i++) {
    if (missingPlank && i === 1) continue;
    const t0 = i / planks;
    const t1 = (i + 1) / planks - (kits.far ? 0 : 0.03);
    const c = tone(COLOURS.paint, rng, 0.05).lerp(worn, 0.1 + rng() * 0.2);
    const lowC = c.clone().lerp(worn, 0.4);
    const a = pt(t0, v0);
    const b = pt(t1, v0);
    const cc = pt(t1, v0 + h);
    const d = pt(t0, v0 + h);
    kits.main.quadShaded(a, b, cc, d, lowC, lowC, c, c, f.normal);
    if (!kits.far) kits.main.quad(a, pt(t0, v0, -0.03), pt(t0, v0 + h, -0.03), d, paint.clone().multiplyScalar(0.7), V().copy(f.u).multiplyScalar(-dir));
  }
  if (kits.far) return;
  // The heart: a small dark cut-out, high on the shutter.
  const vc = v0 + h * 0.74;
  const dark = new THREE.Color('#2a2320');
  const hp: THREE.Vector3[] = [];
  const n = 12;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const x = 16 * Math.sin(a) ** 3;
    const y = 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a);
    hp.push(pt(0.5 + (x * 0.0045) / w, vc + y * 0.0042, 0.012));
  }
  const mid = pt(0.5, vc - 0.005, 0.012);
  for (let i = 0; i < n; i++) kits.main.tri(mid, hp[i], hp[(i + 1) % n], dark, f.normal);
  // Two iron pintles at the hinge edge.
  const iron = new THREE.Color(COLOURS.iron);
  for (const v of [v0 + 0.12, v0 + h - 0.12]) boxIn(kits.main, f, pt(0, v, 0), 0.04, 0.03, 0.04, iron);
}

/** The parlour's left light, standing open (swung out 20 degrees on its hinge), with the room dark behind it. */
function openSash(kits: WallKits, rng: () => number, f: Frame, u0: number, v0: number, v1: number, lw: number) {
  const a = (20 * Math.PI) / 180;
  const pt = (du: number, v: number) => at(f, u0 + du * Math.cos(a), v, -REVEAL * 0.55 + du * Math.sin(a));
  // The room behind: the light's opening shows dark.
  kits.main.quad(at(f, u0, v0, -REVEAL + 0.03), at(f, u0 + lw, v0, -REVEAL + 0.03), at(f, u0 + lw, v1, -REVEAL + 0.03), at(f, u0, v1, -REVEAL + 0.03), new THREE.Color('#2a2018'), f.normal);
  const paint = tone(COLOURS.windowPaint, rng, 0.02);
  kits.glass.quad(pt(0.04, v0 + 0.04), pt(lw - 0.02, v0 + 0.04), pt(lw - 0.02, v1 - 0.04), pt(0.04, v1 - 0.04), new THREE.Color('#ffffff'), f.normal);
  const bar = (d0: number, d1: number, va: number, vb: number) => kits.main.quad(pt(d0, va), pt(d1, va), pt(d1, vb), pt(d0, vb), paint, f.normal);
  bar(0, lw, v0, v0 + 0.04);
  bar(0, lw, v1 - 0.04, v1);
  bar(0, 0.04, v0, v1);
  bar(lw - 0.04, lw, v0, v1);
  bar(lw / 2 - 0.012, lw / 2 + 0.012, v0, v1);
  bar(0, lw, (v0 + v1) / 2 - 0.012, (v0 + v1) / 2 + 0.012);
}
