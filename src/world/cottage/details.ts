import * as THREE from 'three';
import { lerp } from '../../core/random';
import { Kit, tone } from './kit';
import { COLOURS, DORMER, PORCH, WING } from './plan';
const DORMER_CX = DORMER.cx;
import type { WallKits } from './walls';

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const C = (hex: string) => new THREE.Color(hex);

const MUSTARD = '#d6a93a';
const STRAW = '#c9b27a';
const ENAMEL = '#7fa58a';
const IRON = COLOURS.iron;

/** A thin iron rod (a bracket, a chain link, a hoop segment). */
function rod(k: Kit, rng: () => number, a: THREE.Vector3, b: THREE.Vector3, t = 0.02) {
  k.timber(rng, a, b, t, t, C(IRON), { far: true });
}

/**
 * The small things of a life lived here (design section 5): a bench with a blanket, boots, a
 * broom, a watering can, milk bottles, a rain barrel, a chopping block with an axe, a basket hung
 * from the porch, a bird house, and at the back a wheelbarrow and a coil of rope. Each is a small
 * readable shape, a little off true, standing where someone would have left it.
 */
export function buildDetails(kits: WallKits, rng: () => number) {
  const k = kits.main;
  const far = kits.far;
  const { cx, postX, postZ, beamY, floorY } = PORCH;
  const oak = () => tone(COLOURS.oak[Math.floor(rng() * 3)], rng, 0.05);
  const jitter = (a: number) => (rng() - 0.5) * a;

  // --- The bench under the kitchen window: a thick oak plank on two log stumps, a blanket at one end.
  const bx = -1.85;
  const bz = 2.12;
  k.box(bx, 0.42, bz, 1.05, 0.06, 0.3, oak(), jitter(0.03));
  for (const sx of [-1, 1]) k.prism(bx + sx * 0.38, 0, bz, 0.1, 0.09, 0.39, far ? 5 : 7, oak(), { yaw: rng() * 3 });
  if (!far) k.box(bx - 0.32, 0.47, bz, 0.3, 0.05, 0.26, C(MUSTARD), jitter(0.2));

  if (far) {
    // Far off only the big things: the barrel and the logs' block read as shapes.
    k.prism(4.3, 0, 1.55, 0.22, 0.2, 0.6, 5, oak());
    return;
  }

  // --- By the door, under the porch: boots (one fallen over), a doormat, a besom broom.
  const boot = (x: number, z: number, fallen: boolean) => {
    const c = tone(MUSTARD, rng, 0.05);
    if (!fallen) {
      k.box(x, floorY + 0.13, z, 0.09, 0.26, 0.09, c);
      k.box(x, floorY + 0.04, z + 0.07, 0.085, 0.08, 0.16, c.clone().multiplyScalar(0.9));
    } else {
      k.box(x, floorY + 0.05, z, 0.26, 0.09, 0.09, c, 0.4);
      k.box(x + 0.15, floorY + 0.04, z + 0.07, 0.16, 0.08, 0.085, c.clone().multiplyScalar(0.9), 0.4);
    }
  };
  boot(cx + 0.38, 2.0, false);
  boot(cx + 0.55, 2.05, true);
  k.box(cx, floorY + 0.008, 2.14, 0.52, 0.016, 0.32, tone(STRAW, rng, 0.06), jitter(0.06));
  // The broom leans in the porch's left corner, bristles down.
  k.timber(rng, V(cx - 0.55, floorY + 0.14, 2.02), V(cx - 0.5, 1.35, 1.86), 0.035, 0.035, oak(), { bow: 0.005 });
  k.box(cx - 0.55, floorY + 0.16, 2.03, 0.15, 0.3, 0.1, tone('#b79a5a', rng, 0.06), jitter(0.1));

  // --- The watering can by the bench (soft green enamel, chipped).
  const wx = -1.2;
  const wz = 2.12;
  k.prism(wx, 0, wz, 0.085, 0.08, 0.17, 8, tone(ENAMEL, rng, 0.04), { top: tone(ENAMEL, rng, 0.04).multiplyScalar(0.7) });
  k.timber(rng, V(wx + 0.07, 0.1, wz), V(wx + 0.22, 0.24, wz), 0.025, 0.025, C(ENAMEL), { far: true });
  k.timber(rng, V(wx - 0.08, 0.05, wz), V(wx - 0.08, 0.2, wz + 0.01), 0.02, 0.02, C(ENAMEL), { far: true });
  k.timber(rng, V(wx - 0.08, 0.2, wz), V(wx + 0.04, 0.2, wz), 0.02, 0.02, C(ENAMEL), { far: true });

  // --- Two milk bottles on the step.
  for (let i = 0; i < 2; i++) {
    const x = cx + 0.55 + i * 0.09;
    k.prism(x, 0.07, 2.92, 0.032, 0.03, 0.17, 6, C('#f3f1ea'), { top: C('#c9ccd0') });
  }

  // --- The lantern on the right porch post: an iron frame round a glowing glass, on a bracket.
  const lx = cx + postX + 0.17;
  const ly = 1.62;
  rod(k, rng, V(cx + postX + 0.07, ly + 0.17, postZ), V(lx, ly + 0.17, postZ), 0.025);
  k.box(lx, ly + 0.15, postZ, 0.16, 0.025, 0.16, C(IRON));
  k.box(lx, ly - 0.14, postZ, 0.16, 0.025, 0.16, C(IRON));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) k.box(lx + sx * 0.07, ly, postZ + sz * 0.07, 0.02, 0.28, 0.02, C(IRON));
  const g = 0.065;
  const glassC = C('#ffffff');
  const q = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, d: THREE.Vector3, out: THREE.Vector3) => kits.glass.quad(a, b, c, d, glassC, out);
  const y0 = ly - 0.13;
  const y1 = ly + 0.14;
  q(V(lx - g, y0, postZ + g), V(lx + g, y0, postZ + g), V(lx + g, y1, postZ + g), V(lx - g, y1, postZ + g), V(0, 0, 1));
  q(V(lx + g, y0, postZ - g), V(lx - g, y0, postZ - g), V(lx - g, y1, postZ - g), V(lx + g, y1, postZ - g), V(0, 0, -1));
  q(V(lx + g, y0, postZ + g), V(lx + g, y0, postZ - g), V(lx + g, y1, postZ - g), V(lx + g, y1, postZ + g), V(1, 0, 0));
  q(V(lx - g, y0, postZ - g), V(lx - g, y0, postZ + g), V(lx - g, y1, postZ + g), V(lx - g, y1, postZ - g), V(-1, 0, 0));
  kits.glow.push({ at: V(lx, ly, postZ + 0.05), out: V(0, 0, 1), size: 0.8 });

  // --- A basket hung from the porch's left brace on two chains (planted in 11.5).
  const hx = cx - postX + 0.12;
  const hy = 1.78;
  for (const dx of [-0.1, 0.1]) rod(k, rng, V(hx + dx * 0.6, beamY - 0.03, postZ - 0.05), V(hx + dx, hy + 0.05, postZ - 0.05), 0.012);
  k.prism(hx, hy - 0.1, postZ - 0.05, 0.07, 0.16, 0.15, 8, tone('#8a6a45', rng, 0.05), { top: tone('#4a3626', rng, 0.04) });

  // --- A bird house under the right gable's peak, on a short bracket, with a perch.
  const gx = WING.x0 + 0.17;
  k.box(gx, 3.95, 0, 0.18, 0.22, 0.17, tone('#a0714a', rng, 0.05));
  k.box(gx, 4.08, 0, 0.26, 0.025, 0.24, C(COLOURS.ridge), 0);
  k.box(gx + 0.095, 3.95, 0, 0.02, 0.06, 0.06, C('#2a2018'));
  k.box(gx + 0.11, 3.89, 0, 0.04, 0.012, 0.014, oak());
  k.box(WING.x0 + 0.04, 3.86, 0, 0.08, 0.025, 0.04, oak());

  // --- The wing's front: a rain barrel (oak staves, two iron hoops, a lid half on) fed by a spout, and a chopping block with an axe in it.
  const rx = WING.x1 - 0.18;
  const rz = WING.z1 + 0.2;
  for (const [r0, r1, y0b, h] of [[0.2, 0.225, 0, 0.3], [0.225, 0.2, 0.3, 0.3]] as const) k.prism(rx, y0b, rz, r0, r1, h, 10, oak(), { yaw: rng() });
  for (const y of [0.1, 0.5]) k.prism(rx, y, rz, 0.226, 0.226, 0.025, 10, C(IRON));
  k.box(rx + 0.06, 0.615, rz, 0.34, 0.025, 0.4, oak(), 0.5);
  k.timber(rng, V(WING.x1 + 0.05, WING.roofLow - 0.04, rz), V(rx + 0.05, 0.64, rz), 0.06, 0.04, oak(), { bow: 0.01 });
  const cbx = 3.35;
  const cbz = WING.z1 + 0.4;
  k.prism(cbx, 0, cbz, 0.17, 0.16, 0.27, 9, tone('#a98b62', rng, 0.05), { top: tone('#c8ad82', rng, 0.05) });
  k.timber(rng, V(cbx, 0.3, cbz), V(cbx + 0.1, 0.78, cbz + 0.06), 0.03, 0.03, oak(), { bow: 0.004 });
  k.box(cbx + 0.02, 0.27, cbz, 0.14, 0.05, 0.03, C(IRON), 0.3);

  // --- The back: a wheelbarrow tipped against the wall and a coil of rope on a peg.
  const wbx = 1.9;
  const wbz = -2.15;
  const tray = tone('#5b7a5e', rng, 0.04);
  k.block([V(wbx - 0.25, 0.3, wbz - 0.1), V(wbx + 0.25, 0.3, wbz - 0.1), V(wbx + 0.2, 0.2, wbz + 0.3), V(wbx - 0.2, 0.2, wbz + 0.3), V(wbx - 0.3, 0.65, wbz - 0.12), V(wbx + 0.3, 0.65, wbz - 0.12), V(wbx + 0.28, 0.5, wbz + 0.38), V(wbx - 0.28, 0.5, wbz + 0.38)], tray);
  k.box(wbx, 0.17, wbz + 0.4, 0.04, 0.34, 0.34, oak());
  for (const sx of [-1, 1]) k.timber(rng, V(wbx + sx * 0.12, 0.25, wbz + 0.28), V(wbx + sx * 0.14, 0.02, wbz + 0.62), 0.035, 0.035, oak(), { bow: 0.005 });
  const peg = V(-0.4, 1.4, -1.86);
  k.box(peg.x, peg.y, peg.z - 0.06, 0.04, 0.04, 0.14, oak());
  const rope = tone('#b79a5a', rng, 0.05);
  for (let i = 0; i < 12; i++) {
    const a0 = (i / 12) * Math.PI * 2;
    const a1 = ((i + 1) / 12) * Math.PI * 2;
    for (const [r0, r1, col] of [[0.1, 0.14, rope], [0.06, 0.1, rope.clone().multiplyScalar(0.85)]] as const) {
      k.quad(V(peg.x + Math.cos(a0) * r0, peg.y + Math.sin(a0) * r0, peg.z - 0.1), V(peg.x + Math.cos(a1) * r0, peg.y + Math.sin(a1) * r0, peg.z - 0.1), V(peg.x + Math.cos(a1) * r1, peg.y + Math.sin(a1) * r1, peg.z - 0.1), V(peg.x + Math.cos(a0) * r1, peg.y + Math.sin(a0) * r1, peg.z - 0.1), col, V(0, 0, -1));
    }
  }

  // --- An apron of five or six irregular flagstones in front of the step.
  let x = cx - 0.95;
  for (let i = 0; i < 6; i++) {
    const w = lerp(0.3, 0.46, rng());
    k.box(x + w / 2, 0.015, 3.38 + jitter(0.14) + (i % 2) * 0.15, w - 0.03, 0.03, lerp(0.3, 0.42, rng()), tone(COLOURS.flag[i % 3], rng, 0.05), jitter(0.12));
    x += w;
  }
}

