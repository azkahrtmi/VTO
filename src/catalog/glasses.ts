import type { Glasses } from '../types/glasses';

export const GLASSES_CATALOG: Glasses[] = [
  {
    id: 'coba1',
    name: 'Model Coba 1',
    sku: '/coba1.glb',
    color: '#FF5733',
    type: 'local',
    engine: 'mindar'
  },
  {
    id: 'coba2',
    name: 'Model Coba 2',
    sku: '/coba2.glb',
    color: '#33FF57',
    type: 'local',
    engine: 'mindar'
  },
  {
    id: 'coba3',
    name: 'Model Coba 3',
    sku: '/coba3.glb',
    color: '#3357FF',
    type: 'local',
    engine: 'mindar'
  },
  {
    id: 'coba4',
    name: 'Model Optik Tunggal MindAR',
    sku: '/coba4.glb',
    color: '#FF33E9',
    type: 'local',
    engine: 'mindar'
  },
  {
    id: 'coba4-deepar',
    name: 'Optik Tunggal DeepAR',
    sku: '/coba4.glb',
    color: '#8B5CF6',
    type: 'local',
    engine: 'deepar',
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
    engine: 'deepar',
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

