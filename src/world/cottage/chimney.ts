import * as THREE from 'three';
import { Kit, tone } from './kit';
import { CHIMNEY } from './plan';
import { stoneCourses } from './walls';

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

/** A stack of stone: its section's three or four outward faces, laid in rough courses. */
function stack(kit: Kit, rng: () => number, far: boolean, s: readonly [number, number, number, number, number, number], withInner: boolean) {
  const [x0, x1, z0, z1, y0, y1] = s;
  const base = { far, v0: y0, v1: y1, depth: 0.16, rowHeight: [0.16, 0.22] as [number, number] };
  stoneCourses(kit, rng, { ...base, origin: V(0, 0, z1), u: V(1, 0, 0), normal: V(0, 0, 1), u0: x0, u1: x1 });
  stoneCourses(kit, rng, { ...base, origin: V(0, 0, z0), u: V(-1, 0, 0), normal: V(0, 0, -1), u0: -x1, u1: -x0 });
  stoneCourses(kit, rng, { ...base, origin: V(x0, 0, 0), u: V(0, 0, 1), normal: V(-1, 0, 0), u0: z0, u1: z1 });
  if (withInner) stoneCourses(kit, rng, { ...base, origin: V(x1, 0, 0), u: V(0, 0, -1), normal: V(1, 0, 0), u0: -z1, u1: -z0 });
}

/** A flat stone slab (a ledge or a cap). */
function slab(kit: Kit, rng: () => number, x0: number, x1: number, z0: number, z1: number, y: number, thick: number, far: boolean) {
  kit.box((x0 + x1) / 2, y + thick / 2, (z0 + z1) / 2, x1 - x0, thick, z1 - z0, tone('#a79d8c', rng, 0.05), (rng() - 0.5) * 0.03, { bottom: !far });
}

/** A clay chimney pot: a short flared cylinder. */
function pot(kit: Kit, rng: () => number, x: number, y: number, z: number, h: number, far: boolean) {
  const sides = far ? 5 : 9;
  const c = tone('#b36a45', rng, 0.06);
  const ring = (r: number, yy: number) => Array.from({ length: sides }, (_, i) => V(x + Math.cos((i / sides) * Math.PI * 2) * r, yy, z + Math.sin((i / sides) * Math.PI * 2) * r));
  const bot = ring(0.1, y);
  const mid = ring(0.085, y + h * 0.6);
  const lip = ring(0.115, y + h);
  const top = ring(0.075, y + h);
  for (let i = 0; i < sides; i++) {
    const j = (i + 1) % sides;
    const out = V(Math.cos(((i + 0.5) / sides) * Math.PI * 2), 0, Math.sin(((i + 0.5) / sides) * Math.PI * 2));
    kit.quad(bot[i], bot[j], mid[j], mid[i], c, out);
    kit.quad(mid[i], mid[j], lip[j], lip[i], c, out);
    kit.quad(lip[i], lip[j], top[j], top[i], c.clone().multiplyScalar(0.7), V(0, 1, 0));
  }
  const centre = V(x, y + h - 0.01, z);
  for (let i = 0; i < sides; i++) kit.tri(top[i], top[(i + 1) % sides], centre, c.clone().multiplyScalar(0.3), V(0, 1, 0));
}

/** The big stone chimney growing out of the left gable. Returns where its smoke leaves. */
export function buildChimney(kit: Kit, rng: () => number, far: boolean): THREE.Vector3 {
  const { base, shoulder, shaft } = CHIMNEY;
  stack(kit, rng, far, base, false);
  slab(kit, rng, base[0] - 0.06, base[1], base[2] - 0.06, base[3] + 0.06, base[5], 0.07, far);
  stack(kit, rng, far, shoulder, false);
  slab(kit, rng, shoulder[0] - 0.05, shoulder[1] + 0.35, shoulder[2] - 0.05, shoulder[3] + 0.05, shoulder[5], 0.07, far);
  stack(kit, rng, far, shaft, true);
  // The cap: two flat stone courses, the upper drawn in.
  slab(kit, rng, shaft[0] - 0.07, shaft[1] + 0.07, shaft[2] - 0.07, shaft[3] + 0.07, CHIMNEY.top, 0.07, far);
  slab(kit, rng, shaft[0] - 0.02, shaft[1] + 0.02, shaft[2] - 0.02, shaft[3] + 0.02, CHIMNEY.top + 0.07, 0.06, far);
  const cx = (shaft[0] + shaft[1]) / 2;
  const y = CHIMNEY.top + 0.13;
  pot(kit, rng, cx, y, -0.12, 0.34, far);
  pot(kit, rng, cx + 0.02, y, 0.14, 0.26, far);
  return V(cx, y + 0.42, -0.12);
}
