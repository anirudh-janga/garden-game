import * as THREE from 'three';
import { lerp } from '../core/random';
import type { FlowerMesh } from './flowerMesh';
import type { FlowerSpecies, LeafHabit, SmallBloom } from './flowerSpecies';

/**
 * The shapes of the plants the atlas added (docs/flower-atlas.md): shrubs, proteas, spathes, bird
 * of paradise, orchids, trumpets, brushes, umbels and spires, and the leaves that go with them.
 *
 * Everything is built from a few parts, so that each plant is put together the way the real one
 * is: **leaves** by habit (a strap-leaved clump, paddles on stalks, a rosette, a sword fan…), a
 * **bloom** drawn upright at a point and then turned to face where it should (a ring of petals, a
 * double, a trumpet, a bell, a brush of stamens, a dome of florets), and a **habit** that carries
 * the blooms (a leafy shrub, a bare scape, an arching spray, a spire). Far off, each part has a
 * plainer stand-in of the same outline and colour.
 */

const UP = new THREE.Vector3(0, 1, 0);
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const GOLD = 2.39996;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** What the shape builders in `flowers.ts` lend this file (passed in, so the two files needn't import each other). */
export interface Helpers {
  petal: (m: FlowerMesh, hinge: THREE.Vector3, az: number, open: number, len: number, width: number, cupIn: number, closeTo: number, rng: () => number, style?: { notch?: boolean; pointed?: boolean; blotch?: number; round?: boolean; reflex?: number }) => void;
  strip: (m: FlowerMesh, a: THREE.Vector3, b: THREE.Vector3, w: number, color?: THREE.Color) => void;
  stem: (m: FlowerMesh, height: number, lean: THREE.Vector3, rng: () => number, withLeaves?: boolean) => THREE.Vector3;
  isFar: () => boolean;
  /** Run `fn` with petals in their light form (six triangles each): for blooms that come by the dozen. */
  light: (fn: () => void) => void;
  HEAD: number;
  LEAF: THREE.Color;
  STEM: THREE.Color;
  WHITE: THREE.Color;
}

type Form<K extends FlowerSpecies['form']['kind']> = Extract<FlowerSpecies['form'], { kind: K }>;

// --- Small tools ---------------------------------------------------------------------------------

/** Two directions square to `a` (and to each other). */
function square(a: THREE.Vector3): [THREE.Vector3, THREE.Vector3] {
  const u = V().crossVectors(a, Math.abs(a.y) > 0.92 ? V(1, 0, 0) : UP).normalize();
  return [u, V().crossVectors(a, u).normalize()];
}

/** A direction on the upper part of a ball: the i-th of n spread evenly from the pole down to `polar` radians. */
function ballDir(i: number, n: number, polar: number, phase = 0): THREE.Vector3 {
  const y = 1 - ((i + 0.5) / n) * (1 - Math.cos(polar));
  const r = Math.sqrt(Math.max(0, 1 - y * y));
  return V(Math.cos(i * GOLD + phase) * r, y, Math.sin(i * GOLD + phase) * r);
}

/** A twig or stalk seen from any side: two ribbons crossed. */
function twig(m: FlowerMesh, a: THREE.Vector3, b: THREE.Vector3, r: number, color: THREE.Color, taper = 0.7) {
  const d = V().subVectors(b, a);
  if (d.lengthSq() < 1e-10) return;
  const [u, v] = square(d.normalize());
  for (const s of [u, v]) {
    const a0 = a.clone().addScaledVector(s, -r);
    const a1 = a.clone().addScaledVector(s, r);
    const b0 = b.clone().addScaledVector(s, -r * taper);
    const b1 = b.clone().addScaledVector(s, r * taper);
    m.tri(a0, b0, b1, { color });
    m.tri(a0, b1, a1, { color });
  }
}

type LeafShape = 'lance' | 'ovate' | 'strap' | 'paddle';
const OUTLINE: Record<LeafShape, [number, number][]> = {
  lance: [[0, 0.12], [0.42, 1], [1, 0]],
  ovate: [[0, 0.15], [0.3, 1], [0.7, 0.72], [1, 0]],
  strap: [[0, 0.7], [0.3, 1], [0.72, 0.8], [1, 0]],
  paddle: [[0, 0.12], [0.22, 0.86], [0.6, 1], [0.88, 0.6], [1, 0]],
};

/**
 * One leaf: from `base` along `dir`, `len` long and `half` wide at its widest (each side), its
 * tip drooping by `droop` of its length. In the plant's own green unless given a colour.
 */
function leaf(m: FlowerMesh, H: Helpers, base: THREE.Vector3, dir: THREE.Vector3, len: number, half: number, o: { shape?: LeafShape; droop?: number; color?: THREE.Color; side?: THREE.Vector3; dark?: number } = {}) {
  const side = o.side ?? V().crossVectors(dir, UP);
  if (side.lengthSq() < 1e-6) side.set(1, 0, 0);
  side.normalize();
  const droop = o.droop ?? 0.25;
  const color = o.color ?? H.LEAF;
  let stations = OUTLINE[o.shape ?? 'lance'];
  if (H.isFar()) stations = [stations[0], stations[Math.ceil(stations.length / 2) - 1], stations[stations.length - 1]];
  const at = (t: number, k: number) => base.clone().addScaledVector(dir, len * t).addScaledVector(UP, -droop * len * t * t).addScaledVector(side, k);
  const sh = (t: number) => lerp(o.dark ?? 0.72, 1.06, t);
  for (let i = 0; i + 1 < stations.length; i++) {
    const [t0, w0] = stations[i];
    const [t1, w1] = stations[i + 1];
    const l0 = at(t0, -w0 * half);
    const r0 = at(t0, w0 * half);
    if (w1 === 0) {
      m.tri(l0, at(t1, 0), r0, { color, shade: [sh(t0), sh(t1), sh(t0)] });
    } else {
      const l1 = at(t1, -w1 * half);
      const r1 = at(t1, w1 * half);
      m.tri(l0, l1, r1, { color, shade: [sh(t0), sh(t1), sh(t1)] });
      m.tri(l0, r1, r0, { color, shade: [sh(t0), sh(t1), sh(t0)] });
    }
  }
}

/**
 * A little flower made of single triangles: `k` petals from the point `q`, opened `cone` radians
 * from its `axis` (small: a funnel or a bell; over a right angle: a flat star). Pointed petals are
 * a kite each. The petals take the plant's colour (`edge` 0…1 blends to its second colour).
 */
function floret(m: FlowerMesh, H: Helpers, q: THREE.Vector3, axis: THREE.Vector3, k: number, len: number, wid: number, cone: number, rng: () => number, o: { pointed?: boolean; edge?: number; hinge?: THREE.Vector3 } = {}) {
  const [u, v] = square(axis);
  const off = rng() * Math.PI * 2;
  const e = o.edge ?? 0;
  const hinge = o.hinge ?? q;
  const opts = (s: [number, number, number]) => ({ color: H.WHITE, petal: true, hinge, axis: UP, close: 0, shade: s, edge: [e, e, e] as [number, number, number] });
  for (let i = 0; i < k; i++) {
    const th = off + (i / k) * Math.PI * 2;
    const r = u.clone().multiplyScalar(Math.cos(th)).addScaledVector(v, Math.sin(th));
    const t = u.clone().multiplyScalar(-Math.sin(th)).addScaledVector(v, Math.cos(th));
    const out = axis.clone().multiplyScalar(Math.cos(cone)).addScaledVector(r, Math.sin(cone));
    const tip = q.clone().addScaledVector(out, len);
    if (H.isFar()) {
      // (Far off, one triangle each.)
      m.tri(q, tip.clone().addScaledVector(t, -wid), tip.clone().addScaledVector(t, wid), opts([0.72, 1.02, 1.02]));
      continue;
    }
    // (A kite each: slender and pointed, or broad with its widest part near the tip.)
    const mid = q.clone().addScaledVector(out, len * (o.pointed ? 0.5 : 0.66));
    const w = wid * (o.pointed ? 1 : 1.15);
    m.tri(q, mid.clone().addScaledVector(t, -w), tip, opts([0.74, 0.95, 1.04]));
    m.tri(q, tip, mid.clone().addScaledVector(t, w), opts([0.74, 1.04, 0.95]));
  }
}

/** A few-sided funnel or bell wall from the point `q` (narrow) to a rim, in the plant's colour: the tube behind a floret. */
function tubeWall(m: FlowerMesh, H: Helpers, q: THREE.Vector3, axis: THREE.Vector3, len: number, r0: number, r1: number, sides: number, edge = 0, hinge?: THREE.Vector3) {
  const [u, v] = square(axis);
  const ring = (r: number, along: number) => Array.from({ length: sides }, (_, i) => q.clone().addScaledVector(axis, along).addScaledVector(u, Math.cos((i / sides) * Math.PI * 2) * r).addScaledVector(v, Math.sin((i / sides) * Math.PI * 2) * r));
  const a = ring(r0, 0);
  const b = ring(r1, len);
  const opt = { color: H.WHITE, petal: true, hinge: hinge ?? q, axis: UP, close: 0, edge: [edge * 0.3, edge, edge] as [number, number, number] };
  for (let i = 0; i < sides; i++) {
    const j = (i + 1) % sides;
    m.tri(a[i], b[i], b[j], { ...opt, shade: [0.72, 1, 1] });
    if (r0 > 1e-4) m.tri(a[i], b[j], a[j], { ...opt, shade: [0.72, 1, 0.72], edge: [edge * 0.3, edge, edge * 0.3] });
  }
}

/** A solid of a fixed colour (a boss of stamens, a spadix, a seed). */
const solid = (m: FlowerMesh, g: THREE.BufferGeometry, color: string | THREE.Color, hinge: THREE.Vector3) => m.addGeometry(g, new THREE.Color(color), false, hinge);
/** A solid in the plant's own colour. */
const tinted = (m: FlowerMesh, H: Helpers, g: THREE.BufferGeometry, hinge: THREE.Vector3, edge = 0) => m.addGeometry(g, H.WHITE, true, hinge, edge);

// --- Leaves by habit -----------------------------------------------------------------------------

/**
 * The leaves at the foot of a plant, the way that plant carries them. Sizes follow the plant's
 * height but stay within what such leaves really measure.
 */
export function basalLeaves(m: FlowerMesh, H: Helpers, habit: LeafHabit, height: number, rng: () => number, tint?: THREE.Color) {
  if (habit === 'none' || habit === 'leathery') return;
  const far = H.isFar();
  const base = V();
  const out = (az: number) => V(Math.cos(az), 0, Math.sin(az));
  const rising = (az: number, deg: number) => out(az).multiplyScalar(Math.cos((deg * Math.PI) / 180)).addScaledVector(UP, Math.sin((deg * Math.PI) / 180));
  switch (habit) {
    case 'strap': {
      // A fountain of long arching blades (agapanthus, clivia, nerine, amaryllis).
      const n = far ? 5 : 9;
      const L = clamp(height * 0.62, 0.2, 0.55);
      for (let i = 0; i < n; i++) leaf(m, H, base, rising(i * GOLD + rng() * 0.4, lerp(48, 78, rng())), L * lerp(0.75, 1.15, rng()), L * 0.045 + 0.007, { shape: 'strap', droop: lerp(0.55, 0.95, rng()), color: tint });
      break;
    }
    case 'sword': {
      // An upright fan of sword blades, all in one plane (iris, crocosmia, freesia).
      const n = far ? 3 : 6;
      const L = clamp(height * 0.78, 0.18, 0.78);
      const az0 = rng() * Math.PI;
      for (let i = 0; i < n; i++) {
        const k = n > 1 ? i / (n - 1) - 0.5 : 0;
        leaf(m, H, base.clone().addScaledVector(out(az0), k * 0.05), rising(az0 + (k < 0 ? Math.PI : 0), 90 - Math.abs(k) * 34 - rng() * 4), L * lerp(0.7, 1.05, rng()), L * 0.028 + 0.006, { shape: 'strap', droop: 0.1, side: out(az0 + Math.PI / 2), color: tint });
      }
      break;
    }
    case 'paddle': {
      // Big blades held up on stalks (bird of paradise, canna, the gingers).
      const n = far ? 2 : 4;
      const L = clamp(height * 0.48, 0.2, 0.5);
      for (let i = 0; i < n; i++) {
        const az = i * GOLD + rng() * 0.5;
        const top = out(az).multiplyScalar(lerp(0.06, 0.13, rng())).add(V(0, clamp(height * lerp(0.38, 0.55, rng()), 0.12, 0.6), 0));
        twig(m, base, top, 0.006, H.STEM);
        leaf(m, H, top, rising(az, lerp(38, 62, rng())), L * lerp(0.85, 1.1, rng()), L * 0.21, { shape: 'paddle', droop: lerp(0.3, 0.6, rng()), color: tint });
      }
      break;
    }
    case 'rosette': {
      // Broad leaves spread flat round the crown (gerbera, primula, African violet).
      const n = far ? 5 : 9;
      const L = clamp(height * 0.85, 0.07, 0.17);
      for (let i = 0; i < n; i++) leaf(m, H, base.clone().add(V(0, 0.004, 0)), rising(i * GOLD + rng() * 0.3, lerp(8, 26, rng())), L * lerp(0.8, 1.15, rng()), L * 0.24, { shape: 'ovate', droop: 0.2, color: tint });
      break;
    }
    case 'feathery': {
      // Finely cut leaves: a stalk with pairs of slivers (poppies, cosmos, love-in-a-mist).
      const n = far ? 3 : 6;
      const L = clamp(height * 0.55, 0.07, 0.28);
      const color = tint ?? H.LEAF;
      for (let i = 0; i < n; i++) {
        const az = i * GOLD + rng() * 0.4;
        const dir = rising(az, lerp(30, 60, rng()));
        const side = out(az + Math.PI / 2);
        const len = L * lerp(0.75, 1.1, rng());
        const pt = (t: number) => base.clone().addScaledVector(dir, len * t).addScaledVector(UP, -0.3 * len * t * t);
        const pairs = far ? 2 : 4;
        for (let p = 0; p < pairs; p++) {
          const t = (p + 1) / (pairs + 1);
          const a = pt(t);
          const b = pt(t + 0.1);
          const reach = len * 0.3 * (1 - t * 0.5);
          for (const sg of [-1, 1]) m.tri(a, a.clone().addScaledVector(side, sg * reach).addScaledVector(dir, len * 0.13), b, { color, shade: [0.8, 1.05, 0.9] });
        }
        m.tri(pt(0), pt(0.5).addScaledVector(side, len * 0.02), pt(1), { color, shade: [0.75, 0.9, 1.05] });
      }
      break;
    }
    case 'heart': {
      // Heart- or arrow-shaped blades on stalks (calla, anthurium, violets).
      const n = far ? 2 : 4;
      const L = clamp(height * 0.34, 0.05, 0.2);
      const color = tint ?? H.LEAF;
      for (let i = 0; i < n; i++) {
        const az = i * GOLD + rng() * 0.6;
        const d = out(az);
        const side = out(az + Math.PI / 2);
        const top = d.clone().multiplyScalar(lerp(0.03, 0.08, rng())).add(V(0, clamp(height * lerp(0.3, 0.5, rng()), 0.03, 0.35), 0));
        twig(m, base, top, 0.004, H.STEM);
        const fwd = d.clone().multiplyScalar(0.92).addScaledVector(UP, 0.38).normalize();
        const tip = top.clone().addScaledVector(fwd, L).addScaledVector(UP, -L * 0.18);
        const w = L * 0.44;
        for (const sg of [-1, 1]) {
          const shoulder = top.clone().addScaledVector(side, sg * w).addScaledVector(fwd, L * 0.22);
          const lobe = top.clone().addScaledVector(side, sg * w * 0.62).addScaledVector(fwd, -L * 0.2);
          m.tri(top, shoulder, tip, { color, shade: [0.8, 1, 1.06] });
          m.tri(top, lobe, shoulder, { color, shade: [0.8, 0.92, 1] });
        }
      }
      break;
    }
    case 'whorl': {
      // Three broad leaves in a ring round the stem, just under the flower (trillium).
      const L = clamp(height * 0.5, 0.06, 0.15);
      const a0 = rng() * 6;
      for (let i = 0; i < 3; i++) leaf(m, H, V(0, height * 0.74, 0), rising(a0 + i * 2.094 + (rng() - 0.5) * 0.2, lerp(8, 20, rng())), L * lerp(0.9, 1.1, rng()), L * 0.36, { shape: 'ovate', droop: 0.25, color: tint });
      break;
    }
    case 'succulent': {
      // A rosette of thick, pointed, grey-green leaves (aloe).
      const n = far ? 6 : 11;
      const L = clamp(height * 0.36, 0.12, 0.3);
      const color = (tint ?? H.LEAF).clone().lerp(new THREE.Color('#7f9f86'), 0.45);
      for (let i = 0; i < n; i++) leaf(m, H, base, rising(i * GOLD, i < n / 2 ? lerp(18, 32, rng()) : lerp(45, 65, rng())), L * lerp(0.8, 1.1, rng()), L * 0.14, { shape: 'lance', droop: -0.12, color, dark: 0.8 });
      break;
    }
  }
}

/** Leaves up a stem: stiff and broad (a protea's), or plain (lance). Alternate, a golden angle apart. */
function stemLeaves(m: FlowerMesh, H: Helpers, height: number, lean: THREE.Vector3, rng: () => number, o: { count: number; len: number; half: number; from?: number; to?: number; rise?: number; shape?: LeafShape; color?: THREE.Color }) {
  const n = H.isFar() ? Math.ceil(o.count * 0.45) : o.count;
  const rise = ((o.rise ?? 50) * Math.PI) / 180;
  const a0 = rng() * 6;
  for (let i = 0; i < n; i++) {
    const t = lerp(o.from ?? 0.2, o.to ?? 0.9, n > 1 ? i / (n - 1) : 0.5);
    const az = a0 + i * GOLD;
    const p = V(lean.x * t * t, height * t, lean.z * t * t);
    const dir = V(Math.cos(az) * Math.cos(rise), Math.sin(rise), Math.sin(az) * Math.cos(rise));
    leaf(m, H, p, dir, o.len * lerp(0.85, 1.15, rng()), o.half, { shape: o.shape ?? 'ovate', droop: 0.18, color: o.color });
  }
}

// --- Blooms --------------------------------------------------------------------------------------

/** Far off, a bloom is a little faceted cup or star of its colour. */
function farBloom(m: FlowerMesh, H: Helpers, p: THREE.Vector3, s: number, n: number, cone: number) {
  floret(m, H, p, UP, Math.min(5, Math.max(3, n)), s, s * 0.55, cone, () => 0.3);
}

/**
 * One bloom, drawn upright at `p` (turn it with `m.setTilt` to face elsewhere), `s` its petal
 * length in metres.
 */
function drawBloom(m: FlowerMesh, H: Helpers, b: SmallBloom, p: THREE.Vector3, s: number, rng: () => number) {
  const far = H.isFar();
  const n = b.petals ?? 5;
  const ringAt = (az: number, r: number, y = 0) => p.clone().add(V(Math.cos(az) * r, y, Math.sin(az) * r));
  switch (b.type) {
    case 'single': {
      // A ring of broad petals round a boss of stamens (camellia, rock rose, cherry, frangipani, oleander).
      const open = b.open ?? 1.2;
      if (far) {
        farBloom(m, H, p, s, n, open);
        if (b.centre) solid(m, new THREE.TetrahedronGeometry(s * 0.2, 0).translate(p.x, p.y + s * 0.08, p.z), b.centre, p);
        break;
      }
      const off = rng() * 6;
      for (let i = 0; i < n; i++) {
        const az = off + (i / n) * Math.PI * 2 + (rng() - 0.5) * 0.12;
        H.petal(m, ringAt(az, s * 0.07), az, open + (rng() - 0.5) * 0.14, s * lerp(0.92, 1.08, rng()), s * (b.pointed ? 0.5 : 0.82), b.cup ?? 0.06, 0.1, rng, { round: !b.pointed, pointed: b.pointed, blotch: b.blotch });
      }
      if (b.centre) solid(m, new THREE.OctahedronGeometry(s * 0.17, 0).scale(1, 0.7, 1).translate(p.x, p.y + s * 0.07, p.z), b.centre, p);
      break;
    }
    case 'double': {
      // Petals in rings, each ring smaller and more upright, round a closed heart (camellia, gardenia, begonia).
      if (far) {
        tinted(m, H, new THREE.OctahedronGeometry(s * 0.75, 0).scale(1, 0.55, 1).translate(p.x, p.y + s * 0.2, p.z), p);
        break;
      }
      const layers = 3;
      for (let k = 0; k < layers; k++) {
        const f = k / (layers - 1);
        const cnt = Math.max(3, (b.petals ?? 6) - k - (k === 2 ? 1 : 0));
        const off = rng() * 6;
        for (let i = 0; i < cnt; i++) {
          const az = off + (i / cnt) * Math.PI * 2;
          H.petal(m, ringAt(az, s * 0.1 * (1 - f * 0.6), f * s * 0.14), az, lerp(1.28, 0.42, f) + (rng() - 0.5) * 0.1, s * lerp(1, 0.6, f), s * lerp(0.86, 0.62, f), 0.1 + f * 0.15, 0.1, rng, { round: true });
        }
      }
      tinted(m, H, new THREE.OctahedronGeometry(s * 0.2, 0).translate(p.x, p.y + s * 0.3, p.z), p, 0.2);
      break;
    }
    case 'trumpet': {
      // Petals joined in a funnel and rolled back at the rim, a column or a cluster of stamens in the throat.
      // (A long narrow tube first, for an angel's trumpet.)
      const tube = (b.tube ?? 0) * s;
      const base = p.clone();
      if (tube) {
        tubeWall(m, H, base, UP, tube, s * 0.07, s * 0.22, far ? 4 : 5, 0);
        p = p.clone().add(V(0, tube * 0.86, 0));
      }
      if (far) {
        tubeWall(m, H, p, UP, s * 1.05, s * (tube ? 0.2 : 0.1), s * 0.85, 5, 0.6, base);
      } else {
        const off = rng() * 6;
        for (let i = 0; i < n; i++) {
          const az = off + (i / n) * Math.PI * 2;
          H.petal(m, ringAt(az, s * (tube ? 0.18 : 0.1)), az, (b.open ?? 0.5) + (rng() - 0.5) * 0.08, s * 1.32 * lerp(0.94, 1.06, rng()), s * (n > 5 ? 0.6 : 0.78), 0, 0.08, rng, { round: true, reflex: 1.0 });
        }
        // The throat: closed in behind the petals' narrow bases.
        if (!tube) tubeWall(m, H, p.clone().add(V(0, -s * 0.12, 0)), UP, s * 0.6, s * 0.05, s * 0.3, 5, 0);
      }
      if (b.centre) {
        const c = new THREE.Color(b.centre);
        if (b.column) {
          // A long column standing out of the flower, anthers at its tip (hibiscus).
          twig(m, p, p.clone().add(V(0, s * 1.5, 0)), s * 0.03, c, 0.8);
          if (!far) for (let i = 0; i < 4; i++) solid(m, new THREE.TetrahedronGeometry(s * 0.07, 0).translate(p.x + Math.cos(i * 1.57) * s * 0.07, p.y + s * (1.25 + i * 0.07), p.z + Math.sin(i * 1.57) * s * 0.07), c, p);
        } else if (!far) {
          for (let i = 0; i < 3; i++) twig(m, p, ringAt(i * 2.1, s * 0.16, s * 0.95), s * 0.014, c, 1);
        }
      }
      break;
    }
    case 'bell': {
      // A bell, mouth up here (hung by turning it over): waisted, with a flared, scalloped rim.
      const sides = far ? 4 : 6;
      tubeWall(m, H, p, UP, s * 0.35, s * 0.2, s * 0.42, sides, 0);
      tubeWall(m, H, p.clone().add(V(0, s * 0.35, 0)), UP, s * 0.85, s * 0.42, s * 0.52, sides, 0.5, p);
      if (!far) floret(m, H, p.clone().add(V(0, s * 1.2, 0)), UP, sides, s * 0.3, s * 0.2, 1.0, rng, { pointed: true, edge: 1, hinge: p });
      if (b.centre && !far) twig(m, p, p.clone().add(V(0, s * 1.25, 0)), s * 0.03, new THREE.Color(b.centre), 1);
      break;
    }
    case 'brush': {
      // A puff of long stamens, no petals to speak of (pōhutukawa, bee balm).
      const cnt = far ? 12 : (b.florets ?? 40);
      for (let i = 0; i < cnt; i++) {
        const d = ballDir(i, cnt, 1.75, 0.5);
        const [u] = square(d);
        const tip = p.clone().addScaledVector(d, s * lerp(0.8, 1.1, rng()));
        const w = s * (far ? 0.12 : 0.07);
        m.tri(p.clone().addScaledVector(u, -w), tip, p.clone().addScaledVector(u, w), { color: H.WHITE, petal: true, hinge: p, axis: UP, close: 0, shade: [0.7, 1.05, 0.7], edge: [0, 1, 0] });
      }
      break;
    }
    case 'cluster': {
      // A head of many small flowers (plumbago, lantana, ixora, hebe, lilac).
      const cnt = far ? Math.max(3, Math.ceil((b.florets ?? 9) * 0.4)) : (b.florets ?? 9);
      const polar = b.open ?? 1.25;
      for (let i = 0; i < cnt; i++) {
        const d = ballDir(i, cnt, polar, 1.1);
        const q = p.clone().addScaledVector(d, s * (b.tall ? 0.5 : 0.62)).add(V(0, b.tall ? (1 - i / cnt) * s * b.tall : 0, 0));
        // (The middle florets open last: in a two-coloured head they are the second colour.)
        floret(m, H, q, d.clone().add(V(0, 0.5, 0)).normalize(), far ? 3 : n, s * (far ? 0.62 : 0.4), s * (far ? 0.4 : 0.2), 1.15, rng, { edge: i < cnt * 0.35 ? 1 : 0, hinge: p, pointed: b.pointed });
      }
      break;
    }
    case 'bracts': {
      // Three papery, pointed bracts round a little cream flower (bougainvillea).
      if (far) {
        farBloom(m, H, p, s, 3, 1.15);
        break;
      }
      const off = rng() * 6;
      for (let i = 0; i < 3; i++) H.petal(m, p.clone(), off + i * 2.094, 1.12 + (rng() - 0.5) * 0.2, s, s * 0.85, 0.1, 0.1, rng, { pointed: true });
      solid(m, new THREE.TetrahedronGeometry(s * 0.12, 0).translate(p.x, p.y + s * 0.1, p.z), b.centre ?? '#f6efcf', p);
      break;
    }
    case 'pom': {
      // A fluffy ball (wattle).
      tinted(m, H, (far ? new THREE.TetrahedronGeometry(s * 1.1, 0) : new THREE.IcosahedronGeometry(s, 0)).translate(p.x, p.y + s * 0.5, p.z), p);
      break;
    }
    case 'star': {
      // Narrow petals laid out flat (jasmine, tiaré).
      if (far) {
        farBloom(m, H, p, s, n, 1.4);
        break;
      }
      const off = rng() * 6;
      for (let i = 0; i < n; i++) H.petal(m, p.clone(), off + (i / n) * Math.PI * 2, 1.38 + (rng() - 0.5) * 0.12, s, s * 0.36, 0, 0.1, rng, {});
      if (b.centre) solid(m, new THREE.TetrahedronGeometry(s * 0.12, 0).translate(p.x, p.y + s * 0.05, p.z), b.centre, p);
      break;
    }
  }
}

/** Draw a bloom at `p`, turned to face along `dir`. */
function bloomFacing(m: FlowerMesh, H: Helpers, b: SmallBloom, p: THREE.Vector3, dir: THREE.Vector3, s: number, rng: () => number) {
  const d = dir.clone().normalize();
  m.setTilt(p, new THREE.Quaternion().setFromUnitVectors(UP, d));
  // (Hung mouth-down, a bloom shows its outside to the sky.)
  m.invert = d.y < -0.2;
  drawBloom(m, H, b, p, s, rng);
  m.invert = false;
  m.setTilt(null, null);
}

// --- Habits --------------------------------------------------------------------------------------

/**
 * A shrub: a few woody stems under a mound of leaves, with blooms set over it facing outward.
 * The mound has a dark heart, so it reads as a solid bush and not a handful of twigs; a bare shrub
 * (quince and cherry in blossom) is its branches and flowers alone.
 */
function shrub(m: FlowerMesh, H: Helpers, f: Form<'bush'>, height: number, rng: () => number): number {
  const far = H.isFar();
  // (A shrub is about as wide as it is tall.)
  const R = Math.max(f.radius, height * (f.leaf === 'bare' ? 0.3 : 0.36));
  const bare0 = f.leaf === 'bare';
  const cy = height * (bare0 ? 0.6 : 0.52);
  const ry = height * (bare0 ? 0.4 : 0.48);
  const centre = V(0, cy, 0);
  const wood = new THREE.Color('#6a553c');
  const bare = f.leaf === 'bare';
  // (Its own green, brought a little toward the garden's, so a shrub sits among the other plants.)
  const leafTone = (f.leafColor ? new THREE.Color(f.leafColor) : f.leaf === 'grey' ? new THREE.Color('#7f957a') : new THREE.Color('#3f7a3a')).lerp(H.LEAF, 0.3);
  const shell = (d: THREE.Vector3, k = 1) => V(centre.x + d.x * R * k, centre.y + d.y * ry * k, centre.z + d.z * R * k);
  const outward = (d: THREE.Vector3) => V(d.x / R, d.y / ry, d.z / R).normalize();
  // Woody stems from the ground up into the mound (right out to the flowers on a bare shrub).
  const stems = far ? 3 : bare ? 8 : 4;
  for (let i = 0; i < stems; i++) {
    const d = ballDir(i, stems, 1.35, 0.7);
    const end = shell(d, bare ? 0.95 : 0.55);
    const knee = V(end.x * 0.35, end.y * 0.5, end.z * 0.35);
    twig(m, V(end.x * 0.06, 0, end.z * 0.06), knee, 0.009, wood, 0.8);
    twig(m, knee, end, 0.007, wood, 0.5);
  }
  if (!bare) {
    // The body of the bush: soft overlapping billows of leaf, lit as one rounded mound (lighter
    // where the sun gets in on top, shaded underneath), no two bulges alike.
    const low = centre.y - ry;
    const heart = V(centre.x, centre.y - ry * 0.35, centre.z);
    const billow = (c: THREE.Vector3, rx: number, rh: number, tone: THREE.Color, detail = 0) => {
      const g = new THREE.IcosahedronGeometry(1, detail);
      const pos = g.getAttribute('position');
      const ph = rng() * 6;
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const z = pos.getZ(i);
        const k = 1 + 0.16 * Math.sin(x * 3.1 + ph) * Math.sin(z * 2.7 + ph * 1.7) + 0.1 * Math.sin(y * 4.3 + ph * 0.6);
        // (Flat underneath, and as broad there as at its middle.)
        const yy = Math.max(y, -0.55) * (y < 0 ? 1.4 : 1);
        const r = Math.hypot(x, z);
        const wide = y < -0.05 && r > 0.05 ? Math.max(1, 0.97 / r) * (y < -0.5 ? 0.93 : 1) : 1;
        pts.push(V(c.x + x * k * rx * wide, Math.max(low + 0.01, c.y + yy * k * rh), c.z + z * k * rx * wide));
      }
      const sh = (v: THREE.Vector3) => lerp(0.74, 1.12, clamp((v.y - low) / (2 * ry), 0, 1)) * (0.97 + 0.06 * Math.sin(v.x * 60 + v.z * 47 + v.y * 53));
      for (let i = 0; i < pts.length; i += 3) {
        const [p0, p1, p2] = [pts[i], pts[i + 1], pts[i + 2]];
        const ns = [p0, p1, p2].map((v) => v.clone().sub(heart).normalize()) as [THREE.Vector3, THREE.Vector3, THREE.Vector3];
        m.tri(p0, p1, p2, { color: tone, n: ns[0], ns, shade: [sh(p0), sh(p1), sh(p2)] });
      }
    };
    billow(V(centre.x, centre.y - ry * 0.1, centre.z), R * 0.8, ry * 0.9, leafTone, far ? 0 : 1);
    const billows = far ? 3 : 7;
    for (let i = 0; i < billows; i++) {
      const d = ballDir(i, billows, 2.0, rng() * 6);
      billow(shell(d, 0.52), R * lerp(0.42, 0.56, rng()), ry * lerp(0.4, 0.52, rng()), leafTone.clone().multiplyScalar(lerp(0.9, 1.12, rng())));
    }
    // Leaves standing out of it all over, lying outward and upward like shingles, in tones a little apart.
    const sc = clamp(R / 0.26, 0.5, 1.1);
    const [len0, half0] = f.leaf === 'long' ? [0.17, 0.026] : f.leaf === 'small' || f.leaf === 'grey' ? [0.085, 0.026] : f.leaf === 'needle' ? [0.09, 0.009] : [0.12, 0.038];
    const len = len0 * sc;
    const half = half0 * sc;
    const n = far ? 12 : f.leaf === 'needle' ? 64 : 46;
    for (let i = 0; i < n; i++) {
      const d = ballDir(i, n, 2.0, 0.2);
      const o = outward(d);
      const dir = o.clone().multiplyScalar(0.6).add(V((rng() - 0.5) * 0.9, 0.7, (rng() - 0.5) * 0.9)).normalize();
      leaf(m, H, shell(d, lerp(0.84, 0.98, rng())), dir, len * lerp(0.8, 1.2, rng()) * (far ? 1.7 : 1), half * (far ? 1.9 : 1), { shape: f.leaf === 'long' || f.leaf === 'needle' ? 'lance' : 'ovate', droop: 0.35, color: leafTone.clone().multiplyScalar(lerp(1.0, 1.38, rng())), dark: 0.85 });
    }
  }
  // The blooms, over the top and shoulders (or hanging under its edge).
  const s = f.bloom.size * H.HEAD;
  const n = far ? Math.ceil(f.blooms * 0.55) : f.blooms;
  const draw = () => {
    for (let i = 0; i < n; i++) {
      const d = ballDir(i, n, f.hang ? 1.9 : 1.5, 2.3);
      // (Hanging blooms come out of the bush's shoulders, all the way round.)
      if (f.hang) d.set(Math.cos(i * GOLD), lerp(0.15, 0.6, rng()), Math.sin(i * GOLD));
      const o = outward(d);
      const p = shell(d.normalize(), bare ? lerp(0.6, 1, rng()) : 1.07);
      const dir = f.hang ? V(o.x * 0.35, -1, o.z * 0.35) : o.add(V((rng() - 0.5) * 0.3, 0.25, (rng() - 0.5) * 0.3));
      bloomFacing(m, H, f.bloom, p, dir, s * lerp(0.88, 1.1, rng()) * (far ? 1.25 : 1), rng);
    }
  };
  if (f.bloom.type === 'trumpet' && f.blooms <= 10) draw();
  else H.light(draw);
  return cy + ry;
}

