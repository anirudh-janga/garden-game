import type * as THREE from 'three';

/**
 * A model kept in the scene but never drawn, so its shaders are compiled with all the others
 * behind the loading screen (and stay compiled). Without one, the first bee, bird or bunny to
 * arrive brought its shaders with it, compiled there and then: a hitch in the middle of play.
 */
export function rehearse<T extends THREE.Object3D>(model: T): T {
  model.visible = false;
  return model;
}
