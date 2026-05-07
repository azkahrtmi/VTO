class LowPassFilter {
  private s: number | null = null;

  constructor(_alpha: number) {
    // alpha is handled in filterWithAlpha
  }


  hasLastValue(): boolean {
    return this.s !== null;
  }

  lastValue(): number {
    return this.s!;
  }

  filterWithAlpha(value: number, alpha: number): number {
    if (this.s === null) {
      this.s = value;
    } else {
      this.s = alpha * value + (1.0 - alpha) * this.s;
    }
    return this.s;
  }
}

export class OneEuroFilter {
  private freq: number;
  private mincutoff: number;
  private beta: number;
  private dcutoff: number;
  private x: LowPassFilter;
  private dx: LowPassFilter;
  private lasttime: number;

  constructor(freq = 120, mincutoff = 1.0, beta = 0.007, dcutoff = 1.0) {
    this.freq = freq;
    this.mincutoff = mincutoff;
    this.beta = beta;
    this.dcutoff = dcutoff;
    this.x = new LowPassFilter(this.alpha(mincutoff));
    this.dx = new LowPassFilter(this.alpha(dcutoff));
    this.lasttime = -1;
  }

  private alpha(cutoff: number): number {
    const te = 1.0 / this.freq;
    const tau = 1.0 / (2 * Math.PI * cutoff);
    return 1.0 / (1.0 + tau / te);
  }

  filter(x: number, timestamp?: number): number {
    if (this.lasttime !== -1 && timestamp !== undefined) {
      this.freq = 1.0 / (timestamp - this.lasttime);
    }
    this.lasttime = timestamp ?? this.lasttime;

    const prevX = this.x.hasLastValue() ? this.x.lastValue() : x;
    const dx = (x - prevX) * this.freq;
    const edx = this.dx.filterWithAlpha(dx, this.alpha(this.dcutoff));
    const cutoff = this.mincutoff + this.beta * Math.abs(edx);
    return this.x.filterWithAlpha(x, this.alpha(cutoff));
  }
}
