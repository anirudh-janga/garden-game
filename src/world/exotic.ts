import * as THREE from 'three';
import { lerp, createRng } from '../core/random';
import type { FlowerMesh } from './flowerMesh';
import type { FlowerSpecies, LeafHabit, SmallBloom } from './flowerSpecies';

const UP = new THREE.Vector3(0, 1, 0);
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

/** A leaf as a strip along a curve, in the plant's own green (not tinted like a petal). */
function ribbon(m: FlowerMesh, H: Helpers, at: (t: number, w: number) => THREE.Vector3, width: (t: number) => number, rows: number, _base: THREE.Vector3, dark = 0.6) {
  const sh = (t: number) => lerp(dark, 1.08, t);
  for (let r = 0; r < rows; r++) {
    const t0 = r / rows;
    const t1 = (r + 1) / rows;
    const w0 = width(t0);
    const w1 = width(t1);
    m.tri(at(t0, -w0), at(t1, -w1), at(t1, w1), { color: H.LEAF, shade: [sh(t0), sh(t1), sh(t1)] });
    m.tri(at(t0, -w0), at(t1, w1), at(t0, w0), { color: H.LEAF, shade: [sh(t0), sh(t1), sh(t0)] });
  }
}

/** What the shape builders in `flowers.ts` lend this file (passed in, so the two files needn't import each other). */
export interface Helpers {
  petal: (m: FlowerMesh, hinge: THREE.Vector3, az: number, open: number, len: number, width: number, cupIn: number, closeTo: number, rng: () => number, style?: { notch?: boolean; pointed?: boolean; blotch?: number; round?: boolean; reflex?: number }) => void;
  strip: (m: FlowerMesh, a: THREE.Vector3, b: THREE.Vector3, w: number, color?: THREE.Color) => void;
  leafStrip: (m: FlowerMesh, at: (t: number, w: number) => THREE.Vector3, width: (t: number) => number, rows: number, base: THREE.Vector3, dark?: number) => void;
  stem: (m: FlowerMesh, height: number, lean: THREE.Vector3, rng: () => number, withLeaves?: boolean) => THREE.Vector3;
  isFar: () => boolean;
  HEAD: number;
  LEAF: THREE.Color;
  STEM: THREE.Color;
  WHITE: THREE.Color;
}

const fixed = (m: FlowerMesh, g: THREE.BufferGeometry, color: string | THREE.Color, hinge: THREE.Vector3) => m.addGeometry(g, new THREE.Color(color), false, hinge);
const tinted = (m: FlowerMesh, g: THREE.BufferGeometry, W: THREE.Color, hinge: THREE.Vector3, edge = 0) => m.addGeometry(g, W, true, hinge, edge);

/**
 * Leaves at the foot of a plant, by habit: strap (a clump of long arching blades), paddle (big
 * tropical blades on stalks), sword (upright fans), rosette (broad leaves flat to the ground),
 * feathery (fine fronds), heart (heart-shaped blades on stalks), succulent (thick pointed leaves),
 * leathery (stiff, broad and dark, ringing a flower).
 */