/** A protea, waratah, poinsettia, edelweiss…: stiff pointed bracts in rows round a centre, on a stout leafy stem. */
function bractHead(m: FlowerMesh, H: Helpers, top: THREE.Vector3, f: Form<'bracts'>, rng: () => number) {
  const far = H.isFar();
  const rows = far ? Math.min(2, f.rows) : f.rows;
  const length = f.length * H.HEAD;
  const width = f.width * H.HEAD;
  const c = f.centre;
  const s = c.size * H.HEAD;
  const draw = () => {
    for (let r = 0; r < rows; r++) {
      const k = rows > 1 ? r / (rows - 1) : 0;
      const count = Math.max(4, Math.round(f.per * (1 - k * 0.25) * (far ? 0.6 : 1)));
      // (Outer rows open widest; a cone's rows stand nearly upright, one above the other.)
      const open = f.style === 'cone' ? lerp(f.open, f.open * 0.4, k) : lerp(f.open, f.open * 0.5, k);
      const len = length * (f.style === 'ruff' ? lerp(1, 1.12, k) : lerp(1, 0.7, k));
      const off = rng() * 6;
      const rise = f.style === 'cone' ? k * length * 0.9 : f.style === 'bowl' ? k * length * 0.22 : 0;
      const ring = f.style === 'cone' ? s * lerp(1, 0.35, k) : s * lerp(0.95, 0.5, k);
      for (let i = 0; i < count; i++) {
        const az = off + (i / count) * Math.PI * 2 + (rng() - 0.5) * 0.15;
        H.petal(m, top.clone().add(V(Math.cos(az) * ring, rise, Math.sin(az) * ring)), az, open + (rng() - 0.5) * 0.1, len * lerp(0.9, 1.1, rng()), width * (far ? 1.4 : 1), f.style === 'bowl' || f.style === 'cone' ? 0.12 : 0.02, 0.1, rng, { pointed: true });
      }
    }
  };
  if (rows * f.per > 20) H.light(draw);
  else draw();
  const at = (g: THREE.BufferGeometry, y: number) => g.translate(top.x, top.y + y, top.z);
  switch (c.kind) {
    case 'dome':
      if (c.color) solid(m, at(new THREE.IcosahedronGeometry(s, far ? 0 : 1).scale(1, 0.75, 1), s * 0.35), c.color, top);
      else tinted(m, H, at(new THREE.IcosahedronGeometry(s, far ? 0 : 1).scale(1, 0.75, 1), s * 0.35), top, 0.6);
      break;
    case 'woolly':
      solid(m, at(new THREE.IcosahedronGeometry(s, far ? 0 : 1).scale(1, 0.8, 1), s * 0.35), c.color ?? '#e8e4d2', top);
      break;
    case 'cone':
      solid(m, at(new THREE.ConeGeometry(s, s * 2.2, far ? 5 : 8), s * 1.1), c.color ?? '#8a9a5a', top);
      break;
    case 'beads':
      for (let i = 0; i < (far ? 3 : 7); i++) solid(m, at(new THREE.OctahedronGeometry(s * 0.3, 0), s * 0.25).translate(Math.cos(i * 0.9) * s * 0.65 * (i ? 1 : 0), 0, Math.sin(i * 0.9) * s * 0.65 * (i ? 1 : 0)), c.color ?? '#e8c43a', top);
      break;
    case 'pins': {
      // A cushion bristling with long, in-curving styles (a pincushion protea), each a sliver tipped paler.
      const n = far ? 14 : 46;
      const ctr = top.clone().add(V(0, s * 0.25, 0));
      tinted(m, H, at(new THREE.IcosahedronGeometry(s * 0.7, 0).scale(1, 0.8, 1), s * 0.25), top, 0);
      for (let i = 0; i < n; i++) {
        const d = ballDir(i, n, 1.5, 0.3);
        const [u] = square(d);
        const tip = ctr.clone().addScaledVector(d, s * 1.9).add(V(0, s * 0.25, 0));
        m.tri(ctr.clone().addScaledVector(d, s * 0.5).addScaledVector(u, -s * 0.07), tip, ctr.clone().addScaledVector(d, s * 0.5).addScaledVector(u, s * 0.07), { color: H.WHITE, petal: true, hinge: top, axis: UP, close: 0, shade: [0.8, 1.08, 0.8], edge: [0, 1, 0] });
      }
      break;
    }
    default:
  }
}

