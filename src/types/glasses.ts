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

/**
 * Varian ukuran untuk satu model kacamata (mis. S/M/L atau 52mm/55mm).
 * Jika sebuah Glasses punya lebih dari satu entri di `sizes`, UI akan
 * menampilkan tombol pilihan ukuran. Jika hanya satu (atau tidak ada),
 * ukuran asli model langsung dipakai tanpa pilihan.
 */
export interface GlassesSize {
  /** Identifier unik varian, mis. "52" atau "M" */
  id: string;
  /** Label yang ditampilkan di tombol pilihan, mis. "52mm" atau "Medium" */
  label: string;
  sku?: string;
  deeparEffect?: string;
  lensWidthMm?: number;
  bridgeMm?: number;
  templeMm?: number;
  frameWidthMm?: number;
  nodeMapping?: NodeMapping;
}

export class Glasses {
  id: string = '';
  sku: string = '';
  name: string = '';
  color: string = '';
  type: 'local' = 'local';
  deeparEffect?: string;
  scale?: string;
  position?: string;
  rotation?: string;
  /** Ukuran optik frame dalam mm, contoh marking fisik: 52-17-130 */
  lensWidthMm?: number;
  bridgeMm?: number;
  templeMm?: number;
  /** Lens width + bridge. Dipakai sebagai acuan scale PD jika tersedia. */
  framePdMm?: number;
  /** Lebar total frame hasil ukur/model/data produk, jika tersedia. */
  frameWidthMm?: number;
  /** Acuan PD untuk kalibrasi visual wajah, terpisah dari ukuran fisik frame. */
  pdCalibrationMm?: number;
  /** Node mapping untuk DeepAR — konfigurasi nama node per model */
  nodeMapping?: NodeMapping;
  /** Varian ukuran yang tersedia untuk model ini. Jika >1, UI menampilkan tombol pilihan ukuran. */
  sizes?: GlassesSize[];
}

export const VTO_CHECK = true;