/**
 * The weather vane at the ridge's right end: an iron arrow with a running hare on it. It turns
 * into the wind with a lazy lag and trembles in gusts. Built as its own small group (it moves).
 */
export class WeatherVane {
  readonly group = new THREE.Group();
  private readonly vane = new THREE.Group();
  private angle = 0;
  private time = 0;

  constructor(
    at: THREE.Vector3,
    private readonly rootYaw: number,
  ) {
    const mat = new THREE.MeshLambertMaterial({ color: IRON, side: THREE.DoubleSide });
    this.group.position.copy(at);
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.016, 0.7, 6), mat);
    mast.position.y = 0.35;
    // The four points of the compass, as a little cross under the vane.
    const cross = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.012, 0.012), mat);
    cross.position.y = 0.38;
    const cross2 = cross.clone();
    cross2.rotation.y = Math.PI / 2;
    this.group.add(mast, cross, cross2);
    // The arrow (its point toward +x) and the hare over it.
    const arrow = new THREE.Shape();
    arrow.moveTo(-0.34, 0.0);
    arrow.lineTo(-0.42, 0.06);
    arrow.lineTo(-0.3, 0.012);
    arrow.lineTo(0.3, 0.012);
    arrow.lineTo(0.3, 0.05);
    arrow.lineTo(0.42, 0.0);
    arrow.lineTo(0.3, -0.05);
    arrow.lineTo(0.3, -0.012);
    arrow.lineTo(-0.3, -0.012);
    arrow.lineTo(-0.42, -0.06);
    arrow.closePath();
    const hare = new THREE.Shape();
    const pts: [number, number][] = [[1.9, 0.45], [1.72, 0.62], [1.5, 0.62], [1.35, 0.95], [1.28, 1.55], [1.18, 1.58], [1.12, 1.0], [1.0, 0.78], [0.78, 0.72], [0.45, 0.68], [0.12, 0.58], [-0.05, 0.45], [-0.2, 0.5], [-0.22, 0.38], [0.0, 0.28], [0.2, 0.12], [0.12, 0.0], [0.45, 0.05], [0.62, 0.3], [0.95, 0.28], [1.15, 0.12], [1.35, 0.1], [1.38, 0.2], [1.2, 0.32], [1.3, 0.45], [1.6, 0.42]];
    pts.forEach(([x, y], i) => (i ? hare.lineTo(x * 0.1 - 0.1, y * 0.1) : hare.moveTo(x * 0.1 - 0.1, y * 0.1)));
    hare.closePath();
    const a = new THREE.Mesh(new THREE.ShapeGeometry(arrow), mat);
    const h = new THREE.Mesh(new THREE.ShapeGeometry(hare), mat);
    h.position.y = 0.012;
    // Shapes are drawn in x/y; stand them so the arrow is flat (x/z) and the hare upright (x/y).
    a.rotation.x = -Math.PI / 2;
    this.vane.add(a, h);
    this.vane.position.y = 0.42;
    this.group.add(this.vane);
    for (const m of [mast, cross, cross2, a, h]) m.castShadow = false;
  }

  /** `windDir`: where the wind is blowing to (x, z); `gust`: how hard (0–1ish). */
  update(dt: number, windDir: THREE.Vector2, gust: number) {
    this.time += dt;
    // The arrow points into the wind: toward where it comes from.
    const target = Math.atan2(windDir.y, -windDir.x) - this.rootYaw;
    let d = target - this.angle;
    d -= Math.round(d / (Math.PI * 2)) * Math.PI * 2;
    this.angle += d * (1 - Math.exp(-dt * 0.8));
    this.vane.rotation.y = this.angle + Math.sin(this.time * 7) * 0.03 * Math.min(1, gust);
  }
}