/** A calla's rolled funnel, an anthurium's glossy heart, or a cobra lily's striped hood: one sheath round a spadix. */
function spathe(m: FlowerMesh, H: Helpers, top: THREE.Vector3, f: Form<'spathe'>, rng: () => number) {
  const far = H.isFar();
  const s = f.size * H.HEAD;
  const yaw = rng() * Math.PI * 2;
  const turn = (x: number, y: number, z: number) => top.clone().add(V(x * Math.cos(yaw) - z * Math.sin(yaw), y, x * Math.sin(yaw) + z * Math.cos(yaw)));
  const opts = (sh: [number, number, number], e: [number, number, number]) => ({ color: H.WHITE, petal: true, hinge: top, axis: UP, close: 0, shade: sh, edge: e });
  if (f.style === 'flat') {
    // A heart held out flat, the spadix standing from its notch.
    const heart = new THREE.Shape();
    heart.moveTo(0, -1);
    heart.bezierCurveTo(-0.2, -0.6, -1.1, -0.3, -0.95, 0.35);
    heart.bezierCurveTo(-0.8, 0.95, -0.2, 0.9, 0, 0.45);
    heart.bezierCurveTo(0.2, 0.9, 0.8, 0.95, 0.95, 0.35);
    heart.bezierCurveTo(1.1, -0.3, 0.2, -0.6, 0, -1);
    const g = new THREE.ShapeGeometry(heart, far ? 2 : 6).scale(s * 0.85, s * 0.95, 1).rotateX(-Math.PI / 2 + 0.75).rotateY(-yaw).translate(top.x, top.y + s * 0.4, top.z);
    tinted(m, H, g, top);
    twig(m, turn(0, s * 0.42, s * 0.3), turn(s * 0.12, s * 1.25, s * 0.42), s * 0.07, new THREE.Color(f.spadix), 0.5);
    return;
  }
  // A sheet wrapped round the spadix: open down the front, flaring to a point at the back.
  const hood = f.style === 'hood';
  const I = far ? 5 : 9;
  const J = hood ? (far ? 4 : 6) : far ? 2 : 4;
  const A = Math.PI * 0.94;
  const P = (i: number, j: number) => {
    const a = -A + (2 * A * i) / I; // 0 is the back
    const t = j / J;
    const back = Math.max(0, Math.cos(a));
    if (hood) {
      // A tube widening to its mouth; then the sheet draws in from the sides and its back arches
      // forward and over, down to a point, like a cobra's hood.
      if (t <= 0.5) {
        const u = t / 0.5;
        const r = s * lerp(0.1, 0.27, u);
        return turn(Math.sin(a) * r, s * 1.15 * u, -Math.cos(a) * r);
      }
      const k = (t - 0.5) / 0.5;
      const ae = a * (1 - 0.68 * k) * (k > 0.75 ? (1 - k) / 0.25 : 1);
      const r = s * 0.27 * (1 + 0.25 * Math.sin(k * Math.PI));
      return turn(Math.sin(ae) * r, s * (1.15 + 0.5 * Math.sin(k * Math.PI * 0.8)), -Math.cos(ae) * r + s * 0.95 * Math.pow(k, 1.4));
    }
    const r = s * (0.09 + 0.46 * Math.pow(t, 1.7)) + s * 0.3 * t * t * back;
    const y = s * 1.55 * t * (0.66 + 0.5 * Math.pow(back, 1.4));
    return turn(Math.sin(a) * r, y, -Math.cos(a) * r);
  };
  for (let j = 0; j < J; j++) {
    for (let i = 0; i < I; i++) {
      const e0 = j / J;
      const e1 = (j + 1) / J;
      // (A cobra lily is striped down its length.)
      const sh = hood && i % 2 ? 0.72 : 1;
      m.tri(P(i, j), P(i, j + 1), P(i + 1, j + 1), opts([0.8 * sh, sh, sh], [e0, e1, e1]));
      m.tri(P(i, j), P(i + 1, j + 1), P(i + 1, j), opts([0.8 * sh, sh, 0.8 * sh], [e0, e1, e0]));
    }
  }
  const sp = new THREE.Color(f.spadix);
  twig(m, top.clone(), top.clone().add(V(0, s * (hood ? 1.0 : 1.05), 0)), s * (hood ? 0.035 : 0.06), sp, 0.7);
  // (And from the hood's tip, a long thread trailing down.)
  if (hood && !far) twig(m, turn(0, s * 1.44, s * 0.68), turn(0, s * 0.5, s * 1.25), s * 0.018, sp, 0.3);
}

