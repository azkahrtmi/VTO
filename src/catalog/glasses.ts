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
    deeparEffect: '/coba4.deepar'
  },
  {
    id: 'rayban-deepar',
    name: 'RayBan DeepAR',
    sku: '/rayban.deepar',
    color: '#F59E0B',
    type: 'local',
    engine: 'deepar',
    deeparEffect: '/rayban.deepar'
  }
];
