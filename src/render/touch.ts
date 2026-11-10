import * as THREE from 'three';

/**
 * Mark one item of a buffer attribute (an instance's matrix, colour, …) as changed, so only that
 * slice is sent to the GPU rather than the whole buffer. Re-uploading a few-thousand-instance
 * buffer every frame because one stone moved was the single biggest cost on the phone.
 * (Only works if every change to the attribute goes through here: a plain `needsUpdate` with no
 * ranges uploads everything.)
 */
export function touch(attr: THREE.BufferAttribute, index: number) {
  attr.addUpdateRange(index * attr.itemSize, attr.itemSize);
  attr.needsUpdate = true;
}

/**
 * Give an instanced mesh its per-instance colours from the start (all white: no tint). Left to
 * the first `setColorAt`, the colours arrive with the first stone or post, and the mesh then needs
 * a different shader, compiled there and then: a hitch on the first touch of each tool.
 */
export function tintable<T extends THREE.InstancedMesh>(mesh: T): T {
  if (!mesh.instanceColor) mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(mesh.instanceMatrix.count * 3).fill(1), 3);
  return mesh;
}
