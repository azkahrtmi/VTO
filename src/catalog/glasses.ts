import type { GlassesModel } from '../types/glasses';

const drawWayfarer = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  h: number,
  angle: number,
  frameColor: string
) => {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  
  const hw = w * 0.5;
  const hh = h * 0.45;
  const gap = w * 0.04;

  ctx.strokeStyle = frameColor;
  ctx.lineWidth = w * 0.028;
  ctx.fillStyle = frameColor + '55'; // 33% opacity tint

  // 1. Gagang (Temple arms) - Draw first
  [-1, 1].forEach(side => {
    ctx.beginPath();
    ctx.moveTo(side * (hw + gap * 0.5), 0);
    ctx.lineTo(side * (hw + gap * 0.5 + w * 0.18), side * h * 0.05);
    ctx.lineWidth = w * 0.018;
    ctx.stroke();
  });

  // 2. Lensa & Frame
  [-1, 1].forEach(side => {
    const lx = side * (hw * 0.5 + gap * 0.5);
    ctx.beginPath();
    // roundRect requires a polyfill or modern browser
    if (ctx.roundRect) {
      ctx.roundRect(lx - hw * 0.5 + 2, -hh + 2, hw - 4, hh * 2 - 4, [6, 6, 8, 4]);
    } else {
      ctx.rect(lx - hw * 0.5 + 2, -hh + 2, hw - 4, hh * 2 - 4);
    }
    ctx.fill();
    ctx.stroke();
  });

  // 3. Nose bridge
  ctx.beginPath();
  ctx.moveTo(-gap * 0.5, 0);
  ctx.lineTo(gap * 0.5, 0);
  ctx.lineWidth = w * 0.018;
  ctx.stroke();

  ctx.restore();
};

const drawRound = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  h: number,
  angle: number,
  frameColor: string
) => {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  
  const r = h * 0.52;
  const gap = w * 0.04;

  ctx.strokeStyle = frameColor;
  ctx.lineWidth = w * 0.022;
  ctx.fillStyle = frameColor + '33';

  // 1. Gagang
  [-1, 1].forEach(side => {
    ctx.beginPath();
    ctx.moveTo(side * (r * 2 + gap * 0.5), 0);
    ctx.lineTo(side * (r * 2 + gap * 0.5 + w * 0.16), 0);
    ctx.stroke();
  });

  // 2. Lensa & Frame
  [-1, 1].forEach(side => {
    const lx = side * (r + gap * 0.5);
    ctx.beginPath();
    ctx.arc(lx, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  // 3. Nose bridge
  ctx.beginPath();
  ctx.moveTo(-gap * 0.5, 0);
  ctx.lineTo(gap * 0.5, 0);
  ctx.lineWidth = w * 0.016;
  ctx.stroke();

  ctx.restore();
};

export const GLASSES_CATALOG: GlassesModel[] = [
  {
    id: 'classic-wayfarer',
    name: 'Classic Wayfarer',
    category: 'wayfarer',
    color: '#1a1a1a',
    modelPath: '/glasses_converted.glb',
    draw: drawWayfarer
  },
  {
    id: 'retro-round',
    name: 'Retro Round',
    category: 'round',
    color: '#1a1a1a',
    modelPath: '/demo_vto_round_glasses.glb',
    draw: drawRound
  }
];