/** A bird of paradise's crest, or a heliconia's ladder of beaks. */
function crane(m: FlowerMesh, H: Helpers, top: THREE.Vector3, f: Form<'crane'>, rng: () => number) {
  const far = H.isFar();
  const s = f.size * H.HEAD;
  const az = rng() * Math.PI * 2;
  const b = V(Math.cos(az), 0, Math.sin(az));
  const side = V(-b.z, 0, b.x);
  if (f.style === 'bird') {
    // The beak: a green boat held out level, flushed red along its keel.
    const beakDir = b.clone().multiplyScalar(0.96).addScaledVector(UP, 0.26).normalize();
    const L = s * 1.7;
    for (const sg of [-1, 1]) leaf(m, H, top.clone().addScaledVector(b, -L * 0.08), beakDir, L, s * 0.2, { shape: 'lance', droop: 0, color: new THREE.Color(sg < 0 ? '#5f8a3e' : '#8a5a4a'), side: side.clone().multiplyScalar(sg).addScaledVector(UP, 0.8).normalize() });
    // The flowers rise out of it one after another: orange sepals like a crest, and a blue arrow.
    const n = far ? 2 : 3;
    for (let i = 0; i < n; i++) {
      const hinge = top.clone().addScaledVector(beakDir, L * (0.16 + i * 0.2)).add(V(0, s * 0.05, 0));
      H.petal(m, hinge, az, 0.18 + i * 0.3 + (rng() - 0.5) * 0.1, s * 1.5 * lerp(0.9, 1.05, rng()), s * 0.42, 0, 0.1, rng, { pointed: true });
      if (!far) H.petal(m, hinge, az + (i % 2 ? 0.5 : -0.5), 0.05 + i * 0.3, s * 1.25, s * 0.34, 0, 0.1, rng, { pointed: true });
    }
    leaf(m, H, top.clone().addScaledVector(beakDir, L * 0.3).add(V(0, s * 0.08, 0)), b.clone().multiplyScalar(0.72).addScaledVector(UP, 0.7).normalize(), s * 1.25, s * 0.09, { shape: 'lance', droop: 0, color: new THREE.Color('#3458c2'), side });
    return;
  }
  // Heliconia: a zigzag of boat-shaped bracts up the stem, alternately left and right, each tipped in its second colour.
  const n = far ? 3 : 5;
  H.light(() => {
    for (let i = 0; i < n; i++) {
      const hinge = top.clone().add(V(0, i * s * 0.62, 0));
      const dirAz = az + (i % 2 ? Math.PI : 0);
      for (const tw of [-0.32, 0.32]) H.petal(m, hinge, dirAz + tw, 1.0, s * 1.5 * lerp(1, 0.8, i / n), s * 0.5, 0.25, 0.1, rng, { pointed: true });
    }
  });
  twig(m, top, top.clone().add(V(0, n * s * 0.62, 0)), s * 0.05, H.STEM, 0.6);
}

