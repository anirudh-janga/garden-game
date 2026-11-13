import * as THREE from 'three';
import type { Perch } from '../perchingBirds';
import type { NightLight } from '../nightMagic';
import { createRng, lerp } from '../../core/random';
import type { WindField } from '../../render/wind';
import type { SeasonPalette } from '../season';
import { ChimeSet } from '../chimes';
import { Smoke } from './smoke';
import { addWet } from '../../render/wet';
import { Kit } from './kit';
import { buildMainRoof, ridgeY, roofPoint } from './roof';
import { buildDormer, buildPorch } from './face';
import { buildDetails, buildPlantings, buildSeasonal, WeatherVane } from './details';
import type { Season } from '../season';
import { buildChimney } from './chimney';
import { buildWing } from './wing';
import { buildPlinth, buildStoneGable, buildTimberWalls, type Glow } from './walls';
import { COTTAGE_SCALE, FOOTPRINT, PORCH, ROOF_X0, ROOF_X1 } from './plan';

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

interface Built {
  body: THREE.BufferGeometry;
  glass: THREE.BufferGeometry;
  glow: Glow[];
  smoke: THREE.Vector3;
  triangles: number;
}

/**
 * The cottage: one old, loved storybook house (see docs/cottage-design.md). Built once, at load:
 * the whole house is one vertex-coloured mesh plus its glass, so it costs a couple of draw calls
 * however much hand-made detail is in it. It is the same shape at every distance and on every
 * screen. (A lighter far-off form was tried: swapping between the two showed as the house changing
 * while pinching, and a tall phone, which stands further back, saw a different house from a tablet.)
 */
export class Cottage {
  readonly group = new THREE.Group();
  private readonly smoke: Smoke;
  private readonly yaw: number;
  private readonly snowy: boolean;
  private chimeSet: ChimeSet | null = null;
  private readonly vane: WeatherVane;
  private readonly bodyMat: THREE.MeshLambertMaterial;
  private readonly glassMat: THREE.MeshLambertMaterial;
  private readonly body: THREE.Mesh;
  private readonly glassMesh: THREE.Mesh;
  /** The windows' light (local position, and which way it spills). */
  private glow: Glow[] = [];
  /** Triangles in the house (for the numbers in the backlog). */
  readonly triangles: number;
  /** How long building it took, ms. */
  readonly buildMs: number;
  /** A chime on the eaves rang (frequency, 0–1 loudness, where). */
  onChime: (freq: number, volume: number, at: THREE.Vector3) => void = () => {};

  constructor(
    readonly position: THREE.Vector3,
    yaw: number,
    palette: SeasonPalette,
    private readonly seed: number,
    private readonly season: Season = 'summer',
  ) {
    this.yaw = yaw;
    this.snowy = !!palette.snowy;
    this.group.position.copy(position);
    this.group.rotation.y = yaw;
    this.group.scale.setScalar(COTTAGE_SCALE);
    const t0 = performance.now();
    const near = this.build();
    this.buildMs = performance.now() - t0;
    this.glow = near.glow;
    this.triangles = near.triangles;
    this.bodyMat = new THREE.MeshLambertMaterial({ vertexColors: true });
    addWet(this.bodyMat, 0.8); // roof and stone darken and take a sheen in the rain
    this.glassMat = new THREE.MeshLambertMaterial({ color: '#3a2a1a', emissive: '#ffbf6e', emissiveIntensity: this.snowy ? 2.2 : 1.6 });
    this.body = new THREE.Mesh(near.body, this.bodyMat);
    this.glassMesh = new THREE.Mesh(near.glass, this.glassMat);
    for (const m of [this.body, this.glassMesh]) {
      m.castShadow = true;
      m.receiveShadow = true;
      this.group.add(m);
    }
    this.smoke = new Smoke(new THREE.Vector3(), seed + 3);
    this.smoke.thick = this.snowy ? 1.5 : 1; // winter's chimney smokes harder
    this.group.updateMatrixWorld(true);
    this.smoke.moveTo(this.group.localToWorld(near.smoke.clone()));
    this.hangChimes();
    // The weather vane, at the ridge's right end.
    const vx = ROOF_X1 - 0.5;
    this.vane = new WeatherVane(V(vx, ridgeY(vx) + 0.08, 0), yaw);
    this.group.add(this.vane.group);
  }