/** A little irregular blob of colour (a bloom, a berry, a tuft): an octahedron pushed about. */
function blob(k: Kit, rng: () => number, x: number, y: number, z: number, r: number, color: THREE.Color) {
  const j = () => 1 + (rng() - 0.5) * 0.4;
  const p = [V(x + r * j(), y, z), V(x - r * j(), y, z), V(x, y + r * 1.1 * j(), z), V(x, y - r * 0.7 * j(), z), V(x, y, z + r * j()), V(x, y, z - r * j())];
  const c = V(x, y, z);
  const face = (a: number, b: number, d: number) => k.tri(p[a], p[b], p[d], color, V().add(p[a]).add(p[b]).add(p[d]).sub(c.clone().multiplyScalar(3)));
  face(0, 2, 4);
  face(2, 1, 4);
  face(1, 3, 4);
  face(3, 0, 4);
  face(2, 0, 5);
  face(1, 2, 5);
  face(3, 1, 5);
  face(0, 3, 5);
}

/** What grows in the window boxes and the hanging basket, by the season. */
function seasonal(season: WallKits['season']): { colours: string[]; upright: boolean; trailing: boolean; leaf: string } {
  switch (season) {
    case 'spring':
      return { colours: ['#f2d23a', '#fbf8f2', '#6a8fd6', '#f2d23a'], upright: true, trailing: false, leaf: '#5f9a3e' };
    case 'summer':
      return { colours: ['#d9483b', '#f08fb4', '#fbf8f2', '#e86a8a'], upright: false, trailing: true, leaf: '#4f8a38' };
    case 'autumn':
      return { colours: ['#c8622a', '#e0a82a', '#7a3f6a', '#e0a82a'], upright: false, trailing: false, leaf: '#6a7a38' };
    default:
      return { colours: ['#c4402e', '#c4402e', '#3f6a3a', '#3f6a3a'], upright: true, trailing: false, leaf: '#2f5a33' };
  }
}