/**
 * An arching stem with flowers along its upper side, opening one after another toward the tip
 * (freesia, crocosmia), or forked, with furry split-tipped tubes (kangaroo paw).
 */
function fan(m: FlowerMesh, H: Helpers, height: number, f: Form<'fan'>, rng: () => number): number {
  const far = H.isFar();
  const az = rng() * Math.PI * 2;
  const d = V(Math.cos(az), 0, Math.sin(az));
  const s = f.size * H.HEAD;
  const sprays = f.furry ? (far ? 2 : 3) : 1;
  let headY = height;
  for (let sp = 0; sp < sprays; sp++) {
    const dd = d.clone().applyAxisAngle(UP, sp * 2.2);
    const h = height * (sp ? lerp(0.72, 0.9, rng()) : 1);
    const reach = h * f.arch;
    // Upright, then bending over toward the tip.
    const pt = (t: number) => dd.clone().multiplyScalar(reach * Math.pow(t, 2.4)).add(V(0, h * (t - 0.16 * Math.pow(t, 3)), 0));
    const segs = far ? 3 : 6;
    for (let k = 0; k < segs; k++) twig(m, pt(k / segs), pt((k + 1) / segs), 0.0055 * (1 - (k / segs) * 0.45), H.STEM, 0.92);
    // (With no clump of leaves at its foot, the stem carries them itself, left and right in turn: a toad lily.)
    if (!f.leaves && !f.furry) {
      const side = V(-dd.z, 0, dd.x);
      const nl = far ? 3 : 6;
      for (let i = 0; i < nl; i++) {
        const t = lerp(0.12, 0.6, i / (nl - 1));
        leaf(m, H, pt(t), side.clone().multiplyScalar(i % 2 ? 1 : -1).addScaledVector(UP, 0.5).addScaledVector(dd, 0.3).normalize(), clamp(h * 0.26, 0.06, 0.14) * lerp(0.85, 1.1, rng()), clamp(h * 0.06, 0.016, 0.03), { shape: 'ovate', droop: 0.4 });
      }
    }
    const n = far ? Math.ceil(f.florets * 0.55) : f.florets;
    for (let i = 0; i < n; i++) {
      const t = lerp(0.62, 1, i / Math.max(1, n - 1));
      const p = pt(t);
      const along = pt(Math.min(1, t + 0.02)).sub(pt(t - 0.02)).normalize();
      // The lowest flowers are open; toward the tip they are still buds.
      const young = i / n;
      const size = s * lerp(1, 0.5, young);
      const sideways = (i % 2 ? 1 : -1) * 0.3;
      const dir = V().crossVectors(along, V().crossVectors(UP, along)).normalize().multiplyScalar(-1).addScaledVector(along, 0.55).applyAxisAngle(along, sideways).normalize();
      if (dir.y < 0.1) dir.y = 0.3;
      dir.normalize();
      const mouth = p.clone().addScaledVector(dir, size * (f.furry ? 2.0 : 1.2));
      tubeWall(m, H, p, dir, size * (f.furry ? 2.0 : 1.2), size * 0.1, size * (f.furry ? 0.26 : 0.3), far ? 3 : 4, f.furry ? 0.15 : 0, p);
      if (young < 0.72 || far) floret(m, H, mouth, dir, far ? 3 : 6, size * (f.furry ? 0.55 : 1.0), size * (f.furry ? 0.14 : 0.3), f.furry ? 0.75 : 0.95, rng, { pointed: true, edge: f.furry ? 1 : 0.5, hinge: p });
      headY = Math.max(headY, mouth.y);
    }
  }
  return headY;
}

/** An umbel (or one great bloom) of narrow petals curled back, long stamens sweeping out and up (nerine, spider lily, flame lily, cleome). */
function spider(m: FlowerMesh, H: Helpers, height: number, f: Form<'spider'>, rng: () => number): number {
  const far = H.isFar();
  const lean = V((rng() - 0.5) * 0.05, 0, (rng() - 0.5) * 0.05);
  // (A flame lily's petals sweep straight up like flames, its stamens spread out flat beneath; it climbs by its leaves.)
  const swept = f.open < 0.7;
  const top = H.stem(m, height, lean, rng, swept || !!f.nod || f.leaves === undefined);
  const heads = far ? Math.min(f.heads, 3) : f.heads;
  const L = f.length * H.HEAD;
  const w = f.width * H.HEAD;
  const stam = new THREE.Color(f.stamens);
  H.light(() => {
    for (let h = 0; h < heads; h++) {
      let centre = top.clone();
      let outDir = UP.clone();
      if (f.heads > 1) {
        // Each flower on its own stalk, facing outward round the top of the stem.
        const a = (h / heads) * Math.PI * 2 + rng() * 0.5;
        // (A turk's-cap lily hangs its flowers face down, petals rolled right back.)
        outDir = V(Math.cos(a) * 0.85, f.nod ? -0.55 : 0.5, Math.sin(a) * 0.85).normalize();
        centre = top.clone().addScaledVector(V(outDir.x, f.nod ? 0.15 : outDir.y, outDir.z), L * (f.nod ? 0.8 : 0.55)).add(V(0, f.nod ? -h * L * 0.35 : 0, 0));
        twig(m, top, centre, 0.0035, H.STEM, 0.8);
      }
      m.setTilt(centre, new THREE.Quaternion().setFromUnitVectors(UP, outDir));
      m.invert = outDir.y < -0.2;
      const n = far ? 4 : f.petals;
      const off = rng() * 6;
      for (let i = 0; i < n; i++) {
        const az = off + (i / n) * Math.PI * 2 + (rng() - 0.5) * 0.15;
        H.petal(m, centre.clone(), az, f.open + (rng() - 0.5) * 0.12, L * lerp(0.9, 1.1, rng()), w * (far ? 1.6 : 1), 0, 0.1, rng, { pointed: true, reflex: f.wavy ? 1.1 : 0.5 });
        if (!far && (f.heads <= 3 || i % 2 === 0)) {
          // A stamen: out, then curving up, a fleck of pollen on its tip.
          const dd = V(Math.cos(az + 0.5), 0, Math.sin(az + 0.5));
          const mid = centre.clone().addScaledVector(dd, L * 0.5).add(V(0, L * (swept ? -0.1 : 0.25), 0));
          const tip = centre.clone().addScaledVector(dd, L * 0.85).add(V(0, L * (swept ? -0.02 : 0.75), 0));
          H.strip(m, centre, mid, 0.0016, stam);
          H.strip(m, mid, tip, 0.0013, stam);
          solid(m, new THREE.TetrahedronGeometry(0.006, 0).translate(tip.x, tip.y, tip.z), stam, centre);
        }
      }
      m.invert = false;
      m.setTilt(null, null);
    }
  });
  return top.y + L * 0.5;
}

