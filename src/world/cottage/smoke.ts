import * as THREE from 'three';
import { createRng, lerp } from '../../core/random';
import type { WindField } from '../../render/wind';

/** Soft chimney smoke. Particles rise, swell, and lean with whatever the wind is doing. */
export class Smoke {
  readonly points: THREE.Points;
  private readonly count = 34;
  private readonly age: Float32Array;
  private readonly life: Float32Array;
  private readonly vel: Float32Array;
  private readonly pos: Float32Array;
  private readonly alpha: Float32Array;
  private readonly size: Float32Array;
  private readonly rng: () => number;
  /** 1 is a usual plume; winter's is thicker. */
  thick = 1;

  constructor(private origin: THREE.Vector3, seed: number) {
    this.rng = createRng(seed);
    const n = this.count;
    this.age = new Float32Array(n);
    this.life = new Float32Array(n);
    this.vel = new Float32Array(n * 3);
    this.pos = new Float32Array(n * 3);
    this.alpha = new Float32Array(n);
    this.size = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      this.respawn(i);
      this.age[i] = this.rng() * this.life[i]; // start mid-plume
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    geo.setAttribute('aAlpha', new THREE.BufferAttribute(this.alpha, 1));
    geo.setAttribute('aSize', new THREE.BufferAttribute(this.size, 1));
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uPixelRatio: { value: 1 }, uColor: { value: new THREE.Color('#efe8e0') } },
      vertexShader: /* glsl */ `
        uniform float uPixelRatio;
        attribute float aAlpha, aSize;
        varying float vAlpha;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = aSize * uPixelRatio * (320.0 / -mv.z);
          vAlpha = aAlpha;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.1, d);
          gl_FragColor = vec4(uColor, a * vAlpha);
        }`,
    });
    this.points = new THREE.Points(geo, mat);
    this.points.frustumCulled = false;
  }

  /** The chimney moved (a new chimney style): smoke now rises from here. */
  moveTo(p: THREE.Vector3) {
    const dx = p.x - this.origin.x;
    const dy = p.y - this.origin.y;
    const dz = p.z - this.origin.z;
    this.origin = p.clone();
    for (let i = 0; i < this.count; i++) {
      this.pos[i * 3] += dx;
      this.pos[i * 3 + 1] += dy;
      this.pos[i * 3 + 2] += dz;
    }
  }

  private respawn(i: number) {
    this.age[i] = 0;
    this.life[i] = lerp(4, 7, this.rng());
    this.pos[i * 3] = this.origin.x + (this.rng() - 0.5) * 0.2;
    this.pos[i * 3 + 1] = this.origin.y;
    this.pos[i * 3 + 2] = this.origin.z + (this.rng() - 0.5) * 0.2;
    this.vel[i * 3] = (this.rng() - 0.5) * 0.1;
    this.vel[i * 3 + 1] = lerp(0.45, 0.7, this.rng());
    this.vel[i * 3 + 2] = (this.rng() - 0.5) * 0.1;
  }

  update(dt: number, wind: WindField) {
    for (let i = 0; i < this.count; i++) {
      this.age[i] += dt;
      if (this.age[i] > this.life[i]) this.respawn(i);
      const k = i * 3;
      const w = wind.sample(this.pos[k], this.pos[k + 2]);
      // Ease toward the local wind; smoke is light, so it follows gusts quickly.
      const push = 0.6 + this.pos[k + 1] * 0.05;
      this.vel[k] += (wind.direction.x * w * 1.6 * push - this.vel[k]) * dt * 0.8;
      this.vel[k + 2] += (wind.direction.y * w * 1.6 * push - this.vel[k + 2]) * dt * 0.8;
      this.vel[k + 1] *= 1 - dt * 0.08;
      this.pos[k] += this.vel[k] * dt;
      this.pos[k + 1] += this.vel[k + 1] * dt;
      this.pos[k + 2] += this.vel[k + 2] * dt;
      const t = this.age[i] / this.life[i];
      this.alpha[i] = Math.min(1, t * 6) * (1 - t) * 0.55 * this.thick;
      this.size[i] = lerp(0.35, 1.6, Math.sqrt(t)) * (0.85 + 0.15 * this.thick);
    }
    const geo = this.points.geometry;
    geo.attributes.position.needsUpdate = true;
    geo.attributes.aAlpha.needsUpdate = true;
    geo.attributes.aSize.needsUpdate = true;
  }

  setPixelRatio(pr: number) {
    (this.points.material as THREE.ShaderMaterial).uniforms.uPixelRatio.value = pr;
  }
}
