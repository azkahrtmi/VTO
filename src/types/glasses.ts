export interface GlassesModel {
  id: string;
  name: string;
  category: 'wayfarer' | 'round' | 'aviator' | 'cat-eye';
  color: string;
  modelPath?: string;
  draw?: (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    w: number,
    h: number,
    angle: number,
    frameColor: string
  ) => void;
}


export {};