/** A sliver of a filament from `a` to `tip`, in the plant's colour, its end in the second colour. */
function filament(m: FlowerMesh, H: Helpers, a: THREE.Vector3, tip: THREE.Vector3, w: number, hinge: THREE.Vector3) {
  const [u] = square(V().subVectors(tip, a).normalize());
  m.tri(a.clone().addScaledVector(u, -w), tip, a.clone().addScaledVector(u, w), { color: H.WHITE, petal: true, hinge, axis: UP, close: 0, shade: [0.72, 1.08, 0.72], edge: [0, 1, 0] });
}

/**
 * Heads made of stamens or of crowded tiny flowers, not petals: a bottlebrush's cylinder, a
 * banksia's candle, a grevillea's comb, the dome of a bee balm, an astilbe's feathery plume, the
 * spire of a blazing star or a foxtail lily, a cockscomb's flame.
 */
function brush(m: FlowerMesh, H: Helpers, height: number, f: Form<'brush'>, rng: () => number): number {
  const far = H.isFar();
  const lean = V((rng() - 0.5) * 0.05, 0, (rng() - 0.5) * 0.05);
  const L = f.length * H.HEAD;
  const R = f.radius * H.HEAD;
  const top = H.stem(m, Math.max(0.05, height - (f.style === 'dome' ? 0 : L)), lean, rng, f.style === 'spire' || f.style === 'flame' || f.style === 'plume' || f.style === 'dome');
  const axis = (t: number) => top.clone().add(V(0, t * L, 0));
  const out = (a: number) => V(Math.cos(a), 0, Math.sin(a));
  // (The woody ones carry stiff narrow leaves up the stem.)
  if (f.leaves === 'leathery') stemLeaves(m, H, top.y, lean, rng, { count: 10, len: 0.12, half: 0.014, from: 0.12, to: 0.95, rise: 42, shape: 'lance', color: new THREE.Color('#5f8660') });
  switch (f.style) {
    case 'cylinder': {
      // Stamens standing straight out all round the stem, which grows on through to a tuft of new leaves.
      const n = far ? 34 : 150;
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n;
        const o = out(i * GOLD).multiplyScalar(0.97).addScaledVector(UP, 0.2).normalize();
        filament(m, H, axis(t), axis(t).addScaledVector(o, R * lerp(0.85, 1.08, rng()) * Math.sin(Math.PI * clamp(t * 0.9 + 0.08, 0, 1)) ** 0.35), R * (far ? 0.2 : 0.11), top);
      }
      // (Packed so close that the brush is solid at its heart.)
      tinted(m, H, new THREE.CylinderGeometry(R * 0.42, R * 0.46, L * 0.94, far ? 5 : 7, 1).translate(top.x, top.y + L * 0.5, top.z), top, 0);
      twig(m, top, axis(1.12), R * 0.12, H.STEM, 0.7);
      if (!far) for (let i = 0; i < 4; i++) leaf(m, H, axis(1.08), out(i * 1.7).multiplyScalar(0.6).addScaledVector(UP, 0.8).normalize(), L * 0.3, L * 0.035, { droop: 0.1 });
      break;
    }
    case 'candle': {
      // A solid candle of packed flowers, wiry styles hooking out all over it.
      tinted(m, H, new THREE.CylinderGeometry(R * 0.5, R * 0.62, L, far ? 5 : 9, 1).translate(top.x, top.y + L / 2, top.z), top, 0);
      tinted(m, H, new THREE.ConeGeometry(R * 0.5, R * 0.6, far ? 5 : 9).translate(top.x, top.y + L + R * 0.3, top.z), top, 0);
      const n = far ? 30 : 130;
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n;
        const o = out(i * GOLD);
        const a = axis(t).addScaledVector(o, R * 0.5);
        filament(m, H, a, a.clone().addScaledVector(o, R * 0.5).add(V(0, R * 0.22, 0)), R * (far ? 0.16 : 0.09), top);
      }
      break;
    }
    case 'dome': {
      const n = far ? 16 : 70;
      for (let i = 0; i < n; i++) {
        const d = ballDir(i, n, 1.8, 0.4);
        filament(m, H, top.clone().addScaledVector(d, R * 0.15), top.clone().addScaledVector(d, R * lerp(0.85, 1.1, rng())).add(V(0, R * 0.12, 0)), R * (far ? 0.16 : 0.07), top);
      }
      solid(m, new THREE.OctahedronGeometry(R * 0.28, 0).translate(top.x, top.y + R * 0.05, top.z), '#5a3a3a', top);
      break;
    }
    case 'comb': {
      // A one-sided comb: styles standing in a row along an arching stalk, each curled over at the tip.
      const dir = out(rng() * 6);
      const n = far ? 12 : 44;
      const pt = (t: number) => top.clone().addScaledVector(dir, L * t).add(V(0, L * 0.35 * Math.sin(t * Math.PI * 0.8), 0));
      twig(m, top, pt(0.5), R * 0.08, H.STEM, 0.9);
      twig(m, pt(0.5), pt(1), R * 0.07, H.STEM, 0.5);
      const side = V(-dir.z, 0, dir.x);
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n;
        const a = pt(t);
        const lean2 = ((i % 3) - 1) * 0.28;
        filament(m, H, a, a.clone().add(V(0, R * 1.5 * lerp(0.85, 1.1, rng()), 0)).addScaledVector(side, R * lean2).addScaledVector(dir, -R * 0.3), R * (far ? 0.2 : 0.085), top);
      }
      break;
    }
    case 'plume': {
      // A feathery pyramid: side branches all the way up, shorter toward the tip, each beaded with tiny flowers.
      const n = far ? 7 : 16;
      twig(m, top, axis(1), 0.004, H.STEM, 0.4);
      for (let i = 0; i < n; i++) {
        const t = i / n;
        const o = out(i * GOLD).multiplyScalar(0.8).addScaledVector(UP, 0.6).normalize();
        const len = R * (1.05 - t * 0.85);
        const a = axis(t);
        const b = a.clone().addScaledVector(o, len);
        if (!far) twig(m, a, b, 0.0025, H.STEM, 0.5);
        const beads = far ? 2 : 5;
        for (let k = 1; k <= beads; k++) {
          const q = a.clone().lerp(b, k / beads);
          tinted(m, H, new THREE.TetrahedronGeometry(R * (far ? 0.26 : 0.17) * lerp(0.8, 1.2, rng()), 0).translate(q.x, q.y, q.z), top, k / beads);
        }
      }
      tinted(m, H, new THREE.TetrahedronGeometry(R * 0.14, 0).translate(top.x, top.y + L, top.z), top, 1);
      break;
    }
    case 'spire': {
      // A dense bottle-brush spire of fluffy flower heads up a stiff stem, tapering to the tip.
      const n = far ? 34 : 150;
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n;
        const o = out(i * GOLD).multiplyScalar(0.8).addScaledVector(UP, 0.6).normalize();
        filament(m, H, axis(t), axis(t).addScaledVector(o, R * lerp(0.8, 1.1, rng()) * (1 - t * 0.6)), R * (far ? 0.26 : 0.13), top);
      }
      twig(m, top, axis(1), 0.004, H.STEM, 0.4);
      break;
    }
    case 'flame': {
      // A soft, pointed flame of chaffy flowers, widest a third of the way up.
      const n = far ? 30 : 130;
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n;
        const prof = Math.sin(Math.PI * Math.pow(t, 0.62)) * 0.9 + 0.1;
        const o = out(i * GOLD);
        const a = axis(t * 0.9).addScaledVector(o, R * 0.25 * prof);
        filament(m, H, a, a.clone().addScaledVector(o, R * 0.6 * prof).add(V(0, L * 0.2, 0)), R * (far ? 0.24 : 0.11), top);
      }
      break;
    }
  }
  return top.y + L * 0.7;
}

/** One orchid bloom, facing along `face` with its lip downward. */
function orchidBloom(m: FlowerMesh, H: Helpers, p: THREE.Vector3, face: THREE.Vector3, type: Form<'orchid'>['type'], s: number, lip: THREE.Color, rng: () => number) {
  const far = H.isFar();
  // Bloom space: y out of the flower's face, +z down the face (to the lip).
  const F = face.clone().normalize();
  const down = V(0, -1, 0).addScaledVector(F, F.y).normalize();
  const X = V().crossVectors(F, down).normalize();
  m.setTilt(p, new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, F, down)));
  const UPF = -Math.PI / 2; // the azimuth that is "up the face"
  const flat = 1.42;
  const tep = (az: number, len: number, wid: number, pointed: boolean, open = flat) => H.petal(m, p.clone(), az, open + (rng() - 0.5) * 0.08, s * len, s * wid, 0, 0.1, rng, { pointed, round: !pointed });
  switch (type) {
    case 'moth': {
      // Two great rounded petals like wings over three smaller sepals.
      if (!far) for (const a of [UPF, UPF + 2.2, UPF - 2.2]) tep(a, 0.82, 0.5, false);
      for (const a of [UPF + 1.2, UPF - 1.2]) tep(a, 1.0, 1.05, false, 1.36);
      break;
    }
    case 'cattleya': {
      for (const a of far ? [UPF] : [UPF, UPF + 2.3, UPF - 2.3]) tep(a, 1.0, 0.3, true);
      for (const a of [UPF + 1.0, UPF - 1.0]) H.petal(m, p.clone(), a, 1.3, s * 0.95, s * 0.8, 0.05, 0.1, rng, { notch: true });
      break;
    }
    case 'slipper': {
      tep(UPF, 0.9, 0.7, true, 1.2);
      for (const a of [UPF + 1.75, UPF - 1.75]) tep(a, 0.95, 0.26, true, 1.5);
      break;
    }
    default: {
      for (const a of far ? [UPF, UPF + 2.2, UPF - 2.2] : [UPF, UPF + 1.15, UPF - 1.15, UPF + 2.3, UPF - 2.3]) tep(a, 0.95, 0.4, true);
    }
  }
  // The lip, in its own colour, with a spot of gold in the throat.
  const at = (g: THREE.BufferGeometry) => g.translate(p.x, p.y, p.z);
  if (type === 'slipper') {
    solid(m, at(new THREE.IcosahedronGeometry(s * 0.36, far ? 0 : 1).scale(0.85, 0.8, 1.25).translate(0, s * 0.18, s * 0.42)), lip, p);
  } else if (type === 'cattleya') {
    const g = new THREE.ConeGeometry(s * 0.42, s * 0.85, far ? 4 : 7, 1, true).rotateX(Math.PI / 2 + 0.5).translate(0, s * 0.28, s * 0.42);
    solid(m, at(g), lip, p);
    if (!far) solid(m, at(new THREE.TetrahedronGeometry(s * 0.12, 0).translate(0, s * 0.16, s * 0.2)), '#f2c230', p);
  } else {
    const tongue = new THREE.OctahedronGeometry(s * 0.3, 0).scale(type === 'moth' ? 0.9 : 0.7, 0.35, 1.25).translate(0, s * 0.08, s * 0.3);
    solid(m, at(tongue), lip, p);
    if (!far) solid(m, at(new THREE.TetrahedronGeometry(s * 0.09, 0).translate(0, s * 0.12, s * 0.05)), '#f2c230', p);
  }
  m.setTilt(null, null);
}