  /** The house as geometry. */
  private build(): Built {
    // (The builders can also make a lighter form, `far`: not used, see above.)
    const far = false;
    const rng = createRng(this.seed);
    const main = new Kit();
    const glass = new Kit();
    const glow: Glow[] = [];
    const kits = { main, glass, far, glow, season: this.season };
    buildPlinth(main, rng, far);
    buildStoneGable(main, rng, far);
    buildTimberWalls(kits, rng);
    buildWing(kits, rng, this.snowy);
    buildMainRoof(main, rng, { far, snowy: this.snowy });
    buildPorch(kits, rng, this.snowy);
    buildDormer(kits, rng, this.snowy);
    buildDetails(kits, rng);
    buildPlantings(kits, rng);
    buildSeasonal(kits, rng);
    const smoke = buildChimney(main, rng, far);
    const body = main.geometry()!;
    const g = glass.geometry()!;
    body.computeBoundingSphere();
    return { body, glass: g, glow, smoke, triangles: main.triangles + glass.triangles };
  }

  /** Wind chimes hung from the porch's front beam. */
  private hangChimes() {
    const set = new ChimeSet(this.seed + 9, (f, v, at) => this.onChime(f, v, at));
    set.group.position.set(PORCH.cx - 0.3, PORCH.beamY - 0.05, PORCH.postZ - 0.04);
    set.group.scale.setScalar(0.9);
    this.group.add(set.group);
    this.chimeSet = set;
  }

  /** After dark the windows burn brighter. */
  setNight(n: number) {
    this.glassMat.emissiveIntensity = (this.snowy ? 2.2 : 1.6) * (1 + n * 0.9);
  }

  /** Where the cottage's light falls after dark: a pool on the grass outside each window. */
  nightLights(out: NightLight[]) {
    for (const s of this.glow) {
      const pos = this.group.localToWorld(s.at.clone().addScaledVector(s.out, 0.15));
      const ground = s.at.clone().addScaledVector(s.out, 1.1);
      ground.y = 0;
      out.push({ pos, pool: this.group.localToWorld(ground), radius: 1.6 * s.size });
    }
  }

  /** Ground point just in front of the doorstep, where garden paths should arrive. */
  get doorstep(): THREE.Vector2 {
    const p = this.group.localToWorld(new THREE.Vector3(-0.7, 0, 3.0));
    return new THREE.Vector2(p.x, p.z);
  }

  get smokePoints(): THREE.Points {
    return this.smoke.points;
  }

  /** The camera turn (azimuth) that looks at the front of the cottage head on. */
  get frontAzimuth(): number {
    return this.yaw;
  }