export function leafHabit(m: FlowerMesh, H: Helpers, habit: LeafHabit, spread: number, rng: () => number, tint?: string) {
  if (habit === 'none') return;
  const far = H.isFar();
  const col = tint ? new THREE.Color(tint) : H.LEAF;
  const base = V();
  const blade = (az: number, len: number, w: number, lift: number, arch: number, rows: number, dark = 0.6) => {
    const d = V(Math.cos(az), 0, Math.sin(az));
    const s = V(-d.z, 0, d.x);
    ribbon(m, H, (t, k) => d.clone().multiplyScalar(t * len * (1 - arch * 0.3)).addScaledVector(UP, Math.sin(t * Math.PI * (0.35 + arch * 0.3)) * len * lift).addScaledVector(s, k), (t) => w * Math.sin(Math.min(1, t * 1.15 + 0.15) * Math.PI * 0.9 + 0.1) * (1 - t * 0.5), far ? 2 : rows, base, dark);
  };
  void col;
  switch (habit) {
    case 'strap': {
      const n = far ? 4 : 7;
      for (let i = 0; i < n; i++) blade((i / n) * Math.PI * 2 + rng() * 0.5, spread * lerp(0.9, 1.4, rng()), 0.014, 0.85, 0.7, 4);
      break;
    }
    case 'paddle': {
      const n = far ? 2 : 4;
      for (let i = 0; i < n; i++) {
        const az = (i / n) * Math.PI * 2 + rng() * 0.8;
        const d = V(Math.cos(az), 0, Math.sin(az));
        const top = d.clone().multiplyScalar(spread * 0.2).add(V(0, spread * lerp(0.6, 0.9, rng()), 0));
        H.strip(m, base, top, 0.004);
        const s = V(-d.z, 0, d.x);
        const L = spread * lerp(0.9, 1.2, rng());
        ribbon(m, H, (t, k) => top.clone().addScaledVector(d, t * L).addScaledVector(UP, Math.sin(t * 2.4) * L * 0.12 - t * L * 0.15).addScaledVector(s, k), (t) => L * 0.3 * Math.sin(Math.PI * Math.min(1, t * 0.95 + 0.05)), far ? 2 : 4, top, 0.7);
      }
      break;
    }
    case 'sword': {
      const n = far ? 3 : 5;
      for (let i = 0; i < n; i++) {
        const az = (i / n) * Math.PI * 0.8 - 0.4 + (rng() - 0.5) * 0.3;
        const d = V(Math.cos(az), 0, Math.sin(az));
        const h = spread * lerp(0.9, 1.3, rng());
        const s = V(-d.z, 0, d.x);
        ribbon(m, H, (t, k) => d.clone().multiplyScalar(t * t * h * 0.2).addScaledVector(UP, t * h).addScaledVector(s, k), (t) => 0.016 * (1 - t * 0.85), far ? 2 : 4, base, 0.6);
      }
      break;
    }
    case 'rosette': {
      const n = far ? 5 : 9;
      for (let i = 0; i < n; i++) blade((i / n) * Math.PI * 2 + rng() * 0.4, spread * lerp(0.8, 1.1, rng()), 0.03, 0.18, 0.2, 3, 0.7);
      break;
    }
    case 'feathery': {
      const n = far ? 4 : 8;
      for (let i = 0; i < n; i++) blade((i / n) * Math.PI * 2 + rng() * 0.5, spread * lerp(0.8, 1.2, rng()), 0.008, 0.55, 0.5, 3, 0.65);
      break;
    }
    case 'heart': {
      const n = far ? 2 : 3;
      for (let i = 0; i < n; i++) {
        const az = (i / n) * Math.PI * 2 + rng();
        const d = V(Math.cos(az), 0, Math.sin(az));
        const s = V(-d.z, 0, d.x);
        const top = d.clone().multiplyScalar(spread * 0.25).add(V(0, spread * lerp(0.5, 0.75, rng()), 0));
        H.strip(m, base, top, 0.004);
        const w = spread * 0.3;
        const tip = top.clone().addScaledVector(d, spread * 0.55).add(V(0, -spread * 0.12, 0));
        m.tri(top, top.clone().addScaledVector(s, w).addScaledVector(d, spread * 0.25), tip, { color: H.LEAF, shade: [0.85, 1, 1.05] });
        m.tri(top, tip, top.clone().addScaledVector(s, -w).addScaledVector(d, spread * 0.25), { color: H.LEAF, shade: [0.85, 1.05, 1] });
        m.tri(top, top.clone().addScaledVector(s, -w).addScaledVector(d, spread * 0.25), top.clone().addScaledVector(s, -w * 0.4).addScaledVector(d, -spread * 0.1), { color: H.LEAF, shade: [0.85, 1, 0.9] });
        m.tri(top, top.clone().addScaledVector(s, w * 0.4).addScaledVector(d, -spread * 0.1), top.clone().addScaledVector(s, w).addScaledVector(d, spread * 0.25), { color: H.LEAF, shade: [0.85, 0.9, 1] });
      }
      break;
    }
    case 'succulent': {
      const n = far ? 5 : 9;
      for (let i = 0; i < n; i++) {
        const az = (i / n) * Math.PI * 2 + rng() * 0.4;
        const d = V(Math.cos(az), 0, Math.sin(az));
        const s = V(-d.z, 0, d.x);
        const tip = d.clone().multiplyScalar(spread * 0.7).add(V(0, spread * lerp(0.35, 0.6, rng()), 0));
        const mid = d.clone().multiplyScalar(spread * 0.3).add(V(0, spread * 0.2, 0));
        m.tri(base, mid.clone().addScaledVector(s, 0.03), tip, { color: H.LEAF.clone().lerp(new THREE.Color('#7a9a7a'), 0.35), shade: [0.75, 1, 1.05] });
        m.tri(base, tip, mid.clone().addScaledVector(s, -0.03), { color: H.LEAF.clone().lerp(new THREE.Color('#7a9a7a'), 0.35), shade: [0.75, 1.05, 1] });
      }
      break;
    }
    case 'leathery': {
      const n = far ? 4 : 7;
      for (let i = 0; i < n; i++) blade((i / n) * Math.PI * 2 + rng() * 0.3, spread * lerp(0.9, 1.1, rng()), 0.03, 0.5, 0.35, 3, 0.55);
      break;
    }
  }
}

