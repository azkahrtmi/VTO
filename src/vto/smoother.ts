import * as THREE from "three";

export class EMAVector3 {
  private prev: THREE.Vector3 | null = null;
  private alpha: number;

  constructor(alpha = 0.25) {
    this.alpha = alpha;
  }

  update(next: THREE.Vector3): THREE.Vector3 {
    if (!this.prev) {
      this.prev = next.clone();
      return this.prev;
    }
    this.prev.lerp(next, this.alpha);
    return this.prev.clone();
  }
  
  reset() {
    this.prev = null;
  }
}

export class EMAScalar {
  private prev: number | null = null;
  private alpha: number;

  constructor(alpha = 0.25) {
    this.alpha = alpha;
  }

  update(next: number): number {
    if (this.prev === null) {
      this.prev = next;
      return next;
    }
    this.prev = this.prev * (1 - this.alpha) + next * this.alpha;
    return this.prev;
  }

  reset() {
    this.prev = null;
  }
}