/** An arching spray of orchids, each facing outward (or one or two lady's slippers on an upright stem). */
function orchid(m: FlowerMesh, H: Helpers, height: number, f: Form<'orchid'>, rng: () => number): number {
  const far = H.isFar();
  const az = rng() * Math.PI * 2;
  const d = V(Math.cos(az), 0, Math.sin(az));
  const upright = f.type === 'slipper' || f.upright;
  const reach = height * (upright ? 0.08 : 0.55);
  const pt = (t: number) => d.clone().multiplyScalar(reach * Math.pow(t, 2.2)).add(V(0, height * (t - (upright ? 0 : 0.2) * Math.pow(t, 3)), 0));
  const segs = far ? 3 : 6;
  for (let k = 0; k < segs; k++) twig(m, pt(k / segs), pt((k + 1) / segs), 0.0045 * (1 - (k / segs) * 0.4), H.STEM, 0.92);
  const n = far ? Math.ceil(f.flowers * 0.6) : f.flowers;
  const s = f.size * H.HEAD;
  const lip = new THREE.Color(f.lip);
  let headY = 0;
  const draw = () => {
    for (let i = 0; i < n; i++) {
      const t = n > 1 ? lerp(upright ? 0.55 : 0.5, 1, i / (n - 1)) : 1;
      const stemP = pt(t);
      // Flowers stand off the stem on short stalks, alternately to each side, facing out and a little up.
      const sideways = d.clone().applyAxisAngle(UP, (i % 2 ? 1 : -1) * (upright ? 1.4 : 1.1));
      const p = stemP.clone().addScaledVector(sideways, s * 0.45).add(V(0, s * 0.1, 0));
      twig(m, stemP, p, 0.0025, H.STEM, 0.8);
      orchidBloom(m, H, p, sideways.clone().multiplyScalar(0.9).addScaledVector(UP, 0.3), f.type, s * lerp(1, 0.82, i / n), lip, rng);
      headY = Math.max(headY, p.y);
    }
  };
  if (n > 3) H.light(draw);
  else draw();
  return headY;
}

/** One or a few great trumpets on a stem: hibiscus, amaryllis, lilies; hanging (angel's trumpet), or sitting upright on the ground (gentian). */
function trumpet(m: FlowerMesh, H: Helpers, height: number, f: Form<'trumpet'>, rng: () => number): number {
  const lean = V((rng() - 0.5) * 0.05, 0, (rng() - 0.5) * 0.05);
  const top = H.stem(m, height, lean, rng, !f.leaves);
  const s = f.flare * H.HEAD;
  const bloom: SmallBloom = { type: 'trumpet', size: f.flare, petals: f.lobes, centre: f.column ?? '#f2d27a', column: false, open: f.open ?? (f.length / f.flare > 1.6 ? 0.34 : 0.55) };
  const count = H.isFar() ? Math.min(f.count ?? 1, 2) : (f.count ?? 1);
  const a0 = rng() * 6;
  for (let i = 0; i < count; i++) {
    const az = a0 + (i / count) * Math.PI * 2;
    // One flower looks up and a little aside; several face outward round the top of the stem (or up it).
    const tilt = f.hang ? 2.6 : count > 1 ? 1.25 : (f.nod ?? 0.35);
    const dir = V(Math.cos(az) * Math.sin(tilt), Math.cos(tilt), Math.sin(az) * Math.sin(tilt));
    const p = f.stack ? V(lean.x, height * (1 - (i / count) * 0.32), lean.z) : top.clone();
    const q = count > 1 || f.hang ? p.clone().addScaledVector(V(dir.x, f.hang ? 0.2 : 0.35, dir.z).normalize(), s * 0.45) : p;
    if (q !== p) twig(m, p, q, 0.004, H.STEM, 0.8);
    bloomFacing(m, H, bloom, q, dir, s * (f.stack ? lerp(1, 0.8, i / count) : 1), rng);
  }
  return top.y + s * 0.5;
}

/** A crown imperial: a ring of bells hanging under a tuft of leaves, on a tall bare stem. */
function crown(m: FlowerMesh, H: Helpers, height: number, f: Form<'crown'>, rng: () => number): number {
  const far = H.isFar();
  const lean = V((rng() - 0.5) * 0.04, 0, (rng() - 0.5) * 0.04);
  const top = H.stem(m, height, lean, rng, false);
  stemLeaves(m, H, height, lean, rng, { count: 9, len: 0.13, half: 0.02, from: 0.08, to: 0.55, rise: 35, shape: 'lance' });
  const s = f.size * H.HEAD;
  const n = far ? Math.min(f.bells, 4) : f.bells;
  const off = rng() * 6;
  const bell: SmallBloom = { type: 'bell', size: f.size, centre: '#f6efcf' };
  H.light(() => {
    for (let i = 0; i < n; i++) {
      const az = off + (i / n) * Math.PI * 2;
      const o = V(Math.cos(az), 0, Math.sin(az));
      const hang = top.clone().addScaledVector(o, s * 0.75).add(V(0, -s * 0.1, 0));
      twig(m, top.clone().add(V(0, s * 0.1, 0)), hang, 0.004, H.STEM, 0.8);
      bloomFacing(m, H, bell, hang, V(o.x * 0.3, -1, o.z * 0.3), s, rng);
    }
  });
  // The crown: a tuft of leaves standing above the bells.
  const tuft = far ? 5 : 10;
  for (let i = 0; i < tuft; i++) {
    const az = i * GOLD;
    leaf(m, H, top.clone().add(V(0, s * 0.1, 0)), V(Math.cos(az) * 0.45, 0.9, Math.sin(az) * 0.45).normalize(), s * lerp(1.1, 1.6, rng()), s * 0.14, { shape: 'lance', droop: 0.25 });
  }
  return top.y;
}

/**
 * A head of flowers each on its own stalk from the top of a bare stem: a ball of little trumpets
 * (agapanthus), a loose sheaf of them (clivia, Peruvian lily), a cushion of pouches (slipper flower).
 */
function umbel(m: FlowerMesh, H: Helpers, height: number, f: Form<'cluster'>, rng: () => number): number {
  const far = H.isFar();
  const lean = V((rng() - 0.5) * 0.05, 0, (rng() - 0.5) * 0.05);
  const top = H.stem(m, height, lean, rng, !f.leaves);
  const R = f.radius * H.HEAD * 0.7;
  const fs = f.floretSize * H.HEAD;
  const n = far ? Math.max(4, Math.ceil(f.florets * 0.4)) : f.florets;
  const polar = f.shape === 'globe' ? 2.0 : f.shape === 'dome' ? 1.25 : 0.95;
  for (let i = 0; i < n; i++) {
    const d = ballDir(i, n, polar, 0.9);
    const q = top.clone().addScaledVector(d, R * lerp(0.82, 1, rng()));
    if (!far) H.strip(m, top, q, 0.0016);
    const facing = d.clone().add(V(0, 0.35, 0)).normalize();
    const k = far ? 1.5 : 1;
    if (f.floret === 'pouch') {
      tinted(m, H, (far ? new THREE.TetrahedronGeometry(fs * 1.6, 0) : new THREE.IcosahedronGeometry(fs * 1.25, 0)).scale(1, 0.82, 1).translate(q.x + facing.x * fs, q.y + facing.y * fs, q.z + facing.z * fs), top, i % 3 === 0 ? 1 : 0);
    } else if (f.floret === 'trumpet') {
      tubeWall(m, H, q, facing, fs * 1.1 * k, fs * 0.12, fs * 0.42 * k, far ? 3 : 4, 0, top);
      floret(m, H, q.clone().addScaledVector(facing, fs * 1.1 * k), facing, far ? 3 : 6, fs * 1.25 * k, fs * 0.36 * k, 0.85, rng, { pointed: true, edge: 0.7, hinge: top });
    } else {
      floret(m, H, q, facing, far ? 3 : 5, fs * 1.3 * k, fs * 0.6 * k, 1.2, rng, { hinge: top });
      if (f.eye && !far) solid(m, new THREE.TetrahedronGeometry(fs * 0.3, 0).translate(q.x + facing.x * fs * 0.15, q.y + facing.y * fs * 0.15, q.z + facing.z * fs * 0.15), f.eye, top);
    }
  }
  return top.y + R * 0.5;
}

/**
 * Flowers up a spire, opening from the bottom: little stars (tuberose, stock), tubes with a
 * flared mouth (penstemon, the sages), hanging bells (yucca, Persian lily, squill), pea flowers
 * (bluebonnet), broad butterflies (ginger lily, canna), or a cone-shaped truss of them (lilac).
 */