/** A small bloom of a bush, at `at` facing `dir`: a ring of petals, a trumpet, a cup or a ball. */
function smallBloom(m: FlowerMesh, H: Helpers, at: THREE.Vector3, dir: THREE.Vector3, b: SmallBloom, rng: () => number) {
  const far = H.isFar();
  const size = b.size * H.HEAD;
  const q = new THREE.Quaternion().setFromUnitVectors(UP, dir.clone().normalize());
  const place = (g: THREE.BufferGeometry) => g.applyQuaternion(q).translate(at.x, at.y, at.z);
  switch (b.type) {
    case 'pom': {
      tinted(m, place(new THREE.IcosahedronGeometry(size * 0.8, far ? 0 : 1).scale(1, 0.75, 1).translate(0, size * 0.3, 0)), H.WHITE, at);
      break;
    }
    case 'trumpet': {
      const g = new THREE.CylinderGeometry(size * 0.9, size * 0.18, size * 1.5, far ? 5 : 7, 1, true).translate(0, size * 0.75, 0);
      tinted(m, place(g), H.WHITE, at);
      if (b.centre && !far) fixed(m, place(new THREE.CylinderGeometry(size * 0.04, size * 0.04, size * 1.5, 3).translate(0, size * 0.95, 0)), b.centre, at);
      break;
    }
    case 'cup': {
      const g = new THREE.SphereGeometry(size * 0.7, far ? 5 : 8, far ? 3 : 4, 0, Math.PI * 2, 0, Math.PI * 0.55).rotateX(Math.PI).translate(0, size * 0.65, 0);
      tinted(m, place(g), H.WHITE, at);
      break;
    }
    default: {
      // A flat ring of petals (open to the sun), a dot of colour in the middle.
      const n = far ? 3 : b.petals ?? 5;
      const off = rng() * 6;
      for (let i = 0; i < n; i++) {
        const g = new THREE.CircleGeometry(size * 0.5, far ? 4 : 6).scale(0.8, 1.15, 1).rotateX(-Math.PI / 2 + 0.25).translate(0, 0.01, size * 0.55).rotateY(off + (i / n) * Math.PI * 2);
        tinted(m, place(g), H.WHITE, at);
      }
      if (b.centre) fixed(m, place(new THREE.IcosahedronGeometry(size * 0.22, 0).translate(0, size * 0.1, 0)), b.centre, at);
    }
  }
}

