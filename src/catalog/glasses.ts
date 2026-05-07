import type { GlassesModel } from '../types/glasses';

export const GLASSES_CATALOG: GlassesModel[] = [
  {
    id: 'aviator',
    sku: 'rayban_aviator_or_vertFlash',
    name: 'Aviator Gold',
    category: 'aviator',
    color: '#D4AF37',
    type: 'jeeliz'
  },
  {
    id: 'round-pink',
    sku: 'rayban_round_cuivre_pinkBrownDegrade',
    name: 'Round Pink',
    category: 'round',
    color: '#E0B0FF',
    type: 'jeeliz'
  },
  {
    id: 'carrera-blue',
    sku: 'carrera_113S_blue',
    name: 'Carrera Blue',
    category: 'aviator',
    color: '#0000FF',
    type: 'jeeliz'
  },
  {
    id: 'round-glasses-local',
    sku: '/demo_vto_round_glasses.glb',
    name: 'Round Local',
    category: 'round',
    color: '#333333',
    type: 'local'
  },
  {
    id: 'glasses-converted-local',
    sku: '/glasses_converted.glb',
    name: 'Converted Local',
    category: 'wayfarer',
    color: '#555555',
    type: 'local'
  }
];
