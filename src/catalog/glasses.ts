import type { Glasses } from '../types/glasses';

export const GLASSES_CATALOG: Glasses[] = [
  {
    id: 'coba4-deepar',
    name: 'Optik Tunggal DeepAR',
    sku: '/coba4.glb',
    color: '#8B5CF6',
    type: 'local',
    deeparEffect: '/coba4.deepar',
    // Node mapping sesuai hierarki model client (coba4.glb)
    // Lihat docs/3d_model_specification.md untuk standar yang benar
    nodeMapping: {
      frame: 'Frame',             
      lensInner: 'LensInner',     
      lensOuter: 'LensOuter',     
      rootNode: 'coba4_fixed.glb',
      baseScale: 100, // Coba4 requires 100x scale in DeepAR
    }
  },
  {
    id: 'rayban-deepar',
    name: 'RayBan DeepAR',
    sku: '/rayban.deepar',
    color: '#F59E0B',
    type: 'local',
    deeparEffect: '/rayban.deepar',
    // Node mapping standar DeepAR (RayBan)
    nodeMapping: {
      frame: 'Plastic',
      lensInner: 'LensesMultiply',
      lensOuter: 'LensesAdd',
      rootNode: 'RayBanLow',
      baseScale: 1, // RayBan is 1x scale
    }
  }
];