/** A bush: woody stems arching into a mound, small leaves along them, and blooms at the tips and over the top. */
function bush(m: FlowerMesh, H: Helpers, f: Extract<FlowerSpecies['form'], { kind: 'bush' }>, height: number, rng: () => number): THREE.Vector3 {
  const far = H.isFar();
  const branches = far ? 4 : 7;
  const tips: THREE.Vector3[] = [];
  const wood = new THREE.Color('#6a5a3e');
  const leafTone = f.leafColor ? new THREE.Color(f.leafColor) : H.LEAF;
  for (let i = 0; i < branches; i++) {
    const az = (i / branches) * Math.PI * 2 + rng() * 0.6;
    const d = V(Math.cos(az), 0, Math.sin(az));
    const r = f.radius * lerp(0.5, 1, rng());
    const h = height * lerp(0.65, 1, rng());
    const pts = [0, 1, 2, 3].map((k) => d.clone().multiplyScalar(r * (k / 3) ** 1.3).add(V(0, h * Math.sin((k / 3) * Math.PI * 0.55), 0)));
    for (let k = 0; k < 3; k++) {
      H.strip(m, pts[k], pts[k + 1], 0.005 * (1 - k * 0.2), wood);
      if (f.leaf !== 'bare' && !(far && k > 0)) {
        const n = f.leaf === 'needle' || f.leaf === 'ferny' ? 3 : 2;
        for (let l = 0; l < n; l++) {
          const t = (l + 0.5) / n;
          const p = pts[k].clone().lerp(pts[k + 1], t);
          const side = V(-d.z, 0, d.x).multiplyScalar(l % 2 ? 1 : -1);
          const len = f.leaf === 'long' ? 0.11 : f.leaf === 'small' || f.leaf === 'needle' ? 0.04 : 0.075;
          const tip = p.clone().addScaledVector(side, len).addScaledVector(d, len * 0.3).add(V(0, len * 0.2, 0));
          const wdt = f.leaf === 'long' || f.leaf === 'needle' ? 0.012 : 0.028;
          m.tri(p, p.clone().addScaledVector(d, len * 0.5).addScaledVector(side, len * 0.5).add(V(0, wdt, 0)), tip, { color: leafTone, shade: [0.8, 1, 1.05] });
          m.tri(p, tip, p.clone().addScaledVector(d, len * 0.5).addScaledVector(side, len * 0.5).add(V(0, -wdt, 0)), { color: leafTone, shade: [0.8, 1.05, 1] });
        }
      }
    }
    tips.push(pts[3]);
  }
  const n = far ? Math.ceil(f.blooms * 0.5) : f.blooms;
  let top = tips[0];
  for (let i = 0; i < n; i++) {
    const tip = tips[i % tips.length];
    // The first ring of blooms sits at the tips, the rest scatter over the mound's top.
    const p = i < tips.length ? tip.clone() : tip.clone().add(V((rng() - 0.5) * f.radius * 0.8, (rng() - 0.3) * height * 0.25, (rng() - 0.5) * f.radius * 0.8));
    const dir = V((rng() - 0.5) * 0.6, 1, (rng() - 0.5) * 0.6);
    smallBloom(m, H, p, dir, f.bloom, rng);
    if (p.y > top.y) top = p;
  }
  return top;
}