  /**
   * Where climbers grow on this cottage (world points, from the root): a blush climbing rose up the
   * porch posts and over its gable, wisteria up the front right corner and along the right-hand
   * rake of the roof (an arm along the eave would hang its flowers over the windows), and ivy over
   * the chimney and the lower left gable.
   */
  vinePaths(): { kind: 'rose' | 'wisteria' | 'ivy'; points: THREE.Vector3[]; face: THREE.Vector3; seed: number }[] {
    const turn = new THREE.Vector3(0, 1, 0);
    const world = (pts: [number, number, number][]) => pts.map(([x, y, z]) => V(x, y, z).multiplyScalar(COTTAGE_SCALE).applyAxisAngle(turn, this.yaw).add(this.position));
    const facing = (x: number, y: number, z: number) => V(x, y, z).applyAxisAngle(turn, this.yaw);
    const { cx, postX } = PORCH;
    const rake: [number, number, number][] = [];
    for (let i = 1; i <= 10; i++) {
      const p = roofPoint(ROOF_X1, i / 10, 1);
      rake.push([p.x + 0.12, p.y + 0.02, p.z + 0.1]);
    }
    return [
      {
        kind: 'rose',
        face: facing(0, 0, 1),
        seed: this.seed + 101,
        points: world([[cx - postX, 0.3, 2.7], [cx - postX, 1.0, 2.7], [cx - postX, 1.8, 2.7], [cx - postX + 0.07, 2.3, 2.82], [cx - 0.35, 2.58, 2.86], [cx, 2.94, 2.86], [cx + 0.35, 2.58, 2.86], [cx + postX - 0.07, 2.3, 2.82], [cx + postX, 1.95, 2.7]]),
      },
      {
        kind: 'wisteria',
        face: facing(1, 0, 0.3),
        seed: this.seed + 111,
        points: world([[2.62, 0.3, 1.98], [2.75, 1.2, 2.04], [2.92, 1.9, 2.1], [2.98, 2.15, 2.15], ...rake]),
      },
      { kind: 'ivy', face: facing(-1, 0, 0), seed: this.seed + 121, points: world([[-2.78, 0.3, 1.4], [-2.78, 1.2, 1.36], [-2.78, 2.2, 1.46]]) },
      { kind: 'ivy', face: facing(-1, 0, 0), seed: this.seed + 122, points: world([[-2.78, 0.3, -1.35], [-2.78, 1.3, -1.4], [-2.78, 2.1, -1.3]]) },
      { kind: 'ivy', face: facing(0, 0, 1), seed: this.seed + 123, points: world([[-3.0, 0.2, 0.8], [-2.95, 1.5, 0.8], [-3.0, 2.6, 0.82], [-2.8, 3.4, 0.45]]) },
      { kind: 'ivy', face: facing(-1, 0, 0), seed: this.seed + 124, points: world([[-3.3, 0.2, 0.25], [-3.3, 1.5, 0.1], [-3.3, 2.7, 0.2]]) },
    ];
  }

  /** Places a bird could sit: along the roof ridge. */
  perches(out: Perch[]) {
    // The weather vane's mast (the top of its cross).
    out.push({ pos: this.group.localToWorld(V(ROOF_X1 - 0.5, ridgeY(ROOF_X1 - 0.5) + 0.8, 0)), yaw: this.yaw, alive: () => true });
    for (let i = 0; i < 5; i++) {
      const x = lerp(ROOF_X0 + 0.6, ROOF_X1 - 1.1, i / 4);
      const pos = this.group.localToWorld(V(x, ridgeY(x) + 0.12, 0));
      out.push({ pos, yaw: this.yaw, alive: () => true });
    }
  }

  /** True if (x, z) is within the cottage's footprint (walls, chimney, wing, doorstep) plus `margin`. */
  contains(x: number, z: number, margin = 0): boolean {
    const dx = x - this.position.x;
    const dz = z - this.position.z;
    const c = Math.cos(-this.yaw);
    const s = Math.sin(-this.yaw);
    const lx = (dx * c + dz * s) / COTTAGE_SCALE;
    const lz = (-dx * s + dz * c) / COTTAGE_SCALE;
    const m = margin / COTTAGE_SCALE;
    for (const [x0, x1, z0, z1] of FOOTPRINT) if (lx > x0 - m && lx < x1 + m && lz > z0 - m && lz < z1 + m) return true;
    return false;
  }

  update(dt: number, wind: WindField) {
    this.smoke.update(dt, wind);
    this.vane.update(dt, wind.direction, wind.sample(this.position.x, this.position.z));
    this.chimeSet?.update(dt, wind.direction, wind.sample(this.position.x, this.position.z + 2));
  }

  setPixelRatio(pr: number) {
    this.smoke.setPixelRatio(pr);
  }
}