function spire(m: FlowerMesh, H: Helpers, height: number, f: Form<'spike'>, rng: () => number): number {
  const far = H.isFar();
  const lean = V((rng() - 0.5) * 0.06, 0, (rng() - 0.5) * 0.06);
  const top = H.stem(m, height, lean, rng, !f.leaves);
  const L = Math.min(f.spikeLength * 1.5, height * 0.75);
  const fs = f.floretSize * H.HEAD;
  const n = far ? Math.max(5, Math.ceil(f.florets * 0.42)) : f.florets;
  const kf = far ? 1.55 : 1;
  for (let i = 0; i < n; i++) {
    const t = n > 1 ? i / (n - 1) : 0; // 0 at the bottom of the spire
    const y = top.y - L * (1 - t);
    const az = f.whorls ? Math.floor(i / 5) * 0.6 + (i % 5) * 1.2566 : i * GOLD;
    const o = V(Math.cos(az), 0, Math.sin(az));
    const tw = f.whorls ? Math.floor(i / 5) / Math.max(1, Math.ceil(n / 5) - 1) : t;
    const yy = f.whorls ? top.y - L * (1 - tw) : y;
    const size = fs * lerp(1.1, f.floret === 'bell' ? 0.8 : 0.55, tw) * kf;
    // (A truss stands its flowers out from the stem, furthest at the bottom.)
    const attach = V(top.x * (yy / top.y), yy, top.z * (yy / top.y)).addScaledVector(o, (f.taper ?? 0) * L * (1 - tw) + 0.004);
    switch (f.floret) {
      case 'tube': {
        const dir = o.clone().multiplyScalar(0.92).addScaledVector(UP, 0.3).normalize();
        tubeWall(m, H, attach, dir, size * 1.5, size * 0.14, size * 0.36, far ? 3 : 4, 0, attach);
        floret(m, H, attach.clone().addScaledVector(dir, size * 1.5), dir, far ? 3 : 5, size * 0.75, size * 0.3, 1.05, rng, { hinge: attach, edge: 0.6 });
        break;
      }
      case 'bell': {
        const hang = attach.clone().addScaledVector(o, size * 0.7).add(V(0, -size * 0.15, 0));
        if (!far) H.strip(m, attach, hang, 0.0016);
        const dir = V(o.x * 0.3, -1, o.z * 0.3).normalize();
        tubeWall(m, H, hang, dir, size * 1.25, size * 0.2, size * 0.52, far ? 4 : 6, 0.4, hang);
        break;
      }
      case 'pea': {
        const dir = o.clone().multiplyScalar(0.9).addScaledVector(UP, 0.35).normalize();
        const tip = attach.clone().addScaledVector(dir, size * 0.6);
        // The banner stands up behind (its eye paler), the keel juts forward.
        floret(m, H, tip, V(o.x * 0.2, 1, o.z * 0.2).normalize(), 1, size * 1.1, size * 0.55, 0.25, rng, { hinge: attach, edge: 1 });
        floret(m, H, tip, dir, 2, size * 0.9, size * 0.35, 0.45, rng, { hinge: attach });
        break;
      }
      case 'butterfly': {
        const dir = o.clone().multiplyScalar(0.85).addScaledVector(UP, 0.5).normalize();
        const q = attach.clone().addScaledVector(dir, size * 0.5);
        if (!far) H.strip(m, attach, q, 0.002);
        floret(m, H, q, dir, far ? 3 : 4, size * 1.5, size * 0.72, 1.0, rng, { hinge: attach });
        break;
      }
      default: {
        const dir = o.clone().multiplyScalar(0.9).addScaledVector(UP, 0.4).normalize();
        floret(m, H, attach.clone().addScaledVector(dir, size * 0.3), dir, far ? 3 : (f.petals ?? 5), size * 1.25, size * 0.55, 1.15, rng, { hinge: attach });
      }
    }
  }
  return top.y - L * 0.3;
}

/** Sturt's desert pea: grey leaves flat on the ground, and short stalks each holding up a ring of great red pea flowers with a glossy black boss. */
function desertPea(m: FlowerMesh, H: Helpers, height: number, f: Form<'arch'>, rng: () => number): number {
  const far = H.isFar();
  basalLeaves(m, H, 'feathery', 0.3, rng, new THREE.Color('#8fa08a'));
  const stalks = far ? 2 : 3;
  const s = f.floretSize * H.HEAD;
  H.light(() => {
    for (let k = 0; k < stalks; k++) {
      const a = k * 2.2 + rng();
      const top = V(Math.cos(a) * 0.09, height * lerp(0.75, 1, rng()), Math.sin(a) * 0.09);
      twig(m, V(Math.cos(a) * 0.02, 0, Math.sin(a) * 0.02), top, 0.006, H.STEM, 0.8);
      const n = far ? 3 : Math.max(3, Math.round(f.florets));
      for (let i = 0; i < n; i++) {
        const az = (i / n) * Math.PI * 2 + rng() * 0.3;
        const o = V(Math.cos(az), 0, Math.sin(az));
        const p = top.clone().addScaledVector(o, s * 0.35);
        // The banner sweeps up and back, the keel curves down and out; between them, the boss.
        H.petal(m, p, az, 0.25, s * 1.5, s * 0.6, 0.1, 0.1, rng, { pointed: true });
        H.petal(m, p, az, 2.45, s * 1.6, s * 0.5, -0.1, 0.1, rng, { pointed: true });
        solid(m, new THREE.OctahedronGeometry(s * 0.3, 0).scale(0.8, 1, 0.8).translate(p.x + o.x * s * 0.22, p.y + s * 0.12, p.z + o.z * s * 0.22), '#15121a', p);
      }
    }
  });
  return height;
}

/** Arching woody stems hung with long narrow tubes (kōwhai, cantua). */
function hangingTubes(m: FlowerMesh, H: Helpers, height: number, f: Form<'arch'>, rng: () => number): number {
  const far = H.isFar();
  const stems = far ? 2 : 3;
  const wood = new THREE.Color('#6a553c');
  const s = f.floretSize * H.HEAD;
  let headY = 0;
  for (let k = 0; k < stems; k++) {
    const az = k * 2.2 + rng() * 0.6;
    const d = V(Math.cos(az), 0, Math.sin(az));
    const h = height * lerp(0.8, 1, rng());
    const reach = height * lerp(0.4, 0.6, rng());
    const pt = (t: number) => d.clone().multiplyScalar(reach * t * t).add(V(0, h * Math.sin(t * Math.PI * 0.62) / Math.sin(Math.PI * 0.62) * (1 - 0.25 * t * t * t), 0));
    const segs = far ? 3 : 6;
    for (let i = 0; i < segs; i++) twig(m, pt(i / segs), pt((i + 1) / segs), 0.006 * (1 - (i / segs) * 0.5), wood, 0.9);
    const side = V(-d.z, 0, d.x);
    // Small leaves along the stem.
    if (!far) for (let i = 0; i < 7; i++) leaf(m, H, pt(0.25 + i * 0.1), side.clone().multiplyScalar(i % 2 ? 1 : -1).addScaledVector(UP, 0.4).normalize(), 0.07, 0.014, { droop: 0.3 });
    const n = far ? Math.ceil(f.florets * 0.5) : f.florets;
    for (let i = 0; i < n; i++) {
      const p = pt(lerp(0.5, 1, i / Math.max(1, n - 1)));
      const hang = p.clone().addScaledVector(side, (i % 2 ? 1 : -1) * s * 0.3).add(V(0, -s * 0.3, 0));
      const dir = V(side.x * (i % 2 ? 0.12 : -0.12), -1, side.z * (i % 2 ? 0.12 : -0.12)).normalize();
      tubeWall(m, H, hang, dir, s * 2.2, s * 0.16, s * 0.34, far ? 3 : 5, 0.8, hang);
      if (!far) floret(m, H, hang.clone().addScaledVector(dir, s * 2.2), dir, 5, s * 0.5, s * 0.2, 0.7, rng, { pointed: true, edge: 1, hinge: hang });
      headY = Math.max(headY, p.y);
    }
  }
  return headY;
}

/** Does this species use one of the shapes in this file? */
export function isExotic(f: FlowerSpecies['form']): boolean {
  switch (f.kind) {
    case 'bush':
    case 'bracts':
    case 'spathe':
    case 'crane':
    case 'fan':
    case 'spider':
    case 'brush':
    case 'orchid':
    case 'trumpet':
    case 'crown':
      return true;
    case 'cluster':
      return !!f.floret;
    case 'spike':
      return !!f.floret;
    case 'arch':
      return f.shape === 'tube' || f.shape === 'pea';
    default:
      return false;
  }
}

/** Build one plant of the newer kinds. Returns its geometry, with `headY` (where a bee would land) set. */
export function exoticGeometry(sp: FlowerSpecies, m: FlowerMesh, height: number, rng: () => number, H: Helpers): THREE.BufferGeometry {
  const f = sp.form;
  const lean = V((rng() - 0.5) * 0.05, 0, (rng() - 0.5) * 0.05);
  let headY = height;
  let leaves: LeafHabit = 'none';
  switch (f.kind) {
    case 'bush':
      headY = shrub(m, H, f, height, rng);
      break;
    case 'fan':
      headY = fan(m, H, height, f, rng);
      leaves = f.leaves ?? 'none';
      break;
    case 'crown':
      headY = crown(m, H, height, f, rng);
      break;
    case 'trumpet':
      headY = trumpet(m, H, height, f, rng);
      leaves = f.leaves ?? 'none';
      break;
    case 'brush':
      headY = brush(m, H, height, f, rng);
      leaves = f.leaves ?? 'none';
      break;
    case 'orchid':
      headY = orchid(m, H, height, f, rng);
      leaves = f.leaves ?? 'none';
      break;
    case 'spider':
      headY = spider(m, H, height, f, rng);
      leaves = f.leaves ?? 'none';
      break;
    case 'cluster':
      headY = umbel(m, H, height, f, rng);
      leaves = f.leaves ?? 'none';
      break;
    case 'spike':
      headY = spire(m, H, height, f, rng);
      leaves = f.leaves ?? 'none';
      break;
    case 'arch':
      headY = f.shape === 'pea' ? desertPea(m, H, height, f, rng) : hangingTubes(m, H, height, f, rng);
      break;
    case 'bracts':
    case 'spathe':
    case 'crane': {
      const top = H.stem(m, height, lean, rng, false);
      if (f.kind === 'bracts') bractHead(m, H, top, f, rng);
      else if (f.kind === 'spathe') spathe(m, H, top, f, rng);
      else crane(m, H, top, f, rng);
      leaves = f.leaves ?? 'none';
      // A protea's leaves are stiff, broad and grey-green, all the way up its stout stem.
      if (leaves === 'leathery') stemLeaves(m, H, height, lean, rng, { count: 11, len: clamp(height * 0.16, 0.05, 0.13), half: clamp(height * 0.045, 0.014, 0.034), from: 0.12, to: 0.94, rise: 48, color: new THREE.Color('#5f8660') });
      headY = top.y;
      break;
    }
    default:
  }
  basalLeaves(m, H, leaves, height, rng);
  const geo = m.build();
  geo.userData.headY = headY;
  return geo;
}