/** The head of a bracts flower, at `top`. */
function bractHead(m: FlowerMesh, H: Helpers, top: THREE.Vector3, f: Extract<FlowerSpecies['form'], { kind: 'bracts' }>, rng: () => number) {
  const far = H.isFar();
  const rows = far ? Math.min(2, f.rows) : f.rows;
  const length = f.length * H.HEAD;
  const width = f.width * H.HEAD;
  const c = f.centre;
  for (let r = 0; r < rows; r++) {
    const k = rows > 1 ? r / (rows - 1) : 0;
    const count = Math.max(5, Math.round(f.per * (1 - k * 0.3) * (far ? 0.6 : 1)));
    const open = f.style === 'cone' ? lerp(f.open, f.open * 0.45, k) : lerp(f.open, f.open * 0.55, k);
    const len = length * lerp(1, f.style === 'ruff' ? 1.1 : 0.72, k);
    const off = rng() * 6;
    const rise = f.style === 'cone' ? k * length * 0.6 : f.style === 'bowl' ? k * length * 0.25 : 0;
    for (let i = 0; i < count; i++) {
      const az = off + (i / count) * Math.PI * 2 + (rng() - 0.5) * 0.15;
      const hinge = top.clone().add(V(Math.cos(az) * c.size * 0.6, rise, Math.sin(az) * c.size * 0.6));
      H.petal(m, hinge, az, open + (rng() - 0.5) * 0.1, len * lerp(0.9, 1.1, rng()), width * (far ? 1.4 : 1), f.style === 'bowl' ? 0.1 : 0.02, 0.1, rng, { pointed: true });
    }
  }
  const s = c.size * H.HEAD;
  const colour = c.color;
  switch (c.kind) {
    case 'dome':
      (colour ? fixed : (mm: FlowerMesh, g: THREE.BufferGeometry, _c: unknown, h: THREE.Vector3) => tinted(mm, g, H.WHITE, h, 1))(m, new THREE.IcosahedronGeometry(s, far ? 0 : 1).scale(1, 0.7, 1).translate(top.x, top.y + s * 0.3, top.z), colour ?? '', top);
      break;
    case 'woolly':
      fixed(m, new THREE.IcosahedronGeometry(s, far ? 0 : 1).scale(1, 0.75, 1).translate(top.x, top.y + s * 0.3, top.z), colour ?? '#e8e4d2', top);
      break;
    case 'cone':
      fixed(m, new THREE.ConeGeometry(s, s * 2.2, far ? 5 : 8).translate(top.x, top.y + s * 1.1, top.z), colour ?? '#8a9a5a', top);
      break;
    case 'beads':
      for (let i = 0; i < (far ? 3 : 7); i++) {
        const a = (i / 7) * Math.PI * 2;
        fixed(m, new THREE.IcosahedronGeometry(s * 0.28, 0).translate(top.x + Math.cos(a) * s * 0.7, top.y + s * 0.2, top.z + Math.sin(a) * s * 0.7), colour ?? '#e8c43a', top);
      }
      break;
    case 'pins': {
      // A cushion bristling with long curved styles (a pincushion protea).
      const n = far ? 12 : 34;
      const q = new THREE.Quaternion();
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n;
        const phi = Math.acos(1 - t * 0.9);
        const th = i * 2.39996;
        const dir = V(Math.sin(phi) * Math.cos(th), Math.cos(phi), Math.sin(phi) * Math.sin(th));
        const pin = new THREE.ConeGeometry(s * 0.05, s * 1.6, 3).translate(0, s * 0.9, 0);
        q.setFromUnitVectors(UP, dir);
        pin.applyQuaternion(q).translate(top.x, top.y + s * 0.2, top.z);
        (colour ? fixed : (mm: FlowerMesh, g: THREE.BufferGeometry, _c: unknown, h: THREE.Vector3) => tinted(mm, g, H.WHITE, h, 1))(m, pin, colour ?? '', top);
      }
      break;
    }
    default:
  }
}

/** A calla's funnel, an anthurium's glossy heart, or a cobra lily's hood: one sheath round a spadix. */
function spathe(m: FlowerMesh, H: Helpers, top: THREE.Vector3, f: Extract<FlowerSpecies['form'], { kind: 'spathe' }>, rng: () => number) {
  const far = H.isFar();
  const s = f.size * H.HEAD;
  if (f.style === 'funnel') {
    const sheath = new THREE.ConeGeometry(s * 0.62, s * 1.9, far ? 6 : 10, 1, true, 0.4, Math.PI * 1.75).rotateX(Math.PI).translate(top.x, top.y + s * 0.95, top.z);
    tinted(m, sheath, H.WHITE, top);
    fixed(m, new THREE.CylinderGeometry(s * 0.07, s * 0.09, s * 1.1, 5).translate(top.x, top.y + s * 0.6, top.z), f.spadix, top);
  } else if (f.style === 'flat') {
    const heart = new THREE.Shape();
    heart.moveTo(0, -1);
    heart.bezierCurveTo(-0.2, -0.6, -1.1, -0.3, -0.95, 0.35);
    heart.bezierCurveTo(-0.8, 0.95, -0.2, 0.9, 0, 0.45);
    heart.bezierCurveTo(0.2, 0.9, 0.8, 0.95, 0.95, 0.35);
    heart.bezierCurveTo(1.1, -0.3, 0.2, -0.6, 0, -1);
    const g = new THREE.ShapeGeometry(heart, far ? 2 : 6).scale(s * 0.85, s * 0.95, 1).rotateX(-Math.PI / 2 + 0.55).translate(top.x, top.y + s * 0.4, top.z);
    tinted(m, g, H.WHITE, top);
    // The spadix: a curved finger standing from the heart's notch.
    fixed(m, new THREE.ConeGeometry(s * 0.07, s * 1.1, 5).rotateZ(-0.35).translate(top.x + s * 0.18, top.y + s * 0.9, top.z + s * 0.15), f.spadix, top);
  } else {
    // A hood: a leaning half-cone arching over, with a slender spadix and a thread of a tip.
    const hood = new THREE.ConeGeometry(s * 0.5, s * 1.7, far ? 6 : 9, 1, true, 0.5, Math.PI * 1.5).rotateX(Math.PI).rotateZ(0.35).translate(top.x, top.y + s * 0.85, top.z);
    tinted(m, hood, H.WHITE, top);
    fixed(m, new THREE.CylinderGeometry(s * 0.04, s * 0.05, s * 1.4, 4).translate(top.x, top.y + s * 0.7, top.z), f.spadix, top);
    if (!far) fixed(m, new THREE.ConeGeometry(s * 0.04, s * 0.9, 4).rotateZ(0.9).translate(top.x + s * 0.55, top.y + s * 1.6, top.z), f.spadix, top);
  }
  void rng;
}