/**
 * Window boxes on the kitchen, parlour and dormer sills and the hanging basket, planted for the
 * season: bulbs in spring, trailing geraniums and petunias in summer, heather and chrysanthemums
 * in autumn, evergreen sprigs and red berries in winter.
 */
export function buildPlantings(kits: WallKits, rng: () => number) {
  if (kits.far) return;
  const k = kits.main;
  const sea = seasonal(kits.season);
  const wood = tone('#7a5236', rng, 0.04);
  const planted = (cx: number, sillY: number, z: number, width: number) => {
    k.box(cx, sillY - 0.0, z, width, 0.15, 0.2, wood.clone().offsetHSL(0, 0, (rng() - 0.5) * 0.04));
    k.box(cx, sillY + 0.07, z, width - 0.04, 0.02, 0.16, C('#4a3626'));
    const n = Math.round(width * 11);
    for (let i = 0; i < n; i++) {
      const x = cx - width / 2 + 0.06 + (i / (n - 1)) * (width - 0.12) + (rng() - 0.5) * 0.03;
      const zz = z + (rng() - 0.5) * 0.08;
      const col = tone(sea.colours[Math.floor(rng() * sea.colours.length)], rng, 0.05);
      const h = sea.upright ? 0.1 + rng() * 0.12 : 0.04 + rng() * 0.06;
      blob(k, rng, x, sillY + 0.09 + h, zz, 0.032 + rng() * 0.012, col);
      if (sea.upright) k.box(x, sillY + 0.09 + h / 2, zz, 0.008, h, 0.008, C(sea.leaf));
      else blob(k, rng, x + (rng() - 0.5) * 0.03, sillY + 0.09, zz + 0.04, 0.035, tone(sea.leaf, rng, 0.06));
      // Summer's geraniums and petunias spill over the front.
      if (sea.trailing && i % 2 === 0) k.box(x, sillY - 0.04 - rng() * 0.05, z + 0.11, 0.025, 0.14 + rng() * 0.08, 0.012, tone(sea.leaf, rng, 0.06));
    }
  };
  const front = 1.8 + 0.12;
  planted(-1.85, 1.28, front, 0.9);
  planted(1.25, 1.18, front, 1.5);
  planted(DORMER_CX, 3.03, 1.45 + 0.1, 0.72);
  // The hanging basket's planting (the basket itself is in `buildDetails`).
  const { cx, postX, postZ } = PORCH;
  const hx = cx - postX + 0.12;
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const r = 0.07 + rng() * 0.06;
    const col = tone(sea.colours[Math.floor(rng() * sea.colours.length)], rng, 0.05);
    blob(k, rng, hx + Math.cos(a) * r, 1.72 + rng() * 0.05, postZ - 0.05 + Math.sin(a) * r, 0.04 + rng() * 0.015, col);
  }
  if (sea.trailing) for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + rng();
    k.box(hx + Math.cos(a) * 0.16, 1.58 - rng() * 0.05, postZ - 0.05 + Math.sin(a) * 0.16, 0.03, 0.16 + rng() * 0.08, 0.03, tone(sea.leaf, rng, 0.06));
  }
}
