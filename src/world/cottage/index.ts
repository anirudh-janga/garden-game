import * as THREE from 'three';
import type { Perch } from '../perchingBirds';
import type { NightLight } from '../nightMagic';
import { createRng, lerp } from '../../core/random';
import type { WindField } from '../../render/wind';
import type { SeasonPalette } from '../season';
import { ChimeSet } from '../chimes';
import { Smoke } from './smoke';
import { Kit } from './kit';
import { buildMainRoof, ridgeY } from './roof';
import { buildDormer, buildPorch, mainRoofHole } from './face';
import type { Season } from '../season';
import { buildChimney } from './chimney';
import { buildWing } from './wing';
import { buildPlinth, buildStoneGable, buildTimberWalls, type Glow } from './walls';
import { COTTAGE_SCALE, EAVE_Y, EAVE_Z, FOOTPRINT, ROOF_X0, ROOF_X1 } from './plan';

/** Beyond this distance (metres from the camera) the cottage is drawn in its far form. */
const FAR_DETAIL = 40;

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

interface Built {
  body: THREE.BufferGeometry;
  glass: THREE.BufferGeometry;
  glow: Glow[];
  smoke: THREE.Vector3;
  triangles: number;
}

/**
 * The cottage: one old, loved storybook house (see docs/cottage-design.md). Built once, at load,
 * as two shapes (in full, and a lighter one for when it is far off): the whole house is one
 * vertex-coloured mesh plus its glass, so it costs a couple of draw calls however much hand-made
 * detail is in it.
 */
export class Cottage {
  readonly group = new THREE.Group();
  private readonly smoke: Smoke;
  private readonly yaw: number;
  private readonly snowy: boolean;
  private chimeSet: ChimeSet | null = null;
  private readonly bodyMat: THREE.MeshLambertMaterial;
  private readonly glassMat: THREE.MeshLambertMaterial;
  private readonly body: THREE.Mesh;
  private readonly glassMesh: THREE.Mesh;
  private readonly near: { body: THREE.BufferGeometry; glass: THREE.BufferGeometry };
  private readonly far: { body: THREE.BufferGeometry; glass: THREE.BufferGeometry };
  /** The windows' light (local position, and which way it spills). */
  private glow: Glow[] = [];
  /** Triangles in the full and the far form (for the numbers in the backlog). */
  readonly triangles: { near: number; far: number };
  /** How long building both forms took, ms. */
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
    const near = this.build(false);
    const far = this.build(true);
    this.buildMs = performance.now() - t0;
    this.glow = near.glow;
    this.triangles = { near: near.triangles, far: far.triangles };
    this.near = { body: near.body, glass: near.glass };
    this.far = { body: far.body, glass: far.glass };
    this.bodyMat = new THREE.MeshLambertMaterial({ vertexColors: true });
    this.glassMat = new THREE.MeshLambertMaterial({ color: '#3a2a1a', emissive: '#ffbf6e', emissiveIntensity: this.snowy ? 2.2 : 1.6 });
    this.body = new THREE.Mesh(near.body, this.bodyMat);
    this.glassMesh = new THREE.Mesh(near.glass, this.glassMat);
    for (const m of [this.body, this.glassMesh]) {
      m.castShadow = true;
      m.receiveShadow = true;
      this.group.add(m);
    }
    this.smoke = new Smoke(new THREE.Vector3(), seed + 3);
    this.group.updateMatrixWorld(true);
    this.smoke.moveTo(this.group.localToWorld(near.smoke.clone()));
    this.hangChimes();
  }

  /** The house as geometry: `far` is the lighter form. */
  private build(far: boolean): Built {
    // (The same seed for both forms: the far house is the same house.)
    const rng = createRng(this.seed);
    const main = new Kit();
    const glass = new Kit();
    const glow: Glow[] = [];
    const kits = { main, glass, far, glow, season: this.season };
    buildPlinth(main, rng, far);
    buildStoneGable(main, rng, far);
    buildTimberWalls(kits, rng);
    buildWing(kits, rng, this.snowy);
    buildMainRoof(main, rng, { far, snowy: this.snowy, skip: (x, u, side) => side === 1 && mainRoofHole(x, u) });
    buildPorch(kits, rng, this.snowy);
    buildDormer(kits, rng, this.snowy);
    const smoke = buildChimney(main, rng, far);
    const body = main.geometry()!;
    const g = glass.geometry()!;
    body.computeBoundingSphere();
    return { body, glass: g, glow, smoke, triangles: main.triangles + glass.triangles };
  }

  /** Wind chimes under the front eave, between the kitchen window and the door. */
  private hangChimes() {
    const x = -1.34;
    const set = new ChimeSet(this.seed + 9, (f, v, at) => this.onChime(f, v, at));
    set.group.position.set(x, EAVE_Y - 0.12, EAVE_Z - 0.18);
    set.group.scale.setScalar(0.9);
    this.group.add(set.group);
    this.chimeSet = set;
  }

  /** Draw the house in its full or its far form, by how far the camera is. */
  updateDetail(camera: THREE.Vector3) {
    const d = camera.distanceTo(this.position);
    const far = this.body.geometry === this.far.body;
    if (!far && d > FAR_DETAIL + 3) this.show(this.far);
    else if (far && d < FAR_DETAIL - 3) this.show(this.near);
  }

  private show(s: { body: THREE.BufferGeometry; glass: THREE.BufferGeometry }) {
    this.body.geometry = s.body;
    this.glassMesh.geometry = s.glass;
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
   * Where climbers grow on this cottage (world points, from the root). None yet: the climbing
   * roses and wisteria are drawn for the new walls in story 11.5.
   */
  vinePaths(): { kind: 'rose' | 'wisteria'; points: THREE.Vector3[]; face: THREE.Vector3; seed: number }[] {
    return [];
  }

  /** Places a bird could sit: along the roof ridge. */
  perches(out: Perch[]) {
    for (let i = 0; i < 6; i++) {
      const x = lerp(ROOF_X0 + 0.6, ROOF_X1 - 0.6, i / 5);
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
    this.chimeSet?.update(dt, wind.direction, wind.sample(this.position.x, this.position.z + 2));
  }

  setPixelRatio(pr: number) {
    this.smoke.setPixelRatio(pr);
  }
}