/** A bird of paradise's crest or a heliconia's ladder of beaks. */
function crane(m: FlowerMesh, H: Helpers, top: THREE.Vector3, f: Extract<FlowerSpecies['form'], { kind: 'crane' }>, rng: () => number) {
  const far = H.isFar();
  const s = f.size * H.HEAD;
  if (f.style === 'bird') {
    // The beak: a green boat edged in red, held out at an angle; the fan of orange sepals and the blue tongue spring from it.
    fixed(m, new THREE.SphereGeometry(1, far ? 5 : 8, far ? 3 : 5).scale(s * 0.55, s * 0.13, s * 0.14).rotateZ(0.3).translate(top.x + s * 0.1, top.y + s * 0.15, top.z), '#5f8a3a', top);
    const az0 = rng() * 6;
    for (let i = 0; i < 3; i++) {
      const az = az0 + (i - 1) * 0.28;
      H.petal(m, top.clone().add(V(0, s * 0.18, 0)), az, 0.5 + Math.abs(i - 1) * 0.12, s * 1.15, s * 0.22, 0.05, 0.1, rng, { pointed: true });
    }
    fixed(m, new THREE.ConeGeometry(s * 0.09, s * 0.85, 4).rotateZ(-1.2).translate(top.x + s * 0.4, top.y + s * 0.25, top.z), '#2f5fb0', top);
    if (!far) fixed(m, new THREE.ConeGeometry(s * 0.08, s * 0.7, 4).rotateZ(-1.3).translate(top.x + s * 0.4, top.y + s * 0.13, top.z + s * 0.12), '#2f5fb0', top);
  } else {
    // A ladder of boat-shaped bracts, each opening to the side, alternating up the stem.
    const n = far ? 3 : 5;
    for (let i = 0; i < n; i++) {
      const y = top.y + i * s * 0.55;
      const side = i % 2 ? 1 : -1;
      const g = new THREE.SphereGeometry(1, far ? 5 : 8, far ? 3 : 5).scale(s * 0.65, s * 0.2, s * 0.24).rotateZ(side * 0.4).translate(top.x + side * s * 0.28, y + s * 0.2, top.z);
      tinted(m, g, H.WHITE, top, 0.6);
      if (!far) fixed(m, new THREE.IcosahedronGeometry(s * 0.1, 0).translate(top.x + side * s * 0.45, y + s * 0.34, top.z), '#e8d84a', top);
    }
  }
}

/** Builds the shapes of the newer kinds (bracts, spathe, crane, bush). Returns the geometry, with `headY` set. */
export function exoticGeometry(sp: FlowerSpecies, m: FlowerMesh, height: number, rng: () => number, H: Helpers): THREE.BufferGeometry {
  const f = sp.form;
  const lean = V((rng() - 0.5) * 0.05, 0, (rng() - 0.5) * 0.05);
  let headY = height;
  if (f.kind === 'bush') {
    const top = bush(m, H, f, height, rng);
    headY = top.y;
  } else if (f.kind === 'bracts' || f.kind === 'spathe' || f.kind === 'crane') {
    const top = H.stem(m, height, lean, rng, false);
    if (f.kind === 'bracts') bractHead(m, H, top, f, rng);
    else if (f.kind === 'spathe') spathe(m, H, top, f, rng);
    else crane(m, H, top, f, rng);
    leafHabit(m, H, f.leaves ?? 'none', Math.max(0.2, height * 0.5), rng);
    headY = top.y;
  }
  const geo = m.build();
  geo.userData.headY = headY;
  void createRng;
  return geo;
}
