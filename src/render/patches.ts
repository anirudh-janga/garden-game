import * as THREE from 'three';

/** Side of a patch of ground, metres. */
export const PATCH = 20;

/**
 * One kind of instanced thing (a flower shape, a stepping stone, a picket…), kept as a mesh per
 * patch of ground rather than one mesh for the whole garden. A patch's mesh is drawn only when
 * some of it is on screen (see `GardenBounds`), so a big garden costs what's in view, not
 * everything that's been built. A patch that fills up simply gets another mesh.
 *
 * `make` builds one empty mesh, with instance buffers of its own (its vertex data can be shared:
 * see `sharedGeometry`). Whatever is stored about an instance must name its mesh as well as its
 * index.
 */
export class Patches {
  /** Every mesh made so far (in use, or spare after a reset). */
  readonly meshes: THREE.InstancedMesh[] = [];
  private readonly open = new Map<number, THREE.InstancedMesh>();
  private spare: THREE.InstancedMesh[] = [];

  constructor(private readonly make: () => THREE.InstancedMesh) {
    // One is made at once (empty, unseen), so its shader is compiled with all the others behind
    // the loading screen rather than when the first one is laid.
    this.spare.push(this.fresh());
  }

  private fresh(): THREE.InstancedMesh {
    const mesh = this.make();
    mesh.count = 0;
    mesh.visible = false;
    this.meshes.push(mesh);
    return mesh;
  }

  /** The mesh the next instance at (x, z) goes into (shown, with room for at least one more). */
  at(x: number, z: number): THREE.InstancedMesh {
    const key = (Math.floor(x / PATCH) + 512) * 1024 + Math.floor(z / PATCH) + 512;
    let mesh = this.open.get(key);
    if (!mesh || mesh.count >= mesh.instanceMatrix.count) {
      mesh = this.spare.pop() ?? this.fresh();
      this.open.set(key, mesh);
    }
    mesh.visible = true;
    return mesh;
  }

  /** Empty every patch (the meshes are kept, for whatever is built next). */
  reset() {
    for (const m of this.meshes) {
      m.count = 0;
      m.visible = false;
    }
    this.open.clear();
    this.spare = [...this.meshes];
  }
}

/**
 * A geometry with the same vertices as `base` (the very same buffers: nothing is copied or sent
 * to the GPU twice), ready to take per-instance attributes of its own. (Never dispose one: the
 * shared buffers would go with it.)
 */
export function sharedGeometry(base: THREE.BufferGeometry): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  for (const [name, a] of Object.entries(base.attributes)) {
    if (!(a as THREE.InstancedBufferAttribute).isInstancedBufferAttribute) g.setAttribute(name, a);
  }
  g.setIndex(base.index);
  for (const group of base.groups) g.addGroup(group.start, group.count, group.materialIndex);
  g.userData = base.userData;
  if (!base.boundingBox) base.computeBoundingBox();
  if (!base.boundingSphere) base.computeBoundingSphere();
  g.boundingBox = base.boundingBox!.clone();
  g.boundingSphere = base.boundingSphere!.clone();
  return g;
}

/**
 * Meshes far from the camera use their simpler geometry (`mesh.userData.lod = { near, far }`):
 * at that distance the fine shape can't be seen. Decided per mesh, by its nearest instance (so a
 * mesh with anything up close stays detailed). A little give either way, so a mesh at the
 * threshold doesn't flicker between the two.
 */
export function swapDetail(meshes: Iterable<THREE.InstancedMesh>, camera: THREE.Vector3, farDistance: number) {
  for (const mesh of meshes) {
    if (mesh.count === 0) continue;
    if (!mesh.boundingSphere) mesh.computeBoundingSphere();
    const b = mesh.boundingSphere!;
    const d = camera.distanceTo(b.center) - b.radius;
    const { near, far } = mesh.userData.lod as { near: THREE.BufferGeometry; far: THREE.BufferGeometry };
    if (mesh.geometry === near && d > farDistance + 2) mesh.geometry = far;
    else if (mesh.geometry === far && d < farDistance - 2) mesh.geometry = near;
  }
}
