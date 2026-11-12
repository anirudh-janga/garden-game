import * as THREE from 'three';
import { smoothstep } from '../../core/random';
import { Kit, tone } from './kit';
import { COLOURS, CHIMNEY, EAVE_Y, EAVE_Z, RIDGE_Y, RIDGE_SAG, ROOF_X0, ROOF_X1 } from './plan';

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const CLAY = new THREE.Color('#b0603e');

/** The ridge's height at x: it sags 10 cm, lowest a little left of the middle. */
export function ridgeY(x: number): number {
  const t = Math.min(1, Math.max(0, (x - ROOF_X0) / (ROOF_X1 - ROOF_X0)));
  return RIDGE_Y - RIDGE_SAG * Math.sin(Math.PI * Math.pow(t, 0.9));
}

/**
 * A point on one slope of the main roof. u runs from the eaves (0) to the ridge (1); the bottom
 * of the slope kicks outward (flatter), and each slope dishes a little between the gables.
 */
export function roofPoint(x: number, u: number, side: 1 | -1, out = V()): THREE.Vector3 {
  const f = u * (0.78 + 0.22 * smoothstep(0, 0.3, u));
  const t = (x - ROOF_X0) / (ROOF_X1 - ROOF_X0);
  const dish = 0.04 * Math.sin(Math.PI * t) * Math.sin(Math.PI * u);
  return out.set(x, EAVE_Y + (ridgeY(x) - EAVE_Y) * f - dish, side * EAVE_Z * (1 - u));
}

/** Everything `tileField` needs to know about a roof surface. */
export interface TileField {
  /** A point on the surface: u from the eaves (0) to the top (1), v across (0 to 1). */
  P: (u: number, v: number, out: THREE.Vector3) => THREE.Vector3;
  /** The surface's size in metres along u and along v. */
  length: number;
  width: number;
  /** About which way the surface faces. */
  outward: THREE.Vector3;
  /** Leave a gap here (a chimney, a dormer): called with a tile's middle. */
  skip?: (u: number, v: number) => boolean;
  /** A tile's colour. */
  colour: (c: { u: number; v: number; course: number; col: number; courses: number }) => THREE.Color;
  far: boolean;
  /** Tiles that have slipped, and the one that's gone: [course, column] pairs matched when built. */
  missing?: (course: number, col: number) => boolean;
}

const COURSE = 0.2; // how much of each tile shows, metres
const TILE_W = 0.26;
const LIFT = 0.022; // how far a tile's lower edge stands off the one below

/**
 * Plain clay tiles, laid in overlapping courses: each its own colour, a touch off true, now and
 * then one slipped a few centimetres, one missing. Far away, one flat quad per tile.
 */
export function tileField(kit: Kit, rng: () => number, f: TileField) {
  // Far off, a tile is a bigger patch of colour (fewer, larger quads).
  const courseLen = f.far ? COURSE * 1.5 : COURSE;
  const tileW = f.far ? TILE_W * 2 : TILE_W;
  const courses = Math.max(3, Math.round(f.length / courseLen));
  const cols = Math.ceil(f.width / tileW);
  const a = V();
  const b = V();
  const c = V();
  const d = V();
  const m = V();
  const n = V();
  const du = V();
  const dv = V();
  for (let k = 0; k < courses; k++) {
    const u0 = k / courses;
    const u1 = (k + 1) / courses;
    const shift = k % 2 ? 0.5 : 0;
    const wander = (rng() - 0.5) * 0.02; // each course drifts off true by a centimetre
    for (let i = -1; i <= cols; i++) {
      const colour = f.colour({ u: (u0 + u1) / 2, v: ((i + shift + 0.5) * tileW) / f.width, course: k, col: i, courses });
      const vL = Math.max(0, ((i + shift) * tileW + wander) / f.width);
      const vR = Math.min(1, ((i + shift + 1) * tileW + wander) / f.width);
      if (vR - vL < 0.01 / f.width * 10) continue;
      const vM = (vL + vR) / 2;
      if (f.skip && f.skip((u0 + u1) / 2, vM)) continue;
      const slipped = rng() < 1 / 150;
      const gone = f.missing?.(k, i) ?? false;
      const uStart = u0 - (slipped ? 0.04 / f.length : 0) + (rng() - 0.5) * (0.005 / f.length);
      if (f.far) {
        f.P(u0, vL, a);
        f.P(u0, vR, b);
        f.P(u1, vR, c);
        f.P(u1, vL, d);
        kit.quad(a, b, c, d, gone ? tone(COLOURS.batten, rng, 0.02) : colour, f.outward);
        continue;
      }
      if (gone) continue; // the batten (the roof's deck) shows through
      const twist = (rng() - 0.5) * 0.012;
      const uTop = Math.min(1, u0 + (1.3 * courseLen) / f.length);
      // The tile's surface normal here, to stand its lower edge off.
      f.P(u0, vM, m);
      f.P(u0 + 0.02, vM, du).sub(m);
      f.P(u0, vM + 0.02, dv).sub(m);
      n.crossVectors(dv, du).normalize();
      if (n.dot(f.outward) < 0) n.negate();
      const lift = LIFT * (0.8 + rng() * 0.4);
      const cup = 0.006;
      const bl = f.P(uStart, vL + twist / f.width, V()).addScaledVector(n, lift);
      const br = f.P(uStart, vR - twist / f.width, V()).addScaledVector(n, lift);
      const bm = f.P(uStart, vM, V()).addScaledVector(n, lift + cup);
      const tl = f.P(uTop, vL, V());
      const tr = f.P(uTop, vR, V());
      const tm = f.P(uTop, vM, V()).addScaledVector(n, cup * 0.4);
      const shade = colour.clone().offsetHSL(0, 0, -0.025);
      kit.quadShaded(bl, bm, tm, tl, colour, colour, shade, shade, f.outward);
      kit.quadShaded(bm, br, tr, tm, colour, colour, shade, shade, f.outward);
    }
  }
}

