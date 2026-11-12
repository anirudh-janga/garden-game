import * as THREE from 'three';
import { lerp } from '../../core/random';

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

/**
 * Collects the cottage's pieces as flat-shaded, vertex-coloured triangles, so a house of
 * thousands of tiles and stones is built once into a single geometry. Each piece is its own
 * colour and its own slight irregularity (the helpers here are all seeded by the caller's rng).
 */
export class Kit {
  private readonly pos: number[] = [];
  private readonly nor: number[] = [];
  private readonly col: number[] = [];
  private readonly ab = V();
  private readonly ac = V();
  private readonly n = V();

  /** One triangle (counter-clockwise from the front). `out`, if given, is a direction the face must point toward (the triangle is turned if it doesn't). */
  tri(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, color: THREE.Color, out?: THREE.Vector3) {
    this.ab.subVectors(b, a);
    this.ac.subVectors(c, a);
    this.n.crossVectors(this.ab, this.ac);
    const len = this.n.length();
    if (len < 1e-10) return;
    this.n.divideScalar(len);
    if (out && this.n.dot(out) < 0) {
      this.n.negate();
      this.push(a, c, b, color);
      return;
    }
    this.push(a, b, c, color);
  }

  private push(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, color: THREE.Color) {
    for (const p of [a, b, c]) {
      this.pos.push(p.x, p.y, p.z);
      this.nor.push(this.n.x, this.n.y, this.n.z);
      this.col.push(color.r, color.g, color.b);
    }
  }

  /** A quad a-b-c-d (in order round it). */
  quad(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, d: THREE.Vector3, color: THREE.Color, out?: THREE.Vector3) {
    this.tri(a, b, c, color, out);
    this.tri(a, c, d, color, out);
  }

  /** A quad with its own colour at each corner (a gradient, or mottling). */
  quadShaded(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, d: THREE.Vector3, ca: THREE.Color, cb: THREE.Color, cc: THREE.Color, cd: THREE.Color, out?: THREE.Vector3) {
    const mid = new THREE.Color((ca.r + cb.r + cc.r + cd.r) / 4, (ca.g + cb.g + cc.g + cd.g) / 4, (ca.b + cb.b + cc.b + cd.b) / 4);
    // (Flat shading per triangle: each takes the average of its corners' colours, softly.)
    const tc = (x: THREE.Color, y: THREE.Color, z: THREE.Color) => new THREE.Color((x.r + y.r + z.r + mid.r) / 4, (x.g + y.g + z.g + mid.g) / 4, (x.b + y.b + z.b + mid.b) / 4);
    this.tri(a, b, c, tc(ca, cb, cc), out);
    this.tri(a, c, d, tc(ca, cc, cd), out);
  }

  /** A convex block from its eight corners (0–3 the bottom ring, 4–7 the top ring above it). Faces point away from its middle. */
  block(p: THREE.Vector3[], color: THREE.Color, opts: { bottom?: boolean; top?: THREE.Color } = {}) {
    const mid = V();
    for (const q of p) mid.add(q);
    mid.divideScalar(8);
    const o = V();
    const face = (a: number, b: number, c: number, d: number, col: THREE.Color) => {
      o.copy(p[a]).add(p[b]).add(p[c]).add(p[d]).divideScalar(4).sub(mid);
      this.quad(p[a], p[b], p[c], p[d], col, o);
    };
    face(4, 5, 6, 7, opts.top ?? color);
    face(0, 1, 5, 4, color);
    face(1, 2, 6, 5, color);
    face(2, 3, 7, 6, color);
    face(3, 0, 4, 7, color);
    if (opts.bottom) face(0, 3, 2, 1, color);
  }

