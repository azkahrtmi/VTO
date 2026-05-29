/** 
 * VTO Glasses Type Definition 
 * Menggunakan class agar modul tidak kosong saat dikompilasi ke JS
 */

/**
 * Mapping nama node 3D model untuk DeepAR API (changeParameterVector).
 * Setiap model bisa punya nama node yang berbeda, jadi kita mapping di sini
 * agar kode tidak hardcode ke nama tertentu (misal: "Plastic" dari RayBan).
 * 
 * Lihat docs/3d_model_specification.md untuk standar naming.
 */
export interface NodeMapping {
  /** Nama node gagang/frame — untuk ubah warna frame */
  frame: string;
  /** Nama node lensa dalam (multiply blend) — untuk ubah warna lensa */
  lensInner: string;
  /** Nama node lensa luar (additive blend) — untuk ubah warna lensa */
  lensOuter: string;
  /** Nama root node — untuk scale/PD adjustment */
  rootNode: string;
  baseScale?: number; // Optional base scale (e.g. 100 for imported models)
}

/** Default node mapping (mengikuti standar RayBan DeepAR) */
export const DEFAULT_NODE_MAPPING: NodeMapping = {
  frame: 'Frame',
  lensInner: 'LensInner',
  lensOuter: 'LensOuter',
  rootNode: 'GlassesRoot',
  baseScale: 1
};

export class Glasses {
  id: string = '';
  sku: string = '';
  name: string = '';
  color: string = '';
  type: 'jeeliz' | 'local' = 'local';
  engine: 'mindar' | 'deepar' = 'mindar';
  deeparEffect?: string;
  scale?: string;
  position?: string;
  rotation?: string;
  /** Node mapping untuk DeepAR — konfigurasi nama node per model */
  nodeMapping?: NodeMapping;
}

export const VTO_CHECK = true;