/** The main roof's two slopes, its deck, the half-round ridge tiles and the oak boards at the gable edges. */
export function buildMainRoof(kit: Kit, rng: () => number, o: { far: boolean; snowy: boolean; skip?: (x: number, u: number, side: 1 | -1) => boolean }) {
  const width = ROOF_X1 - ROOF_X0;
  const slopeLen = Math.hypot(EAVE_Z, RIDGE_Y - EAVE_Y);
  const snow = new THREE.Color(COLOURS.snow);
  // A tile missing near the chimney, on the sunny slope.
  const goneCourse = 9;
  const goneCol = 3;
  for (const side of [1, -1] as const) {
    const outward = V(0, 0.77, side * 0.64);
    tileField(kit, rng, {
      far: o.far,
      length: slopeLen,
      width,
      outward,
      P: (u, v, out) => roofPoint(ROOF_X0 + v * width, u, side, out),
      skip: (u, v) => {
        const x = ROOF_X0 + v * width;
        const z = side * EAVE_Z * (1 - u);
        // The chimney's shaft comes up through the roof's left edge.
        if (x < CHIMNEY.shaft[1] + 0.06 && Math.abs(z) < CHIMNEY.shaft[3] + 0.08) return true;
        return o.skip?.(x, u, side) ?? false;
      },
      missing: (course, col) => side === 1 && course === goneCourse && col === goneCol,
      colour: ({ u, v, course, courses }) => {
        const x = ROOF_X0 + v * width;
        let hex: string = COLOURS.tiles[Math.floor(rng() * COLOURS.tiles.length)];
        const r = rng();
        if (r < 0.03) hex = COLOURS.tileDark;
        // Moss gathers low on the shady back slope and beside the chimney; lichen freckles the sunny one.
        const mossy = (side === -1 && u < 0.3 && rng() < 0.3 * (1 - u / 0.3) + 0.04) || (x < CHIMNEY.shaft[1] + 0.5 && u > 0.55 && rng() < 0.28);
        if (mossy) hex = COLOURS.tileMoss;
        else if (side === 1 && rng() < 0.02) hex = COLOURS.tileLichen;
        const c = tone(hex, rng, 0.05);
        // The clay's own colours sit a little closer together than the palette: a roof, not a mosaic.
        if ((COLOURS.tiles as readonly string[]).includes(hex)) c.lerp(CLAY, 0.3);
        // Broad patches where the sun has bleached the clay.
        c.offsetHSL(0, 0, 0.025 * Math.sin(x * 1.3 + u * 2.4 + side) * Math.sin(x * 0.7 - u * 1.9));
        if (o.snowy) c.lerp(snow, course === 0 ? 0.3 : 0.82 - rng() * 0.12);
        void courses;
        return c;
      },
    });
    if (!o.far) {
      // The deck under the tiles (dark where a tile is missing): a coarse sheet a little below them.
      const batten = tone(COLOURS.batten, rng, 0.02);
      const cols = 8;
      const rows = 5;
      for (let r = 0; r < rows; r++) {
        for (let q = 0; q < cols; q++) {
          const p = (u: number, v: number) => roofPoint(ROOF_X0 + v * width, u, side, V()).addScaledVector(outward.clone().normalize(), -0.035);
          kit.quad(p(r / rows, q / cols), p(r / rows, (q + 1) / cols), p((r + 1) / rows, (q + 1) / cols), p((r + 1) / rows, q / cols), batten, outward);
        }
      }
    }
  }
  // Half-round ridge tiles, each bedded a little differently.
  const step = 0.32;
  const ridge = tone(COLOURS.ridge, rng, 0.04);
  for (let x = ROOF_X0 + 0.02; x < ROOF_X1 - 0.1; x += step) {
    const xm = x + step / 2;
    const slope = (ridgeY(xm + 0.1) - ridgeY(xm - 0.1)) / 0.2;
    const c = tone(COLOURS.ridge, rng, 0.06);
    if (o.far) {
      kit.box(xm, ridgeY(xm) + 0.04, 0, step * 0.96, 0.1, 0.2, ridge);
      continue;
    }
    // Two sloped faces and a flat crown, like a rounded tent.
    const y = ridgeY(xm) + 0.02 + (rng() - 0.5) * 0.012;
    const x0 = xm - step * 0.48;
    const x1 = xm + step * 0.48;
    const dy = slope * step * 0.48;
    const yaw = (rng() - 0.5) * 0.03;
    const corner = (xx: number, yy: number, zz: number) => V(xx + zz * yaw, yy, zz - (xx - xm) * yaw);
    const L = (zz: number, yy: number, xx: number, sgn: number) => corner(xx, y + yy + sgn * dy, zz);
    for (const s of [1, -1]) {
      kit.quad(L(s * 0.1, -0.02, x0, -1), L(s * 0.1, -0.02, x1, 1), L(s * 0.055, 0.075, x1, 1), L(s * 0.055, 0.075, x0, -1), c, V(0, 0.5, s));
    }
    kit.quad(L(0.055, 0.075, x0, -1), L(0.055, 0.075, x1, 1), L(-0.055, 0.075, x1, 1), L(-0.055, 0.075, x0, -1), c, V(0, 1, 0));
    kit.quad(L(0.1, -0.02, x0, -1), L(0.055, 0.075, x0, -1), L(-0.055, 0.075, x0, -1), L(-0.1, -0.02, x0, -1), c.clone().multiplyScalar(0.85), V(-1, 0, 0));
    kit.quad(L(0.1, -0.02, x1, 1), L(-0.1, -0.02, x1, 1), L(-0.055, 0.075, x1, 1), L(0.055, 0.075, x1, 1), c.clone().multiplyScalar(0.85), V(1, 0, 0));
  }
  // Oak boards along the gable edges (the rakes) and under the eaves.
  const oak = () => tone(COLOURS.oak[Math.floor(rng() * COLOURS.oak.length)], rng, 0.04);
  for (const x of [ROOF_X0 + 0.02, ROOF_X1 - 0.02]) {
    for (const side of [1, -1] as const) {
      const steps = o.far ? 1 : 3;
      for (let i = 0; i < steps; i++) {
        const a = roofPoint(x, i / steps, side).add(V(0, -0.03, 0));
        const b = roofPoint(x, (i + 1) / steps, side).add(V(0, -0.03, 0));
        kit.timber(rng, a, b, 0.05, 0.13, oak(), { far: o.far, bow: 0.006 });
      }
    }
  }
  for (const side of [1, -1] as const) {
    kit.timber(rng, V(ROOF_X0, EAVE_Y - 0.06, side * (EAVE_Z - 0.02)), V(ROOF_X1, EAVE_Y - 0.06, side * (EAVE_Z - 0.02)), 0.06, 0.1, oak(), { far: o.far, bow: 0.02 });
  }
}

/** A plain clay tile's colour (the palette, each one nudged, closer together than the palette: a roof, not a mosaic). */
export function clayTile(rng: () => number, snowy: boolean, course = 5, mossy = false): THREE.Color {
  let hex: string = COLOURS.tiles[Math.floor(rng() * COLOURS.tiles.length)];
  if (rng() < 0.03) hex = COLOURS.tileDark;
  if (mossy) hex = COLOURS.tileMoss;
  const c = tone(hex, rng, 0.05);
  if ((COLOURS.tiles as readonly string[]).includes(hex)) c.lerp(CLAY, 0.3);
  if (snowy) c.lerp(new THREE.Color(COLOURS.snow), course === 0 ? 0.3 : 0.82 - rng() * 0.12);
  return c;
}