  /** An axis-aligned box (optionally turned about y). */
  box(cx: number, cy: number, cz: number, w: number, h: number, d: number, color: THREE.Color, yaw = 0, opts: { bottom?: boolean } = {}) {
    const c = Math.cos(yaw);
    const s = Math.sin(yaw);
    const corner = (sx: number, sy: number, sz: number) => {
      const x = sx * w * 0.5;
      const z = sz * d * 0.5;
      return V(cx + x * c + z * s, cy + sy * h * 0.5, cz - x * s + z * c);
    };
    this.block(
      [corner(-1, -1, -1), corner(1, -1, -1), corner(1, -1, 1), corner(-1, -1, 1), corner(-1, 1, -1), corner(1, 1, -1), corner(1, 1, 1), corner(-1, 1, 1)],
      color,
      opts,
    );
  }

  /**
   * A timber that wanders: bowed a little along its length, each part of it a touch off true and
   * its section twisting slightly, in 0.4 m runs. `w` is the width across `up`'s side, `h` the other.
   */
  timber(rng: () => number, a: THREE.Vector3, b: THREE.Vector3, w: number, h: number, color: THREE.Color, opts: { bow?: number; wander?: number; far?: boolean } = {}) {
    const d = V().subVectors(b, a);
    const len = d.length();
    if (len < 1e-4) return;
    d.divideScalar(len);
    const ref = Math.abs(d.y) < 0.9 ? V(0, 1, 0) : V(1, 0, 0);
    const p1 = V().crossVectors(d, ref).normalize();
    const p2 = V().crossVectors(d, p1).normalize();
    const segs = opts.far ? 1 : Math.max(2, Math.round(len / 0.4));
    const bow = (opts.bow ?? 0.012) * (rng() < 0.5 ? -1 : 1) * (0.5 + rng());
    const bowDir = rng() < 0.5 ? p1 : p2;
    const wander = opts.wander ?? 0.004;
    const rings: THREE.Vector3[][] = [];
    const tones: THREE.Color[] = [];
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      const c = V().copy(a).addScaledVector(d, len * t).addScaledVector(bowDir, bow * Math.sin(Math.PI * t));
      if (i > 0 && i < segs) c.addScaledVector(p1, (rng() - 0.5) * wander * 2).addScaledVector(p2, (rng() - 0.5) * wander * 2);
      const tw = (rng() - 0.5) * 0.08;
      const cs = Math.cos(tw);
      const sn = Math.sin(tw);
      const ring: THREE.Vector3[] = [];
      for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        const x = sx * w * 0.5 * (0.97 + rng() * 0.06);
        const y = sy * h * 0.5 * (0.97 + rng() * 0.06);
        ring.push(V().copy(c).addScaledVector(p1, x * cs - y * sn).addScaledVector(p2, x * sn + y * cs));
      }
      rings.push(ring);
      tones.push(color.clone().offsetHSL(0, 0, (rng() - 0.5) * 0.04));
    }
    for (let i = 0; i < segs; i++) {
      for (let k = 0; k < 4; k++) {
        const k2 = (k + 1) % 4;
        const mid = V().copy(rings[i][k]).add(rings[i][k2]).add(rings[i + 1][k]).add(rings[i + 1][k2]).divideScalar(4);
        const centre = V().copy(rings[i][0]).add(rings[i][2]).add(rings[i + 1][0]).add(rings[i + 1][2]).divideScalar(4);
        this.quad(rings[i][k], rings[i][k2], rings[i + 1][k2], rings[i + 1][k], tones[i], mid.sub(centre));
      }
    }
    const end = (ring: THREE.Vector3[], dir: THREE.Vector3, col: THREE.Color) => this.quad(ring[0], ring[1], ring[2], ring[3], col, dir);
    end(rings[0], V().copy(d).negate(), tones[0]);
    end(rings[segs], d, color.clone().lerp(new THREE.Color('#d9c9a8'), 0.25)); // the sawn end, paler
  }

  /**
   * A rough block of stone: a box with its corners pushed about, its top edges drawn in a little
   * and the whole turned a few degrees, so no two are the same. `drawn` is the faces to build
   * (the others are hidden, or too far to see).
   */
  stone(rng: () => number, cx: number, cy: number, cz: number, w: number, h: number, d: number, color: THREE.Color, opts: { yaw?: number; faces?: 'all' | 'front'; out?: THREE.Vector3 } = {}) {
    const yaw = (opts.yaw ?? 0) + (rng() - 0.5) * 0.14;
    const c = Math.cos(yaw);
    const s = Math.sin(yaw);
    const j = () => (rng() - 0.5) * 0.14;
    const corner = (sx: number, sy: number, sz: number) => {
      const shrink = sy > 0 ? 0.9 : 1; // the top edges rounded in
      const x = sx * w * 0.5 * (1 + j()) * shrink;
      const z = sz * d * 0.5 * (1 + j()) * shrink;
      return V(cx + x * c + z * s, cy + sy * h * 0.5 * (1 + j() * 0.6), cz - x * s + z * c);
    };
    const p = [corner(-1, -1, -1), corner(1, -1, -1), corner(1, -1, 1), corner(-1, -1, 1), corner(-1, 1, -1), corner(1, 1, -1), corner(1, 1, 1), corner(-1, 1, 1)];
    if (opts.faces === 'front' && opts.out) {
      // Just the face toward the viewer (and the top edge's slope): a far-off wall is a bumpy sheet.
      const o = opts.out;
      const idx = Math.abs(o.z) >= Math.abs(o.x) ? (o.z > 0 ? [2, 3, 7, 6] : [0, 1, 5, 4]) : o.x > 0 ? [1, 2, 6, 5] : [3, 0, 4, 7];
      this.quad(p[idx[0]], p[idx[1]], p[idx[2]], p[idx[3]], color, o);
      return;
    }
    this.block(p, color, { top: color.clone().offsetHSL(0, 0, 0.03) });
  }

  /** An upright frustum (a barrel stave ring, a stump, a bottle): `sides` flat faces, radius r0 at the bottom and r1 at the top, with a top cap. */
  prism(cx: number, cy: number, cz: number, r0: number, r1: number, h: number, sides: number, color: THREE.Color, opts: { top?: THREE.Color; yaw?: number; squash?: number } = {}) {
    const yaw = opts.yaw ?? 0;
    const sq = opts.squash ?? 1;
    const ring = (r: number, y: number) => Array.from({ length: sides }, (_, i) => V(cx + Math.cos(yaw + (i / sides) * Math.PI * 2) * r, y, cz + Math.sin(yaw + (i / sides) * Math.PI * 2) * r * sq));
    const a = ring(r0, cy);
    const b = ring(r1, cy + h);
    for (let i = 0; i < sides; i++) {
      const j = (i + 1) % sides;
      const m = yaw + ((i + 0.5) / sides) * Math.PI * 2;
      this.quad(a[i], a[j], b[j], b[i], color, V(Math.cos(m), 0, Math.sin(m)));
    }
    const top = V(cx, cy + h, cz);
    for (let i = 0; i < sides; i++) this.tri(b[i], b[(i + 1) % sides], top, opts.top ?? color, V(0, 1, 0));
  }

  /** The geometry (position, normal and colour: flat shaded). Null if nothing was added. */
  geometry(): THREE.BufferGeometry | null {
    if (!this.pos.length) return null;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.nor, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.col, 3));
    return g;
  }

  get triangles(): number {
    return this.pos.length / 9;
  }
}

/** A colour from a hex string, nudged in lightness and a touch in hue (each piece its own tone). */
export function tone(hex: string, rng: () => number, amount = 0.05): THREE.Color {
  return new THREE.Color(hex).offsetHSL((rng() - 0.5) * amount * 0.25, (rng() - 0.5) * amount, (rng() - 0.5) * amount);
}

/** A hand-laid run of values summing to `total`: each between `lo` and `hi` (the last takes up the slack). */
export function run(rng: () => number, total: number, lo: number, hi: number): number[] {
  const out: number[] = [];
  let left = total;
  while (left > hi * 1.15) {
    const v = lerp(lo, hi, rng());
    out.push(v);
    left -= v;
  }
  if (left > 0.02) out.push(left);
  return out;
}
